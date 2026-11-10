import { GameState } from './state.js';
import { InputManager } from './input.js';
import { SoundFX } from './audio.js';
import { OverworldScene } from './overworld.js';
import { TreatCafeScene } from './modes/cafe.js';
import { BoardwalkScene } from './modes/boardwalk.js';
import { BigDogBakeryScene } from './modes/bakery.js';
import { FrisbeeParkScene } from './modes/frisbee.js';
import { MemoryScene } from './modes/memory.js';
import { BoneMunchersScene } from './modes/munchers.js';
import { BoutiqueScene } from './modes/boutique.js';

const CAT_TEXT_REPLACEMENTS = [
  [/PUPPY PLAZA/g, 'KITTY PLAZA'],
  [/Puppy Island/g, 'Kitty Island'],
  [/PUPPY/g, 'KITTY'],
  [/Puppy/g, 'Kitty'],
  [/puppy/g, 'kitty'],
  [/PUPS/g, 'KITTIES'],
  [/Pups/g, 'Kitties'],
  [/pups/g, 'kitties'],
  [/\bPUP\b/g, 'KITTY'],
  [/\bPup\b/g, 'Kitty'],
  [/\bpup\b/g, 'kitty'],
  [/Big Dog/g, 'Big Cat'],
  [/\bDOGS\b/g, 'CATS'],
  [/\bDogs\b/g, 'Cats'],
  [/\bdogs\b/g, 'cats'],
  [/\bDOG\b/g, 'CAT'],
  [/\bDog\b/g, 'Cat'],
  [/\bdog\b/g, 'cat'],
  [/Barkery/g, 'Purr-kery'],
  [/Bark & Bling/g, 'Purr & Bling'],
  [/Bone Diggers/g, 'Fish Finders'],
  [/DIG ALL BONES/g, 'CATCH ALL FISH'],
  [/Dig all bones/g, 'Catch all fish'],
  [/Dig Matching Bones/g, 'Catch Matching Fish'],
  [/\bBONES\b/g, 'FISH'],
  [/\bBones\b/g, 'Fish'],
  [/\bbones\b/g, 'fish'],
  [/\bBONE\b/g, 'FISH'],
  [/\bBone\b/g, 'Fish'],
  [/\bbone\b/g, 'fish'],
  [/Zoomies Frisbee Park/g, 'Kitty Pounce Park'],
  [/SUPER ZOOMIES/g, 'SUPER POUNCE'],
  [/Super Zoomies/g, 'Super Pounce'],
  [/ZOOMIES/g, 'POUNCE'],
  [/Zoomies/g, 'Pounce'],
  [/zoomies/g, 'pounce'],
  [/WOOF!/g, 'MEOW!'],
  [/ARF!/g, 'PURR!'],
  [/BARK!/g, 'MEW!'],
  [/YIP!/g, 'NYA!'],
  [/\bBark\b/g, 'Meow'],
  [/\bbark\b/g, 'meow'],
  [/🦴/g, '🐟'],
  [/🐶/g, '🐱'],
];

