/* ===== TypeCraft City Renderer ===== */
/* Panoramic 2D city with wijken (neighborhoods) that grow as players type together */

/* ===== Block Colors ===== */
const BLOCK_COLORS = {
    // Wood family
    oak_planks:    '#b8945f',
    oak_planks_d:  '#a07840',
    oak_log:       '#5c4633',
    oak_log_top:   '#8b7355',
    spruce_planks: '#7a5a33',
    birch_planks:  '#d4c48a',
    // Stone family
    cobblestone:   '#7a7a7a',
    cobble_moss:   '#6a8a6a',
    stone_brick:   '#8a8a8a',
    stone_brick_d: '#6e6e6e',
    smooth_stone:  '#9e9e9e',
    // Glass & door
    glass:         '#aad7e6',
    glass_pane:    '#88c8dd',
    door:          '#6b4226',
    door_iron:     '#b8b8b8',
    // Roofing
    roof_oak:      '#8d5524',
    roof_dark:     '#6b3a18',
    roof_stone:    '#606060',
    roof_red:      '#a83232',
    // Nature
    hay:           '#c8a83e',
    water:         '#4090d0',
    dirt:          '#8b6c42',
    grass:         '#5d9e37',
    grass_d:       '#4a8a2a',
    leaves:        '#3d8c30',
    leaves_d:      '#2d7020',
    flower_r:      '#e04040',
    flower_y:      '#e0d040',
    fence:         '#9e7e4a',
    // Functional
    bookshelf:     '#6b4226',
    crafting:      '#8b6c42',
    crafting_top:  '#b8945f',
    furnace:       '#5a5a5a',
    furnace_glow:  '#cc6600',
    anvil:         '#444444',
    chimney:       '#884422',
    // Ores & precious
    iron_block:    '#d8d8d8',
    gold_block:    '#f5d63d',
    diamond_block: '#54e5cc',
    emerald:       '#44cc66',
    redstone:      '#cc2222',
    // Nether & End
    obsidian:      '#1a0a2e',
    nether_brick:  '#3a1e1e',
    nether_brick_d:'#2a1010',
    soul_sand:     '#554433',
    end_stone:     '#dbd5a0',
    end_stone_d:   '#c8c090',
    purpur:        '#a77ba7',
    purpur_d:      '#8a5a8a',
    // Effects
    lava:          '#e05500',
    lava_bright:   '#ff7700',
    red_wool:      '#a02020',
    blue_wool:     '#3050a0',
    white_wool:    '#e8e8e8',
    torch:         '#ffcc00',
    lantern:       '#ffaa22',
    glowstone:     '#e8c840',
    beacon_light:  '#88eeff',
    flag_red:      '#cc2020',
    flag_blue:     '#2040cc',
    banner:        '#dddddd',
};

