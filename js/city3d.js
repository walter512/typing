/* ===== TypeCraft 2D City Renderer ===== */
/* Renders a shared Minecraft-style city as a 2D side-view with stacking layers */

/* ===== Block Colors ===== */
const BLOCK_COLORS = {
    oak_planks:   '#b8945f',
    oak_log:      '#5c4633',
    cobblestone:  '#7a7a7a',
    stone_brick:  '#8a8a8a',
    glass:        '#aad7e6',
    door:         '#6b4226',
    roof_oak:     '#8d5524',
    roof_stone:   '#606060',
    hay:          '#c8a83e',
    water:        '#4090d0',
    dirt:         '#8b6c42',
    grass:        '#5d9e37',
    fence:        '#9e7e4a',
    bookshelf:    '#6b4226',
    crafting:     '#8b6c42',
    furnace:      '#5a5a5a',
    anvil:        '#444444',
    iron_block:   '#d8d8d8',
    gold_block:   '#f5d63d',
    diamond_block:'#54e5cc',
    obsidian:     '#1a0a2e',
    nether_brick: '#3a1e1e',
    end_stone:    '#dbd5a0',
    purpur:       '#a77ba7',
    lava:         '#e05500',
    red_wool:     '#a02020',
    torch:        '#ffcc00',
};

