/* ===== TypeCraft Game System ===== */

/* ===== XP & Leveling ===== */

function calculateXpGain(stats, handicap) {
    let xp = 0;

    // Base XP from blocks mined
    xp += stats.blocksMined * 2;

    // Accuracy bonus
    if (stats.accuracy >= 95) xp += 50;
    else if (stats.accuracy >= 90) xp += 30;
    else if (stats.accuracy >= 85) xp += 15;

    // Speed bonus
    if (stats.wpm >= 50) xp += 60;
    else if (stats.wpm >= 40) xp += 40;
    else if (stats.wpm >= 30) xp += 25;
    else if (stats.wpm >= 20) xp += 15;
    else if (stats.wpm >= 10) xp += 5;

    // Perfect score bonus
    if (stats.accuracy === 100) xp += 25;

    // Apply handicap multiplier
    xp = Math.round(xp * handicap);

    return xp;
}

function calculateLevel(totalXp) {
    // Each level requires progressively more XP
    let level = 1;
    let xpNeeded = 100;
    let xpAccum = 0;

    while (xpAccum + xpNeeded <= totalXp) {
        xpAccum += xpNeeded;
        level++;
        xpNeeded = Math.round(100 * Math.pow(1.2, level - 1));
    }

    return {
        level,
        currentXp: totalXp - xpAccum,
        xpToNext: xpNeeded,
        totalXp
    };
}

/* ===== Resource & Crafting ===== */

function canCraft(recipe, resources) {
    for (const [res, amount] of Object.entries(recipe.cost)) {
        if ((resources[res] || 0) < amount) return false;
    }
    return true;
}

async function craftItem(playerId, recipeId) {
    const player = await getPlayer(playerId);
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe || !canCraft(recipe, player.resources)) return false;

    // Deduct resources
    for (const [res, amount] of Object.entries(recipe.cost)) {
        player.resources[res] -= amount;
    }

    // Add item to inventory
    player.inventory.push({
        id: recipe.id,
        name: recipe.name,
        icon: recipe.icon,
        craftedAt: new Date().toISOString()
    });

    // Add XP
    player.xp += recipe.xp;
    const levelInfo = calculateLevel(player.xp);
    player.level = levelInfo.level;
    player.xpToNext = levelInfo.xpToNext;

    await savePlayer(player);

    // Check achievements
    if (!player.achievements.includes('craftsman')) {
        await unlockAchievement(playerId, 'craftsman');
    }

    return true;
}

/* ===== Achievements ===== */

async function checkAchievements(playerId, stats) {
    const player = await getPlayer(playerId);
    const newAchievements = [];

    const checks = [
        { id: 'eerste_les', cond: player.totalSessions >= 1 },
        { id: 'homerow_held', cond: stats.accuracy === 100 && player.currentBiome === 0 },
        { id: 'snelheidsduivel', cond: stats.wpm >= 30 },
        { id: 'perfectionist', cond: stats.accuracy === 100 },
        { id: 'streak_3', cond: player.streak >= 3 },
        { id: 'streak_7', cond: player.streak >= 7 },
        { id: 'streak_30', cond: player.streak >= 30 },
        { id: 'blokkenmaker', cond: player.totalBlocks >= 500 },
        { id: 'mob_slayer', cond: stats.mobDamageDealt > 0 },
        { id: 'forest_explorer', cond: player.currentBiome >= 1 },
        { id: 'desert_wanderer', cond: player.currentBiome >= 2 },
        { id: 'nether_survivor', cond: player.currentBiome >= 3 },
        { id: 'ender_champion', cond: player.currentBiome >= 4 },
        { id: 'diamant_miner', cond: (player.resources.diamant || 0) > 0 },
        { id: 'wpm_50', cond: stats.wpm >= 50 }
    ];

    for (const check of checks) {
        if (check.cond && !player.achievements.includes(check.id)) {
            player.achievements.push(check.id);
            newAchievements.push(ACHIEVEMENTS.find(a => a.id === check.id));
        }
    }

    if (newAchievements.length > 0) {
        await savePlayer(player);
    }

    return newAchievements;
}