/* ===== City Wijken (Neighborhoods) ===== */
/* 5 wijken, each with 7 buildings. All buildings in a wijk must be completed to unlock next wijk. */
/* Buildings use 14px blocks for detailed pixel art */
const CITY_LAYERS = [
    {
        name: 'Basis Kamp',
        icon: '🏕️',
        desc: 'Begin jullie avontuur!',
        groundColor: '#5d9e37',
        subColor: '#8b6c42',
        buildings: [
            {
                id: 'houten_hut',
                name: 'Houten Hut',
                icon: '🏠',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    [null,null,null,'chimney',null,null,null,null],
                    [null,null,'roof_oak','roof_oak','roof_oak','roof_oak',null,null],
                    [null,'roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak',null],
                    ['roof_dark','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_dark'],
                    ['oak_log','oak_planks','glass','oak_planks','oak_planks','glass','oak_planks','oak_log'],
                    ['oak_log','oak_planks','glass','oak_planks','oak_planks','glass','oak_planks','oak_log'],
                    ['oak_log','oak_planks','oak_planks','door','door','oak_planks','oak_planks','oak_log'],
                    ['oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks'],
                ]
            },
            {
                id: 'werkplaats',
                name: 'Werkplaats',
                icon: '🔨',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    [null,null,'torch',null,null,null,null],
                    [null,'roof_oak','roof_oak','roof_oak','roof_oak','roof_oak',null],
                    ['roof_dark','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_dark'],
                    ['oak_log',null,null,null,null,null,'oak_log'],
                    ['oak_log',null,'crafting_top','crafting_top',null,null,'oak_log'],
                    ['oak_log',null,'crafting','anvil',null,null,'oak_log'],
                    ['fence','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','fence'],
                ]
            },
            {
                id: 'boerderij',
                name: 'Boerderij',
                icon: '🌾',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    [null,null,'roof_oak','roof_oak','roof_oak',null,null,null,null],
                    [null,'roof_oak','roof_oak','roof_oak','roof_oak','roof_oak',null,null,null],
                    ['roof_dark','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_dark',null,null],
                    ['oak_log','hay','hay','hay','hay','hay','oak_log',null,null],
                    ['oak_log','hay','hay','hay','hay','door',null,null,null],
                    ['oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','fence','fence','fence'],
                    [null,null,null,null,null,null,'hay','water','hay'],
                ]
            },
            {
                id: 'waterput',
                name: 'Waterput',
                icon: '🪣',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    [null,null,'roof_oak',null,null],
                    [null,'oak_log',null,'oak_log',null],
                    ['fence',null,null,null,'fence'],
                    ['cobblestone','cobblestone','water','cobblestone','cobblestone'],
                    ['cobblestone','cobblestone','water','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'pad',
                name: 'Pad',
                icon: '🛤️',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    ['torch',null,null,null,null,null,'torch'],
                    ['fence',null,null,null,null,null,'fence'],
                    ['fence',null,null,null,null,null,'fence'],
                    ['oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks'],
                    ['dirt','dirt','oak_planks','oak_planks','oak_planks','dirt','dirt'],
                ]
            },
            {
                id: 'uitkijktoren',
                name: 'Uitkijktoren',
                icon: '🗼',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    [null,'torch',null],
                    ['roof_oak','roof_oak','roof_oak'],
                    ['oak_log',null,'oak_log'],
                    ['fence','oak_planks','fence'],
                    [null,'oak_log',null],
                    [null,'oak_log',null],
                    [null,'oak_log',null],
                    ['oak_planks','oak_planks','oak_planks'],
                ]
            },
            {
                id: 'kampvuur',
                name: 'Kampvuur',
                icon: '🔥',
                blocksNeeded: 16,
                material: 'hout',
                grid: [
                    [null,null,'torch',null,null],
                    [null,'lava_bright','lava','lava_bright',null],
                    ['oak_log','lava','lava_bright','lava','oak_log'],
                    [null,'oak_log','cobblestone','oak_log',null],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
        ]
    },
    {
        name: 'Dorp',
        icon: '🏘️',
        desc: 'Bouw een gezellig dorpje',
        groundColor: '#7a7a7a',
        subColor: '#5a5a5a',
        buildings: [
            {
                id: 'stenen_huis',
                name: 'Stenen Huis',
                icon: '🏠',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    [null,null,null,null,'chimney',null,null,null,null],
                    [null,null,'roof_stone','roof_stone','roof_stone','roof_stone','roof_stone',null,null],
                    [null,'roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone',null],
                    ['roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone'],
                    ['stone_brick','stone_brick','glass','stone_brick','stone_brick','stone_brick','glass','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','glass','stone_brick','stone_brick','stone_brick','glass','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','door','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'smederij',
                name: 'Smederij',
                icon: '⚒️',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    [null,null,null,'chimney','chimney',null,null,null],
                    [null,'roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone',null],
                    ['roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone'],
                    ['stone_brick','stone_brick',null,null,null,null,'stone_brick','stone_brick'],
                    ['stone_brick','furnace','furnace_glow',null,'anvil',null,'stone_brick','stone_brick'],
                    ['stone_brick','furnace','lava',null,null,null,'stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'bibliotheek',
                name: 'Bibliotheek',
                icon: '📚',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    [null,'roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak',null],
                    ['roof_dark','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_dark'],
                    ['stone_brick','glass','bookshelf','bookshelf','bookshelf','bookshelf','glass','stone_brick'],
                    ['stone_brick','glass','bookshelf','bookshelf','bookshelf','bookshelf','glass','stone_brick'],
                    ['stone_brick','stone_brick','glass','glass','door','glass','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'bakkerij',
                name: 'Bakkerij',
                icon: '🍞',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    [null,null,null,null,null,null,'chimney',null],
                    [null,'roof_red','roof_red','roof_red','roof_red','roof_red','roof_red',null],
                    ['roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red'],
                    ['stone_brick','glass','stone_brick','stone_brick','stone_brick','glass','stone_brick','stone_brick'],
                    ['stone_brick','glass','stone_brick','furnace','furnace_glow','glass','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','door','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'brug',
                name: 'Brug',
                icon: '🌉',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    ['stone_brick',null,null,null,null,null,'stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                    [null,'water','water','water','water','water',null],
                    [null,'water','water','water','water','water',null],
                ]
            },
            {
                id: 'dorps_waterput',
                name: 'Waterput',
                icon: '⛲',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    [null,null,'roof_stone',null,null],
                    [null,'fence',null,'fence',null],
                    ['stone_brick','stone_brick','water','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','water','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'tuin',
                name: 'Tuin',
                icon: '🌷',
                blocksNeeded: 16,
                material: 'steen',
                grid: [
                    [null,'flower_r',null,'flower_y',null,'flower_r',null],
                    [null,'leaves','grass','leaves','grass','leaves',null],
                    ['fence','grass','flower_y','grass','flower_r','grass','fence'],
                    ['fence','grass','leaves','grass','leaves','grass','fence'],
                    ['cobblestone','dirt','dirt','dirt','dirt','dirt','cobblestone'],
                ]
            },
        ]
    },
    {
        name: 'Stad',
        icon: '🏙️',
        desc: 'De stad groeit!',
        groundColor: '#8a8a8a',
        subColor: '#6e6e6e',
        buildings: [
            {
                id: 'markthal',
                name: 'Markthal',
                icon: '🏪',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    [null,null,'flag_red',null,null,null,'flag_blue',null,null],
                    [null,'red_wool','red_wool','red_wool','red_wool','red_wool','red_wool','red_wool',null],
                    ['oak_log',null,null,null,null,null,null,null,'oak_log'],
                    ['oak_log',null,'crafting_top','crafting_top',null,'crafting_top','crafting_top',null,'oak_log'],
                    ['oak_log',null,'crafting','crafting',null,'crafting','crafting',null,'oak_log'],
                    ['oak_log',null,null,null,null,null,null,null,'oak_log'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                ]
            },
            {
                id: 'wachttoren',
                name: 'Wachttoren',
                icon: '🗼',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    [null,null,'torch',null,null],
                    [null,'stone_brick','stone_brick','stone_brick',null],
                    [null,'stone_brick','lantern','stone_brick',null],
                    ['stone_brick_d','stone_brick','glass','stone_brick','stone_brick_d'],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','door','stone_brick',null],
                    [null,'cobblestone','cobblestone','cobblestone',null],
                ]
            },
            {
                id: 'mijnschacht',
                name: 'Mijnschacht',
                icon: '⛏️',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    ['oak_log','oak_planks','torch','oak_planks','torch','oak_planks','oak_log'],
                    [null,'oak_log',null,null,null,'oak_log',null],
                    [null,null,'cobblestone','iron_block','cobblestone',null,null],
                    [null,'cobblestone','cobblestone','gold_block','cobblestone','cobblestone',null],
                    ['cobblestone','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','cobblestone'],
                    ['stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d'],
                ]
            },
            {
                id: 'herberg',
                name: 'Herberg',
                icon: '🍺',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    [null,null,'chimney',null,null,null,null,null,null],
                    [null,'roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red',null],
                    ['roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red'],
                    ['stone_brick','glass','glass','stone_brick','stone_brick','stone_brick','glass','glass','stone_brick'],
                    ['stone_brick','glass','glass','stone_brick','lantern','stone_brick','glass','glass','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','door','door','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'stadsmuur',
                name: 'Stadsmuur',
                icon: '🧱',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    ['stone_brick',null,'stone_brick',null,'stone_brick',null,'stone_brick'],
                    ['stone_brick','stone_brick_d','stone_brick','stone_brick_d','stone_brick','stone_brick_d','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'paardstal',
                name: 'Paardstal',
                icon: '🐴',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    [null,'roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak',null],
                    ['roof_dark','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_oak','roof_dark'],
                    ['oak_log',null,null,'fence',null,null,null,'oak_log'],
                    ['oak_log',null,'hay','fence',null,'hay',null,'oak_log'],
                    ['oak_log','hay','hay','fence','hay','hay',null,'oak_log'],
                    ['oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks','oak_planks'],
                ]
            },
            {
                id: 'fontein',
                name: 'Fontein',
                icon: '⛲',
                blocksNeeded: 16,
                material: 'ijzer',
                grid: [
                    [null,null,null,'water',null,null,null],
                    [null,null,'water','water','water',null,null],
                    [null,'stone_brick','water','water','water','stone_brick',null],
                    [null,'stone_brick','water','stone_brick','water','stone_brick',null],
                    ['smooth_stone','smooth_stone','water','water','water','smooth_stone','smooth_stone'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
        ]
    },
    {
        name: 'Vesting',
        icon: '🏰',
        desc: 'Verdedig je stad!',
        groundColor: '#3a1e1e',
        subColor: '#2a1010',
        buildings: [
            {
                id: 'kasteel',
                name: 'Kasteel',
                icon: '🏰',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    ['stone_brick',null,null,null,'flag_red',null,null,null,'stone_brick'],
                    ['stone_brick','stone_brick_d',null,'stone_brick','stone_brick','stone_brick',null,'stone_brick_d','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick','stone_brick'],
                    [null,'stone_brick','glass','stone_brick',null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','glass','stone_brick',null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','stone_brick','stone_brick','door_iron','stone_brick','stone_brick','stone_brick',null],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'nether_portaal',
                name: 'Nether Portaal',
                icon: '🟣',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    [null,null,'obsidian','obsidian','obsidian','obsidian',null,null],
                    [null,'obsidian','lava','lava_bright','lava_bright','lava','obsidian',null],
                    [null,'obsidian','lava_bright','lava','lava','lava_bright','obsidian',null],
                    [null,'obsidian','lava','lava_bright','lava_bright','lava','obsidian',null],
                    [null,'obsidian','lava_bright','lava','lava','lava_bright','obsidian',null],
                    [null,null,'obsidian','obsidian','obsidian','obsidian',null,null],
                    ['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick','nether_brick'],
                    ['nether_brick_d','soul_sand','soul_sand','nether_brick_d','nether_brick_d','soul_sand','soul_sand','nether_brick_d'],
                ]
            },
            {
                id: 'tovenaarstoren',
                name: 'Tovenaarstoren',
                icon: '🧙',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    [null,null,'diamond_block',null,null],
                    [null,null,'glowstone',null,null],
                    [null,'purpur','purpur','purpur',null],
                    [null,'purpur','glass','purpur',null],
                    ['purpur_d','purpur','glass','purpur','purpur_d'],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','door','stone_brick',null],
                    [null,'gold_block','gold_block','gold_block',null],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'troonzaal',
                name: 'Troonzaal',
                icon: '👑',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    [null,null,null,null,'gold_block',null,null,null,null],
                    [null,null,null,'gold_block','emerald','gold_block',null,null,null],
                    [null,'roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red',null],
                    ['roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red','roof_red'],
                    ['stone_brick','glass','glass','stone_brick','gold_block','stone_brick','glass','glass','stone_brick'],
                    ['stone_brick','glass','glass','stone_brick','gold_block','stone_brick','glass','glass','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','door_iron','door_iron','stone_brick','stone_brick','stone_brick','stone_brick'],
                    ['gold_block','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','gold_block'],
                ]
            },
            {
                id: 'wapenarsenaal',
                name: 'Wapenarsenaal',
                icon: '⚔️',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    [null,'roof_stone','roof_stone','roof_stone','roof_stone','roof_stone',null],
                    ['roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone','roof_stone'],
                    ['stone_brick','stone_brick','iron_block','stone_brick','iron_block','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','iron_block','stone_brick','iron_block','stone_brick','stone_brick'],
                    ['stone_brick','stone_brick','stone_brick','door_iron','stone_brick','stone_brick','stone_brick'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'kerker',
                name: 'Kerker',
                icon: '⛓️',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    ['stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d'],
                    ['stone_brick_d','iron_block','stone_brick_d','stone_brick_d','stone_brick_d','iron_block','stone_brick_d'],
                    ['stone_brick_d',null,'stone_brick_d','lantern','stone_brick_d',null,'stone_brick_d'],
                    ['stone_brick_d',null,'stone_brick_d',null,'stone_brick_d',null,'stone_brick_d'],
                    ['stone_brick_d','door_iron','stone_brick_d',null,'stone_brick_d','door_iron','stone_brick_d'],
                    ['cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone','cobblestone'],
                ]
            },
            {
                id: 'vuurwachttoren',
                name: 'Vuurwachttoren',
                icon: '🔥',
                blocksNeeded: 16,
                material: 'goud',
                grid: [
                    [null,null,'lava_bright',null,null],
                    [null,'lava','lava_bright','lava',null],
                    ['stone_brick','lava','lava','lava','stone_brick'],
                    ['stone_brick_d','stone_brick','stone_brick','stone_brick','stone_brick_d'],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','glass','stone_brick',null],
                    [null,'stone_brick','door','stone_brick',null],
                    ['nether_brick','nether_brick','nether_brick','nether_brick','nether_brick'],
                ]
            },
        ]
    },
    {
        name: 'Legende',
        icon: '🐉',
        desc: 'Bereik het legendarische niveau!',
        groundColor: '#dbd5a0',
        subColor: '#c8c090',
        buildings: [
            {
                id: 'end_toren',
                name: 'End Toren',
                icon: '🗽',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,null,'beacon_light',null,null],
                    [null,null,'purpur',null,null],
                    [null,'purpur','purpur','purpur',null],
                    [null,'purpur_d','glass','purpur_d',null],
                    ['purpur','purpur','glass','purpur','purpur'],
                    [null,'end_stone','glass','end_stone',null],
                    [null,'end_stone','glass','end_stone',null],
                    [null,'end_stone','glass','end_stone',null],
                    [null,'end_stone','door','end_stone',null],
                    [null,'end_stone','end_stone','end_stone',null],
                    ['end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d'],
                ]
            },
            {
                id: 'drakentroon',
                name: 'Drakentroon',
                icon: '🐉',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,null,null,'glowstone',null,null,null],
                    [null,'purpur',null,'diamond_block',null,'purpur',null],
                    [null,'purpur','gold_block','gold_block','gold_block','purpur',null],
                    [null,null,'gold_block','emerald','gold_block',null,null],
                    [null,null,'obsidian','gold_block','obsidian',null,null],
                    [null,'end_stone','end_stone','end_stone','end_stone','end_stone',null],
                    ['end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d'],
                ]
            },
            {
                id: 'beacon',
                name: 'Beacon',
                icon: '💎',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,null,'beacon_light',null,null],
                    [null,null,'beacon_light',null,null],
                    [null,null,'beacon_light',null,null],
                    [null,'glass','beacon_light','glass',null],
                    [null,'glass','diamond_block','glass',null],
                    ['iron_block','iron_block','iron_block','iron_block','iron_block'],
                    [null,'gold_block','diamond_block','gold_block',null],
                    ['iron_block','iron_block','iron_block','iron_block','iron_block'],
                ]
            },
            {
                id: 'kristalgrot',
                name: 'Kristalgrot',
                icon: '💎',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,'stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d','stone_brick_d',null],
                    ['stone_brick_d','diamond_block',null,'emerald',null,'diamond_block','stone_brick_d'],
                    ['stone_brick_d',null,'diamond_block',null,'diamond_block',null,'stone_brick_d'],
                    ['stone_brick_d','emerald',null,'glowstone',null,'emerald','stone_brick_d'],
                    ['stone_brick_d','stone_brick_d','diamond_block',null,'diamond_block','stone_brick_d','stone_brick_d'],
                    ['end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d'],
                ]
            },
            {
                id: 'hemelpoort',
                name: 'Hemelpoort',
                icon: '🌀',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,null,'beacon_light',null,null],
                    [null,'purpur','beacon_light','purpur',null],
                    ['purpur','beacon_light','beacon_light','beacon_light','purpur'],
                    ['purpur','beacon_light',null,'beacon_light','purpur'],
                    ['purpur','beacon_light',null,'beacon_light','purpur'],
                    ['purpur','beacon_light','beacon_light','beacon_light','purpur'],
                    [null,'end_stone','end_stone','end_stone',null],
                    ['end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d'],
                ]
            },
            {
                id: 'drakennest',
                name: 'Drakennest',
                icon: '🥚',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,null,null,'glowstone',null,null,null],
                    [null,null,'obsidian','emerald','obsidian',null,null],
                    [null,'obsidian','gold_block','gold_block','gold_block','obsidian',null],
                    ['obsidian','gold_block','gold_block','diamond_block','gold_block','gold_block','obsidian'],
                    [null,'obsidian','obsidian','obsidian','obsidian','obsidian',null],
                    ['end_stone','end_stone','end_stone','end_stone','end_stone','end_stone','end_stone'],
                ]
            },
            {
                id: 'ender_altaar',
                name: 'Ender Altaar',
                icon: '🔮',
                blocksNeeded: 16,
                material: 'diamant',
                grid: [
                    [null,null,'glowstone',null,null],
                    [null,'purpur','beacon_light','purpur',null],
                    [null,'purpur','emerald','purpur',null],
                    ['purpur_d','purpur','purpur','purpur','purpur_d'],
                    [null,'end_stone','glowstone','end_stone',null],
                    ['end_stone','end_stone','end_stone','end_stone','end_stone'],
                    ['end_stone_d','end_stone_d','end_stone_d','end_stone_d','end_stone_d'],
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
                biome: layerIdx,
                blocksNeeded: b.blocksNeeded,
                material: b.material,
                layer: layerIdx,
                desc: `Bouw de ${b.name} voor jullie stad!`,
                color: BLOCK_COLORS[b.material] || '#888',
                reward: { xp, item: null },
            });
        });
    });
    return projects;
})();

