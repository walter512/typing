/* ===== TypeCraft Typing Engine ===== */

let engineState = null;

function createEngine(text) {
    engineState = {
        text: text,
        chars: text.split(''),
        pos: 0,
        startTime: null,
        endTime: null,
        correctCount: 0,
        errorCount: 0,
        totalKeystrokes: 0,
        keyErrors: {},
        isComplete: false,
        isPaused: false,
        wordsCompleted: 0,
        currentWordStart: 0,
        blocksMined: 0,
        resourcesEarned: {},
        mobDamageDealt: 0
    };
    return engineState;
}

function engineProcessKey(key) {
    if (!engineState || engineState.isComplete) return null;

    // Start timer on first keypress
    if (!engineState.startTime) {
        engineState.startTime = Date.now();
    }

    engineState.totalKeystrokes++;

    const expected = engineState.chars[engineState.pos];
    const isCorrect = key === expected;

    if (isCorrect) {
        engineState.correctCount++;
        engineState.pos++;
        engineState.blocksMined++;

        // Check if word completed (space or end)
        if (key === ' ' || engineState.pos >= engineState.chars.length) {
            engineState.wordsCompleted++;
            const wordStart = engineState.currentWordStart;
            const wordEnd = engineState.pos;
            const word = engineState.text.substring(wordStart, wordEnd).trim();

            // Award resources based on word length
            const resource = getResourceForWord(word);
            if (resource) {
                engineState.resourcesEarned[resource] = (engineState.resourcesEarned[resource] || 0) + 1;
            }

            engineState.currentWordStart = engineState.pos;

            // Mob damage: each word = 1 damage
            engineState.mobDamageDealt++;
        }

        // Check if lesson complete
        if (engineState.pos >= engineState.chars.length) {
            engineState.isComplete = true;
            engineState.endTime = Date.now();
        }
    } else {
        engineState.errorCount++;
        // Track which key was expected but wrong
        const errorKey = expected.toLowerCase();
        engineState.keyErrors[errorKey] = (engineState.keyErrors[errorKey] || 0) + 1;
    }

    return {
        isCorrect,
        pos: engineState.pos,
        isComplete: engineState.isComplete,
        expected,
        typed: key
    };
}

function getResourceForWord(word) {
    const len = word.length;
    if (len >= 10) return 'diamant';
    if (len >= 8) return 'goud';
    if (len >= 6) return 'ijzer';
    if (len >= 4) return 'steen';
    if (len >= 2) return 'hout';
    return null;
}

function getEngineStats() {
    if (!engineState) return null;

    const elapsed = engineState.startTime
        ? ((engineState.endTime || Date.now()) - engineState.startTime) / 1000 / 60
        : 0;

    const wpm = elapsed > 0
        ? Math.round((engineState.correctCount / 5) / elapsed)
        : 0;

    const accuracy = engineState.totalKeystrokes > 0
        ? Math.round((engineState.correctCount / engineState.totalKeystrokes) * 100)
        : 100;

    const progress = engineState.chars.length > 0
        ? Math.round((engineState.pos / engineState.chars.length) * 100)
        : 0;

    const elapsedSeconds = engineState.startTime
        ? Math.floor(((engineState.endTime || Date.now()) - engineState.startTime) / 1000)
        : 0;

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return {
        wpm,
        accuracy,
        progress,
        elapsed: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        elapsedMinutes: elapsed,
        correctCount: engineState.correctCount,
        errorCount: engineState.errorCount,
        totalKeystrokes: engineState.totalKeystrokes,
        blocksMined: engineState.blocksMined,
        resourcesEarned: { ...engineState.resourcesEarned },
        keyErrors: { ...engineState.keyErrors },
        wordsCompleted: engineState.wordsCompleted,
        mobDamageDealt: engineState.mobDamageDealt,
        isComplete: engineState.isComplete,
        pos: engineState.pos,
        totalChars: engineState.chars.length
    };
}

function resetEngine() {
    engineState = null;
}

/* ===== Keyboard Layout ===== */

const KEYBOARD_LAYOUT = [
    [
        { key: '`', finger: 'left-pinky' },
        { key: '1', finger: 'left-pinky' },
        { key: '2', finger: 'left-ring' },
        { key: '3', finger: 'left-middle' },
        { key: '4', finger: 'left-index' },
        { key: '5', finger: 'left-index' },
        { key: '6', finger: 'right-index' },
        { key: '7', finger: 'right-index' },
        { key: '8', finger: 'right-middle' },
        { key: '9', finger: 'right-ring' },
        { key: '0', finger: 'right-pinky' },
        { key: '-', finger: 'right-pinky' },
        { key: '=', finger: 'right-pinky' }
    ],
    [
        { key: 'q', finger: 'left-pinky' },
        { key: 'w', finger: 'left-ring' },
        { key: 'e', finger: 'left-middle' },
        { key: 'r', finger: 'left-index' },
        { key: 't', finger: 'left-index' },
        { key: 'y', finger: 'right-index' },
        { key: 'u', finger: 'right-index' },
        { key: 'i', finger: 'right-middle' },
        { key: 'o', finger: 'right-ring' },
        { key: 'p', finger: 'right-pinky' }
    ],
    [
        { key: 'a', finger: 'left-pinky' },
        { key: 's', finger: 'left-ring' },
        { key: 'd', finger: 'left-middle' },
        { key: 'f', finger: 'left-index' },
        { key: 'g', finger: 'left-index' },
        { key: 'h', finger: 'right-index' },
        { key: 'j', finger: 'right-index' },
        { key: 'k', finger: 'right-middle' },
        { key: 'l', finger: 'right-ring' },
        { key: ';', finger: 'right-pinky' }
    ],
    [
        { key: 'z', finger: 'left-pinky' },
        { key: 'x', finger: 'left-ring' },
        { key: 'c', finger: 'left-middle' },
        { key: 'v', finger: 'left-index' },
        { key: 'b', finger: 'left-index' },
        { key: 'n', finger: 'right-index' },
        { key: 'm', finger: 'right-index' },
        { key: ',', finger: 'right-middle' },
        { key: '.', finger: 'right-ring' },
        { key: '/', finger: 'right-pinky' }
    ],
    [
        { key: ' ', finger: 'thumb', isSpace: true }
    ]
];

function renderKeyboard(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    KEYBOARD_LAYOUT.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';

        row.forEach(keyDef => {
            const keyEl = document.createElement('div');
            keyEl.className = `key finger-${keyDef.finger}`;
            keyEl.dataset.key = keyDef.key;

            if (keyDef.isSpace) {
                keyEl.classList.add('space-bar');
                keyEl.textContent = 'SPATIE';
            } else {
                keyEl.textContent = keyDef.key;
            }

            rowEl.appendChild(keyEl);
        });

        container.appendChild(rowEl);
    });
}

function highlightKey(key) {
    // Remove all active/error states
    document.querySelectorAll('#keyboard-visual .key').forEach(el => {
        el.classList.remove('active', 'error');
    });

    // Highlight the expected key
    const keyLower = key === ' ' ? ' ' : key.toLowerCase();
    const keyEl = document.querySelector(`#keyboard-visual .key[data-key="${keyLower}"]`);
    if (keyEl) {
        keyEl.classList.add('active');
    }
}

function flashKeyError(key) {
    const keyLower = key === ' ' ? ' ' : key.toLowerCase();
    const keyEl = document.querySelector(`#keyboard-visual .key[data-key="${keyLower}"]`);
    if (keyEl) {
        keyEl.classList.add('error');
        setTimeout(() => keyEl.classList.remove('error'), 300);
    }
}
