/* ===== TypeCraft Main Application ===== */

let currentPlayer = null;
let currentLesson = null;
let lessonUpdateInterval = null;
let currentMob = null;

/* ===== Screen Navigation ===== */

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    // Cleanup when leaving lesson
    if (screenId !== 'screen-lesson') {
        stopLessonUpdates();
    }
}

/* ===== Profile Selection ===== */

async function selectProfile(playerId) {
    currentPlayer = await initPlayerData(playerId);
    updateMenuScreen();
    showScreen('screen-menu');
}

function updateMenuScreen() {
    if (!currentPlayer) return;

    document.getElementById('menu-player-name').textContent = currentPlayer.name;
    document.getElementById('menu-player-level').textContent = `Level ${currentPlayer.level}`;

    const biome = BIOMES[currentPlayer.currentBiome] || BIOMES[0];
    const biomeTitle = document.getElementById('biome-title');
    biomeTitle.textContent = biome.name;
    biomeTitle.style.color = biome.color;

    const lessonSet = LESSON_SETS[currentPlayer.currentBiome];
    const totalLessons = lessonSet ? lessonSet.lessons.length : 0;
    document.getElementById('biome-progress').textContent =
        `Les ${currentPlayer.currentLesson + 1} van ${totalLessons}`;

    document.getElementById('menu-wpm').textContent = currentPlayer.bestWpm;
    document.getElementById('menu-accuracy').textContent = currentPlayer.bestAccuracy + '%';
    document.getElementById('menu-streak').textContent = currentPlayer.streak;
    document.getElementById('menu-xp').textContent = currentPlayer.xp;

    // XP bar
    const levelInfo = calculateLevel(currentPlayer.xp);
    document.getElementById('menu-xp-current').textContent = levelInfo.currentXp;
    document.getElementById('menu-xp-next').textContent = levelInfo.xpToNext;
    const xpPct = Math.round((levelInfo.currentXp / levelInfo.xpToNext) * 100);
    document.getElementById('menu-xp-fill').style.width = xpPct + '%';

    // Journey map
    renderJourneyMap(currentPlayer);
}

function renderJourneyMap(player) {
    const container = document.getElementById('journey-map');
    const totalAllLessons = getTotalLessons();

    // Calculate completed lessons across all biomes
    let completedLessons = 0;
    for (let b = 0; b < player.currentBiome; b++) {
        completedLessons += LESSON_SETS[b].lessons.length;
    }
    completedLessons += player.currentLesson;

    const overallPct = Math.round((completedLessons / totalAllLessons) * 100);

    const biomeIcons = ['🌿', '🌲', '🏜️', '🔥', '🐉'];
    const biomeTargetWpm = [15, 25, 35, 45, 60];
    const playerAge = player.age;
    const targetWpm = playerAge <= 8 ? 30 : playerAge <= 11 ? 45 : 60;

    let html = '';
    html += `<div class="journey-title">Reis naar Blind Typen</div>`;
    html += `<div class="journey-overall">`;
    html += `<div class="journey-overall-pct">${overallPct}%</div>`;
    html += `<div class="journey-overall-label">Les ${completedLessons} van ${totalAllLessons} voltooid</div>`;
    html += `</div>`;

    // Biome track
    html += `<div class="journey-track">`;
    for (let i = 0; i < BIOMES.length; i++) {
        const b = BIOMES[i];
        const isCompleted = i < player.currentBiome;
        const isCurrent = i === player.currentBiome;
        const isLocked = i > player.currentBiome;
        const stateClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';

        html += `<div class="journey-biome">`;
        html += `<div class="journey-node ${stateClass}" style="background:${isLocked ? '#222' : b.color + '33'}">${biomeIcons[i]}</div>`;
        html += `<div class="journey-biome-name ${stateClass}">${b.name}</div>`;

        // Lesson dots for current biome
        if (isCurrent) {
            const lessons = LESSON_SETS[i].lessons;
            html += `<div class="journey-lesson-dots">`;
            for (let l = 0; l < lessons.length; l++) {
                const dotClass = l < player.currentLesson ? 'done' : l === player.currentLesson ? 'current' : '';
                html += `<div class="journey-dot ${dotClass}"></div>`;
            }
            html += `</div>`;
        }

        html += `</div>`;

        // Connector between biomes
        if (i < BIOMES.length - 1) {
            const connClass = isCompleted ? 'completed' : isCurrent ? 'active' : '';
            html += `<div class="journey-connector ${connClass}"></div>`;
        }
    }
    html += `</div>`;

    // End goal
    html += `<div class="journey-goal">`;
    html += `<div class="journey-goal-text">🏆 Einddoel: Blind typen met ${targetWpm}+ WPM</div>`;
    html += `<div class="journey-goal-sub">Nu: ${player.bestWpm} WPM → Nog ${Math.max(0, targetWpm - player.bestWpm)} WPM te gaan</div>`;
    html += `</div>`;

    container.innerHTML = html;
}