const BUILDING_POSITIONS = {};

/* ===== Player Colors ===== */
function getPlayerColor(playerId) {
    const colors = { sebas: '#4caf50', jonathan: '#2196f3', benjamin: '#ff9800' };
    return colors[playerId] || '#888';
}

/* ===== Per-player accessibility: unlocked + 1 wijk vooruit ===== */
const BUILDINGS_PER_PLAYER_TO_ADVANCE = 3;

function isLayerAccessible(layerIndex, player, layerStatuses) {
    if (layerIndex === 0) return true;

    // Allow finishing buildings already started in this wijk
    const layer = CITY_LAYERS[layerIndex];
    const hasStarted = layer.buildings.some(b => {
        const bld = player?.world?.buildings?.find(x => x.projectId === b.id);
        return bld && !bld.completed;
    });
    if (hasStarted) return true;

    const prevLayer = CITY_LAYERS[layerIndex - 1];
    let playerDoneCount = 0;
    for (const b of prevLayer.buildings) {
        const bld = player?.world?.buildings?.find(x => x.projectId === b.id);
        if (bld && bld.completed) playerDoneCount++;
    }
    return playerDoneCount >= BUILDINGS_PER_PLAYER_TO_ADVANCE;
}

/* ===== Wijk Status ===== */
/* A wijk unlocks when ALL buildings in the previous wijk are completed */
function getLayerStatus(layerIndex, playerDataMap) {
    const layer = CITY_LAYERS[layerIndex];
    if (!layer) return { unlocked: false, complete: false, claims: {} };

    const BUILDINGS_NEEDED_TO_UNLOCK = 3;

    let unlocked = layerIndex === 0;
    if (layerIndex > 0) {
        const prevLayer = CITY_LAYERS[layerIndex - 1];
        let completedCount = 0;
        for (const b of prevLayer.buildings) {
            for (const pd of Object.values(playerDataMap)) {
                if (!pd?.world?.buildings) continue;
                const bld = pd.world.buildings.find(x => x.projectId === b.id);
                if (bld && bld.completed) { completedCount++; break; }
            }
        }
        unlocked = completedCount >= BUILDINGS_NEEDED_TO_UNLOCK;
    }

    // Build claims map — each building can have multiple players
    const claims = {};
    for (const [playerId, playerData] of Object.entries(playerDataMap)) {
        if (!playerData?.world?.buildings) continue;
        for (const b of layer.buildings) {
            const building = playerData.world.buildings.find(bld => bld.projectId === b.id);
            if (building) {
                if (!claims[b.id]) claims[b.id] = [];
                claims[b.id].push({
                    playerId,
                    playerName: playerData.name || playerId,
                    blocksPlaced: building.blocksPlaced || 0,
                    completed: building.completed || false,
                });
            }
        }
    }

    let doneCount = 0;
    for (const b of layer.buildings) {
        if (claims[b.id] && claims[b.id].some(c => c.completed)) doneCount++;
    }
    const complete = doneCount >= layer.buildings.length;
    return { unlocked, complete, claims };
}

