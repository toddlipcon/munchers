import { GameState } from '../state.js';
import { InputManager } from '../input.js';
import { SoundFX } from '../audio.js';
import { Sprites, ParticleSystem } from '../sprites.js';
import {
  DOG_PETS,
  CAT_PETS,
  DOG_GEAR,
  CAT_GEAR,
  GEAR_BY_ID,
  renderPetSvg,
  renderTreatIconSvg,
} from '../pet_avatars.js';

const CANVAS_W = 960;
const CANVAS_H = 600;

export const SHOP_SLOTS = [
  { id: 'head', label: 'Hats', none: 'No Hat' },
  { id: 'wig', label: 'Wigs', none: 'No Wig' },
  { id: 'band', label: 'Headbands', none: 'No Headband' },
  { id: 'eyes', label: 'Glasses', none: 'No Glasses' },
  { id: 'neck', label: 'Neck', none: 'Nothing' },
  { id: 'body', label: 'Outfits', none: 'No Outfit' },
  { id: 'back', label: 'Wings & Bags', none: 'Nothing' },
  { id: 'hand', label: 'Swords', none: 'No Sword' },
  { id: 'tail', label: 'Tails', none: 'No Tail' },
];

export class BoutiqueScene {
  constructor(arg1 = {}, arg2 = {}) {
    this.game = null;
    this.onExit = null;

    if (typeof arg1 === 'function') {
      this.onExit = arg1;
    } else if (typeof arg2 === 'function') {
      this.game = arg1;
      this.onExit = arg2;
    } else if (arg1 && typeof arg1 === 'object') {
      if (
        typeof arg1.onExit === 'function' ||
        typeof arg1.onBack === 'function' ||
        typeof arg1.onComplete === 'function'
      ) {
        this.onExit = arg1.onExit || arg1.onBack || arg1.onComplete;
      }
      if (arg1.game) {
        this.game = arg1.game;
      }
      if (arg2 && typeof arg2 === 'object' && typeof arg2.onExit === 'function') {
        this.onExit = arg2.onExit;
      }
    }

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    this.tab = params?.get('tab') === 'pets' ? 'pets' : 'closet'; // 'closet' | 'pets'
    this.slot = params?.get('slot') || 'head';
    this.cursorIndex = 0;
    this.wiggleId = null;
    this.wiggleTimeout = null;
    this.time = 0;
    this.particles = new ParticleSystem();
    this.modalEl = null;
  }

  enter() {
    InputManager.setDiamondMode(false);
    InputManager.clearClickZones();
    this.cursorIndex = 0;
    this._mountModal();
    if (this._unsubscribeState) this._unsubscribeState();
    this._unsubscribeState = GameState.onChange(() => {
      if (this.modalEl) this._renderModalContent();
    });
    SoundFX.bark?.(1.12);
  }

  exit() {
    if (this._unsubscribeState) {
      this._unsubscribeState();
      this._unsubscribeState = null;
    }
    this._unmountModal();
  }

  _getThemeCatalog() {
    const isCat = GameState.theme === 'cat';
    return {
      isCat,
      pets: isCat ? CAT_PETS : DOG_PETS,
      gear: isCat ? CAT_GEAR : DOG_GEAR,
      adoptLabel: isCat ? '🐱 Adopt a Kitty' : '🐶 Adopt a Pup',
      petActiveLabel: isCat ? 'My Kitty' : 'My Pup',
      petPickLabel: 'Pick me!',
    };
  }

  _getPreviewGear(gearId) {
    const equipped = GameState.getEquippedGear(GameState.selectedBreed);
    if (equipped.includes(gearId)) return equipped;
    const slot = GEAR_BY_ID[gearId]?.slot;
    return [
      ...equipped.filter((e) => GEAR_BY_ID[e]?.slot !== slot),
      gearId,
    ];
  }

