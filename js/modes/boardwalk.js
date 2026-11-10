import { GameState } from '../state.js';
import { MathEngine } from '../math.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';

const TOTAL_BRIDGES_PER_ROUND = 8;
const FAST_HOP_WINDOW = 4.5; // < 4.5s on first try = Surf Backflip Bonus (+3 Bones!)
const STEADY_HOP_WINDOW = 9.0; // < 9.0s = Steady Hop (+2 Bones), > 9.0s = (+1 Bone)
const HINT_APPEAR_SEC = 4.0; // Show the +step / -step labels on the hop arcs after 4.0s or on mistake

const DIRECTIONS = ['top', 'left', 'bottom', 'right'];

const PLANK_COLORS = [
  { fill: '#fde68a', border: '#b45309', grain: '#f59e0b' },
  { fill: '#fed7aa', border: '#c2410c', grain: '#fb923c' },
  { fill: '#fef08a', border: '#a16207', grain: '#eab308' },
];

const CHEER_FRIENDS = [
  { breed: 'husky', name: 'Surfer Koda', hat: 'shades' },
  { breed: 'corgi', name: 'Beach Cheddar', hat: 'crown' },
  { breed: 'dalmatian', name: 'Lifeguard Pongo', hat: 'shades' },
  { breed: 'poodle', name: 'Sunhat Gigi', hat: 'wizard' },
  { breed: 'pug', name: 'Boardwalk Pudge', hat: 'chef' },
  { breed: 'golden', name: 'Captain Biscuit', hat: 'shades' },
];