/* ===== Render Building Sprite ===== */
function renderBuildingSprite(building, blocksPlaced, blocksNeeded, blockSize, highlightGameBlocks) {
    const grid = building.grid;
    if (!grid || grid.length === 0) return '<div></div>';

    blockSize = blockSize || 14;
    const rows = grid.length;
    const cols = Math.max(...grid.map(r => r.length));

    let totalGridBlocks = 0;
    for (const row of grid) for (const cell of row) if (cell) totalGridBlocks++;

    // 1 game-block = 1 grid-cell. When building is complete, fill everything.
    const isComplete = blocksPlaced >= blocksNeeded;
    const solidGridBlocks = isComplete ? totalGridBlocks : Math.min(blocksPlaced, totalGridBlocks);

    const blockCells = [];
    for (let r = rows - 1; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
            if (grid[r] && grid[r][c]) blockCells.push({ r, c });
        }
    }

    const solidSet = new Set();
    const highlightSet = new Set();
    for (let i = 0; i < solidGridBlocks && i < blockCells.length; i++) {
        solidSet.add(`${blockCells[i].r},${blockCells[i].c}`);
        if (highlightGameBlocks && !isComplete && i >= solidGridBlocks - highlightGameBlocks) {
            highlightSet.add(`${blockCells[i].r},${blockCells[i].c}`);
        }
    }

    let html = `<div class="building-sprite" style="
        grid-template-columns: repeat(${cols}, ${blockSize}px);
        grid-template-rows: repeat(${rows}, ${blockSize}px);
    ">`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const blockType = grid[r] ? grid[r][c] : null;
            if (!blockType) {
                html += `<div class="city-block empty"></div>`;
            } else {
                const color = BLOCK_COLORS[blockType] || '#888';
                const isSolid = solidSet.has(`${r},${c}`);
                const isHighlight = highlightSet.has(`${r},${c}`);
                const isLava = blockType.startsWith('lava');
                const isGlow = blockType === 'torch' || blockType === 'lantern' || blockType === 'glowstone' || blockType === 'beacon_light';
                const extra = isLava ? ' lava-glow' : isGlow ? ' light-glow' : '';
                const hlClass = isHighlight ? ' block-new' : '';
                html += `<div class="city-block ${isSolid ? 'solid' : 'ghost'}${extra}${hlClass}" style="background:${color};"></div>`;
            }
        }
    }
    html += '</div>';
    return html;
}

