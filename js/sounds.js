/* ===== TypeCraft Sound Effects (Web Audio API) ===== */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playTone(freq, duration, type = 'square', volume = 0.15) {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

/* ===== Individual Sound Effects ===== */

function soundKeyCorrect() {
    // Short, satisfying click - like placing a block
    playTone(800, 0.05, 'square', 0.08);
}

function soundKeyError() {
    // Low buzz - like taking damage
    playTone(150, 0.15, 'sawtooth', 0.1);
}

function soundWordComplete() {
    // Quick ascending notes - like picking up an item
    playTone(523, 0.06, 'square', 0.1);
    setTimeout(() => playTone(659, 0.06, 'square', 0.1), 60);
    setTimeout(() => playTone(784, 0.08, 'square', 0.1), 120);
}

function soundBlockMine() {
    // Crunchy block-break sound
    const ctx = getAudioContext();
    if (!soundEnabled || !ctx) return;
    try {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2) * 0.15;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
    } catch (e) {}
}

function soundLevelUp() {
    // Minecraft-style level up jingle
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'square', 0.12), i * 150);
    });
}

function soundAchievement() {
    // Triumphant fanfare
    const notes = [392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.25, 'square', 0.1), i * 120);
    });
}

function soundMobHit() {
    // Impact sound
    playTone(200, 0.1, 'sawtooth', 0.12);
    setTimeout(() => playTone(150, 0.08, 'square', 0.08), 50);
}

function soundMobDefeat() {
    // Descending dramatic notes
    const notes = [784, 659, 523, 392, 262];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'square', 0.1), i * 100);
    });
    setTimeout(() => soundAchievement(), 600);
}

function soundLessonComplete() {
    // Happy completion melody
    const melody = [523, 587, 659, 784, 659, 784, 1047];
    melody.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.18, 'square', 0.1), i * 130);
    });
}

function soundCraft() {
    // Anvil-like crafting sound
    playTone(300, 0.08, 'square', 0.12);
    setTimeout(() => playTone(600, 0.06, 'square', 0.1), 80);
    setTimeout(() => playTone(900, 0.1, 'square', 0.08), 160);
}

function soundResourceEarned() {
    // Cheerful pickup sound — coin/item collect
    playTone(784, 0.06, 'square', 0.1);
    setTimeout(() => playTone(988, 0.06, 'square', 0.1), 70);
    setTimeout(() => playTone(1175, 0.1, 'triangle', 0.08), 140);
}

function soundButtonClick() {
    playTone(600, 0.04, 'square', 0.06);
}

function soundStreakBonus() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.12, 'triangle', 0.08), i * 80);
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}