const CHEER_CAT_FRIENDS = [
  { breed: 'orange_tabby', name: 'Surfer Marmalade', hat: 'shades' },
  { breed: 'siamese', name: 'Beach Suki', hat: 'crown' },
  { breed: 'tuxedo', name: 'Lifeguard Figaro', hat: 'shades' },
  { breed: 'persian', name: 'Sunhat Duchess', hat: 'wizard' },
  { breed: 'bengal', name: 'Boardwalk Rajah', hat: 'chef' },
  { breed: 'maine_coon', name: 'Captain Acorn', hat: 'shades' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getNormalizedDiamondLabels() {
  const raw = InputManager.getDiamondLabels ? InputManager.getDiamondLabels() : {};
  const defaults = {
    top: { key: 'X', label: 'X', color: '#3b82f6' },
    left: { key: 'Y', label: 'Y', color: '#10b981' },
    bottom: { key: 'B', label: 'B', color: '#f59e0b' },
    right: { key: 'A', label: 'A', color: '#ef4444' },
  };
  const out = {};
  for (const dir of DIRECTIONS) {
    const item = raw[dir] || defaults[dir];
    const text = item.key || item.label || defaults[dir].key;
    out[dir] = {
      ...item,
      key: text,
      label: text,
      color: item.color || defaults[dir].color,
    };
  }
  return out;
}

/**
 * Generates 4 distinct choices for a missing number in an arithmetic sequence,
 * prioritizing plausible wrong-step or off-by-1 values that still fit between
 * the neighboring terms when possible.
 */
function generateSequenceDiamondChoices(answer, sequence, missingIdx, step) {
  const chosen = new Set([answer]);
  const absStep = Math.abs(step);

  // Determine strict bounds between neighbors if blank is interior and step is wide enough
  let strictMin = 1;
  let strictMax = 150;
  if (missingIdx > 0 && missingIdx < sequence.length - 1) {
    const leftVal = sequence[missingIdx - 1];
    const rightVal = sequence[missingIdx + 1];
    strictMin = Math.min(leftVal, rightVal) + 1;
    strictMax = Math.max(leftVal, rightVal) - 1;
  }

  // Plausible distractors: off by ±1, ±2, or adding (step ± 1) / (step ± 2) to the previous number
  const prevVal = missingIdx > 0 ? sequence[missingIdx - 1] : answer - step;
  const candidateValues = shuffle([
    answer - 1,
    answer + 1,
    answer - 2,
    answer + 2,
    prevVal + (step > 0 ? absStep - 1 : -(absStep - 1)),
    prevVal + (step > 0 ? absStep + 1 : -(absStep + 1)),
    answer - 3,
    answer + 3,
    answer + (step > 0 ? 10 : -10),
  ]);

  // First pass: keep distractors strictly between neighbor bounds if possible
  for (const val of candidateValues) {
    if (chosen.size >= 4) break;
    if (val >= strictMin && val <= strictMax && val > 0) {
      chosen.add(val);
    }
  }

  // Second pass: allow close positive neighbors if interval was narrow (e.g. step = ±2)
  for (const val of candidateValues) {
    if (chosen.size >= 4) break;
    if (val > 0 && !sequence.includes(val)) {
      chosen.add(val);
    }
  }

  for (let delta = 1; chosen.size < 4 && delta <= 25; delta++) {
    if (answer + delta > 0) chosen.add(answer + delta);
    if (chosen.size < 4 && answer - delta > 0) chosen.add(answer - delta);
  }

  const values = shuffle([...chosen]);
  const result = {};
  let correctDir = 'top';
  for (let i = 0; i < 4; i++) {
    const dir = DIRECTIONS[i];
    result[dir] = values[i];
    if (values[i] === answer) {
      correctDir = dir;
    }
  }
  result.correctDir = correctDir;
  return result;
}

export class BoardwalkScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.game = null;
    this.locationId = 'cafe_beach';
    this.onExit = null;

    this._applyOptions(arg1);
    this._applyOptions(arg2);

    this.particles = new ParticleSystem();
    this.time = 0;
    this.canvasW = 960;
    this.canvasH = 600;
    this.diamondBounds = null;

    this.bridgesCrossed = 0;
    this.roundTreatsEarned = 0;
    this.fastBridgesCount = 0;
    this.mistakesThisRound = 0;
    this.starsEarned = 0;
    this.lastSequenceKey = null;

    this.cheerFriend = CHEER_FRIENDS[0];
    this.puzzle = null;
    this.disabledDirs = [];
    this.highlightDir = null;
    this.orderTimer = 0;
    this.hintPlayed = false;

    // Phases: 'intro_hop' -> 'asking' -> 'plank_drop' -> 'pier_cross' -> 'summary'
    this.phase = 'asking';
    this.animTimer = 0;
    this.introTimer = 0;
    this.lastReward = 3;
    this.dogMood = 'excited';
    this.dogFlipProgress = 0;

    this.startNewRound();
  }

  _applyOptions(opts) {
    if (!opts) return;
    if (typeof opts === 'function') {
      this.onExit = opts;
      return;
    }
    if (typeof opts === 'object') {
      if (opts.game || opts.app) this.game = opts.game || opts.app;
      if (typeof opts.locationId === 'string') this.locationId = opts.locationId;
      const exitFn = opts.onExit || opts.onBack || opts.onComplete;
      if (typeof exitFn === 'function') this.onExit = exitFn;
    }
  }

  enter(opts = {}) {
    this._applyOptions(opts);
    InputManager.setDiamondMode(true);
    this.startNewRound();
  }

  init(opts = {}) {
    this.enter(opts);
  }

  exit() {
    InputManager.clearClickZones();
  }

  startNewRound() {
    InputManager.setDiamondMode(true);
    InputManager.clearClickZones();
    this.particles.clear();

    this.bridgesCrossed = 0;
    this.roundTreatsEarned = 0;
    this.fastBridgesCount = 0;
    this.mistakesThisRound = 0;
    this.starsEarned = 0;

    this._spawnNextBridge();
  }

  /**
   * Generates a 6-stone arithmetic sequence puzzle such as:
   *   2, 5, 8, 11, _, 17  (step +3, missing 14)
   *   30, 26, 22, _, 14, 10 (step -4, missing 18)
   *   4, 9, 14, _, 24, 29 (step +5, missing 19)
   */
  _generateSequencePuzzle(bridgeIndex) {
    let candidates = [];

    if (bridgeIndex < 3) {
      // Warm-up: +2, +3, +5, +10, -2, -5 from varied starting points
      candidates = [
        { step: 2, minStart: 1, maxStart: 15 },
        { step: 3, minStart: 1, maxStart: 10 },
        { step: 5, minStart: 2, maxStart: 15 },
        { step: 10, minStart: 3, maxStart: 25 },
        { step: -2, minStart: 16, maxStart: 28 },
        { step: -5, minStart: 30, maxStart: 45 },
      ];
    } else if (bridgeIndex < 6) {
      // Mid-round: classic non-multiple arithmetic sequences (+3, +4, +5, +6, -3, -4)
      candidates = [
        { step: 3, minStart: 2, maxStart: 14 },
        { step: 4, minStart: 1, maxStart: 15 },
        { step: 5, minStart: 1, maxStart: 18 },
        { step: 6, minStart: 2, maxStart: 12 },
        { step: -3, minStart: 21, maxStart: 35 },
        { step: -4, minStart: 26, maxStart: 40 },
      ];
    } else {
      // Late-round challenge: +4, +6, +7, +8, +9, -4, -6
      candidates = [
        { step: 4, minStart: 6, maxStart: 22 },
        { step: 6, minStart: 3, maxStart: 16 },
        { step: 7, minStart: 2, maxStart: 12 },
        { step: 8, minStart: 2, maxStart: 11 },
        { step: 9, minStart: 3, maxStart: 10 },
        { step: -4, minStart: 28, maxStart: 44 },
        { step: -6, minStart: 36, maxStart: 48 },
      ];
    }

    let picked = candidates[randomInt(0, candidates.length - 1)];
    let start = randomInt(picked.minStart, picked.maxStart);
    let step = picked.step;

    // Pick missing index in 2..5 so the player always sees at least two adjacent numbers on the left
    const missingChoices = [2, 3, 4, 4, 5];
    const missingIdx = missingChoices[randomInt(0, missingChoices.length - 1)];

    // Avoid repeating the exact same start/step back-to-back
    const seqKey = `seq:${start}:${step}:${missingIdx}`;
    if (seqKey === this.lastSequenceKey) {
      start += step > 0 ? 1 : -1;
    }
    this.lastSequenceKey = `seq:${start}:${step}:${missingIdx}`;

    const sequence = Array.from({ length: 6 }, (_, i) => start + i * step);
    const answer = sequence[missingIdx];
    const stepSign = step > 0 ? `+${step}` : `${step}`;
    const prevVal = sequence[missingIdx - 1];
    const nextVal = missingIdx < 5 ? sequence[missingIdx + 1] : null;

    const choices =
      MathEngine.generateDiamondChoices && Math.abs(step) <= 1
        ? MathEngine.generateDiamondChoices(answer, 1, answer + 10)
        : generateSequenceDiamondChoices(answer, sequence, missingIdx, step);

    return {
      sequence,
      missingIdx,
      answer,
      step,
      stepSign,
      prevVal,
      nextVal,
      choices,
      factKey: `seq_${stepSign}`,
    };
  }

  _spawnNextBridge() {
    this.puzzle = this._generateSequencePuzzle(this.bridgesCrossed);
    const pool = GameState.theme === 'cat' ? CHEER_CAT_FRIENDS : CHEER_FRIENDS;
    this.cheerFriend = pool[this.bridgesCrossed % pool.length];
    this.disabledDirs = [];
    this.highlightDir = null;
    this.orderTimer = 0;
    this.introTimer = 0;
    this.hintPlayed = false;
    this.phase = 'asking';
    this.animTimer = 0;
    this.dogMood = 'excited';
    this.dogFlipProgress = 0;

    SoundFX?.bark?.(1.1);
  }

  _returnToMap() {
    SoundFX?.step?.();
    InputManager.clearClickZones();
    if (typeof this.onExit === 'function') {
      this.onExit();
      return;
    }
    if (this.game && typeof this.game.goToMap === 'function') {
      this.game.goToMap();
    } else if (typeof window !== 'undefined' && window.puppyApp) {
      window.puppyApp.goToMap();
    }
  }

  handleClick(x, y) {
    if (x >= 16 && x <= 172 && y >= 8 && y <= 50) {
      this._returnToMap();
      return true;
    }
    if (this.phase === 'asking' && this.diamondBounds) {
      for (const dir of DIRECTIONS) {
        const b = this.diamondBounds[dir];
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this._handleAnswer(dir);
          return true;
        }
      }
    }
    return false;
  }

  onClick(x, y) {
    return this.handleClick(x, y);
  }

  update(dt) {
    const dtSec = typeof dt === 'number' && dt > 0 ? (dt > 1 ? dt / 1000 : dt) : 0.016;
    const safeDt = Math.min(dtSec, 0.1);
    this.time += safeDt;
    this.particles.update(safeDt);

    if (this.phase === 'summary') {
      if (
        InputManager.justPressed('confirm') ||
        InputManager.justPressed('bottom') ||
        InputManager.justPressed('right') ||
        InputManager.justPressed('start')
      ) {
        SoundFX?.bark?.(1.15);
        this.startNewRound();
        return;
      }
      if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
        this._returnToMap();
        return;
      }
      return;
    }

    if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
      this._returnToMap();
      return;
    }

    if (this.phase === 'asking') {
      this.orderTimer += safeDt;
      this.introTimer = Math.min(1, this.introTimer + safeDt * 1.45);

      const hasMistake = this.disabledDirs.length > 0;
      if (hasMistake || this.orderTimer >= STEADY_HOP_WINDOW) {
        this.dogMood = 'impatient';
      } else if (this.orderTimer <= FAST_HOP_WINDOW) {
        this.dogMood = 'excited';
      } else {
        this.dogMood = 'waiting';
      }

      if ((hasMistake || this.orderTimer >= HINT_APPEAR_SEC) && !this.hintPlayed) {
        this.hintPlayed = true;
      }

      if (InputManager.justPressed('top')) {
        this._handleAnswer('top');
      } else if (InputManager.justPressed('left')) {
        this._handleAnswer('left');
      } else if (InputManager.justPressed('bottom')) {
        this._handleAnswer('bottom');
      } else if (InputManager.justPressed('right')) {
        this._handleAnswer('right');
      }
      return;
    }

    if (this.phase === 'plank_drop') {
      this.animTimer += safeDt;
      if (this.animTimer >= 0.55) {
        this.phase = 'pier_cross';
        this.animTimer = 0;
        SoundFX?.treatToss?.();
      }
      return;
    }

    if (this.phase === 'pier_cross') {
      this.animTimer += safeDt;
      if (this.animTimer >= 0.25 && this.dogMood !== 'zoomies' && this.dogMood !== 'munching') {
        if (this.lastReward >= 3) {
          this.dogMood = 'zoomies';
          SoundFX?.zoomies?.();
          this.particles.emitHearts(850, 210, 10);
          this.particles.emitStars(850, 210, 18);
          this.particles.addFloatingText(
            480,
            150,
            'SURF BACKFLIP! +3 BONES! 🌊',
            '#0284c7',
            1.15
          );
        } else {
          this.dogMood = 'munching';
          SoundFX?.munch?.();
          this.particles.emitStars(850, 215, 10);
          this.particles.addFloatingText(
            480,
            150,
            `BRIDGE COMPLETE! +${this.lastReward} BONE${this.lastReward > 1 ? 'S' : ''}! 🪵`,
            '#16a34a',
            1.1
          );
        }
      }

      if (this.animTimer > 0.2 && this.lastReward >= 3) {
        this.dogFlipProgress = Math.min(1, (this.animTimer - 0.2) / 0.65);
      }

      if (this.animTimer >= 1.15) {
        this.bridgesCrossed += 1;
        if (this.bridgesCrossed >= TOTAL_BRIDGES_PER_ROUND) {
          this._finishRound();
        } else {
          this._spawnNextBridge();
        }
      }
    }
  }

  _getPlankPosition(index) {
    // 6 planks spaced across x = 195 .. 755
    const startX = 195;
    const spacing = 112;
    return {
      x: startX + index * spacing,
      y: 266,
    };
  }

  _handleAnswer(dir) {
    if (!this.puzzle || this.disabledDirs.includes(dir)) return;

    const picked = this.puzzle.choices[dir];
    const elapsedMs = Math.round(this.orderTimer * 1000);

    if (picked === this.puzzle.answer) {
      const firstTry = this.disabledDirs.length === 0;
      GameState.recordFactResult(this.puzzle.factKey, firstTry, elapsedMs);
      this.highlightDir = dir;

      if (firstTry && this.orderTimer <= FAST_HOP_WINDOW) {
        this.lastReward = 3;
        this.fastBridgesCount += 1;
      } else if (firstTry && this.orderTimer <= STEADY_HOP_WINDOW) {
        this.lastReward = 2;
      } else {
        this.lastReward = 1;
      }

      this.roundTreatsEarned += this.lastReward;
      GameState.addTreats(this.lastReward);

      const gapPos = this._getPlankPosition(this.puzzle.missingIdx);
      SoundFX?.correct?.();
      this.particles.emitStars(gapPos.x, gapPos.y - 16, 18);
      this.phase = 'plank_drop';
      this.animTimer = 0;
      this.dogMood = 'excited';
    } else {
      this.disabledDirs.push(dir);
      this.mistakesThisRound += 1;
      this.dogMood = 'impatient';
      GameState.recordFactResult(this.puzzle.factKey, false, elapsedMs);
      SoundFX?.oops?.();
    }
  }

  _finishRound() {
    this.phase = 'summary';
    this.animTimer = 0;

    if (this.mistakesThisRound <= 1) {
      this.starsEarned = 3;
    } else if (this.mistakesThisRound <= 4) {
      this.starsEarned = 2;
    } else {
      this.starsEarned = 1;
    }

    const prevStars = GameState.parkStars[this.locationId] || 0;
    GameState.parkStars[this.locationId] = Math.max(prevStars, this.starsEarned);
    GameState.save();

    SoundFX?.levelComplete?.();
    this.particles.emitConfetti(this.canvasW / 2, 220, 45);
    this.particles.emitStars(this.canvasW / 2, 200, 20);
  }

  draw(ctx, canvas) {
    this.render(ctx, canvas);
  }

  render(ctx, canvas) {
    const w = canvas?.width || ctx.canvas?.width || 960;
    const h = canvas?.height || ctx.canvas?.height || 600;
    this.canvasW = w;
    this.canvasH = h;

    InputManager.clearClickZones();

    this._drawOceanPierBackground(ctx, w, h);
    this._drawTopHud(ctx, w);
    this._drawPromptBanner(ctx, w);
    this._drawSequencePierBridge(ctx, w);
    this._drawHoppingHeroPet(ctx);
    this._drawBottomDiamondArea(ctx, w, h);

    this.particles.draw(ctx);

    if (this.phase === 'summary') {
      this._drawSummaryModal(ctx, w, h);
    }
  }

  _drawOceanPierBackground(ctx, w, h) {
    // Sunny sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 175);
    skyGrad.addColorStop(0, '#7dd3fc');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, 175);

    // Fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (const [cx, cy, rx] of [
      [160, 120, 42],
      [480, 112, 50],
      [790, 122, 44],
    ]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 22, cy - 6, rx * 0.65, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Deep sparkling ocean water under the pier bridge
    const seaGrad = ctx.createLinearGradient(0, 170, 0, 358);
    seaGrad.addColorStop(0, '#0284c7');
    seaGrad.addColorStop(0.45, '#06b6d4');
    seaGrad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 170, w, 190);

    // Animated whitecap wave ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;
    for (let row = 0; row < 3; row++) {
      const wy = 205 + row * 52;
      for (let x = 35; x < w - 30; x += 110) {
        const waveX = x + Math.sin(this.time * 2.2 + x * 0.03 + row) * 12;
        ctx.beginPath();
        ctx.arc(waveX, wy, 16, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    }

    // Golden sandy boardwalk deck at bottom for the SNES controller
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 356, w, 10);

    const sandGrad = ctx.createLinearGradient(0, 366, 0, h);
    sandGrad.addColorStop(0, '#fef3c7');
    sandGrad.addColorStop(1, '#fde68a');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, 366, w, h - 366);
  }

  _drawTopHud(ctx, w) {
    const backRect = { x: 16, y: 8, w: 152, h: 40 };
    InputManager.registerClickZone('cancel', backRect.x, backRect.y, backRect.w, backRect.h);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(backRect.x, backRect.y, backRect.w, backRect.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬅ Island Map', backRect.x + backRect.w / 2, backRect.y + backRect.h / 2);

    // Header pill
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 235, 8, 470, 40, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0e7490';
    ctx.font = 'bold 17px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `🌊 Boardwalk Pier Hop — Bridge ${Math.min(this.bridgesCrossed + 1, TOTAL_BRIDGES_PER_ROUND)} of ${TOTAL_BRIDGES_PER_ROUND}`,
      w / 2,
      29
    );

    // Golden Bones counter (top-right)
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(w - 186, 8, 170, 40, 12);
    ctx.fill();
    ctx.stroke();

    Sprites.drawBoneTreat(ctx, w - 158, 28, 0.78, -0.2, '#fde047');
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${GameState.treats}`, w - 130, 29);
    ctx.restore();
  }

  _drawPromptBanner(ctx, w) {
    if (!this.puzzle) return;
    const p = this.puzzle;
    const solved = this.phase === 'plank_drop' || this.phase === 'pier_cross';
    const showHint = solved || this.disabledDirs.length > 0 || this.orderTimer >= HINT_APPEAR_SEC;

    const seqDisplay = p.sequence
      .map((n, idx) => (idx === p.missingIdx && !solved ? '__' : String(n)))
      .join(',  ');

    let text = '';
    let border = '#0284c7';
    let bg = '#f0f9ff';

    if (solved) {
      text = `✨ Pattern Solved! (${p.stepSign} each hop):  ${seqDisplay} ✨`;
      border = '#10b981';
      bg = '#ecfdf5';
    } else if (showHint) {
      text = `💡 Rule Hint: Each plank hops by ${p.stepSign}! (${p.prevVal} ${p.step > 0 ? '+' : '-'} ${Math.abs(p.step)} = ?)   →   ${seqDisplay}`;
      border = '#f59e0b';
      bg = '#fffbeb';
    } else {
      text = `🪵 Find the Missing Plank in the Sequence:   ${seqDisplay}`;
    }

    ctx.save();
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(20, 54, w - 40, 42, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, 75);
    ctx.restore();
  }

  _drawSequencePierBridge(ctx, w) {
    if (!this.puzzle) return;
    const p = this.puzzle;
    const solved = this.phase === 'plank_drop' || this.phase === 'pier_cross';
    const showHint = solved || this.disabledDirs.length > 0 || this.orderTimer >= HINT_APPEAR_SEC;

    ctx.save();

    // Left wooden dock platform
    this._drawDockPlatform(ctx, 16, 244, 110, 88, 'START');

    // Right wooden dock platform with Treasure / Treat goal
    this._drawDockPlatform(ctx, w - 126, 244, 110, 88, 'GOAL!');
    Sprites.drawBoneTreat(ctx, w - 72, 224, 1.05, Math.sin(this.time * 4) * 0.15, '#fde047');

    // Rope bridge cables connecting the planks
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(116, 268);
    ctx.lineTo(w - 116, 268);
    ctx.moveTo(116, 294);
    ctx.lineTo(w - 116, 294);
    ctx.stroke();

    // Draw curved hop-arcs between adjacent planks (i -> i+1)
    for (let i = 0; i < 5; i++) {
      const posA = this._getPlankPosition(i);
      const posB = this._getPlankPosition(i + 1);
      const midX = (posA.x + posB.x) / 2;
      const arcTopY = 135;

      const touchesMissing = i === p.missingIdx || i + 1 === p.missingIdx;
      const showThisArcLabel = solved || showHint || !touchesMissing;

      ctx.save();
      ctx.strokeStyle = solved
        ? '#10b981'
        : touchesMissing
        ? '#f59e0b'
        : 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      if (touchesMissing && !solved) {
        ctx.setLineDash([6, 4]);
      }
      ctx.beginPath();
      ctx.moveTo(posA.x + 12, posA.y - 36);
      ctx.quadraticCurveTo(midX, arcTopY, posB.x - 12, posB.y - 36);
      ctx.stroke();
      ctx.setLineDash([]);

      // Little arrowhead pointing right at posB
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(posB.x - 10, posB.y - 34);
      ctx.lineTo(posB.x - 20, posB.y - 42);
      ctx.lineTo(posB.x - 18, posB.y - 31);
      ctx.closePath();
      ctx.fill();

      // Step badge on the hop arc (+3, -4, or ?)
      if (showThisArcLabel) {
        const badgeText = solved || showHint ? p.stepSign : '?';
        const badgeW = 48;
        const badgeH = 26;
        ctx.fillStyle = solved ? '#dcfce7' : showHint ? '#fef08a' : '#e0f2fe';
        ctx.strokeStyle = solved ? '#16a34a' : showHint ? '#d97706' : '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(midX - badgeW / 2, arcTopY + 6, badgeW, badgeH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = solved ? '#15803d' : showHint ? '#92400e' : '#0369a1';
        ctx.font = '900 15px "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, midX, arcTopY + 19);
      }
      ctx.restore();
    }

    // Draw the 6 sequence planks
    for (let i = 0; i < 6; i++) {
      const pos = this._getPlankPosition(i);
      const isMissingSlot = i === p.missingIdx;
      const val = p.sequence[i];
      const palette = PLANK_COLORS[i % PLANK_COLORS.length];

      // Wooden pilings in the water below each plank
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.fillRect(pos.x - 28, pos.y + 18, 14, 52);
      ctx.strokeRect(pos.x - 28, pos.y + 18, 14, 52);
      ctx.fillRect(pos.x + 14, pos.y + 18, 14, 52);
      ctx.strokeRect(pos.x + 14, pos.y + 18, 14, 52);

      // Water foam ring around pilings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 68, 38, 6, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (isMissingSlot && !solved) {
        // Floating mystery gap with bobbing life ring
        const bobY = Math.sin(this.time * 5) * 4;
        ctx.save();
        ctx.translate(pos.x, pos.y + bobY);

        ctx.fillStyle = 'rgba(254, 249, 195, 0.92)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.roundRect(-44, -30, 88, 60, 16);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#d97706';
        ctx.font = '900 32px "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 2);
        ctx.restore();
      } else {
        // Solid numbered wooden pier plank
        let dropOffsetY = 0;
        let scale = 1;
        if (isMissingSlot && this.phase === 'plank_drop') {
          const t = Math.min(1, this.animTimer / 0.35);
          dropOffsetY = (1 - t) * -65;
          scale = 1 + Math.sin(t * Math.PI) * 0.18;
        }

        ctx.save();
        ctx.translate(pos.x, pos.y + dropOffsetY);
        ctx.scale(scale, scale);

        ctx.fillStyle = isMissingSlot ? '#dcfce7' : palette.fill;
        ctx.strokeStyle = isMissingSlot ? '#16a34a' : palette.border;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(-44, -30, 88, 60, 14);
        ctx.fill();
        ctx.stroke();

        // Nail heads in corners
        ctx.fillStyle = isMissingSlot ? '#15803d' : '#92400e';
        for (const [nx, ny] of [
          [-34, -20],
          [34, -20],
          [-34, 20],
          [34, 20],
        ]) {
          ctx.beginPath();
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Plank number
        ctx.fillStyle = isMissingSlot ? '#14532d' : '#1e293b';
        ctx.font = '900 30px "Comic Sans MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(val), 0, 2);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  _drawDockPlatform(ctx, x, y, w, h, label) {
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.fillRect(x + 16, y + 36, 18, h - 20);
    ctx.strokeRect(x + 16, y + 36, 18, h - 20);
    ctx.fillRect(x + w - 34, y + 36, 18, h - 20);
    ctx.strokeRect(x + w - 34, y + 36, 18, h - 20);

    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = '900 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + 22);
    ctx.restore();
  }

  _drawHoppingHeroPet(ctx) {
    if (!this.puzzle) return;
    const p = this.puzzle;
    const hasLeftPlank = p.missingIdx > 0;
    const stopIdx = Math.max(0, p.missingIdx - 1);
    const stopPos = hasLeftPlank
      ? this._getPlankPosition(stopIdx)
      : { x: 72, y: 266 };
    const basePetY = stopPos.y - 50;

    let petX = stopPos.x;
    let petY = basePetY;

    if (this.phase === 'asking' && this.introTimer < 1 && hasLeftPlank) {
      // Hop from the left dock (x=72) across the planks up to stopIdx
      const startX = 72;
      const totalHops = stopIdx + 1;
      const hopFloat = this.introTimer * totalHops;
      const hopStep = Math.floor(hopFloat);
      const hopFrac = hopFloat - hopStep;

      const fromX = hopStep === 0 ? startX : this._getPlankPosition(hopStep - 1).x;
      const toX = this._getPlankPosition(Math.min(stopIdx, hopStep)).x;
      petX = fromX + (toX - fromX) * hopFrac;
      petY = basePetY - Math.sin(hopFrac * Math.PI) * 32;
    } else if (this.phase === 'plank_drop') {
      // Little excited anticipation bounce before crossing
      petY = basePetY - Math.abs(Math.sin(this.animTimer * 14)) * 14;
    } else if (this.phase === 'pier_cross') {
      // Hop from stopPos across the newly placed plank to the Goal dock (x=885)
      const endX = 885;
      const remHops = 6 - stopIdx;
      const prog = Math.min(1, this.animTimer / 0.95);
      const hopFloat = prog * remHops;
      const hopFrac = hopFloat - Math.floor(hopFloat);
      petX = stopPos.x + (endX - stopPos.x) * prog;
      petY = basePetY - Math.sin(hopFrac * Math.PI) * 38;
    }

    Sprites.drawDog(ctx, petX, petY, {
      breed: GameState.selectedBreed,
      hat: GameState.selectedHat,
      gear: GameState.getEquippedGear(GameState.selectedBreed),
      scale: 0.72,
      mood: this.dogMood,
      wagSpeed: 2.4,
      facing: 'right',
      flipProgress: this.dogFlipProgress,
      time: this.time,
    });
  }

  _drawBottomDiamondArea(ctx, w, h) {
    this._drawSequenceHelperCard(ctx);

    if (!this.puzzle) return;
    const centerX = w / 2 + 105;
    const centerY = h - 116;

    const labels = getNormalizedDiamondLabels();
    this.diamondBounds = Sprites.drawDiamondController(
      ctx,
      centerX,
      centerY,
      this.puzzle.choices,
      labels,
      {
        disabledDirs: this.disabledDirs,
        highlightDir: this.highlightDir,
        time: this.time,
        radiusX: 150,
        radiusY: 68,
        buttonWidth: 138,
        buttonHeight: 66,
      }
    );

    if (this.phase === 'asking' && this.diamondBounds) {
      for (const dir of DIRECTIONS) {
        const b = this.diamondBounds[dir];
        if (b && !this.disabledDirs.includes(dir)) {
          InputManager.registerClickZone(dir, b.x, b.y, b.w, b.h);
        }
      }
    }
  }

  _drawSequenceHelperCard(ctx) {
    if (!this.puzzle) return;
    const p = this.puzzle;
    const solved = this.phase === 'plank_drop' || this.phase === 'pier_cross';
    const hasMistake = this.disabledDirs.length > 0;
    const showHint = solved || hasMistake || this.orderTimer >= HINT_APPEAR_SEC;

    const cardX = 18;
    const cardY = 378;
    const cardW = 310;
    const cardH = 200;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0e7490';
    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧭 Sequence Detective', cardX + cardW / 2, cardY + 24);

    // Step explanation box
    ctx.fillStyle = showHint ? '#fef9c3' : '#f0f9ff';
    ctx.strokeStyle = showHint ? '#eab308' : '#bae6fd';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cardX + 14, cardY + 40, cardW - 28, 70, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14.5px "Comic Sans MS", sans-serif';
    const n0 = p.sequence[0];
    const n1 = p.sequence[1];
    ctx.fillText(
      showHint
        ? `From ${n0} to ${n1} is a hop of ${p.stepSign}`
        : `Find the hop size from ${n0} to ${n1}!`,
      cardX + cardW / 2,
      cardY + 62
    );

    ctx.fillStyle = solved ? '#15803d' : '#0369a1';
    ctx.font = '900 18px "Comic Sans MS", sans-serif';
    ctx.fillText(
      solved
        ? `${p.prevVal} ${p.step > 0 ? '+' : '-'} ${Math.abs(p.step)} = ${p.answer}!`
        : showHint
        ? `Next hop: ${p.prevVal} ${p.step > 0 ? '+' : '-'} ${Math.abs(p.step)} = ?`
        : `Then hop from ${p.prevVal} → [ ? ]`,
      cardX + cardW / 2,
      cardY + 92
    );

    // Speed bonus meter bar
    const barX = cardX + 16;
    const barY = cardY + 122;
    const barW = cardW - 32;
    const barH = 26;

    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 8);
    ctx.fill();
    ctx.stroke();

    let fillFrac = 1;
    let barColor = '#22c55e';
    let barLabel = '★ FAST HOP: +3 BONES!';

    if (solved) {
      fillFrac = 1;
      barColor = '#10b981';
      barLabel = `★ CROSSED! +${this.lastReward} BONES!`;
    } else if (hasMistake || this.orderTimer >= STEADY_HOP_WINDOW) {
      fillFrac = 0.25;
      barColor = '#f97316';
      barLabel = '🪵 KEEP HOPPING (+1 Bone)';
    } else if (this.orderTimer <= FAST_HOP_WINDOW) {
      fillFrac = 0.5 + 0.5 * (1 - this.orderTimer / FAST_HOP_WINDOW);
      barColor = '#22c55e';
      barLabel = '★ SURF BACKFLIP: +3 BONES!';
    } else {
      const prog = Math.min(
        1,
        (this.orderTimer - FAST_HOP_WINDOW) / (STEADY_HOP_WINDOW - FAST_HOP_WINDOW)
      );
      fillFrac = 0.5 - 0.25 * prog;
      barColor = '#38bdf8';
      barLabel = '★ STEADY HOP: +2 BONES';
    }

    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, Math.max(14, (barW - 4) * fillFrac), barH - 4, 6);
    ctx.fillStyle = barColor;
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12.5px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(barLabel, barX + barW / 2, barY + barH / 2 + 0.5);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13.5px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Fast Backflips: ${this.fastBridgesCount}/${TOTAL_BRIDGES_PER_ROUND}  •  Round Bones: +${this.roundTreatsEarned}`,
      cardX + cardW / 2,
      cardY + 174
    );

    ctx.restore();
  }

  _drawSummaryModal(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, w, h);

    const cardW = 540;
    const cardH = 380;
    const cardX = (w - cardW) / 2;
    const cardY = (h - cardH) / 2;

    ctx.fillStyle = '#f0f9ff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0e7490';
    ctx.font = '900 32px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌊 Pier Sequence Champion! 🌊', w / 2, cardY + 50);

    for (let i = 0; i < 3; i++) {
      const sx = w / 2 + (i - 1) * 72;
      const sy = cardY + 110;
      const earned = i < this.starsEarned;
      ctx.font = '48px sans-serif';
      ctx.fillText(earned ? '⭐' : '☆', sx, sy);
    }

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 21px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `All ${TOTAL_BRIDGES_PER_ROUND} Sequence Bridges Crossed!`,
      w / 2,
      cardY + 168
    );
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 19px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Fast Surf Backflips: ${this.fastBridgesCount} of ${TOTAL_BRIDGES_PER_ROUND}`,
      w / 2,
      cardY + 202
    );
    ctx.fillStyle = '#b45309';
    ctx.font = '900 23px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Golden Bones Earned: +${this.roundTreatsEarned}`,
      w / 2,
      cardY + 238
    );

    const playBtn = { x: cardX + 45, y: cardY + 280, w: 210, h: 60 };
    const mapBtn = { x: cardX + 285, y: cardY + 280, w: 210, h: 60 };

    InputManager.registerClickZone('confirm', playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    InputManager.registerClickZone('cancel', mapBtn.x, mapBtn.y, mapBtn.w, mapBtn.h);

    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.fillText('🔄 Hop Again', playBtn.x + playBtn.w / 2, playBtn.y + 34);

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(mapBtn.x, mapBtn.y, mapBtn.w, mapBtn.h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🗺️ Puppy Island', mapBtn.x + mapBtn.w / 2, mapBtn.y + 34);

    ctx.restore();
  }
}

export default BoardwalkScene;
