/* ===== TypeCraft 3D Isometric City Renderer ===== */
/* Renders a shared Minecraft-style city using CSS isometric projection */

const ISO = {
    BLOCK_W: 32,   // isometric block width
    BLOCK_H: 16,   // isometric block height (half width for true iso)
    BLOCK_D: 20,   // block depth (visible side height)
    GROUND_COLS: 20,
    GROUND_ROWS: 12,
};

// Minecraft block palette — CSS colors for top/left/right faces
const BLOCK_TYPES = {
    oak_planks:   { top: '#b8945f', left: '#96763a', right: '#a6843e', label: 'Eiken Planken' },
    oak_log:      { top: '#a68a53', left: '#4a3728', right: '#5c4633', label: 'Eiken Stam' },
    cobblestone:  { top: '#7a7a7a', left: '#5c5c5c', right: '#6a6a6a', label: 'Kasseien' },
    stone_brick:  { top: '#8a8a8a', left: '#6e6e6e', right: '#7a7a7a', label: 'Steenbakstenen' },
    sandstone:    { top: '#e8d5a3', left: '#c4a96e', right: '#d4bb82', label: 'Zandsteen' },
    nether_brick: { top: '#3a1e1e', left: '#2c1515', right: '#331a1a', label: 'Netherbaksteen' },
    obsidian:     { top: '#1a0a2e', left: '#0d0518', right: '#120720', label: 'Obsidiaan' },
    end_stone:    { top: '#dbd5a0', left: '#c4be8a', right: '#cfc993', label: 'Endsteen' },
    purpur:       { top: '#a77ba7', left: '#8a5e8a', right: '#996b99', label: 'Purpur' },
    glass:        { top: 'rgba(170,215,230,0.45)', left: 'rgba(140,185,200,0.35)', right: 'rgba(155,200,215,0.4)', label: 'Glas' },
    door:         { top: '#6b4226', left: '#55341d', right: '#603b22', label: 'Deur' },
    fence:        { top: '#b8945f', left: '#7a5c2e', right: '#8a6c3e', label: 'Hek' },
    hay:          { top: '#c8a83e', left: '#a08030', right: '#b49035', label: 'Hooi' },
    water:        { top: 'rgba(40,100,200,0.6)', left: 'rgba(30,80,170,0.5)', right: 'rgba(35,90,185,0.55)', label: 'Water' },
    lava:         { top: '#e05500', left: '#c04000', right: '#d04a00', label: 'Lava' },
    grass:        { top: '#5d9e37', left: '#8b6c42', right: '#7a5e38', label: 'Gras' },
    dirt:         { top: '#8b6c42', left: '#6e5530', right: '#7a5e38', label: 'Aarde' },
    bookshelf:    { top: '#b8945f', left: '#6b4226', right: '#7a5030', label: 'Boekenkast' },
    iron_block:   { top: '#d8d8d8', left: '#b0b0b0', right: '#c0c0c0', label: 'IJzerblok' },
    gold_block:   { top: '#f5d63d', left: '#c4a520', right: '#d9b82c', label: 'Goudblok' },
    diamond_block:{ top: '#54e5cc', left: '#38b8a0', right: '#45cdb2', label: 'Diamantblok' },
    crafting:     { top: '#b8945f', left: '#6e5530', right: '#8b6c42', label: 'Werkbank' },
    furnace:      { top: '#7a7a7a', left: '#5a5a5a', right: '#6a6a6a', label: 'Oven' },
    torch:        { top: '#ffcc00', left: '#cc8800', right: '#dd9900', label: 'Toorts' },
    roof_oak:     { top: '#8d5524', left: '#6e3e18', right: '#7a481e', label: 'Eiken Dak' },
    roof_stone:   { top: '#606060', left: '#484848', right: '#545454', label: 'Stenen Dak' },
    red_wool:     { top: '#a02020', left: '#802020', right: '#901818', label: 'Rood Wol' },
    white_wool:   { top: '#e8e8e8', left: '#c8c8c8', right: '#d8d8d8', label: 'Wit Wol' },
    anvil:        { top: '#444444', left: '#2a2a2a', right: '#363636', label: 'Aambeeld' },
};

