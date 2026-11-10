import { GameState } from '../state.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';

const DIRECTIONS = ['top', 'left', 'bottom', 'right'];

// Progressive 7-round working memory curriculum (3 digits -> 7 digits)
const MEMORY_ROUNDS = [
  { length: 3, stepDuration: 1.05, allowRepeats: false, label: '3 Digits (Warm-Up)' },
  { length: 4, stepDuration: 0.98, allowRepeats: false, label: '4 Digits' },
  { length: 4, stepDuration: 0.90, allowRepeats: true,  label: '4 Digits (Mix)' },
  { length: 5, stepDuration: 0.90, allowRepeats: true,  label: '5 Digits' },
  { length: 5, stepDuration: 0.82, allowRepeats: true,  label: '5 Digits (Fast)' },
  { length: 6, stepDuration: 0.84, allowRepeats: true,  label: '6 Digits (Super Span)' },
  { length: 7, stepDuration: 0.82, allowRepeats: true,  label: '7 Digits (Grand Finale!)' },
];

const MAESTRO_DOGS = [
  { breed: 'poodle', name: 'Maestro Gigi', hat: 'wizard' },
  { breed: 'corgi', name: 'Conductor Biscuit', hat: 'crown' },
  { breed: 'husky', name: 'Chime Master Koda', hat: 'shades' },
  { breed: 'dalmatian', name: 'Bellringer Pepper', hat: 'chef' },
];

