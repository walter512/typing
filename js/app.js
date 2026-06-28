/* ===== TypeCraft Main Application - World-First Design ===== */

let currentPlayer = null;
let currentLesson = null;
let lessonUpdateInterval = null;
let currentMob = null;
let currentProject = null;
let wordCount = 0;
let activeRandomEvent = null;
let sessionBlocksPlaced = 0;

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
        const available = await getAvailableProjects(currentPlayer);
        if (available.length > 0) {
            const proj = available[0];
            currentPlayer.world.activeProject = proj.id;
            if (!currentPlayer.world.buildings.find(b => b.projectId === proj.id)) {
                currentPlayer.world.buildings.push({ projectId: proj.id, blocksPlaced: 0, completed: false });
            }
        }
    }

    await savePlayer(currentPlayer);

    // Show the world
    showScreen('screen-world');

    // First-time tutorial
    const isFirstTime = !currentPlayer.tutorialSeen;
    if (isFirstTime) {
        currentPlayer.tutorialSeen = true;
        await savePlayer(currentPlayer);
        setTimeout(() => showTutorial(), 500);
        return; // Tutorial handles daily reward after
    }

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
            btn.innerHTML = `<span class="btn-icon">⛏</span> ${project.name} (${pct}%)`;
        } else if (project) {
            btn.innerHTML = `<span class="btn-icon">⛏</span> ${project.name} Bouwen!`;
        }
    } else {
        btn.innerHTML = `<span class="btn-icon">⛏</span> Kies een gebouw!`;
    }

    // Render 2D city
    renderCity('city-container');
}

/* ===== Daily Reward ===== */

/* ===== First-Time Tutorial ===== */

function showTutorial() {
    const popup = document.getElementById('event-popup');
    popup.style.display = 'block';
    popup.innerHTML = `
        <div class="tutorial-popup">
            <div class="event-icon">🏘️</div>
            <div class="event-name" style="font-size:16px; margin-bottom:12px">Welkom bij TypeCraft!</div>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.8; text-align:left; max-width:320px; margin:0 auto">
                <p style="margin-bottom:10px">
                    <span style="color:var(--gold)">Jouw doel:</span> Bouw een heel dorp door te typen!
                </p>
                <p style="margin-bottom:10px">
                    ⛏️ Kies een gebouw om te bouwen<br>
                    ⌨️ Type de woorden om blokken te plaatsen<br>
                    🏠 Elk gebouw maakt je dorp groter!
                </p>
                <p style="color:var(--diamond)">
                    Hoe sneller en beter je typt, hoe meer je verdient!
                </p>
            </div>
            <button class="btn-minecraft btn-primary" onclick="closeTutorial()" style="min-width:auto; margin-top:16px; justify-content:center">
                ⛏️ Laten we bouwen!
            </button>
        </div>
    `;
    soundAchievement();
}

function closeTutorial() {
    document.getElementById('event-popup').style.display = 'none';
    // Now check daily reward
    const loginResult = checkDailyLogin(currentPlayer);
    if (loginResult.isNew && loginResult.reward) {
        setTimeout(() => showDailyReward(loginResult), 300);
    }
}

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

function startBuildOrChoose() {
    if (currentPlayer && currentPlayer.world.activeProject) {
        const building = currentPlayer.world.buildings.find(b => b.projectId === currentPlayer.world.activeProject);
        if (building && !building.completed) {
            startBuildSession();
            return;
        }
    }
    openBuildMenu();
}

