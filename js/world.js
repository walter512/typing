/* ===== TypeCraft World System ===== */
/* The world is a visual village that grows as you type. */
/* Each building is a project you choose. Typing places blocks. */

/* NOTE: BUILDING_PROJECTS is now generated from CITY_LAYERS in city3d.js */
/* This file uses BUILDING_PROJECTS after city3d.js is loaded. */

const RANDOM_EVENTS = [
    // Positive events
    { type: 'chest', icon: '🎁', name: 'Schatkist!', desc: 'Je hebt een verborgen schatkist gevonden!', chance: 0.03, reward: { xp: 25, resource: 'random', amount: 5 } },
    { type: 'villager', icon: '👨‍🌾', name: 'Dorpeling', desc: 'Een dorpeling brengt een geschenk!', chance: 0.025, reward: { xp: 15, resource: 'random', amount: 3 } },
    { type: 'rainbow', icon: '🌈', name: 'Regenboog!', desc: 'Dubbele XP voor de volgende 10 woorden!', chance: 0.015, reward: { xpMultiplier: 2, duration: 10 } },
    { type: 'diamond', icon: '💎', name: 'Diamant!', desc: 'Je hebt een zeldzame diamant gevonden!', chance: 0.008, reward: { xp: 50, resource: 'diamant', amount: 1 } },
    { type: 'enchant', icon: '✨', name: 'Betovering!', desc: 'Magische kracht stroomt door je vingers!', chance: 0.02, reward: { xp: 30, speedBoost: true } },
    // Negative events (create tension/story)
    { type: 'creeper', icon: '💚', name: 'Creeper!', desc: 'Een Creeper sluipt dichterbij! Typ snel!', chance: 0.04, threat: { hp: 5, timeLimit: 15 } },
    { type: 'zombie_horde', icon: '🧟', name: 'Zombie Horde!', desc: 'Zombies vallen je dorp aan!', chance: 0.025, threat: { hp: 8, timeLimit: 20 } },
    { type: 'skeleton', icon: '💀', name: 'Skelet Schutter!', desc: 'Een skelet schiet pijlen!', chance: 0.03, threat: { hp: 6, timeLimit: 12 } },
    { type: 'enderman', icon: '🟣', name: 'Enderman!', desc: 'Kijk niet weg! Blijf typen!', chance: 0.01, threat: { hp: 12, timeLimit: 25 } }
];

const DAILY_REWARDS = [
    { day: 1, icon: '🪵', name: '10 Hout', reward: { resource: 'hout', amount: 10, xp: 10 } },
    { day: 2, icon: '🪨', name: '8 Steen', reward: { resource: 'steen', amount: 8, xp: 15 } },
    { day: 3, icon: '🔩', name: '5 IJzer', reward: { resource: 'ijzer', amount: 5, xp: 20 } },
    { day: 4, icon: '⚡', name: '2x XP Boost', reward: { xpMultiplier: 2, xp: 25 } },
    { day: 5, icon: '🥇', name: '3 Goud', reward: { resource: 'goud', amount: 3, xp: 30 } },
    { day: 6, icon: '🎁', name: 'Mystery Box', reward: { resource: 'random', amount: 10, xp: 40 } },
    { day: 7, icon: '💎', name: 'DIAMANT!', reward: { resource: 'diamant', amount: 1, xp: 75 } }
];

/* ===== World State ===== */

async function getWorldState(playerId) {
    let player = await getPlayer(playerId);
    if (!player.world) {
        player.world = {
            buildings: [],       // { projectId, blocksPlaced, completed, position }
            activeProject: null, // current building project id
            unlockedBiomes: [0],
            lastLogin: null,
            loginStreak: 0,
            dailyRewardClaimed: false,
            totalWordsTyped: 0,
            eventsEncountered: 0,
            passiveResources: {},
            activeEvent: null,
            xpMultiplier: 1,
            xpMultiplierWords: 0
        };
        await savePlayer(player);
    }
    return player;
}

/* ===== Daily Login System ===== */

function checkDailyLogin(player) {
    const today = getToday();
    const world = player.world;

    if (world.lastLogin === today) {
        return { isNew: false, reward: null };
    }

    // Update streak
    if (world.lastLogin) {
        const gap = daysBetween(world.lastLogin, today);
        if (gap === 1) {
            world.loginStreak = Math.min(world.loginStreak + 1, 7);
        } else if (gap > 2) {
            world.loginStreak = 1;
        } else {
            world.loginStreak = Math.min(world.loginStreak + 1, 7);
        }
    } else {
        world.loginStreak = 1;
    }

    world.lastLogin = today;
    world.dailyRewardClaimed = false;

    const dayIndex = ((world.loginStreak - 1) % 7);
    return { isNew: true, reward: DAILY_REWARDS[dayIndex], streak: world.loginStreak };
}