const MAESTRO_CATS = [
  { breed: 'persian', name: 'Maestro Duchess', hat: 'wizard' },
  { breed: 'siamese', name: 'Conductor Suki', hat: 'crown' },
  { breed: 'tuxedo', name: 'Chime Master Figaro', hat: 'shades' },
  { breed: 'maine_coon', name: 'Bellringer Acorn', hat: 'chef' },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
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

export class MemoryScene {
  constructor(options = {}) {
    if (typeof options === 'function') {
      options = { onExit: options };
    }
    this.locationId = options.locationId || options.parkId || options.id || 'park_memory';
    this.onExit =
      options.onExit ||
      options.onComplete ||
      options.exitCallback ||
      (() => {
        if (window.game && typeof window.game.switchScene === 'function') {
          window.game.switchScene('overworld');
        }
      });

    this.particles = new ParticleSystem();
    this.time = 0;

    this.totalRounds = MEMORY_ROUNDS.length;
    this.roundIndex = 0;
    this.roundTreatsEarned = 0;
    this.firstTryCount = 0;
    this.earnedStars = 0;

    // Current round state
    this.sequence = [];        // Array of numbers to remember in order, e.g. [7, 2, 9, 4]
    this.padNumbers = {};      // { top: 7, left: 2, bottom: 9, right: 4 }
    this.replaysUsed = 0;      // Number of replays/retries on the current sequence
    this.inputIndex = 0;       // Current index in this.sequence the player is recalling

    // Phases: 'get_ready' | 'showing' | 'input' | 'mistake' | 'round_success' | 'complete'
    this.phase = 'get_ready';
    this.phaseTimer = 0;
    this.showingIndex = -1;
    this.stepElapsed = 0;
    this.stepDuration = 0.95;

    // Animation feedback
    this.pressedScale = { top: 1, left: 1, bottom: 1, right: 1 };
    this.wrongDir = null;
    this.wrongNumber = null;
    this.lastCorrectDir = null;
    this.petJumpTimer = 0;
    this.maestroRingTimer = 0;
    this.floatingTexts = [];
    this.flyingTreats = [];

    this._keyListener = (e) => this._handleDirectNumberKey(e);
  }

  enter() {
    InputManager.setDiamondMode(true);
    SoundFX.init();
    this.roundIndex = 0;
    this.roundTreatsEarned = 0;
    this.firstTryCount = 0;
    this._registerClickZones();
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._keyListener);
    }
    this._startRound(0);
  }

  exit() {
    InputManager.clearClickZones();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._keyListener);
    }
  }

  _getDiamondGeometry() {
    return {
      centerX: 480,
      centerY: 472,
      offsetX: 162,
      offsetY: 64,
      cardW: 164,
      cardH: 66,
    };
  }

  _getCardPosition(dir) {
    const g = this._getDiamondGeometry();
    switch (dir) {
      case 'top':
        return { x: g.centerX, y: g.centerY - g.offsetY, w: g.cardW, h: g.cardH };
      case 'bottom':
        return { x: g.centerX, y: g.centerY + g.offsetY, w: g.cardW, h: g.cardH };
      case 'left':
        return { x: g.centerX - g.offsetX, y: g.centerY, w: g.cardW, h: g.cardH };
      case 'right':
        return { x: g.centerX + g.offsetX, y: g.centerY, w: g.cardW, h: g.cardH };
      default:
        return { x: g.centerX, y: g.centerY, w: g.cardW, h: g.cardH };
    }
  }

  _registerClickZones() {
    InputManager.clearClickZones();

    // Back to Map button
    InputManager.registerClickZone('memory_back_map', 16, 12, 108, 46, () => {
      if (this.phase === 'complete') {
        this._finishAndExit();
      } else {
        SoundFX.bark(0.95);
        this.onExit({ completed: false, locationId: this.locationId });
      }
    });

    // Replay Sequence button
    InputManager.registerClickZone('memory_replay_btn', 422, 12, 152, 46, () => {
      if (this.phase === 'input') {
        this._triggerReplay(false);
      }
    });

    // 4 Diamond answer pads
    for (const dir of DIRECTIONS) {
      const pos = this._getCardPosition(dir);
      InputManager.registerClickZone(
        `memory_pad_${dir}`,
        pos.x - pos.w / 2,
        pos.y - pos.h / 2,
        pos.w,
        pos.h,
        () => {
          this._handlePadInput(dir);
        }
      );
    }
  }

  _handleDirectNumberKey(e) {
    if (this.phase !== 'input') return;
    if (!e.key || e.key.length !== 1 || e.key < '0' || e.key > '9') return;
    const digit = Number(e.key);
    for (const dir of DIRECTIONS) {
      if (this.padNumbers[dir] === digit) {
        this._handlePadInput(dir);
        return;
      }
    }
  }

  _startRound(idx) {
    this.roundIndex = idx;
    const cfg = MEMORY_ROUNDS[Math.min(idx, MEMORY_ROUNDS.length - 1)];
    const maestros = GameState.theme === 'cat' ? MAESTRO_CATS : MAESTRO_DOGS;
    this.maestro = maestros[idx % maestros.length];

    // Pick 4 distinct digits from 1..9 for this round's 4 chime pads
    const pool = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);

    // Build the target sequence of length cfg.length from those 4 digits
    const seq = [];
    if (!cfg.allowRepeats && cfg.length <= 4) {
      const shuffledPool = shuffle(pool);
      for (let i = 0; i < cfg.length; i++) {
        seq.push(shuffledPool[i]);
      }
    } else {
      for (let i = 0; i < cfg.length; i++) {
        // Avoid 3 identical numbers in a row, and mostly avoid immediate back-to-back repeats
        let candidates = pool.filter((n) => n !== seq[i - 1]);
        if (candidates.length === 0) candidates = pool;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        seq.push(pick);
      }
    }

    this.sequence = seq;
    this.replaysUsed = 0;
    this.inputIndex = 0;
    this.wrongDir = null;
    this.wrongNumber = null;
    this.lastCorrectDir = null;
    this._shufflePadPositions(pool);
    this._beginShowingPhase(cfg.stepDuration, idx === 0);
  }

  _shufflePadPositions(poolNumbers) {
    const shuffledDirs = shuffle(poolNumbers);
    this.padNumbers = {
      top: shuffledDirs[0],
      left: shuffledDirs[1],
      bottom: shuffledDirs[2],
      right: shuffledDirs[3],
    };
  }

  _beginShowingPhase(baseStepDuration, immediate = false) {
    const cfg = MEMORY_ROUNDS[Math.min(this.roundIndex, MEMORY_ROUNDS.length - 1)];
    const slowDown = Math.min(0.28, this.replaysUsed * 0.1);
    this.stepDuration = (baseStepDuration || cfg.stepDuration) + slowDown;
    this.inputIndex = 0;
    this.wrongDir = null;
    this.wrongNumber = null;

    if (immediate) {
      this.phase = 'showing';
      this.showingIndex = 0;
      this.stepElapsed = 0;
      this._triggerShownStep(0);
    } else {
      this.phase = 'get_ready';
      this.phaseTimer = 0.45;
      this.showingIndex = -1;
      this.stepElapsed = 0;
    }
  }

  _triggerReplay(fromMistake = false) {
    this.replaysUsed += 1;
    // Shuffle the 4 pad positions before the new recall so the player memorizes the numbers
    const currentPool = Object.values(this.padNumbers);
    this._shufflePadPositions(currentPool);
    if (!fromMistake) {
      SoundFX.bark(1.05);
    }
    this._beginShowingPhase();
  }

  _handlePadInput(dir) {
    if (this.phase === 'complete') {
      this._finishAndExit();
      return;
    }
    if (this.phase !== 'input') return;

    this.pressedScale[dir] = 0.84;
    const chosenNum = this.padNumbers[dir];
    const expectedNum = this.sequence[this.inputIndex];
    const pos = this._getCardPosition(dir);

    if (chosenNum === expectedNum) {
      // Correct step in sequence!
      this.wrongDir = null;
      this.wrongNumber = null;
      this.lastCorrectDir = dir;
      this.petJumpTimer = 0.36;

      SoundFX.chimeNote(chosenNum, 0.28);
      this.particles.emitStars(pos.x, pos.y - 10, 10);

      const slotPos = this._getSequenceSlotCenter(this.inputIndex, this.sequence.length);
      this.particles.emitStars(slotPos.x, slotPos.y, 12);

      this.inputIndex += 1;

      if (this.inputIndex >= this.sequence.length) {
        // Completed the entire sequence!
        this._handleSequenceCompleted();
      }
    } else {
      // Wrong number pressed — show gentle feedback, then replay sequence!
      this.wrongDir = dir;
      this.wrongNumber = chosenNum;
      SoundFX.oops();
      this.phase = 'mistake';
      this.phaseTimer = 1.35;
    }
  }

  _handleSequenceCompleted() {
    this.phase = 'round_success';
    this.phaseTimer = 1.45;
    SoundFX.correct();
    SoundFX.bark(1.18);

    let bonus = 1;
    let label = '+1 Treat!';
    let color = '#fde047';

    if (this.replaysUsed === 0) {
      bonus = 3;
      this.firstTryCount += 1;
      label = '🧠 SUPER MEMORY! +3';
      color = '#facc15';
      SoundFX.zoomies();
    } else if (this.replaysUsed === 1) {
      bonus = 2;
      label = '✨ GREAT RECALL! +2';
      color = '#38bdf8';
    }

    GameState.addTreats(bonus);
    this.roundTreatsEarned += bonus;

    this.particles.emitStars(480, 145, 22);
    this.particles.emitHearts(640, 270, 10);

    for (let i = 0; i < bonus; i++) {
      this.flyingTreats.push({
        startX: 480 + (i - 1) * 36,
        startY: 145,
        targetX: 840,
        targetY: 34,
        progress: -i * 0.12,
      });
    }

    this.floatingTexts.push({
      x: 480,
      y: 215,
      text: label,
      color,
      life: 1.3,
      maxLife: 1.3,
    });
  }

  _completeAllRounds() {
    this.phase = 'complete';
    this.phaseTimer = 0;

    let stars = 1;
    if (this.firstTryCount >= 5) {
      stars = 3;
    } else if (this.firstTryCount >= 3) {
      stars = 2;
    }
    this.earnedStars = stars;

    const prevStars = GameState.parkStars?.[this.locationId] || 0;
    if (stars > prevStars && GameState.parkStars) {
      GameState.parkStars[this.locationId] = stars;
    }
    GameState.save();
    SoundFX.levelComplete();

    this.particles.emitStars(320, 240, 26);
    this.particles.emitStars(640, 240, 26);
    this.particles.emitHearts(480, 280, 18);

    InputManager.clearClickZones();
    InputManager.registerClickZone('memory_complete_continue', 300, 445, 360, 68, () => {
      this._finishAndExit();
    });
  }

  _finishAndExit() {
    SoundFX.bark(1.15);
    this.onExit({
      completed: true,
      stars: this.earnedStars,
      treatsEarned: this.roundTreatsEarned,
      locationId: this.locationId,
    });
  }

  update(dt) {
    const safeDt = Math.min(0.1, Math.max(0.001, dt > 1 ? dt / 1000 : dt));
    this.time += safeDt;

    for (const dir of DIRECTIONS) {
      this.pressedScale[dir] += (1 - this.pressedScale[dir]) * Math.min(1, safeDt * 14);
    }

    if (this.petJumpTimer > 0) {
      this.petJumpTimer = Math.max(0, this.petJumpTimer - safeDt);
    }
    if (this.maestroRingTimer > 0) {
      this.maestroRingTimer = Math.max(0, this.maestroRingTimer - safeDt);
    }

    // Update flying treats
    for (let i = this.flyingTreats.length - 1; i >= 0; i--) {
      const ft = this.flyingTreats[i];
      ft.progress += safeDt * 1.9;
      if (ft.progress >= 1) {
        this.flyingTreats.splice(i, 1);
      }
    }

    // Update floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const item = this.floatingTexts[i];
      item.y -= safeDt * 36;
      item.life -= safeDt;
      if (item.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    this.particles.update(safeDt);

    if (InputManager.justPressed('select')) {
      GameState.toggleControllerStyle();
      SoundFX.bark(1.1);
    }

    if (InputManager.justPressed('start') && this.phase !== 'complete') {
      this.onExit({ completed: false, locationId: this.locationId });
      return;
    }

    if (this.phase === 'complete') {
      for (const dir of DIRECTIONS) {
        if (InputManager.justPressed(dir)) {
          this._finishAndExit();
          return;
        }
      }
      if (InputManager.justPressed('confirm') || InputManager.justPressed('start')) {
        this._finishAndExit();
      }
      return;
    }

    if (this.phase === 'get_ready') {
      this.phaseTimer -= safeDt;
      if (this.phaseTimer <= 0) {
        this.phase = 'showing';
        this.showingIndex = 0;
        this.stepElapsed = 0;
        this._triggerShownStep(0);
      }
      return;
    }

    if (this.phase === 'showing') {
      this.stepElapsed += safeDt;
      if (this.stepElapsed >= this.stepDuration) {
        this.stepElapsed = 0;
        this.showingIndex += 1;
        if (this.showingIndex < this.sequence.length) {
          this._triggerShownStep(this.showingIndex);
        } else {
          // Finished showing all digits! Transition to player's turn
          this.phase = 'input';
          this.showingIndex = -1;
          this.inputIndex = 0;
          SoundFX.bark(1.12);
        }
      }
      return;
    }

    if (this.phase === 'mistake') {
      this.phaseTimer -= safeDt;
      if (this.phaseTimer <= 0) {
        this._triggerReplay(true);
      }
      return;
    }

    if (this.phase === 'round_success') {
      this.phaseTimer -= safeDt;
      if (this.phaseTimer <= 0) {
        if (this.roundIndex + 1 >= this.totalRounds) {
          this._completeAllRounds();
        } else {
          this._startRound(this.roundIndex + 1);
        }
      }
      return;
    }

    if (this.phase === 'input') {
      if (InputManager.justPressed('L') || InputManager.justPressed('R')) {
        this._triggerReplay(false);
        return;
      }
      for (const dir of DIRECTIONS) {
        if (InputManager.justPressed(dir)) {
          this._handlePadInput(dir);
          break;
        }
      }
    }
  }

  _triggerShownStep(stepIdx) {
    const num = this.sequence[stepIdx];
    this.maestroRingTimer = 0.42;
    SoundFX.chimeNote(num, 0.34);
    const slotPos = this._getSequenceSlotCenter(stepIdx, this.sequence.length);
    this.particles.emitStars(slotPos.x, slotPos.y - 46, 6);
  }

  _getSequenceSlotCenter(idx, total) {
    const cardW = total >= 7 ? 84 : total === 6 ? 94 : 104;
    const gap = total >= 7 ? 12 : 16;
    const totalW = total * cardW + (total - 1) * gap;
    const startX = (960 - totalW) / 2 + cardW / 2;
    return {
      x: startX + idx * (cardW + gap),
      y: 156,
      w: cardW,
      h: 82,
    };
  }

  draw(ctx) {
    this._drawGazeboBackground(ctx);
    this._drawTopBar(ctx);
    this._drawSequenceArch(ctx);
    this._drawMaestroAndPlayerStage(ctx);
    this._drawDiamondPads(ctx);
    this._drawFlyingTreats(ctx);
    this._drawFloatingTexts(ctx);
    this.particles.draw(ctx);

    if (this.phase === 'complete') {
      this._drawCelebrationOverlay(ctx);
    }
  }

  _drawGazeboBackground(ctx) {
    // Twilight enchanted garden sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
    skyGrad.addColorStop(0, '#1e1b4b');
    skyGrad.addColorStop(0.55, '#312e81');
    skyGrad.addColorStop(1, '#4338ca');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 960, 360);

    // Twinkling fireflies / stars in the garden sky
    for (let i = 0; i < 18; i++) {
      const sx = (i * 137 + 45) % 920 + 20;
      const sy = (i * 73 + 68) % 210 + 62;
      const alpha = 0.35 + 0.45 * Math.sin(this.time * 2.5 + i);
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    // Lush emerald garden hills
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.ellipse(240, 355, 340, 68, 0, 0, Math.PI * 2);
    ctx.ellipse(740, 360, 360, 72, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Gazebo Floor Deck (bottom half)
    const floorGrad = ctx.createLinearGradient(0, 340, 0, 600);
    floorGrad.addColorStop(0, '#fef3c7');
    floorGrad.addColorStop(1, '#fde68a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 340, 960, 260);

    // Gazebo trim border
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 336, 960, 8);

    // Gazebo pillars on left & right
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    for (const px of [44, 900]) {
      ctx.fillRect(px, 66, 18, 274);
      ctx.strokeRect(px, 66, 18, 274);
    }
  }

  _drawTopBar(ctx) {
    // [<- Map] Button
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, 16, 12, 108, 46, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = '900 18px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('← Map', 70, 35);
    ctx.restore();

    // Title Banner
    ctx.save();
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, 134, 12, 278, 46, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = '900 20px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔔 Echo Bell Gazebo', 273, 35);
    ctx.restore();

    // Replay Sequence button
    const canReplay = this.phase === 'input';
    ctx.save();
    ctx.fillStyle = canReplay ? '#e0f2fe' : '#cbd5e1';
    ctx.strokeStyle = canReplay ? '#0284c7' : '#64748b';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 422, 12, 152, 46, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = canReplay ? '#0369a1' : '#475569';
    ctx.font = '900 14px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔁 Replay (L/R)', 498, 35);
    ctx.restore();

    // Round progress pill
    const cfg = MEMORY_ROUNDS[Math.min(this.roundIndex, MEMORY_ROUNDS.length - 1)];
    ctx.save();
    ctx.fillStyle = '#ede9fe';
    ctx.strokeStyle = '#6d28d9';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, 584, 12, 182, 46, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4c1d95';
    ctx.font = '900 15px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Round ${this.roundIndex + 1}/${this.totalRounds} • ${cfg.length} Digits`, 675, 35);
    ctx.restore();

    // Treat counter pill
    ctx.save();
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, 776, 12, 168, 46, 14);
    ctx.fill();
    ctx.stroke();

    Sprites.drawBoneTreat(ctx, 808, 35, 0.72, 0.1, '#f59e0b');
    ctx.fillStyle = '#78350f';
    ctx.font = '900 22px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${GameState.treats}`, 835, 36);
    ctx.restore();
  }

  _drawSequenceArch(ctx) {
    // Status instruction banner at top of arch
    ctx.save();
    let bannerBg = '#fef9c3';
    let bannerBorder = '#eab308';
    let bannerText = '👀 GET READY TO WATCH THE NUMBERS!';
    let textColor = '#713f12';

    if (this.phase === 'showing') {
      bannerBg = '#fef08a';
      bannerBorder = '#f59e0b';
      bannerText = `👀 WATCH & MEMORIZE IN ORDER!  (Number ${this.showingIndex + 1} of ${this.sequence.length})`;
      textColor = '#78350f';
    } else if (this.phase === 'input') {
      bannerBg = '#dcfce7';
      bannerBorder = '#16a34a';
      bannerText = `🐾 YOUR TURN! Repeat the Numbers in Order!  (Step ${this.inputIndex + 1} of ${this.sequence.length})`;
      textColor = '#14532d';
    } else if (this.phase === 'mistake') {
      bannerBg = '#fee2e2';
      bannerBorder = '#ef4444';
      const expected = this.sequence[this.inputIndex];
      bannerText = `💡 Step #${this.inputIndex + 1} was ${expected}! Let's watch the sequence again!`;
      textColor = '#7f1d1d';
    } else if (this.phase === 'round_success') {
      bannerBg = '#bbf7d0';
      bannerBorder = '#16a34a';
      bannerText = '🎉 AMAZING MEMORY! You repeated the whole sequence!';
      textColor = '#14532d';
    }

    ctx.fillStyle = bannerBg;
    ctx.strokeStyle = bannerBorder;
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, 140, 68, 680, 34, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = '900 17px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bannerText, 480, 85);
    ctx.restore();

    // Draw the N Sequence Bell Cards across y = 156
    const total = this.sequence.length;
    for (let i = 0; i < total; i++) {
      const slot = this._getSequenceSlotCenter(i, total);
      this._drawSequenceSlotCard(ctx, i, slot);
    }
  }

  _drawSequenceSlotCard(ctx, idx, slot) {
    ctx.save();
    ctx.translate(slot.x, slot.y);

    const num = this.sequence[idx];
    let fill = '#1e293b';
    let border = '#475569';
    let mainText = '?';
    let textColor = '#94a3b8';
    let scale = 1.0;
    let showBellGlow = false;

    if (this.phase === 'get_ready') {
      fill = '#1e293b';
      border = '#64748b';
      mainText = '•';
      textColor = '#cbd5e1';
    } else if (this.phase === 'showing') {
      if (idx === this.showingIndex) {
        // Currently flashing number!
        const pop = Math.sin(Math.min(1, this.stepElapsed * 8) * Math.PI) * 0.12;
        scale = 1.14 + pop;
        fill = '#fef08a';
        border = '#f59e0b';
        mainText = `${num}`;
        textColor = '#0f172a';
        showBellGlow = true;
      } else if (idx < this.showingIndex) {
        // Already shown — flipped face-down so player holds it in working memory!
        fill = '#312e81';
        border = '#818cf8';
        mainText = '?';
        textColor = '#c7d2fe';
      } else {
        // Not shown yet
        fill = '#1e293b';
        border = '#475569';
        mainText = '•';
        textColor = '#64748b';
      }
    } else if (this.phase === 'input') {
      if (idx < this.inputIndex) {
        // Already recalled correctly!
        fill = '#dcfce7';
        border = '#16a34a';
        mainText = `${num}`;
        textColor = '#15803d';
      } else if (idx === this.inputIndex) {
        // Current slot to recall next!
        scale = 1.06 + Math.sin(this.time * 7) * 0.03;
        fill = '#fef9c3';
        border = '#eab308';
        mainText = '?';
        textColor = '#ca8a04';
      } else {
        fill = '#312e81';
        border = '#6366f1';
        mainText = '?';
        textColor = '#a5b4fc';
      }
    } else if (this.phase === 'mistake') {
      if (idx < this.inputIndex) {
        fill = '#dcfce7';
        border = '#16a34a';
        mainText = `${num}`;
        textColor = '#15803d';
      } else if (idx === this.inputIndex) {
        // Reveal what number was at this step so the child sees it clearly
        scale = 1.08;
        fill = '#fee2e2';
        border = '#ef4444';
        mainText = `${num}`;
        textColor = '#b91c1c';
      } else {
        fill = '#312e81';
        border = '#6366f1';
        mainText = '?';
        textColor = '#a5b4fc';
      }
    } else if (this.phase === 'round_success' || this.phase === 'complete') {
      scale = 1.05 + Math.sin(this.time * 8 + idx) * 0.03;
      fill = '#bbf7d0';
      border = '#16a34a';
      mainText = `${num}`;
      textColor = '#14532d';
    }

    ctx.scale(scale, scale);

    if (showBellGlow) {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      drawRoundedRect(ctx, -slot.w / 2 - 8, -slot.h / 2 - 8, slot.w + 16, slot.h + 16, 20);
      ctx.fill();
      ctx.restore();
    }

    // Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    drawRoundedRect(ctx, -slot.w / 2, -slot.h / 2 + 5, slot.w, slot.h, 16);
    ctx.fill();

    // Card body
    ctx.fillStyle = fill;
    ctx.strokeStyle = border;
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, -slot.w / 2, -slot.h / 2, slot.w, slot.h, 16);
    ctx.fill();
    ctx.stroke();

    // Step order badge (#1, #2, ...) at top of card
    ctx.fillStyle = border;
    drawRoundedRect(ctx, -26, -slot.h / 2 - 10, 52, 20, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 12px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${idx + 1}`, 0, -slot.h / 2);

    // Main digit or '?'
    ctx.fillStyle = textColor;
    ctx.font = '900 38px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mainText, 0, 6);

    ctx.restore();
  }

  _drawMaestroAndPlayerStage(ctx) {
    // Center Gazebo Bell Pedestal
    const centerX = 480;
    const stageY = 292;

    // Pedestal arch
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 325, 212, 310, 114, 22);
    ctx.fill();
    ctx.stroke();

    // Big Center Callout during 'showing' or 'input'
    if (this.phase === 'showing' && this.showingIndex >= 0) {
      const currentNum = this.sequence[this.showingIndex];
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 20px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔔 Chime #${this.showingIndex + 1}:`, centerX, 236);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 54px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.fillText(`${currentNum}`, centerX, 286);
    } else if (this.phase === 'input') {
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 19px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `What was Number #${this.inputIndex + 1}?`,
        centerX,
        252
      );
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '700 15px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.fillText(
        `Press the matching button below!`,
        centerX,
        284
      );
    } else if (this.phase === 'get_ready') {
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 22px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔔 Listen & Watch!', centerX, 268);
    } else if (this.phase === 'mistake') {
      const expected = this.sequence[this.inputIndex];
      ctx.fillStyle = '#fecaca';
      ctx.font = '900 20px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Oops! You pressed ${this.wrongNumber}`, centerX, 248);
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 22px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.fillText(`#${this.inputIndex + 1} was ${expected} — Watch again!`, centerX, 284);
    } else if (this.phase === 'round_success') {
      ctx.fillStyle = '#86efac';
      ctx.font = '900 26px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌟 NAILED IT! 🌟', centerX, 268);
    }
    ctx.restore();

    // Left: Maestro Pet
    const petBaseY = 272;
    const maestroBounce = this.maestroRingTimer > 0 ? Math.sin(this.maestroRingTimer * 24) * 8 : 0;
    Sprites.drawDog(ctx, 215, petBaseY - Math.abs(maestroBounce), {
      breed: this.maestro?.breed || 'poodle',
      hat: this.maestro?.hat || 'wizard',
      mood: this.phase === 'showing' ? 'excited' : 'happy',
      scale: 0.88,
      time: this.time,
      facing: 'right',
    });

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 145, 310, 140, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef3c7';
    ctx.font = '900 13px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.maestro?.name || 'Maestro', 215, 321);
    ctx.restore();

    // Right: Player's Active Pet
    const petJump = this.petJumpTimer > 0 ? Math.sin((this.petJumpTimer / 0.36) * Math.PI) * 24 : 0;
    Sprites.drawDog(ctx, 745, petBaseY - petJump, {
      breed: GameState.selectedBreed || 'cavapoo',
      hat: GameState.selectedHat || 'none',
      mood: this.phase === 'round_success' || this.petJumpTimer > 0 ? 'excited' : 'happy',
      scale: 0.9,
      time: this.time,
      facing: 'left',
    });

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 690, 310, 110, 22, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '900 13px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('You!', 745, 321);
    ctx.restore();
  }

  _drawDiamondPads(ctx) {
    const labels = getNormalizedDiamondLabels();
    const g = this._getDiamondGeometry();
    const hiddenDuringWatch = this.phase === 'get_ready' || this.phase === 'showing';

    // Center hub badge
    ctx.save();
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.centerX, g.centerY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = '900 13px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hiddenDuringWatch ? 'WATCH' : 'REPEAT', g.centerX, g.centerY - 6);
    ctx.fillText(hiddenDuringWatch ? 'ABOVE' : 'ORDER', g.centerX, g.centerY + 9);
    ctx.restore();

    for (const dir of DIRECTIONS) {
      const pos = this._getCardPosition(dir);
      const btnInfo = labels[dir];
      const value = this.padNumbers[dir];
      const isWrong = this.wrongDir === dir && this.phase === 'mistake';
      const scale = this.pressedScale[dir] || 1;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.scale(scale, scale);

      // Card drop shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      drawRoundedRect(ctx, -pos.w / 2, -pos.h / 2 + 5, pos.w, pos.h, 18);
      ctx.fill();

      // Pad background
      ctx.fillStyle = isWrong
        ? '#fee2e2'
        : hiddenDuringWatch
        ? '#f1f5f9'
        : '#ffffff';
      ctx.strokeStyle = isWrong
        ? '#ef4444'
        : hiddenDuringWatch
        ? '#94a3b8'
        : btnInfo.color;
      ctx.lineWidth = 4.5;
      drawRoundedRect(ctx, -pos.w / 2, -pos.h / 2, pos.w, pos.h, 18);
      ctx.fill();
      ctx.stroke();

      // SNES/Xbox Colored Button Badge on Left
      const badgeX = -pos.w / 2 + 32;
      ctx.fillStyle = hiddenDuringWatch ? '#94a3b8' : btnInfo.color;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(badgeX, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 19px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btnInfo.key, badgeX, 1);

      // Pad Number (hidden as 🎵 during 'showing' so player encodes the numbers, then revealed on 'input'!)
      ctx.fillStyle = isWrong
        ? '#b91c1c'
        : hiddenDuringWatch
        ? '#64748b'
        : '#0f172a';
      ctx.font = hiddenDuringWatch
        ? '900 24px "Fredoka", "Trebuchet MS", sans-serif'
        : '900 34px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hiddenDuringWatch ? '🎵' : `${value}`, 22, 2);

      ctx.restore();
    }
  }

  _drawFlyingTreats(ctx) {
    for (const ft of this.flyingTreats) {
      if (ft.progress < 0) continue;
      const t = Math.min(1, ft.progress);
      const ease = 1 - Math.pow(1 - t, 3);
      const x = ft.startX + (ft.targetX - ft.startX) * ease;
      const y = ft.startY + (ft.targetY - ft.startY) * ease - Math.sin(t * Math.PI) * 70;
      Sprites.drawBoneTreat(ctx, x, y, 0.85, t * 5, '#facc15');
    }
  }

  _drawFloatingTexts(ctx) {
    for (const item of this.floatingTexts) {
      const alpha = Math.max(0, Math.min(1, item.life / item.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = '900 26px "Fredoka", "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      ctx.strokeText(item.text, item.x, item.y);
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, item.x, item.y);
      ctx.restore();
    }
  }

  _drawCelebrationOverlay(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(0, 0, 960, 600);

    const cardW = 540;
    const cardH = 380;
    const cardX = (960 - cardW) / 2;
    const cardY = (600 - cardH) / 2;

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#6d28d9';
    drawRoundedRect(ctx, cardX + 36, cardY - 24, cardW - 72, 54, 18);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔔 MEMORY CHAMPION! 🔔', 480, cardY + 3);

    for (let i = 0; i < 3; i++) {
      const sx = 480 + (i - 1) * 78;
      const sy = cardY + 78;
      const earned = i < this.earnedStars;
      Sprites.drawStar(ctx, sx, sy, 28, 5, earned ? '#facc15' : '#e2e8f0', '#1e293b');
    }

    Sprites.drawDog(ctx, 480, cardY + 178, {
      breed: GameState.selectedBreed || 'cavapoo',
      hat: GameState.selectedHat || 'none',
      mood: 'excited',
      scale: 1.08,
      time: this.time,
    });

    ctx.fillStyle = '#1e293b';
    ctx.font = '900 22px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.fillText(`Earned +${this.roundTreatsEarned} Treats!`, 480, cardY + 245);

    ctx.fillStyle = '#4c1d95';
    ctx.font = '800 16px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.fillText(
      `First-Try Sequences: ${this.firstTryCount} / ${this.totalRounds} (Up to 7 Digits!)`,
      480,
      cardY + 276
    );

    const pulse = 1 + Math.sin(this.time * 6) * 0.03;
    ctx.save();
    ctx.translate(480, cardY + 328);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, -170, -24, 340, 48, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 19px "Fredoka", "Trebuchet MS", sans-serif';
    ctx.fillText('Press Any Button for Map! 🐾', 0, 1);
    ctx.restore();

    ctx.restore();
  }
}

export default MemoryScene;
