/* ===== TypeCraft Parent Dashboard ===== */

async function renderParentDashboard(tab) {
    const content = document.getElementById('parent-content');

    // Update tab active state
    document.querySelectorAll('.parent-tabs .tab').forEach(t => t.classList.remove('active'));
    const tabs = document.querySelectorAll('.parent-tabs .tab');
    const tabNames = ['overview', 'sebas', 'jonathan', 'benjamin', 'settings'];
    const tabIdx = tabNames.indexOf(tab);
    if (tabIdx >= 0 && tabs[tabIdx]) tabs[tabIdx].classList.add('active');

    if (tab === 'overview') {
        content.innerHTML = await renderOverview();
    } else if (tab === 'settings') {
        content.innerHTML = renderSettings();
    } else {
        content.innerHTML = await renderPlayerDetail(tab);
    }
}

async function renderOverview() {
    const players = await getAllPlayers();
    const allSessions = await getAllSessions();
    const today = getToday();

    // This week's sessions
    const weekSessions = allSessions.filter(s => daysBetween(s.date, today) <= 7);
    const todaySessions = allSessions.filter(s => s.date === today);

    // Family streak check
    const familyStreak = players.length === 3 && players.every(p => p.lastPracticeDate === today);

    let html = '<div class="dashboard-cards">';

    // Summary cards
    html += `
        <div class="dash-card">
            <h3>Vandaag Geoefend</h3>
            <div class="big-number">${todaySessions.length}</div>
            <div class="trend">${familyStreak ? '👨‍👧‍👦 Alle 3 vandaag geoefend!' : 'Nog niet iedereen vandaag'}</div>
        </div>
        <div class="dash-card">
            <h3>Sessies Deze Week</h3>
            <div class="big-number">${weekSessions.length}</div>
        </div>
    `;

    // Per player summary
    for (const player of players) {
        const sessions = await getPlayerSessions(player.id);
        const recent = sessions.slice(-5);
        const avgWpm = recent.length > 0
            ? Math.round(recent.reduce((s, r) => s + r.wpm, 0) / recent.length)
            : 0;
        const avgAcc = recent.length > 0
            ? Math.round(recent.reduce((s, r) => s + r.accuracy, 0) / recent.length)
            : 0;

        const biome = BIOMES[player.currentBiome] || BIOMES[0];
        const practicedToday = player.lastPracticeDate === today;

        html += `
            <div class="dash-card">
                <h3>${player.name} (${player.age} jaar)</h3>
                <div class="big-number">${avgWpm} <span style="font-size:14px">WPM</span></div>
                <div class="trend ${avgAcc >= 85 ? 'up' : 'down'}">
                    Nauwkeurigheid: ${avgAcc}% | Streak: ${player.streak} dagen
                </div>
                <div style="font-size:11px; margin-top:8px; color: var(--text-secondary)">
                    Biome: ${biome.name} | Level ${player.level} |
                    ${practicedToday ? '✅ Vandaag geoefend' : '❌ Nog niet geoefend'}
                </div>
            </div>
        `;
    }

    html += '</div>';

    // Weekly schedule
    html += '<div class="dash-card" style="margin-top:16px"><h3>Weekoverzicht</h3>';
    html += renderWeekSchedule(players, allSessions);
    html += '</div>';

    return html;
}

function renderWeekSchedule(players, sessions) {
    const today = new Date();
    const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

    let html = '<div class="schedule-grid">';

    // Header
    html += '<div class="schedule-cell header">Speler</div>';
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        html += `<div class="schedule-cell header">${dayNames[d.getDay()]}<br>${d.getDate()}</div>`;
    }

    // Player rows
    for (const player of players) {
        html += `<div class="schedule-cell header">${player.name}</div>`;
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const practiced = sessions.some(s => s.playerId === player.id && s.date === dateStr);
            html += `<div class="schedule-cell ${practiced ? 'done' : (i > 0 ? 'missed' : '')}">${practiced ? '✅' : (i > 0 ? '—' : '')}</div>`;
        }
    }

    html += '</div>';
    return html;
}