  _triggerNotEnough(id) {
    SoundFX.oops?.();
    this.wiggleId = id;
    const card = this.modalEl?.querySelector(`[data-card-id="${id}"]`);
    if (card) {
      card.classList.remove('shop-wiggle');
      void card.offsetWidth;
      card.classList.add('shop-wiggle');
    }
    if (this.wiggleTimeout) clearTimeout(this.wiggleTimeout);
    this.wiggleTimeout = setTimeout(() => {
      this.wiggleId = null;
    }, 500);
  }

  _mountModal() {
    this._unmountModal();
    const stage = document.querySelector('.canvas-stage') || document.body;
    const modal = document.createElement('div');
    modal.id = 'treat-shop-modal';
    modal.className = 'treat-shop-backdrop';
    stage.appendChild(modal);
    this.modalEl = modal;
    this._renderModalContent();
  }

  _unmountModal() {
    if (this.wiggleTimeout) {
      clearTimeout(this.wiggleTimeout);
      this.wiggleTimeout = null;
    }
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
  }

  _getCurrentCardsList() {
    const { pets, gear } = this._getThemeCatalog();
    if (this.tab === 'pets') {
      return pets.map((p) => ({ type: 'pet', item: p, id: p.id }));
    }
    const slotGear = gear.filter((g) => g.slot === this.slot);
    return [
      { type: 'none', id: `none_${this.slot}`, slot: this.slot },
      ...slotGear.map((g) => ({ type: 'gear', item: g, id: g.id })),
    ];
  }

  _activateCard(cardEntry) {
    if (!cardEntry) return;
    if (cardEntry.type === 'none') {
      SoundFX.step?.();
      GameState.clearGear(this.slot);
      this._renderModalContent();
      return;
    }

    if (cardEntry.type === 'gear') {
      const g = cardEntry.item;
      const owned = GameState.unlockedGear.includes(g.id);
      if (owned) {
        SoundFX.step?.();
        GameState.toggleGear(g.id);
        this._renderModalContent();
      } else if (GameState.buyGear(g.id, g.cost)) {
        SoundFX.zoomies?.();
        this._renderModalContent();
      } else {
        this._triggerNotEnough(g.id);
      }
      return;
    }

    if (cardEntry.type === 'pet') {
      const d = cardEntry.item;
      const owned = GameState.unlockedBreeds.includes(d.id);
      if (owned) {
        GameState.selectPet(d.id);
        SoundFX.bark?.(1.1);
        this._renderModalContent();
      } else if (GameState.buyPet(d.id, d.cost)) {
        SoundFX.zoomies?.();
        SoundFX.bark?.(1.18);
        this._renderModalContent();
      } else {
        this._triggerNotEnough(d.id);
      }
    }
  }

  _renderRarityBadgeHtml(cost) {
    if (cost < 120) return '';
    const superRare = cost >= 250;
    return `
      <div class="shop-rarity-badge ${superRare ? 'super-rare' : 'rare'}">
        ✨ ${superRare ? 'Super Rare' : 'Rare'}
      </div>
    `;
  }

  _renderPriceTagHtml({ owned, on, cost, canAfford, ownedLabel, treatSvg }) {
    if (owned) {
      return `
        <div class="shop-price-tag ${on ? 'tag-wearing' : 'tag-owned'}">
          ${on ? '✓ ' : ''}${ownedLabel}
        </div>
      `;
    }
    return `
      <div class="shop-price-tag ${canAfford ? 'tag-affordable' : 'tag-locked'}">
        ${!canAfford ? '🔒 ' : ''}
        <span class="shop-treat-inline">${treatSvg}</span>
        <span>${cost}</span>
      </div>
    `;
  }

