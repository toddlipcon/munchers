import { GameState } from '../state.js';
import { MathEngine } from '../math.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';

const GRID_SIZE = 4;
const TOTAL_WAVES = 2;
const WAVE_1_VACUUM_INTERVAL = 2.8; // Super slow & predictable (1 step every 2.8s)
const WAVE_2_VACUUM_INTERVAL = 2.5;

// Predictable perimeter + row patrol route so the child can always see where the Robo-Vacuum goes next
const VACUUM_PATROL_PATH = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 0, col: 3 },
  { row: 1, col: 3 },
  { row: 2, col: 3 },
  { row: 3, col: 3 },
  { row: 3, col: 2 },
  { row: 3, col: 1 },
  { row: 3, col: 0 },
  { row: 2, col: 0 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: 2 },
  { row: 2, col: 2 },
  { row: 2, col: 1 },
];

function drawRoundedBox(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export class BoneMunchersScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.app = null;
    this.onExit = null;
    this.tier = 2;
    this.parkId = 'park_munchers';

    this._parseInitArgs(arg1, arg2);

    this.particles = new ParticleSystem();
    this.time = 0;
    this.canvasWidth = 1280;
    this.canvasHeight = 720;

    this.backButtonBounds = { x: 24, y: 20, w: 175, h: 52 };
    this.digButtonBounds = { x: 1020, y: 550, w: 220, h: 86 };
    this.completeBtnBounds = { x: 490, y: 540, w: 300, h: 68 };

    this.resetGame();
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
    // Disable diamond WASD mapping so WASD moves the dog on the 4x4 grid
    InputManager.setDiamondMode(false);
    InputManager.clearClickZones();
    this.resetGame();
  }

  init(options = {}) {
    this.enter(options);
  }

  exit() {
    InputManager.clearClickZones();
  }

  resetGame() {
    InputManager.setDiamondMode(false);
    this.particles.clear();

    this.wave = 1;
    this.totalWaves = TOTAL_WAVES;
    this.sessionBonesEarned = 0;
    this.wrongDigsCount = 0;
    this.starsEarned = 3;

    this.state = 'playing'; // 'playing' | 'wave_clear' | 'complete'
    this.waveClearTimer = 0;

    this._setupWave(1);
  }

  _setupWave(waveNum) {
    this.wave = waveNum;
    this.board = MathEngine.generateMunchersBoard(this.tier);
    this.matchesRemaining = this.board.totalMatches;

    // Annotate each cell with visual state
    this.board.cells.forEach((cell, idx) => {
      cell.dug = false;
      cell.dugOutcome = null; // 'bone' | 'boot' | 'broccoli'
      cell.sillyKind = idx % 2 === 0 ? 'boot' : 'broccoli';
    });

    // Place player dog near center-bottom (row 2, col 1) away from Robo-Vacuum start at (0,0)
    this.dogRow = 2;
    this.dogCol = 1;
    this.dogVisRow = 2;
    this.dogVisCol = 1;
    this.dogFromRow = 2;
    this.dogFromCol = 1;
    this.dogHopTimer = 1;
    this.dogHopDuration = 0.13;
    this.dogFacing = 'front';
    this.dogMood = 'happy';
    this.digAnimTimer = 0;
    this.tickleTimer = 0;

    // Goofy Non-Twitchy Robo-Vacuum state (glides at a constant rate along patrol path)
    this.vacuumPathIndex = 0;
    this.vacuumRow = VACUUM_PATROL_PATH[0].row;
    this.vacuumCol = VACUUM_PATROL_PATH[0].col;
    this.vacuumVisRow = this.vacuumRow;
    this.vacuumVisCol = this.vacuumCol;
    this.vacuumStepInterval =
      waveNum === 1 ? WAVE_1_VACUUM_INTERVAL : WAVE_2_VACUUM_INTERVAL;
    this.vacuumTimer = 0;

    this.statusMessage = `Wave ${waveNum} of ${this.totalWaves}: Dig all bones equal to ${this.board.target}!`;
    this.statusColor = '#0f172a';
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

  _getGridMetrics(w, h) {
    const gap = 10;
    const availH = Math.max(320, h - 180);
    const availW = Math.max(520, w - 285);
    const tileH = Math.max(82, Math.min(114, Math.floor((availH - (GRID_SIZE - 1) * gap) / GRID_SIZE)));
    const tileW = Math.max(138, Math.min(178, Math.floor((availW - (GRID_SIZE - 1) * gap) / GRID_SIZE)));
    const totalW = GRID_SIZE * tileW + (GRID_SIZE - 1) * gap;
    const totalH = GRID_SIZE * tileH + (GRID_SIZE - 1) * gap;
    const startX = Math.max(24, Math.round((w - 235 - totalW) / 2));
    const startY = Math.round(108 + (availH - totalH) / 2);
    return { tileW, tileH, gap, totalW, totalH, startX, startY };
  }

  _getCellCenter(row, col) {
    const m = this._getGridMetrics(this.canvasWidth, this.canvasHeight);
    const cx = m.startX + col * (m.tileW + m.gap) + m.tileW / 2;
    const cy = m.startY + row * (m.tileH + m.gap) + m.tileH / 2;
    return { cx, cy };
  }

  _startDogHopTo(targetRow, targetCol, facing) {
    this.dogFromRow = this.dogVisRow ?? this.dogRow;
    this.dogFromCol = this.dogVisCol ?? this.dogCol;
    this.dogRow = targetRow;
    this.dogCol = targetCol;
    this.dogHopTimer = 0;
    if (facing) this.dogFacing = facing;
    this.dogMood = 'walking';
  }

  _moveDog(dRow, dCol, facing) {
    const nextRow = Math.max(0, Math.min(GRID_SIZE - 1, this.dogRow + dRow));
    const nextCol = Math.max(0, Math.min(GRID_SIZE - 1, this.dogCol + dCol));
    if (nextRow !== this.dogRow || nextCol !== this.dogCol) {
      this._startDogHopTo(nextRow, nextCol, facing);
      SoundFX.step();

      // Check if the dog stepped right onto the Robo-Vacuum
      if (
        this.tickleTimer <= 0 &&
        Math.hypot(this.dogRow - this.vacuumVisRow, this.dogCol - this.vacuumVisCol) < 0.55
      ) {
        this._handleVacuumTickle();
      }
    }
  }

  _handleVacuumTickle() {
    SoundFX.oops();
    this.tickleTimer = 1.1;
    this.dogMood = 'excited';

    // Nudge the dog 1 tile to an adjacent safe spot — never loses a life!
    const neighbors = [
      { r: this.dogRow - 1, c: this.dogCol },
      { r: this.dogRow + 1, c: this.dogCol },
      { r: this.dogRow, c: this.dogCol - 1 },
      { r: this.dogRow, c: this.dogCol + 1 },
    ].filter(
      (pos) =>
        pos.r >= 0 &&
        pos.r < GRID_SIZE &&
        pos.c >= 0 &&
        pos.c < GRID_SIZE &&
        Math.hypot(pos.r - this.vacuumVisRow, pos.c - this.vacuumVisCol) >= 0.75
    );

    if (neighbors.length > 0) {
      const pick = neighbors[0];
      this._startDogHopTo(pick.r, pick.c, this.dogFacing);
    }

    const { cx, cy } = this._getCellCenter(this.dogRow, this.dogCol);
    this.statusMessage = 'Tickled by the Robo-Vacuum! Hehe, no lives lost!';
    this.statusColor = '#7c3aed';
    this.particles.emitHearts(cx, cy - 20, 6);
    this.particles.addFloatingText(cx, cy - 35, 'Tickled by the Vacuum! 😂', '#8b5cf6', 1.05);
  }

  _digCurrentTile() {
    if (this.state !== 'playing' || !this.board) return;
    const cell = this.board.grid[this.dogRow][this.dogCol];
    if (!cell || cell.dug || cell.munched) {
      SoundFX.step();
      this.statusMessage = 'Already dug here! Hop to another dirt mound!';
      this.statusColor = '#475569';
      return;
    }

    cell.dug = true;
    cell.munched = true;
    this.digAnimTimer = 0.55;
    this.dogMood = 'munching';

    const { cx, cy } = this._getCellCenter(this.dogRow, this.dogCol);

    if (cell.isMatch || cell.value === this.board.target) {
      // Sparkling Golden Bone!
      cell.dugOutcome = 'bone';
      this.matchesRemaining = Math.max(0, this.matchesRemaining - 1);
      this.sessionBonesEarned += 2;
      GameState.addTreats(2);
      GameState.recordFactResult(cell.key, true, 1800);

      SoundFX.munch();
      SoundFX.correct();
      this.particles.emitCrumbs(cx, cy, 14);
      this.particles.emitStars(cx, cy - 10, 14);
      this.particles.addFloatingText(
        cx,
        cy - 30,
        `${cell.prompt} = ${cell.value}! +2 🦴`,
        '#d97706',
        1.15
      );

      this.statusMessage = `YUM! ${cell.prompt} = ${this.board.target}! Found a Golden Bone! (+2 🦴)`;
      this.statusColor = '#15803d';

      if (this.matchesRemaining <= 0) {
        this._onWaveCleared();
      }
    } else {
      // Silly Old Boot or Squeaky Broccoli — educational & non-punishing!
      cell.dugOutcome = cell.sillyKind;
      this.wrongDigsCount += 1;
      GameState.recordFactResult(cell.key, false, 3500);

      SoundFX.oops();
      const itemLabel =
        cell.sillyKind === 'boot' ? 'Silly Old Boot 🥾' : 'Squeaky Broccoli 🥦';
      this.particles.emitCrumbs(cx, cy, 10);
      this.particles.addFloatingText(
        cx,
        cy - 32,
        `${cell.prompt} = ${cell.value} (Need ${this.board.target}!)`,
        '#dc2626',
        1.0
      );

      this.statusMessage = `Dug up a ${itemLabel}!  ${cell.prompt} = ${cell.value} (Need ${this.board.target}!)`;
      this.statusColor = '#b45309';
    }
  }

  _onWaveCleared() {
    if (this.wave < this.totalWaves) {
      this.state = 'wave_clear';
      this.waveClearTimer = 2.0;
      SoundFX.zoomies();
      this.particles.emitConfetti(this.canvasWidth * 0.5, this.canvasHeight * 0.4, 32);
      this.statusMessage = `Wave ${this.wave} Cleared! Get ready for Wave ${this.wave + 1}!`;
      this.statusColor = '#d97706';
    } else {
      this.state = 'complete';
      this.starsEarned = this.wrongDigsCount <= 2 ? 3 : 2;
      if (GameState.parkStars) {
        const prev = GameState.parkStars[this.parkId] || 0;
        GameState.parkStars[this.parkId] = Math.max(prev, this.starsEarned);
        GameState.save();
      }
      SoundFX.levelComplete();
      this.particles.emitConfetti(this.canvasWidth * 0.5, this.canvasHeight * 0.35, 45);
      this.particles.emitStars(this.canvasWidth * 0.5, this.canvasHeight * 0.35, 20);
    }
  }

  handleClick(x, y) {
    const bb = this.backButtonBounds;
    if (x >= bb.x && x <= bb.x + bb.w && y >= bb.y && y <= bb.y + bb.h) {
      SoundFX.step();
      this._returnToMap();
      return true;
    }

    if (this.state === 'complete') {
      const cb = this.completeBtnBounds;
      if (x >= cb.x && x <= cb.x + cb.w && y >= cb.y && y <= cb.y + cb.h) {
        SoundFX.bark();
        this._returnToMap();
        return true;
      }
      return false;
    }

    if (this.state === 'playing') {
      const db = this.digButtonBounds;
      if (x >= db.x && x <= db.x + db.w && y >= db.y && y <= db.y + db.h) {
        this._digCurrentTile();
        return true;
      }

      const m = this._getGridMetrics(this.canvasWidth, this.canvasHeight);
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const tx = m.startX + c * (m.tileW + m.gap);
          const ty = m.startY + r * (m.tileH + m.gap);
          if (x >= tx && x <= tx + m.tileW && y >= ty && y <= ty + m.tileH) {
            if (this.dogRow === r && this.dogCol === c) {
              this._digCurrentTile();
            } else {
              const facing = c < this.dogCol ? 'left' : c > this.dogCol ? 'right' : 'front';
              this._startDogHopTo(r, c, facing);
              SoundFX.step();
              if (
                this.tickleTimer <= 0 &&
                Math.hypot(this.dogRow - this.vacuumVisRow, this.dogCol - this.vacuumVisCol) < 0.55
              ) {
                this._handleVacuumTickle();
              } else {
                this._digCurrentTile();
              }
            }
            return true;
          }
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

    if (this.digAnimTimer > 0) {
      this.digAnimTimer = Math.max(0, this.digAnimTimer - clampedDt);
      if (this.digAnimTimer === 0 && this.dogMood === 'munching') {
        this.dogMood = 'happy';
      }
    }

    if (this.tickleTimer > 0) {
      this.tickleTimer = Math.max(0, this.tickleTimer - clampedDt);
    }

    // Advance quick tile-to-tile hop interpolation for the dog
    if (this.dogHopTimer < this.dogHopDuration) {
      this.dogHopTimer = Math.min(this.dogHopDuration, this.dogHopTimer + clampedDt);
      const t = this.dogHopTimer / this.dogHopDuration;
      const ease = 1 - Math.pow(1 - t, 3);
      this.dogVisRow = this.dogFromRow + (this.dogRow - this.dogFromRow) * ease;
      this.dogVisCol = this.dogFromCol + (this.dogCol - this.dogFromCol) * ease;
      if (t >= 1 && this.dogMood === 'walking') {
        this.dogMood = 'happy';
      }
    } else {
      this.dogVisRow = this.dogRow;
      this.dogVisCol = this.dogCol;
    }

    if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
      SoundFX.step();
      this._returnToMap();
      return;
    }

    if (this.state === 'complete') {
      if (
        InputManager.justPressed('play_again') ||
        InputManager.justPressed('confirm') ||
        InputManager.justPressed('start') ||
        InputManager.justPressed('bottom') ||
        InputManager.justPressed('right')
      ) {
        SoundFX.bark(1.1);
        this.resetGame();
        return;
      }
      if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
        SoundFX.step();
        this._returnToMap();
      }
      return;
    }

    if (this.state === 'wave_clear') {
      this.waveClearTimer -= clampedDt;
      if (this.waveClearTimer <= 0) {
        this.state = 'playing';
        this._setupWave(this.wave + 1);
      }
      return;
    }

    // 1. Grid Movement (D-pad / Stick / Arrows / WASD)
    if (InputManager.justMoved('up')) {
      this._moveDog(-1, 0, 'front');
    } else if (InputManager.justMoved('down')) {
      this._moveDog(1, 0, 'front');
    } else if (InputManager.justMoved('left')) {
      this._moveDog(0, -1, 'left');
    } else if (InputManager.justMoved('right')) {
      this._moveDog(0, 1, 'right');
    }

    // 2. Dig & Munch Action (Confirm / A / B / X / Y / Space / Enter)
    if (
      InputManager.justPressed('confirm') ||
      InputManager.justPressed('bottom') ||
      InputManager.justPressed('right') ||
      InputManager.justPressed('top') ||
      InputManager.justPressed('left')
    ) {
      this._digCurrentTile();
    }

    // 3. Clickable grid tile zones triggered via InputManager
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (InputManager.justPressed(`cell_${r}_${c}`)) {
          if (this.dogRow === r && this.dogCol === c) {
            this._digCurrentTile();
          } else {
            const facing = c < this.dogCol ? 'left' : c > this.dogCol ? 'right' : 'front';
            this._startDogHopTo(r, c, facing);
            SoundFX.step();
            if (
              this.tickleTimer <= 0 &&
              Math.hypot(this.dogRow - this.vacuumVisRow, this.dogCol - this.vacuumVisCol) < 0.55
            ) {
              this._handleVacuumTickle();
            } else {
              this._digCurrentTile();
            }
          }
        }
      }
    }

    // 4. Constant-rate smooth Robo-Vacuum patrol between tiles
    this.vacuumTimer += clampedDt;
    while (this.vacuumTimer >= this.vacuumStepInterval) {
      this.vacuumTimer -= this.vacuumStepInterval;
      this.vacuumPathIndex = (this.vacuumPathIndex + 1) % VACUUM_PATROL_PATH.length;
    }
    const currStop = VACUUM_PATROL_PATH[this.vacuumPathIndex];
    const nextStop =
      VACUUM_PATROL_PATH[(this.vacuumPathIndex + 1) % VACUUM_PATROL_PATH.length];
    const vacFrac = Math.min(1, Math.max(0, this.vacuumTimer / this.vacuumStepInterval));

    this.vacuumVisRow = currStop.row + (nextStop.row - currStop.row) * vacFrac;
    this.vacuumVisCol = currStop.col + (nextStop.col - currStop.col) * vacFrac;
    this.vacuumRow = vacFrac < 0.5 ? currStop.row : nextStop.row;
    this.vacuumCol = vacFrac < 0.5 ? currStop.col : nextStop.col;

    if (
      this.tickleTimer <= 0 &&
      Math.hypot(this.dogVisRow - this.vacuumVisRow, this.dogVisCol - this.vacuumVisCol) < 0.45
    ) {
      this._handleVacuumTickle();
    }
  }

  _drawGardenBackground(ctx, w, h) {
    // Rich garden grass backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#86efac');
    bgGrad.addColorStop(0.2, '#4ade80');
    bgGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Decorative garden border fence & flowers around the 4x4 plot
    const m = this._getGridMetrics(w, h);
    ctx.save();
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 5;
    drawRoundedBox(
      ctx,
      m.startX - 24,
      m.startY - 20,
      m.totalW + 48,
      m.totalH + 40,
      28
    );
    ctx.fill();
    ctx.stroke();

    // Inner garden soil bed
    ctx.fillStyle = '#78350f';
    drawRoundedBox(
      ctx,
      m.startX - 12,
      m.startY - 10,
      m.totalW + 24,
      m.totalH + 20,
      20
    );
    ctx.fill();
    ctx.restore();
  }

  _drawCollarTagHeader(ctx, w) {
    // Top Header Banner with Golden Collar Tag Target Number right beside the prompt
    const bannerW = 368;
    const bannerH = 74;
    const bannerX = Math.round((w - bannerW) / 2 - 8);
    const bannerY = 12;

    ctx.save();

    // Red Dog Collar Strap behind the banner
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    drawRoundedBox(ctx, bannerX, bannerY, bannerW, bannerH, 22);
    ctx.fill();
    ctx.stroke();

    // Inner cream label
    ctx.fillStyle = '#fffbeb';
    drawRoundedBox(ctx, bannerX + 8, bannerY + 7, bannerW - 16, bannerH - 14, 16);
    ctx.fill();

    // Big Sparkling Golden Collar Tag positioned right next to the text
    const tagX = bannerX + bannerW - 58;
    const tagY = bannerY + bannerH / 2 + 1;

    // Text: "Dig all bones equal to:" right-aligned directly against the target number badge
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 23px "Fredoka One", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('Dig all bones equal to:', tagX - 42, bannerY + bannerH / 2 - 10);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.fillText(
      `Wave ${this.wave} of ${this.totalWaves}  •  Bones left: ${this.matchesRemaining}`,
      tagX - 42,
      bannerY + bannerH / 2 + 16
    );

    const pulse = 1 + Math.sin(this.time * 4) * 0.05;

    ctx.save();
    ctx.translate(tagX, tagY);
    ctx.scale(pulse, pulse);

    // Collar ring
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -32, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Golden Tag Circle
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 33, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner rim
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.stroke();

    // Target Number
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 32px "Fredoka One", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(this.board ? this.board.target : 14), 0, 2);
    ctx.restore();

    ctx.restore();
  }

  _drawSillyItem(ctx, x, y, kind) {
    ctx.save();
    ctx.translate(x, y);
    if (kind === 'boot') {
      // Goofy cartoon mud boot
      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-12, -18);
      ctx.lineTo(4, -18);
      ctx.lineTo(4, 2);
      ctx.quadraticCurveTo(20, 2, 20, 14);
      ctx.lineTo(-12, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Squeaky Broccoli floret
      ctx.fillStyle = '#84cc16';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      drawRoundedBox(ctx, -5, 0, 10, 15, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-8, -4, 9, 0, Math.PI * 2);
      ctx.arc(8, -4, 9, 0, Math.PI * 2);
      ctx.arc(0, -10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawRoboVacuum(ctx) {
    const currStop = VACUUM_PATROL_PATH[this.vacuumPathIndex];
    const nextIdx = (this.vacuumPathIndex + 1) % VACUUM_PATROL_PATH.length;
    const nextStop = VACUUM_PATROL_PATH[nextIdx];
    const currTilePos = this._getCellCenter(currStop.row, currStop.col);
    const nextTilePos = this._getCellCenter(nextStop.row, nextStop.col);
    const vacPos = this._getCellCenter(this.vacuumVisRow, this.vacuumVisCol);

    const vacDrawX = vacPos.cx + 38;
    const vacDrawY = vacPos.cy + 24;
    const angle = Math.atan2(nextTilePos.cy - currTilePos.cy, nextTilePos.cx - currTilePos.cx);

    // 1. Draw direction arrow just ahead of the moving Robo-Vacuum
    ctx.save();
    const arrowX = vacDrawX + Math.cos(angle) * 44;
    const arrowY = vacDrawY - 2 + Math.sin(angle) * 32;

    ctx.translate(arrowX, arrowY);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.92)';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.lineTo(3, -5);
    ctx.lineTo(3, -11);
    ctx.lineTo(15, 0);
    ctx.lineTo(3, 11);
    ctx.lineTo(3, 5);
    ctx.lineTo(-12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Draw Goofy Robo-Vacuum gliding smoothly at constant speed
    ctx.save();
    const wobbleX = Math.sin(this.time * 18) * 1.2;
    const wobbleY = Math.cos(this.time * 18) * 1.2;
    ctx.translate(vacDrawX + wobbleX, vacDrawY + wobbleY);
    ctx.scale(0.78, 0.78);

    // Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spinning side whisker brushes
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 26, -6);
      ctx.rotate(this.time * 8 * side);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Roomba disc base
    ctx.fillStyle = '#6366f1';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 35, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top bumper ring
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.ellipse(0, -3, 25, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Countdown progress arc showing when it will take its next slow step
    const stepRatio = Math.min(1, this.vacuumTimer / this.vacuumStepInterval);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -3, 10, -Math.PI / 2, -Math.PI / 2 + stepRatio * Math.PI * 2);
    ctx.stroke();

    // Big Googly Eyes
    for (const side of [-1, 1]) {
      const ex = side * 11;
      const ey = -11;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(ex, ey, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Jiggling googly pupils
      const px = ex + Math.cos(this.time * 5 + side) * 2.5;
      const py = ey + Math.sin(this.time * 6 + side) * 2.5;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawGridAndEntities(ctx, w, h) {
    if (!this.board) return;
    const m = this._getGridMetrics(w, h);

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = this.board.grid[r][c];
        const tx = m.startX + c * (m.tileW + m.gap);
        const ty = m.startY + r * (m.tileH + m.gap);
        const isDogHere = this.dogRow === r && this.dogCol === c;

        ctx.save();

        // Tile card base
        if (cell.dugOutcome === 'bone') {
          ctx.fillStyle = '#dcfce7';
          ctx.strokeStyle = '#16a34a';
        } else if (cell.dugOutcome) {
          ctx.fillStyle = '#fef3c7';
          ctx.strokeStyle = '#d97706';
        } else {
          ctx.fillStyle = '#fde68a';
          ctx.strokeStyle = isDogHere ? '#facc15' : '#b45309';
        }

        ctx.lineWidth = isDogHere ? 6 : 3.5;
        drawRoundedBox(ctx, tx, ty, m.tileW, m.tileH, 18);
        ctx.fill();
        ctx.stroke();

        // Soft dirt mound illustration inside the patch
        ctx.fillStyle = cell.dug ? 'rgba(120, 53, 15, 0.16)' : 'rgba(180, 83, 9, 0.18)';
        ctx.beginPath();
        ctx.ellipse(
          tx + m.tileW / 2,
          ty + m.tileH - 22,
          m.tileW * 0.36,
          14,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Highlight halo if player's dog is on this tile
        if (isDogHere) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 5]);
          drawRoundedBox(ctx, tx + 4, ty + 4, m.tileW - 8, m.tileH - 8, 14);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Equation / Dug Result Display
        if (!cell.dug) {
          ctx.fillStyle = '#0f172a';
          ctx.font = '900 30px "Fredoka One", "Comic Sans MS", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textOffsetX = isDogHere ? 30 : 0;
          const textOffsetY = isDogHere ? -8 : -10;
          ctx.fillText(cell.prompt, tx + m.tileW / 2 + textOffsetX, ty + m.tileH / 2 + textOffsetY);
        } else if (cell.dugOutcome === 'bone') {
          Sprites.drawBoneTreat(ctx, tx + 42, ty + m.tileH / 2, 0.85, -0.2);
          ctx.fillStyle = '#15803d';
          ctx.font = '900 22px "Comic Sans MS", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${cell.prompt} = ${cell.value} ✓`,
            tx + m.tileW / 2 + 18,
            ty + m.tileH / 2
          );
        } else {
          this._drawSillyItem(ctx, tx + 36, ty + m.tileH / 2, cell.dugOutcome);
          ctx.fillStyle = '#9a3412';
          ctx.font = 'bold 21px "Comic Sans MS", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${cell.prompt} = ${cell.value}`,
            tx + m.tileW / 2 + 16,
            ty + m.tileH / 2
          );
        }

        ctx.restore();

        // Register clickable zone for this tile
        InputManager.registerClickZone(`cell_${r}_${c}`, tx, ty, m.tileW, m.tileH);
      }
    }

    // Draw the Non-Twitchy Robo-Vacuum
    this._drawRoboVacuum(ctx);

    // Draw the Player's Dog with smooth hop interpolation between tiles
    const dogPos = this._getCellCenter(
      this.dogVisRow ?? this.dogRow,
      this.dogVisCol ?? this.dogCol
    );
    const hopT =
      this.dogHopDuration > 0
        ? Math.min(1, (this.dogHopTimer ?? this.dogHopDuration) / this.dogHopDuration)
        : 1;
    const hopArcY = hopT < 1 ? -Math.sin(hopT * Math.PI) * 18 : 0;

    Sprites.drawDog(ctx, dogPos.cx - 52, dogPos.cy + 5 + hopArcY, {
      breed: GameState.selectedBreed,
      hat: GameState.selectedHat,
      scale: 0.65,
      time: this.time,
      mood: this.dogMood,
      facing: this.dogFacing,
    });
  }

  _drawSideControlsAndHUD(ctx, w, h) {
    // 1. Back to Map Button (top-left)
    const bb = this.backButtonBounds;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    drawRoundedBox(ctx, bb.x, bb.y, bb.w, bb.h, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬅ Park Map', bb.x + bb.w / 2, bb.y + bb.h / 2 + 1);
    ctx.restore();
    InputManager.registerClickZone('cancel', bb.x, bb.y, bb.w, bb.h);

    // 2. Golden Bones Counter (top-right)
    const boneBoxW = 190;
    const boneBoxH = 52;
    const boneBoxX = w - boneBoxW - 24;
    const boneBoxY = 20;

    ctx.save();
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    drawRoundedBox(ctx, boneBoxX, boneBoxY, boneBoxW, boneBoxH, 16);
    ctx.fill();
    ctx.stroke();

    Sprites.drawBoneTreat(ctx, boneBoxX + 38, boneBoxY + boneBoxH / 2, 0.95, -0.2);

    ctx.fillStyle = '#78350f';
    ctx.font = '900 26px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${GameState.treats}`, boneBoxX + 74, boneBoxY + boneBoxH / 2 + 2);
    ctx.restore();

    // 3. Right-hand Helper Card + DIG & MUNCH Button
    const cardX = w - 245;
    const cardY = 140;
    const cardW = 220;
    const cardH = 380;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3.5;
    drawRoundedBox(ctx, cardX, cardY, cardW, cardH, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('How to Play', cardX + cardW / 2, cardY + 36);

    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('🕹️ D-Pad / Arrows:', cardX + cardW / 2, cardY + 78);
    ctx.fillText('Hop tile to tile', cardX + cardW / 2, cardY + 102);

    ctx.fillText('🔴 Face Button / Space:', cardX + cardW / 2, cardY + 150);
    ctx.fillText('DIG & MUNCH!', cardX + cardW / 2, cardY + 174);

    ctx.fillText('🤖 Goofy Vacuum:', cardX + cardW / 2, cardY + 224);
    ctx.fillText('Only tickles you!', cardX + cardW / 2, cardY + 248);

    // Big clickable DIG & MUNCH button
    const db = this.digButtonBounds;
    db.x = cardX + 14;
    db.y = cardY + cardH - 102;
    db.w = cardW - 28;
    db.h = 82;

    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    drawRoundedBox(ctx, db.x, db.y, db.w, db.h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦴 DIG! (A)', db.x + db.w / 2, db.y + db.h / 2 + 1);
    ctx.restore();

    InputManager.registerClickZone('confirm', db.x, db.y, db.w, db.h);

    // 4. Bottom Feedback Status Bar
    const fbW = Math.min(860, w - 48);
    const fbH = 48;
    const fbX = Math.round((w - fbW) / 2);
    const fbY = h - 58;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    drawRoundedBox(ctx, fbX, fbY, fbW, fbH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.statusColor;
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.statusMessage, fbX + fbW / 2, fbY + fbH / 2 + 1);
    ctx.restore();
  }

  _drawCompleteOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
    ctx.fillRect(0, 0, w, h);

    const cardW = 640;
    const cardH = 460;
    const cardX = w / 2 - cardW / 2;
    const cardY = h / 2 - cardH / 2;

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    drawRoundedBox(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 40px "Fredoka One", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bone Diggers Park Complete!', w / 2, cardY + 68);

    const starText = '⭐'.repeat(this.starsEarned) + '☆'.repeat(Math.max(0, 3 - this.starsEarned));
    ctx.font = '48px sans-serif';
    ctx.fillText(starText, w / 2, cardY + 135);

    Sprites.drawDog(ctx, w / 2 - 170, cardY + 255, {
      breed: GameState.selectedBreed,
      hat: GameState.selectedHat,
      scale: 1.05,
      time: this.time,
      mood: 'zoomies',
    });

    ctx.textAlign = 'left';
    ctx.font = 'bold 26px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`🌱 Garden Waves Cleared: ${this.totalWaves} / ${this.totalWaves}`, w / 2 - 65, cardY + 225);
    ctx.fillStyle = '#b45309';
    ctx.fillText(`🦴 Golden Bones Dug Up: +${this.sessionBonesEarned}`, w / 2 - 65, cardY + 275);

    const playBtn = { x: cardX + 60, y: cardY + cardH - 96, w: 245, h: 64 };
    const mapBtn = { x: cardX + 335, y: cardY + cardH - 96, w: 245, h: 64 };

    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 4;
    drawRoundedBox(ctx, playBtn.x, playBtn.y, playBtn.w, playBtn.h, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔄 Dig Again (A)', playBtn.x + playBtn.w / 2, playBtn.y + playBtn.h / 2 + 2);

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1d4ed8';
    drawRoundedBox(ctx, mapBtn.x, mapBtn.y, mapBtn.w, mapBtn.h, 20);
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

    InputManager.clearClickZones();

    // 1. Garden Background & Soil Border
    this._drawGardenBackground(ctx, w, h);

    // 2. Top Collar Tag Target Number Header
    this._drawCollarTagHeader(ctx, w);

    // 3. 4x4 Garden Grid, Robo-Vacuum & Player's Dog
    this._drawGridAndEntities(ctx, w, h);

    // 4. Side Controls & Bottom Feedback Banner
    this._drawSideControlsAndHUD(ctx, w, h);

    // 5. Particles & Floating Text
    this.particles.draw(ctx);

    // 6. Wave Clear Banner or Park Complete Modal
    if (this.state === 'wave_clear') {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fef9c3';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 5;
      drawRoundedBox(ctx, w / 2 - 280, h / 2 - 70, 560, 140, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 36px "Fredoka One", "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🎉 Wave ${this.wave} Cleared! 🎉`, w / 2, h / 2 - 16);
      ctx.font = 'bold 24px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText('Get ready for Wave 2!', w / 2, h / 2 + 30);
      ctx.restore();
    } else if (this.state === 'complete') {
      this._drawCompleteOverlay(ctx, w, h);
    }
  }

  render(ctx, canvas) {
    this.draw(ctx, canvas);
  }
}

export default BoneMunchersScene;