async function openBuildMenu() {

    const popup = document.getElementById('build-menu-popup');
    popup.style.display = 'flex';
    soundButtonClick();

    // Gather all player data for claims and layer status checks
    const allPlayerData = {};
    const claimedBy = {};
    for (const [id, info] of Object.entries(PLAYERS)) {
        const p = await getPlayer(id);
        allPlayerData[id] = p;
        if (p && p.world && p.world.buildings) {
            for (const b of p.world.buildings) {
                claimedBy[b.projectId] = { ...b, playerName: info.name, playerId: id };
            }
        }
    }
    const layerStatuses = CITY_LAYERS.map((_, i) => getLayerStatus(i, allPlayerData));

    const list = document.getElementById('build-projects-list');
    list.innerHTML = '';

    // Group by layer for display
    for (let layerIdx = 0; layerIdx < CITY_LAYERS.length; layerIdx++) {
        const layer = CITY_LAYERS[layerIdx];
        const layerStatus = layerStatuses[layerIdx];
        list.innerHTML += `<div style="grid-column:1/-1; font-family:var(--font-mc); font-size:8px; color:var(--gold); padding:8px 0 4px; border-top: 1px solid #333; margin-top:8px">${layer.icon} ${layer.name} ${!layerStatus.unlocked ? '🔒' : layerStatus.complete ? '✅' : ''}</div>`;

        for (const building of layer.buildings) {
            const project = BUILDING_PROJECTS.find(p => p.id === building.id);
            if (!project) continue;
            const isUnlocked = layerStatus.unlocked;
            const claim = claimedBy[project.id];
            const isOwn = claim && claim.playerId === currentPlayer.id;
            const isOther = claim && claim.playerId !== currentPlayer.id;
            const isComplete = claim && claim.completed;
            const isInProgress = claim && !claim.completed;
            const pct = claim ? Math.round((claim.blocksPlaced / project.blocksNeeded) * 100) : 0;
            const isActive = currentPlayer.world.activeProject === project.id;
            const canSelect = isUnlocked && !isComplete && !isOther;

            let stateClass = isComplete ? 'completed' : isInProgress ? 'in-progress' : !isUnlocked ? 'locked' : isOther ? 'locked' : '';

            list.innerHTML += `
                <div class="build-project-card ${stateClass}" onclick="${canSelect ? `selectBuildProject('${project.id}')` : ''}">
                    <div class="build-card-icon">${project.icon}</div>
                    <div class="build-card-name">${project.name} ${isActive ? '⛏️' : ''}</div>
                    <div class="build-card-desc">${project.desc}</div>
                    <div class="build-card-cost">${project.blocksNeeded} blokken nodig</div>
                    ${isComplete ? `<div style="color:var(--green); font-size:9px; margin-top:4px">✅ Gebouwd door ${claim.playerName}</div>` : ''}
                    ${isOther && !isComplete ? `<div style="color:var(--gold); font-size:9px; margin-top:4px">⛏️ ${claim.playerName} bouwt hieraan (${pct}%)</div>` : ''}
                    ${isOwn && isInProgress ? `<div class="build-card-progress"><div class="build-card-progress-fill" style="width:${pct}%; background:${project.color}"></div></div>` : ''}
                    ${!isUnlocked ? `<div style="color:var(--red); font-size:8px; margin-top:4px">🔒 Voltooi ${layerIdx > 0 ? CITY_LAYERS[layerIdx-1].name : ''} eerst</div>` : ''}
                </div>
            `;
        }
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

/* ===== Finger Position Instruction ===== */

let lastShownBiome = -1;

const FINGER_HINTS = [
    { biome: 0, title: 'Thuisrij: A S D F — J K L', hint: 'Leg je vingers op de thuisrij. Je wijsvingers voelen de bultjes op F en J.', keys: ['a','s','d','f','j','k','l'] },
    { biome: 1, title: 'Bovenste Rij: Q W E R T — Y U I O P', hint: 'Strek je vingers omhoog naar de bovenste rij. Keer steeds terug naar de thuisrij!', keys: ['q','w','e','r','t','y','u','i','o','p'] },
    { biome: 2, title: 'Onderste Rij: Z X C V B — N M', hint: 'Buig je vingers omlaag. Elke vinger bedient één toets op de onderste rij.', keys: ['z','x','c','v','b','n','m'] },
    { biome: 3, title: 'Hoofdletters & Leestekens', hint: 'Gebruik Shift met je pink. De andere hand typt de letter.', keys: [',','.','/'] },
    { biome: 4, title: 'Cijfers', hint: 'De cijfers staan boven de bovenste rij. Strek je vingers helemaal uit!', keys: ['1','2','3','4','5','6','7','8','9','0'] },
];

function showFingerInstruction(biome, callback) {
    if (biome === lastShownBiome) { callback(); return; }
    lastShownBiome = biome;

    const info = FINGER_HINTS.find(f => f.biome === biome);
    if (!info) { callback(); return; }

    document.getElementById('fingers-title').textContent = info.title;
    document.getElementById('fingers-hint').textContent = info.hint + '\n\nLeg je vingers op de thuisrij en druk F + J tegelijk in om te beginnen!';

    // Render keyboard diagram with highlighted keys
    const diagram = document.getElementById('fingers-diagram');
    const homeKeys = ['a','s','d','f','j','k','l'];
    let html = '';
    const rows = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m']
    ];
    for (const row of rows) {
        html += '<div class="keyboard-row">';
        for (const key of row) {
            const isNew = info.keys.includes(key);
            const isHome = homeKeys.includes(key);
            const isFJ = key === 'f' || key === 'j';
            html += `<div class="fkey ${isNew ? 'highlight' : isHome ? 'home' : ''} ${isFJ ? 'fj-key' : ''}">${key}${isFJ ? ' ▸' : ''}</div>`;
        }
        html += '</div>';
    }
    diagram.innerHTML = html;

    window._fingerCallback = callback;
    window._fjState = { f: false, j: false };

    // Listen for F+J simultaneous press
    window._fjHandler = (e) => {
        if (!document.getElementById('screen-fingers').classList.contains('active')) return;
        if (e.key === 'f') window._fjState.f = true;
        if (e.key === 'j') window._fjState.j = true;
        if (window._fjState.f && window._fjState.j) {
            dismissFingers();
        }
    };
    window._fjUpHandler = (e) => {
        if (e.key === 'f') window._fjState.f = false;
        if (e.key === 'j') window._fjState.j = false;
    };
    document.addEventListener('keydown', window._fjHandler);
    document.addEventListener('keyup', window._fjUpHandler);

    showScreen('screen-fingers');
}

function dismissFingers() {
    document.removeEventListener('keydown', window._fjHandler);
    document.removeEventListener('keyup', window._fjUpHandler);
    if (window._fingerCallback) {
        window._fingerCallback();
        window._fingerCallback = null;
    }
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

    let building = currentPlayer.world.buildings.find(b => b.projectId === projectId);
    if (building && building.completed) {
        openBuildMenu();
        showToast('Dit gebouw is al af! Kies een nieuw project.');
        return;
    }

    // Show finger position instruction for new biome
    showFingerInstruction(project.biome, () => doStartBuild(project));
}

async function doStartBuild(project) {
    let building = currentPlayer.world.buildings.find(b => b.projectId === project.id);

    // Create building entry if it doesn't exist
    if (!building) {
        building = { projectId: project.id, blocksPlaced: 0, completed: false };
        currentPlayer.world.buildings.push(building);
        await savePlayer(currentPlayer);
    }

    currentProject = project;
    wordCount = 0;
    sessionBlocksPlaced = 0;
    activeRandomEvent = null;

    // Generate 3 lines of text (1 block per line)
    const text = generateRoundText(project, currentPlayer.age, currentPlayer);
    if (!text) return;

    createEngine(text);

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
    const remaining = Math.max(0, project.blocksNeeded - (building.blocksPlaced || 0));
    document.getElementById('build-pct').textContent = remaining > 0 ? `${buildPct}% — nog ${remaining}` : '100% ✓';
    updateRoundDisplay();
    initBuildGrid(project, building ? building.blocksPlaced : 0);

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

function updateRoundDisplay() {
    const el = document.getElementById('live-round');
    if (el) el.textContent = `⛏ ${sessionBlocksPlaced}/${LINES_PER_SESSION}`;
}

// Keep old startLesson as alias
async function startLesson() {
    return startBuildSession();
}

function renderTextDisplay(text) {
    const display = document.getElementById('text-display');
    display.innerHTML = '';

    // Group chars into words to prevent mid-word line breaks
    let charIndex = 0;
    const words = text.split(' ');

    words.forEach((word, wordIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';

        // Add characters of the word
        for (let c = 0; c < word.length; c++) {
            const span = document.createElement('span');
            span.className = `char ${charIndex === 0 ? 'current' : 'pending'}`;
            span.textContent = word[c];
            span.dataset.index = charIndex;
            wordSpan.appendChild(span);
            charIndex++;
        }

        display.appendChild(wordSpan);

        // Add space between words (not after the last word)
        if (wordIdx < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.className = `char ${charIndex === 0 ? 'current' : 'pending'}`;
            spaceSpan.textContent = '\u00A0';
            spaceSpan.dataset.index = charIndex;
            display.appendChild(spaceSpan);
            charIndex++;
        }
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
    // Scroll to keep current character visible with next line showing
    if (pos < chars.length) {
        const display = document.getElementById('text-display');
        const charEl = chars[pos];
        const charTop = charEl.offsetTop - display.offsetTop;
        const lineHeight = charEl.offsetHeight * 2; // one line height
        const scrollTarget = charTop - lineHeight; // keep current char one line from top
        if (scrollTarget > display.scrollTop) {
            display.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        }
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

function initBuildGrid(project, blocksPlaced) {
    const structure = document.getElementById('build-structure');
    // Find building definition in CITY_LAYERS
    let buildingDef = null;
    for (const layer of CITY_LAYERS) {
        buildingDef = layer.buildings.find(b => b.id === project.id);
        if (buildingDef) break;
    }
    if (buildingDef) {
        structure.innerHTML = renderBuildingSprite(buildingDef, blocksPlaced, project.blocksNeeded);
        structure.style.transform = 'scale(0.85)';
        structure.style.transformOrigin = 'center bottom';
    } else {
        structure.innerHTML = `<div style="font-size:40px">${project.icon}</div>`;
    }
}

function addBuildBlock(color) {
    if (!currentProject) return;
    const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject.id);
    if (building) {
        animateNewBlock(currentProject.id, building.blocksPlaced, currentProject.blocksNeeded, sessionBlocksPlaced);
    }
}

function updateBuildProgress() {
    if (!currentProject || !currentPlayer) return;
    const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject.id);
    if (!building) return;
    const pct = Math.min(100, Math.round((building.blocksPlaced / currentProject.blocksNeeded) * 100));
    const remaining = Math.max(0, currentProject.blocksNeeded - building.blocksPlaced);
    document.getElementById('build-progress-fill').style.width = pct + '%';
    document.getElementById('build-pct').textContent = remaining > 0 ? `${pct}% — nog ${remaining}` : '100% ✓';
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

    const input = document.getElementById('typing-input');

    document.addEventListener('click', () => {
        if (document.getElementById('screen-lesson').classList.contains('active')) {
            input.focus();
        }
    });

    // ===== Global Keyboard Navigation =====
    document.addEventListener('keydown', (e) => {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;
        const screenId = activeScreen.id;

        // Profile screen: 1/2/3 to pick player
        if (screenId === 'screen-profiles') {
            if (e.key === '1') { selectProfile('sebas'); e.preventDefault(); return; }
            if (e.key === '2') { selectProfile('jonathan'); e.preventDefault(); return; }
            if (e.key === '3') { selectProfile('benjamin'); e.preventDefault(); return; }
        }

        // World screen: Enter/Space to build, Escape to switch player
        if (screenId === 'screen-world') {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startBuildOrChoose(); return; }
            if (e.key === 'Escape') { showScreen('screen-profiles'); return; }
            if (e.key === 'i' || e.key === 'I') { showInventory(); return; }
        }

        // Results screen: Enter/Space to continue
        if (screenId === 'screen-results') {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Click the primary button
                const btn = document.querySelector('#results-buttons .btn-primary');
                if (btn) btn.click();
                return;
            }
        }

        // Inventory: Escape to go back
        if (screenId === 'screen-inventory') {
            if (e.key === 'Escape') { showScreen('screen-world'); return; }
        }

        // Family board: Escape to go back
        if (screenId === 'screen-family') {
            if (e.key === 'Escape') { showScreen('screen-world'); return; }
        }

        // Build menu popup: 1-9 to pick, Escape to close
        const buildMenu = document.getElementById('build-menu-popup');
        if (buildMenu && buildMenu.style.display !== 'none') {
            if (e.key === 'Escape') { closeBuildMenu(); e.preventDefault(); return; }
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                const cards = buildMenu.querySelectorAll('.build-project-card:not(.completed):not(.locked)');
                if (cards[num - 1]) { cards[num - 1].click(); e.preventDefault(); return; }
            }
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

                    // Word complete
                    if (result.typed === ' ' || result.isComplete) {
                        soundWordComplete();
                        wordCount++;

                        // End of a line (every 12 words) — place 1 block
                        if (wordCount > 0 && wordCount % WORDS_PER_LINE === 0 && sessionBlocksPlaced < LINES_PER_SESSION) {
                            placeBlockInline();

                            // All 3 blocks done — session complete
                            if (sessionBlocksPlaced >= LINES_PER_SESSION) {
                                handleRoundComplete();
                                return;
                            }
                        }

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
                        spawnBlockParticle(
                            window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                            window.innerHeight / 2,
                            currentProject?.material || 'hout'
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

                // Fallback: if text runs out before all blocks placed
                if (result.isComplete && sessionBlocksPlaced < LINES_PER_SESSION) {
                    while (sessionBlocksPlaced < LINES_PER_SESSION) {
                        placeBlockInline();
                    }
                    handleRoundComplete();
                }
            }
        }
    });

    initApp();
});

/* ===== Place 1 block mid-typing (after each line of 12 words) ===== */

function placeBlockInline() {
    if (!currentProject) return;
    const blockResult = placeBlock(currentPlayer);
    if (blockResult && blockResult.placed) {
        sessionBlocksPlaced++;
        soundBlockPlace();
        addBuildBlock(currentProject.color);
        updateBuildProgress();
        updateRoundDisplay();
        savePlayer(currentPlayer);
    }
}

/* ===== Session Complete: all 3 lines typed ===== */

async function handleRoundComplete() {
    stopLessonUpdates();
    const stats = getEngineStats();
    await saveSessionData(stats);
    resetEngine();

    const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject?.id);
    const remaining = currentProject ? currentProject.blocksNeeded - (building?.blocksPlaced || 0) : 0;
    const pct = building ? Math.round((building.blocksPlaced / currentProject.blocksNeeded) * 100) : 0;

    if (building && building.completed) {
        soundLevelUp();
        const handicap = PLAYERS[currentPlayer.id]?.handicap || 1;
        const xpGained = calculateXpGain(stats, handicap);
        const newAchievements = await checkAchievements(currentPlayer.id, stats);
        showResults(stats, xpGained, newAchievements, false);
    } else {
        soundRoundComplete();
        showRoundCelebration(stats, building, remaining, pct, sessionBlocksPlaced);
    }
}