  _renderModalContent() {
    if (!this.modalEl) return;

    const { isCat, pets, gear, adoptLabel, petActiveLabel, petPickLabel } =
      this._getThemeCatalog();
    const activePetId = GameState.selectedBreed;
    const equipped = GameState.getEquippedGear(activePetId);
    const bareInSlot = !equipped.some((e) => GEAR_BY_ID[e]?.slot === this.slot);
    const treatSvgLarge = renderTreatIconSvg(GameState.theme, 32);
    const treatSvgSmall = renderTreatIconSvg(GameState.theme, 24);

    const cardsList = this._getCurrentCardsList();
    if (this.cursorIndex >= cardsList.length) {
      this.cursorIndex = Math.max(0, cardsList.length - 1);
    }

    // Preserve scroll top across re-renders
    const prevGrid = this.modalEl.querySelector('.shop-grid');
    const prevScrollTop = prevGrid ? prevGrid.scrollTop : 0;

    let slotPillsHtml = '';
    if (this.tab === 'closet') {
      const pills = SHOP_SLOTS.map((sl) => {
        const count = gear.filter((g) => g.slot === sl.id).length;
        const activeClass = this.slot === sl.id ? 'active' : '';
        return `
          <button type="button" class="shop-slot-pill ${activeClass}" data-slot="${sl.id}">
            ${sl.label} <span class="slot-count">${count}</span>
          </button>
        `;
      }).join('');

      slotPillsHtml = `
        <div class="shop-slot-bar">
          ${pills}
          <button type="button" class="shop-clear-all-btn" id="shop-clear-all" ${
            equipped.length === 0 ? 'disabled' : ''
          }>
            👕 Take Everything Off
          </button>
        </div>
      `;
    }

    let gridCardsHtml = '';
    if (this.tab === 'closet') {
      const slotObj = SHOP_SLOTS.find((s) => s.id === this.slot) || SHOP_SLOTS[0];
      const bareGear = equipped.filter((e) => GEAR_BY_ID[e]?.slot !== this.slot);
      const bareSvg = renderPetSvg({
        theme: GameState.theme,
        breed: activePetId,
        gear: bareGear,
        mood: bareInSlot ? 'happy' : 'idle',
        size: 105,
      });
      const isFocused0 = this.cursorIndex === 0;

      gridCardsHtml += `
        <button type="button" class="shop-card ${bareInSlot ? 'card-active' : ''} ${
          isFocused0 ? 'card-focused' : ''
        }" data-card-index="0" data-card-id="none_${this.slot}">
          <div class="shop-avatar-wrap">
            ${bareSvg}
            <span class="shop-ban-badge">🚫</span>
          </div>
          <div class="shop-card-title">${slotObj.none}</div>
          ${this._renderPriceTagHtml({
            owned: true,
            on: bareInSlot,
            cost: 0,
            canAfford: true,
            ownedLabel: bareInSlot ? 'Wearing' : 'Put on',
            treatSvg: treatSvgSmall,
          })}
        </button>
      `;

      const slotGear = gear.filter((g) => g.slot === this.slot);
      slotGear.forEach((g, idx) => {
        const cardIdx = idx + 1;
        const owned = GameState.unlockedGear.includes(g.id);
        const on = equipped.includes(g.id);
        const isFocused = this.cursorIndex === cardIdx;
        const previewSvg = renderPetSvg({
          theme: GameState.theme,
          breed: activePetId,
          gear: this._getPreviewGear(g.id),
          mood: on ? 'happy' : 'idle',
          size: 105,
        });

        gridCardsHtml += `
          <button type="button" class="shop-card ${on ? 'card-active' : ''} ${
            isFocused ? 'card-focused' : ''
          }" data-card-index="${cardIdx}" data-card-id="${g.id}">
            ${this._renderRarityBadgeHtml(g.cost)}
            <div class="shop-avatar-wrap">
              ${previewSvg}
            </div>
            <div class="shop-card-title">${g.name}</div>
            ${this._renderPriceTagHtml({
              owned,
              on,
              cost: g.cost,
              canAfford: GameState.treats >= g.cost,
              ownedLabel: on ? 'Wearing' : 'Put on',
              treatSvg: treatSvgSmall,
            })}
          </button>
        `;
      });
    } else {
      pets.forEach((d, idx) => {
        const owned = GameState.unlockedBreeds.includes(d.id);
        const active = activePetId === d.id;
        const isFocused = this.cursorIndex === idx;
        const petGear = GameState.getEquippedGear(d.id);
        const petSvg = renderPetSvg({
          theme: GameState.theme,
          breed: d.id,
          gear: petGear,
          mood: active ? 'happy' : 'idle',
          size: 105,
        });

        gridCardsHtml += `
          <button type="button" class="shop-card ${active ? 'card-active' : ''} ${
            isFocused ? 'card-focused' : ''
          }" data-card-index="${idx}" data-card-id="${d.id}">
            ${this._renderRarityBadgeHtml(d.cost)}
            <div class="shop-avatar-wrap ${owned ? '' : 'pet-locked-preview'}">
              ${petSvg}
            </div>
            <div class="shop-card-title">${d.name}</div>
            <div class="shop-card-subtitle">${d.breed}</div>
            ${this._renderPriceTagHtml({
              owned,
              on: active,
              cost: d.cost,
              canAfford: GameState.treats >= d.cost,
              ownedLabel: active ? petActiveLabel : petPickLabel,
              treatSvg: treatSvgSmall,
            })}
          </button>
        `;
      });
    }

    this.modalEl.innerHTML = `
      <div class="treat-shop-dialog" role="dialog" aria-label="Treat Shop">
        <div class="shop-header-row">
          <button type="button" class="shop-tab-btn ${
            this.tab === 'closet' ? 'active' : ''
          }" data-tab="closet">
            👑 Closet (${gear.length})
          </button>
          <button type="button" class="shop-tab-btn ${
            this.tab === 'pets' ? 'active' : ''
          }" data-tab="pets">
            ${adoptLabel} (${pets.length})
          </button>
          <div class="shop-header-spacer"></div>
          <div class="shop-controller-hint">
            🕹️ D-Pad: Browse • (A) Buy/Wear • (X) Tab • (Y) Slot
          </div>
          <div class="shop-treats-pill" title="Earned Treats">
            <span class="shop-treat-inline">${treatSvgLarge}</span>
            <span class="shop-treats-count">${GameState.treats}</span>
          </div>
          <button type="button" class="shop-close-btn" id="shop-close-btn" aria-label="Close Shop">
            ✕
          </button>
        </div>

        ${slotPillsHtml}

        <div class="shop-grid">
          ${gridCardsHtml}
        </div>
      </div>
    `;

    const newGrid = this.modalEl.querySelector('.shop-grid');
    if (newGrid) {
      newGrid.scrollTop = prevScrollTop;
    }

    // Bind events
    this.modalEl.querySelectorAll('.shop-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTab = btn.getAttribute('data-tab');
        if (nextTab && nextTab !== this.tab) {
          this.tab = nextTab;
          this.cursorIndex = 0;
          SoundFX.step?.();
          this._renderModalContent();
        }
      });
    });

    this.modalEl.querySelectorAll('.shop-slot-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextSlot = btn.getAttribute('data-slot');
        if (nextSlot && nextSlot !== this.slot) {
          this.slot = nextSlot;
          this.cursorIndex = 0;
          SoundFX.step?.();
          this._renderModalContent();
        }
      });
    });

    const clearAllBtn = this.modalEl.querySelector('#shop-clear-all');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        SoundFX.step?.();
        GameState.clearGear();
        this._renderModalContent();
      });
    }

    const closeBtn = this.modalEl.querySelector('#shop-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._handleExit();
      });
    }

    this.modalEl.querySelectorAll('.shop-card').forEach((cardEl) => {
      cardEl.addEventListener('click', () => {
        const idx = Number(cardEl.getAttribute('data-card-index')) || 0;
        this.cursorIndex = idx;
        const list = this._getCurrentCardsList();
        this._activateCard(list[idx]);
      });
    });
  }

  _scrollFocusedCardIntoView() {
    if (!this.modalEl) return;
    const focused = this.modalEl.querySelector('.shop-card.card-focused');
    if (focused && typeof focused.scrollIntoView === 'function') {
      focused.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  _updateFocusClassOnly(prevIdx, nextIdx) {
    if (!this.modalEl) return;
    const prevEl = this.modalEl.querySelector(`[data-card-index="${prevIdx}"]`);
    if (prevEl) prevEl.classList.remove('card-focused');
    const nextEl = this.modalEl.querySelector(`[data-card-index="${nextIdx}"]`);
    if (nextEl) nextEl.classList.add('card-focused');
    this._scrollFocusedCardIntoView();
  }

  _handleExit() {
    SoundFX.bark?.(1.0);
    this._unmountModal();
    InputManager.clearClickZones();
    if (typeof this.onExit === 'function') {
      this.onExit();
      return;
    }
    if (this.game && typeof this.game.goToMap === 'function') {
      this.game.goToMap();
    }
  }

  update(dt) {
    const safeDt = Math.min(typeof dt === 'number' && dt > 0 ? dt : 0.016, 0.1);
    this.time += safeDt;

    if (!this.modalEl) {
      this._mountModal();
    }

    // Cancel / Back to Overworld (Esc, Backspace, Select)
    if (InputManager.justPressed('cancel') || InputManager.justPressed('select')) {
      this._handleExit();
      return;
    }

    // Top button (X / Key 1) toggles between Closet and Adopt a Pup/Kitty tabs
    if (InputManager.justPressed('top')) {
      this.tab = this.tab === 'closet' ? 'pets' : 'closet';
      this.cursorIndex = 0;
      SoundFX.step?.();
      this._renderModalContent();
      return;
    }

    // Left face button (Y / Key 2) cycles Closet slot categories
    if (InputManager.justPressed('left') && this.tab === 'closet') {
      const idx = SHOP_SLOTS.findIndex((s) => s.id === this.slot);
      const nextIdx = (idx + 1) % SHOP_SLOTS.length;
      this.slot = SHOP_SLOTS[nextIdx].id;
      this.cursorIndex = 0;
      SoundFX.step?.();
      this._renderModalContent();
      return;
    }

    const list = this._getCurrentCardsList();
    const total = list.length;
    if (total > 0) {
      const cols = 4;
      const prev = this.cursorIndex;
      if (InputManager.justMoved('right')) {
        this.cursorIndex = (this.cursorIndex + 1) % total;
      } else if (InputManager.justMoved('left')) {
        this.cursorIndex = (this.cursorIndex - 1 + total) % total;
      } else if (InputManager.justMoved('down')) {
        this.cursorIndex = Math.min(total - 1, this.cursorIndex + cols);
      } else if (InputManager.justMoved('up')) {
        this.cursorIndex = Math.max(0, this.cursorIndex - cols);
      }
      if (this.cursorIndex !== prev) {
        SoundFX.step?.();
        this._updateFocusClassOnly(prev, this.cursorIndex);
      }
    }

    // Confirm (A / B / Space / Enter) buys/equips/adopts the highlighted item
    if (
      InputManager.justPressed('bottom') ||
      InputManager.justPressed('right') ||
      InputManager.justPressed('confirm')
    ) {
      this._activateCard(list[this.cursorIndex]);
    }

    this.particles.update(safeDt);
  }

  draw(ctx) {
    // Draw a warm boutique background behind the modal overlay
    ctx.save();
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    for (let x = 0; x < CANVAS_W; x += 48) {
      ctx.fillRect(x, 0, 24, CANVAS_H);
    }
    this.particles.draw(ctx);
    ctx.restore();
  }
}