/* ===== Handle Building Click ===== */
function handleBuildingClick(buildingId, layerIndex) {
    if (!currentPlayer) return;

    const hasActiveOther = currentPlayer.world.buildings.find(
        b => b.projectId !== buildingId && !b.completed && currentPlayer.world.activeProject === b.projectId
    );
    if (hasActiveOther) {
        showToast('⛏️ Maak eerst je huidige gebouw af!');
        return;
    }

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

    getLayerStatusForCurrentPlayer(layerIndex).then(({ statuses }) => {
        if (!isLayerAccessible(layerIndex, currentPlayer, statuses)) {
            showToast('🔒 Bouw eerst een gebouw in de vorige wijk!');
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
    const statuses = CITY_LAYERS.map((_, i) => getLayerStatus(i, playerDataMap));
    return { ...statuses[layerIndex], statuses };
}

/* ===== Sky & Atmosphere ===== */
function renderSky() {
    const hour = new Date().getHours();
    let skyClass = 'sky-day';
    if (hour >= 20 || hour < 6) skyClass = 'sky-night';
    else if (hour >= 18) skyClass = 'sky-sunset';
    else if (hour < 8) skyClass = 'sky-dawn';

    let stars = '';
    if (hour >= 20 || hour < 6) {
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 50;
            const s = 1 + Math.random() * 2;
            const d = 2 + Math.random() * 3;
            stars += `<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-duration:${d}s"></div>`;
        }
    }

    return `<div class="sky-layer ${skyClass}">
        ${stars}
        <div class="cloud c1">☁</div>
        <div class="cloud c2">☁</div>
        <div class="cloud c3">☁</div>
        <div class="cloud c4">☁</div>
        <div class="cloud c5">☁</div>
        ${(hour >= 6 && hour < 18) ? '<div class="sun">☀</div>' : '<div class="moon">🌙</div>'}
    </div>`;
}

/* ===== Render City — 3 Player Columns ===== */
async function renderCity(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const playerDataMap = {};
    const playerIds = Object.keys(PLAYERS);
    for (const id of playerIds) {
        playerDataMap[id] = await getPlayer(id);
    }

    const layerStatuses = CITY_LAYERS.map((_, i) => getLayerStatus(i, playerDataMap));

    // Find active wijk (first incomplete unlocked wijk)
    let activeWijk = 0;
    for (let i = 0; i < CITY_LAYERS.length; i++) {
        if (layerStatuses[i].unlocked && !layerStatuses[i].complete) { activeWijk = i; break; }
        if (i === CITY_LAYERS.length - 1) activeWijk = i;
    }

    const activeLayer = CITY_LAYERS[activeWijk];
    const activeStatus = layerStatuses[activeWijk];

    let html = renderSky();

    // Wijk progress bar at top
    html += '<div class="wijk-progress-bar">';
    for (let i = 0; i < CITY_LAYERS.length; i++) {
        const w = CITY_LAYERS[i];
        const s = layerStatuses[i];
        const cls = !s.unlocked ? 'locked' : s.complete ? 'complete' : i === activeWijk ? 'active' : '';
        html += `<div class="wijk-pip ${cls}" title="${w.name}">${!s.unlocked ? '🔒' : s.complete ? '✅' : w.icon}</div>`;
    }
    html += `<span class="wijk-progress-label">${activeLayer.icon} ${activeLayer.name}</span>`;
    html += '</div>';

    // 3 player columns
    html += '<div class="city-columns">';

    for (let pi = 0; pi < playerIds.length; pi++) {
        const playerId = playerIds[pi];
        const playerInfo = PLAYERS[playerId];
        const pd = playerDataMap[playerId];
        const color = getPlayerColor(playerId);
        const isCurrentPlayer = currentPlayer && currentPlayer.id === playerId;

        html += `<div class="player-column ${isCurrentPlayer ? 'current' : ''}" style="--player-color:${color}">`;

        // Stack buildings bottom-up: completed buildings from previous wijken + current
        html += '<div class="column-buildings">';

        // Show completed buildings from ALL previous wijken (stacked)
        for (let wi = 0; wi < activeWijk; wi++) {
            const layer = CITY_LAYERS[wi];
            for (const building of layer.buildings) {
                const bld = pd?.world?.buildings?.find(b => b.projectId === building.id);
                if (bld && bld.completed) {
                    html += `<div class="column-building done">
                        ${renderBuildingSprite(building, building.blocksNeeded, building.blocksNeeded)}
                    </div>`;
                }
            }
        }

        // Show buildings from all accessible wijken (active + ahead)
        let hasBuildings = false;
        let showChoosePrompt = false;

        for (let wi = activeWijk; wi < CITY_LAYERS.length; wi++) {
            const layer = CITY_LAYERS[wi];
            if (!isLayerAccessible(wi, pd, layerStatuses)) break;

            for (const building of layer.buildings) {
                const bld = pd?.world?.buildings?.find(b => b.projectId === building.id);
                if (!bld) continue;
                const blocksPlaced = bld.blocksPlaced || 0;
                const isCompleted = bld.completed;
                const pct = Math.min(100, Math.round((blocksPlaced / building.blocksNeeded) * 100));
                const clickable = isCurrentPlayer && !isCompleted;

                html += `<div class="column-building ${isCompleted ? 'done' : 'active'} ${clickable ? 'clickable' : ''}"
                    ${clickable ? `onclick="handleCityBuildingClick('${building.id}')"` : ''}>
                    ${renderBuildingSprite(building, blocksPlaced, building.blocksNeeded)}
                    <div class="building-label">
                        <span class="building-label-name">${building.name}</span>
                        ${!isCompleted ? `<span class="building-label-pct">${pct}%</span>` : '<span class="building-label-pct">✅</span>'}
                    </div>
                </div>`;
                hasBuildings = true;
            }

            if (isCurrentPlayer) {
                const allDoneInLayer = layer.buildings.every(b => {
                    const bld = pd?.world?.buildings?.find(x => x.projectId === b.id);
                    return bld && bld.completed;
                });
                if (!allDoneInLayer) showChoosePrompt = true;
            }
        }

        if (showChoosePrompt) {
            html += `<div class="column-building choose" onclick="openBuildMenu()">
                <div class="choose-prompt">⛏</div>
                <div class="building-label"><span class="building-label-name">Kies gebouw</span></div>
            </div>`;
        }

        html += '</div>'; // column-buildings

        // Ground
        html += `<div class="column-ground" style="background:${activeLayer.groundColor}"></div>`;

        // Player name plate
        html += `<div class="column-nameplate" style="border-color:${color}">
            <div class="column-avatar" style="background:${color}">${playerInfo.name.charAt(0)}</div>
            <span class="column-name">${playerInfo.name}</span>
        </div>`;

        html += '</div>'; // player-column
    }

    html += '</div>'; // city-columns

    container.innerHTML = html;
}

function scrollToWijk(index) { /* no-op — columns layout doesn't scroll */ }

/* ===== renderCity3D — alias ===== */
async function renderCity3D(containerId) { return renderCity(containerId); }

/* ===== Backward Compat ===== */
function countBlueprintBlocks(buildingId) {
    for (const layer of CITY_LAYERS) {
        const b = layer.buildings.find(x => x.id === buildingId);
        if (b) return b.blocksNeeded;
    }
    return 0;
}

function getBlueprintBlockList(buildingId) {
    for (const layer of CITY_LAYERS) {
        const building = layer.buildings.find(b => b.id === buildingId);
        if (building?.grid) {
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
        const b = layer.buildings.find(x => x.id === buildingId);
        if (b) return renderBuildingSprite(b, blocksPlaced, totalBlocks || b.blocksNeeded);
    }
    return '';
}

function animateNewBlock(buildingId, blocksPlaced, totalBlocks, highlightGameBlocks) {
    const structure = document.getElementById('build-structure');
    if (!structure) return;
    for (const layer of CITY_LAYERS) {
        const b = layer.buildings.find(x => x.id === buildingId);
        if (b) {
            structure.innerHTML = renderBuildingSprite(b, blocksPlaced, totalBlocks || b.blocksNeeded, 24, highlightGameBlocks || 1);
            return;
        }
    }
}

function renderTypingBuildPreview(buildingId, blocksPlaced, totalBlocks) {
    return renderBuilding(buildingId, blocksPlaced, totalBlocks);
}

function handleCityBuildingClick(buildingId) {
    if (!currentPlayer) return;
    for (let i = 0; i < CITY_LAYERS.length; i++) {
        if (CITY_LAYERS[i].buildings.find(b => b.id === buildingId)) {
            handleBuildingClick(buildingId, i);
            return;
        }
    }
}