function claimDailyReward(player, reward) {
    if (player.world.dailyRewardClaimed) return false;

    const r = reward.reward;
    if (r.resource) {
        const res = r.resource === 'random'
            ? ['hout', 'steen', 'ijzer', 'goud'][Math.floor(Math.random() * 4)]
            : r.resource;
        player.resources[res] = (player.resources[res] || 0) + r.amount;
    }
    if (r.xp) {
        player.xp += r.xp;
    }
    if (r.xpMultiplier) {
        player.world.xpMultiplier = r.xpMultiplier;
        player.world.xpMultiplierWords = 50; // lasts 50 words
    }

    player.world.dailyRewardClaimed = true;
    return true;
}

/* ===== Passive Resource Generation ===== */

function calculatePassiveResources(player) {
    const world = player.world;
    if (!world.lastLogin) return {};

    const now = new Date();
    const lastLogin = new Date(world.lastLogin + 'T00:00:00');
    const hoursSince = Math.min(48, (now - lastLogin) / (1000 * 60 * 60)); // cap at 48h

    const passive = {};
    const completedBuildings = world.buildings.filter(b => b.completed);

    for (const b of completedBuildings) {
        const project = BUILDING_PROJECTS.find(p => p.id === b.projectId);
        if (!project) continue;

        // Each completed building generates 1 resource per 6 hours
        const amount = Math.floor(hoursSince / 6);
        if (amount > 0) {
            // Materials are now: hout, steen, ijzer, goud, diamant
            const res = project.material || 'hout';
            passive[res] = (passive[res] || 0) + amount;
        }
    }

    return passive;
}

/* ===== Building System ===== */

async function getAvailableProjects(player) {
    // If player already has an active unfinished building, only show that one
    if (player.world.activeProject) {
        const activeBld = player.world.buildings.find(b => b.projectId === player.world.activeProject && !b.completed);
        if (activeBld) {
            const proj = BUILDING_PROJECTS.find(p => p.id === activeBld.projectId);
            return proj ? [proj] : [];
        }
    }

    // Load all player data to compute layer statuses
    const playerDataMap = {};
    for (const id of Object.keys(PLAYERS)) {
        playerDataMap[id] = await getPlayer(id);
    }

    const layerStatuses = CITY_LAYERS.map((_, i) => getLayerStatus(i, playerDataMap));
    const available = [];
    for (let i = 0; i < CITY_LAYERS.length; i++) {
        if (!isLayerAccessible(i, player, layerStatuses)) continue;

        const layer = CITY_LAYERS[i];

        // Check if player earned full access (3 buildings done in prev wijk)
        let fullAccess = (i === 0);
        if (i > 0) {
            const prevLayer = CITY_LAYERS[i - 1];
            let doneCount = 0;
            for (const b of prevLayer.buildings) {
                const bld = player?.world?.buildings?.find(x => x.projectId === b.id);
                if (bld && bld.completed) doneCount++;
            }
            fullAccess = doneCount >= BUILDINGS_PER_PLAYER_TO_ADVANCE;
        }

        for (const b of layer.buildings) {
            const myBld = player.world.buildings.find(x => x.projectId === b.id);
            if (myBld && myBld.completed) continue;
            // In higher wijken without full access: only show already-started buildings
            if (!fullAccess && (!myBld || myBld.blocksPlaced === 0)) continue;
            const proj = BUILDING_PROJECTS.find(p => p.id === b.id);
            if (proj) available.push(proj);
        }
    }
    return available;
}

function getBuildingProgress(player, projectId) {
    const building = player.world.buildings.find(b => b.projectId === projectId);
    if (!building) return null;
    const project = BUILDING_PROJECTS.find(p => p.id === projectId);
    if (!project) return null;
    return {
        ...building,
        project,
        percentage: Math.round((building.blocksPlaced / project.blocksNeeded) * 100)
    };
}

function placeBlock(player) {
    const activeId = player.world.activeProject;
    if (!activeId) return null;

    let building = player.world.buildings.find(b => b.projectId === activeId);
    const project = BUILDING_PROJECTS.find(p => p.id === activeId);
    if (!project) return null;

    if (!building) {
        building = { projectId: activeId, blocksPlaced: 0, completed: false };
        player.world.buildings.push(building);
    }

    if (building.completed) return null;

    building.blocksPlaced++;

    if (building.blocksPlaced >= project.blocksNeeded) {
        building.completed = true;
        return { placed: true, completed: true, project };
    }

    return { placed: true, completed: false, project, progress: building.blocksPlaced / project.blocksNeeded };
}

/* ===== Random Events ===== */