function showRoundCelebration(stats, building, remaining, pct, blocksThisSession) {
    const title = document.getElementById('results-title');
    const encouragements = [
        '⛏ Goed gedaan!',
        '🔥 Uitstekend!',
        '💪 Sterk getypt!',
        '⭐ Geweldig!',
        '🌟 Fantastisch!',
    ];
    title.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];

    document.getElementById('result-wpm').textContent = stats.wpm;
    document.getElementById('result-accuracy').textContent = stats.accuracy + '%';

    // Show building at same position as during typing — with highlighted new blocks
    showResultsBuilding(building?.blocksPlaced || 0, blocksThisSession);

    // Resources info
    const resDiv = document.getElementById('results-resources');
    resDiv.innerHTML = '';
    if (currentProject) {
        resDiv.innerHTML = `
            <div style="font-size:14px; color:var(--gold);">+${blocksThisSession || 1} blokken geplaatst!</div>
            <div style="font-size:10px; color:var(--text-secondary); margin-top:4px">
                ${remaining > 0 ? `Nog ${remaining} blokken voor ${currentProject.name} (${pct}%)` : `${currentProject.name} is af!`}
            </div>`;
    }

    // Clear other sections
    document.getElementById('results-achievements').innerHTML = '';
    document.getElementById('results-keys').innerHTML = '';

    // Buttons — back to city
    const btnDiv = document.getElementById('results-buttons');
    if (btnDiv) {
        btnDiv.innerHTML = `
            <button class="btn-minecraft btn-primary" onclick="showScreen('screen-world')">🏘️ Terug naar de Stad</button>
        `;
    }

    showScreen('screen-results');
}