async function unlockAchievement(playerId, achievementId) {
    const player = await getPlayer(playerId);
    if (!player.achievements.includes(achievementId)) {
        player.achievements.push(achievementId);
        await savePlayer(player);
        const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (ach) showToast(`${ach.icon} ${ach.name} ontgrendeld!`);
    }
}

/* ===== Streak System ===== */

function updateStreak(player) {
    const today = getToday();

    if (player.lastPracticeDate === today) {
        // Already practiced today
        return player.streak;
    }

    if (player.lastPracticeDate) {
        const days = daysBetween(player.lastPracticeDate, today);
        if (days === 1) {
            // Consecutive day
            player.streak++;
        } else if (days > 2) {
            // Streak broken (allowing 1 freeze day)
            player.streak = 1;
        } else {
            // 2 days = 1 day gap (streak freeze)
            player.streak++;
        }
    } else {
        player.streak = 1;
    }

    player.lastPracticeDate = today;
    return player.streak;
}

/* ===== Biome Progression ===== */

function checkBiomeUnlock(player) {
    const nextBiome = player.currentBiome + 1;
    if (nextBiome >= BIOMES.length) return false;

    const req = BIOMES[nextBiome];
    return player.bestWpm >= req.minWpm && player.bestAccuracy >= req.minAccuracy;
}

/* ===== Family Features ===== */

async function checkFamilyStreak() {
    const today = getToday();
    const players = await getAllPlayers();
    const allPracticedToday = players.length === 3 &&
        players.every(p => p.lastPracticeDate === today);
    return allPracticedToday;
}

async function getFamilyScores() {
    const players = await getAllPlayers();
    const scores = [];

    for (const player of players) {
        const sessions = await getPlayerSessions(player.id);
        const recent = sessions.filter(s => {
            const d = daysBetween(s.date, getToday());
            return d <= 7;
        });

        const weekWpm = recent.length > 0
            ? Math.round(recent.reduce((sum, s) => sum + s.wpm, 0) / recent.length)
            : 0;

        const prevWeek = sessions.filter(s => {
            const d = daysBetween(s.date, getToday());
            return d > 7 && d <= 14;
        });

        const prevWpm = prevWeek.length > 0
            ? Math.round(prevWeek.reduce((sum, s) => sum + s.wpm, 0) / prevWeek.length)
            : 0;

        const improvement = weekWpm - prevWpm;
        const handicap = PLAYERS[player.id]?.handicap || 1;

        scores.push({
            id: player.id,
            name: player.name,
            weekWpm,
            improvement,
            handicapScore: Math.round(improvement * handicap),
            streak: player.streak,
            level: player.level,
            totalBlocks: player.totalBlocks
        });
    }

    // Sort by handicap-adjusted improvement
    scores.sort((a, b) => b.handicapScore - a.handicapScore);
    return scores;
}

/* ===== Shared Building Project ===== */

async function getSharedBuildProgress() {
    const players = await getAllPlayers();
    const totalBlocks = players.reduce((sum, p) => sum + p.totalBlocks, 0);
    const buildSize = 16 * 8; // 128 blocks for a full build
    const progress = Math.min(totalBlocks, buildSize * 10); // 10 builds total

    return {
        totalBlocks,
        currentBuild: Math.floor(totalBlocks / buildSize),
        buildProgress: (totalBlocks % buildSize) / buildSize,
        filledCells: Math.min(Math.floor((totalBlocks % buildSize) / 1), buildSize),
        contributions: players.map(p => ({
            name: p.name,
            blocks: p.totalBlocks,
            percentage: totalBlocks > 0 ? Math.round((p.totalBlocks / totalBlocks) * 100) : 0
        }))
    };
}

/* ===== Block Particle Effects ===== */

function spawnBlockParticle(x, y, resource) {
    const particle = document.createElement('div');
    particle.className = 'block-particle';
    const icon = RESOURCES[resource]?.icon || '🟫';
    particle.textContent = icon;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
}

/* ===== Toast System ===== */

let toastTimeout = null;

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