/* ===== Start Lesson ===== */

async function startLesson() {
    if (!currentPlayer) return;

    const lesson = getLessonContent(currentPlayer.currentBiome, currentPlayer.currentLesson);
    if (!lesson) {
        // Check if can progress to next biome
        if (checkBiomeUnlock(currentPlayer)) {
            currentPlayer.currentBiome++;
            currentPlayer.currentLesson = 0;
            await savePlayer(currentPlayer);
            showToast(`🌍 Nieuw biome ontgrendeld: ${BIOMES[currentPlayer.currentBiome].name}!`);
            updateMenuScreen();
            return startLesson();
        }
        showToast('Alle lessen in dit biome voltooid! Verbeter je scores om verder te gaan.');
        return;
    }

    currentLesson = lesson;

    // Generate text
    const text = generateLessonText(lesson, currentPlayer.age);
    if (!text) {
        showToast('Geen lesinhoud beschikbaar.');
        return;
    }

    // Setup engine
    createEngine(text);

    // Setup UI
    document.getElementById('lesson-title').textContent = lesson.title;
    const biomeBadge = document.getElementById('lesson-biome-badge');
    const biome = BIOMES[currentPlayer.currentBiome];
    biomeBadge.textContent = biome.name;
    biomeBadge.className = `biome-badge ${biome.id}`;

    // Render text display
    renderTextDisplay(text);

    // Render keyboard
    renderKeyboard('keyboard-visual');

    // Setup mob if applicable
    currentMob = lesson.mob || null;
    renderMob();

    // Show lesson screen
    showScreen('screen-lesson');

    // Focus hidden input
    const input = document.getElementById('typing-input');
    input.value = '';
    input.focus();

    // Highlight first key
    if (text.length > 0) {
        highlightKey(text[0]);
    }

    // Start live stats updates
    startLessonUpdates();
}

function renderTextDisplay(text) {
    const display = document.getElementById('text-display');
    display.innerHTML = '';

    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = `char ${i === 0 ? 'current' : 'pending'}`;
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.dataset.index = i;
        display.appendChild(span);
    });
}

