import { GameState } from '../state.js';
import { MathEngine } from '../math.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';

const TOTAL_THROWS = 10;
const FLIGHT_DURATION = 3.5; // Seconds for full graceful arc across the park
const BACKFLIP_WINDOW = 2.5; // Answer within 2.5s on first try for 360° Mid-Air Backflip Catch!
const CATCH_ANIM_DURATION = 1.25;

const SPECTATOR_DOGS = [
  { breed: 'corgi', hat: 'chef', xRatio: 0.24 },
  { breed: 'pug', hat: 'crown', xRatio: 0.37 },
  { breed: 'dalmatian', hat: 'none', xRatio: 0.50 },
  { breed: 'husky', hat: 'shades', xRatio: 0.63 },
  { breed: 'poodle', hat: 'wizard', xRatio: 0.76 },
];

function drawRoundedPanel(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export class FrisbeeParkScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.app = null;
    this.onExit = null;
    this.tier = 2;
    this.parkId = 'park_frisbee';

    this._parseInitArgs(arg1, arg2);

    this.particles = new ParticleSystem();
    this.time = 0;
    this.canvasWidth = 1280;
    this.canvasHeight = 720;

    this.diamondBounds = null;
    this.backButtonBounds = { x: 24, y: 20, w: 175, h: 52 };
    this.completeBtnBounds = { x: 490, y: 540, w: 300, h: 68 };

    this.resetSession();
  }

  _parseInitArgs(arg1, arg2) {
    if (typeof arg1 === 'function') {
      this.onExit = arg1;
    } else if (typeof arg1 === 'number') {
      this.tier = arg1;
    } else if (arg1 && typeof arg1 === 'object') {
      if (
        typeof arg1.switchScene === 'function' ||
        typeof arg1.setScene === 'function' ||
        typeof arg1.changeScene === 'function' ||
        typeof arg1.goToMap === 'function'
      ) {
        this.app = arg1;
      }
      if (typeof arg1.tier === 'number') this.tier = arg1.tier;
      if (typeof arg1.difficulty === 'number') this.tier = arg1.difficulty;
      if (typeof arg1.parkId === 'string') this.parkId = arg1.parkId;
      if (typeof arg1.onExit === 'function') this.onExit = arg1.onExit;
      if (typeof arg1.onBack === 'function') this.onExit = arg1.onBack;
      if (typeof arg1.onComplete === 'function') this.onExit = arg1.onComplete;
    }

    if (typeof arg2 === 'function') {
      this.onExit = arg2;
    } else if (arg2 && typeof arg2 === 'object') {
      if (typeof arg2.tier === 'number') this.tier = arg2.tier;
      if (typeof arg2.difficulty === 'number') this.tier = arg2.difficulty;
      if (typeof arg2.parkId === 'string') this.parkId = arg2.parkId;
      if (typeof arg2.onExit === 'function') this.onExit = arg2.onExit;
      if (typeof arg2.onBack === 'function') this.onExit = arg2.onBack;
    }
  }

  enter(options = {}) {
    this._parseInitArgs(options);
    InputManager.setDiamondMode(true);
    InputManager.clearClickZones();
    this.resetSession();
  }

  init(options = {}) {
    this.enter(options);
  }

  exit() {
    InputManager.clearClickZones();
  }

  resetSession() {
    InputManager.setDiamondMode(true);
    this.particles.clear();

    this.throwIndex = 0;
    this.totalThrows = TOTAL_THROWS;
    this.sessionBonesEarned = 0;
    this.backflipCatches = 0;
    this.firstTryCatches = 0;
    this.starsEarned = 0;
    this.throwHistory = []; // 'backflip' | 'catch'

    this.state = 'throwing'; // 'throwing' | 'catching' | 'complete'
    this.currentFact = null;
    this.throwTimer = 0;
    this.mistakesThisThrow = 0;
    this.disabledDirs = new Set();
    this.feedbackText = '';
    this.feedbackColor = '#1e293b';

    // Dog & Frisbee kinematics
    this.dogHomeX = 195;
    this.dogHomeY = 420;
    this.dogX = this.dogHomeX;
    this.dogY = this.dogHomeY;
    this.dogMood = 'waiting';
    this.dogFlipProgress = 0;

    this.frisbeeX = 105;
    this.frisbeeY = 405;
    this.frisbeeAngle = 0;
    this.launcherCompression = 0;
    this.launchXRatio = 0.11;

    this.catchAnimTimer = 0;
    this.isBackflipCatch = false;
    this.catchStartX = this.dogHomeX;
    this.catchStartY = this.dogHomeY;
    this.catchTargetX = 520;
    this.catchTargetY = 340;
    this.caughtDir = null;

    this._startNextThrow();
  }

  _startNextThrow() {
    if (this.throwIndex >= this.totalThrows) {
      this._finishParkSession();
      return;
    }

    this.state = 'throwing';
    this.currentFact = MathEngine.generateSingleFact(this.tier);
    this.throwTimer = 0;
    this.mistakesThisThrow = 0;
    this.disabledDirs.clear();
    this.caughtDir = null;
    this.feedbackText = 'Catch the Frisbee! Press the matching button!';
    this.feedbackColor = '#0f172a';

    this.dogX = this.dogHomeX;
    this.dogY = this.dogHomeY;
    this.dogMood = 'waiting';
    this.dogFlipProgress = 0;
    this.launcherCompression = 1.0;

    // Alternate ground launch spots slightly for a classic NES Duck Hunt clay-pigeon launch feel
    const launchSpots = [0.11, 0.15, 0.09, 0.14];
    this.launchXRatio = launchSpots[this.throwIndex % launchSpots.length];
    const startPos = this._getFrisbeeFlightPosition(0);
    this.frisbeeX = startPos.x;
    this.frisbeeY = startPos.y;

    // Emit grass/launch burst right at the ground launcher
    this.particles.emitStars(startPos.x, startPos.y - 10, 8);

    SoundFX.treatToss();
  }

  _finishParkSession() {
    this.state = 'complete';
    if (this.firstTryCatches >= 8 || this.backflipCatches >= 5) {
      this.starsEarned = 3;
    } else if (this.firstTryCatches >= 5 || this.backflipCatches >= 3) {
      this.starsEarned = 2;
    } else {
      // Non-punishing: completing all 10 throws always awards at least 2 stars!
      this.starsEarned = 2;
    }

    if (GameState.parkStars) {
      const prev = GameState.parkStars[this.parkId] || 0;
      GameState.parkStars[this.parkId] = Math.max(prev, this.starsEarned);
      GameState.save();
    }

    SoundFX.levelComplete();
    this.particles.emitConfetti(this.canvasWidth * 0.5, this.canvasHeight * 0.35, 45);
    this.particles.emitStars(this.canvasWidth * 0.5, this.canvasHeight * 0.35, 20);
  }

  _returnToMap() {
    InputManager.clearClickZones();
    if (typeof this.onExit === 'function') {
      this.onExit();
      return;
    }
    if (this.app) {
      if (typeof this.app.switchScene === 'function') {
        this.app.switchScene('map');
        return;
      }
      if (typeof this.app.setScene === 'function') {
        this.app.setScene('map');
        return;
      }
      if (typeof this.app.changeScene === 'function') {
        this.app.changeScene('map');
        return;
      }
      if (typeof this.app.goToMap === 'function') {
        this.app.goToMap();
        return;
      }
    }
    if (typeof window !== 'undefined') {
      if (window.game && typeof window.game.switchScene === 'function') {
        window.game.switchScene('map');
      } else if (window.app && typeof window.app.switchScene === 'function') {
        window.app.switchScene('map');
      }
    }
  }

  _getFrisbeeFlightPosition(t) {
    const w = this.canvasWidth || 960;
    const h = this.canvasHeight || 600;
    const launchX = Math.round(w * (this.launchXRatio || 0.11));
    const launchY = Math.round(h * 0.66);
    const hoverX = Math.round(w * 0.39);
    const hoverY = Math.round(h * 0.31);

    if (t < FLIGHT_DURATION) {
      const p = Math.max(0, Math.min(1, t / FLIGHT_DURATION));
      // Fast initial ground-launch impulse (Duck Hunt clay-pigeon style) that arcs high into the sky
      const easeP = 1 - Math.pow(1 - p, 2.35);
      const x = launchX + (hoverX - launchX) * easeP;
      const linearY = launchY + (hoverY - launchY) * easeP;
      const arcLift = Math.sin(Math.pow(p, 0.7) * Math.PI) * (h * 0.16);
      // Perspective scale: starts smaller at the ground launcher (0.58x) and grows to 1.0x as it rises
      const discScale = 0.58 + 0.42 * Math.min(1, p * 2.5);
      return {
        x,
        y: linearY - arcLift,
        launchX,
        launchY,
        discScale,
        hovering: false,
        inBackflipZone: t < BACKFLIP_WINDOW && this.mistakesThisThrow === 0,
      };
    } else {
      // Gentle hover on a friendly whirlwind / parachute so the player never runs out of time
      const hoverElapsed = t - FLIGHT_DURATION;
      const x = hoverX + Math.sin(hoverElapsed * 2.1) * 16;
      const y = hoverY + Math.sin(hoverElapsed * 3.4) * 9;
      return {
        x,
        y,
        launchX,
        launchY,
        discScale: 1.0,
        hovering: false || true,
        inBackflipZone: false,
      };
    }
  }

  _handleAnswerDirection(dir) {
    if (this.state !== 'throwing' || !this.currentFact) return;
    if (this.disabledDirs.has(dir)) return;

    const chosenValue = this.currentFact.choices[dir];
    const isCorrect = chosenValue === this.currentFact.answer;
    const elapsedMs = Math.round(this.throwTimer * 1000);

    if (isCorrect) {
      const firstTry = this.mistakesThisThrow === 0;
      const fastMidAir = this.throwTimer < BACKFLIP_WINDOW && firstTry;

      GameState.recordFactResult(
        this.currentFact.key,
        firstTry,
        elapsedMs,
        BACKFLIP_WINDOW * 1000
      );

      this.caughtDir = dir;
      this.isBackflipCatch = fastMidAir;
      this.state = 'catching';
      this.catchAnimTimer = 0;
      this.catchStartX = this.dogX;
      this.catchStartY = this.dogY;
      this.catchTargetX = this.frisbeeX;
      this.catchTargetY = this.frisbeeY;

      if (firstTry) {
        this.firstTryCatches += 1;
      }

      if (fastMidAir) {
        this.backflipCatches += 1;
        this.sessionBonesEarned += 3;
        GameState.addTreats(3);
        this.throwHistory.push('backflip');
        this.dogMood = 'zoomies';
        this.feedbackText = `360° BACKFLIP CATCH!  ${this.currentFact.prompt} = ${this.currentFact.answer}!`;
        this.feedbackColor = '#d97706';
        SoundFX.zoomies();
        this.particles.emitConfetti(this.frisbeeX, this.frisbeeY, 28);
        this.particles.emitStars(this.frisbeeX, this.frisbeeY, 16);
        this.particles.emitHearts(this.frisbeeX, this.frisbeeY - 20, 8);
        this.particles.addFloatingText(
          this.frisbeeX,
          this.frisbeeY - 35,
          '360° BACKFLIP! +3 🦴',
          '#f59e0b',
          1.25
        );
      } else {
        this.sessionBonesEarned += 1;
        GameState.addTreats(1);
        this.throwHistory.push('catch');
        this.dogMood = 'excited';
        this.feedbackText = `Nice Catch!  ${this.currentFact.prompt} = ${this.currentFact.answer}!`;
        this.feedbackColor = '#15803d';
        SoundFX.bark(1.08);
        SoundFX.correct();
        this.particles.emitStars(this.frisbeeX, this.frisbeeY, 12);
        this.particles.emitHearts(this.frisbeeX, this.frisbeeY - 15, 6);
        this.particles.addFloatingText(
          this.frisbeeX,
          this.frisbeeY - 30,
          `${this.currentFact.prompt} = ${this.currentFact.answer}! +1 🦴`,
          '#10b981',
          1.1
        );
      }
    } else {
      // Gentle, encouraging non-punishing retry
      this.mistakesThisThrow += 1;
      this.disabledDirs.add(dir);
      SoundFX.oops();
      this.feedbackText = `Not ${chosenValue} — try another button! Count it out: ${this.currentFact.prompt}`;
      this.feedbackColor = '#b45309';
      this.particles.addFloatingText(
        this.frisbeeX,
        this.frisbeeY + 45,
        'Keep trying! 🐾',
        '#f59e0b',
        0.95
      );
    }
  }

  handleClick(x, y) {
    if (
      x >= this.backButtonBounds.x &&
      x <= this.backButtonBounds.x + this.backButtonBounds.w &&
      y >= this.backButtonBounds.y &&
      y <= this.backButtonBounds.y + this.backButtonBounds.h
    ) {
      SoundFX.step();
      this._returnToMap();
      return true;
    }

    if (this.state === 'complete') {
      const b = this.completeBtnBounds;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        SoundFX.bark();
        this._returnToMap();
        return true;
      }
      return false;
    }

    if (this.state === 'throwing' && this.diamondBounds) {
      for (const dir of ['top', 'left', 'bottom', 'right']) {
        const b = this.diamondBounds[dir];
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this._handleAnswerDirection(dir);
          return true;
        }
      }
    }
    return false;
  }

  onClick(x, y) {
    return this.handleClick(x, y);
  }

  onPointerDown(x, y) {
    return this.handleClick(x, y);
  }

  update(dt) {
    const safeDt = typeof dt === 'number' && dt > 0 ? (dt > 1 ? dt / 1000 : dt) : 0.016;
    const clampedDt = Math.min(safeDt, 0.1);
    this.time += clampedDt;

    this.particles.update(clampedDt);

    if (this.launcherCompression > 0) {
      this.launcherCompression = Math.max(0, this.launcherCompression - clampedDt * 3.5);
    }

    // Check Back / Cancel input
    if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
      SoundFX.step();
      this._returnToMap();
      return;
    }

    if (this.state === 'complete') {
      if (InputManager.justPressed('play_again')) {
        SoundFX.bark(1.1);
        this.resetSession();
        return;
      }
      if (
        InputManager.justPressed('confirm') ||
        InputManager.justPressed('start') ||
        InputManager.justPressed('bottom') ||
        InputManager.justPressed('right')
      ) {
        SoundFX.bark(1.1);
        this.resetSession();
        return;
      }
      if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
        SoundFX.step();
        this._returnToMap();
      }
      return;
    }

    if (this.state === 'throwing') {
      this.throwTimer += clampedDt;
      this.frisbeeAngle += clampedDt * 9.5;

      const flight = this._getFrisbeeFlightPosition(this.throwTimer);
      this.frisbeeX = flight.x;
      this.frisbeeY = flight.y;

      // Subtle excited anticipation hop from the player's dog
      this.dogMood = flight.inBackflipZone ? 'excited' : 'waiting';

      // Poll 4-button diamond inputs
      if (InputManager.justPressed('top')) {
        this._handleAnswerDirection('top');
      } else if (InputManager.justPressed('left')) {
        this._handleAnswerDirection('left');
      } else if (InputManager.justPressed('bottom')) {
        this._handleAnswerDirection('bottom');
      } else if (InputManager.justPressed('right')) {
        this._handleAnswerDirection('right');
      }
    } else if (this.state === 'catching') {
      this.catchAnimTimer += clampedDt;
      const p = Math.min(1, this.catchAnimTimer / CATCH_ANIM_DURATION);

      if (this.isBackflipCatch) {
        // Dog sprints across the field, leaps into a 360° mid-air backflip, and lands heroically
        const landingX = Math.min(640, this.catchTargetX + 55);
        const landingY = this.dogHomeY;

        if (p < 0.5) {
          const jumpP = p / 0.5;
          this.dogX = this.catchStartX + (this.catchTargetX - this.catchStartX) * jumpP;
          this.dogY =
            this.catchStartY +
            (this.catchTargetY + 15 - this.catchStartY) * Math.sin((jumpP * Math.PI) / 2);
        } else {
          const landP = (p - 0.5) / 0.5;
          this.dogX = this.catchTargetX + (landingX - this.catchTargetX) * landP;
          this.dogY =
            this.catchTargetY +
            15 +
            (landingY - (this.catchTargetY + 15)) * (landP * landP);
        }

        // Full 360° backflip rotation during the jump window
        if (p >= 0.12 && p <= 0.88) {
          this.dogFlipProgress = (p - 0.12) / 0.76;
        } else {
          this.dogFlipProgress = 0;
        }

        // Once the dog reaches the frisbee at apex, the frisbee stays in its mouth
        if (p >= 0.45) {
          this.frisbeeX = this.dogX + 26;
          this.frisbeeY = this.dogY - 16;
        }
      } else {
        // Gentle trot and happy bounce catch
        const targetGroundX = Math.min(600, this.catchTargetX);
        const targetGroundY = this.dogHomeY - 10;
        const moveP = Math.min(1, p * 1.4);
        const hopLift = Math.sin(moveP * Math.PI) * 55;

        this.dogX = this.catchStartX + (targetGroundX - this.catchStartX) * moveP;
        this.dogY = this.catchStartY + (targetGroundY - this.catchStartY) * moveP - hopLift;
        this.dogFlipProgress = 0;

        // Frisbee floats down into the dog's mouth
        this.frisbeeX = this.catchTargetX + (this.dogX + 24 - this.catchTargetX) * moveP;
        this.frisbeeY = this.catchTargetY + (this.dogY - 12 - this.catchTargetY) * moveP;
      }

      if (this.catchAnimTimer >= CATCH_ANIM_DURATION) {
        this.throwIndex += 1;
        this._startNextThrow();
      }
    }
  }

  _getNormalizedDiamondLabels() {
    const raw =
      typeof InputManager.getDiamondLabels === 'function'
        ? InputManager.getDiamondLabels()
        : {};
    const defaults = {
      top: { key: 'X', label: 'X', color: '#3b82f6', arrow: '▲' },
      left: { key: 'Y', label: 'Y', color: '#10b981', arrow: '◀' },
      bottom: { key: 'B', label: 'B', color: '#f59e0b', arrow: '▼' },
      right: { key: 'A', label: 'A', color: '#ef4444', arrow: '▶' },
    };
    const out = {};
    for (const dir of ['top', 'left', 'bottom', 'right']) {
      const item = raw[dir] || {};
      const key = item.key || item.label || defaults[dir].key;
      out[dir] = {
        key,
        label: key,
        color: item.color || defaults[dir].color,
        arrow: defaults[dir].arrow,
      };
    }
    return out;
  }

  _drawParkBackground(ctx, w, h) {
    // Sunny sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.56);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.55, '#bae6fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.56);

    // Glowing sun in top-right
    ctx.save();
    const sunX = w - 140;
    const sunY = 95;
    const sunPulse = 1 + Math.sin(this.time * 2.2) * 0.05;
    ctx.translate(sunX, sunY);
    ctx.scale(sunPulse, sunPulse);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.32)';
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Fluffy drifting clouds
    const clouds = [
      { baseX: 180, y: 110, scale: 1.0, speed: 12 },
      { baseX: 560, y: 85, scale: 1.15, speed: 9 },
      { baseX: 930, y: 125, scale: 0.9, speed: 15 },
    ];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (const c of clouds) {
      const cx = ((c.baseX + this.time * c.speed) % (w + 220)) - 110;
      ctx.save();
      ctx.translate(cx, c.y);
      ctx.scale(c.scale, c.scale);
      ctx.beginPath();
      ctx.arc(-28, 6, 22, 0, Math.PI * 2);
      ctx.arc(0, -4, 30, 0, Math.PI * 2);
      ctx.arc(28, 6, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Distant rolling park hills
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.54);
    ctx.quadraticCurveTo(w * 0.25, h * 0.42, w * 0.52, h * 0.52);
    ctx.quadraticCurveTo(w * 0.78, h * 0.43, w, h * 0.53);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Main lush green dog park field
    const grassGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
    grassGrad.addColorStop(0, '#4ade80');
    grassGrad.addColorStop(0.5, '#22c55e');
    grassGrad.addColorStop(1, '#16a34a');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    // Mowed lawn stripes for visual depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 6; i++) {
      const stripeY = h * 0.54 + i * 54;
      ctx.fillRect(0, stripeY, w, 26);
    }

    // White picket fence along the back of the field
    const fenceY = h * 0.48;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.fillRect(0, fenceY + 12, w, 8);
    ctx.fillRect(0, fenceY + 30, w, 8);
    for (let fx = 15; fx < w; fx += 44) {
      drawRoundedPanel(ctx, fx, fenceY, 18, 46, 5);
      ctx.fill();
      ctx.stroke();
    }

    // Cheering crowd of spectator dogs behind/along the fence
    const crowdExcited = this.state === 'catching' || this.state === 'complete';
    for (let i = 0; i < SPECTATOR_DOGS.length; i++) {
      const spec = SPECTATOR_DOGS[i];
      const sx = w * spec.xRatio;
      const sy = h * 0.47 + (i % 2) * 8;
      Sprites.drawDog(ctx, sx, sy, {
        breed: spec.breed,
        hat: spec.hat,
        scale: 0.58,
        time: this.time + i * 0.7,
        mood: crowdExcited ? 'excited' : 'happy',
        facing: sx < this.frisbeeX ? 'right' : 'left',
      });
    }
  }

  _drawFrisbeeLauncher(ctx) {
    const w = this.canvasWidth || 960;
    const h = this.canvasHeight || 600;
    const lx = Math.round(w * (this.launchXRatio || 0.11));
    const ly = Math.round(h * 0.68);
    const compress = this.launcherCompression * 14;
    const rustle = this.throwTimer < 0.45 ? Math.sin(this.time * 38) * 4 : 0;

    ctx.save();
    ctx.translate(lx, ly);

    // Base shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 44, 56, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spring coil
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-18, 22);
    ctx.lineTo(18, 12 + compress * 0.4);
    ctx.lineTo(-18, 2 + compress * 0.7);
    ctx.lineTo(18, -10 + compress);
    ctx.stroke();

    // Friendly cartoon launcher body ("Bark-O-Matic")
    drawRoundedPanel(ctx, -42, 16, 84, 30, 12);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.fill();
    ctx.stroke();

    // Tilted launch cradle dish
    ctx.save();
    ctx.translate(4, -16 + compress);
    ctx.rotate(-0.38);
    drawRoundedPanel(ctx, -34, -10, 68, 20, 9);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Paw sticker on launcher base
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐾 PULL!', 0, 31);

    // Classic NES Duck Hunt foreground grass bush tufts around the ground launcher
    ctx.fillStyle = '#15803d';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.5;
    const blades = [
      { x: -54, h: 25, tilt: -9 + rustle },
      { x: -42, h: 31, tilt: -4 + rustle },
      { x: 42, h: 30, tilt: 5 - rustle },
      { x: 54, h: 24, tilt: 9 - rustle },
    ];
    for (const b of blades) {
      ctx.beginPath();
      ctx.moveTo(b.x - 8, 44);
      ctx.quadraticCurveTo(b.x + b.tilt * 0.5, 44 - b.h * 0.6, b.x + b.tilt, 44 - b.h);
      ctx.quadraticCurveTo(b.x + 8, 44 - b.h * 0.5, b.x + 8, 44);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawFlyingFrisbee(ctx) {
    if (!this.currentFact) return;

    const flight = this._getFrisbeeFlightPosition(this.throwTimer);
    const fx = this.frisbeeX;
    const fy = this.frisbeeY;
    const discScale = this.state === 'throwing' ? flight.discScale || 1.0 : 1.0;

    ctx.save();

    // 0. Ground-launch whoosh trail showing the frisbee shooting up from the ground launcher
    if (this.state === 'throwing' && this.throwTimer < 1.8) {
      const trailAlpha = Math.max(0, 0.75 * (1 - this.throwTimer / 1.8));
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${trailAlpha.toFixed(2)})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(flight.launchX, flight.launchY - 8);
      ctx.quadraticCurveTo(
        flight.launchX + (fx - flight.launchX) * 0.35,
        Math.min(flight.launchY, fy) - 28,
        fx,
        fy
      );
      ctx.stroke();
      ctx.restore();
    }

    // 1. If hovering after 3.5s, draw the friendly Whirlwind & Parachute so it never falls!
    if (this.state === 'throwing' && flight.hovering) {
      // Gentle swirling whirlwind rings underneath
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 3; i++) {
        const ringY = fy + 26 + i * 14;
        const ringW = 36 - i * 8 + Math.sin(this.time * 6 + i) * 4;
        ctx.beginPath();
        ctx.ellipse(fx, ringY, ringW, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cute colorful parachute canopy above the frisbee
      const canopyY = fy - 76;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(fx - 38, canopyY + 6);
      ctx.lineTo(fx - 16, fy - 10);
      ctx.moveTo(fx + 38, canopyY + 6);
      ctx.lineTo(fx + 16, fy - 10);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx, canopyY + 8, 42, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Parachute stripes
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(fx, canopyY + 8, 42, Math.PI * 1.3, Math.PI * 1.7, false);
      ctx.lineTo(fx, canopyY + 8);
      ctx.closePath();
      ctx.fill();
    }

    // 2. If in the < 2.5s Backflip Zone, draw golden sparkle rings & turbo badge
    if (this.state === 'throwing' && flight.inBackflipZone) {
      const remainingRatio = Math.max(0, 1 - this.throwTimer / BACKFLIP_WINDOW);
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.ellipse(fx, fy, 74, 34, 0, 0, Math.PI * 2 * remainingRatio);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw the glowing spinning Frisbee disc (scales up as it launches from the ground)
    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(discScale, discScale);

    // Outer glow
    ctx.shadowColor = flight.inBackflipZone ? '#facc15' : '#38bdf8';
    ctx.shadowBlur = 18;

    // Disc body (elliptical perspective)
    ctx.fillStyle = flight.inBackflipZone ? '#ec4899' : '#06b6d4';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 62, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Spinning inner rings & star decals
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, -2, 42, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotating rim dots to convey fast spin
    for (let i = 0; i < 4; i++) {
      const a = this.frisbeeAngle + (i * Math.PI) / 2;
      const dx = Math.cos(a) * 50;
      const dy = Math.sin(a) * 17;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. High-contrast Math Fact Sign attached above the frisbee
    const equationText =
      this.state === 'catching'
        ? `${this.currentFact.prompt} = ${this.currentFact.answer}!`
        : `${this.currentFact.prompt} = ?`;

    const badgeW = this.state === 'catching' ? 235 : 195;
    const badgeH = 62;
    const badgeX = Math.max(18, fx - badgeW / 2);
    const badgeY = Math.max(106, Math.min(340, fy - 66));

    // Drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    drawRoundedPanel(ctx, badgeX + 3, badgeY + 5, badgeW, badgeH, 18);
    ctx.fill();

    // Sign body
    ctx.fillStyle = this.state === 'catching' ? '#dcfce7' : '#ffffff';
    ctx.strokeStyle =
      this.state === 'catching'
        ? '#16a34a'
        : flight.inBackflipZone
        ? '#f59e0b'
        : '#0284c7';
    ctx.lineWidth = 4.5;
    drawRoundedPanel(ctx, badgeX, badgeY, badgeW, badgeH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 34px "Fredoka One", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(equationText, fx, badgeY + badgeH / 2 + 2);

    // Show "★ FAST BACKFLIP BONUS (+3 BONES)" tag while in the <2.5s window
    if (this.state === 'throwing' && flight.inBackflipZone) {
      const tagW = 228;
      const tagH = 26;
      drawRoundedPanel(ctx, fx - tagW / 2, badgeY - 30, tagW, tagH, 10);
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
      ctx.fillText('★ FAST BACKFLIP BONUS +3 BONES', fx, badgeY - 17);
    }

    ctx.restore();
  }

  _drawHUD(ctx, w, h) {
    // 1. Back to Map Button (top-left)
    const bb = this.backButtonBounds;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    drawRoundedPanel(ctx, bb.x, bb.y, bb.w, bb.h, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬅ Park Map', bb.x + bb.w / 2, bb.y + bb.h / 2 + 1);
    ctx.restore();

    // Register click zone for Back button
    InputManager.registerClickZone('cancel', bb.x, bb.y, bb.w, bb.h);

    // 2. Throw Progress Bar (top-center)
    const progW = 470;
    const progH = 54;
    const progX = w / 2 - progW / 2;
    const progY = 18;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3.5;
    drawRoundedPanel(ctx, progX, progY, progW, progH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const currentDisplayThrow = Math.min(this.totalThrows, this.throwIndex + 1);
    ctx.fillText(`Frisbee ${currentDisplayThrow} / ${this.totalThrows}:`, progX + 18, progY + progH / 2);

    // 10 mini frisbee slots
    for (let i = 0; i < this.totalThrows; i++) {
      const slotX = progX + 178 + i * 28;
      const slotY = progY + progH / 2;
      const status = this.throwHistory[i];

      ctx.beginPath();
      ctx.arc(slotX, slotY, 10, 0, Math.PI * 2);
      if (status === 'backflip') {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#b45309';
      } else if (status === 'catch') {
        ctx.fillStyle = '#4ade80';
        ctx.strokeStyle = '#15803d';
      } else if (i === this.throwIndex && this.state !== 'complete') {
        ctx.fillStyle = '#bae6fd';
        ctx.strokeStyle = '#0284c7';
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
      }
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // 3. Golden Bones Counter (top-right)
    const boneBoxW = 190;
    const boneBoxH = 52;
    const boneBoxX = w - boneBoxW - 24;
    const boneBoxY = 20;

    ctx.save();
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    drawRoundedPanel(ctx, boneBoxX, boneBoxY, boneBoxW, boneBoxH, 16);
    ctx.fill();
    ctx.stroke();

    Sprites.drawBoneTreat(ctx, boneBoxX + 38, boneBoxY + boneBoxH / 2, 0.95, -0.2);

    ctx.fillStyle = '#78350f';
    ctx.font = '900 26px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${GameState.treats}`, boneBoxX + 74, boneBoxY + boneBoxH / 2 + 2);
    ctx.restore();

    // 4. Bottom Feedback Banner
    if (this.feedbackText && this.state !== 'complete') {
      const fbW = Math.min(560, w - 450);
      const fbH = 50;
      const fbX = 24;
      const fbY = h - 66;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      drawRoundedPanel(ctx, fbX, fbY, fbW, fbH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.feedbackColor;
      ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.feedbackText, fbX + fbW / 2, fbY + fbH / 2 + 1);
      ctx.restore();
    }
  }

  _drawDiamondPanel(ctx, w, h) {
    if (!this.currentFact || this.state === 'complete') return;

    const centerX = w - 215;
    const centerY = h - 185;

    // Soft translucent backing card behind the 4-button diamond controller
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.84)';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    drawRoundedPanel(ctx, centerX - 195, centerY - 140, 390, 275, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pick the matching answer!', centerX, centerY - 118);
    ctx.restore();

    const labels = this._getNormalizedDiamondLabels();
    this.diamondBounds = Sprites.drawDiamondController(
      ctx,
      centerX,
      centerY,
      this.currentFact.choices,
      labels,
      {
        radiusX: 118,
        radiusY: 74,
        buttonWidth: 118,
        buttonHeight: 66,
        disabledDirs: this.disabledDirs,
        highlightDir: this.caughtDir,
        time: this.time,
      }
    );

    // Register clickable zones with InputManager so mouse/touch clicks trigger the buttons
    for (const dir of ['top', 'left', 'bottom', 'right']) {
      const b = this.diamondBounds[dir];
      if (b) {
        InputManager.registerClickZone(dir, b.x, b.y, b.w, b.h);
      }
    }
  }

  _drawCompleteOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
    ctx.fillRect(0, 0, w, h);

    const cardW = 640;
    const cardH = 470;
    const cardX = w / 2 - cardW / 2;
    const cardY = h / 2 - cardH / 2;

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    drawRoundedPanel(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 42px "Fredoka One", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Frisbee Park Complete!', w / 2, cardY + 68);

    // Stars row
    const starText = '⭐'.repeat(this.starsEarned) + '☆'.repeat(Math.max(0, 3 - this.starsEarned));
    ctx.font = '48px sans-serif';
    ctx.fillText(starText, w / 2, cardY + 135);

    // Player dog celebrating inside the modal
    Sprites.drawDog(ctx, w / 2 - 170, cardY + 260, {
      breed: GameState.selectedBreed,
      hat: GameState.selectedHat,
      scale: 1.05,
      time: this.time,
      mood: 'zoomies',
    });

    // Stats summary
    ctx.textAlign = 'left';
    ctx.font = 'bold 26px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`🎯 Frisbees Caught: ${this.totalThrows} / ${this.totalThrows}`, w / 2 - 65, cardY + 215);
    ctx.fillText(`⚡ 360° Backflip Catches: ${this.backflipCatches}`, w / 2 - 65, cardY + 260);
    ctx.fillStyle = '#b45309';
    ctx.fillText(`🦴 Golden Bones Earned: +${this.sessionBonesEarned}`, w / 2 - 65, cardY + 305);

    // Play Again & Back to Park Map buttons
    const playBtn = { x: cardX + 60, y: cardY + cardH - 96, w: 245, h: 64 };
    const mapBtn = { x: cardX + 335, y: cardY + cardH - 96, w: 245, h: 64 };

    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 4;
    drawRoundedPanel(ctx, playBtn.x, playBtn.y, playBtn.w, playBtn.h, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔄 Play Again (A)', playBtn.x + playBtn.w / 2, playBtn.y + playBtn.h / 2 + 2);

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    drawRoundedPanel(ctx, mapBtn.x, mapBtn.y, mapBtn.w, mapBtn.h, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🗺️ Island Map (Esc)', mapBtn.x + mapBtn.w / 2, mapBtn.y + mapBtn.h / 2 + 2);

    InputManager.registerClickZone('play_again', playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    InputManager.registerClickZone('cancel', mapBtn.x, mapBtn.y, mapBtn.w, mapBtn.h);
    ctx.restore();
  }

  draw(ctx, canvas) {
    const w = canvas?.width || ctx.canvas?.width || 960;
    const h = canvas?.height || ctx.canvas?.height || 600;
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.dogHomeX = Math.round(w * 0.21);
    this.dogHomeY = Math.round(h * 0.70);
    if (this.state === 'throwing') {
      this.dogX = this.dogHomeX;
      this.dogY = this.dogHomeY;
    }

    InputManager.clearClickZones();

    // 1. Sunny Dog Park Scenery & Cheering Spectator Crowd
    this._drawParkBackground(ctx, w, h);

    // 2. Friendly Frisbee Launcher
    this._drawFrisbeeLauncher(ctx);

    // 3. Player's Dog (sprinting / backflipping / waiting)
    Sprites.drawDog(ctx, this.dogX, this.dogY, {
      breed: GameState.selectedBreed,
      hat: GameState.selectedHat,
      scale: 1.15,
      time: this.time,
      mood: this.dogMood,
      facing: 'right',
      flipProgress: this.dogFlipProgress,
    });

    // 4. Flying / Hovering Frisbee with Math Fact
    if (this.state !== 'complete') {
      this._drawFlyingFrisbee(ctx);
    }

    // 5. 4-Button 8BitDo Diamond UI
    this._drawDiamondPanel(ctx, w, h);

    // 6. Top & Bottom HUD
    this._drawHUD(ctx, w, h);

    // 7. Particles & Floating Text
    this.particles.draw(ctx);

    // 8. Park Complete Celebration Modal
    if (this.state === 'complete') {
      this._drawCompleteOverlay(ctx, w, h);
    }
  }

  render(ctx, canvas) {
    this.draw(ctx, canvas);
  }
}

export default FrisbeeParkScene;
