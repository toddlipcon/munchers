import { GameState } from '../state.js';
import { MathEngine } from '../math.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';

const TOTAL_ORDERS_PER_ROUND = 5;
const BIG_DOG_POOL = [
  { breed: 'dane', name: 'Chef Atlas', hat: 'chef' },
  { breed: 'husky', name: 'King Koda', hat: 'crown' },
  { breed: 'dalmatian', name: 'Captain Pongo', hat: 'chef' },
  { breed: 'poodle', name: 'Duchess Gigi', hat: 'crown' },
  { breed: 'golden', name: 'Wizard Biscuit', hat: 'wizard' },
];

const BIG_CAT_POOL = [
  { breed: 'maine_coon', name: 'Chef Acorn', hat: 'chef' },
  { breed: 'norwegian_forest', name: 'Queen Freya', hat: 'crown' },
  { breed: 'siamese', name: 'Captain Suki', hat: 'chef' },
  { breed: 'persian', name: 'Duchess Tiramisu', hat: 'crown' },
  { breed: 'orange_tabby', name: 'Wizard Marmalade', hat: 'wizard' },
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

export class BigDogBakeryScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.game = null;
    this.difficulty = 1;
    this.locationId = 'cafe_bakery';
    this.onExit = null;

    this._parseConstructorArgs(arg1, arg2);

    this.particles = new ParticleSystem();
    this.time = 0;
    this.canvasW = 960;
    this.canvasH = 600;
    this.diamondBounds = null;

    this.ordersCompleted = 0;
    this.roundTreatsEarned = 0;
    this.mistakesThisRound = 0;
    this.starsEarned = 0;
    this.fastCakesThisRound = 0;

    this.currentCustomer = BIG_DOG_POOL[0];
    this.problem = null;
    this.currentStepIndex = 0;
    this.disabledDirs = [];
    this.highlightDir = null;
    this.stepStartTime = 0;
    this.orderSpeedBonus = 0;
    this.lastCakeTotalReward = 5;
    this.dogGotImpatientThisOrder = false;
    this.impatientBarkPlayed = false;

    // Visual board state
    this.solvedOnesDigit = null;
    this.solvedTensDigit = null;
    this.carriedTenVisible = false;
    this.borrowApplied = false;

    // Animation state:
    // 'asking' -> 'carry_anim' | 'borrow_anim' | 'cake_launch' -> 'summary'
    this.phase = 'asking';
    this.animTimer = 0;
    this.carryEquationBanner = '';
    this.flyingCake = null;
    this.dogFlipProgress = 0;
    this.dogMood = 'happy';

    this.startNewRound();
  }

  _parseConstructorArgs(arg1, arg2) {
    if (typeof arg1 === 'function') {
      this.onExit = arg1;
      if (arg2 && typeof arg2 === 'object') this._applyOptions(arg2);
      return;
    }
    if (typeof arg1 === 'number') {
      this.difficulty = arg1;
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
          this.difficulty = arg2;
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
    if (typeof opts.difficulty === 'number') this.difficulty = opts.difficulty;
    if (typeof opts.tier === 'number' && !opts.difficulty) this.difficulty = opts.tier;
    const locId = opts.locationId || opts.id;
    if (typeof locId === 'string') this.locationId = locId;
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

    this.ordersCompleted = 0;
    this.roundTreatsEarned = 0;
    this.mistakesThisRound = 0;
    this.starsEarned = 0;
    this.fastCakesThisRound = 0;

    this._spawnNextOrder();
  }

  _spawnNextOrder() {
    // Include subtraction/borrowing in later orders so players practice both carrying & borrowing
    const orderDiff = this.ordersCompleted >= 3 ? Math.max(this.difficulty, 2) : this.difficulty;
    this.problem = MathEngine.generateMultiDigitProblem(orderDiff);
    const pool = GameState.theme === 'cat' ? BIG_CAT_POOL : BIG_DOG_POOL;
    this.currentCustomer = pool[this.ordersCompleted % pool.length];
    this.currentStepIndex = 0;
    this.disabledDirs = [];
    this.highlightDir = null;
    this.stepStartTime = 0;
    this.orderSpeedBonus = 0;
    this.lastCakeTotalReward = 5;
    this.dogGotImpatientThisOrder = false;
    this.impatientBarkPlayed = false;

    this.solvedOnesDigit = null;
    this.solvedTensDigit = null;
    this.carriedTenVisible = false;
    this.borrowApplied = false;
    this.carryEquationBanner = '';
    this.flyingCake = null;
    this.dogFlipProgress = 0;
    this.dogMood = 'excited';
    this.phase = 'asking';
    this.animTimer = 0;

    SoundFX?.bigBark?.();
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
    if (x >= 16 && x <= 172 && y >= 8 && y <= 50) {
      this._returnToMap();
      return true;
    }
    if (this.phase === 'asking' && this.diamondBounds) {
      for (const dir of ['top', 'left', 'bottom', 'right']) {
        const b = this.diamondBounds[dir];
        if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this._handleStepAnswer(dir);
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
        SoundFX?.bigBark?.();
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

    if (this.phase === 'asking') {
      this.stepStartTime += safeDt;

      // Update dog's live mood based on how fast the player is answering this step
      const stepMistake = this.disabledDirs.length > 0;
      if (stepMistake || this.stepStartTime >= 7.0) {
        this.dogMood = 'impatient';
        this.dogGotImpatientThisOrder = true;
        if (!this.impatientBarkPlayed) {
          this.impatientBarkPlayed = true;
          SoundFX?.bark?.();
        }
      } else if (this.stepStartTime <= 3.5) {
        this.dogMood = 'excited';
      } else {
        this.dogMood = 'waiting';
      }

      if (InputManager.justPressed('top')) {
        this._handleStepAnswer('top');
      } else if (InputManager.justPressed('left')) {
        this._handleStepAnswer('left');
      } else if (InputManager.justPressed('bottom')) {
        this._handleStepAnswer('bottom');
      } else if (InputManager.justPressed('right')) {
        this._handleStepAnswer('right');
      }
      return;
    }

    if (this.phase === 'carry_anim') {
      this.animTimer += safeDt;
      if (this.animTimer >= 1.2) {
        this.carriedTenVisible = true;
        this._advanceToNextStep();
      }
      return;
    }

    if (this.phase === 'borrow_anim') {
      this.animTimer += safeDt;
      if (this.animTimer >= 1.05) {
        this.borrowApplied = true;
        this._advanceToNextStep();
      }
      return;
    }

    if (this.phase === 'result_highlight') {
      this.animTimer += safeDt;
      // Pause for ~700ms with the completed 2-digit answer highlighted so it sinks in
      if (this.animTimer >= 0.7) {
        this.flyingCake = {
          startX: 485,
          startY: 300,
          targetX: 155,
          targetY: 235,
          x: 485,
          y: 300,
          landed: false,
        };
        this.phase = 'cake_launch';
        this.animTimer = 0;
      }
      return;
    }

    if (this.phase === 'cake_launch') {
      this.animTimer += safeDt;
      const cakeFlightDur = 0.55;
      if (this.flyingCake) {
        const t = Math.min(1, this.animTimer / cakeFlightDur);
        this.flyingCake.x =
          this.flyingCake.startX + (this.flyingCake.targetX - this.flyingCake.startX) * t;
        this.flyingCake.y =
          this.flyingCake.startY +
          (this.flyingCake.targetY - this.flyingCake.startY) * t -
          Math.sin(t * Math.PI) * 95;
        if (t >= 1 && !this.flyingCake.landed) {
          this.flyingCake.landed = true;
          const superHappy = !this.dogGotImpatientThisOrder && this.orderSpeedBonus >= 2;
          this.dogMood = superHappy ? 'zoomies' : 'munching';
          SoundFX?.bigBark?.();
          if (superHappy) {
            SoundFX?.zoomies?.();
            this.particles.emitStars(150, 230, 24);
            this.particles.emitHearts(150, 215, 14);
            this.particles.addFloatingText(
              155,
              152,
              `SUPER HAPPY! +${this.lastCakeTotalReward} BONES! 🎂`,
              '#16a34a',
              1.2
            );
          } else {
            SoundFX?.munch?.();
            this.particles.emitStars(150, 230, 12);
            const label =
              this.orderSpeedBonus > 0
                ? `HAPPY PUP! +${this.lastCakeTotalReward} BONES! 🎂`
                : `WHEW, FINALLY! +${this.lastCakeTotalReward} BONES`;
            this.particles.addFloatingText(155, 152, label, '#eab308', 1.15);
          }
        }
      }

      if (this.animTimer > cakeFlightDur) {
        const canFlip = !this.dogGotImpatientThisOrder && this.orderSpeedBonus >= 2;
        this.dogFlipProgress = canFlip
          ? Math.min(1, (this.animTimer - cakeFlightDur) / 0.75)
          : 0;
      }

      if (this.animTimer >= 1.55) {
        this.ordersCompleted += 1;
        if (this.ordersCompleted >= TOTAL_ORDERS_PER_ROUND) {
          this._finishRound();
        } else {
          this._spawnNextOrder();
        }
      }
    }
  }

  _handleStepAnswer(dir) {
    const step = this.problem?.steps?.[this.currentStepIndex];
    if (!step || this.disabledDirs.includes(dir)) return;

    const pickedValue = step.choices[dir];
    const elapsedMs = Math.round(this.stepStartTime * 1000);

    if (pickedValue === step.correctValue) {
      GameState.recordFactResult(step.factKey, true, elapsedMs);
      this.highlightDir = dir;

      // Calculate Speed Bonus for answering this step before the dog gets impatient
      let stepBonus = 0;
      if (this.disabledDirs.length === 0) {
        if (this.stepStartTime <= 3.5) {
          stepBonus = 2;
        } else if (this.stepStartTime <= 7.0) {
          stepBonus = 1;
        }
      }

      if (stepBonus > 0) {
        this.orderSpeedBonus += stepBonus;
        this.roundTreatsEarned += stepBonus;
        GameState.addTreats(stepBonus);
        this.dogMood = 'excited';
      } else {
        this.dogMood = 'happy';
      }

      if (step.column === 'borrow') {
        SoundFX?.carryChime?.();
        if (stepBonus > 0) {
          SoundFX?.bark?.();
          this.particles.emitHearts(148, 225, 6);
          this.particles.addFloatingText(
            148,
            195,
            stepBonus === 2 ? 'FAST STEP! +2 BONES!' : 'NICE STEP! +1 BONE!',
            '#16a34a',
            0.95
          );
        }
        this.phase = 'borrow_anim';
        this.animTimer = 0;
        this.particles.emitStars(565, 195, 12);
        return;
      }

      if (step.column === 'ones') {
        this.solvedOnesDigit = step.onesDigit;
        if (stepBonus > 0) {
          SoundFX?.bark?.();
          this.particles.emitHearts(148, 225, 7);
          this.particles.addFloatingText(
            148,
            195,
            stepBonus === 2 ? 'FAST ONES! +2 BONES!' : 'NICE ONES! +1 BONE!',
            '#16a34a',
            0.95
          );
        }
        if (step.carryTen === 1) {
          SoundFX?.carryChime?.();
          this.carryEquationBanner = `${step.correctValue} = 1 Ten + ${step.onesDigit} Ones!`;
          this.phase = 'carry_anim';
          this.animTimer = 0;
          this.particles.emitStars(575, 290, 14);
        } else {
          SoundFX?.correct?.();
          this.particles.emitStars(575, 315, 10);
          this._advanceToNextStep();
        }
        return;
      }

      if (step.column === 'tens') {
        this.solvedTensDigit = step.correctValue;
        SoundFX?.correct?.();
        const baseCakeReward = 5;
        this.roundTreatsEarned += baseCakeReward;
        GameState.addTreats(baseCakeReward);
        this.lastCakeTotalReward = baseCakeReward + this.orderSpeedBonus;
        if (!this.dogGotImpatientThisOrder && this.orderSpeedBonus >= 2) {
          this.fastCakesThisRound += 1;
        }

        if (stepBonus > 0) {
          this.particles.emitHearts(148, 225, 8);
          this.particles.addFloatingText(
            148,
            195,
            stepBonus === 2 ? 'FAST TENS! +2 BONES!' : 'NICE TENS! +1 BONE!',
            '#16a34a',
            0.85
          );
        }

        this.particles.emitStars(485, 310, 18);
        this.phase = 'result_highlight';
        this.animTimer = 0;
      }
    } else {
      // Gentle feedback on wrong choice — dog immediately looks impatient for this step
      this.disabledDirs.push(dir);
      this.mistakesThisRound += 1;
      this.dogMood = 'impatient';
      this.dogGotImpatientThisOrder = true;
      GameState.recordFactResult(step.factKey, false, elapsedMs);
      SoundFX?.oops?.();
    }
  }

  _advanceToNextStep() {
    this.currentStepIndex += 1;
    this.disabledDirs = [];
    this.highlightDir = null;
    this.stepStartTime = 0;
    this.impatientBarkPlayed = false;
    this.dogMood = 'excited';
    this.phase = 'asking';
    this.animTimer = 0;
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

    this._drawBakeryBackground(ctx, w, h);
    this._drawTopHud(ctx, w);
    this._drawPromptBanner(ctx, w);
    this._drawBigDogCustomer(ctx);
    this._drawPlaceValueBoard(ctx);
    this._drawBoneBundleVisuals(ctx);
    this._drawBottomDiamondArea(ctx, w, h);

    if (this.flyingCake && !this.flyingCake.landed) {
      this._drawDoubleDeckerCake(
        ctx,
        this.flyingCake.x,
        this.flyingCake.y,
        this.problem.answer,
        0.95
      );
    }

    this.particles.draw(ctx);

    if (this.phase === 'summary') {
      this._drawSummaryModal(ctx, w, h);
    }
  }

  _drawBakeryBackground(ctx, w, h) {
    // Cozy bakery wallpaper with warm pastel stripes
    ctx.fillStyle = '#fdf2f8';
    ctx.fillRect(0, 0, w, h);

    const stripeW = 48;
    ctx.fillStyle = '#fce7f3';
    for (let x = 0; x < w; x += stripeW * 2) {
      ctx.fillRect(x, 0, stripeW, 362);
    }

    // Bakery counter & floor below
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 358, w, 12);

    const lowerGrad = ctx.createLinearGradient(0, 370, 0, h);
    lowerGrad.addColorStop(0, '#fffbeb');
    lowerGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = lowerGrad;
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

    // Bakery Header & 5 Cake Order indicators
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 210, 8, 420, 40, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9d174d';
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `🎂 Big Dog Bakery — Order ${Math.min(this.ordersCompleted + 1, TOTAL_ORDERS_PER_ROUND)} of ${TOTAL_ORDERS_PER_ROUND}`,
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
    const step = this.problem?.steps?.[this.currentStepIndex];
    let bannerText = '';
    let borderColor = '#f59e0b';
    let bgColor = '#fffbeb';

    if (this.phase === 'carry_anim') {
      bannerText = `✨ Carry the Ten! ${this.carryEquationBanner} ✨`;
      borderColor = '#eab308';
      bgColor = '#fef9c3';
    } else if (this.phase === 'borrow_anim') {
      bannerText = `✨ Borrow 1 Ten (10 Ones) so the ONES column has ${this.problem.aOnes + 10}! ✨`;
      borderColor = '#ec4899';
      bgColor = '#fdf2f8';
    } else if (this.phase === 'result_highlight' || this.phase === 'cake_launch') {
      bannerText = `✨ ${this.problem.a} ${this.problem.op} ${this.problem.b} = ${this.problem.answer}! (${this.solvedTensDigit} Tens and ${this.solvedOnesDigit} Ones = ${this.problem.answer}) ✨`;
      borderColor = '#10b981';
      bgColor = '#ecfdf5';
    } else if (step) {
      if (step.column === 'ones') {
        const opWord = this.problem.op === '+' ? 'add' : 'subtract';
        bannerText =
          this.currentStepIndex === 0
            ? `Step 1: Always start with the ONES column! What is ${step.subEquation}?`
            : `Step 2: Now ${opWord} the ONES column! What is ${step.subEquation}?`;
        borderColor = '#f97316';
        bgColor = '#fff7ed';
      } else if (step.column === 'borrow') {
        bannerText = `Look at the ONES: ${this.problem.aOnes} is smaller than ${this.problem.bOnes}! Let's borrow 1 Ten from ${this.problem.aTens * 10}! 10 + ${this.problem.aOnes} = ?`;
        borderColor = '#ec4899';
        bgColor = '#fdf2f8';
      } else if (step.column === 'tens') {
        if (this.problem.op === '+' && this.carriedTenVisible) {
          bannerText = `Step 2: Now add the TENS column! (Don't forget the carried 1!) ${step.subEquation} = ?`;
        } else if (this.problem.op === '+') {
          bannerText = `Step 2: Now add the TENS column! What is ${step.subEquation}?`;
        } else {
          bannerText = `Final Step: Now subtract the TENS column! What is ${step.subEquation}?`;
        }
        borderColor = '#3b82f6';
        bgColor = '#eff6ff';
      }
    }

    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(24, 54, w - 48, 44, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bannerText, w / 2, 76);
    ctx.restore();
  }

  _drawBigDogCustomer(ctx) {
    if (!this.currentCustomer || !this.problem) return;

    const dogX = 148;
    const dogY = 292;

    const orderDone = this.phase === 'result_highlight' || this.phase === 'cake_launch';
    const stepMistake = this.disabledDirs.length > 0;
    const isImpatient = !orderDone && (this.dogMood === 'impatient' || stepMistake || this.stepStartTime >= 7.0);
    const isSuperFast = !orderDone && !isImpatient && this.stepStartTime <= 3.5;

    const wagSpeed = orderDone ? 3.2 : isSuperFast ? 2.8 : isImpatient ? 0.35 : 1.2;

    Sprites.drawDog(ctx, dogX, dogY, {
      breed: this.currentCustomer.breed,
      hat: this.currentCustomer.hat,
      scale: 1.02,
      mood: this.dogMood,
      wagSpeed,
      facing: 'right',
      flipProgress: this.dogFlipProgress,
      time: this.time,
    });

    // Impatient visual cues on the dog (comic sweat drops, rumbling lines & callout pill)
    if (isImpatient && this.phase === 'asking') {
      ctx.save();
      const shakeX = Math.sin(this.time * 22) * 2.5;
      // Comic impatience marks near head
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dogX - 54 + shakeX, dogY - 58);
      ctx.lineTo(dogX - 66 + shakeX, dogY - 66);
      ctx.moveTo(dogX - 56 + shakeX, dogY - 46);
      ctx.lineTo(dogX - 70 + shakeX, dogY - 48);
      ctx.stroke();

      // Callout pill at bottom of dog
      ctx.fillStyle = '#fff7ed';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(22 + shakeX, 330, 250, 25, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c2410c';
      ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🐾 "Ruff! My tummy is rumbling! Hurry!"', 147 + shakeX, 343);
      ctx.restore();
    } else if (isSuperFast && this.phase === 'asking') {
      // Happy floating musical/heart aura when answering fast
      ctx.save();
      const bobY = Math.sin(this.time * 6) * 3;
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', dogX - 54, dogY - 46 + bobY);
      ctx.fillStyle = '#eab308';
      ctx.fillText('★', dogX + 54, dogY - 42 - bobY);
      ctx.restore();
    }

    // Customer name, order ticket & live patience/speed bar above the Big Dog
    Sprites.drawSpeechBubble(ctx, 18, 102, 260, 82, {
      tailX: dogX - 28,
      tailY: dogY - 88,
      bgColor: '#ffffff',
      borderColor: isImpatient ? '#ea580c' : '#ec4899',
    });

    ctx.save();
    ctx.fillStyle = '#9d174d';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentCustomer.name}'s Cake Order:`, 148, 118);

    ctx.fillStyle = orderDone ? '#059669' : '#0f172a';
    ctx.font = '900 22px "Comic Sans MS", sans-serif';
    ctx.fillText(
      orderDone
        ? `${this.problem.a} ${this.problem.op} ${this.problem.b} = ${this.problem.answer}!`
        : `${this.problem.a} ${this.problem.op} ${this.problem.b} = ?`,
      148,
      141
    );

    // Live Patience & Speed Bonus Meter inside the order bubble
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
    let barColor = '#22c55e';
    let barLabel = '★ FAST BONUS: +2 BONES!';

    if (orderDone) {
      fillFrac = 1;
      barColor = '#10b981';
      barLabel = `★ CAKE DONE: +${this.lastCakeTotalReward} BONES!`;
    } else if (this.phase === 'carry_anim' || this.phase === 'borrow_anim') {
      fillFrac = 1;
      barColor = '#eab308';
      barLabel = `★ GREAT STEP! (Bonus +${this.orderSpeedBonus})`;
    } else if (isImpatient) {
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 10);
      fillFrac = 0.22;
      barColor = pulse > 0.5 ? '#ef4444' : '#f97316';
      barLabel = '! IMPATIENT PUP (+0 Bonus)';
    } else if (this.stepStartTime <= 3.5) {
      // Drains from 100% down to 50% during the 3.5s Super Fast window
      fillFrac = 0.5 + 0.5 * (1 - this.stepStartTime / 3.5);
      barColor = '#22c55e';
      barLabel = '★ SUPER HAPPY: +2 BONES!';
    } else {
      // Drains from 50% down to 22% during the 3.5s..7.0s Patient window
      const warmProg = Math.min(1, (this.stepStartTime - 3.5) / 3.5);
      fillFrac = 0.5 - 0.28 * warmProg;
      barColor = '#3b82f6';
      barLabel = '★ PATIENT PUP: +1 BONE';
    }

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, Math.max(14, (barW - 4) * fillFrac), barH - 4, 6);
    ctx.fillStyle = barColor;
    ctx.fill();
    ctx.restore();

    // 50% threshold tick mark showing the +2 Super Fast cutoff
    if (!orderDone && !isImpatient) {
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(barX + barW * 0.5, barY + 2);
      ctx.lineTo(barX + barW * 0.5, barY + barH - 2);
      ctx.stroke();
    }

    ctx.fillStyle = isImpatient && fillFrac < 0.4 ? '#9a3412' : '#0f172a';
    ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(barLabel, barX + barW / 2, barY + barH / 2 + 0.5);

    ctx.restore();
  }

  /**
   * Draws the color-coded Vertical Place-Value Chalkboard / Cake Stand in the center:
   * - TENS Column on the left (Blue header: TENS (10s))
   * - ONES Column on the right (Orange/Gold header: ONES (1s))
   * - Active column highlighted with a glowing golden pulsing frame and bouncing arrow
   * - Carry animation (+1 floating arc from Ones to Tens) and Borrow cross-out animation
   */
  _drawPlaceValueBoard(ctx) {
    if (!this.problem) return;

    const boardX = 292;
    const boardY = 108;
    const boardW = 372;
    const boardH = 244;

    const tensColX = boardX + 56;
    const onesColX = boardX + 206;
    const colW = 132;
    const colY = boardY + 12;
    const colH = boardH - 24;

    const step = this.problem.steps[this.currentStepIndex];
    const activeColumn =
      this.phase === 'result_highlight' || this.phase === 'cake_launch'
        ? 'both'
        : step
        ? step.column === 'borrow'
          ? 'ones'
          : step.column
        : 'ones';

    ctx.save();

    // Board outer frame
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 20);
    ctx.fill();
    ctx.stroke();

    // --- TENS Column Backdrop ---
    const tensDimmed = activeColumn === 'ones' && this.phase === 'asking';
    ctx.save();
    ctx.globalAlpha = tensDimmed ? 0.48 : 1.0;
    ctx.fillStyle = '#eff6ff';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(tensColX, colY, colW, colH, 14);
    ctx.fill();
    ctx.stroke();

    // Blue Header: TENS (10s)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(tensColX, colY, colW, 30, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TENS (10s)', tensColX + colW / 2, colY + 15);
    ctx.restore();

    // --- ONES Column Backdrop ---
    const onesDimmed = activeColumn === 'tens' && this.phase === 'asking';
    ctx.save();
    ctx.globalAlpha = onesDimmed ? 0.55 : 1.0;
    ctx.fillStyle = '#fff7ed';
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(onesColX, colY, colW, colH, 14);
    ctx.fill();
    ctx.stroke();

    // Orange/Gold Header: ONES (1s)
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(onesColX, colY, colW, 30, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ONES (1s)', onesColX + colW / 2, colY + 15);
    ctx.restore();

    // --- Glowing Golden Pulsing Frame & Bouncing Arrow on Active Column ---
    if (activeColumn === 'ones' || activeColumn === 'tens') {
      const targetX = activeColumn === 'tens' ? tensColX : onesColX;
      const pulse = 0.65 + 0.35 * Math.sin(this.time * 7);

      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16 * pulse;
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(targetX - 3, colY - 3, colW + 6, colH + 6, 16);
      ctx.stroke();

      // Bouncing golden pointer arrow at top of active column
      const arrowBounce = Math.sin(this.time * 9) * 4;
      const arrowCx = targetX + colW / 2;
      const arrowCy = colY - 8 + arrowBounce;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrowCx - 10, arrowCy - 10);
      ctx.lineTo(arrowCx + 10, arrowCy - 10);
      ctx.lineTo(arrowCx, arrowCy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // --- Operator Symbol (+ or -) ---
    ctx.fillStyle = '#1e293b';
    ctx.font = '900 38px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.problem.op, boardX + 30, colY + 132);

    // --- Row Y Coordinates ---
    const carryRowY = colY + 50;
    const rowAY = colY + 90;
    const rowBY = colY + 134;
    const lineY = colY + 160;
    const ansRowY = colY + 192;

    const tensCenterX = tensColX + colW / 2;
    const onesCenterX = onesColX + colW / 2;

    // --- Top Number (aTens, aOnes) with Borrow Regrouping Support ---
    ctx.save();
    ctx.globalAlpha = tensDimmed ? 0.48 : 1.0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '900 34px "Comic Sans MS", sans-serif';
    ctx.fillText(String(this.problem.aTens), tensCenterX, rowAY);

    if (this.borrowApplied || this.phase === 'borrow_anim') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(tensCenterX - 16, rowAY + 12);
      ctx.lineTo(tensCenterX + 16, rowAY - 12);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = '900 23px "Comic Sans MS", sans-serif';
      ctx.fillText(String(this.problem.aTens - 1), tensCenterX, carryRowY);
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = onesDimmed ? 0.55 : 1.0;
    ctx.fillStyle = '#9a3412';
    ctx.font = '900 34px "Comic Sans MS", sans-serif';
    ctx.fillText(String(this.problem.aOnes), onesCenterX, rowAY);

    if (this.borrowApplied || this.phase === 'borrow_anim') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(onesCenterX - 16, rowAY + 12);
      ctx.lineTo(onesCenterX + 16, rowAY - 12);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(onesCenterX - 24, carryRowY - 15, 48, 28, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c2410c';
      ctx.font = '900 22px "Comic Sans MS", sans-serif';
      ctx.fillText(String(this.problem.aOnes + 10), onesCenterX, carryRowY);
    }
    ctx.restore();

    // --- Bottom Number (bTens, bOnes) ---
    ctx.save();
    ctx.globalAlpha = tensDimmed ? 0.48 : 1.0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '900 34px "Comic Sans MS", sans-serif';
    ctx.fillText(String(this.problem.bTens), tensCenterX, rowBY);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = onesDimmed ? 0.55 : 1.0;
    ctx.fillStyle = '#9a3412';
    ctx.font = '900 34px "Comic Sans MS", sans-serif';
    ctx.fillText(String(this.problem.bOnes), onesCenterX, rowBY);
    ctx.restore();

    // --- Horizontal Equals Bar ---
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(boardX + 16, lineY);
    ctx.lineTo(boardX + boardW - 16, lineY);
    ctx.stroke();

    // --- Answer Boxes (Tens & Ones) ---
    const isHighlightingResult =
      this.phase === 'result_highlight' || this.phase === 'cake_launch';

    if (isHighlightingResult) {
      // Unified glowing golden/emerald highlight around the combined 2-digit answer!
      const pulse = 1 + Math.sin(this.time * 14) * 0.04;
      const boxLeft = tensCenterX - 42;
      const boxRight = onesCenterX + 42;
      const boxW = boxRight - boxLeft;
      const boxH = 52;
      const boxY = ansRowY - boxH / 2;

      ctx.save();
      ctx.translate((tensCenterX + onesCenterX) / 2, ansRowY);
      ctx.scale(pulse, pulse);
      ctx.translate(-(tensCenterX + onesCenterX) / 2, -ansRowY);

      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#fef9c3';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.roundRect(boxLeft, boxY, boxW, boxH, 14);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw combined 2-digit answer badge in the middle gap or highlight each slot
      this._drawAnswerSlot(
        ctx,
        tensCenterX,
        ansRowY,
        this.solvedTensDigit,
        true,
        '#2563eb'
      );
      this._drawAnswerSlot(
        ctx,
        onesCenterX,
        ansRowY,
        this.solvedOnesDigit,
        true,
        '#ea580c'
      );

      // Callout pill below the answer boxes showing the unified 2-digit number
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect((tensCenterX + onesCenterX) / 2 - 58, ansRowY + 20, 116, 26, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `= ${this.problem.answer}!`,
        (tensCenterX + onesCenterX) / 2,
        ansRowY + 33
      );
      ctx.restore();
    } else {
      this._drawAnswerSlot(
        ctx,
        tensCenterX,
        ansRowY,
        this.solvedTensDigit,
        activeColumn === 'tens' && this.phase === 'asking',
        '#2563eb'
      );
      this._drawAnswerSlot(
        ctx,
        onesCenterX,
        ansRowY,
        this.solvedOnesDigit,
        activeColumn === 'ones' && this.phase === 'asking',
        '#ea580c'
      );
    }

    // --- Carried "+1" Badge (either animating along an arc or landed on Tens column) ---
    if (this.phase === 'carry_anim' || this.carriedTenVisible) {
      let badgeX = tensCenterX;
      let badgeY = carryRowY;

      if (this.phase === 'carry_anim') {
        const t = Math.min(1, this.animTimer / 0.9);
        const ease = 1 - Math.pow(1 - t, 3);
        badgeX = onesCenterX + (tensCenterX - onesCenterX) * ease;
        badgeY = ansRowY + (carryRowY - ansRowY) * ease - Math.sin(t * Math.PI) * 45;
      }

      ctx.save();
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(badgeX - 22, badgeY - 14, 44, 28, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = '900 20px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+1', badgeX, badgeY);
      ctx.restore();
    }

    ctx.restore();
  }

  _drawAnswerSlot(ctx, cx, cy, digit, isActive, color) {
    ctx.save();
    ctx.fillStyle = digit !== null ? '#ecfdf5' : '#ffffff';
    ctx.strokeStyle = digit !== null ? '#10b981' : isActive ? '#eab308' : '#cbd5e1';
    ctx.lineWidth = isActive ? 3.5 : 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 30, cy - 21, 60, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = digit !== null ? '#059669' : color;
    ctx.font = '900 31px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit !== null ? String(digit) : '?', cx, cy + 1);
    ctx.restore();
  }

  /**
   * Draws Concrete Bone-Bundle Manipulatives on the right side of the screen
   * so 2nd graders can see stacks of 10-bone bundles (Tens) and single bones (Ones).
   */
  _drawBoneBundleVisuals(ctx) {
    if (!this.problem) return;

    const panelX = 680;
    const panelY = 108;
    const panelW = 256;
    const panelH = 244;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🦴 Place-Value Bundles', panelX + panelW / 2, panelY + 20);

    // Top section: 10-Bone Crates (Tens)
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `TENS: ${this.problem.aTens}0 ${this.problem.op} ${this.problem.bTens}0`,
      panelX + panelW / 2,
      panelY + 42
    );

    const maxDisplayTens = Math.min(
      8,
      this.problem.aTens + (this.problem.op === '+' ? this.problem.bTens : 0)
    );
    for (let i = 0; i < maxDisplayTens; i++) {
      const bx = panelX + 24 + (i % 4) * 54;
      const by = panelY + 52 + Math.floor(i / 4) * 32;
      const isFromA = i < this.problem.aTens;

      ctx.fillStyle = isFromA ? '#dbeafe' : '#bfdbfe';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, 44, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.fillText('10', bx + 13, by + 13);
      Sprites.drawBoneTreat(ctx, bx + 31, by + 12, 0.36, -0.15, '#fde047');
    }

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panelX + 16, panelY + 124);
    ctx.lineTo(panelX + panelW - 16, panelY + 124);
    ctx.stroke();

    // Bottom section: Single Bones (Ones)
    const displayOnesA = this.borrowApplied ? this.problem.aOnes + 10 : this.problem.aOnes;
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `ONES: ${displayOnesA} ${this.problem.op} ${this.problem.bOnes}`,
      panelX + panelW / 2,
      panelY + 142
    );

    const totalDots =
      this.problem.op === '+' ? this.problem.aOnes + this.problem.bOnes : displayOnesA;
    for (let i = 0; i < Math.min(18, totalDots); i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const dx = panelX + 44 + col * 42;
      const dy = panelY + 164 + row * 21;

      const isSecondGroup =
        this.problem.op === '+'
          ? i >= this.problem.aOnes
          : i >= displayOnesA - this.problem.bOnes;

      Sprites.drawBoneTreat(
        ctx,
        dx,
        dy,
        0.52,
        0,
        isSecondGroup ? '#fdba74' : '#fde047'
      );

      if (this.problem.op === '-' && isSecondGroup) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx - 8, dy - 5);
        ctx.lineTo(dx + 8, dy + 5);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  _drawDoubleDeckerCake(ctx, x, y, numberLabel, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Bottom tier
    ctx.fillStyle = '#fbcfe8';
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-48, 0, 96, 36, 10);
    ctx.fill();
    ctx.stroke();

    // Top tier
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(-34, -30, 68, 32, 10);
    ctx.fill();
    ctx.stroke();

    // Bone topper
    Sprites.drawBoneTreat(ctx, 0, -40, 0.8, 0, '#ffffff');

    // Answer number on cake
    ctx.fillStyle = '#9d174d';
    ctx.font = '900 24px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(numberLabel), 0, 18);

    ctx.restore();
  }

  _drawBottomDiamondArea(ctx, w, h) {
    this._drawSpeedBonusCard(ctx);

    const step = this.problem?.steps?.[this.currentStepIndex];
    if (!step) return;

    const centerX = w / 2;
    const centerY = h - 116;

    const labels = getNormalizedDiamondLabels();
    this.diamondBounds = Sprites.drawDiamondController(
      ctx,
      centerX,
      centerY,
      step.choices,
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

  /**
   * Draws a clear Speed Bonus & Puppy Patience scoreboard card on the bottom-left counter
   * so players see how answering fast keeps the dog happy and wins extra Golden Bones.
   */
  _drawSpeedBonusCard(ctx) {
    const cardX = 18;
    const cardY = 382;
    const cardW = 232;
    const cardH = 192;

    const orderDone = this.phase === 'result_highlight' || this.phase === 'cake_launch';
    const stepMistake = this.disabledDirs.length > 0;
    const isImpatient =
      !orderDone && (this.dogMood === 'impatient' || stepMistake || this.stepStartTime >= 7.0);
    const isSuperFast = !orderDone && !isImpatient && this.stepStartTime <= 3.5;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = isImpatient ? '#f97316' : isSuperFast ? '#22c55e' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = '#9d174d';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 Puppy Speed Bonus', cardX + cardW / 2, cardY + 22);

    // Current Mood Status Pill
    let moodBg = '#dcfce7';
    let moodBorder = '#22c55e';
    let moodColor = '#166534';
    let moodText = '😄 Super Happy! (+2/step)';

    if (orderDone) {
      moodBg = '#fef9c3';
      moodBorder = '#eab308';
      moodColor = '#854d0e';
      moodText = '🎂 Yummy Cake Served!';
    } else if (isImpatient) {
      moodBg = '#ffedd5';
      moodBorder = '#ea580c';
      moodColor = '#9a3412';
      moodText = '😣 Getting Impatient! (+0)';
    } else if (!isSuperFast) {
      moodBg = '#dbeafe';
      moodBorder = '#3b82f6';
      moodColor = '#1e40af';
      moodText = '🙂 Patient Pup (+1/step)';
    }

    ctx.fillStyle = moodBg;
    ctx.strokeStyle = moodBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX + 12, cardY + 32, cardW - 24, 28, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = moodColor;
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.fillText(moodText, cardX + cardW / 2, cardY + 50);

    // Point rules breakdown
    ctx.textAlign = 'left';
    ctx.font = 'bold 12.5px "Comic Sans MS", sans-serif';
    ctx.fillStyle = isSuperFast ? '#15803d' : '#64748b';
    ctx.fillText('★ Fast Step (<3.5s): +2 Bones', cardX + 14, cardY + 80);

    ctx.fillStyle = !isSuperFast && !isImpatient && !orderDone ? '#1d4ed8' : '#64748b';
    ctx.fillText('★ Patient Step (<7s): +1 Bone', cardX + 14, cardY + 100);

    ctx.fillStyle = '#475569';
    ctx.fillText('🎂 Base Cake Reward: +5 Bones', cardX + 14, cardY + 120);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 14, cardY + 132);
    ctx.lineTo(cardX + cardW - 14, cardY + 132);
    ctx.stroke();

    // Live Cake Payout total
    const currentCakeTotal = 5 + this.orderSpeedBonus;
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX + 12, cardY + 140, cardW - 24, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#854d0e';
    ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Speed Bonus So Far: +${this.orderSpeedBonus}`,
      cardX + cardW / 2,
      cardY + 154
    );
    ctx.fillStyle = '#15803d';
    ctx.font = '900 15px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `This Cake Payout: +${currentCakeTotal} Bones!`,
      cardX + cardW / 2,
      cardY + 172
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

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9d174d';
    ctx.font = '900 32px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎂 Master Puppy Baker! 🎂', w / 2, cardY + 50);

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
      `All ${TOTAL_ORDERS_PER_ROUND} Double-Decker Cakes Baked!`,
      w / 2,
      cardY + 168
    );
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 19px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Super Happy Fast Dogs: ${this.fastCakesThisRound} of ${TOTAL_ORDERS_PER_ROUND}`,
      w / 2,
      cardY + 202
    );
    ctx.fillStyle = '#b45309';
    ctx.font = '900 23px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Total Golden Bones Earned: +${this.roundTreatsEarned}`,
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
    ctx.fillText('🔄 Bake More', playBtn.x + playBtn.w / 2, playBtn.y + 34);

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

export default BigDogBakeryScene;
