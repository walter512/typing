/* ===== TypeCraft Main Application - World-First Design ===== */

let currentPlayer = null;
let currentLesson = null;
let lessonUpdateInterval = null;
let currentMob = null;
let currentProject = null;
let wordCount = 0;
let activeRandomEvent = null;

/* ===== Screen Navigation ===== */

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');

    if (screenId !== 'screen-lesson') {
        stopLessonUpdates();
    }
    if (screenId === 'screen-world') {
        updateWorldScreen();
    }
}

/* ===== Profile Selection → World ===== */

async function selectProfile(playerId) {
    currentPlayer = await initPlayerData(playerId);

    // Ensure world state exists
    currentPlayer = await getWorldState(playerId);

    // Check for daily login
    const loginResult = checkDailyLogin(currentPlayer);

    // Collect passive resources
    const passive = calculatePassiveResources(currentPlayer);
    for (const [res, amount] of Object.entries(passive)) {
        currentPlayer.resources[res] = (currentPlayer.resources[res] || 0) + amount;
    }

    // Default active project if none set
    if (!currentPlayer.world.activeProject) {
        const available = getAvailableProjects(currentPlayer);
        if (available.length > 0) {
            currentPlayer.world.activeProject = available[0].id;
        }
    }

    await savePlayer(currentPlayer);

    // Show the world
    showScreen('screen-world');

    // Show daily reward popup if new login
    if (loginResult.isNew && loginResult.reward) {
        setTimeout(() => showDailyReward(loginResult), 500);
    }

    // Show passive resources collected
    if (Object.keys(passive).length > 0) {
        const passiveText = Object.entries(passive)
            .map(([r, a]) => `+${a} ${r}`)
            .join(', ');
        setTimeout(() => showToast(`🏘️ Je dorp produceerde: ${passiveText}`), loginResult.isNew ? 4000 : 500);
    }

    soundButtonClick();
}

/* ===== World Screen ===== */

function updateWorldScreen() {
    if (!currentPlayer) return;

    // Player info
    document.getElementById('world-player-name').textContent = currentPlayer.name;
    document.getElementById('world-player-level').textContent = `Lvl ${currentPlayer.level}`;

    const levelInfo = calculateLevel(currentPlayer.xp);
    const xpPct = Math.round((levelInfo.currentXp / levelInfo.xpToNext) * 100);
    document.getElementById('world-xp-fill').style.width = xpPct + '%';

    // Resources bar
    const resBar = document.getElementById('world-resources-bar');
    resBar.innerHTML = '';
    for (const [res, info] of Object.entries(RESOURCES)) {
        const count = currentPlayer.resources[res] || 0;
        resBar.innerHTML += `<div class="resource-count"><span class="rc-icon">${info.icon}</span>${count}</div>`;
    }

    // Stats
    document.getElementById('world-wpm').textContent = currentPlayer.bestWpm + ' WPM';
    document.getElementById('world-streak').textContent = '🔥 ' + currentPlayer.streak;

    // Build button text
    const btn = document.getElementById('btn-build');
    if (currentPlayer.world.activeProject) {
        const project = BUILDING_PROJECTS.find(p => p.id === currentPlayer.world.activeProject);
        const building = currentPlayer.world.buildings.find(b => b.projectId === currentPlayer.world.activeProject);
        if (project && building && !building.completed) {
            const pct = Math.round((building.blocksPlaced / project.blocksNeeded) * 100);
            btn.innerHTML = `<span class="btn-icon">⛏</span> ${project.name} Bouwen (${pct}%)`;
        } else if (project) {
            btn.innerHTML = `<span class="btn-icon">⛏</span> ${project.name} Bouwen!`;
        }
    } else {
        btn.innerHTML = `<span class="btn-icon">⛏</span> Kies een Bouwproject!`;
    }

    // Render village
    renderVillage();
}