/* ===== City Layers ===== */
// 5 layers stacking upward, each with 3 buildings (one per player)
// Grid rows are top-to-bottom, null = empty/transparent
const CITY_LAYERS = [
    {
        name: 'Basis',
        icon: '🏕️',
        floorType: 'grass',
        buildings: [
            {
                id: 'houten_hut',
                name: 'Houten Hut',
                icon: '🏠',
                blocksNeeded: 6,
                material: 'hout',
                // 4 columns × 5 rows, rows top-to-bottom
                grid: [
                    [null,       'roof_oak',  'roof_oak',  null      ],
                    ['roof_oak', 'roof_oak',  'roof_oak',  'roof_oak'],
                    ['oak_log',  'glass',     'glass',     'oak_log' ],
                    ['oak_log',  'door',      null,        'oak_log' ],
                    ['oak_planks','oak_planks','oak_planks','oak_planks'],
                ]
            },
            {
                id: 'werkbank',
                name: 'Werkbank',
                icon: '🔨',
                blocksNeeded: 5,
                material: 'hout',
                // 3 columns × 3 rows
                grid: [
                    ['oak_planks', 'oak_planks', 'oak_planks'],
                    ['oak_log',    'crafting',   'oak_log'   ],
                    ['oak_planks', 'oak_planks', 'oak_planks'],
                ]
            },
            {
                id: 'boerderij',
                name: 'Boerderij',
                icon: '🌾',
                blocksNeeded: 6,
                material: 'hout',
                // 3 columns × 5 rows
                grid: [
                    [null,     null,  null  ],
                    ['oak_log',null,  'oak_log'],
                    ['oak_log','hay', 'oak_log'],
                    ['fence',  'hay', 'fence' ],
                    ['dirt',   'water','dirt' ],
                ]
            },
        ]
    },
    {
        name: 'Dorp',
        icon: '🏘️',
        floorType: 'cobblestone',
        buildings: [
            {
                id: 'stenen_huis',
                name: 'Stenen Huis',
                icon: '🏗️',
                blocksNeeded: 8,
                material: 'steen',
                // 4 columns × 5 rows
                grid: [
                    ['roof_stone','roof_stone','roof_stone','roof_stone'],
                    ['stone_brick','glass',    'glass',    'stone_brick'],
                    ['stone_brick','glass',    'glass',    'stone_brick'],
                    ['stone_brick','door',     null,       'stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'smederij',
                name: 'Smederij',
                icon: '⚒️',
                blocksNeeded: 8,
                material: 'steen',
                // 4 columns × 4 rows
                grid: [
                    ['roof_stone', 'roof_stone', 'roof_stone', 'roof_stone'],
                    ['stone_brick','furnace',    'anvil',      'stone_brick'],
                    ['stone_brick','door',       null,         'stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'bibliotheek',
                name: 'Bibliotheek',
                icon: '📚',
                blocksNeeded: 8,
                material: 'steen',
                // 4 columns × 4 rows
                grid: [
                    ['roof_oak',   'roof_oak',   'roof_oak',   'roof_oak'  ],
                    ['stone_brick','bookshelf',  'bookshelf',  'stone_brick'],
                    ['stone_brick','glass',      'door',       'stone_brick'],
                    ['oak_planks', 'oak_planks', 'oak_planks', 'oak_planks'],
                ]
            },
        ]
    },
    {
        name: 'Stad',
        icon: '🏙️',
        floorType: 'stone_brick',
        buildings: [
            {
                id: 'markt',
                name: 'Markt',
                icon: '🏪',
                blocksNeeded: 10,
                material: 'ijzer',
                // 4 columns × 5 rows
                grid: [
                    ['red_wool',   'red_wool',   'red_wool',   'red_wool'  ],
                    ['oak_log',    null,         null,         'oak_log'   ],
                    ['oak_log',    'crafting',   'crafting',   'oak_log'   ],
                    [null,         'crafting',   'crafting',   null        ],
                    ['cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'wachttoren',
                name: 'Wachttoren',
                icon: '🗼',
                blocksNeeded: 10,
                material: 'ijzer',
                // 3 columns × 6 rows
                grid: [
                    [null,         'torch',      null        ],
                    ['stone_brick','stone_brick','stone_brick'],
                    ['stone_brick','glass',      'stone_brick'],
                    ['stone_brick','glass',      'stone_brick'],
                    ['stone_brick','door',       'stone_brick'],
                    ['cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'mijnschacht',
                name: 'Mijnschacht',
                icon: '⛏️',
                blocksNeeded: 10,
                material: 'ijzer',
                // 4 columns × 4 rows
                grid: [
                    ['oak_planks', 'torch',      'torch',      'oak_planks'],
                    ['oak_log',    null,         null,         'oak_log'   ],
                    ['cobblestone','cobblestone','cobblestone','cobblestone'],
                    ['iron_block', 'iron_block', 'iron_block', 'iron_block'],
                ]
            },
        ]
    },
    {
        name: 'Vesting',
        icon: '🏰',
        floorType: 'nether_brick',
        buildings: [
            {
                id: 'kasteel',
                name: 'Kasteel',
                icon: '🏰',
                blocksNeeded: 12,
                material: 'goud',
                // 4 columns × 5 rows
                grid: [
                    ['stone_brick', null,         'stone_brick', null        ],
                    ['stone_brick','stone_brick', 'stone_brick', 'stone_brick'],
                    ['stone_brick','glass',       'glass',       'stone_brick'],
                    ['stone_brick','door',        null,          'stone_brick'],
                    ['cobblestone','cobblestone', 'cobblestone', 'cobblestone'],
                ]
            },
            {
                id: 'nether_portaal',
                name: 'Nether Portaal',
                icon: '🟣',
                blocksNeeded: 12,
                material: 'goud',
                // 4 columns × 5 rows
                grid: [
                    [null,      'obsidian','obsidian', null     ],
                    ['obsidian','lava',    'lava',     'obsidian'],
                    ['obsidian','lava',    'lava',     'obsidian'],
                    ['obsidian','lava',    'lava',     'obsidian'],
                    [null,      'obsidian','obsidian', null     ],
                ]
            },
            {
                id: 'tovenaarstoren',
                name: 'Tovenaarstoren',
                icon: '🧙',
                blocksNeeded: 12,
                material: 'goud',
                // 3 columns × 6 rows
                grid: [
                    [null,         'diamond_block', null        ],
                    ['purpur',     'purpur',        'purpur'    ],
                    ['purpur',     'glass',         'purpur'    ],
                    ['stone_brick','glass',         'stone_brick'],
                    ['stone_brick','stone_brick',   'stone_brick'],
                    ['gold_block', 'gold_block',    'gold_block' ],
                ]
            },
        ]
    },
    {
        name: 'Legende',
        icon: '🐉',
        floorType: 'end_stone',
        buildings: [
            {
                id: 'end_toren',
                name: 'End Toren',
                icon: '🗽',
                blocksNeeded: 15,
                material: 'diamant',
                // 4 columns × 6 rows
                grid: [
                    [null,      'purpur',   'purpur',    null     ],
                    ['purpur',  'purpur',   'purpur',    'purpur' ],
                    ['end_stone','glass',   'glass',     'end_stone'],
                    ['end_stone','glass',   'glass',     'end_stone'],
                    ['end_stone','door',    null,        'end_stone'],
                    ['end_stone','end_stone','end_stone','end_stone'],
                ]
            },
            {
                id: 'drakentroon',
                name: 'Drakentroon',
                icon: '🐉',
                blocksNeeded: 15,
                material: 'diamant',
                // 5 columns × 4 rows
                grid: [
                    ['purpur',   null,       'purpur',    null,       'purpur'  ],
                    [null,       'gold_block','gold_block','gold_block', null   ],
                    ['obsidian', null,       'gold_block', null,      'obsidian'],
                    ['end_stone','end_stone','end_stone', 'end_stone','end_stone'],
                ]
            },
            {
                id: 'beacon',
                name: 'Beacon',
                icon: '💡',
                blocksNeeded: 15,
                material: 'diamant',
                // 3 columns × 4 rows
                grid: [
                    [null,         'diamond_block', null       ],
                    ['glass',      'gold_block',    'glass'    ],
                    ['iron_block', 'diamond_block', 'iron_block'],
                    ['iron_block', 'iron_block',    'iron_block'],
                ]
            },
        ]
    },
];

/* ===== BUILDING_PROJECTS — backward compatibility flat array ===== */
const BUILDING_PROJECTS = (function() {
    const projects = [];
    CITY_LAYERS.forEach((layer, layerIdx) => {
        const xp = 50 + layerIdx * 50;
        layer.buildings.forEach(b => {
            projects.push({
                id: b.id,
                name: b.name,
                icon: b.icon,
                biome: layerIdx,         // layer index maps to biome
                blocksNeeded: b.blocksNeeded,
                material: b.material,
                layer: layerIdx,
                desc: `Bouw de ${b.name} voor je stad!`,
                color: BLOCK_COLORS[b.material] || '#888',
                reward: { xp, item: null },
            });
        });
    });
    return projects;
})();

/* ===== BUILDING_POSITIONS — kept for backward compat, empty ===== */
const BUILDING_POSITIONS = {};

/* ===== Player Color ===== */
function getPlayerColor(playerId) {
    const colors = { sebas: '#4caf50', jonathan: '#2196f3', benjamin: '#ff9800' };
    return colors[playerId] || '#888';
}

/* ===== Layer Unlock Config ===== */
// Each layer opens after N days since game start, OR immediately if all 3
// players completed a building in the previous layer (whichever comes first).
const LAYER_UNLOCK_DAYS = [0, 14, 28, 42, 56]; // days after game start

function getGameStartDate(playerDataMap) {
    // The earliest lastLogin across all players serves as game start
    let earliest = null;
    for (const pd of Object.values(playerDataMap)) {
        if (pd && pd.world && pd.world.lastLogin) {
            if (!earliest || pd.world.lastLogin < earliest) {
                earliest = pd.world.lastLogin;
            }
        }
    }
    return earliest || getToday();
}

/* ===== Layer Status ===== */
function getLayerStatus(layerIndex, playerDataMap) {
    const layer = CITY_LAYERS[layerIndex];
    if (!layer) return { unlocked: false, complete: false, claims: {} };

    // Layer 0 is always unlocked
    let unlocked = layerIndex === 0;
    if (layerIndex > 0) {
        // Unlock method 1: time-based (every 2 weeks)
        const startDate = getGameStartDate(playerDataMap);
        const daysSinceStart = daysBetween(startDate, getToday());
        const timeUnlocked = daysSinceStart >= (LAYER_UNLOCK_DAYS[layerIndex] || 999);

        // Unlock method 2: all 3 players completed a building in the previous layer
        const prevLayer = CITY_LAYERS[layerIndex - 1];
        const allCompleted = Object.values(playerDataMap).every(playerData => {
            if (!playerData || !playerData.world || !playerData.world.buildings) return false;
            return prevLayer.buildings.some(b => {
                const building = playerData.world.buildings.find(bld => bld.projectId === b.id);
                return building && building.completed;
            });
        });

        unlocked = timeUnlocked || allCompleted;
    }

    // Build claims map: buildingId -> { playerId, playerName, blocksPlaced, completed }
    const claims = {};
    for (const [playerId, playerData] of Object.entries(playerDataMap)) {
        if (!playerData || !playerData.world || !playerData.world.buildings) continue;
        for (const b of layer.buildings) {
            const building = playerData.world.buildings.find(bld => bld.projectId === b.id);
            if (building) {
                claims[b.id] = {
                    playerId,
                    playerName: playerData.name || playerId,
                    blocksPlaced: building.blocksPlaced || 0,
                    completed: building.completed || false,
                };
            }
        }
    }

    const complete = layer.buildings.every(b => claims[b.id] && claims[b.id].completed);

    return { unlocked, complete, claims };
}

/* ===== Render Building Sprite ===== */
function renderBuildingSprite(building, blocksPlaced, blocksNeeded) {
    const grid = building.grid;
    if (!grid || grid.length === 0) return '<div></div>';

    const rows = grid.length;
    const cols = grid[0].length;
    const blockSize = 36;

    // Count total non-null blocks in the grid
    let totalGridBlocks = 0;
    for (const row of grid) {
        for (const cell of row) {
            if (cell) totalGridBlocks++;
        }
    }

    // Determine progress fraction
    const fraction = blocksNeeded > 0 ? Math.min(1, blocksPlaced / blocksNeeded) : 0;
    const solidGridBlocks = Math.round(fraction * totalGridBlocks);

    // Count blocks bottom-to-top to determine which are solid
    // Build list of non-null cells bottom-to-top, left-to-right
    const blockCells = [];
    for (let r = rows - 1; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) {
                blockCells.push({ r, c });
            }
        }
    }

    // Mark which cells are solid
    const solidSet = new Set();
    for (let i = 0; i < solidGridBlocks && i < blockCells.length; i++) {
        solidSet.add(`${blockCells[i].r},${blockCells[i].c}`);
    }

    let html = `<div class="building-sprite" style="
        grid-template-columns: repeat(${cols}, ${blockSize}px);
        grid-template-rows: repeat(${rows}, ${blockSize}px);
        width: ${cols * blockSize + (cols - 1)}px;
        height: ${rows * blockSize + (rows - 1)}px;
    ">`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const blockType = grid[r][c];
            if (!blockType) {
                html += `<div class="city-block empty" style="width:${blockSize}px;height:${blockSize}px;"></div>`;
            } else {
                const color = BLOCK_COLORS[blockType] || '#888';
                const isSolid = solidSet.has(`${r},${c}`);
                const stateClass = isSolid ? 'solid' : 'ghost';
                html += `<div class="city-block ${stateClass}" style="
                    width:${blockSize}px;
                    height:${blockSize}px;
                    background:${color};
                "></div>`;
            }
        }
    }

    html += '</div>';
    return html;
}

/* ===== Handle Building Click ===== */
function handleBuildingClick(buildingId, layerIndex) {
    if (!currentPlayer) return;

    // Check if player already has a different active unfinished building (1 at a time)
    const hasActiveOther = currentPlayer.world.buildings.find(
        b => b.projectId !== buildingId && !b.completed && currentPlayer.world.activeProject === b.projectId
    );
    if (hasActiveOther) {
        showToast('⛏️ Maak eerst je huidige gebouw af!');
        return;
    }

    // Check if it's the player's building in progress
    const building = currentPlayer.world.buildings.find(b => b.projectId === buildingId);
    if (building && !building.completed) {
        if (currentPlayer.world.activeProject === buildingId) {
            startBuildSession();
        } else {
            currentPlayer.world.activeProject = buildingId;
            savePlayer(currentPlayer).then(() => {
                updateWorldScreen();
                showToast('⛏️ Gebouw geselecteerd!');
            });
        }
        return;
    }

    if (building && building.completed) {
        showToast('✅ Dit gebouw is al af!');
        return;
    }

    // Unclaimed — check if layer is unlocked, then claim it
    getLayerStatusForCurrentPlayer(layerIndex).then(status => {
        if (!status.unlocked) {
            showToast('🔒 Deze laag is nog niet geopend!');
            return;
        }
        // Check not claimed by another player
        if (status.claims[buildingId] && status.claims[buildingId].playerId !== currentPlayer.id) {
            showToast(`⛏️ ${status.claims[buildingId].playerName} bouwt dit al!`);
            return;
        }
        selectBuildProject(buildingId);
    });
}

async function getLayerStatusForCurrentPlayer(layerIndex) {
    const playerDataMap = {};
    for (const id of Object.keys(PLAYERS)) {
        playerDataMap[id] = await getPlayer(id);
    }
    return getLayerStatus(layerIndex, playerDataMap);
}

/* ===== Render City ===== */
async function renderCity(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Load all player data
    const playerDataMap = {};
    for (const id of Object.keys(PLAYERS)) {
        playerDataMap[id] = await getPlayer(id);
    }

    // Compute layer statuses
    const layerStatuses = CITY_LAYERS.map((_, i) => getLayerStatus(i, playerDataMap));

    // City stats
    let totalCompleted = 0;
    let totalBuildings = 0;
    for (const layer of CITY_LAYERS) {
        totalBuildings += layer.buildings.length;
        for (const b of layer.buildings) {
            for (const pd of Object.values(playerDataMap)) {
                if (pd && pd.world && pd.world.buildings) {
                    const bld = pd.world.buildings.find(x => x.projectId === b.id);
                    if (bld && bld.completed) totalCompleted++;
                }
            }
        }
    }

    let html = '';

    // City header
    const completedPct = totalBuildings > 0 ? Math.round((totalCompleted / totalBuildings) * 100) : 0;
    html += `<div class="city-header-bar">
        <div class="city-title">🏘️ Ons Dorp</div>
        <div class="city-total-progress">
            <div class="city-total-fill" style="width:${completedPct}%"></div>
            <span>${totalCompleted}/${totalBuildings}</span>
        </div>
    </div>`;

    // Layers (stacking bottom to top = rendered top to bottom with column-reverse)
    html += '<div class="city-layers">';

    for (let layerIdx = 0; layerIdx < CITY_LAYERS.length; layerIdx++) {
        const layer = CITY_LAYERS[layerIdx];
        const status = layerStatuses[layerIdx];

        if (!status.unlocked) {
            // Show locked bar with unlock info
            const startDate = getGameStartDate(playerDataMap);
            const daysLeft = Math.max(0, (LAYER_UNLOCK_DAYS[layerIdx] || 0) - daysBetween(startDate, getToday()));
            const prevLayer = layerIdx > 0 ? CITY_LAYERS[layerIdx - 1] : null;
            const hintParts = [];
            if (daysLeft > 0) hintParts.push(`Opent over ${daysLeft} dagen`);
            if (prevLayer) hintParts.push(`of als alle 3 spelers ${prevLayer.name} voltooien`);
            html += `<div class="city-layer locked">
                <div class="layer-lock">🔒 ${layer.icon} ${layer.name}</div>
                ${hintParts.length ? `<div class="layer-lock-hint">${hintParts.join(' ')}</div>` : ''}
            </div>`;
        } else {
            // Render active/complete layer
            html += `<div class="city-layer ${status.complete ? 'complete' : ''}">`;
            if (status.complete) {
                html += `<div class="layer-complete-banner">✅ ${layer.icon} ${layer.name} Voltooid!</div>`;
            }

            // Layer floor
            const floorColor = BLOCK_COLORS[layer.floorType] || '#888';
            html += `<div class="layer-floor" style="--floor-color:${floorColor}">`;
            for (let i = 0; i < 30; i++) {
                html += `<div class="floor-block" style="background:${floorColor}"></div>`;
            }
            html += '</div>';

            // Buildings row
            html += '<div class="layer-buildings">';
            for (const building of layer.buildings) {
                const claim = status.claims[building.id];
                const blocksPlaced = claim ? claim.blocksPlaced : 0;
                const isCompleted = claim && claim.completed;

                // Player badge
                let playerBadge = '';
                if (claim) {
                    const color = getPlayerColor(claim.playerId);
                    const initial = (claim.playerName || claim.playerId).charAt(0).toUpperCase();
                    playerBadge = `<div class="building-player" style="background:${color}">${initial}</div>`;
                }

                // Progress bar
                const pct = building.blocksNeeded > 0 ? Math.min(100, Math.round((blocksPlaced / building.blocksNeeded) * 100)) : 0;
                const progressBar = !isCompleted && claim
                    ? `<div class="building-progress"><div class="building-progress-fill" style="width:${pct}%"></div></div>`
                    : '';

                html += `<div class="city-building-slot" onclick="handleBuildingClick('${building.id}', ${layerIdx})">
                    ${renderBuildingSprite(building, blocksPlaced, building.blocksNeeded)}
                    <div class="building-name">${building.icon} ${building.name}</div>
                    ${playerBadge}
                    ${progressBar}
                </div>`;
            }
            html += '</div>'; // layer-buildings
            html += '</div>'; // city-layer
        }
    }

    html += '</div>'; // city-layers

    // Ground — grass blocks
    html += `<div class="city-ground-2d">
        <div class="ground-row">`;
    for (let i = 0; i < 40; i++) {
        html += `<div class="ground-block" style="background:#5d9e37"></div>`;
    }
    html += '</div><div class="ground-row">';
    for (let i = 0; i < 40; i++) {
        html += `<div class="ground-block" style="background:#8b6c42"></div>`;
    }
    html += '</div></div>'; // ground rows + city-ground-2d

    // Player chips
    html += '<div class="city-players">';
    for (const [id, info] of Object.entries(PLAYERS)) {
        const pd = playerDataMap[id];
        const buildingCount = pd?.world?.buildings?.filter(b => b.completed).length || 0;
        const inProgress = pd?.world?.buildings?.find(b => !b.completed);
        const activeProject = inProgress ? BUILDING_PROJECTS.find(p => p.id === inProgress.projectId) : null;
        html += `<div class="city-player-chip" style="border-color:${getPlayerColor(id)}">
            <span class="city-player-avatar" style="background:${getPlayerColor(id)}">${info.name.charAt(0)}</span>
            <span class="city-player-name">${info.name}</span>
            <span class="city-player-stat">${buildingCount} gebouwd</span>
            ${activeProject ? `<span class="city-player-building">⛏ ${activeProject.name}</span>` : ''}
        </div>`;
    }
    html += '</div>'; // city-players

    container.innerHTML = html;
}

/* ===== renderCity3D — alias for backward compat ===== */
async function renderCity3D(containerId) {
    return renderCity(containerId);
}

/* ===== Backward Compat Stubs ===== */

function countBlueprintBlocks(buildingId) {
    for (const layer of CITY_LAYERS) {
        const building = layer.buildings.find(b => b.id === buildingId);
        if (building) return building.blocksNeeded;
    }
    return 0;
}

function getBlueprintBlockList(buildingId) {
    for (const layer of CITY_LAYERS) {
        const building = layer.buildings.find(b => b.id === buildingId);
        if (building && building.grid) {
            const blocks = [];
            const rows = building.grid.length;
            for (let r = rows - 1; r >= 0; r--) {
                const row = building.grid[r];
                for (let c = 0; c < row.length; c++) {
                    if (row[c]) blocks.push({ x: c, y: rows - 1 - r, z: 0, type: row[c] });
                }
            }
            return blocks;
        }
    }
    return [];
}

function renderBuilding(buildingId, blocksPlaced, totalBlocks) {
    for (const layer of CITY_LAYERS) {
        const building = layer.buildings.find(b => b.id === buildingId);
        if (building) {
            return renderBuildingSprite(building, blocksPlaced, totalBlocks || building.blocksNeeded);
        }
    }
    return '';
}

function animateNewBlock(buildingId, blocksPlaced, totalBlocks) {
    const structure = document.getElementById('build-structure');
    if (!structure) return;

    // Find building
    let building = null;
    for (const layer of CITY_LAYERS) {
        building = layer.buildings.find(b => b.id === buildingId);
        if (building) break;
    }
    if (!building) return;

    // Re-render the sprite with updated progress
    structure.innerHTML = renderBuildingSprite(building, blocksPlaced, totalBlocks || building.blocksNeeded);
}

function renderTypingBuildPreview(buildingId, blocksPlaced, totalBlocks) {
    return renderBuilding(buildingId, blocksPlaced, totalBlocks);
}

/* ===== handleCityBuildingClick — old name alias ===== */
function handleCityBuildingClick(buildingId) {
    if (!currentPlayer) return;
    // Find which layer this building is in
    for (let i = 0; i < CITY_LAYERS.length; i++) {
        if (CITY_LAYERS[i].buildings.find(b => b.id === buildingId)) {
            handleBuildingClick(buildingId, i);
            return;
        }
    }
}
