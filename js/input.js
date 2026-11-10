import { GameState } from './state.js';

const STICK_DEADZONE = 0.4;
const GRID_REPEAT_MS = 220;

const SNES_LABELS = {
  top: { label: 'X', color: '#3b82f6' },
  left: { label: 'Y', color: '#10b981' },
  bottom: { label: 'B', color: '#f59e0b' },
  right: { label: 'A', color: '#ef4444' },
};

const XBOX_LABELS = {
  top: { label: 'Y', color: '#f59e0b' },
  left: { label: 'X', color: '#3b82f6' },
  bottom: { label: 'A', color: '#10b981' },
  right: { label: 'B', color: '#ef4444' },
};

class InputController {
  constructor() {
    this.gamepadConnected = false;
    this.gamepadName = '';
    this.diamondMode = true;
    this.canvas = null;

    this.keysDown = new Set();
    this.pendingClicks = new Set();
    this.clickZones = new Map();

    this.currState = {};
    this.prevState = {};
    this.currMove = { up: false, down: false, left: false, right: false };
    this.prevMove = { up: false, down: false, left: false, right: false };

    this.moveRepeatTimer = { up: 0, down: 0, left: 0, right: 0 };
    this.movedThisFrame = { up: false, down: false, left: false, right: false };

    this.lastUpdateTime = performance.now();
    this._initialized = false;

    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init(canvas = null) {
    if (canvas) {
      this.canvas = canvas;
    }
    if (this._initialized || typeof window === 'undefined') {
      return;
    }
    this._initialized = true;

    window.addEventListener('keydown', (e) => {
      this.keysDown.add(e.code);
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysDown.clear();
    });

    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
      this.gamepadName = e.gamepad?.id || 'Gamepad';
    });