function showResultsBuilding(blocksPlaced, highlightBlocks) {
    const visual = document.getElementById('results-build-visual');
    if (!visual || !currentProject) { if (visual) visual.style.display = 'none'; return; }

    visual.style.display = '';
    document.getElementById('results-build-icon').textContent = currentProject.icon;

    const pct = Math.min(100, Math.round((blocksPlaced / currentProject.blocksNeeded) * 100));
    const remaining = Math.max(0, currentProject.blocksNeeded - blocksPlaced);
    document.getElementById('results-build-fill').style.width = pct + '%';
    document.getElementById('results-build-pct').textContent = remaining > 0 ? `${pct}% — nog ${remaining}` : '100% ✓';

    const structure = document.getElementById('results-build-structure');
    for (const layer of CITY_LAYERS) {
        const bDef = layer.buildings.find(b => b.id === currentProject.id);
        if (bDef) {
            structure.innerHTML = renderBuildingSprite(bDef, blocksPlaced, currentProject.blocksNeeded, 24, highlightBlocks);
            break;
        }
    }
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

    const title = document.getElementById('results-title');
    if (currentProject) {
        const building = currentPlayer.world.buildings.find(b => b.projectId === currentProject.id);
        if (building && building.completed) {
            title.textContent = `🎉 ${currentProject.name} Voltooid!`;
        } else {
            const pct = building ? Math.round((building.blocksPlaced / currentProject.blocksNeeded) * 100) : 0;
            title.textContent = `⛏ ${currentProject.name} — ${pct}% af`;
        }
        // Show building at same position with highlighted new blocks
        const bld = currentPlayer.world.buildings.find(x => x.projectId === currentProject.id);
        showResultsBuilding(bld?.blocksPlaced || 0, sessionBlocksPlaced);
    } else {
        if (stats.accuracy === 100) {
            title.textContent = '⭐ Perfect! ⭐';
        } else if (stats.accuracy >= 90) {
            title.textContent = 'Uitstekend!';
        } else {
            title.textContent = 'Goed Gedaan!';
        }
        document.getElementById('results-build-visual').style.display = 'none';
    }

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

    // Set result buttons based on building state
    const btnDiv = document.getElementById('results-buttons');
    if (btnDiv) {
        const building = currentProject ? currentPlayer.world.buildings.find(b => b.projectId === currentProject.id) : null;
        if (building && building.completed) {
            // Building is done — show celebration, go back to village
            btnDiv.innerHTML = `
                <button class="btn-minecraft btn-primary" onclick="showScreen('screen-world'); updateWorldScreen();">🏘️ Bekijk je Dorp!</button>
            `;
        } else {
            // Building still in progress — continue or go back
            btnDiv.innerHTML = `
                <button class="btn-minecraft btn-primary" onclick="continueBuild()">⛏ Verder Bouwen!</button>
                <button class="btn-minecraft" onclick="showScreen('screen-world')">🏘️ Terug naar Dorp</button>
            `;
        }
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

    // Resources
    for (const [res, info] of Object.entries(RESOURCES)) {
        const count = currentPlayer.resources[res] || 0;
        grid.innerHTML += `<div class="inv-slot" title="${res}: ${count}">${count > 0 ? info.icon : ''}${count > 0 ? `<span class="count">${count}</span>` : ''}</div>`;
    }
    // Owned items
    for (const item of currentPlayer.inventory) {
        grid.innerHTML += `<div class="inv-slot" title="${item.name}">${item.icon}</div>`;
    }
    const totalSlots = 27;
    const usedSlots = Object.keys(RESOURCES).length + currentPlayer.inventory.length;
    for (let i = usedSlots; i < totalSlots; i++) {
        grid.innerHTML += '<div class="inv-slot"></div>';
    }

    const craftSection = document.getElementById('crafting-section');
    let html = '';

    // ===== BONUSSEN =====
    html += '<h3 style="margin:16px 0 10px; font-size:14px">🎁 Bonussen</h3>';
    html += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px">';

    const bonuses = getAvailableBonuses(currentPlayer);
    if (bonuses.length === 0) {
        html += '<div style="font-size:10px; color:var(--text-secondary); padding:8px">Geen bonussen beschikbaar. Oefen meer om bonussen te verdienen!</div>';
    }
    for (const bonus of bonuses) {
        const claimed = currentPlayer.claimedBonuses?.includes(bonus.id);
        html += `<div style="background:var(--bg-medium); border:2px solid ${claimed ? '#444' : 'var(--gold)'}; padding:12px; min-width:180px; opacity:${claimed ? '0.5' : '1'}">
            <div style="font-size:20px; margin-bottom:4px">${bonus.icon}</div>
            <div style="font-size:10px; color:#fff; margin-bottom:2px">${bonus.name}</div>
            <div style="font-size:9px; color:var(--text-secondary)">${bonus.desc}</div>
            <div style="font-size:9px; color:var(--gold); margin-top:4px">${bonus.rewardText}</div>
            ${claimed ? '<div style="font-size:9px; color:#666; margin-top:4px">✓ Opgehaald</div>' : `<button class="btn-minecraft" style="min-width:auto; margin-top:8px; font-size:10px; padding:6px 12px; background:var(--gold); border-color:#ffeb3b #c49000 #c49000 #ffeb3b" onclick="claimBonus('${bonus.id}')">Ophalen!</button>`}
        </div>`;
    }
    html += '</div>';

    // ===== CRAFTING — grouped by tier =====
    const tierNames = ['🪵 Hout', '🪨 Steen', '🔩 IJzer', '🥇 Goud', '💎 Diamant'];
    const tierColors = ['#8d6e63', '#9e9e9e', '#e0e0e0', '#ffc107', '#4dd0e1'];

    for (let tier = 0; tier <= 4; tier++) {
        const tierRecipes = CRAFT_RECIPES.filter(r => r.tier === tier);
        if (tierRecipes.length === 0) continue;

        // Check if tier is accessible (player has unlocked the wijk)
        const tierUnlocked = tier === 0 || (currentPlayer.world?.unlockedBiomes?.includes(tier));

        html += `<h3 style="margin:16px 0 8px; font-size:12px; color:${tierColors[tier]}; border-bottom:1px solid ${tierColors[tier]}33; padding-bottom:4px">${tierNames[tier]}</h3>`;
        html += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px">';

        for (const recipe of tierRecipes) {
            const canMake = tierUnlocked && canCraft(recipe, currentPlayer.resources);
            const alreadyOwns = !recipe.repeatable && currentPlayer.inventory.some(i => i.id === recipe.id);
            const costText = Object.entries(recipe.cost).map(([r, n]) => `${RESOURCES[r]?.icon || ''} ${n}`).join(' + ');
            const borderColor = alreadyOwns ? 'var(--gold)' : canMake ? 'var(--green)' : '#333';
            const dimmed = !tierUnlocked || (!canMake && !alreadyOwns);

            html += `<div style="background:var(--bg-medium); border:2px solid ${borderColor}; padding:10px; min-width:160px; flex:1; max-width:200px; opacity:${dimmed ? '0.4' : '1'}">
                <div style="font-size:18px; margin-bottom:2px">${recipe.icon} <span style="font-size:10px">${recipe.name}</span></div>
                <div style="font-size:8px; color:var(--text-secondary)">${costText}</div>
                <div style="font-size:8px; color:var(--green); margin-top:2px">${recipe.effect || ''}</div>
                ${alreadyOwns ? '<div style="font-size:8px; color:var(--gold); margin-top:4px">✓ Gecraftd</div>' : canMake ? `<button class="btn-minecraft" style="min-width:auto; margin-top:6px; font-size:9px; padding:5px 10px" onclick="doCraft('${recipe.id}')">Craft!</button>` : !tierUnlocked ? '<div style="font-size:8px; color:#666; margin-top:4px">🔒 Wijk niet ontgrendeld</div>' : ''}
            </div>`;
        }
        html += '</div>';
    }

    craftSection.innerHTML = html;
    showScreen('screen-inventory');
}

/* ===== Bonus System ===== */

function getAvailableBonuses(player) {
    const today = getToday();
    const bonuses = [];
    const completedCount = player.world?.buildings?.filter(b => b.completed).length || 0;

    // Dagelijkse oefening
    if (player.lastPracticeDate === today) {
        bonuses.push({
            id: `daily_${today}`, icon: '☀️',
            name: 'Dagelijkse Oefening', desc: 'Je hebt vandaag geoefend!',
            rewardText: '+5 hout, +10 XP',
            reward: { resource: 'hout', amount: 5, xp: 10 }
        });
    }

    // Streaks
    if (player.streak >= 3) {
        bonuses.push({
            id: `streak3_${Math.floor(player.streak / 3)}`, icon: '🔥',
            name: '3 Dagen Streak!', desc: `${player.streak} dagen achter elkaar!`,
            rewardText: '+3 steen, +15 XP',
            reward: { resource: 'steen', amount: 3, xp: 15 }
        });
    }
    if (player.streak >= 7) {
        bonuses.push({
            id: `streak7_${Math.floor(player.streak / 7)}`, icon: '💪',
            name: 'Week Streak!', desc: `${player.streak} dagen — ongelooflijk!`,
            rewardText: '+2 ijzer, +1 goud, +30 XP',
            reward: { resource: 'ijzer', amount: 2, xp: 30, extra: { resource: 'goud', amount: 1 } }
        });
    }
    if (player.streak >= 14) {
        bonuses.push({
            id: `streak14_${Math.floor(player.streak / 14)}`, icon: '⚡',
            name: '2 Weken Streak!', desc: `${player.streak} dagen — legendarisch!`,
            rewardText: '+3 goud, +2 diamant, +50 XP',
            reward: { resource: 'goud', amount: 3, xp: 50, extra: { resource: 'diamant', amount: 2 } }
        });
    }

    // Gebouwen milestones
    const buildingMilestones = [1, 3, 6, 9, 12, 15];
    for (const m of buildingMilestones) {
        if (completedCount >= m) {
            const tierReward = m <= 3 ? { resource: 'steen', amount: m * 2 }
                             : m <= 6 ? { resource: 'ijzer', amount: m }
                             : m <= 9 ? { resource: 'goud', amount: m }
                             : { resource: 'diamant', amount: Math.floor(m / 3) };
            bonuses.push({
                id: `building_${m}`, icon: m >= 12 ? '🏰' : m >= 6 ? '🏙️' : '🏠',
                name: `${m} Gebouw${m > 1 ? 'en' : ''} Af!`,
                desc: `Je hebt ${m} gebouw${m > 1 ? 'en' : ''} voltooid.`,
                rewardText: `+${tierReward.amount} ${tierReward.resource}, +${m * 15} XP`,
                reward: { ...tierReward, xp: m * 15 }
            });
        }
    }

    // Snelheid milestones
    const wpmMilestones = [
        { wpm: 10, id: 'wpm_10', name: 'Eerste Stappen', icon: '🐢', reward: { resource: 'hout', amount: 10, xp: 20 } },
        { wpm: 20, id: 'wpm_20', name: 'Op Gang!', icon: '🚶', reward: { resource: 'steen', amount: 8, xp: 30 } },
        { wpm: 30, id: 'wpm_30', name: 'Snelle Vingers', icon: '🏃', reward: { resource: 'ijzer', amount: 5, xp: 50 } },
        { wpm: 40, id: 'wpm_40', name: 'Typkampioen!', icon: '🚀', reward: { resource: 'goud', amount: 5, xp: 75 } },
        { wpm: 50, id: 'wpm_50', name: 'Bliksemtyper!', icon: '⚡', reward: { resource: 'diamant', amount: 3, xp: 100 } },
    ];
    for (const ms of wpmMilestones) {
        if (player.bestWpm >= ms.wpm) {
            bonuses.push({
                id: ms.id, icon: ms.icon,
                name: ms.name, desc: `${ms.wpm}+ WPM behaald!`,
                rewardText: `+${ms.reward.amount} ${ms.reward.resource}, +${ms.reward.xp} XP`,
                reward: ms.reward
            });
        }
    }

    // Perfecte nauwkeurigheid
    if (player.bestAccuracy >= 100) {
        bonuses.push({
            id: 'perfect_run', icon: '✨',
            name: 'Perfectionist!', desc: '100% nauwkeurigheid behaald!',
            rewardText: '+1 diamant, +50 XP',
            reward: { resource: 'diamant', amount: 1, xp: 50 }
        });
    }

    // Wijk ontgrendelings-bonussen
    const wijkNames = ['Basis Kamp', 'Dorp', 'Stad', 'Vesting', 'Legende'];
    const unlockedBiomes = player.world?.unlockedBiomes || [0];
    for (let i = 1; i < wijkNames.length; i++) {
        if (unlockedBiomes.includes(i)) {
            bonuses.push({
                id: `wijk_${i}`, icon: ['🏕️','🏘️','🏙️','🏰','🐉'][i],
                name: `${wijkNames[i]} Ontgrendeld!`, desc: `Nieuwe wijk bereikt!`,
                rewardText: `+${i * 3} ${['','steen','ijzer','goud','diamant'][i]}, +${i * 25} XP`,
                reward: { resource: ['hout','steen','ijzer','goud','diamant'][i], amount: i * 3, xp: i * 25 }
            });
        }
    }

    const claimed = player.claimedBonuses || [];
    return bonuses.filter(b => !claimed.includes(b.id));
}

async function claimBonus(bonusId) {
    if (!currentPlayer) return;

    const bonuses = getAvailableBonuses(currentPlayer);
    const bonus = bonuses.find(b => b.id === bonusId);
    if (!bonus) return;

    // Initialize claimedBonuses array
    if (!currentPlayer.claimedBonuses) currentPlayer.claimedBonuses = [];
    currentPlayer.claimedBonuses.push(bonusId);

    // Apply reward
    const r = bonus.reward;
    if (r.resource) {
        currentPlayer.resources[r.resource] = (currentPlayer.resources[r.resource] || 0) + r.amount;
    }
    if (r.extra) {
        currentPlayer.resources[r.extra.resource] = (currentPlayer.resources[r.extra.resource] || 0) + r.extra.amount;
    }
    if (r.xp) {
        currentPlayer.xp += r.xp;
        const levelInfo = calculateLevel(currentPlayer.xp);
        currentPlayer.level = levelInfo.level;
        currentPlayer.xpToNext = levelInfo.xpToNext;
    }

    await savePlayer(currentPlayer);
    soundAchievement();
    showToast(`${bonus.icon} ${bonus.name} opgehaald!`);
    showInventory(); // Refresh
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
    // Generate stars for home screen background
    const starsContainer = document.getElementById('home-stars');
    if (!starsContainer) return;
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'home-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = 1 + Math.random() * 2;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 3) + 's';
        starsContainer.appendChild(star);
    }
}