async function renderPlayerDetail(playerId) {
    const player = await getPlayer(playerId);
    if (!player) return '<p>Geen data gevonden.</p>';

    const sessions = await getPlayerSessions(playerId);
    const biome = BIOMES[player.currentBiome] || BIOMES[0];

    let html = '<div class="dashboard-cards">';

    // Stats overview
    html += `
        <div class="dash-card">
            <h3>Snelheid</h3>
            <div class="big-number">${player.bestWpm} <span style="font-size:14px">WPM best</span></div>
            <div class="trend">Totaal ${sessions.length} sessies</div>
        </div>
        <div class="dash-card">
            <h3>Nauwkeurigheid</h3>
            <div class="big-number">${player.bestAccuracy}%</div>
            <div class="trend">Beste score ooit</div>
        </div>
        <div class="dash-card">
            <h3>Voortgang</h3>
            <div class="big-number">Level ${player.level}</div>
            <div class="trend">Biome: ${biome.name} | Les ${player.currentLesson + 1}</div>
        </div>
        <div class="dash-card">
            <h3>Oefentijd</h3>
            <div class="big-number">${player.totalMinutes} <span style="font-size:14px">min</span></div>
            <div class="trend">Streak: ${player.streak} dagen</div>
        </div>
    `;

    html += '</div>';

    // WPM progress chart (text-based)
    if (sessions.length > 0) {
        html += '<div class="dash-card" style="margin-top:16px"><h3>WPM Voortgang (laatste 20 sessies)</h3>';
        html += renderWpmChart(sessions.slice(-20));
        html += '</div>';
    }

    // Keyboard heatmap
    html += '<div class="dash-card" style="margin-top:16px"><h3>Probleemtoetsen</h3>';
    html += renderKeyboardHeatmap(player.keyErrors);
    html += '</div>';

    // Achievements
    html += '<div class="dash-card" style="margin-top:16px"><h3>Achievements</h3>';
    html += '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px">';
    for (const ach of ACHIEVEMENTS) {
        const unlocked = player.achievements.includes(ach.id);
        html += `<div style="padding:6px 10px; background:${unlocked ? 'rgba(76,175,80,0.2)' : '#222'}; border:1px solid ${unlocked ? 'var(--green)' : '#444'}; font-size:11px; opacity:${unlocked ? '1' : '0.4'}">
            ${ach.icon} ${ach.name}
        </div>`;
    }
    html += '</div></div>';

    return html;
}

function renderWpmChart(sessions) {
    if (sessions.length === 0) return '<p style="font-size:11px; color:var(--text-secondary)">Nog geen data</p>';

    const maxWpm = Math.max(...sessions.map(s => s.wpm), 10);
    const barMaxHeight = 100;

    let html = '<div style="display:flex; align-items:flex-end; gap:4px; height:120px; margin-top:12px; padding-bottom:20px; position:relative">';

    sessions.forEach((s, i) => {
        const height = Math.max(4, (s.wpm / maxWpm) * barMaxHeight);
        const color = s.accuracy >= 90 ? 'var(--green)' : s.accuracy >= 80 ? 'var(--gold)' : 'var(--red)';
        html += `<div style="display:flex; flex-direction:column; align-items:center; flex:1">
            <div style="font-size:8px; color:var(--text-secondary); margin-bottom:2px">${s.wpm}</div>
            <div style="width:100%; max-width:30px; height:${height}px; background:${color}; border:1px solid rgba(255,255,255,0.2)"></div>
            <div style="font-size:7px; color:#666; margin-top:2px">${s.date.slice(5)}</div>
        </div>`;
    });

    html += '</div>';
    return html;
}

