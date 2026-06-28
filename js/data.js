/* ===== TypeCraft Data Layer (IndexedDB) ===== */

const DB_NAME = 'typecraft';
const DB_VERSION = 1;

const PLAYERS = {
    sebas: { name: 'Sebas', age: 13, sessionMinutes: 20, handicap: 1.0 },
    jonathan: { name: 'Jonathan', age: 11, sessionMinutes: 15, handicap: 1.3 },
    benjamin: { name: 'Benjamin', age: 7, sessionMinutes: 10, handicap: 2.0 }
};

const BIOMES = [
    { id: 'plains', name: 'Plains', color: '#7cb342', keys: 'asdfjkl;', minWpm: 0, minAccuracy: 0 },
    { id: 'forest', name: 'Forest', color: '#2e7d32', keys: 'qwertyuiop', minWpm: 15, minAccuracy: 80 },
    { id: 'desert', name: 'Desert', color: '#f9a825', keys: 'zxcvbnm,./', minWpm: 25, minAccuracy: 85 },
    { id: 'nether', name: 'Nether', color: '#b71c1c', keys: 'SHIFT.,!?', minWpm: 35, minAccuracy: 88 },
    { id: 'end', name: 'The End', color: '#4a148c', keys: '1234567890', minWpm: 45, minAccuracy: 90 }
];

const RESOURCES = {
    hout: { icon: '🪵', color: '#8d6e63', minWordLen: 2 },
    steen: { icon: '🪨', color: '#9e9e9e', minWordLen: 4 },
    ijzer: { icon: '🔩', color: '#e0e0e0', minWordLen: 6 },
    goud: { icon: '🥇', color: '#ffc107', minWordLen: 8 },
    diamant: { icon: '💎', color: '#4dd0e1', minWordLen: 10 }
};