// Building blueprints — 3D voxel arrays [layer][row][col]
// Each layer is one Y level from bottom to top
// null = empty, string = block type
const BUILDING_BLUEPRINTS = {
    hut: {
        layers: [
            // Floor
            [['oak_planks','oak_planks','oak_planks','oak_planks'],
             ['oak_planks','oak_planks','oak_planks','oak_planks']],
            // Walls
            [['oak_log','oak_planks','oak_planks','oak_log'],
             ['oak_log','door',null,'oak_log']],
            // Walls + window
            [['oak_log','glass','glass','oak_log'],
             ['oak_log',null,null,'oak_log']],
            // Roof
            [['roof_oak','roof_oak','roof_oak','roof_oak'],
             ['roof_oak','roof_oak','roof_oak','roof_oak']],
        ]
    },
    werkbank: {
        layers: [
            [['oak_planks','oak_planks'],
             ['oak_planks','oak_planks']],
            [['oak_log',null],
             [null,'crafting']],
        ]
    },
    hek: {
        layers: [
            [['fence','fence','fence','fence','fence','fence']],
            [['fence',null,null,null,null,'fence']],
        ]
    },
    farm: {
        layers: [
            [['dirt','dirt','dirt','dirt'],
             ['water','dirt','dirt','water']],
            [[null,'hay','hay',null],
             [null,null,null,null]],
        ]
    },
    stenen_huis: {
        layers: [
            [['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
             ['cobblestone','oak_planks','oak_planks','oak_planks','cobblestone'],
             ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone']],
            [['stone_brick','stone_brick','glass','stone_brick','stone_brick'],
             ['stone_brick',null,null,null,'stone_brick'],
             ['stone_brick','door',null,'stone_brick','stone_brick']],
            [['stone_brick','glass',null,'glass','stone_brick'],
             ['stone_brick',null,null,null,'stone_brick'],
             ['stone_brick',null,null,null,'stone_brick']],
            [['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
             ['stone_brick',null,null,null,'stone_brick'],
             ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick']],
            [['roof_stone','roof_stone','roof_stone','roof_stone','roof_stone'],
             ['roof_stone','roof_stone','roof_stone','roof_stone','roof_stone'],
             ['roof_stone','roof_stone','roof_stone','roof_stone','roof_stone']],
        ]
    },
    bibliotheek: {
        layers: [
            [['oak_planks','oak_planks','oak_planks'],
             ['oak_planks','oak_planks','oak_planks'],
             ['oak_planks','oak_planks','oak_planks']],
            [['stone_brick','bookshelf','stone_brick'],
             ['stone_brick',null,'stone_brick'],
             ['stone_brick','door','stone_brick']],
            [['stone_brick','bookshelf','stone_brick'],
             ['glass',null,'glass'],
             ['stone_brick',null,'stone_brick']],
            [['roof_oak','roof_oak','roof_oak'],
             ['roof_oak','roof_oak','roof_oak'],
             ['roof_oak','roof_oak','roof_oak']],
        ]
    },
    smederij: {
        layers: [
            [['cobblestone','cobblestone','cobblestone'],
             ['cobblestone','cobblestone','cobblestone'],
             ['cobblestone','cobblestone','cobblestone']],
            [['stone_brick','iron_block','stone_brick'],
             ['stone_brick',null,'stone_brick'],
             ['stone_brick','door','stone_brick']],
            [['stone_brick','furnace','stone_brick'],
             ['stone_brick',null,'stone_brick'],
             ['stone_brick',null,'stone_brick']],
            [['roof_stone','roof_stone','roof_stone'],
             ['roof_stone','anvil','roof_stone'],
             ['roof_stone','roof_stone','roof_stone']],
        ]
    },
    wachttoren: {
        layers: [
            [['cobblestone','cobblestone'],
             ['cobblestone','cobblestone']],
            [['stone_brick','stone_brick'],
             ['stone_brick','door']],
            [['stone_brick','stone_brick'],
             ['stone_brick','stone_brick']],
            [['stone_brick','glass'],
             ['glass','stone_brick']],
            [['stone_brick','stone_brick'],
             ['stone_brick','stone_brick']],
            [['stone_brick','torch'],
             ['torch','stone_brick']],
            [['roof_stone','roof_stone'],
             ['roof_stone','roof_stone']],
        ]
    },
    piramide: {
        layers: [
            [['sandstone','sandstone','sandstone','sandstone','sandstone','sandstone'],
             ['sandstone','sandstone','sandstone','sandstone','sandstone','sandstone'],
             ['sandstone','sandstone','sandstone','sandstone','sandstone','sandstone'],
             ['sandstone','sandstone','sandstone','sandstone','sandstone','sandstone']],
            [[null,'sandstone','sandstone','sandstone','sandstone',null],
             [null,'sandstone','gold_block','gold_block','sandstone',null],
             [null,'sandstone','sandstone','sandstone','sandstone',null]],
            [[null,null,'sandstone','sandstone',null,null],
             [null,null,'sandstone','sandstone',null,null]],
            [[null,null,null,'gold_block',null,null]],
        ]
    },
    oase: {
        layers: [
            [['grass','grass','water','water'],
             ['grass','water','water','grass']],
            [[null,null,null,null],
             [null,null,null,null]],
        ]
    },
    markt: {
        layers: [
            [['sandstone','sandstone','sandstone','sandstone'],
             ['sandstone','oak_planks','oak_planks','sandstone'],
             ['sandstone','sandstone','sandstone','sandstone']],
            [['oak_log',null,null,'oak_log'],
             [null,null,null,null],
             ['oak_log',null,null,'oak_log']],
            [['red_wool','red_wool','red_wool','red_wool'],
             ['red_wool','red_wool','red_wool','red_wool'],
             ['red_wool','red_wool','red_wool','red_wool']],
        ]
    },
    nether_poort: {
        layers: [
            [[null,'obsidian','obsidian',null],
             [null,null,null,null]],
            [['obsidian','lava','lava','obsidian'],
             [null,null,null,null]],
            [['obsidian','lava','lava','obsidian'],
             [null,null,null,null]],
            [['obsidian','lava','lava','obsidian'],
             [null,null,null,null]],
            [[null,'obsidian','obsidian',null],
             [null,null,null,null]],
        ]
    },
    vesting: {
        layers: [
            [['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick'],
             ['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick'],
             ['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick']],
            [['nether_brick','nether_brick',null,null,'nether_brick','nether_brick'],
             ['nether_brick',null,null,null,null,'nether_brick'],
             ['nether_brick','nether_brick','door',null,'nether_brick','nether_brick']],
            [['nether_brick',null,null,null,null,'nether_brick'],
             [null,null,null,null,null,null],
             ['nether_brick',null,null,null,null,'nether_brick']],
            [['nether_brick','lava',null,null,'lava','nether_brick'],
             [null,null,null,null,null,null],
             ['nether_brick',null,null,null,null,'nether_brick']],
            [['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick'],
             ['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick'],
             ['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick']],
        ]
    },
    end_toren: {
        layers: [
            [['end_stone','end_stone','end_stone','end_stone'],
             ['end_stone','end_stone','end_stone','end_stone']],
            [['end_stone','purpur','purpur','end_stone'],
             ['end_stone','purpur','purpur','end_stone']],
            [['purpur','end_stone','end_stone','purpur'],
             ['purpur','end_stone','end_stone','purpur']],
            [['end_stone','glass','glass','end_stone'],
             ['end_stone','glass','glass','end_stone']],
            [['purpur','purpur','purpur','purpur'],
             ['purpur','purpur','purpur','purpur']],
            [['end_stone','end_stone','end_stone','end_stone'],
             ['end_stone','end_stone','end_stone','end_stone']],
            [[null,'purpur','purpur',null],
             [null,'purpur','purpur',null]],
            [[null,'diamond_block','diamond_block',null]],
        ]
    },
    drakentroon: {
        layers: [
            [['end_stone','end_stone','end_stone','end_stone','end_stone'],
             ['end_stone','obsidian','obsidian','obsidian','end_stone'],
             ['end_stone','end_stone','end_stone','end_stone','end_stone']],
            [['purpur',null,null,null,'purpur'],
             [null,null,'gold_block',null,null],
             ['purpur',null,null,null,'purpur']],
            [['purpur',null,null,null,'purpur'],
             [null,null,null,null,null],
             ['purpur',null,null,null,'purpur']],
            [['diamond_block',null,null,null,'diamond_block'],
             [null,null,null,null,null],
             ['diamond_block',null,null,null,'diamond_block']],
        ]
    },
};

// Building positions in the isometric world grid (col, row on the ground plane)
const BUILDING_POSITIONS = {
    // Plains buildings - front of village
    hut:          { col: 3, row: 5 },
    werkbank:     { col: 8, row: 6 },
    hek:          { col: 1, row: 8 },
    farm:         { col: 12, row: 7 },
    // Forest - middle area
    stenen_huis:  { col: 7, row: 3 },
    bibliotheek:  { col: 12, row: 3 },
    smederij:     { col: 2, row: 2 },
    wachttoren:   { col: 16, row: 4 },
    // Desert - left side
    piramide:     { col: 0, row: 0 },
    oase:         { col: 6, row: 0 },
    markt:        { col: 10, row: 0 },
    // Nether - right side
    nether_poort: { col: 15, row: 1 },
    vesting:      { col: 14, row: 7 },
    // End - center back
    end_toren:    { col: 9, row: 1 },
    drakentroon:  { col: 5, row: 9 },
};

// Count total blocks in a blueprint
function countBlueprintBlocks(buildingId) {
    const bp = BUILDING_BLUEPRINTS[buildingId];
    if (!bp) return 0;
    let count = 0;
    for (const layer of bp.layers) {
        for (const row of layer) {
            for (const cell of row) {
                if (cell) count++;
            }
        }
    }
    return count;
}

// Get ordered list of blocks for a blueprint (bottom-to-top, back-to-front)
function getBlueprintBlockList(buildingId) {
    const bp = BUILDING_BLUEPRINTS[buildingId];
    if (!bp) return [];
    const blocks = [];
    for (let y = 0; y < bp.layers.length; y++) {
        const layer = bp.layers[y];
        for (let r = 0; r < layer.length; r++) {
            const row = layer[r];
            for (let c = 0; c < row.length; c++) {
                if (row[c]) {
                    blocks.push({ x: c, y, z: r, type: row[c] });
                }
            }
        }
    }
    return blocks;
}

// Convert isometric grid coords to screen pixel position
function isoToScreen(col, row, layer) {
    const x = (col - row) * (ISO.BLOCK_W / 2);
    const y = (col + row) * (ISO.BLOCK_H / 2) - (layer * ISO.BLOCK_D);
    return { x, y };
}

// Render a single isometric block as HTML
function renderIsoBlock(blockType, col, row, layer, extraClass = '', opacity = 1) {
    const bt = BLOCK_TYPES[blockType];
    if (!bt) return '';
    const pos = isoToScreen(col, row, layer);
    const w = ISO.BLOCK_W;
    const h = ISO.BLOCK_H;
    const d = ISO.BLOCK_D;

    return `<div class="iso-block ${extraClass}" style="
        left:${pos.x}px; top:${pos.y}px; opacity:${opacity};
        --bt:${bt.top}; --bl:${bt.left}; --br:${bt.right};
        width:${w}px; height:${d + h}px;
    " data-type="${blockType}">
        <div class="iso-top" style="background:${bt.top}"></div>
        <div class="iso-left" style="background:${bt.left}"></div>
        <div class="iso-right" style="background:${bt.right}"></div>
    </div>`;
}

// Render a complete building
function renderBuilding(buildingId, blocksPlaced, totalBlocks) {
    const bp = BUILDING_BLUEPRINTS[buildingId];
    if (!bp) return '';

    const blockList = getBlueprintBlockList(buildingId);
    let html = '';

    // Determine how many blocks to show based on progress
    const blocksToShow = Math.min(blockList.length,
        Math.round((blocksPlaced / totalBlocks) * blockList.length));

    // Render ghost blocks (unfilled) first
    for (let i = blocksToShow; i < blockList.length; i++) {
        const b = blockList[i];
        html += renderIsoBlock(b.type, b.x, b.z, b.y, 'ghost', 0.12);
    }

    // Render filled blocks
    for (let i = 0; i < blocksToShow; i++) {
        const b = blockList[i];
        html += renderIsoBlock(b.type, b.x, b.z, b.y, 'filled', 1);
    }

    return html;
}

// Render the full shared city
async function renderCity3D(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Load all players' buildings
    const allBuildings = {};
    for (const [id, info] of Object.entries(PLAYERS)) {
        const player = await getPlayer(id);
        if (player && player.world && player.world.buildings) {
            for (const b of player.world.buildings) {
                allBuildings[b.projectId] = { ...b, playerId: id, playerName: info.name };
            }
        }
    }

    // Calculate city stats
    const completedCount = Object.values(allBuildings).filter(b => b.completed).length;
    const totalProjects = BUILDING_PROJECTS.length;

    // Build the scene
    let html = '';

    // Sky with gradient and clouds
    html += '<div class="city-sky">';
    html += '<div class="city-cloud c1">☁️</div>';
    html += '<div class="city-cloud c2">☁️</div>';
    html += '<div class="city-cloud c3">☁️</div>';
    html += '<div class="city-sun">☀️</div>';
    html += '</div>';

    // Ground plane
    html += '<div class="city-ground">';
    html += '<div class="iso-ground">';
    for (let r = 0; r < ISO.GROUND_ROWS; r++) {
        for (let c = 0; c < ISO.GROUND_COLS; c++) {
            const pos = isoToScreen(c, r, 0);
            const isPath = (r === 6 && c >= 2 && c <= 16) ||
                           (c === 9 && r >= 1 && r <= 9);
            const groundType = isPath ? 'dirt' : 'grass';
            const bt = BLOCK_TYPES[groundType];
            html += `<div class="iso-ground-tile" style="
                left:${pos.x}px; top:${pos.y}px;
            ">
                <div class="iso-top" style="background:${bt.top}"></div>
            </div>`;
        }
    }
    html += '</div>';

    // Buildings layer (sorted for proper depth)
    html += '<div class="iso-buildings">';

    // Render all buildings in depth order (back to front)
    const sortedProjects = [...BUILDING_PROJECTS].sort((a, b) => {
        const pa = BUILDING_POSITIONS[a.id] || { col: 0, row: 0 };
        const pb = BUILDING_POSITIONS[b.id] || { col: 0, row: 0 };
        return (pa.col + pa.row) - (pb.col + pb.row);
    });

    for (const project of sortedProjects) {
        const pos = BUILDING_POSITIONS[project.id];
        if (!pos) continue;

        const building = allBuildings[project.id];
        const blocksPlaced = building ? building.blocksPlaced : 0;
        const isComplete = building && building.completed;
        const isStarted = building && blocksPlaced > 0;
        const screenPos = isoToScreen(pos.col, pos.row, 0);

        // Only show buildings that have been started, or show ghost for available ones
        const showGhost = !isStarted;

        const builderBadge = building ?
            `<div class="city-builder-badge" style="background:${getPlayerColor(building.playerId)}">${building.playerName.charAt(0)}</div>` : '';

        const pct = building ? Math.round((blocksPlaced / project.blocksNeeded) * 100) : 0;
        const progressBar = !isComplete && isStarted ?
            `<div class="city-building-progress"><div class="city-building-progress-fill" style="width:${pct}%"></div><span>${pct}%</span></div>` : '';

        const label = `<div class="city-building-label ${isComplete ? 'complete' : ''}">${project.icon} ${project.name}${builderBadge}</div>`;

        html += `<div class="iso-building-wrapper ${isComplete ? 'complete' : ''} ${showGhost ? 'ghost-building' : ''}"
                      style="left:${screenPos.x}px; top:${screenPos.y}px;"
                      data-building="${project.id}"
                      onclick="handleCityBuildingClick('${project.id}')">
            ${renderBuilding(project.id, blocksPlaced, project.blocksNeeded)}
            ${label}
            ${progressBar}
        </div>`;
    }

    html += '</div>'; // iso-buildings
    html += '</div>'; // city-ground

    // City progress bar at top
    html += `<div class="city-header-bar">
        <div class="city-title">🏘️ Ons Dorp</div>
        <div class="city-total-progress">
            <div class="city-total-fill" style="width:${Math.round(completedCount/totalProjects*100)}%"></div>
            <span>${completedCount}/${totalProjects}</span>
        </div>
    </div>`;

    // Player contributions
    html += '<div class="city-players">';
    for (const [id, info] of Object.entries(PLAYERS)) {
        const player = await getPlayer(id);
        const buildingCount = player?.world?.buildings?.filter(b => b.completed).length || 0;
        const inProgress = player?.world?.buildings?.find(b => !b.completed);
        const activeProject = inProgress ? BUILDING_PROJECTS.find(p => p.id === inProgress.projectId) : null;
        html += `<div class="city-player-chip" style="border-color:${getPlayerColor(id)}">
            <span class="city-player-avatar" style="background:${getPlayerColor(id)}">${info.name.charAt(0)}</span>
            <span class="city-player-name">${info.name}</span>
            <span class="city-player-stat">${buildingCount} gebouwd</span>
            ${activeProject ? `<span class="city-player-building">⛏ ${activeProject.name}</span>` : ''}
        </div>`;
    }
    html += '</div>';

    container.innerHTML = html;
}

function getPlayerColor(playerId) {
    const colors = { sebas: '#4caf50', jonathan: '#2196f3', benjamin: '#ff9800' };
    return colors[playerId] || '#888';
}

function handleCityBuildingClick(buildingId) {
    if (!currentPlayer) return;

    // Check if this is the player's active or available building
    const building = currentPlayer.world.buildings.find(b => b.projectId === buildingId);
    const project = BUILDING_PROJECTS.find(p => p.id === buildingId);
    if (!project) return;

    if (building && !building.completed && building.projectId === currentPlayer.world.activeProject) {
        // Start building
        startBuildSession();
    } else if (!building) {
        // Check if available
        const isUnlocked = currentPlayer.world.unlockedBiomes.includes(project.biome);
        if (isUnlocked) {
            selectBuildProject(buildingId);
        }
    }
}

// Render building preview during typing (smaller version)
function renderTypingBuildPreview(buildingId, blocksPlaced, totalBlocks) {
    const bp = BUILDING_BLUEPRINTS[buildingId];
    if (!bp) return '';

    const blockList = getBlueprintBlockList(buildingId);
    const blocksToShow = Math.min(blockList.length,
        Math.round((blocksPlaced / totalBlocks) * blockList.length));

    // Use smaller scale for typing preview
    const scale = 0.7;
    let html = '';

    for (let i = blocksToShow; i < blockList.length; i++) {
        const b = blockList[i];
        html += renderIsoBlock(b.type, b.x, b.z, b.y, 'ghost', 0.15);
    }
    for (let i = 0; i < blocksToShow; i++) {
        const b = blockList[i];
        html += renderIsoBlock(b.type, b.x, b.z, b.y, 'filled', 1);
    }

    return `<div class="typing-build-preview" style="transform:scale(${scale})">${html}</div>`;
}

// Add a single block animation during typing
function animateNewBlock(buildingId, blocksPlaced, totalBlocks) {
    const structure = document.getElementById('build-structure');
    if (!structure) return;

    const blockList = getBlueprintBlockList(buildingId);
    const blockIdx = Math.min(blockList.length - 1,
        Math.round((blocksPlaced / totalBlocks) * blockList.length) - 1);

    if (blockIdx < 0 || blockIdx >= blockList.length) return;

    const b = blockList[blockIdx];
    const bt = BLOCK_TYPES[b.type];
    if (!bt) return;

    // Find and fill the corresponding ghost block
    const ghosts = structure.querySelectorAll('.iso-block.ghost');
    if (ghosts.length > 0) {
        const ghost = ghosts[0];
        ghost.classList.remove('ghost');
        ghost.classList.add('filled', 'block-appear');
        ghost.style.opacity = '1';
        // Update face colors
        const top = ghost.querySelector('.iso-top');
        const left = ghost.querySelector('.iso-left');
        const right = ghost.querySelector('.iso-right');
        if (top) top.style.background = bt.top;
        if (left) left.style.background = bt.left;
        if (right) right.style.background = bt.right;
    }
}
