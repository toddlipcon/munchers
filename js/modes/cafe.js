import { GameState } from '../state.js';
import { MathEngine } from '../math.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, DOG_BREEDS, DOG_HATS, ParticleSystem } from '../sprites.js';
import { DOG_PETS, CAT_PETS } from '../pet_avatars.js';

const TOTAL_DOGS_PER_ROUND = 8;
const FAST_RECALL_THRESHOLD_SEC = 2.5;
const HINT_APPEAR_SEC = 3.5;

function getNormalizedDiamondLabels() {
  const raw = InputManager.getDiamondLabels ? InputManager.getDiamondLabels() : {};
  const defaults = {
    top: { key: 'X', label: 'X', color: '#3b82f6' },
    left: { key: 'Y', label: 'Y', color: '#10b981' },
    bottom: { key: 'B', label: 'B', color: '#f59e0b' },
    right: { key: 'A', label: 'A', color: '#ef4444' },
  };
  const out = {};
  for (const dir of ['top', 'left', 'bottom', 'right']) {
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

export class TreatCafeScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.game = null;
    this.tier = 1;
    this.locationId = 'cafe_sunny';
    this.onExit = null;

    this._parseConstructorArgs(arg1, arg2);

    this.particles = new ParticleSystem();
    this.time = 0;
    this.canvasW = 960;
    this.canvasH = 600;

    this.dogsQueue = [];
    this.currentDogIndex = 0;
    this.problem = null;
    this.disabledDirs = [];
    this.highlightDir = null;
    this.diamondBounds = null;

    // States: 'entering' -> 'ordering' -> 'flying_treat' -> 'celebrating' -> 'summary'
    this.phase = 'entering';
    this.phaseTimer = 0;
    this.problemElapsedSec = 0;

    // Current dog animation state
    this.dogX = 60;
    this.dogTargetX = 270;
    this.dogY = 218;
    this.dogMood = 'walking';
    this.dogFlipProgress = 0;
    this.isSuperZoomies = false;

    // Flying bone treat animation from bowl to dog mouth
    this.flyingTreat = null;

    // Round stats
    this.roundTreatsEarned = 0;
    this.zoomiesStreak = 0;
    this.bestStreak = 0;
    this.fastRecallCount = 0;
    this.firstTryCount = 0;
    this.fastestTimeMs = null;
    this.starsEarned = 0;

    this.startNewRound();
  }

  _parseConstructorArgs(arg1, arg2) {
    if (typeof arg1 === 'function') {
      this.onExit = arg1;
      if (arg2 && typeof arg2 === 'object') this._applyOptions(arg2);
      return;
    }

    if (typeof arg1 === 'number') {
      this.tier = arg1;
      this.locationId = typeof arg2 === 'string' ? arg2 : arg1 === 1 ? 'cafe_sunny' : 'cafe_beach';
      return;
    }

    if (arg1 && typeof arg1 === 'object') {
      if (
        typeof arg1.switchScene === 'function' ||
        typeof arg1.changeScene === 'function' ||
        typeof arg1.setScene === 'function' ||
        typeof arg1.goToMap === 'function' ||
        arg1.canvas
      ) {
        this.game = arg1;
        if (typeof arg2 === 'number') {
          this.tier = arg2;
          this.locationId = arg2 === 1 ? 'cafe_sunny' : 'cafe_beach';
        } else if (typeof arg2 === 'function') {
          this.onExit = arg2;
        } else if (arg2 && typeof arg2 === 'object') {
          this._applyOptions(arg2);
        }
      } else {
        this._applyOptions(arg1);
        if (typeof arg2 === 'function') {
          this.onExit = arg2;
        } else if (arg2 && typeof arg2 === 'object') {
          this._applyOptions(arg2);
        }
      }
    }
  }

  _applyOptions(opts) {
    if (!opts) return;
    if (opts.game || opts.app) this.game = opts.game || opts.app;
    if (typeof opts.tier === 'number') this.tier = opts.tier;
    if (typeof opts.difficulty === 'number' && !opts.tier) this.tier = opts.difficulty;
    const locId = opts.locationId || opts.id;
    if (typeof locId === 'string') {
      this.locationId = locId;
      if (!opts.tier && locId === 'cafe_beach') {
        this.tier = 2;
      }
    } else {
      this.locationId = this.tier >= 2 ? 'cafe_beach' : 'cafe_sunny';
    }
    const exitFn = opts.onExit || opts.onBack || opts.onComplete;
    if (typeof exitFn === 'function') this.onExit = exitFn;
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

    this.dogsQueue = [];
    const breedList = GameState.theme === 'cat' ? CAT_PETS : DOG_PETS;
    const hatList = Array.isArray(DOG_HATS) ? DOG_HATS : Object.values(DOG_HATS);

    for (let i = 0; i < TOTAL_DOGS_PER_ROUND; i++) {
      const breed = breedList[(i + Math.floor(Math.random() * breedList.length)) % breedList.length];
      const hat =
        i % 2 === 0
          ? hatList[Math.floor(Math.random() * hatList.length)].id
          : GameState.selectedHat || 'none';
      this.dogsQueue.push({
        breed: breed.id,
        name: breed.name.split(' ')[0],
        hat,
        fed: false,
        fast: false,
      });
    }

    this.currentDogIndex = 0;
    this.roundTreatsEarned = 0;
    this.zoomiesStreak = 0;
    this.bestStreak = 0;
    this.fastRecallCount = 0;
    this.firstTryCount = 0;
    this.fastestTimeMs = null;
    this.starsEarned = 0;

    this._spawnCurrentDog();
  }

  _spawnCurrentDog() {
    this.problem = MathEngine.generateSingleFact(this.tier);
    this.disabledDirs = [];
    this.highlightDir = null;
    this.problemElapsedSec = 0;
    this.dogX = 185;
    this.dogTargetX = 270;
    this.dogY = 218;
    this.dogMood = 'walking';
    this.dogFlipProgress = 0;
    this.isSuperZoomies = false;
    this.flyingTreat = null;
    this.phase = 'entering';
    this.phaseTimer = 0;
  }

  _returnToMap() {
    SoundFX?.step?.();
    InputManager.clearClickZones();
    if (typeof this.onExit === 'function') {
      this.onExit();
      return;
    }
    if (this.game) {
      if (typeof this.game.switchScene === 'function') {
        this.game.switchScene('map');
        return;
      }
      if (typeof this.game.changeScene === 'function') {
        this.game.changeScene('map');
        return;
      }
      if (typeof this.game.setScene === 'function') {
        this.game.setScene('map');
        return;
      }
      if (typeof this.game.goToMap === 'function') {
        this.game.goToMap();
        return;
      }
    }
    if (typeof window !== 'undefined' && window.game) {
      if (typeof window.game.switchScene === 'function') window.game.switchScene('map');
      else if (typeof window.game.changeScene === 'function') window.game.changeScene('map');
    }
  }

  handleClick(x, y) {
    if (x >= 16 && x <= 176 && y >= 10 && y <= 54) {
      this._returnToMap();
      return true;
    }
    if (this.phase === 'ordering' && this.diamondBounds) {
      for (const dir of ['top', 'left', 'bottom', 'right']) {
        const b = this.diamondBounds[dir];
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this._handleAnswerAttempt(dir);
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
        SoundFX?.bark?.(1.1);
        this.startNewRound();
        return;
      }
      if (
        InputManager.justPressed('cancel') ||
        InputManager.justPressed('select')
      ) {
        this._returnToMap();
        return;
      }
      return;
    }

    if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
      this._returnToMap();
      return;
    }

    if (this.phase === 'entering') {
      this.phaseTimer += safeDt;
      const speed = 460;
      this.dogX = Math.min(this.dogTargetX, this.dogX + speed * safeDt);

      // Allow instant answer even while the dog is still trotting up!
      for (const dir of ['top', 'left', 'bottom', 'right']) {
        if (InputManager.justPressed(dir)) {
          this.dogX = this.dogTargetX;
          this.phase = 'ordering';
          this._handleAnswerAttempt(dir);
          return;
        }
      }

      if (this.dogX >= this.dogTargetX) {
        this.dogX = this.dogTargetX;
        this.dogMood = 'waiting';
        this.phase = 'ordering';
        this.phaseTimer = 0;
        this.problemElapsedSec = 0;
        SoundFX?.bark?.();
      }
      return;
    }

    if (this.phase === 'ordering') {
      this.problemElapsedSec += safeDt;

      if (InputManager.justPressed('top')) {
        this._handleAnswerAttempt('top');
      } else if (InputManager.justPressed('left')) {
        this._handleAnswerAttempt('left');
      } else if (InputManager.justPressed('bottom')) {
        this._handleAnswerAttempt('bottom');
      } else if (InputManager.justPressed('right')) {
        this._handleAnswerAttempt('right');
      }
      return;
    }

    if (this.phase === 'flying_treat') {
      this.phaseTimer += safeDt;
      const duration = 0.26;
      const t = Math.min(1, this.phaseTimer / duration);
      if (this.flyingTreat) {
        const ease = 1 - Math.pow(1 - t, 2);
        this.flyingTreat.x =
          this.flyingTreat.startX + (this.flyingTreat.targetX - this.flyingTreat.startX) * ease;
        this.flyingTreat.y =
          this.flyingTreat.startY +
          (this.flyingTreat.targetY - this.flyingTreat.startY) * ease -
          Math.sin(t * Math.PI) * 80;
        this.flyingTreat.angle = t * Math.PI * 2;
      }
      if (t >= 1) {
        this.flyingTreat = null;
        this._beginCelebration();
      }
      return;
    }

    if (this.phase === 'celebrating') {
      this.phaseTimer += safeDt;
      const celebDuration = this.isSuperZoomies ? 1.15 : 0.95;
      if (this.isSuperZoomies) {
        this.dogFlipProgress = Math.min(1, this.phaseTimer / 0.75);
      }
      if (this.phaseTimer >= celebDuration) {
        this.currentDogIndex += 1;
        if (this.currentDogIndex >= TOTAL_DOGS_PER_ROUND) {
          this._finishRound();
        } else {
          this._spawnCurrentDog();
        }
      }
    }
  }

  _getBowlPosition(dir) {
    const centerX = this.canvasW / 2;
    const centerY = this.canvasH - 138;
    const radiusX = 142;
    const radiusY = 74;
    if (dir === 'top') return { x: centerX, y: centerY - radiusY };
    if (dir === 'left') return { x: centerX - radiusX, y: centerY };
    if (dir === 'bottom') return { x: centerX, y: centerY + radiusY };
    return { x: centerX + radiusX, y: centerY };
  }

  _handleAnswerAttempt(dir) {
    if (!this.problem || this.disabledDirs.includes(dir)) return;

    const pickedValue = this.problem.choices[dir];
    const elapsedMs = Math.round(this.problemElapsedSec * 1000);

    if (pickedValue === this.problem.answer) {
      const isFirstTry = this.disabledDirs.length === 0;
      const isFast = this.problemElapsedSec <= FAST_RECALL_THRESHOLD_SEC && isFirstTry;

      GameState.recordFactResult(this.problem.key, true, elapsedMs);

      this.highlightDir = dir;
      this.isSuperZoomies = isFast;

      if (isFirstTry) {
        this.firstTryCount += 1;
        if (this.fastestTimeMs === null || elapsedMs < this.fastestTimeMs) {
          this.fastestTimeMs = elapsedMs;
        }
      }

      const bowlPos = this._getBowlPosition(dir);
      this.flyingTreat = {
        startX: bowlPos.x,
        startY: bowlPos.y,
        targetX: this.dogX + 8,
        targetY: this.dogY - 10,
        x: bowlPos.x,
        y: bowlPos.y,
        angle: 0,
      };

      this.phase = 'flying_treat';
      this.phaseTimer = 0;
      SoundFX?.treatToss?.();
    } else {
      // Gentle, non-punishing feedback
      this.disabledDirs.push(dir);
      this.zoomiesStreak = 0;
      GameState.recordFactResult(this.problem.key, false, elapsedMs);
      SoundFX?.oops?.();
      const bowlPos = this._getBowlPosition(dir);
      this.particles.addFloatingText(bowlPos.x, bowlPos.y - 18, 'Try another!', '#64748b', 0.85);
    }
  }

  _beginCelebration() {
    this.phase = 'celebrating';
    this.phaseTimer = 0;

    const currentDog = this.dogsQueue[this.currentDogIndex];
    if (currentDog) {
      currentDog.fed = true;
      currentDog.fast = this.isSuperZoomies;
    }

    if (this.isSuperZoomies) {
      this.dogMood = 'zoomies';
      this.zoomiesStreak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.zoomiesStreak);
      this.fastRecallCount += 1;
      const reward = 3;
      this.roundTreatsEarned += reward;
      GameState.addTreats(reward);

      SoundFX?.zoomies?.();
      this.particles.emitStars(this.dogX, this.dogY - 25, 18);
      this.particles.emitHearts(this.dogX, this.dogY - 35, 10);
      this.particles.addFloatingText(
        this.dogX,
        this.dogY - 82,
        `SUPER ZOOMIES! +${reward} 🦴`,
        '#eab308',
        1.1
      );
    } else {
      this.dogMood = 'munching';
      this.zoomiesStreak = 0;
      const reward = 1;
      this.roundTreatsEarned += reward;
      GameState.addTreats(reward);

      SoundFX?.munch?.();
      SoundFX?.correct?.();
      this.particles.emitHearts(this.dogX, this.dogY - 30, 8);
      this.particles.emitCrumbs(this.dogX + 8, this.dogY - 5, 10);
      this.particles.addFloatingText(
        this.dogX,
        this.dogY - 76,
        `${this.problem.prompt} = ${this.problem.answer}! +${reward} 🦴`,
        '#10b981',
        1.0
      );
    }
  }

  _finishRound() {
    this.phase = 'summary';
    this.phaseTimer = 0;

    if (this.fastRecallCount >= 5 || (this.firstTryCount >= 7 && this.fastRecallCount >= 3)) {
      this.starsEarned = 3;
    } else if (this.firstTryCount >= 5 || this.fastRecallCount >= 3) {
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

    this._drawCafeBackground(ctx, w, h);
    this._drawWaitingQueue(ctx);
    this._drawActiveDogAndBubble(ctx);
    this._drawCafeCounter(ctx, w, h);
    this._drawBottomDiamondArea(ctx, w, h);
    this._drawTopHud(ctx, w);

    if (this.flyingTreat) {
      Sprites.drawBoneTreat(
        ctx,
        this.flyingTreat.x,
        this.flyingTreat.y,
        1.2,
        this.flyingTreat.angle,
        '#fde047'
      );
    }

    this.particles.draw(ctx);

    if (this.phase === 'summary') {
      this._drawSummaryModal(ctx, w, h);
    }
  }

  _drawCafeBackground(ctx, w, h) {
    const isBeach = this.locationId === 'cafe_beach' || this.tier >= 2;
    const counterY = 268;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, counterY + 20);
    if (isBeach) {
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(1, '#bae6fd');
    } else {
      skyGrad.addColorStop(0, '#7dd3fc');
      skyGrad.addColorStop(1, '#fef9c3');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, counterY + 20);

    // Cheerful sun
    ctx.save();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(w - 95, 78, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    if (isBeach) {
      // Ocean horizon & gentle animated waves
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 168, w, 48);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const waveX = ((i * 180 + this.time * 25) % (w + 140)) - 70;
        ctx.beginPath();
        ctx.arc(waveX, 188 + (i % 2) * 12, 24, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
      // Sandy boardwalk lawn
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(0, 212, w, 70);
    } else {
      // Rolling sunny park hills
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.moveTo(0, 215);
      ctx.quadraticCurveTo(240, 165, 510, 210);
      ctx.quadraticCurveTo(760, 245, w, 185);
      ctx.lineTo(w, counterY + 20);
      ctx.lineTo(0, counterY + 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 220, w, 60);
    }

    // Striped Cafe Awning at top
    const stripeCount = 12;
    const stripeW = w / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? (isBeach ? '#0ea5e9' : '#f97316') : '#ffffff';
      ctx.fillRect(i * stripeW, 0, stripeW + 1, 20);
      ctx.beginPath();
      ctx.arc(i * stripeW + stripeW / 2, 20, stripeW / 2, 0, Math.PI);
      ctx.fill();
    }
  }

  _drawTopHud(ctx, w) {
    // Back to Map button (top-left)
    const backRect = { x: 16, y: 12, w: 156, h: 42 };
    InputManager.registerClickZone('cancel', backRect.x, backRect.y, backRect.w, backRect.h);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(backRect.x, backRect.y, backRect.w, backRect.h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬅ Island Map', backRect.x + backRect.w / 2, backRect.y + backRect.h / 2);

    // Cafe Title & Progress Paws (Center)
    const cafeTitle =
      this.locationId === 'cafe_beach' || this.tier >= 2
        ? '🏖️ Boardwalk Barkery'
        : '☀️ Sunny Paws Treat Cafe';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 195, 10, 390, 50, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 17px "Comic Sans MS", sans-serif';
    ctx.fillText(cafeTitle, w / 2, 26);

    // 8 Dog progress slots
    for (let i = 0; i < TOTAL_DOGS_PER_ROUND; i++) {
      const px = w / 2 - 119 + i * 34;
      const py = 46;
      const dog = this.dogsQueue[i];
      ctx.beginPath();
      ctx.arc(px, py, 8.5, 0, Math.PI * 2);
      if (dog && dog.fed) {
        ctx.fillStyle = dog.fast ? '#facc15' : '#4ade80';
      } else if (i === this.currentDogIndex && this.phase !== 'summary') {
        ctx.fillStyle = '#fdba74';
      } else {
        ctx.fillStyle = '#e2e8f0';
      }
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Golden Bones & Zoomies Streak badge (top-right)
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(w - 210, 12, 194, 42, 14);
    ctx.fill();
    ctx.stroke();

    Sprites.drawBoneTreat(ctx, w - 182, 33, 0.78, -0.2, '#fde047');
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${GameState.treats}`, w - 156, 34);

    if (this.zoomiesStreak > 0) {
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`⚡x${this.zoomiesStreak}`, w - 26, 34);
    }

    ctx.restore();
  }

  _drawWaitingQueue(ctx) {
    // Draw next 2 waiting dogs in line on the left patio
    for (let offset = 2; offset >= 1; offset--) {
      const idx = this.currentDogIndex + offset;
      if (idx >= TOTAL_DOGS_PER_ROUND) continue;
      const waitingDog = this.dogsQueue[idx];
      const qx = 92 - (offset - 1) * 52;
      const qy = 212 - (offset - 1) * 10;
      Sprites.drawDog(ctx, qx, qy, {
        breed: waitingDog.breed,
        hat: waitingDog.hat,
        scale: 0.65,
        mood: 'waiting',
        facing: 'right',
        time: this.time + idx * 0.7,
      });
    }
  }

  _drawActiveDogAndBubble(ctx) {
    const currentDog = this.dogsQueue[this.currentDogIndex];
    if (!currentDog || !this.problem) return;

    // Draw the active dog at the counter
    Sprites.drawDog(ctx, this.dogX, this.dogY, {
      breed: currentDog.breed,
      hat: currentDog.hat,
      scale: 1.12,
      mood: this.dogMood,
      facing: 'front',
      flipProgress: this.dogFlipProgress,
      time: this.time,
    });

    // Speech bubble to the right of the dog
    const bubbleX = 365;
    const bubbleY = 74;
    const bubbleW = 290;
    const bubbleH = 122;

    const showSolved = this.phase === 'flying_treat' || this.phase === 'celebrating';
    const equationText = showSolved
      ? `${this.problem.prompt} = ${this.problem.answer}!`
      : `${this.problem.prompt} = ?`;

    Sprites.drawSpeechBubble(ctx, bubbleX, bubbleY, bubbleW, bubbleH, {
      tailX: this.dogX + 45,
      tailY: this.dogY - 30,
      bgColor: showSolved ? '#ecfdf5' : '#ffffff',
      borderColor: showSolved ? '#10b981' : '#f59e0b',
    });

    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      showSolved ? `${currentDog.name} is so happy!` : `${currentDog.name} would like:`,
      bubbleX + bubbleW / 2,
      bubbleY + 24
    );

    ctx.fillStyle = showSolved ? '#059669' : '#0f172a';
    ctx.font = '900 40px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(equationText, bubbleX + bubbleW / 2, bubbleY + 64);

    // Draw the "Tail-Wag Zoomies Meter" inside the bottom of the speech bubble
    const maxFastSec = this.tier >= 2 ? 2.5 : 3.0;
    const drainRatio = Math.min(1, this.problemElapsedSec / maxFastSec);
    // Drains smoothly from 100% down to a minimum floor of 25% (never hits 0!)
    const meterFill = showSolved
      ? this.isSuperZoomies
        ? 1.0
        : 0.45
      : Math.max(0.25, 1.0 - drainRatio * 0.75);

    const barX = bubbleX + 24;
    const barY = bubbleY + 95;
    const barW = bubbleW - 48;
    const barH = 14;

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 7);
    ctx.fill();

    const isZoomiesReady = meterFill > 0.28;
    ctx.fillStyle = isZoomiesReady ? '#facc15' : '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * meterFill, barH, 7);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Comic Sans MS", sans-serif';
    ctx.fillText(
      isZoomiesReady ? '★ SUPER ZOOMIES BONUS (+3 BONES)' : '★ HAPPY TREAT (+1 BONE)',
      bubbleX + bubbleW / 2,
      barY + 7
    );
    ctx.restore();

    // Visual Ten-Frame / Bone Counter Hint if > 3.5s or after a wrong try
    const showHint =
      this.phase === 'ordering' &&
      (this.problemElapsedSec >= HINT_APPEAR_SEC || this.disabledDirs.length > 0);
    if (showHint) {
      this._drawTenFrameHint(ctx, 672, 72);
    }
  }

  /**
   * Draws a 2nd-grade pedagogical Double Ten-Frame visual hint next to the speech bubble
   * so the child can visually subitize Make-10 bridging and teen subtraction.
   */
  _drawTenFrameHint(ctx, x, y) {
    const w = 268;
    const h = 160;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 Visual Ten-Frame Helper', x + w / 2, y + 18);

    const { op, a, b, answer } = this.problem;
    const cellS = 20;
    const frameStartX = x + 36;

    // Draw two 10-frames (top frame = 1..10, bottom frame = 11..20)
    for (let frameIdx = 0; frameIdx < 2; frameIdx++) {
      const fy = y + 30 + frameIdx * (cellS * 2 + 8);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 5; c++) {
          const slotIndex = frameIdx * 10 + r * 5 + c; // 0..19
          const cx = frameStartX + c * (cellS + 4);
          const cy = fy + r * cellS;

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx, cy, cellS, cellS);

          if (op === '+') {
            if (slotIndex < a) {
              ctx.fillStyle = '#3b82f6';
              ctx.beginPath();
              ctx.arc(cx + cellS / 2, cy + cellS / 2, 6.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (slotIndex < a + b) {
              ctx.fillStyle = '#f97316';
              ctx.beginPath();
              ctx.arc(cx + cellS / 2, cy + cellS / 2, 6.5, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Subtraction: show `a` dots, cross out the last `b` dots
            if (slotIndex < a) {
              const isRemaining = slotIndex < answer;
              ctx.fillStyle = isRemaining ? '#10b981' : '#cbd5e1';
              ctx.beginPath();
              ctx.arc(cx + cellS / 2, cy + cellS / 2, 6.5, 0, Math.PI * 2);
              ctx.fill();

              if (!isRemaining) {
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx + 4, cy + 4);
                ctx.lineTo(cx + cellS - 4, cy + cellS - 4);
                ctx.stroke();
              }
            }
          }
        }
      }
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(frameIdx === 0 ? '= 10' : '= 20', frameStartX + 5 * (cellS + 4) + 6, fy + 22);
    }

    let strategyText = '';
    if (op === '+' && a < 10 && a + b > 10) {
      const needForTen = 10 - a;
      const leftover = b - needForTen;
      strategyText = `Make 10: ${a}+${needForTen}=10, +${leftover} = ${answer}!`;
    } else if (op === '+') {
      strategyText = `${a} blue + ${b} orange = ${answer}!`;
    } else {
      strategyText = `Start with ${a}, cross out ${b}!`;
    }

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(strategyText, x + w / 2, y + h - 12);
    ctx.restore();
  }

  _drawCafeCounter(ctx, w, h) {
    const counterY = 268;
    const counterH = 44;

    ctx.save();
    // Wooden cafe counter top
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.fillRect(0, counterY, w, counterH);
    ctx.strokeRect(0, counterY, w, counterH);

    // Counter top highlight trim
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(0, counterY, w, 10);

    // Lower counter wall backdrop behind the 8BitDo diamond controller
    const wallGrad = ctx.createLinearGradient(0, counterY + counterH, 0, h);
    wallGrad.addColorStop(0, '#fef3c7');
    wallGrad.addColorStop(1, '#fde68a');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, counterY + counterH, w, h - (counterY + counterH));

    // Cute bone jar on the left of the counter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(28, counterY - 46, 48, 46, 10);
    ctx.fill();
    ctx.stroke();
    Sprites.drawBoneTreat(ctx, 52, counterY - 18, 0.68, 0.3, '#fde047');
    Sprites.drawBoneTreat(ctx, 52, counterY - 28, 0.68, -0.25, '#fef08a');

    ctx.restore();
  }

  _drawBottomDiamondArea(ctx, w, h) {
    if (!this.problem) return;

    const centerX = w / 2;
    const centerY = h - 138;

    // Prompt instruction banner on the counter edge
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 17px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      '🎮 Press the matching 8BitDo button (or click a treat bowl) to feed the pup!',
      centerX,
      296
    );
    ctx.restore();

    const labels = getNormalizedDiamondLabels();
    this.diamondBounds = Sprites.drawDiamondController(
      ctx,
      centerX,
      centerY,
      this.problem.choices,
      labels,
      {
        disabledDirs: this.disabledDirs,
        highlightDir: this.highlightDir,
        time: this.time,
        radiusX: 142,
        radiusY: 74,
        buttonWidth: 136,
        buttonHeight: 68,
      }
    );

    if ((this.phase === 'ordering' || this.phase === 'entering') && this.diamondBounds) {
      for (const dir of ['top', 'left', 'bottom', 'right']) {
        const b = this.diamondBounds[dir];
        if (b && !this.disabledDirs.includes(dir)) {
          InputManager.registerClickZone(dir, b.x, b.y, b.w, b.h);
        }
      }
    }
  }

  _drawSummaryModal(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, w, h);

    const cardW = 540;
    const cardH = 390;
    const cardX = (w - cardW) / 2;
    const cardY = (h - cardH) / 2;

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = '900 32px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Cafe Shift Complete! 🎉', w / 2, cardY + 50);

    // Stars earned (1-3)
    for (let i = 0; i < 3; i++) {
      const sx = w / 2 + (i - 1) * 72;
      const sy = cardY + 110;
      const earned = i < this.starsEarned;
      ctx.font = '48px sans-serif';
      ctx.fillText(earned ? '⭐' : '☆', sx, sy);
    }

    // Summary stats
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Golden Bones Earned: +${this.roundTreatsEarned} 🦴`,
      w / 2,
      cardY + 172
    );
    ctx.fillText(
      `Super Zoomies Flips: ${this.fastRecallCount} / ${TOTAL_DOGS_PER_ROUND} ⚡`,
      w / 2,
      cardY + 210
    );

    const fastestLabel =
      this.fastestTimeMs !== null
        ? `${(this.fastestTimeMs / 1000).toFixed(1)}s`
        : 'Great job!';
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 19px "Comic Sans MS", sans-serif';
    ctx.fillText(`Fastest Recall: ${fastestLabel}`, w / 2, cardY + 248);

    // Play Again & Back to Island buttons
    const playBtn = { x: cardX + 45, y: cardY + 295, w: 210, h: 60 };
    const mapBtn = { x: cardX + 285, y: cardY + 295, w: 210, h: 60 };

    InputManager.registerClickZone('confirm', playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    InputManager.registerClickZone('cancel', mapBtn.x, mapBtn.y, mapBtn.w, mapBtn.h);

    // Play Again button
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.fillText('🔄 Play Again', playBtn.x + playBtn.w / 2, playBtn.y + 34);

    // Back to Map button
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

export default TreatCafeScene;