function rollRandomEvent(player) {
    // Only trigger if no active event
    if (player.world.activeEvent) return null;

    for (const event of RANDOM_EVENTS) {
        if (Math.random() < event.chance) {
            return event;
        }
    }
    return null;
}

/* ===== Word Lists by Building Material (maps to key groups) ===== */

function getWordsForProject(project, playerAge, player) {
    const biomeIdx = project.biome;

    // Adaptive: use lessons up to the player's current progress
    // This ensures building words match what the player has learned
    const maxBiome = player ? player.currentBiome : biomeIdx;
    const maxLesson = player ? player.currentLesson : 999;

    let allTexts = [];

    // Gather words from all biomes up to and including current progress
    for (let bi = 0; bi <= Math.min(biomeIdx, maxBiome); bi++) {
        const lessonSet = LESSON_SETS[bi];
        if (!lessonSet) continue;

        const lessonLimit = (bi < maxBiome) ? lessonSet.lessons.length : maxLesson + 1;
        for (let li = 0; li < Math.min(lessonSet.lessons.length, lessonLimit); li++) {
            const lesson = lessonSet.lessons[li];
            if (lesson.words) allTexts.push(...lesson.words);
            if (lesson.sentences) {
                if (playerAge >= 10) {
                    allTexts.push(...lesson.sentences);
                } else {
                    lesson.sentences.filter(s => s.length < 30).forEach(s => allTexts.push(s));
                }
            }
        }
    }

    // Fallback: if no texts found (player hasn't started), use first lesson
    if (allTexts.length === 0) {
        const firstSet = LESSON_SETS[0];
        if (firstSet && firstSet.lessons[0]) {
            if (firstSet.lessons[0].words) allTexts.push(...firstSet.lessons[0].words);
        }
    }

    // Shuffle
    for (let i = allTexts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTexts[i], allTexts[j]] = [allTexts[j], allTexts[i]];
    }

    return allTexts;
}

// Target space-separated words per line (1 line = 1 block)
const WORDS_PER_LINE = 12;
// Lines per session (1 session = 3 blocks)
const LINES_PER_SESSION = 3;

function generateRoundText(project, playerAge, player) {
    const items = getWordsForProject(project, playerAge, player);
    // Build text by adding items until we have enough space-separated words
    const targetWords = WORDS_PER_LINE * LINES_PER_SESSION;
    const result = [];
    let spaceWordCount = 0;
    let i = 0;
    while (spaceWordCount < targetWords) {
        const item = items[i % items.length];
        const itemWords = item.split(' ').length;
        result.push(item);
        spaceWordCount += itemWords;
        i++;
    }
    return result.join(' ');
}

/* ===== Render Village Grid ===== */

function renderVillageGrid(player) {
    const world = player.world;
    const gridSize = 12; // 12x8 grid
    const gridHeight = 8;

    let html = '<div class="village-grid">';

    // Background layer - grass with some variation
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridSize; x++) {
            const isGrass = y >= gridHeight - 2;
            const isDirt = y >= gridHeight - 1;
            let cellClass = 'village-cell';
            let cellStyle = '';
            let content = '';

            if (isDirt) {
                cellStyle = `background: var(--dirt);`;
            } else if (isGrass) {
                cellStyle = `background: var(--grass); opacity: 0.6;`;
            } else {
                // Sky
                const skyShade = Math.round(26 + (y * 3));
                cellStyle = `background: rgb(${skyShade}, ${skyShade + 10}, ${skyShade + 30});`;
            }

            html += `<div class="${cellClass}" style="${cellStyle}">${content}</div>`;
        }
    }

    html += '</div>';

    // Building overlays
    html += '<div class="village-buildings">';

    const allProjects = BUILDING_PROJECTS.filter(p => {
        return world.buildings.some(b => b.projectId === p.id);
    });

    allProjects.forEach((project, i) => {
        const building = world.buildings.find(b => b.projectId === project.id);
        const pct = building ? Math.round((building.blocksPlaced / project.blocksNeeded) * 100) : 0;
        const isComplete = building && building.completed;
        const isActive = world.activeProject === project.id;

        html += `<div class="village-building ${isComplete ? 'complete' : ''} ${isActive ? 'active' : ''}"
                      style="left: ${10 + (i % 5) * 18}%; bottom: ${isComplete ? '20' : '18'}%;"
                      onclick="selectBuildProject('${project.id}')">
            <div class="building-icon" style="font-size: ${isComplete ? '36' : '28'}px; opacity: ${isComplete ? '1' : '0.4 + ' + (pct/100) * 0.6}">${project.icon}</div>
            ${!isComplete ? `<div class="building-progress-mini"><div class="building-progress-fill" style="width:${pct}%; background:${project.color}"></div></div>` : ''}
            <div class="building-label">${project.name}</div>
        </div>`;
    });

    html += '</div>';

    return html;
}
