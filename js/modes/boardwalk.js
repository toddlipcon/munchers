import { GameState } from '../state.js';
import { MathEngine } from '../math.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';

const TOTAL_CONES_PER_ROUND = 8;
const FAST_FROSTY_WINDOW = 3.8; // < 3.8s on first try = Frosty Fast Bonus (+3 Bones + Surf Backflip!)
const COOL_SCOOP_WINDOW = 7.5; // < 7.5s = Cool Scoop (+2 Bones), > 7.5s = Melting (+1 Bone)

const BEACH_CUSTOMERS = [
  { breed: 'husky', name: 'Surfer Koda', hat: 'shades' },
  { breed: 'corgi', name: 'Beach Cheddar', hat: 'crown' },
  { breed: 'dalmatian', name: 'Lifeguard Pongo', hat: 'shades' },
  { breed: 'poodle', name: 'Sunhat Gigi', hat: 'wizard' },
  { breed: 'pug', name: 'Boardwalk Pudge', hat: 'chef' },
  { breed: 'golden', name: 'Captain Biscuit', hat: 'shades' },
];

const BEACH_CAT_CUSTOMERS = [
  { breed: 'orange_tabby', name: 'Surfer Marmalade', hat: 'shades' },
  { breed: 'siamese', name: 'Beach Suki', hat: 'crown' },
  { breed: 'tuxedo', name: 'Lifeguard Figaro', hat: 'shades' },
  { breed: 'persian', name: 'Sunhat Duchess', hat: 'wizard' },
  { breed: 'bengal', name: 'Boardwalk Rajah', hat: 'chef' },
  { breed: 'maine_coon', name: 'Captain Acorn', hat: 'shades' },
];

