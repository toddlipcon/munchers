import { GameState } from './state.js';
import { InputManager } from './input.js';
import { SoundFX } from './audio.js';
import { Sprites, DOG_BREEDS, DOG_HATS, ParticleSystem } from './sprites.js';

const CANVAS_W = 960;
const CANVAS_H = 600;

export const OVERWORLD_LOCATIONS = [
  {
    id: 'cafe_sunny',
    name: 'Sunny Paws Cafe',
    subtitle: 'Fast Recall: Doubles & Make 10',
    x: 210,
    y: 210,
    color: '#f59e0b',
    secondaryColor: '#fef3c7',
    roofColor: '#ea580c',
    type: 'cafe',
    trigger: { mode: 'cafe', tier: 1, title: 'Sunny Paws Cafe', id: 'cafe_sunny', locationId: 'cafe_sunny' },
  },
  {
    id: 'cafe_beach',
    name: 'Boardwalk Barkery',
    subtitle: 'Gelato Cones: Missing Scoop & Make 10!',
    x: 490,
    y: 155,
    color: '#06b6d4',
    secondaryColor: '#cffafe',
    roofColor: '#f43f5e',
    type: 'beach',
    trigger: { mode: 'boardwalk', tier: 2, title: 'Boardwalk Barkery', id: 'cafe_beach', locationId: 'cafe_beach' },
  },
  {
    id: 'cafe_bakery',
    name: 'Big Dog Double-Decker Bakery',
    subtitle: 'Multi-Digit: Add & Subtract (Ones First!)',
    x: 760,
    y: 225,
    color: '#8b5cf6',
    secondaryColor: '#ede9fe',
    roofColor: '#facc15',
    type: 'bakery',
    trigger: { mode: 'bakery', difficulty: 1, title: 'Big Dog Bakery', id: 'cafe_bakery', locationId: 'cafe_bakery' },
  },
  {
    id: 'park_frisbee',
    name: 'Zoomies Frisbee Park',
    subtitle: 'Catch Frisbees: Fast Recall Streak!',
    x: 230,
    y: 430,
    color: '#10b981',
    secondaryColor: '#d1fae5',
    roofColor: '#0ea5e9',
    type: 'frisbee',
    trigger: { mode: 'frisbee', tier: 2, title: 'Zoomies Frisbee Park', id: 'park_frisbee', locationId: 'park_frisbee' },
  },
  {
    id: 'park_munchers',
    name: 'Bone Diggers Park',
    subtitle: 'Number Munchers: Dig Matching Bones!',
    x: 510,
    y: 450,
    color: '#d97706',
    secondaryColor: '#fef3c7',
    roofColor: '#10b981',
    type: 'munchers',
    trigger: { mode: 'munchers', tier: 1, title: 'Bone Diggers Park', id: 'park_munchers', locationId: 'park_munchers' },
  },
  {
    id: 'boutique',
    name: 'Bark & Bling Boutique',
    subtitle: 'Adopt Pups & Buy Silly Hats!',
    x: 775,
    y: 435,
    color: '#ec4899',
    secondaryColor: '#fce7f3',
    roofColor: '#db2777',
    type: 'boutique',
    trigger: { mode: 'boutique', title: 'Bark & Bling Boutique', id: 'boutique', locationId: 'boutique' },
  },
];

const TREES = [
  { x: 118, y: 145, scale: 0.95, phase: 0.2, kind: 'oak' },
  { x: 348, y: 132, scale: 0.9, phase: 1.4, kind: 'palm' },
  { x: 632, y: 142, scale: 0.92, phase: 2.1, kind: 'palm' },
  { x: 855, y: 165, scale: 0.88, phase: 0.8, kind: 'oak' },
  { x: 120, y: 325, scale: 1.0, phase: 1.9, kind: 'oak' },
  { x: 355, y: 300, scale: 0.85, phase: 2.8, kind: 'oak' },
  { x: 635, y: 315, scale: 0.88, phase: 0.5, kind: 'oak' },
  { x: 865, y: 335, scale: 0.96, phase: 1.1, kind: 'palm' },
  { x: 368, y: 492, scale: 0.9, phase: 2.4, kind: 'palm' },
  { x: 650, y: 488, scale: 0.92, phase: 1.7, kind: 'oak' },
];