const CRAFT_RECIPES = [
    // === HOUT TIER (Basis Kamp) ===
    { id: 'werkbank',        name: 'Werkbank',         icon: '🟫', cost: { hout: 4 },                  xp: 10,  tier: 0, effect: 'Ontgrendelt houten recepten',     unlock: true },
    { id: 'houten_zwaard',   name: 'Houten Zwaard',    icon: '🗡️', cost: { hout: 6 },                  xp: 15,  tier: 0, effect: '+1 woord minder per regel',       bonus: { wordsDiscount: 1 } },
    { id: 'houten_pickaxe',  name: 'Houten Houweel',   icon: '⛏️', cost: { hout: 8 },                  xp: 20,  tier: 0, effect: '+2 hout per sessie',              bonus: { sessionResource: 'hout', amount: 2 } },
    { id: 'toorts',          name: 'Toortsen (4x)',    icon: '🔥', cost: { hout: 3 },                  xp: 5,   tier: 0, effect: 'Verlicht je gebouwen',             repeatable: true },
    { id: 'bed',             name: 'Bed',              icon: '🛏️', cost: { hout: 12 },                 xp: 25,  tier: 0, effect: 'Dagelijkse login: +3 hout',       bonus: { dailyResource: 'hout', dailyAmount: 3 } },
    // === STEEN TIER (Dorp) ===
    { id: 'oven',            name: 'Oven',             icon: '🧱', cost: { steen: 8 },                 xp: 30,  tier: 1, effect: 'Ontgrendelt stenen recepten',      unlock: true },
    { id: 'stenen_zwaard',   name: 'Stenen Zwaard',    icon: '🗡️', cost: { steen: 6, hout: 4 },        xp: 35,  tier: 1, effect: '+2 woorden minder per regel',     bonus: { wordsDiscount: 2 } },
    { id: 'stenen_pickaxe',  name: 'Stenen Houweel',   icon: '⛏️', cost: { steen: 8, hout: 4 },        xp: 40,  tier: 1, effect: '+2 steen per sessie',             bonus: { sessionResource: 'steen', amount: 2 } },
    { id: 'schild',          name: 'Schild',           icon: '🛡️', cost: { hout: 10, steen: 4 },       xp: 45,  tier: 1, effect: '1 typfout vergeven per regel',     bonus: { errorForgive: 1 } },
    // === IJZER TIER (Stad) ===
    { id: 'ijzeren_zwaard',  name: 'IJzeren Zwaard',   icon: '🗡️', cost: { ijzer: 6, hout: 4 },        xp: 60,  tier: 2, effect: '+3 woorden minder per regel',     bonus: { wordsDiscount: 3 } },
    { id: 'ijzeren_pickaxe', name: 'IJzeren Houweel',  icon: '⛏️', cost: { ijzer: 8, hout: 4 },        xp: 70,  tier: 2, effect: '+3 ijzer per sessie',             bonus: { sessionResource: 'ijzer', amount: 3 } },
    { id: 'ijzeren_harnas',  name: 'IJzeren Harnas',   icon: '👕', cost: { ijzer: 12 },                xp: 80,  tier: 2, effect: '2 typfouten vergeven per regel',   bonus: { errorForgive: 2 } },
    { id: 'aambeeld',        name: 'Aambeeld',         icon: '🔨', cost: { ijzer: 15 },                xp: 90,  tier: 2, effect: 'Dagelijkse login: +2 ijzer',       bonus: { dailyResource: 'ijzer', dailyAmount: 2 } },
    // === GOUD TIER (Vesting) ===
    { id: 'gouden_zwaard',   name: 'Gouden Zwaard',    icon: '🗡️', cost: { goud: 6, hout: 4 },         xp: 100, tier: 3, effect: 'Extra blok per sessie (4 i.p.v. 3)', bonus: { extraBlock: 1 } },
    { id: 'gouden_pickaxe',  name: 'Gouden Houweel',   icon: '⛏️', cost: { goud: 8, hout: 4 },         xp: 110, tier: 3, effect: '+3 goud per sessie',             bonus: { sessionResource: 'goud', amount: 3 } },
    { id: 'gouden_helm',     name: 'Gouden Helm',      icon: '👑', cost: { goud: 10 },                 xp: 120, tier: 3, effect: 'Dagelijkse login: +2 goud',       bonus: { dailyResource: 'goud', dailyAmount: 2 } },
    { id: 'enchanting_table',name: 'Betoveringstafel',  icon: '📖', cost: { goud: 8, diamant: 1 },      xp: 150, tier: 3, effect: 'Ontgrendelt betoveringen',        unlock: true },
    // === DIAMANT TIER (Legende) ===
    { id: 'diamanten_zwaard',name: 'Diamanten Zwaard',  icon: '⚔️', cost: { diamant: 4, hout: 4 },      xp: 200, tier: 4, effect: 'Extra blok per sessie (5 i.p.v. 3)', bonus: { extraBlock: 2 } },
    { id: 'diamanten_pickaxe',name:'Diamanten Houweel', icon: '⛏️', cost: { diamant: 6, hout: 4 },      xp: 220, tier: 4, effect: '+5 diamant per sessie',          bonus: { sessionResource: 'diamant', amount: 5 } },
    { id: 'diamanten_harnas',name: 'Diamanten Harnas',  icon: '💎', cost: { diamant: 10 },              xp: 250, tier: 4, effect: '3 typfouten vergeven per regel',   bonus: { errorForgive: 3 } },
    { id: 'beacon_item',     name: 'Beacon',           icon: '🌟', cost: { diamant: 5, goud: 10, ijzer: 10 }, xp: 500, tier: 4, effect: 'Alle bonussen verdubbeld!',  bonus: { doubleAll: true } },
];

const MOBS = [
    { name: 'Zombie', icon: '🧟', hp: 5, biome: 'plains' },
    { name: 'Skelet', icon: '💀', hp: 8, biome: 'plains' },
    { name: 'Spin', icon: '🕷️', hp: 6, biome: 'forest' },
    { name: 'Creeper', icon: '💚', hp: 10, biome: 'forest' },
    { name: 'Husk', icon: '🏜️', hp: 12, biome: 'desert' },
    { name: 'Blaze', icon: '🔥', hp: 15, biome: 'nether' },
    { name: 'Ghast', icon: '👻', hp: 20, biome: 'nether' },
    { name: 'Enderman', icon: '🟣', hp: 25, biome: 'end' },
    { name: 'Ender Dragon', icon: '🐉', hp: 50, biome: 'end' }
];