    window.addEventListener('gamepaddisconnected', () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const active = Array.from(gps).find((g) => g && g.connected);
      this.gamepadConnected = Boolean(active);
      this.gamepadName = active ? active.id : '';
    });

    window.addEventListener('pointerdown', (e) => {
      this._handlePointerDown(e);
    });

    window.addEventListener('pointermove', (e) => {
      this._handlePointerMove(e);
    });
  }

  setDiamondMode(enabled) {
    this.diamondMode = Boolean(enabled);
  }

  registerClickZone(id, x, y, w, h, callback = null) {
    if (!id) return;
    this.clickZones.set(id, { id, x, y, w, h, callback });
  }

  clearClickZones() {
    this.clickZones.clear();
  }

  _getCanvasCoords(clientX, clientY) {
    const canvas = this.canvas || document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      canvas,
    };
  }

  _handlePointerDown(e) {
    if (this.clickZones.size === 0) return;
    const pos = this._getCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;

    // Iterate in reverse insertion order so topmost UI zones take priority.
    const zones = Array.from(this.clickZones.values()).reverse();
    for (const zone of zones) {
      if (
        pos.x >= zone.x &&
        pos.x <= zone.x + zone.w &&
        pos.y >= zone.y &&
        pos.y <= zone.y + zone.h
      ) {
        this.pendingClicks.add(zone.id);
        if (typeof zone.callback === 'function') {
          zone.callback(zone.id, pos.x, pos.y);
        }
        break;
      }
    }
  }

  _handlePointerMove(e) {
    if (this.clickZones.size === 0) return;
    const pos = this._getCanvasCoords(e.clientX, e.clientY);
    if (!pos) return;

    let hovering = false;
    for (const zone of this.clickZones.values()) {
      if (
        pos.x >= zone.x &&
        pos.x <= zone.x + zone.w &&
        pos.y >= zone.y &&
        pos.y <= zone.y + zone.h
      ) {
        hovering = true;
        break;
      }
    }
    pos.canvas.style.cursor = hovering ? 'pointer' : 'default';
  }

  _getActiveGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return null;
    }
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        return gp;
      }
    }
    return null;
  }

  _isButtonPressed(gp, index) {
    if (!gp || !gp.buttons || index >= gp.buttons.length) return false;
    const btn = gp.buttons[index];
    return typeof btn === 'object' ? Boolean(btn.pressed) : btn > 0.5;
  }

  update(dtMs) {
    const now = performance.now();
    const elapsedMs =
      typeof dtMs === 'number' && dtMs > 0
        ? dtMs < 2
          ? dtMs * 1000
          : dtMs
        : Math.min(100, Math.max(0, now - this.lastUpdateTime));
    this.lastUpdateTime = now;

    this.prevState = { ...this.currState };
    this.prevMove = { ...this.currMove };

    const gp = this._getActiveGamepad();
    this.gamepadConnected = Boolean(gp);
    this.gamepadName = gp ? gp.id : '';

    // Movement directions:
    // - Top-left D-pad / Left Stick (axes 0..1)
    // - Bottom-left D-pad HAT on 8BitDo Lite / Pro (axes 6..7)
    // - Standard D-pad buttons (12..15), Arrows, WASD
    const stickX = gp && gp.axes && gp.axes.length > 0 ? gp.axes[0] : 0;
    const stickY = gp && gp.axes && gp.axes.length > 1 ? gp.axes[1] : 0;
    const hatX = gp && gp.axes && gp.axes.length > 6 ? gp.axes[6] : 0;
    const hatY = gp && gp.axes && gp.axes.length > 7 ? gp.axes[7] : 0;

    const moveUp =
      this._isButtonPressed(gp, 12) ||
      stickY < -STICK_DEADZONE ||
      hatY < -STICK_DEADZONE ||
      this.keysDown.has('ArrowUp') ||
      this.keysDown.has('KeyW');

    const moveDown =
      this._isButtonPressed(gp, 13) ||
      stickY > STICK_DEADZONE ||
      hatY > STICK_DEADZONE ||
      this.keysDown.has('ArrowDown') ||
      this.keysDown.has('KeyS');

    const moveLeft =
      this._isButtonPressed(gp, 14) ||
      stickX < -STICK_DEADZONE ||
      hatX < -STICK_DEADZONE ||
      this.keysDown.has('ArrowLeft') ||
      this.keysDown.has('KeyA');

    const moveRight =
      this._isButtonPressed(gp, 15) ||
      stickX > STICK_DEADZONE ||
      hatX > STICK_DEADZONE ||
      this.keysDown.has('ArrowRight') ||
      this.keysDown.has('KeyD');

    this.currMove = {
      up: moveUp,
      down: moveDown,
      left: moveLeft,
      right: moveRight,
    };

    // Grid movement repeat logic: triggers on initial press + every 220ms if held.
    for (const dir of ['up', 'down', 'left', 'right']) {
      if (this.currMove[dir]) {
        if (!this.prevMove[dir]) {
          this.movedThisFrame[dir] = true;
          this.moveRepeatTimer[dir] = 0;
        } else {
          this.moveRepeatTimer[dir] += elapsedMs;
          if (this.moveRepeatTimer[dir] >= GRID_REPEAT_MS) {
            this.moveRepeatTimer[dir] -= GRID_REPEAT_MS;
            this.movedThisFrame[dir] = true;
          } else {
            this.movedThisFrame[dir] = false;
          }
        }
      } else {
        this.moveRepeatTimer[dir] = 0;
        this.movedThisFrame[dir] = false;
      }
    }

    // 8BitDo Lite / 8BitDo SNES layout vs Xbox layout:
    // On 8BitDo controllers (Linux HID / D-input):
    //   buttons[0] = Physical A (Right / East)
    //   buttons[1] = Physical B (Bottom / South)
    //   buttons[2] = Unused (C gap)
    //   buttons[3] = Physical X (Top / North)
    //   buttons[4] = Physical Y (Left / West)
    //   buttons[6] = L, buttons[7] = R, buttons[10] = Select, buttons[11] = Start
    const isXboxStyle = (GameState?.controllerStyle || 'snes') === 'xbox' && gp?.mapping === 'standard';
    const gpTop = this._isButtonPressed(gp, 3);
    const gpLeft = this._isButtonPressed(gp, 4) || this._isButtonPressed(gp, 2);
    const gpBottom = isXboxStyle ? this._isButtonPressed(gp, 0) : this._isButtonPressed(gp, 1);
    const gpRight = isXboxStyle ? this._isButtonPressed(gp, 1) : this._isButtonPressed(gp, 0);

    const diamondTop =
      gpTop ||
      this.keysDown.has('KeyI') ||
      this.keysDown.has('Digit1') ||
      this.keysDown.has('Numpad8') ||
      (this.diamondMode &&
        (this.keysDown.has('KeyW') ||
          this.keysDown.has('ArrowUp') ||
          this._isButtonPressed(gp, 12) ||
          hatY < -STICK_DEADZONE)) ||
      this.pendingClicks.has('top');

    const diamondLeft =
      gpLeft ||
      this.keysDown.has('KeyJ') ||
      this.keysDown.has('Digit2') ||
      this.keysDown.has('Numpad4') ||
      (this.diamondMode &&
        (this.keysDown.has('KeyA') ||
          this.keysDown.has('ArrowLeft') ||
          this._isButtonPressed(gp, 14) ||
          hatX < -STICK_DEADZONE)) ||
      this.pendingClicks.has('left');

    const diamondBottom =
      gpBottom ||
      this.keysDown.has('KeyK') ||
      this.keysDown.has('Digit3') ||
      this.keysDown.has('Numpad2') ||
      (this.diamondMode &&
        (this.keysDown.has('KeyS') ||
          this.keysDown.has('ArrowDown') ||
          this._isButtonPressed(gp, 13) ||
          hatY > STICK_DEADZONE)) ||
      this.pendingClicks.has('bottom');

    const diamondRight =
      gpRight ||
      this.keysDown.has('KeyL') ||
      this.keysDown.has('Digit4') ||
      this.keysDown.has('Numpad6') ||
      (this.diamondMode &&
        (this.keysDown.has('KeyD') ||
          this.keysDown.has('ArrowRight') ||
          this._isButtonPressed(gp, 15) ||
          hatX > STICK_DEADZONE)) ||
      this.pendingClicks.has('right');

    const confirm =
      this._isButtonPressed(gp, 0) ||
      this._isButtonPressed(gp, 1) ||
      this._isButtonPressed(gp, 9) ||
      this._isButtonPressed(gp, 11) ||
      this.keysDown.has('Space') ||
      this.keysDown.has('Enter') ||
      this.keysDown.has('NumpadEnter') ||
      this.pendingClicks.has('confirm');

    const cancel =
      this._isButtonPressed(gp, 8) ||
      this._isButtonPressed(gp, 10) ||
      this.keysDown.has('Escape') ||
      this.keysDown.has('Backspace') ||
      this.pendingClicks.has('cancel');

    const start =
      this._isButtonPressed(gp, 9) ||
      this._isButtonPressed(gp, 11) ||
      this.keysDown.has('Enter') ||
      this.keysDown.has('NumpadEnter') ||
      this.pendingClicks.has('start');

    const select =
      this._isButtonPressed(gp, 8) ||
      this._isButtonPressed(gp, 10) ||
      this.keysDown.has('Tab') ||
      this.pendingClicks.has('select');

    const shoulderL =
      this._isButtonPressed(gp, 6) ||
      this.keysDown.has('KeyQ') ||
      this.keysDown.has('BracketLeft') ||
      this.pendingClicks.has('L');

    const shoulderR =
      this._isButtonPressed(gp, 7) ||
      this._isButtonPressed(gp, 5) ||
      this.keysDown.has('KeyE') ||
      this.keysDown.has('BracketRight') ||
      this.pendingClicks.has('R');

    const nextState = {
      top: diamondTop,
      left: diamondLeft,
      bottom: diamondBottom,
      right: diamondRight,
      up: moveUp || this.pendingClicks.has('up'),
      down: moveDown || this.pendingClicks.has('down'),
      dpad_left: moveLeft,
      dpad_right: moveRight,
      confirm,
      cancel,
      start,
      select,
      L: shoulderL,
      R: shoulderR,
      l: shoulderL,
      r: shoulderR,
    };

    for (const clickedId of this.pendingClicks) {
      nextState[clickedId] = true;
    }

    this.currState = nextState;
    this.pendingClicks.clear();
  }

  justPressed(action) {
    return Boolean(this.currState[action] && !this.prevState[action]);
  }

  isHeld(direction) {
    if (direction in this.currMove) {
      return Boolean(this.currMove[direction]);
    }
    return Boolean(this.currState[direction]);
  }

  justMoved(dir) {
    return Boolean(this.movedThisFrame[dir]);
  }

  getDiamondLabels() {
    const style = GameState?.controllerStyle || 'snes';
    if (style === 'xbox') {
      return {
        top: { ...XBOX_LABELS.top },
        left: { ...XBOX_LABELS.left },
        bottom: { ...XBOX_LABELS.bottom },
        right: { ...XBOX_LABELS.right },
      };
    }
    return {
      top: { ...SNES_LABELS.top },
      left: { ...SNES_LABELS.left },
      bottom: { ...SNES_LABELS.bottom },
      right: { ...SNES_LABELS.right },
    };
  }
}

export const InputManager = new InputController();
export default InputManager;