function renderVillage() {
    const scene = document.getElementById('village-scene');
    const sky = document.getElementById('village-sky');
    const world = currentPlayer.world;

    // Add clouds to sky (only if not already there)
    if (!sky.querySelector('.cloud')) {
        sky.innerHTML += `
            <div class="cloud" style="top:8%">☁️</div>
            <div class="cloud" style="top:18%">☁️</div>
            <div class="cloud" style="top:5%">☁️</div>
        `;
    }

    let html = '';

    // Trees decoration
    html += `
        <div class="village-tree" style="left:5%; font-size:42px">🌲</div>
        <div class="village-tree" style="left:15%; font-size:30px; bottom:40%">🌳</div>
        <div class="village-tree" style="right:8%; font-size:38px">🌲</div>
        <div class="village-tree" style="right:18%; font-size:28px; bottom:40%">🌳</div>
    `;

    // Ambient particles
    html += '<div class="village-particles">';
    for (let i = 0; i < 8; i++) {
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const dur = 6 + Math.random() * 8;
        html += `<div class="village-particle" style="left:${left}%; animation-duration:${dur}s; animation-delay:${delay}s"></div>`;
    }
    html += '</div>';

    html += '<div class="village-buildings-container">';

    // Show completed and in-progress buildings
    const allBuildings = BUILDING_PROJECTS.filter(p =>
        world.buildings.some(b => b.projectId === p.id)
    );

    if (allBuildings.length === 0) {
        // Empty village - show inviting build spots
        html += `
            <div class="build-spot" onclick="openBuildMenu()">+</div>
            <div class="build-spot" onclick="openBuildMenu()" style="opacity:0.2">+</div>
            <div class="build-spot" onclick="openBuildMenu()" style="opacity:0.1">+</div>
        `;
    }

    allBuildings.forEach(project => {
        const building = world.buildings.find(b => b.projectId === project.id);
        const isComplete = building && building.completed;
        const isActive = world.activeProject === project.id;
        const pct = building ? Math.round((building.blocksPlaced / project.blocksNeeded) * 100) : 0;

        html += `<div class="village-building ${isComplete ? 'complete' : ''} ${isActive ? 'active' : ''}"
                      onclick="${isComplete ? '' : `selectBuildProject('${project.id}')`}">
            <div class="building-sprite" style="opacity:${isComplete ? 1 : 0.3 + (pct / 100) * 0.7}">${project.icon}</div>
            ${!isComplete ? `<div class="building-progress-mini"><div class="building-progress-fill" style="width:${pct}%; background:${project.color}"></div></div>` : ''}
            <div class="building-label">${project.name}</div>
        </div>`;
    });

    // Add build spot if there's room
    const available = getAvailableProjects(currentPlayer);
    if (available.length > 0) {
        html += `<div class="build-spot" onclick="openBuildMenu()">+</div>`;
    }

    html += '</div>';
    scene.innerHTML = html;
}

/* ===== Daily Reward ===== */

function showDailyReward(loginResult) {
    const popup = document.getElementById('daily-popup');
    popup.style.display = 'flex';

    const streakDisplay = document.getElementById('daily-streak-display');
    let dots = '<div class="streak-dots">';
    for (let i = 0; i < 7; i++) {
        const reward = DAILY_REWARDS[i];
        const claimed = i < loginResult.streak - 1;
        const isToday = i === loginResult.streak - 1;
        dots += `<div class="streak-dot ${claimed ? 'claimed' : ''} ${isToday ? 'today' : ''}">
            ${reward.icon}
        </div>`;
    }
    dots += '</div>';
    streakDisplay.innerHTML = `<div>Dag ${loginResult.streak} van 7</div>${dots}`;

    // Reset chest
    const chest = document.getElementById('daily-chest');
    chest.className = 'daily-chest';
    chest.textContent = '🎁';
    document.getElementById('daily-reward-reveal').innerHTML = '';
    document.querySelector('.daily-hint').style.display = '';

    // Store the reward for claiming
    popup.dataset.reward = JSON.stringify(loginResult.reward);
}

async function openDailyChest() {
    const popup = document.getElementById('daily-popup');
    const rewardData = JSON.parse(popup.dataset.reward || '{}');
    if (!rewardData || !rewardData.reward) return;

    const chest = document.getElementById('daily-chest');
    if (chest.classList.contains('opened')) return;

    chest.classList.add('opened');
    document.querySelector('.daily-hint').style.display = 'none';
    soundAchievement();

    // Claim reward
    claimDailyReward(currentPlayer, rewardData);
    await savePlayer(currentPlayer);

    // Show reward
    const reveal = document.getElementById('daily-reward-reveal');
    const r = rewardData.reward;
    setTimeout(() => {
        reveal.innerHTML = `
            <div class="reward-icon">${rewardData.icon}</div>
            <div style="margin-top:8px">${rewardData.name}</div>
            ${r.xp ? `<div style="color:var(--green); font-size:10px; margin-top:4px">+${r.xp} XP</div>` : ''}
        `;

        // Close button
        setTimeout(() => {
            reveal.innerHTML += `<button class="btn-minecraft" style="min-width:auto; margin-top:16px; font-size:10px; padding:8px 20px" onclick="closeDailyReward()">Geweldig!</button>`;
        }, 800);
    }, 500);
}