function renderKeyboardHeatmap(keyErrors) {
    const maxErrors = Math.max(...Object.values(keyErrors), 1);

    let html = '<div class="heatmap-keyboard">';

    KEYBOARD_LAYOUT.forEach(row => {
        html += '<div class="heatmap-row">';
        row.forEach(keyDef => {
            const errors = keyErrors[keyDef.key] || 0;
            const intensity = errors / maxErrors;
            const r = Math.round(244 * intensity);
            const g = Math.round(67 * intensity);
            const b = Math.round(54 * intensity);
            const bg = errors > 0 ? `rgb(${r}, ${g}, ${b})` : '#333';

            html += `<div class="heatmap-key" style="background:${bg}; ${keyDef.isSpace ? 'width:200px' : ''}" title="${keyDef.key}: ${errors} fouten">
                ${keyDef.isSpace ? 'SPATIE' : keyDef.key}
            </div>`;
        });
        html += '</div>';
    });

    html += '</div>';

    // Legend
    if (Object.keys(keyErrors).length > 0) {
        const sorted = Object.entries(keyErrors).sort((a, b) => b[1] - a[1]).slice(0, 5);
        html += '<div style="margin-top:12px; font-size:11px">';
        html += '<strong>Top 5 probleemtoetsen:</strong> ';
        html += sorted.map(([k, v]) => `<span class="problem-key">${k} (${v}x)</span>`).join(' ');
        html += '</div>';
    } else {
        html += '<p style="font-size:11px; color:var(--text-secondary); margin-top:8px">Nog geen foutdata</p>';
    }

    return html;
}

function renderSettings() {
    return `
        <div class="dash-card">
            <h3>PIN Wijzigen</h3>
            <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px">
                Huidige PIN: 1234 (standaard)
            </p>
            <p style="font-size:10px; color:#666">
                PIN wijzigen wordt in een volgende versie toegevoegd.
            </p>
        </div>
        <div class="dash-card" style="margin-top:16px">
            <h3>Sessieduur per Speler</h3>
            <div style="font-size:12px; margin-top:8px">
                <div style="margin:8px 0">Sebas: ${PLAYERS.sebas.sessionMinutes} minuten</div>
                <div style="margin:8px 0">Jonathan: ${PLAYERS.jonathan.sessionMinutes} minuten</div>
                <div style="margin:8px 0">Benjamin: ${PLAYERS.benjamin.sessionMinutes} minuten</div>
            </div>
        </div>
        <div class="dash-card" style="margin-top:16px">
            <h3>Handicap Multipliers</h3>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:8px">
                <div style="margin:6px 0">Sebas: ${PLAYERS.sebas.handicap}x (geen handicap)</div>
                <div style="margin:6px 0">Jonathan: ${PLAYERS.jonathan.handicap}x</div>
                <div style="margin:6px 0">Benjamin: ${PLAYERS.benjamin.handicap}x</div>
            </div>
            <p style="font-size:10px; color:#666; margin-top:12px">
                Handicaps zorgen ervoor dat jongere spelers eerlijk kunnen concurreren.
            </p>
        </div>
        <div class="dash-card" style="margin-top:16px">
            <h3>Data Exporteren</h3>
            <button class="btn-minecraft" onclick="exportData()" style="min-width:auto; margin-top:8px">
                📦 Exporteer als JSON
            </button>
        </div>
        <div class="dash-card" style="margin-top:16px">
            <h3>⚠️ Data Resetten</h3>
            <p style="font-size:10px; color:var(--red); margin:8px 0">
                Dit verwijdert alle voortgang permanent!
            </p>
            <button class="btn-minecraft" onclick="confirmResetData()" style="min-width:auto; background:var(--red); border-color:#f88 #a00 #a00 #f88">
                🗑️ Reset Alle Data
            </button>
        </div>
    `;
}

async function exportData() {
    const players = await getAllPlayers();
    const sessions = await getAllSessions();
    const data = { players, sessions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typecraft-backup-${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data geëxporteerd!');
}

function confirmResetData() {
    if (confirm('Weet je zeker dat je ALLE data wilt verwijderen? Dit kan niet ongedaan worden!')) {
        if (confirm('Echt zeker? Alle voortgang van alle spelers wordt gewist!')) {
            indexedDB.deleteDatabase(DB_NAME);
            db = null;
            location.reload();
        }
    }
}
