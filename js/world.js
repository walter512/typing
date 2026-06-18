/* ===== TypeCraft World System ===== */
/* The world is a visual village that grows as you type. */
/* Each building is a project you choose. Typing places blocks. */

const BUILDING_PROJECTS = [
    // Tier 1 - Plains (home row)
    {
        id: 'hut', name: 'Houten Hut', icon: '🏠', biome: 0,
        desc: 'Je eerste schuilplaats tegen de monsters!',
        blocksNeeded: 40, material: 'hout', color: '#8d6e63',
        width: 4, height: 3, unlocked: true,
        reward: { xp: 50, item: 'houten_zwaard' }
    },
    {
        id: 'werkbank', name: 'Werkbank', icon: '🔨', biome: 0,
        desc: 'Craft betere gereedschappen!',
        blocksNeeded: 30, material: 'hout', color: '#a1887f',
        width: 2, height: 2, unlocked: true,
        reward: { xp: 40, item: null }
    },
    {
        id: 'hek', name: 'Houten Hek', icon: '🪵', biome: 0,
        desc: 'Bescherm je dorp tegen mobs!',
        blocksNeeded: 50, material: 'hout', color: '#795548',
        width: 6, height: 1, unlocked: true,
        reward: { xp: 60, item: null }
    },
    {
        id: 'farm', name: 'Boerderij', icon: '🌾', biome: 0,
        desc: 'Verbouw voedsel voor je dorp.',
        blocksNeeded: 45, material: 'hout', color: '#c8e6c9',
        width: 4, height: 2, unlocked: true,
        reward: { xp: 55, item: null }
    },
    // Tier 2 - Forest (top row)
    {
        id: 'stenen_huis', name: 'Stenen Huis', icon: '🏗️', biome: 1,
        desc: 'Sterker dan hout, veiliger tegen creepers!',
        blocksNeeded: 80, material: 'steen', color: '#9e9e9e',
        width: 5, height: 4, unlocked: false,
        reward: { xp: 120, item: 'stenen_pickaxe' }
    },
    {
        id: 'bibliotheek', name: 'Bibliotheek', icon: '📚', biome: 1,
        desc: 'Leer enchantments en toverspreuken!',
        blocksNeeded: 60, material: 'steen', color: '#8d6e63',
        width: 3, height: 3, unlocked: false,
        reward: { xp: 100, item: null }
    },
    {
        id: 'smederij', name: 'Smederij', icon: '⚒️', biome: 1,
        desc: 'Smeed wapens van ijzer en staal!',
        blocksNeeded: 70, material: 'steen', color: '#616161',
        width: 3, height: 3, unlocked: false,
        reward: { xp: 110, item: 'ijzeren_harnas' }
    },
    {
        id: 'wachttoren', name: 'Wachttoren', icon: '🗼', biome: 1,
        desc: 'Zie vijanden van ver aankomen!',
        blocksNeeded: 90, material: 'steen', color: '#78909c',
        width: 2, height: 6, unlocked: false,
        reward: { xp: 130, item: null }
    },
    // Tier 3 - Desert (bottom row)
    {
        id: 'piramide', name: 'Piramide', icon: '🔺', biome: 2,
        desc: 'Een monumentaal bouwwerk vol schatten!',
        blocksNeeded: 120, material: 'zandsteen', color: '#f9a825',
        width: 6, height: 5, unlocked: false,
        reward: { xp: 200, item: 'gouden_helm' }
    },
    {
        id: 'oase', name: 'Oase', icon: '🌴', biome: 2,
        desc: 'Water in de woestijn, leven in de droogte!',
        blocksNeeded: 60, material: 'zandsteen', color: '#4fc3f7',
        width: 4, height: 2, unlocked: false,
        reward: { xp: 100, item: null }
    },
    {
        id: 'markt', name: 'Handelsmarkt', icon: '🏪', biome: 2,
        desc: 'Handel met rondtrekkende kooplieden!',
        blocksNeeded: 80, material: 'zandsteen', color: '#ffcc80',
        width: 4, height: 3, unlocked: false,
        reward: { xp: 140, item: null }
    },
    // Tier 4 - Nether (capitals/punctuation)
    {
        id: 'nether_poort', name: 'Nether Portaal', icon: '🟣', biome: 3,
        desc: 'Open een portaal naar de Nether!',
        blocksNeeded: 100, material: 'obsidiaan', color: '#4a148c',
        width: 4, height: 5, unlocked: false,
        reward: { xp: 250, item: 'enchanted_boog' }
    },
    {
        id: 'vesting', name: 'Nether Vesting', icon: '🏰', biome: 3,
        desc: 'Een onneembaar fort in de Nether!',
        blocksNeeded: 150, material: 'netherbrick', color: '#b71c1c',
        width: 6, height: 5, unlocked: false,
        reward: { xp: 300, item: null }
    },
    // Tier 5 - The End (numbers/symbols)
    {
        id: 'end_toren', name: 'End Toren', icon: '🗽', biome: 4,
        desc: 'De ultieme structuur in The End!',
        blocksNeeded: 200, material: 'endsteen', color: '#e8eaf6',
        width: 4, height: 8, unlocked: false,
        reward: { xp: 500, item: 'beacon' }
    },
    {
        id: 'drakentroon', name: 'Drakentroon', icon: '🐉', biome: 4,
        desc: 'Een troon gemaakt van drakenbeenderen!',
        blocksNeeded: 180, material: 'endsteen', color: '#ce93d8',
        width: 5, height: 5, unlocked: false,
        reward: { xp: 500, item: 'diamanten_zwaard' }
    }
];

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
            const res = project.material === 'zandsteen' ? 'steen' :
                        project.material === 'obsidiaan' ? 'ijzer' :
                        project.material === 'netherbrick' ? 'ijzer' :
                        project.material === 'endsteen' ? 'goud' :
                        project.material;
            passive[res] = (passive[res] || 0) + amount;
        }
    }

    return passive;
}

/* ===== Building System ===== */

function getAvailableProjects(player) {
    const completed = player.world.buildings.filter(b => b.completed).map(b => b.projectId);
    const inProgress = player.world.buildings.filter(b => !b.completed).map(b => b.projectId);

    return BUILDING_PROJECTS.filter(p => {
        if (completed.includes(p.id)) return false;
        if (inProgress.includes(p.id)) return false;
        return player.world.unlockedBiomes.includes(p.biome);
    });
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

function getWordsForProject(project, playerAge) {
    const biomeIdx = project.biome;
    const lessonSet = LESSON_SETS[biomeIdx];
    if (!lessonSet) return [];

    // Gather all words and sentences from this biome's lessons
    let allTexts = [];
    for (const lesson of lessonSet.lessons) {
        if (lesson.words) allTexts.push(...lesson.words);
        if (lesson.sentences) {
            if (playerAge >= 10) {
                allTexts.push(...lesson.sentences);
            } else {
                lesson.sentences.filter(s => s.length < 30).forEach(s => allTexts.push(s));
            }
        }
    }

    // Shuffle
    for (let i = allTexts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTexts[i], allTexts[j]] = [allTexts[j], allTexts[i]];
    }

    return allTexts;
}

function generateBuildingText(project, playerAge) {
    const words = getWordsForProject(project, playerAge);
    // Generate enough text for a 3-5 minute session
    // Each word = 1 block placed, so this also controls blocks per session
    const count = playerAge <= 8 ? 25 : playerAge <= 11 ? 40 : 55;
    // If we need more words than available, cycle through them
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(words[i % words.length]);
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