function closeDailyReward() {
    document.getElementById('daily-popup').style.display = 'none';
    updateWorldScreen();
}

/* ===== Build Menu ===== */

function openBuildMenu() {
    // If there's an active project, start building instead of showing menu
    if (currentPlayer && currentPlayer.world.activeProject) {
        const building = currentPlayer.world.buildings.find(b => b.projectId === currentPlayer.world.activeProject);
        if (building && !building.completed) {
            startBuildSession();
            return;
        }
    }

    const popup = document.getElementById('build-menu-popup');
    popup.style.display = 'flex';
    soundButtonClick();

    const list = document.getElementById('build-projects-list');
    list.innerHTML = '';

    for (const project of BUILDING_PROJECTS) {
        const isUnlocked = currentPlayer.world.unlockedBiomes.includes(project.biome);
        const building = currentPlayer.world.buildings.find(b => b.projectId === project.id);
        const isComplete = building && building.completed;
        const isInProgress = building && !building.completed;
        const pct = building ? Math.round((building.blocksPlaced / project.blocksNeeded) * 100) : 0;
        const isActive = currentPlayer.world.activeProject === project.id;

        let stateClass = isComplete ? 'completed' : isInProgress ? 'in-progress' : !isUnlocked ? 'locked' : '';

        list.innerHTML += `
            <div class="build-project-card ${stateClass}" onclick="${isUnlocked && !isComplete ? `selectBuildProject('${project.id}')` : ''}">
                <div class="build-card-icon">${project.icon}</div>
                <div class="build-card-name">${project.name} ${isActive ? '⛏️' : ''}</div>
                <div class="build-card-desc">${project.desc}</div>
                <div class="build-card-cost">${project.blocksNeeded} blokken nodig</div>
                ${isComplete ? '<div style="color:var(--green); font-size:9px; margin-top:4px">✅ Voltooid!</div>' : ''}
                ${isInProgress ? `<div class="build-card-progress"><div class="build-card-progress-fill" style="width:${pct}%; background:${project.color}"></div></div>` : ''}
                ${!isUnlocked ? '<div style="color:var(--red); font-size:8px; margin-top:4px">🔒 Unlock meer biomes</div>' : ''}
            </div>
        `;
    }
}

function closeBuildMenu() {
    document.getElementById('build-menu-popup').style.display = 'none';
}

async function selectBuildProject(projectId) {
    currentPlayer.world.activeProject = projectId;

    // Start building if it doesn't exist yet
    let building = currentPlayer.world.buildings.find(b => b.projectId === projectId);
    if (!building) {
        currentPlayer.world.buildings.push({ projectId, blocksPlaced: 0, completed: false });
    }

    await savePlayer(currentPlayer);
    closeBuildMenu();
    updateWorldScreen();

    const project = BUILDING_PROJECTS.find(p => p.id === projectId);
    showToast(`⛏️ Bouwproject: ${project.name}`);
}

/* ===== Start Building (typing session) ===== */

async function continueBuild() {
    return startBuildSession();
}

async function startBuildSession() {
    if (!currentPlayer) return;

    const projectId = currentPlayer.world.activeProject;
    if (!projectId) {
        openBuildMenu();
        return;
    }

    const project = BUILDING_PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    const building = currentPlayer.world.buildings.find(b => b.projectId === projectId);
    if (building && building.completed) {
        openBuildMenu();
        showToast('Dit gebouw is al af! Kies een nieuw project.');
        return;
    }

    currentProject = project;

    // Generate text from the right biome
    const text = generateBuildingText(project, currentPlayer.age);
    if (!text) return;

    createEngine(text);
    wordCount = 0;
    activeRandomEvent = null;

    // Setup UI
    document.getElementById('lesson-title').textContent = project.name;
    const biomeBadge = document.getElementById('lesson-biome-badge');
    const biome = BIOMES[project.biome];
    biomeBadge.textContent = biome.name;
    biomeBadge.className = `biome-badge ${biome.id}`;

    // Build visualization
    document.getElementById('build-icon').textContent = project.icon;
    const buildPct = building ? Math.round((building.blocksPlaced / project.blocksNeeded) * 100) : 0;
    document.getElementById('build-progress-fill').style.width = buildPct + '%';
    document.getElementById('build-pct').textContent = buildPct + '%';
    document.getElementById('build-structure').innerHTML = '';

    renderTextDisplay(text);
    renderKeyboard('keyboard-visual');

    // Check for mob in lesson
    const lessonSet = LESSON_SETS[project.biome];
    const lessonIdx = currentPlayer.currentLesson % (lessonSet ? lessonSet.lessons.length : 1);
    const lesson = lessonSet ? lessonSet.lessons[lessonIdx] : null;
    currentMob = lesson && lesson.mob ? lesson.mob : null;
    currentLesson = lesson || { title: project.name };
    renderMob();

    showScreen('screen-lesson');

    const input = document.getElementById('typing-input');
    input.value = '';
    input.focus();

    if (text.length > 0) highlightKey(text[0]);

    startLessonUpdates();
}