const HYDRANTS = [
  { x: 295, y: 238 },
  { x: 675, y: 248 },
  { x: 318, y: 448 },
  { x: 695, y: 452 },
];

const FLOWER_PATCHES = [
  { x: 155, y: 280, color: '#f43f5e' },
  { x: 278, y: 175, color: '#facc15' },
  { x: 418, y: 215, color: '#a855f7' },
  { x: 575, y: 205, color: '#fb7185' },
  { x: 695, y: 185, color: '#38bdf8' },
  { x: 165, y: 485, color: '#facc15' },
  { x: 425, y: 405, color: '#f43f5e' },
  { x: 595, y: 415, color: '#a855f7' },
  { x: 830, y: 490, color: '#38bdf8' },
];

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

export class OverworldScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.game = null;
    this.onSelectLocation = null;

    if (typeof arg1 === 'function') {
      this.onSelectLocation = arg1;
    } else if (typeof arg2 === 'function') {
      this.game = arg1;
      this.onSelectLocation = arg2;
    } else if (arg1 && typeof arg1 === 'object') {
      if (typeof arg1.onSelectLocation === 'function' || typeof arg1.onEnterMode === 'function') {
        this.onSelectLocation = arg1.onSelectLocation || arg1.onEnterMode;
      }
      if (arg1.game) {
        this.game = arg1.game;
      } else if (
        typeof arg1.switchScene === 'function' ||
        typeof arg1.changeScene === 'function' ||
        typeof arg1.setScene === 'function'
      ) {
        this.game = arg1;
      }
    }

    this.playerX = 480;
    this.playerY = 315;
    this.playerFacing = 'front';
    this.isMoving = false;
    this.walkTarget = null;
    this.pendingLocationTrigger = null;

    this.stepTimer = 0;
    this.barkCooldown = 0;
    this.flipProgress = 0;
    this.time = 0;

    // Breadcrumb trail for the Puppy Pack followers
    this.trail = [];
    this._seedTrail(this.playerX, this.playerY);

    this.activeLocation = null;
    this.lastActiveLocationId = null;

    this.particles = new ParticleSystem();
    this._zonesRegistered = false;
  }

  _seedTrail(x, y) {
    this.trail = [];
    for (let i = 0; i < 60; i++) {
      this.trail.push({ x, y: y + i * 0.4, facing: 'front' });
    }
  }

  enter() {
    InputManager.setDiamondMode(false);
    this.walkTarget = null;
    this.pendingLocationTrigger = null;
    this._registerClickZones();
  }

  _registerClickZones() {
    InputManager.clearClickZones();

    // Top HUD Controller Style toggle button
    InputManager.registerClickZone('toggle_controller', 605, 8, 342, 42, () => {
      GameState.toggleControllerStyle();
      SoundFX.bark?.(1.18);
      this.particles.emitStars(775, 28, 8);
    });

    // Click active dog badge in HUD to do a happy bark & backflip
    InputManager.registerClickZone('hud_dog_bark', 225, 8, 365, 42, () => {
      this._triggerHappyBark();
    });

    // Bottom prompt banner click zone (enters active location immediately)
    InputManager.registerClickZone('enter_active_banner', 200, 504, 560, 88, () => {
      if (this.activeLocation) {
        this._enterLocation(this.activeLocation);
      }
    });

    // Each of the 6 buildings on the island
    for (const loc of OVERWORLD_LOCATIONS) {
      InputManager.registerClickZone(
        `loc_${loc.id}`,
        loc.x - 75,
        loc.y - 75,
        150,
        135,
        () => {
          const dist = Math.hypot(this.playerX - loc.x, this.playerY - (loc.y + 34));
          if (dist <= 85 || this.activeLocation?.id === loc.id) {
            this._enterLocation(loc);
          } else {
            this.walkTarget = { x: loc.x, y: loc.y + 34 };
            this.pendingLocationTrigger = loc;
            SoundFX.bark?.(1.08);
          }
        }
      );
    }

    this._zonesRegistered = true;
  }

  _triggerHappyBark() {
    SoundFX.bark?.(1.1);
    this.flipProgress = 0.01;
    this.particles.emitHearts(this.playerX, this.playerY - 35, 8);
  }

  _enterLocation(loc) {
    if (!loc) return;
    SoundFX.zoomies?.();
    this.particles.emitStars(loc.x, loc.y, 16);
    this.walkTarget = null;
    this.pendingLocationTrigger = null;
    InputManager.clearClickZones();
    const payload = { ...loc.trigger };
    if (typeof this.onSelectLocation === 'function') {
      this.onSelectLocation(payload);
      return;
    }
    if (this.game) {
      if (typeof this.game.onSelectLocation === 'function') {
        this.game.onSelectLocation(payload);
      } else if (typeof this.game.switchScene === 'function') {
        this.game.switchScene(payload.mode, payload);
      } else if (typeof this.game.changeScene === 'function') {
        this.game.changeScene(payload.mode, payload);
      } else if (typeof this.game.setScene === 'function') {
        this.game.setScene(payload.mode, payload);
      }
    }
  }

  update(dt) {
    const rawDt = typeof dt === 'number' && dt > 0 ? (dt > 1 ? dt / 1000 : dt) : 0.016;
    const safeDt = Math.min(rawDt, 0.1);
    this.time += safeDt;

    InputManager.setDiamondMode(false);
    if (!this._zonesRegistered || InputManager.clickZones.size === 0) {
      this._registerClickZones();
    }

    if (this.barkCooldown > 0) {
      this.barkCooldown = Math.max(0, this.barkCooldown - safeDt);
    }

    if (this.flipProgress > 0) {
      this.flipProgress += safeDt * 2.4;
      if (this.flipProgress >= 1) {
        this.flipProgress = 0;
      }
    }

    // Toggle controller button labels (SNES X/Y/B/A <-> Xbox Y/X/A/B) with Select / Tab
    if (InputManager.justPressed('select')) {
      GameState.toggleControllerStyle();
      SoundFX.bark?.(1.18);
      this.particles.emitStars(775, 28, 8);
    }

    // Optional L/R shoulder buttons cycle unlocked breeds right on the island!
    if (InputManager.justPressed('L') || InputManager.justPressed('R')) {
      const unlocked = GameState.unlockedBreeds || ['golden'];
      if (unlocked.length > 1) {
        const dir = InputManager.justPressed('R') ? 1 : -1;
        const idx = unlocked.indexOf(GameState.selectedBreed);
        const nextIdx = (idx + dir + unlocked.length) % unlocked.length;
        GameState.selectedBreed = unlocked[nextIdx];
        GameState.save();
        this._triggerHappyBark();
      }
    }

    // D-pad / Left Stick / Arrow keys / WASD movement
    let dx = 0;
    let dy = 0;
    if (InputManager.isHeld('left')) dx -= 1;
    if (InputManager.isHeld('right')) dx += 1;
    if (InputManager.isHeld('up')) dy -= 1;
    if (InputManager.isHeld('down')) dy += 1;

    if (dx !== 0 || dy !== 0) {
      // Manual input overrides any mouse walk target
      this.walkTarget = null;
      this.pendingLocationTrigger = null;
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    } else if (this.walkTarget) {
      const toX = this.walkTarget.x - this.playerX;
      const toY = this.walkTarget.y - this.playerY;
      const dist = Math.hypot(toX, toY);
      if (dist <= 10) {
        this.playerX = this.walkTarget.x;
        this.playerY = this.walkTarget.y;
        this.walkTarget = null;
        if (this.pendingLocationTrigger) {
          const triggerLoc = this.pendingLocationTrigger;
          this.pendingLocationTrigger = null;
          this._enterLocation(triggerLoc);
          return;
        }
      } else {
        dx = toX / dist;
        dy = toY / dist;
      }
    }

    const moveSpeed = 235;
    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      this.playerX += dx * moveSpeed * safeDt;
      this.playerY += dy * moveSpeed * safeDt;

      // Clamp player within the sandy beach perimeter of Puppy Island
      this.playerX = Math.max(115, Math.min(845, this.playerX));
      this.playerY = Math.max(125, Math.min(505, this.playerY));

      if (Math.abs(dx) > 0.15) {
        this.playerFacing = dx < 0 ? 'left' : 'right';
      } else {
        this.playerFacing = 'front';
      }

      // Record breadcrumb if moved at least 5px from head of trail
      const head = this.trail[0];
      if (!head || Math.hypot(this.playerX - head.x, this.playerY - head.y) >= 5.5) {
        this.trail.unshift({
          x: this.playerX,
          y: this.playerY,
          facing: this.playerFacing,
        });
        if (this.trail.length > 75) {
          this.trail.pop();
        }
      }

      this.stepTimer += safeDt;
      if (this.stepTimer >= 0.22) {
        this.stepTimer = 0;
        SoundFX.step?.();
      }
    } else {
      this.stepTimer = 0.18;
    }

    // Check proximity (within 95px of doorstep, center, or roof) to any of the 6 locations
    let nearest = null;
    let nearestDist = Infinity;
    for (const loc of OVERWORLD_LOCATIONS) {
      const dDoor = Math.hypot(this.playerX - loc.x, this.playerY - (loc.y + 22));
      const dCenter = Math.hypot(this.playerX - loc.x, this.playerY - loc.y);
      const dRoof = Math.hypot(this.playerX - loc.x, this.playerY - (loc.y - 24));
      const d = Math.min(dDoor, dCenter, dRoof);
      if (d <= 95 && d < nearestDist) {
        nearest = loc;
        nearestDist = d;
      }
    }

    this.activeLocation = nearest;
    if (nearest && this.lastActiveLocationId !== nearest.id) {
      this.lastActiveLocationId = nearest.id;
      SoundFX.bark?.(1.12);
      this.particles.emitHearts(nearest.x, nearest.y - 30, 5);
    } else if (!nearest) {
      this.lastActiveLocationId = null;
    }

    // Enter active location on Confirm / Bottom / Right button press
    const confirmPressed =
      InputManager.justPressed('confirm') ||
      InputManager.justPressed('bottom') ||
      InputManager.justPressed('right');

    if (confirmPressed) {
      if (this.activeLocation) {
        this._enterLocation(this.activeLocation);
        return;
      } else if (this.barkCooldown <= 0) {
        this._triggerHappyBark();
        this.barkCooldown = 0.35;
      }
    }

    this.particles.update(safeDt);
  }

  draw(ctx) {
    ctx.save();

    // 1. Sparkling Ocean Water Background
    this._drawOcean(ctx);

    // 2. Sandy Beach & Lush Green Island Base
    this._drawIslandTerrain(ctx);

    // 3. Winding Stone & Dirt Paths + Central Bone Plaza
    this._drawPathsAndPlaza(ctx);

    // 4. Flower Patches & Fire Hydrants
    this._drawFlowersAndHydrants(ctx);

    // 5. Depth-sorted entities: Trees, Buildings, Puppy Pack Followers, and Player Dog
    const renderList = [];

    for (const tree of TREES) {
      renderList.push({
        y: tree.y,
        draw: () => this._drawTree(ctx, tree),
      });
    }

    for (const loc of OVERWORLD_LOCATIONS) {
      renderList.push({
        y: loc.y + 18,
        draw: () => this._drawLocationBuilding(ctx, loc, this.activeLocation?.id === loc.id),
      });
    }

    // Main Player Pet
    renderList.push({
      y: this.playerY,
      draw: () => {
        // Player spotlight ring on grass
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(this.playerX, this.playerY + 32, 28, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        Sprites.drawDog(ctx, this.playerX, this.playerY, {
          breed: GameState.selectedBreed,
          hat: GameState.selectedHat,
          scale: 0.72,
          time: this.time,
          mood: this.isMoving ? 'walking' : 'excited',
          facing: this.playerFacing,
          flipProgress: this.flipProgress,
        });
      },
    });

    renderList.sort((a, b) => a.y - b.y);
    for (const item of renderList) {
      item.draw();
    }

    // 6. Celebration Particles
    this.particles.draw(ctx);

    // 7. Top HUD Bar
    this._drawTopHUD(ctx);

    // 8. Location Entry Banner (or Island Exploration Hint)
    if (this.activeLocation) {
      this._drawLocationBanner(ctx, this.activeLocation);
    } else {
      this._drawIslandFooterHint(ctx);
    }

    ctx.restore();
  }

  _drawOcean(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#0ea5e9');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Animated sparkling waves
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let row = 0; row < 10; row++) {
      const wy = 35 + row * 60;
      for (let col = 0; col < 8; col++) {
        const wx = ((col * 135 + row * 47 + Math.sin(this.time * 1.5 + row + col) * 18) % (CANVAS_W + 60)) - 30;
        ctx.beginPath();
        ctx.arc(wx, wy, 12, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(wx + 18, wy, 10, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    }
  }

  _drawIslandTerrain(ctx) {
    ctx.save();

    // Shallow turquoise water halo
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    drawRoundedRect(ctx, 42, 66, 876, 488, 130);
    ctx.fill();

    // Foam shoreline pulse
    const foamPulse = Math.sin(this.time * 2.5) * 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, 50 - foamPulse, 74 - foamPulse, 860 + foamPulse * 2, 472 + foamPulse * 2, 122);
    ctx.stroke();

    // Sandy Beach Perimeter
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 56, 80, 848, 460, 115);
    ctx.fill();
    ctx.stroke();

    // Lush Green Meadow Interior
    const grassGrad = ctx.createRadialGradient(480, 310, 60, 480, 310, 440);
    grassGrad.addColorStop(0, '#86efac');
    grassGrad.addColorStop(0.7, '#4ade80');
    grassGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = grassGrad;
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, 84, 102, 792, 416, 96);
    ctx.fill();
    ctx.stroke();

    // Decorative soft grass patches
    ctx.fillStyle = 'rgba(187, 247, 208, 0.45)';
    ctx.beginPath();
    ctx.ellipse(220, 210, 95, 55, 0, 0, Math.PI * 2);
    ctx.ellipse(760, 225, 95, 55, 0, 0, Math.PI * 2);
    ctx.ellipse(230, 430, 95, 55, 0, 0, Math.PI * 2);
    ctx.ellipse(775, 435, 95, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawPathsAndPlaza(ctx) {
    ctx.save();
    const hubX = 480;
    const hubY = 315;

    // Dirt/stone path border
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const loc of OVERWORLD_LOCATIONS) {
      // Path outer curb
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 38;
      ctx.beginPath();
      ctx.moveTo(hubX, hubY);
      ctx.quadraticCurveTo((hubX + loc.x) / 2, hubY, loc.x, loc.y + 24);
      ctx.stroke();

      // Warm sandy stone path fill
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 30;
      ctx.beginPath();
      ctx.moveTo(hubX, hubY);
      ctx.quadraticCurveTo((hubX + loc.x) / 2, hubY, loc.x, loc.y + 24);
      ctx.stroke();
    }

    // Central Puppy Plaza Circle
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(hubX, hubY, 72, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.ellipse(hubX, hubY, 58, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Bone emblem in the center of the plaza
    Sprites.drawBoneTreat(ctx, hubX, hubY - 4, 1.15, Math.sin(this.time * 1.5) * 0.08, '#fde047');

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PUPPY PLAZA', hubX, hubY + 24);

    // Stepping stones along paths
    ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
    const stones = [
      { x: 340, y: 265 },
      { x: 280, y: 245 },
      { x: 485, y: 240 },
      { x: 620, y: 270 },
      { x: 690, y: 255 },
      { x: 350, y: 375 },
      { x: 495, y: 390 },
      { x: 635, y: 380 },
    ];
    for (const s of stones) {
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, 12, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawFlowersAndHydrants(ctx) {
    ctx.save();

    for (const fp of FLOWER_PATCHES) {
      for (let i = 0; i < 3; i++) {
        const fx = fp.x + (i - 1) * 12;
        const fy = fp.y + (i % 2) * 7;
        // Petals
        ctx.fillStyle = fp.color;
        for (let a = 0; a < 5; a++) {
          const ang = this.time * 0.8 + (a * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(ang) * 4, fy + Math.sin(ang) * 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cute Red Fire Hydrants
    for (const h of HYDRANTS) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      drawRoundedRect(ctx, -6, -8, 12, 18, 3);
      ctx.fill();
      ctx.stroke();

      // Hydrant dome & side nozzles
      ctx.beginPath();
      ctx.arc(0, -8, 6, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-9, -4, 3, 5);
      ctx.fillRect(6, -4, 3, 5);
      ctx.restore();
    }

    ctx.restore();
  }

  _drawTree(ctx, tree) {
    ctx.save();
    ctx.translate(tree.x, tree.y);
    ctx.scale(tree.scale, tree.scale);

    const sway = Math.sin(this.time * 2.2 + tree.phase) * 0.06;

    // Ground shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(sway);

    // Trunk
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.8;
    drawRoundedRect(ctx, -6, -16, 12, 32, 4);
    ctx.fill();
    ctx.stroke();

    if (tree.kind === 'palm') {
      // Tropical island palm fronds
      ctx.fillStyle = '#16a34a';
      const angles = [-2.4, -1.7, -0.9, -0.2, 0.5];
      for (const ang of angles) {
        ctx.save();
        ctx.translate(0, -18);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.ellipse(16, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      // Coconuts
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(-4, -15, 4, 0, Math.PI * 2);
      ctx.arc(4, -15, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Puffy cartoon oak tree canopy
      const puffs = [
        { x: -14, y: -22, r: 15, c: '#16a34a' },
        { x: 14, y: -22, r: 15, c: '#16a34a' },
        { x: 0, y: -32, r: 18, c: '#22c55e' },
      ];
      for (const p of puffs) {
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  _drawLocationBuilding(ctx, loc, isHighlighted) {
    ctx.save();
    ctx.translate(loc.x, loc.y);

    const pulse = isHighlighted ? 1.05 + Math.sin(this.time * 8) * 0.03 : 1.0;
    ctx.scale(pulse, pulse);

    // Highlight glow ring on the ground when player is near
    if (isHighlighted) {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.38)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 18, 72, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Building drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 26, 58, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    const outline = '#1e293b';
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3.2;
    ctx.lineJoin = 'round';

    if (loc.type === 'bakery') {
      // 2-story Double-Decker Bakery!
      ctx.fillStyle = loc.secondaryColor;
      drawRoundedRect(ctx, -48, -22, 96, 46, 10);
      ctx.fill();
      ctx.stroke();

      // Upper deck
      ctx.fillStyle = '#ddd6fe';
      drawRoundedRect(ctx, -38, -56, 76, 36, 10);
      ctx.fill();
      ctx.stroke();

      // Royal purple & gold striped awning
      this._drawStripedAwning(ctx, -52, -26, 104, 16, loc.color, '#facc15');
      this._drawStripedAwning(ctx, -42, -60, 84, 14, loc.color, '#facc15');

      // Giant golden bone sign on roof
      Sprites.drawBoneTreat(ctx, 0, -70, 0.9, 0, '#facc15');
    } else if (loc.type === 'frisbee' || loc.type === 'munchers') {
      // Open-air Park Pavilion with wooden posts & festive banner roof
      ctx.fillStyle = '#fde68a';
      drawRoundedRect(ctx, -48, -6, 96, 30, 12);
      ctx.fill();
      ctx.stroke();

      // Wooden pillars
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-40, -38, 8, 52);
      ctx.strokeRect(-40, -38, 8, 52);
      ctx.fillRect(32, -38, 8, 52);
      ctx.strokeRect(32, -38, 8, 52);

      // Pavilion pitched roof
      ctx.fillStyle = loc.color;
      ctx.beginPath();
      ctx.moveTo(-56, -34);
      ctx.lineTo(0, -64);
      ctx.lineTo(56, -34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (loc.type === 'frisbee') {
        // Spinning Frisbee emblem on roof
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(0, -47, 18, 7, Math.sin(this.time * 3) * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Crossed Bone emblem on roof
        Sprites.drawBoneTreat(ctx, 0, -47, 0.85, 0.15, '#fef08a');
      }
    } else {
      // Cozy Cafe / Beach Barkery / Boutique Shopfront
      ctx.fillStyle = loc.secondaryColor;
      drawRoundedRect(ctx, -46, -24, 92, 48, 10);
      ctx.fill();
      ctx.stroke();

      // Pitched roof behind awning
      ctx.fillStyle = loc.roofColor;
      ctx.beginPath();
      ctx.moveTo(-52, -22);
      ctx.lineTo(0, -54);
      ctx.lineTo(52, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Striped cafe awning
      this._drawStripedAwning(ctx, -50, -26, 100, 16, loc.color, '#ffffff');

      // Roof icon badge
      if (loc.type === 'boutique') {
        // Sparkly Crown emblem on Boutique roof
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-12, -46);
        ctx.lineTo(-14, -60);
        ctx.lineTo(-5, -53);
        ctx.lineTo(0, -64);
        ctx.lineTo(5, -53);
        ctx.lineTo(14, -60);
        ctx.lineTo(12, -46);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        Sprites.drawBoneTreat(ctx, 0, -48, 0.85, 0, '#fef08a');
      }
    }

    // Arched doorway & windows (for buildings)
    if (loc.type !== 'frisbee' && loc.type !== 'munchers') {
      ctx.fillStyle = '#78350f';
      drawRoundedRect(ctx, -11, -2, 22, 26, 8);
      ctx.fill();
      ctx.stroke();

      // Cute shop windows
      ctx.fillStyle = '#bae6fd';
      drawRoundedRect(ctx, -36, -6, 18, 16, 4);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 18, -6, 18, 16, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      // Park gate welcome arch
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Floating Nameplate & Earned Stars pill above building
    const hasStars = loc.id in (GameState.parkStars || {});
    const stars = hasStars ? Math.max(0, Math.min(3, GameState.parkStars[loc.id] || 0)) : null;

    const pillW = 148;
    const pillH = hasStars ? 40 : 26;
    const pillY = loc.type === 'bakery' ? -116 : -100;

    ctx.fillStyle = isHighlighted ? '#fef9c3' : 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = isHighlighted ? '#eab308' : loc.color;
    ctx.lineWidth = isHighlighted ? 3.5 : 2.5;
    drawRoundedRect(ctx, -pillW / 2, pillY, pillW, pillH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortName = loc.name === 'Big Dog Double-Decker Bakery' ? 'Big Dog Bakery' : loc.name;
    ctx.fillText(shortName, 0, pillY + 13);

    if (hasStars) {
      const starStr = [0, 1, 2].map((i) => (i < stars ? '⭐' : '☆')).join(' ');
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = stars > 0 ? '#d97706' : '#94a3b8';
      ctx.fillText(starStr, 0, pillY + 29);
    }

    ctx.restore();
  }

  _drawStripedAwning(ctx, x, y, w, h, colorA, colorB) {
    const stripes = 6;
    const sw = w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? colorA : colorB;
      ctx.beginPath();
      ctx.rect(x + i * sw, y, sw, h);
      ctx.fill();
      ctx.stroke();
    }
  }

  _drawTopHUD(ctx) {
    ctx.save();

    // Top bar container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, 12, 8, CANVAS_W - 24, 44, 16);
    ctx.fill();
    ctx.stroke();

    // 1. Golden Bone Treats Counter (Left)
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, 20, 13, 190, 34, 12);
    ctx.fill();
    ctx.stroke();

    Sprites.drawBoneTreat(ctx, 46, 30, 0.78, -0.15, '#fde047');
    ctx.fillStyle = '#78350f';
    ctx.font = '900 20px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${GameState.treats}`, 74, 31);

    // 2. Active Pet & Closet Gear Name (Center)
    const breedObj = DOG_BREEDS[GameState.selectedBreed] || DOG_BREEDS[0];
    const eqGear = GameState.getEquippedGear(GameState.selectedBreed);
    const petEmoji = GameState.theme === 'cat' ? '🐱' : '🐶';
    const gearSuffix = eqGear.length > 0 ? ` • 👑 ${eqGear.length} Gear` : '';

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${petEmoji} ${breedObj.name}${gearSuffix}`, 410, 30);

    // 3. Controller Indicator & Button Label Style Switcher (Right)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = InputManager.gamepadConnected ? '#4ade80' : '#94a3b8';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 605, 13, 336, 34, 12);
    ctx.fill();
    ctx.stroke();

    const icon = InputManager.gamepadConnected ? '🎮 8BitDo' : '⌨️ Keys';
    const styleLabel = (GameState.controllerStyle || 'snes').toUpperCase();
    const mappingHint = styleLabel === 'SNES' ? '(X/Y/B/A)' : '(Y/X/A/B)';

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `${icon} | [Select / Tab] Labels: ${styleLabel} ${mappingHint}`,
      773,
      30
    );

    ctx.restore();
  }

  _drawLocationBanner(ctx, loc) {
    ctx.save();

    const bannerW = 580;
    const bannerH = 84;
    const bx = (CANVAS_W - bannerW) / 2;
    const by = CANVAS_H - bannerH - 10;

    // Drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    drawRoundedRect(ctx, bx + 4, by + 5, bannerW, bannerH, 22);
    ctx.fill();

    // Cheerful card background
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = loc.color;
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, bx, by, bannerW, bannerH, 22);
    ctx.fill();
    ctx.stroke();

    // Location Title & Stars
    const hasStars = loc.id in (GameState.parkStars || {});
    const stars = hasStars ? Math.max(0, Math.min(3, GameState.parkStars[loc.id] || 0)) : 0;
    const starText = hasStars ? `  ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}` : '  🎀';

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${loc.name}${starText}`, CANVAS_W / 2, by + 24);

    // Subtitle
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.fillText(loc.subtitle, CANVAS_W / 2, by + 46);

    // Prompt pill
    const pulse = 1 + Math.sin(this.time * 8) * 0.03;
    ctx.save();
    ctx.translate(CANVAS_W / 2, by + 68);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = loc.color;
    drawRoundedRect(ctx, -175, -11, 350, 22, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
    ctx.fillText('Press (A) / (B) / SPACE or Click to Enter!', 0, 1);
    ctx.restore();

    ctx.restore();
  }

  _drawIslandFooterHint(ctx) {
    ctx.save();
    const w = 520;
    const h = 34;
    const x = (CANVAS_W - w) / 2;
    const y = CANVAS_H - h - 10;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef9c3';
    ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '🐾 Walk with D-Pad / Stick / Arrows • Visit any Cafe, Park, or Boutique!',
      CANVAS_W / 2,
      y + h / 2
    );
    ctx.restore();
  }
}

export default OverworldScene;