const ACHIEVEMENTS = [
    { id: 'eerste_les', name: 'Eerste Stappen', desc: 'Voltooi je eerste les', icon: '🎯' },
    { id: 'homerow_held', name: 'Home Row Held', desc: 'Type alle home row letters zonder fouten', icon: '🏠' },
    { id: 'snelheidsduivel', name: 'Snelheidsduivel', desc: 'Behaal 30 WPM', icon: '⚡' },
    { id: 'perfectionist', name: 'Perfectionist', desc: '100% nauwkeurigheid in een les', icon: '✨' },
    { id: 'streak_3', name: 'Op Dreef', desc: '3 dagen achter elkaar geoefend', icon: '🔥' },
    { id: 'streak_7', name: 'Weekkampioen', desc: '7 dagen achter elkaar geoefend', icon: '💪' },
    { id: 'streak_30', name: 'Maandmeester', desc: '30 dagen achter elkaar geoefend', icon: '🌟' },
    { id: 'blokkenmaker', name: 'Blokkenmaker', desc: 'Mijn 500 blokken', icon: '🧱' },
    { id: 'craftsman', name: 'Vakman', desc: 'Craft je eerste item', icon: '🔨' },
    { id: 'mob_slayer', name: 'Mob Slayer', desc: 'Versla je eerste mob', icon: '⚔️' },
    { id: 'forest_explorer', name: 'Bosverkenner', desc: 'Unlock het Forest biome', icon: '🌲' },
    { id: 'desert_wanderer', name: 'Woestijnreiziger', desc: 'Unlock het Desert biome', icon: '🏜️' },
    { id: 'nether_survivor', name: 'Nether Overlever', desc: 'Unlock het Nether biome', icon: '🔥' },
    { id: 'ender_champion', name: 'Ender Kampioen', desc: 'Unlock The End biome', icon: '🐉' },
    { id: 'diamant_miner', name: 'Diamantmijnwerker', desc: 'Verdien je eerste diamant', icon: '💎' },
    { id: 'wpm_50', name: 'Typemeester', desc: 'Behaal 50 WPM', icon: '🏆' },
    { id: 'familie_streak', name: 'Familiekracht', desc: 'Alle 3 spelers oefenen op dezelfde dag', icon: '👨‍👧‍👦' }
];

const PARENT_PIN = '1234';

/* ===== IndexedDB Operations ===== */

let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) { resolve(db); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('players')) {
                d.createObjectStore('players', { keyPath: 'id' });
            }
            if (!d.objectStoreNames.contains('sessions')) {
                const s = d.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                s.createIndex('player', 'playerId');
                s.createIndex('date', 'date');
            }
            if (!d.objectStoreNames.contains('settings')) {
                d.createObjectStore('settings', { keyPath: 'key' });
            }
        };
        req.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

async function getPlayer(id) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('players', 'readonly');
        const req = tx.objectStore('players').get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

async function savePlayer(data) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('players', 'readwrite');
        tx.objectStore('players').put(data);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getAllPlayers() {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('players', 'readonly');
        const req = tx.objectStore('players').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveSession(session) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').add(session);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getPlayerSessions(playerId) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('sessions', 'readonly');
        const idx = tx.objectStore('sessions').index('player');
        const req = idx.getAll(playerId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getAllSessions() {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('sessions', 'readonly');
        const req = tx.objectStore('sessions').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getSetting(key) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('settings', 'readonly');
        const req = tx.objectStore('settings').get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : null);
        req.onerror = () => reject(req.error);
    });
}

async function setSetting(key, value) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('settings', 'readwrite');
        tx.objectStore('settings').put({ key, value });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/* ===== Initialize default player data ===== */
async function initPlayerData(id) {
    let player = await getPlayer(id);
    if (!player) {
        player = {
            id,
            name: PLAYERS[id].name,
            age: PLAYERS[id].age,
            level: 1,
            xp: 0,
            xpToNext: 100,
            currentBiome: 0,
            currentLesson: 0,
            totalBlocks: 0,
            bestWpm: 0,
            bestAccuracy: 0,
            streak: 0,
            lastPracticeDate: null,
            resources: { hout: 0, steen: 0, ijzer: 0, goud: 0, diamant: 0 },
            inventory: [],
            achievements: [],
            keyErrors: {},
            totalSessions: 0,
            totalMinutes: 0,
            createdAt: new Date().toISOString()
        };
        await savePlayer(player);
    }
    return player;
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function daysBetween(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}
