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
    const monthNames = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];

    // Find all months that have sessions, plus current month
    const monthsSet = new Set();
    const now = new Date();
    monthsSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    for (const s of allSessions) {
        if (s.date) monthsSet.add(s.date.substring(0, 7));
    }
    const months = [...monthsSet].sort().reverse(); // newest first

    let html = '';

    for (const monthKey of months) {
        const [year, monthNum] = monthKey.split('-').map(Number);
        const monthStart = `${monthKey}-01`;
        const nextMonth = monthNum === 12 ? `${year + 1}-01-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}-01`;

        html += `<div class="dash-card" style="margin-bottom:16px">`;
        html += `<h3>${monthNames[monthNum - 1]} ${year}</h3>`;
        html += '<div class="month-overview-table">';

        // Header
        html += `<div class="mo-row mo-header">
            <div class="mo-cell mo-name">Speler</div>
            <div class="mo-cell">Minuten</div>
            <div class="mo-cell">Sessies</div>
            <div class="mo-cell">WPM</div>
            <div class="mo-cell">Nauwk.</div>
        </div>`;

        for (const player of players) {
            const monthSessions = allSessions.filter(s =>
                s.playerId === player.id && s.date >= monthStart && s.date < nextMonth
            );
            const totalMinutes = Math.round(monthSessions.reduce((sum, s) => sum + (s.duration || 0), 0));
            const sessionCount = monthSessions.length;
            const avgWpm = sessionCount > 0
                ? Math.round(monthSessions.reduce((sum, s) => sum + s.wpm, 0) / sessionCount)
                : '-';
            const avgAcc = sessionCount > 0
                ? Math.round(monthSessions.reduce((sum, s) => sum + s.accuracy, 0) / sessionCount) + '%'
                : '-';

            html += `<div class="mo-row">
                <div class="mo-cell mo-name">${player.name}</div>
                <div class="mo-cell">${totalMinutes} min</div>
                <div class="mo-cell">${sessionCount}x</div>
                <div class="mo-cell">${avgWpm}</div>
                <div class="mo-cell">${avgAcc}</div>
            </div>`;
        }

        html += '</div></div>';
    }

    return html;
}

async function renderPlayerDetail(playerId) {
    const player = await getPlayer(playerId);
    if (!player) return '<p>Geen data gevonden.</p>';

    const sessions = await getPlayerSessions(playerId);
    const biome = BIOMES[player.currentBiome] || BIOMES[0];

    // Calculate goal progress
    const totalAllLessons = getTotalLessons();
    let completedLessons = 0;
    for (let b = 0; b < player.currentBiome; b++) {
        completedLessons += LESSON_SETS[b].lessons.length;
    }
    completedLessons += player.currentLesson;
    const overallPct = Math.round((completedLessons / totalAllLessons) * 100);

    const targetWpm = player.age <= 8 ? 30 : player.age <= 11 ? 45 : 60;
    const wpmPct = Math.min(100, Math.round((player.bestWpm / targetWpm) * 100));

    // Time-based expected progress (12 months from creation)
    const createdDate = new Date(player.createdAt);
    const now = new Date();
    const monthsElapsed = Math.max(0, (now - createdDate) / (1000 * 60 * 60 * 24 * 30));
    const expectedPct = Math.min(100, Math.round((monthsElapsed / 12) * 100));
    const onTrack = overallPct >= expectedPct - 10;

    let html = '';

    // Goal tracker card (full width)
    html += `
        <div class="dash-card" style="margin-bottom:16px">
            <h3>🏆 Einddoel: Blind Typen</h3>
            <div style="display:flex; gap:24px; margin-top:12px; flex-wrap:wrap">
                <div style="flex:1; min-width:200px">
                    <div style="font-size:11px; color:var(--text-secondary); margin-bottom:4px">Lesvoortgang</div>
                    <div style="display:flex; align-items:center; gap:8px">
                        <div style="flex:1; height:16px; background:#222; border:1px solid #444">
                            <div style="height:100%; width:${overallPct}%; background:linear-gradient(90deg, var(--green), var(--diamond)); transition:width 0.5s"></div>
                        </div>
                        <span style="font-size:14px; color:var(--gold); min-width:40px">${overallPct}%</span>
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:4px">Les ${completedLessons} van ${totalAllLessons} | Biome: ${biome.name}</div>
                </div>
                <div style="flex:1; min-width:200px">
                    <div style="font-size:11px; color:var(--text-secondary); margin-bottom:4px">WPM naar doel (${targetWpm} WPM)</div>
                    <div style="display:flex; align-items:center; gap:8px">
                        <div style="flex:1; height:16px; background:#222; border:1px solid #444">
                            <div style="height:100%; width:${wpmPct}%; background:linear-gradient(90deg, var(--blue), var(--diamond)); transition:width 0.5s"></div>
                        </div>
                        <span style="font-size:14px; color:var(--gold); min-width:40px">${wpmPct}%</span>
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:4px">Nu: ${player.bestWpm} WPM | Doel: ${targetWpm} WPM</div>
                </div>
            </div>
            <div style="margin-top:12px; padding-top:10px; border-top:1px solid #333; font-size:11px">
                <span style="color:${onTrack ? 'var(--green)' : 'var(--red)'}">
                    ${onTrack ? '✅ Op schema' : '⚠️ Achter op schema'}
                </span>
                <span style="color:var(--text-secondary)">
                    — Verwacht: ${expectedPct}% na ${Math.round(monthsElapsed)} maand(en) | Werkelijk: ${overallPct}%
                </span>
            </div>
        </div>
    `;

    html += '<div class="dashboard-cards">';

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
            <h3>Versie & Updates</h3>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:8px">
                <div>TypeCraft versie: <span style="color:var(--gold)">1.1.0</span></div>
                <div style="margin-top:6px; font-size:10px; color:#666">
                    Updates installeren: vervang de bestanden in de typing-map.<br>
                    Alle voortgang blijft bewaard (opgeslagen in browser).
                </div>
            </div>
        </div>
        <div class="dash-card" style="margin-top:16px">
            <h3>PIN Wijzigen</h3>
            <p style="font-size:10px; color:#666">
                PIN wijzigen wordt in een volgende versie toegevoegd.
            </p>
        </div>
        <div class="dash-card" style="margin-top:16px">
            <h3>Data Backup</h3>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px">
                <button class="btn-minecraft" onclick="exportData()" style="min-width:auto">
                    📦 Exporteer Backup
                </button>
                <button class="btn-minecraft" onclick="document.getElementById('import-file').click()" style="min-width:auto">
                    📥 Importeer Backup
                </button>
                <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)">
            </div>
            <p style="font-size:10px; color:#666; margin-top:8px">
                Maak regelmatig een backup vóór updates.
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

async function importData(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.players || !data.sessions) {
            showToast('❌ Ongeldig backup bestand');
            return;
        }

        if (!confirm(`Backup importeren van ${data.exportedAt || 'onbekend'}?\nDit overschrijft bestaande data!`)) {
            input.value = '';
            return;
        }

        // Import players
        for (const player of data.players) {
            await savePlayer(player);
        }

        // Import sessions
        const d = await openDB();
        for (const session of data.sessions) {
            await new Promise((resolve, reject) => {
                const tx = d.transaction('sessions', 'readwrite');
                tx.objectStore('sessions').put(session);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        }

        showToast('✅ Backup geïmporteerd!');
        input.value = '';
        renderParentDashboard('settings');
    } catch (e) {
        showToast('❌ Fout bij importeren: ' + e.message);
        input.value = '';
    }
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