function updateTextDisplay(pos, isCorrect) {
    const chars = document.querySelectorAll('#text-display .char');

    // Update previous character
    if (pos > 0) {
        const prev = chars[pos - 1];
        if (prev) {
            prev.classList.remove('current', 'pending');
            prev.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }

    // Highlight current character
    chars.forEach((c, i) => {
        if (i === pos) {
            c.classList.remove('pending');
            c.classList.add('current');
        }
    });

    // Scroll text display to keep current char visible
    if (pos < chars.length) {
        chars[pos].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

/* ===== Mob Battle ===== */

function renderMob() {
    const area = document.getElementById('mob-area');
    if (!currentMob) {
        area.innerHTML = '';
        return;
    }

    area.innerHTML = `
        <div class="mob-display">
            <div class="mob-sprite">${currentMob.icon}</div>
            <div class="mob-health-bar">
                <div class="mob-health-fill" id="mob-health" style="width:100%"></div>
            </div>
            <div class="mob-name">${currentMob.name} - ${currentMob.hp} HP</div>
        </div>
    `;
}

function updateMobHealth(damageDealt) {
    if (!currentMob) return;
    const healthBar = document.getElementById('mob-health');
    if (!healthBar) return;

    const remaining = Math.max(0, currentMob.hp - damageDealt);
    const pct = (remaining / currentMob.hp) * 100;
    healthBar.style.width = pct + '%';

    if (remaining <= 0) {
        const area = document.getElementById('mob-area');
        area.innerHTML = `<div style="font-size:24px; color:var(--gold)">⚔️ ${currentMob.name} verslagen!</div>`;
        soundMobDefeat();
    }
}

/* ===== Typing Input Handler ===== */

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('typing-input');

    // Keep input focused during lesson
    document.addEventListener('click', () => {
        if (document.getElementById('screen-lesson').classList.contains('active')) {
            input.focus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('screen-lesson').classList.contains('active')) return;
        if (!engineState || engineState.isComplete) return;

        // Prevent default for most keys during lesson
        if (e.key === 'Tab' || e.key === 'Escape') {
            e.preventDefault();
            if (e.key === 'Escape') endLesson();
            return;
        }

        // Only process printable characters and space
        if (e.key.length === 1 || e.key === ' ') {
            e.preventDefault();
            const key = e.key;
            const result = engineProcessKey(key);

            if (result) {
                updateTextDisplay(result.pos, result.isCorrect);

                if (result.isCorrect) {
                    soundKeyCorrect();

                    // Highlight next key
                    if (!result.isComplete) {
                        const nextChar = engineState.chars[engineState.pos];
                        highlightKey(nextChar);
                    }

                    // Word complete sound
                    if (result.typed === ' ' || result.isComplete) {
                        soundWordComplete();
                    }

                    // Spawn block particle occasionally
                    if (Math.random() < 0.3) {
                        const stats = getEngineStats();
                        const resource = Object.keys(stats.resourcesEarned).pop() || 'hout';
                        spawnBlockParticle(
                            window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                            window.innerHeight / 2,
                            resource
                        );
                        soundBlockMine();
                    }

                    // Update mob
                    if (currentMob) {
                        updateMobHealth(engineState.mobDamageDealt);
                        if (result.typed === ' ') soundMobHit();
                    }
                } else {
                    soundKeyError();
                    // Flash error on keyboard
                    flashKeyError(result.expected);
                }

                // Check completion
                if (result.isComplete) {
                    finishLesson();
                }
            }
        }
    });

    // Initialize
    initApp();
});

/* ===== Live Stats Updates ===== */

function startLessonUpdates() {
    stopLessonUpdates();
    lessonUpdateInterval = setInterval(() => {
        const stats = getEngineStats();
        if (!stats) return;

        document.getElementById('live-wpm').textContent = stats.wpm + ' WPM';
        document.getElementById('live-accuracy').textContent = stats.accuracy + '%';
        document.getElementById('live-timer').textContent = stats.elapsed;
        document.getElementById('lesson-progress-fill').style.width = stats.progress + '%';
    }, 500);
}

function stopLessonUpdates() {
    if (lessonUpdateInterval) {
        clearInterval(lessonUpdateInterval);
        lessonUpdateInterval = null;
    }
}

/* ===== Finish Lesson ===== */

async function finishLesson() {
    stopLessonUpdates();

    const stats = getEngineStats();
    if (!stats || !currentPlayer) return;

    const handicap = PLAYERS[currentPlayer.id]?.handicap || 1;
    const xpGained = calculateXpGain(stats, handicap);

    // Update player data
    currentPlayer.xp += xpGained;
    const levelInfo = calculateLevel(currentPlayer.xp);
    const oldLevel = currentPlayer.level;
    currentPlayer.level = levelInfo.level;
    currentPlayer.xpToNext = levelInfo.xpToNext;

    currentPlayer.totalBlocks += stats.blocksMined;
    currentPlayer.totalSessions++;
    currentPlayer.totalMinutes += Math.round(stats.elapsedMinutes);

    if (stats.wpm > currentPlayer.bestWpm) currentPlayer.bestWpm = stats.wpm;
    if (stats.accuracy > currentPlayer.bestAccuracy) currentPlayer.bestAccuracy = stats.accuracy;

    // Merge key errors
    for (const [key, count] of Object.entries(stats.keyErrors)) {
        currentPlayer.keyErrors[key] = (currentPlayer.keyErrors[key] || 0) + count;
    }

    // Add resources
    for (const [res, count] of Object.entries(stats.resourcesEarned)) {
        currentPlayer.resources[res] = (currentPlayer.resources[res] || 0) + count;
    }

    // Update streak
    updateStreak(currentPlayer);

    // Progress lesson if accuracy is good enough
    if (stats.accuracy >= 75) {
        currentPlayer.currentLesson++;
        // Check biome transition
        const lessonSet = LESSON_SETS[currentPlayer.currentBiome];
        if (currentPlayer.currentLesson >= lessonSet.lessons.length) {
            if (checkBiomeUnlock(currentPlayer)) {
                currentPlayer.currentBiome++;
                currentPlayer.currentLesson = 0;
            }
        }
    }

    await savePlayer(currentPlayer);

    // Save session
    await saveSession({
        playerId: currentPlayer.id,
        date: getToday(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        blocks: stats.blocksMined,
        xp: xpGained,
        duration: stats.elapsedMinutes,
        keyErrors: stats.keyErrors,
        lesson: currentLesson?.title || '',
        biome: BIOMES[currentPlayer.currentBiome]?.id || 'plains'
    });

    // Check achievements
    const newAchievements = await checkAchievements(currentPlayer.id, stats);

    // Check family streak
    const familyStreak = await checkFamilyStreak();
    if (familyStreak) {
        await unlockAchievement(currentPlayer.id, 'familie_streak');
    }

    // Show results screen
    showResults(stats, xpGained, newAchievements, oldLevel < currentPlayer.level);

    resetEngine();
}

function showResults(stats, xpGained, newAchievements, leveledUp) {
    soundLessonComplete();
    if (leveledUp) setTimeout(soundLevelUp, 800);
    if (newAchievements.length > 0) setTimeout(soundAchievement, 1200);

    document.getElementById('result-wpm').textContent = stats.wpm;
    document.getElementById('result-accuracy').textContent = stats.accuracy + '%';
    document.getElementById('result-xp').textContent = '+' + xpGained;
    document.getElementById('result-blocks').textContent = stats.blocksMined;

    // Title
    const title = document.getElementById('results-title');
    if (stats.accuracy === 100) {
        title.textContent = '⭐ Perfect! ⭐';
    } else if (stats.accuracy >= 90) {
        title.textContent = 'Uitstekend!';
    } else if (stats.accuracy >= 75) {
        title.textContent = 'Goed Gedaan!';
    } else {
        title.textContent = 'Blijf Oefenen!';
    }

    // Resources earned
    const resDiv = document.getElementById('results-resources');
    resDiv.innerHTML = '';
    for (const [res, count] of Object.entries(stats.resourcesEarned)) {
        if (count > 0) {
            resDiv.innerHTML += `
                <div class="resource-item">
                    <span class="resource-icon">${RESOURCES[res]?.icon || '📦'}</span>
                    <span>+${count} ${res}</span>
                </div>
            `;
        }
    }

    // Achievements
    const achDiv = document.getElementById('results-achievements');
    achDiv.innerHTML = '';
    if (leveledUp) {
        achDiv.innerHTML += `<div class="achievement">🎉 Level Up! Je bent nu Level ${currentPlayer.level}!</div>`;
    }
    for (const ach of newAchievements) {
        achDiv.innerHTML += `<div class="achievement">${ach.icon} ${ach.name}: ${ach.desc}</div>`;
    }

    // Problem keys
    const keysDiv = document.getElementById('results-keys');
    keysDiv.innerHTML = '';
    const errors = Object.entries(stats.keyErrors).sort((a, b) => b[1] - a[1]);
    if (errors.length > 0) {
        keysDiv.innerHTML = '<p style="font-size:11px; color:var(--text-secondary); margin-bottom:8px">Oefen deze toetsen extra:</p>';
        errors.forEach(([key, count]) => {
            keysDiv.innerHTML += `<span class="problem-key">${key} (${count}x fout)</span>`;
        });
    }

    showScreen('screen-results');
}

/* ===== End Lesson (manual stop) ===== */

function endLesson() {
    stopLessonUpdates();
    const stats = getEngineStats();

    if (stats && stats.totalKeystrokes > 10) {
        // Save partial progress
        finishLesson();
    } else {
        resetEngine();
        updateMenuScreen();
        showScreen('screen-menu');
    }
}

/* ===== Daily Challenge ===== */

async function startDailyChallenge() {
    if (!currentPlayer) return;

    const challenge = getDailyChallenge(currentPlayer);

    // Setup engine with challenge text
    createEngine(challenge.text);

    // Setup UI
    document.getElementById('lesson-title').textContent = challenge.title;
    const biomeBadge = document.getElementById('lesson-biome-badge');
    const biome = BIOMES[currentPlayer.currentBiome];
    biomeBadge.textContent = biome.name;
    biomeBadge.className = `biome-badge ${biome.id}`;

    renderTextDisplay(challenge.text);
    renderKeyboard('keyboard-visual');

    currentMob = null;
    currentLesson = { title: challenge.title };
    renderMob();

    showScreen('screen-lesson');

    const input = document.getElementById('typing-input');
    input.value = '';
    input.focus();

    if (challenge.text.length > 0) {
        highlightKey(challenge.text[0]);
    }

    startLessonUpdates();
}

/* ===== Inventory ===== */

function showInventory() {
    if (!currentPlayer) return;

    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    // Show resources
    for (const [res, info] of Object.entries(RESOURCES)) {
        const count = currentPlayer.resources[res] || 0;
        grid.innerHTML += `
            <div class="inv-slot" title="${res}: ${count}">
                ${count > 0 ? info.icon : ''}
                ${count > 0 ? `<span class="count">${count}</span>` : ''}
            </div>
        `;
    }

    // Show crafted items
    for (const item of currentPlayer.inventory) {
        grid.innerHTML += `
            <div class="inv-slot" title="${item.name}">
                ${item.icon}
            </div>
        `;
    }

    // Fill remaining slots
    const totalSlots = 27;
    const usedSlots = Object.keys(RESOURCES).length + currentPlayer.inventory.length;
    for (let i = usedSlots; i < totalSlots; i++) {
        grid.innerHTML += '<div class="inv-slot"></div>';
    }

    // Crafting section
    const craftSection = document.getElementById('crafting-section');
    craftSection.innerHTML = '<h3 style="margin:20px 0 12px; font-size:14px">⚒️ Crafting</h3>';
    craftSection.innerHTML += '<div style="display:flex; flex-wrap:wrap; gap:8px">';

    for (const recipe of CRAFT_RECIPES) {
        const canMake = canCraft(recipe, currentPlayer.resources);
        const costText = Object.entries(recipe.cost).map(([r, n]) => `${n} ${r}`).join(', ');

        craftSection.innerHTML += `
            <div style="background:var(--bg-medium); border:2px solid ${canMake ? 'var(--green)' : '#333'}; padding:12px; min-width:200px; opacity:${canMake ? '1' : '0.5'}">
                <div style="font-size:20px; margin-bottom:4px">${recipe.icon} ${recipe.name}</div>
                <div style="font-size:10px; color:var(--text-secondary)">Kosten: ${costText}</div>
                <div style="font-size:10px; color:var(--gold)">+${recipe.xp} XP</div>
                ${canMake ? `<button class="btn-minecraft" style="min-width:auto; margin-top:8px; font-size:10px; padding:6px 12px" onclick="doCraft('${recipe.id}')">Craft!</button>` : ''}
            </div>
        `;
    }

    craftSection.innerHTML += '</div>';

    showScreen('screen-inventory');
}

async function doCraft(recipeId) {
    const success = await craftItem(currentPlayer.id, recipeId);
    if (success) {
        currentPlayer = await getPlayer(currentPlayer.id);
        soundCraft();
        showToast('⚒️ Item gecraftd!');
        showInventory(); // Refresh
    }
}

/* ===== Family Scoreboard ===== */

async function showFamilyBoard() {
    const streakDiv = document.getElementById('family-streak');
    const scoresDiv = document.getElementById('family-scores');
    const buildDiv = document.getElementById('shared-build');

    // Family streak
    const familyStreak = await checkFamilyStreak();
    streakDiv.innerHTML = `
        <h3 style="margin-bottom:8px">Familie Streak</h3>
        <div style="font-size:24px; color:${familyStreak ? 'var(--gold)' : 'var(--text-secondary)'}">
            ${familyStreak ? '🔥 Alle 3 vandaag geoefend! 2x bonus actief!' : '⏳ Nog niet iedereen vandaag geoefend'}
        </div>
    `;

    // Scores
    const scores = await getFamilyScores();
    scoresDiv.innerHTML = '<h3 style="margin-bottom:12px">Weekranglijst (op verbetering)</h3>';

    const medals = ['🥇', '🥈', '🥉'];
    scores.forEach((score, i) => {
        scoresDiv.innerHTML += `
            <div class="family-score-card">
                <div>
                    <span style="font-size:20px; margin-right:8px">${medals[i] || ''}</span>
                    <span class="player-name">${score.name}</span>
                    <span style="font-size:10px; color:var(--text-secondary); margin-left:8px">Level ${score.level}</span>
                </div>
                <div style="text-align:right">
                    <div style="font-size:14px">${score.weekWpm} WPM</div>
                    <div class="improvement">${score.improvement >= 0 ? '+' : ''}${score.improvement} WPM deze week</div>
                    <div style="font-size:10px; color:var(--text-secondary)">Score: ${score.handicapScore} (×${PLAYERS[score.id]?.handicap || 1} handicap)</div>
                </div>
            </div>
        `;
    });

    // Shared build
    const build = await getSharedBuildProgress();
    buildDiv.innerHTML = `
        <h3 style="margin-bottom:8px">Gezamenlijk Bouwproject</h3>
        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px">
            Bouw ${build.currentBuild + 1} — ${Math.round(build.buildProgress * 100)}% voltooid
        </div>
        <div style="font-size:11px; margin-bottom:12px">
            Totaal blokken: ${build.totalBlocks} |
            ${build.contributions.map(c => `${c.name}: ${c.blocks} (${c.percentage}%)`).join(' | ')}
        </div>
        <div class="build-grid">
            ${renderBuildGrid(build)}
        </div>
    `;

    showScreen('screen-family');
}

function renderBuildGrid(build) {
    const total = 16 * 8;
    let html = '';

    // Color blocks by who contributed
    const players = build.contributions;
    const colors = {
        [players[0]?.name]: '#4caf50',
        [players[1]?.name]: '#2196f3',
        [players[2]?.name]: '#ff9800'
    };

    let blockIndex = 0;
    for (let i = 0; i < total; i++) {
        if (i < build.filledCells) {
            // Assign colors based on contribution ratio
            let color = '#555';
            let cumulative = 0;
            for (const p of players) {
                cumulative += p.percentage;
                if ((i / build.filledCells) * 100 < cumulative) {
                    color = colors[p.name] || '#555';
                    break;
                }
            }
            html += `<div class="build-block filled" style="background:${color}"></div>`;
        } else {
            html += '<div class="build-block" style="background:#222"></div>';
        }
    }

    return html;
}

/* ===== Parent Dashboard ===== */

function showParentLogin() {
    showScreen('screen-parent-login');
    document.getElementById('parent-pin').value = '';
    document.getElementById('parent-pin').focus();
}

function checkParentPin(event) {
    const pin = document.getElementById('parent-pin').value;
    if (pin.length === 4) {
        if (pin === PARENT_PIN) {
            showScreen('screen-parent');
            showParentTab('overview');
        } else {
            document.getElementById('pin-hint').textContent = 'Onjuiste PIN!';
            document.getElementById('pin-hint').style.color = 'var(--red)';
            document.getElementById('parent-pin').value = '';
        }
    }
}

function showParentTab(tab) {
    renderParentDashboard(tab);
}

/* ===== App Initialization ===== */

async function initApp() {
    try {
        await openDB();

        // Initialize all player data
        for (const id of Object.keys(PLAYERS)) {
            await initPlayerData(id);
        }

        // Update profile cards with current levels
        for (const id of Object.keys(PLAYERS)) {
            const player = await getPlayer(id);
            if (player) {
                const levelEl = document.getElementById(`level-${id}`);
                if (levelEl) levelEl.textContent = `Level ${player.level}`;
            }
        }

        showScreen('screen-profiles');
    } catch (err) {
        console.error('Failed to initialize TypeCraft:', err);
    }
}

function toggleSoundBtn() {
    const enabled = toggleSound();
    const btn = document.getElementById('btn-sound');
    btn.textContent = enabled ? '🔊 Geluid Aan' : '🔇 Geluid Uit';
    if (enabled) soundButtonClick();
}