// Keep old startLesson as alias
async function startLesson() {
    return startBuildSession();
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
    if (pos > 0) {
        const prev = chars[pos - 1];
        if (prev) {
            prev.classList.remove('current', 'pending');
            prev.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }
    chars.forEach((c, i) => {
        if (i === pos) {
            c.classList.remove('pending');
            c.classList.add('current');
        }
    });
    if (pos < chars.length) {
        chars[pos].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

/* ===== Mob Battle ===== */

function renderMob() {
    const area = document.getElementById('mob-area');
    if (!currentMob) { area.innerHTML = ''; return; }
    area.innerHTML = `
        <div class="mob-display">
            <div class="mob-sprite">${currentMob.icon}</div>
            <div class="mob-health-bar">
                <div class="mob-health-fill" id="mob-health" style="width:100%"></div>
            </div>
            <div class="mob-name">${currentMob.name} - ${currentMob.hp} HP</div>
        </div>`;
}

function updateMobHealth(damageDealt) {
    if (!currentMob) return;
    const healthBar = document.getElementById('mob-health');
    if (!healthBar) return;
    const remaining = Math.max(0, currentMob.hp - damageDealt);
    healthBar.style.width = (remaining / currentMob.hp) * 100 + '%';
    if (remaining <= 0) {
        document.getElementById('mob-area').innerHTML =
            `<div style="font-size:24px; color:var(--gold)">⚔️ ${currentMob.name} verslagen!</div>`;
        soundMobDefeat();
    }
}

/* ===== Build Visualization ===== */

function addBuildBlock(color) {
    const structure = document.getElementById('build-structure');
    const block = document.createElement('div');
    block.className = 'build-block';
    block.style.background = color;

    // Stack blocks in a pattern
    const blocks = structure.children.length;
    const row = Math.floor(blocks / 8);
    block.style.height = '6px';
    block.style.width = '6px';

    structure.appendChild(block);

    // Keep only last 80 blocks visible
    while (structure.children.length > 80) {
        structure.removeChild(structure.firstChild);
    }
}

function updateBuildProgress() {
    if (!currentProject || !currentPlayer) return;
    const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject.id);
    if (!building) return;
    const pct = Math.round((building.blocksPlaced / currentProject.blocksNeeded) * 100);
    document.getElementById('build-progress-fill').style.width = pct + '%';
    document.getElementById('build-pct').textContent = pct + '%';
}

/* ===== Random Events During Typing ===== */

function triggerRandomEvent(event) {
    activeRandomEvent = event;
    const popup = document.getElementById('event-popup');

    if (event.reward) {
        // Positive event
        popup.innerHTML = `
            <div class="event-icon">${event.icon}</div>
            <div class="event-name">${event.name}</div>
            <div class="event-desc">${event.desc}</div>
            <div class="event-reward">Blijf typen om te verzamelen!</div>
        `;
        popup.style.display = 'block';
        popup.style.borderColor = 'var(--gold)';
        soundAchievement();

        // Apply reward
        if (event.reward.xp) currentPlayer.xp += event.reward.xp;
        if (event.reward.resource) {
            const res = event.reward.resource === 'random'
                ? ['hout', 'steen', 'ijzer', 'goud'][Math.floor(Math.random() * 4)]
                : event.reward.resource;
            currentPlayer.resources[res] = (currentPlayer.resources[res] || 0) + (event.reward.amount || 1);
        }
        if (event.reward.xpMultiplier) {
            currentPlayer.world.xpMultiplier = event.reward.xpMultiplier;
            currentPlayer.world.xpMultiplierWords = event.reward.duration || 10;
        }

        setTimeout(() => {
            popup.style.display = 'none';
            activeRandomEvent = null;
        }, 2500);

    } else if (event.threat) {
        // Threat event - creates urgency!
        popup.innerHTML = `
            <div class="event-icon" style="animation: shake-char 0.3s infinite">${event.icon}</div>
            <div class="event-name" style="color:var(--red)">${event.name}</div>
            <div class="event-desc">${event.desc}</div>
            <div class="event-reward" style="color:var(--red)">Typ snel om je te verdedigen!</div>
        `;
        popup.style.display = 'block';
        popup.style.borderColor = 'var(--red)';
        soundKeyError();

        // Threat auto-resolves after timeout
        setTimeout(() => {
            popup.style.display = 'none';
            activeRandomEvent = null;
        }, event.threat.timeLimit * 1000);
    }

    currentPlayer.world.eventsEncountered++;
}

/* ===== Typing Input Handler ===== */

document.addEventListener('DOMContentLoaded', () => {
    // Add floating Minecraft items to profile screen
    addFloatingItems();

    // Load saved levels on profile cards
    loadProfileLevels();

    const input = document.getElementById('typing-input');

    document.addEventListener('click', () => {
        if (document.getElementById('screen-lesson').classList.contains('active')) {
            input.focus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('screen-lesson').classList.contains('active')) return;
        if (!engineState || engineState.isComplete) return;

        if (e.key === 'Tab' || e.key === 'Escape') {
            e.preventDefault();
            if (e.key === 'Escape') endLesson();
            return;
        }

        if (e.key.length === 1 || e.key === ' ') {
            e.preventDefault();
            const result = engineProcessKey(e.key);

            if (result) {
                updateTextDisplay(result.pos, result.isCorrect);

                if (result.isCorrect) {
                    soundKeyCorrect();

                    if (!result.isComplete) highlightKey(engineState.chars[engineState.pos]);

                    // Place a block for each correct character!
                    if (currentProject) {
                        const blockResult = placeBlock(currentPlayer);
                        if (blockResult && blockResult.placed) {
                            addBuildBlock(currentProject.color);
                            updateBuildProgress();

                            if (blockResult.completed) {
                                soundLevelUp();
                                showToast(`🎉 ${currentProject.name} is af!`);
                            }
                        }
                    }

                    // Word complete
                    if (result.typed === ' ' || result.isComplete) {
                        soundWordComplete();
                        wordCount++;

                        // XP multiplier decay
                        if (currentPlayer.world.xpMultiplierWords > 0) {
                            currentPlayer.world.xpMultiplierWords--;
                            if (currentPlayer.world.xpMultiplierWords <= 0) {
                                currentPlayer.world.xpMultiplier = 1;
                            }
                        }

                        // Random event check every few words
                        if (wordCount % 3 === 0 && !activeRandomEvent) {
                            const event = rollRandomEvent(currentPlayer);
                            if (event) triggerRandomEvent(event);
                        }
                    }

                    // Particles
                    if (Math.random() < 0.25) {
                        const stats = getEngineStats();
                        const resource = Object.keys(stats.resourcesEarned).pop() || 'hout';
                        spawnBlockParticle(
                            window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                            window.innerHeight / 2,
                            resource
                        );
                        if (Math.random() < 0.3) soundBlockMine();
                    }

                    // Update mob
                    if (currentMob) {
                        updateMobHealth(engineState.mobDamageDealt);
                        if (result.typed === ' ') soundMobHit();
                    }
                } else {
                    soundKeyError();
                    flashKeyError(result.expected);
                }

                // Auto-continue: when text is done, generate more!
                if (result.isComplete) {
                    handleTextComplete();
                }
            }
        }
    });

    initApp();
});

/* ===== Auto-Continue: No Natural Stopping Point ===== */

async function handleTextComplete() {
    const stats = getEngineStats();

    // Save progress
    await saveSessionData(stats);

    // Check if building is complete
    const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject?.id);
    if (building && building.completed) {
        // Building finished! Show results and pick a new project
        finishLesson();
        return;
    }

    // Generate MORE text and keep going! (Zeigarnik - don't stop!)
    const newText = generateBuildingText(currentProject, currentPlayer.age);
    createEngine(newText);
    renderTextDisplay(newText);
    wordCount = 0;

    if (newText.length > 0) highlightKey(newText[0]);

    const input = document.getElementById('typing-input');
    input.value = '';
    input.focus();

    // Brief encouraging toast
    const encouragements = [
        '⛏ Goed bezig! Blijf bouwen!',
        '🔥 Je gaat lekker!',
        '💪 Doorgaan!',
        `🏗️ Nog ${currentProject ? currentProject.blocksNeeded - (building?.blocksPlaced || 0) : '?'} blokken!`,
        '⚡ Snelheidsbonus!',
        '🌟 Fantastisch!',
    ];
    showToast(encouragements[Math.floor(Math.random() * encouragements.length)]);
}

async function saveSessionData(stats) {
    if (!stats || !currentPlayer) return;

    const handicap = PLAYERS[currentPlayer.id]?.handicap || 1;
    const multiplier = currentPlayer.world.xpMultiplier || 1;
    const xpGained = Math.round(calculateXpGain(stats, handicap) * multiplier);

    currentPlayer.xp += xpGained;
    const levelInfo = calculateLevel(currentPlayer.xp);
    currentPlayer.level = levelInfo.level;
    currentPlayer.xpToNext = levelInfo.xpToNext;

    currentPlayer.totalBlocks += stats.blocksMined;
    currentPlayer.totalSessions++;
    currentPlayer.totalMinutes += Math.round(stats.elapsedMinutes);

    if (stats.wpm > currentPlayer.bestWpm) currentPlayer.bestWpm = stats.wpm;
    if (stats.accuracy > currentPlayer.bestAccuracy) currentPlayer.bestAccuracy = stats.accuracy;

    for (const [key, count] of Object.entries(stats.keyErrors)) {
        currentPlayer.keyErrors[key] = (currentPlayer.keyErrors[key] || 0) + count;
    }
    for (const [res, count] of Object.entries(stats.resourcesEarned)) {
        currentPlayer.resources[res] = (currentPlayer.resources[res] || 0) + count;
    }

    updateStreak(currentPlayer);

    // Biome unlock check
    if (currentPlayer.bestWpm >= 15 && !currentPlayer.world.unlockedBiomes.includes(1)) {
        currentPlayer.world.unlockedBiomes.push(1);
        currentPlayer.currentBiome = Math.max(currentPlayer.currentBiome, 1);
        showToast('🌲 Nieuw biome ontgrendeld: Forest!');
    }
    if (currentPlayer.bestWpm >= 25 && !currentPlayer.world.unlockedBiomes.includes(2)) {
        currentPlayer.world.unlockedBiomes.push(2);
        currentPlayer.currentBiome = Math.max(currentPlayer.currentBiome, 2);
        showToast('🏜️ Nieuw biome ontgrendeld: Desert!');
    }
    if (currentPlayer.bestWpm >= 35 && !currentPlayer.world.unlockedBiomes.includes(3)) {
        currentPlayer.world.unlockedBiomes.push(3);
        currentPlayer.currentBiome = Math.max(currentPlayer.currentBiome, 3);
        showToast('🔥 Nieuw biome ontgrendeld: Nether!');
    }
    if (currentPlayer.bestWpm >= 45 && !currentPlayer.world.unlockedBiomes.includes(4)) {
        currentPlayer.world.unlockedBiomes.push(4);
        currentPlayer.currentBiome = Math.max(currentPlayer.currentBiome, 4);
        showToast('🐉 Nieuw biome ontgrendeld: The End!');
    }

    currentPlayer.currentLesson++;
    currentPlayer.world.totalWordsTyped += stats.wordsCompleted;

    await savePlayer(currentPlayer);

    await saveSession({
        playerId: currentPlayer.id,
        date: getToday(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        blocks: stats.blocksMined,
        xp: xpGained,
        duration: stats.elapsedMinutes,
        keyErrors: stats.keyErrors,
        lesson: currentLesson?.title || currentProject?.name || '',
        biome: BIOMES[currentPlayer.currentBiome]?.id || 'plains'
    });

    await checkAchievements(currentPlayer.id, stats);
}

/* ===== Live Stats ===== */

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

/* ===== Finish Build Session ===== */

async function finishLesson() {
    stopLessonUpdates();
    const stats = getEngineStats();
    if (!stats || !currentPlayer) return;

    await saveSessionData(stats);

    const handicap = PLAYERS[currentPlayer.id]?.handicap || 1;
    const xpGained = calculateXpGain(stats, handicap);
    const newAchievements = await checkAchievements(currentPlayer.id, stats);
    const familyStreak = await checkFamilyStreak();
    if (familyStreak) await unlockAchievement(currentPlayer.id, 'familie_streak');

    showResults(stats, xpGained, newAchievements, false);
    resetEngine();
}

function showResults(stats, xpGained, newAchievements, leveledUp) {
    soundLessonComplete();
    if (newAchievements.length > 0) setTimeout(soundAchievement, 800);

    document.getElementById('result-wpm').textContent = stats.wpm;
    document.getElementById('result-accuracy').textContent = stats.accuracy + '%';
    document.getElementById('result-xp').textContent = '+' + xpGained;
    document.getElementById('result-blocks').textContent = stats.blocksMined;

    const title = document.getElementById('results-title');
    if (currentProject) {
        const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject.id);
        if (building && building.completed) {
            title.textContent = `🎉 ${currentProject.name} Voltooid!`;
        } else {
            const pct = building ? Math.round((building.blocksPlaced / currentProject.blocksNeeded) * 100) : 0;
            title.textContent = `⛏ ${currentProject.name} — ${pct}% af`;
        }
    } else if (stats.accuracy === 100) {
        title.textContent = '⭐ Perfect! ⭐';
    } else if (stats.accuracy >= 90) {
        title.textContent = 'Uitstekend!';
    } else {
        title.textContent = 'Goed Gedaan!';
    }

    // Resources
    const resDiv = document.getElementById('results-resources');
    resDiv.innerHTML = '';
    for (const [res, count] of Object.entries(stats.resourcesEarned)) {
        if (count > 0) {
            resDiv.innerHTML += `<div class="resource-item"><span class="resource-icon">${RESOURCES[res]?.icon || '📦'}</span><span>+${count} ${res}</span></div>`;
        }
    }

    // Achievements
    const achDiv = document.getElementById('results-achievements');
    achDiv.innerHTML = '';
    for (const ach of newAchievements) {
        achDiv.innerHTML += `<div class="achievement">${ach.icon} ${ach.name}: ${ach.desc}</div>`;
    }

    // Problem keys
    const keysDiv = document.getElementById('results-keys');
    keysDiv.innerHTML = '';
    const errors = Object.entries(stats.keyErrors).sort((a, b) => b[1] - a[1]);
    if (errors.length > 0) {
        keysDiv.innerHTML = '<p style="font-size:10px; color:var(--text-secondary); margin-bottom:6px">Oefen deze toetsen:</p>';
        errors.forEach(([key, count]) => {
            keysDiv.innerHTML += `<span class="problem-key">${key} (${count}x)</span>`;
        });
    }

    showScreen('screen-results');
}

/* ===== End Lesson (manual stop) ===== */

function endLesson() {
    stopLessonUpdates();
    const stats = getEngineStats();

    if (stats && stats.totalKeystrokes > 10) {
        finishLesson();
    } else {
        resetEngine();
        showScreen('screen-world');
    }
}

/* ===== Daily Challenge ===== */

async function startDailyChallenge() {
    if (!currentPlayer) return;
    const challenge = getDailyChallenge(currentPlayer);
    createEngine(challenge.text);

    document.getElementById('lesson-title').textContent = challenge.title;
    const biome = BIOMES[currentPlayer.currentBiome];
    const badge = document.getElementById('lesson-biome-badge');
    badge.textContent = biome.name;
    badge.className = `biome-badge ${biome.id}`;

    document.getElementById('build-icon').textContent = '⚔';
    document.getElementById('build-progress-fill').style.width = '0%';
    document.getElementById('build-pct').textContent = '';
    document.getElementById('build-structure').innerHTML = '';

    renderTextDisplay(challenge.text);
    renderKeyboard('keyboard-visual');

    currentMob = null;
    currentProject = null;
    currentLesson = { title: challenge.title };
    renderMob();

    showScreen('screen-lesson');
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').focus();

    if (challenge.text.length > 0) highlightKey(challenge.text[0]);
    startLessonUpdates();
}

/* ===== Inventory ===== */

function showInventory() {
    if (!currentPlayer) return;
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    for (const [res, info] of Object.entries(RESOURCES)) {
        const count = currentPlayer.resources[res] || 0;
        grid.innerHTML += `<div class="inv-slot" title="${res}: ${count}">${count > 0 ? info.icon : ''}${count > 0 ? `<span class="count">${count}</span>` : ''}</div>`;
    }
    for (const item of currentPlayer.inventory) {
        grid.innerHTML += `<div class="inv-slot" title="${item.name}">${item.icon}</div>`;
    }
    const totalSlots = 27;
    const usedSlots = Object.keys(RESOURCES).length + currentPlayer.inventory.length;
    for (let i = usedSlots; i < totalSlots; i++) {
        grid.innerHTML += '<div class="inv-slot"></div>';
    }

    const craftSection = document.getElementById('crafting-section');
    craftSection.innerHTML = '<h3 style="margin:20px 0 12px; font-size:14px">⚒️ Crafting</h3><div style="display:flex; flex-wrap:wrap; gap:8px">';
    for (const recipe of CRAFT_RECIPES) {
        const canMake = canCraft(recipe, currentPlayer.resources);
        const costText = Object.entries(recipe.cost).map(([r, n]) => `${n} ${r}`).join(', ');
        craftSection.innerHTML += `<div style="background:var(--bg-medium); border:2px solid ${canMake ? 'var(--green)' : '#333'}; padding:12px; min-width:200px; opacity:${canMake ? '1' : '0.5'}">
            <div style="font-size:20px; margin-bottom:4px">${recipe.icon} ${recipe.name}</div>
            <div style="font-size:10px; color:var(--text-secondary)">Kosten: ${costText}</div>
            <div style="font-size:10px; color:var(--gold)">+${recipe.xp} XP</div>
            ${canMake ? `<button class="btn-minecraft" style="min-width:auto; margin-top:8px; font-size:10px; padding:6px 12px" onclick="doCraft('${recipe.id}')">Craft!</button>` : ''}
        </div>`;
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
        showInventory();
    }
}

/* ===== Family Scoreboard ===== */

async function showFamilyBoard() {
    const streakDiv = document.getElementById('family-streak');
    const scoresDiv = document.getElementById('family-scores');
    const buildDiv = document.getElementById('shared-build');

    const familyStreak = await checkFamilyStreak();
    streakDiv.innerHTML = `<h3 style="margin-bottom:8px">Familie Streak</h3>
        <div style="font-size:20px; color:${familyStreak ? 'var(--gold)' : 'var(--text-secondary)'}">
            ${familyStreak ? '🔥 Alle 3 vandaag geoefend! 2x bonus!' : '⏳ Nog niet iedereen vandaag'}
        </div>`;

    const scores = await getFamilyScores();
    scoresDiv.innerHTML = '<h3 style="margin-bottom:12px">Weekranglijst</h3>';
    const medals = ['🥇', '🥈', '🥉'];
    scores.forEach((score, i) => {
        scoresDiv.innerHTML += `<div class="family-score-card">
            <div><span style="font-size:20px; margin-right:8px">${medals[i] || ''}</span>
            <span class="player-name">${score.name}</span>
            <span style="font-size:10px; color:var(--text-secondary); margin-left:8px">Level ${score.level}</span></div>
            <div style="text-align:right">
                <div style="font-size:14px">${score.weekWpm} WPM</div>
                <div class="improvement">${score.improvement >= 0 ? '+' : ''}${score.improvement} WPM</div>
            </div>
        </div>`;
    });

    const build = await getSharedBuildProgress();
    buildDiv.innerHTML = `<h3 style="margin-bottom:8px">Gezamenlijk Bouwproject</h3>
        <div style="font-size:12px; color:var(--text-secondary)">Totaal: ${build.totalBlocks} blokken</div>
        <div class="build-grid">${renderBuildGrid(build)}</div>`;

    showScreen('screen-family');
}

function renderBuildGrid(build) {
    const total = 16 * 8;
    let html = '';
    const colors = ['#4caf50', '#2196f3', '#ff9800'];
    for (let i = 0; i < total; i++) {
        if (i < build.filledCells) {
            const colorIdx = Math.floor((i / build.filledCells) * 3);
            html += `<div class="build-block filled" style="background:${colors[colorIdx] || '#555'}"></div>`;
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

/* ===== Initialization ===== */

async function initApp() {
    try {
        await openDB();
        for (const id of Object.keys(PLAYERS)) {
            await initPlayerData(id);
        }
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
    document.getElementById('btn-sound').textContent = enabled ? '🔊 Geluid Aan' : '🔇 Geluid Uit';
    if (enabled) soundButtonClick();
}

// Legacy compatibility
function updateMenuScreen() { updateWorldScreen(); }

/* ===== Visual Enhancements ===== */

function addFloatingItems() {
    const screen = document.getElementById('screen-profiles');
    const items = ['⛏️', '🗡️', '💎', '🪓', '🏗️', '⭐', '🔥', '🛡️', '🪣', '🧱', '🌲', '⚔️'];
    for (let i = 0; i < 12; i++) {
        const el = document.createElement('div');
        el.className = 'floating-item';
        el.textContent = items[i % items.length];
        el.style.left = (5 + Math.random() * 90) + '%';
        el.style.top = (5 + Math.random() * 85) + '%';
        el.style.animationDelay = (Math.random() * 8) + 's';
        el.style.animationDuration = (6 + Math.random() * 6) + 's';
        el.style.fontSize = (16 + Math.random() * 16) + 'px';
        el.style.opacity = 0.08 + Math.random() * 0.12;
        screen.appendChild(el);
    }
}

async function loadProfileLevels() {
    for (const p of Object.keys(PLAYERS)) {
        try {
            const data = await getPlayer(p);
            if (data) {
                const lvl = document.getElementById('level-' + p);
                if (lvl) lvl.textContent = 'Level ' + (data.level || 1);
            }
        } catch (e) { /* first visit */ }
    }
}