function formatCanvasTextForTheme(text) {
  const str = String(text ?? '');
  if (GameState.theme !== 'cat') return str;
  let out = str;
  for (const [pattern, replacement] of CAT_TEXT_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

class PuppyTreatAdventureApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 960;
    this.canvas.height = 600;

    // Automatically adapt all canvas text labels in Kitty Mode
    const origFillText = this.ctx.fillText.bind(this.ctx);
    const origStrokeText = this.ctx.strokeText.bind(this.ctx);
    this.ctx.fillText = (text, x, y, maxWidth) => {
      const formatted = formatCanvasTextForTheme(text);
      if (maxWidth !== undefined) return origFillText(formatted, x, y, maxWidth);
      return origFillText(formatted, x, y);
    };
    this.ctx.strokeText = (text, x, y, maxWidth) => {
      const formatted = formatCanvasTextForTheme(text);
      if (maxWidth !== undefined) return origStrokeText(formatted, x, y, maxWidth);
      return origStrokeText(formatted, x, y);
    };

    GameState.load();
    InputManager.init(this.canvas);

    this.currentScene = null;
    this.lastFrameTime = performance.now();

    this._bindGlobalUI();
    this._syncThemeHeaderUI();

    const params = new URLSearchParams(window.location.search);
    const startMode = params.get('mode');
    if (startMode) {
      this.switchScene({
        mode: startMode,
        tier: Number(params.get('tier')) || 1,
        difficulty: Number(params.get('difficulty')) || 1,
      });
    } else {
      this.goToMap();
    }

    requestAnimationFrame((ts) => this._loop(ts));
  }

  _syncThemeHeaderUI() {
    const isCat = GameState.theme === 'cat';
    const pawIcon = document.getElementById('brand-paw-icon');
    const heading = document.getElementById('brand-heading');
    const btnTheme = document.getElementById('btn-theme-toggle');

    if (pawIcon) pawIcon.textContent = isCat ? '🐱' : '🐶';
    if (heading) {
      heading.textContent = isCat
        ? 'Kitty Treat Cafe & Cat Island Adventure'
        : 'Puppy Treat Cafe & Dog Park Adventure';
    }
    if (btnTheme) {
      btnTheme.textContent = isCat ? '🐶 Pup Mode' : '🐱 Kitty Mode';
    }
  }

  _bindGlobalUI() {
    const unlockAudio = () => {
      SoundFX.init();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    const btnMap = document.getElementById('btn-island-map');
    if (btnMap) {
      btnMap.addEventListener('click', () => {
        SoundFX.init();
        SoundFX.step?.();
        this.goToMap();
      });
    }

    const btnShop = document.getElementById('btn-treat-shop');
    if (btnShop) {
      btnShop.addEventListener('click', () => {
        SoundFX.init();
        if (this.currentScene instanceof BoutiqueScene) {
          this.goToMap();
        } else {
          this.switchScene({ mode: 'boutique' });
        }
      });
    }

    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        SoundFX.init();
        GameState.toggleTheme();
        SoundFX.bark?.(1.1);
        this._syncThemeHeaderUI();
        if (this.currentScene instanceof BoutiqueScene) {
          this.currentScene.cursorIndex = 0;
          this.currentScene._renderModalContent();
        }
      });
    }

    const btnLayout = document.getElementById('btn-controller-style');
    if (btnLayout) {
      btnLayout.addEventListener('click', () => {
        SoundFX.init();
        const nextStyle = GameState.toggleControllerStyle();
        SoundFX.bark?.(1.15);
        this._updateFooterBar(nextStyle);
      });
    }

    const btnMute = document.getElementById('btn-mute');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        SoundFX.init();
        const isMuted = SoundFX.toggleMute();
        btnMute.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      });
    }

    const btnDifficulty = document.getElementById('btn-bakery-level');
    if (btnDifficulty) {
      this.bakeryDifficulty = 1;
      btnDifficulty.addEventListener('click', () => {
        this.bakeryDifficulty = this.bakeryDifficulty === 1 ? 2 : 1;
        btnDifficulty.textContent =
          this.bakeryDifficulty === 1
            ? '🎂 Bakery: Add (Lvl 1)'
            : '🎂 Bakery: Add + Subtract (Lvl 2)';
        if (this.currentScene instanceof BigDogBakeryScene) {
          this.switchScene({
            mode: 'bakery',
            difficulty: this.bakeryDifficulty,
            locationId: 'cafe_bakery',
          });
        }
      });
    }
  }

  _updateFooterBar() {
    const btnLayout = document.getElementById('btn-controller-style');
    if (btnLayout) {
      const isSnes = GameState.controllerStyle === 'snes';
      btnLayout.textContent = isSnes
        ? '🎮 8BitDo: SNES (X/Y/B/A)'
        : '🎮 8BitDo: Xbox (Y/X/A/B)';
    }

    const gpStatus = document.getElementById('gamepad-status');
    if (gpStatus) {
      if (InputManager.gamepadConnected) {
        gpStatus.textContent = '🟢 8BitDo / Controller Connected!';
        gpStatus.classList.add('connected');
      } else {
        gpStatus.textContent = '🕹️ Press any button on 8BitDo Controller (or use Keyboard / Mouse)';
        gpStatus.classList.remove('connected');
      }
    }
  }

  goToMap() {
    if (this.currentScene && typeof this.currentScene.exit === 'function') {
      this.currentScene.exit();
    }
    InputManager.clearClickZones();
    InputManager.setDiamondMode(false);
    const overworld = new OverworldScene({
      onSelectLocation: (trigger) => this.switchScene(trigger),
    });
    if (typeof overworld.enter === 'function') {
      overworld.enter();
    }
    this.currentScene = overworld;
  }

  switchScene(trigger) {
    if (!trigger) {
      this.goToMap();
      return;
    }

    if (this.currentScene && typeof this.currentScene.exit === 'function') {
      this.currentScene.exit();
    }

    SoundFX.init();
    InputManager.clearClickZones();

    const mode = typeof trigger === 'string' ? trigger : trigger.mode;
    const exitCallback = () => this.goToMap();

    if (mode === 'overworld' || mode === 'map') {
      this.goToMap();
      return;
    }

    if (mode === 'cafe') {
      InputManager.setDiamondMode(true);
      const scene = new TreatCafeScene({
        tier: trigger.tier || 1,
        locationId: trigger.locationId || 'cafe_sunny',
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }

    if (mode === 'boardwalk') {
      InputManager.setDiamondMode(true);
      const scene = new BoardwalkScene({
        locationId: trigger.locationId || 'cafe_beach',
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }

    if (mode === 'bakery') {
      InputManager.setDiamondMode(true);
      const scene = new BigDogBakeryScene({
        difficulty: this.bakeryDifficulty || trigger.difficulty || 1,
        locationId: trigger.locationId || 'cafe_bakery',
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }

    if (mode === 'frisbee') {
      InputManager.setDiamondMode(true);
      const scene = new FrisbeeParkScene({
        tier: trigger.tier || 2,
        parkId: trigger.locationId || 'park_frisbee',
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }

    if (mode === 'memory') {
      InputManager.setDiamondMode(true);
      const scene = new MemoryScene({
        locationId: trigger.locationId || 'park_memory',
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }

    if (mode === 'munchers') {
      InputManager.setDiamondMode(false);
      const scene = new BoneMunchersScene({
        tier: trigger.tier || 1,
        parkId: trigger.locationId || 'park_munchers',
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }

    if (mode === 'boutique' || mode === 'shop') {
      InputManager.setDiamondMode(false);
      const scene = new BoutiqueScene({
        onExit: exitCallback,
      });
      if (typeof scene.enter === 'function') scene.enter();
      this.currentScene = scene;
      return;
    }
  }

  _loop(timestamp) {
    const dt = Math.min(0.1, Math.max(0.001, (timestamp - this.lastFrameTime) / 1000));
    this.lastFrameTime = timestamp;

    InputManager.update(dt * 1000);
    if (InputManager.gamepadConnected) {
      SoundFX.init();
    }

    this._updateFooterBar();

    if (this.currentScene) {
      if (typeof this.currentScene.update === 'function') {
        this.currentScene.update(dt);
      }
      if (typeof this.currentScene.draw === 'function') {
        this.currentScene.draw(this.ctx, this.canvas);
      } else if (typeof this.currentScene.render === 'function') {
        this.currentScene.render(this.ctx, this.canvas);
      }
    }

    requestAnimationFrame((ts) => this._loop(ts));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.puppyApp = new PuppyTreatAdventureApp();
});