const SCOOP_FLAVORS = [
  { name: 'Strawberry', fill: '#fb7185', rim: '#be123c', chips: '#ffe4e6' },
  { name: 'Mint Chip', fill: '#34d399', rim: '#047857', chips: '#064e3b' },
  { name: 'Mango Swirl', fill: '#fbbf24', rim: '#b45309', chips: '#fef3c7' },
  { name: 'Blueberry', fill: '#60a5fa', rim: '#1d4ed8', chips: '#dbeafe' },
  { name: 'Ube Vanilla', fill: '#c084fc', rim: '#6d28d9', chips: '#f3e8ff' },
];

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

    this.conesServed = 0;
    this.roundTreatsEarned = 0;
    this.frostyConesCount = 0;
    this.mistakesThisRound = 0;
    this.starsEarned = 0;

    this.customer = BEACH_CUSTOMERS[0];
    this.puzzle = null;
    this.disabledDirs = [];
    this.highlightDir = null;
    this.orderTimer = 0;
    this.impatientBarkPlayed = false;

    // Phases: 'asking' -> 'scoop_land' -> 'cone_slide' -> 'summary'
    this.phase = 'asking';
    this.animTimer = 0;
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

    this.conesServed = 0;
    this.roundTreatsEarned = 0;
    this.frostyConesCount = 0;
    this.mistakesThisRound = 0;
    this.starsEarned = 0;

    this._spawnNextConeOrder();
  }

  /**
   * Generates a Missing-Scoop / Fact-Family Bridging-10 puzzle:
   * Given baseScoop (e.g. 7) and targetTotal (e.g. 15), find missingScoop (8)
   * such that baseScoop + missingScoop = targetTotal (teaching 7 + ? = 15 and 15 - 7 = 8).
   */
  _generateConePuzzle(orderIndex) {
    const fact = MathEngine.generateSingleFact(2);
    let baseScoop = 7;
    let missingScoop = 8;
    let targetTotal = 15;

    if (fact.op === '+') {
      baseScoop = fact.a;
      missingScoop = fact.b;
      targetTotal = fact.answer;
    } else {
      // Subtraction fact e.g. 15 - 8 = 7 -> baseScoop = 8, missingScoop = 7, targetTotal = 15
      targetTotal = fact.a;
      baseScoop = fact.b;
      missingScoop = fact.answer;
    }

    // Ensure bridging-10 or rich 2nd-grade numbers
    if (targetTotal < 11) {
      baseScoop = 6 + (orderIndex % 4);
      missingScoop = 5 + ((orderIndex * 2 + 1) % 5);
      targetTotal = baseScoop + missingScoop;
    }

    const choices = MathEngine.generateDiamondChoices(missingScoop, 2, 12);
    const toTen = Math.max(0, 10 - baseScoop);
    const pastTen = Math.max(0, targetTotal - 10);

    return {
      baseScoop,
      missingScoop,
      targetTotal,
      toTen,
      pastTen,
      choices,
      factKey: `${baseScoop}+${missingScoop}`,
      bottomFlavor: SCOOP_FLAVORS[orderIndex % SCOOP_FLAVORS.length],
      topFlavor: SCOOP_FLAVORS[(orderIndex + 2) % SCOOP_FLAVORS.length],
      promptVariant: orderIndex % 2 === 0 ? 'missing_addend' : 'fact_family',
    };
  }

  _spawnNextConeOrder() {
    this.puzzle = this._generateConePuzzle(this.conesServed);
    const pool = GameState.theme === 'cat' ? BEACH_CAT_CUSTOMERS : BEACH_CUSTOMERS;
    this.customer = pool[this.conesServed % pool.length];
    this.disabledDirs = [];
    this.highlightDir = null;
    this.orderTimer = 0;
    this.impatientBarkPlayed = false;
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
      for (const dir of ['top', 'left', 'bottom', 'right']) {
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

      const hasMistake = this.disabledDirs.length > 0;
      if (hasMistake || this.orderTimer >= COOL_SCOOP_WINDOW) {
        this.dogMood = 'impatient';
        if (!this.impatientBarkPlayed) {
          this.impatientBarkPlayed = true;
          SoundFX?.bark?.(0.95);
        }
      } else if (this.orderTimer <= FAST_FROSTY_WINDOW) {
        this.dogMood = 'excited';
      } else {
        this.dogMood = 'waiting';
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

    if (this.phase === 'scoop_land') {
      this.animTimer += safeDt;
      // Pause for 650ms with the completed 2-scoop cone highlighted so the equation sinks in
      if (this.animTimer >= 0.65) {
        this.phase = 'cone_slide';
        this.animTimer = 0;
        SoundFX?.treatToss?.();
      }
      return;
    }

    if (this.phase === 'cone_slide') {
      this.animTimer += safeDt;
      if (this.animTimer >= 0.35 && this.dogMood !== 'zoomies' && this.dogMood !== 'munching') {
        if (this.lastReward >= 3) {
          this.dogMood = 'zoomies';
          SoundFX?.zoomies?.();
          this.particles.emitHearts(148, 220, 10);
          this.particles.emitStars(148, 220, 18);
          this.particles.addFloatingText(
            152,
            165,
            'FROSTY FAST! +3 BONES! 🍦',
            '#0284c7',
            1.15
          );
        } else {
          this.dogMood = 'munching';
          SoundFX?.munch?.();
          this.particles.emitStars(148, 225, 10);
          this.particles.addFloatingText(
            152,
            165,
            `YUM! +${this.lastReward} BONE${this.lastReward > 1 ? 'S' : ''}! 🍦`,
            '#16a34a',
            1.1
          );
        }
      }

      if (this.animTimer > 0.35 && this.lastReward >= 3) {
        this.dogFlipProgress = Math.min(1, (this.animTimer - 0.35) / 0.7);
      }

      if (this.animTimer >= 1.25) {
        this.conesServed += 1;
        if (this.conesServed >= TOTAL_CONES_PER_ROUND) {
          this._finishRound();
        } else {
          this._spawnNextConeOrder();
        }
      }
    }
  }

  _handleAnswer(dir) {
    if (!this.puzzle || this.disabledDirs.includes(dir)) return;

    const picked = this.puzzle.choices[dir];
    const elapsedMs = Math.round(this.orderTimer * 1000);

    if (picked === this.puzzle.missingScoop) {
      const firstTry = this.disabledDirs.length === 0;
      GameState.recordFactResult(this.puzzle.factKey, firstTry, elapsedMs);
      this.highlightDir = dir;

      if (firstTry && this.orderTimer <= FAST_FROSTY_WINDOW) {
        this.lastReward = 3;
        this.frostyConesCount += 1;
      } else if (firstTry && this.orderTimer <= COOL_SCOOP_WINDOW) {
        this.lastReward = 2;
      } else {
        this.lastReward = 1;
      }

      this.roundTreatsEarned += this.lastReward;
      GameState.addTreats(this.lastReward);

      SoundFX?.correct?.();
      this.particles.emitStars(455, 210, 16);
      this.phase = 'scoop_land';
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

    this._drawBoardwalkBackground(ctx, w, h);
    this._drawTopHud(ctx, w);
    this._drawPromptBanner(ctx, w);
    this._drawBeachDogCustomer(ctx);
    this._drawGelatoConeBuilder(ctx);
    this._drawBridgeThroughTenHelper(ctx);
    this._drawBottomDiamondArea(ctx, w, h);

    this.particles.draw(ctx);

    if (this.phase === 'summary') {
      this._drawSummaryModal(ctx, w, h);
    }
  }

  _drawBoardwalkBackground(ctx, w, h) {
    // Sunny sky & turquoise ocean waves
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 250);
    skyGrad.addColorStop(0, '#bae6fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, 250);

    // Sparkling ocean strip
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(0, 235, w, 65);

    // Animated whitecap wave crests
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    for (let x = 20; x < w; x += 95) {
      const waveX = x + Math.sin(this.time * 2.5 + x) * 10;
      ctx.beginPath();
      ctx.arc(waveX, 258, 18, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }

    // Sandy beach & wooden boardwalk planks
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(0, 295, w, 65);

    // Gelato counter bar
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 358, w, 12);

    const counterGrad = ctx.createLinearGradient(0, 370, 0, h);
    counterGrad.addColorStop(0, '#f0f9ff');
    counterGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = counterGrad;
    ctx.fillRect(0, 370, w, h - 370);
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

    // Boardwalk Header & 8 Cone Progress Dots
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 225, 8, 450, 40, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0e7490';
    ctx.font = 'bold 17px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `🍦 Boardwalk Gelato Stand — Cone ${Math.min(this.conesServed + 1, TOTAL_CONES_PER_ROUND)} of ${TOTAL_CONES_PER_ROUND}`,
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
    const solved = this.phase === 'scoop_land' || this.phase === 'cone_slide';

    let text = '';
    let border = '#06b6d4';
    let bg = '#ecfeff';

    if (solved) {
      text = `✨ Cone Complete! ${p.baseScoop} + ${p.missingScoop} = ${p.targetTotal} (and ${p.targetTotal} - ${p.baseScoop} = ${p.missingScoop}!) ✨`;
      border = '#10b981';
      bg = '#ecfdf5';
    } else if (p.promptVariant === 'missing_addend') {
      text = `Build a ${p.targetTotal}-Point Cone! You have a ${p.baseScoop} scoop — what scoop makes ${p.targetTotal}? (${p.baseScoop} + ? = ${p.targetTotal})`;
    } else {
      text = `Fact-Family Cone! Target is ${p.targetTotal} and bottom scoop is ${p.baseScoop}: ${p.targetTotal} - ${p.baseScoop} = ?`;
    }

    ctx.save();
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(24, 54, w - 48, 42, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17.5px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, 75);
    ctx.restore();
  }

  _drawBeachDogCustomer(ctx) {
    if (!this.customer || !this.puzzle) return;

    const dogX = 148;
    const dogY = 292;
    const solved = this.phase === 'scoop_land' || this.phase === 'cone_slide';
    const hasMistake = this.disabledDirs.length > 0;
    const isMelting = !solved && (hasMistake || this.orderTimer >= COOL_SCOOP_WINDOW);
    const isFrosty = !solved && !isMelting && this.orderTimer <= FAST_FROSTY_WINDOW;

    // Surfboard behind the beach pup
    ctx.save();
    ctx.translate(dogX - 38, dogY - 12);
    ctx.rotate(-0.22);
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-5, -46, 10, 92);
    ctx.restore();

    Sprites.drawDog(ctx, dogX, dogY, {
      breed: this.customer.breed,
      hat: this.customer.hat,
      scale: 1.02,
      mood: this.dogMood,
      wagSpeed: solved ? 3.2 : isFrosty ? 2.6 : isMelting ? 0.4 : 1.3,
      facing: 'right',
      flipProgress: this.dogFlipProgress,
      time: this.time,
    });

    if (isMelting && this.phase === 'asking') {
      const shakeX = Math.sin(this.time * 20) * 2.5;
      ctx.save();
      ctx.fillStyle = '#fff7ed';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(20 + shakeX, 330, 254, 25, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c2410c';
      ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💧 "Hurry! The gelato is melting in the sun!"', 147 + shakeX, 343);
      ctx.restore();
    }

    // Order Speech Bubble with Frosty Melt Meter
    Sprites.drawSpeechBubble(ctx, 18, 102, 260, 82, {
      tailX: dogX - 24,
      tailY: dogY - 86,
      bgColor: '#ffffff',
      borderColor: isMelting ? '#ea580c' : '#06b6d4',
    });

    ctx.save();
    ctx.fillStyle = '#0e7490';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.customer.name}'s Target Cone:`, 148, 118);

    ctx.fillStyle = solved ? '#059669' : '#0f172a';
    ctx.font = '900 22px "Comic Sans MS", sans-serif';
    ctx.fillText(
      solved
        ? `${this.puzzle.baseScoop} + ${this.puzzle.missingScoop} = ${this.puzzle.targetTotal}!`
        : `${this.puzzle.baseScoop} + [ ? ] = ${this.puzzle.targetTotal}`,
      148,
      141
    );

    // Frosty Speed Meter Bar inside bubble
    const barX = 30;
    const barY = 154;
    const barW = 236;
    const barH = 22;

    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 8);
    ctx.fill();
    ctx.stroke();

    let fillFrac = 1;
    let barColor = '#38bdf8';
    let barLabel = '★ FROSTY FAST: +3 BONES!';

    if (solved) {
      fillFrac = 1;
      barColor = '#10b981';
      barLabel = `★ SERVED! +${this.lastReward} BONES!`;
    } else if (isMelting) {
      fillFrac = 0.24;
      barColor = '#f97316';
      barLabel = '! MELTING CONE (+1 Bone)';
    } else if (this.orderTimer <= FAST_FROSTY_WINDOW) {
      fillFrac = 0.5 + 0.5 * (1 - this.orderTimer / FAST_FROSTY_WINDOW);
      barColor = '#22c55e';
      barLabel = '★ FROSTY FAST: +3 BONES!';
    } else {
      const prog = Math.min(
        1,
        (this.orderTimer - FAST_FROSTY_WINDOW) / (COOL_SCOOP_WINDOW - FAST_FROSTY_WINDOW)
      );
      fillFrac = 0.5 - 0.26 * prog;
      barColor = '#38bdf8';
      barLabel = '★ COOL SCOOP: +2 BONES';
    }

    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, Math.max(14, (barW - 4) * fillFrac), barH - 4, 6);
    ctx.fillStyle = barColor;
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(barLabel, barX + barW / 2, barY + barH / 2 + 0.5);
    ctx.restore();
  }

  /**
   * Draws the Double-Scoop Gelato Cone in the center:
   * - Waffle cone at bottom
   * - Bottom Scoop = baseScoop (known number)
   * - Top Scoop = '?' while asking, or missingScoop once solved
   * - Target Pennant Banner at the top showing the total sum (targetTotal)
   */
  _drawGelatoConeBuilder(ctx) {
    if (!this.puzzle) return;
    const p = this.puzzle;
    const solved = this.phase === 'scoop_land' || this.phase === 'cone_slide';

    const cardX = 292;
    const cardY = 104;
    const cardW = 372;
    const cardH = 248;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = solved ? '#10b981' : '#06b6d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 22);
    ctx.fill();
    ctx.stroke();

    // Target Total Banner at top of card
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX + 24, cardY + 12, cardW - 48, 38, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = '900 19px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🎯 TARGET CONE TOTAL = ${p.targetTotal}`, cardX + cardW / 2, cardY + 31);

    // Slide offset when delivering cone to the dog
    let slideX = 0;
    let slideY = 0;
    if (this.phase === 'cone_slide') {
      const t = Math.min(1, this.animTimer / 0.45);
      slideX = -255 * t;
      slideY = -Math.sin(t * Math.PI) * 35;
    }

    const coneX = cardX + 112 + slideX;
    const coneBaseY = cardY + 234 + slideY;

    // 1. Crispy Waffle Cone
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(coneX - 36, coneBaseY - 62);
    ctx.lineTo(coneX + 36, coneBaseY - 62);
    ctx.lineTo(coneX, coneBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Waffle criss-cross lines
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(coneX - 24, coneBaseY - 60);
    ctx.lineTo(coneX + 8, coneBaseY - 18);
    ctx.moveTo(coneX + 24, coneBaseY - 60);
    ctx.lineTo(coneX - 8, coneBaseY - 18);
    ctx.stroke();

    // 2. Bottom Scoop (Known number: baseScoop)
    this._drawGelatoScoop(
      ctx,
      coneX,
      coneBaseY - 82,
      40,
      p.bottomFlavor,
      String(p.baseScoop),
      false
    );

    // 3. Top Scoop (Mystery '?' or solved missingScoop)
    if (solved) {
      const popScale =
        this.phase === 'scoop_land'
          ? 1 + Math.sin(Math.min(1, this.animTimer / 0.3) * Math.PI) * 0.16
          : 1;
      ctx.save();
      ctx.translate(coneX, coneBaseY - 134);
      ctx.scale(popScale, popScale);
      this._drawGelatoScoop(
        ctx,
        0,
        0,
        40,
        p.topFlavor,
        `+${p.missingScoop}`,
        false
      );
      // Cherry on top!
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -38, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Glowing dotted Mystery Scoop slot
      const pulse = 1 + Math.sin(this.time * 6) * 0.04;
      ctx.save();
      ctx.translate(coneX, coneBaseY - 134);
      ctx.scale(pulse, pulse);
      this._drawGelatoScoop(ctx, 0, 0, 40, p.topFlavor, '+ ?', true);
      ctx.restore();
    }

    // 4. Right side of Center Card: Vertical Number-Bond Equation Box
    const eqX = cardX + 258;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(eqX - 78, cardY + 62, 156, 170, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scoop Math:', eqX, cardY + 80);

    // Top scoop box
    ctx.fillStyle = solved ? '#dcfce7' : '#fef9c3';
    ctx.strokeStyle = solved ? '#16a34a' : '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(eqX - 52, cardY + 92, 104, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = solved ? '#15803d' : '#b45309';
    ctx.font = '900 24px "Comic Sans MS", sans-serif';
    ctx.fillText(solved ? `+ ${p.missingScoop}` : '+ ?', eqX, cardY + 113);

    // Bottom scoop label
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px "Comic Sans MS", sans-serif';
    ctx.fillText(`${p.baseScoop}`, eqX, cardY + 155);

    // Divider line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(eqX - 54, cardY + 174);
    ctx.lineTo(eqX + 54, cardY + 174);
    ctx.stroke();

    // Total
    ctx.fillStyle = '#059669';
    ctx.font = '900 28px "Comic Sans MS", sans-serif';
    ctx.fillText(`= ${p.targetTotal}`, eqX, cardY + 204);

    ctx.restore();
  }

  _drawGelatoScoop(ctx, x, y, r, flavor, label, isMystery) {
    ctx.save();
    ctx.translate(x, y);

    if (isMystery) {
      ctx.fillStyle = '#fffbeb';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 5]);
    } else {
      ctx.fillStyle = flavor.fill;
      ctx.strokeStyle = flavor.rim;
      ctx.lineWidth = 3.5;
    }

    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 0.95, Math.PI * 2.05);
    ctx.arc(24, 10, 14, -0.3, Math.PI * 0.9);
    ctx.arc(0, 12, 15, 0, Math.PI);
    ctx.arc(-24, 10, 14, Math.PI * 0.1, Math.PI * 1.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isMystery ? '#d97706' : '#0f172a';
    ctx.font = '900 26px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -2);
    ctx.restore();
  }

  /**
   * Right-hand visual helper: "Bridge Through 10!"
   * Shows how to find `baseScoop + ? = targetTotal` by hopping from `baseScoop` to `10`,
   * then from `10` to `targetTotal`!
   */
  _drawBridgeThroughTenHelper(ctx) {
    if (!this.puzzle) return;
    const p = this.puzzle;
    const solved = this.phase === 'scoop_land' || this.phase === 'cone_slide';

    const panelX = 680;
    const panelY = 104;
    const panelW = 260;
    const panelH = 248;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐚 Bridge Through 10 Trick!', panelX + panelW / 2, panelY + 24);

    // Visual number line hop: baseScoop -> 10 -> targetTotal
    const lineY = panelY + 112;
    const leftX = panelX + 38;
    const midX = panelX + 130;
    const rightX = panelX + 222;

    // Base number line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftX, lineY);
    ctx.lineTo(rightX, lineY);
    ctx.stroke();

    // Hop 1 arc: baseScoop -> 10 (+toTen)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, lineY - 12);
    ctx.quadraticCurveTo((leftX + midX) / 2, lineY - 58, midX, lineY - 12);
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.fillText(`+${p.toTen}`, (leftX + midX) / 2, lineY - 42);

    // Hop 2 arc: 10 -> targetTotal (+pastTen)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(midX, lineY - 12);
    ctx.quadraticCurveTo((midX + rightX) / 2, lineY - 58, rightX, lineY - 12);
    ctx.stroke();

    ctx.fillStyle = '#be185d';
    ctx.fillText(`+${p.pastTen}`, (midX + rightX) / 2, lineY - 42);

    // 3 Milestone circles (baseScoop, 10, targetTotal)
    const stops = [
      { x: leftX, label: String(p.baseScoop), bg: '#e0f2fe', border: '#0284c7' },
      { x: midX, label: '10', bg: '#fef08a', border: '#d97706' },
      { x: rightX, label: String(p.targetTotal), bg: '#dcfce7', border: '#16a34a' },
    ];
    for (const s of stops) {
      ctx.fillStyle = s.bg;
      ctx.strokeStyle = s.border;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, lineY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 17px "Comic Sans MS", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, s.x, lineY + 1);
    }

    // Explanation box underneath
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX + 16, panelY + 150, panelW - 32, 82, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13.5px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `1) ${p.baseScoop} + ${p.toTen} makes 10`,
      panelX + panelW / 2,
      panelY + 170
    );
    ctx.fillText(
      `2) 10 + ${p.pastTen} makes ${p.targetTotal}`,
      panelX + panelW / 2,
      panelY + 192
    );

    ctx.fillStyle = solved ? '#15803d' : '#0369a1';
    ctx.font = '900 16px "Comic Sans MS", sans-serif';
    ctx.fillText(
      solved
        ? `Total Hop: ${p.toTen} + ${p.pastTen} = ${p.missingScoop}!`
        : `So Missing Scoop = ${p.toTen} + ${p.pastTen}!`,
      panelX + panelW / 2,
      panelY + 216
    );

    ctx.restore();
  }

  _drawBottomDiamondArea(ctx, w, h) {
    this._drawFrostyScoreCard(ctx);

    if (!this.puzzle) return;
    const centerX = w / 2;
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
        radiusX: 145,
        radiusY: 68,
        buttonWidth: 136,
        buttonHeight: 66,
      }
    );

    if (this.phase === 'asking' && this.diamondBounds) {
      for (const dir of ['top', 'left', 'bottom', 'right']) {
        const b = this.diamondBounds[dir];
        if (b && !this.disabledDirs.includes(dir)) {
          InputManager.registerClickZone(dir, b.x, b.y, b.w, b.h);
        }
      }
    }
  }

  _drawFrostyScoreCard(ctx) {
    const cardX = 18;
    const cardY = 382;
    const cardW = 232;
    const cardH = 192;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0e7490';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍦 Frosty Speed Bonus', cardX + cardW / 2, cardY + 24);

    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#15803d';
    ctx.fillText('★ Frosty (<3.8s): +3 Bones', cardX + 16, cardY + 58);
    ctx.fillStyle = '#0369a1';
    ctx.fillText('★ Cool Scoop (<7.5s): +2 Bones', cardX + 16, cardY + 84);
    ctx.fillStyle = '#64748b';
    ctx.fillText('💧 Melted Cone: +1 Bone', cardX + 16, cardY + 110);

    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX + 14, cardY + 132, cardW - 28, 44, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#854d0e';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Frosty Cones: ${this.frostyConesCount} / ${TOTAL_CONES_PER_ROUND}`,
      cardX + cardW / 2,
      cardY + 148
    );
    ctx.fillStyle = '#15803d';
    ctx.font = '900 14px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Round Bones: +${this.roundTreatsEarned}`,
      cardX + cardW / 2,
      cardY + 166
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
    ctx.fillText('🍦 Boardwalk Gelato Pro! 🍦', w / 2, cardY + 50);

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
      `All ${TOTAL_CONES_PER_ROUND} Target Gelato Cones Served!`,
      w / 2,
      cardY + 168
    );
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 19px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Frosty Fast Cones: ${this.frostyConesCount} of ${TOTAL_CONES_PER_ROUND}`,
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
    ctx.fillText('🔄 Scoop More', playBtn.x + playBtn.w / 2, playBtn.y + 34);

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
