import {
  DOG_PETS_BY_ID,
  CAT_PETS_BY_ID,
  GEAR_BY_ID,
  LEGACY_BREED_MAP,
  LEGACY_HAT_MAP,
} from './pet_avatars.js';

const LEGACY_STORAGE_KEY = 'puppy_treat_cafe_save_v1';
const LOCAL_CACHE_KEYS = {
  dog: 'pup_adventure_save_dog_v2',
  cat: 'kitty_adventure_save_cat_v2',
};
const ACTIVE_THEME_KEY = 'pet_adventure_active_theme_v2';

const DEFAULT_PARK_STARS = {
  cafe_sunny: 0,
  cafe_beach: 0,
  cafe_bakery: 0,
  park_frisbee: 0,
  park_memory: 0,
  park_munchers: 0,
};

function detectInitialTheme() {
  if (typeof window === 'undefined') return 'dog';
  const params = new URLSearchParams(window.location.search);
  const urlTheme = params.get('theme');
  if (urlTheme === 'cat' || urlTheme === 'kitty') return 'cat';
  if (urlTheme === 'dog' || urlTheme === 'pup') return 'dog';
  if (window.location.pathname.endsWith('cats.html')) return 'cat';
  try {
    const savedTheme = localStorage.getItem(ACTIVE_THEME_KEY);
    if (savedTheme === 'cat' || savedTheme === 'dog') return savedTheme;
  } catch {
    // Ignore localStorage restrictions
  }
  return 'dog';
}

function normalizeSavedPetId(id, theme) {
  const starter = theme === 'cat' ? 'orange_tabby' : 'cavapoo';
  if (!id || typeof id !== 'string') return starter;
  if (id === 'golden' && theme === 'dog') return 'cavapoo';
  const mapped = LEGACY_BREED_MAP[id] || id;
  if (theme === 'cat') {
    return CAT_PETS_BY_ID[mapped] ? mapped : 'orange_tabby';
  }
  return DOG_PETS_BY_ID[mapped] ? mapped : 'cavapoo';
}

function createDefaultProfile(theme = 'dog') {
  const starter = theme === 'cat' ? 'orange_tabby' : 'cavapoo';
  return {
    theme,
    treats: 0,
    selectedBreed: starter,
    unlockedBreeds: [starter],
    selectedHat: 'none',
    unlockedHats: ['none'],
    unlockedGear: [],
    equippedGear: {},
    controllerStyle: 'snes',
    factStats: {},
    parkStars: { ...DEFAULT_PARK_STARS },
    updatedAt: 0,
  };
}

function sanitizeProfile(raw, theme = 'dog') {
  const defaults = createDefaultProfile(theme);
  if (!raw || typeof raw !== 'object') return defaults;

  const starter = defaults.selectedBreed;
  const isValidPet = (id) =>
    theme === 'cat' ? Boolean(CAT_PETS_BY_ID[id]) : Boolean(DOG_PETS_BY_ID[id]);

  const rawBreeds = Array.isArray(raw.unlockedBreeds)
    ? raw.unlockedBreeds
    : Array.isArray(raw.unlockedPets)
    ? raw.unlockedPets
    : theme === 'cat' && Array.isArray(raw.unlockedCats)
    ? raw.unlockedCats
    : theme === 'dog' && Array.isArray(raw.unlockedDogs)
    ? raw.unlockedDogs
    : [];

  const mappedBreeds = rawBreeds
    .filter((id) => id !== 'golden')
    .map((id) => LEGACY_BREED_MAP[id] || id)
    .filter(isValidPet);

  const rawSelected =
    raw.selectedBreed ||
    raw.activePetId ||
    (theme === 'cat' ? raw.selectedCat : raw.selectedDog);
  const selectedBreed = normalizeSavedPetId(rawSelected, theme);
  const unlockedBreeds = [...new Set([starter, selectedBreed, ...mappedBreeds])];

  const unlockedHats =
    Array.isArray(raw.unlockedHats) && raw.unlockedHats.length > 0
      ? [...new Set(['none', ...raw.unlockedHats])]
      : ['none'];

  const migratedGear = Array.isArray(raw.unlockedGear) ? [...raw.unlockedGear] : [];
  for (const h of unlockedHats) {
    const mapped = LEGACY_HAT_MAP[h];
    if (mapped && !migratedGear.includes(mapped)) {
      migratedGear.push(mapped);
    }
  }
  const unlockedGear = migratedGear.filter((g) => Boolean(GEAR_BY_ID[g]));

  const equippedGear = {};
  if (raw.equippedGear && typeof raw.equippedGear === 'object') {
    for (const [petId, gearArr] of Object.entries(raw.equippedGear)) {
      if (isValidPet(petId) && Array.isArray(gearArr)) {
        equippedGear[petId] = gearArr.filter((g) => Boolean(GEAR_BY_ID[g]));
      }
    }
  }

  return {
    theme,
    treats: Number.isFinite(raw.treats) ? Math.max(0, Math.floor(raw.treats)) : 0,
    selectedBreed,
    unlockedBreeds,
    selectedHat: typeof raw.selectedHat === 'string' ? raw.selectedHat : 'none',
    unlockedHats,
    unlockedGear,
    equippedGear,
    controllerStyle: raw.controllerStyle === 'xbox' ? 'xbox' : 'snes',
    factStats: raw.factStats && typeof raw.factStats === 'object' ? { ...raw.factStats } : {},
    parkStars: {
      ...DEFAULT_PARK_STARS,
      ...(raw.parkStars && typeof raw.parkStars === 'object' ? raw.parkStars : {}),
    },
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  };
}

function isNonEmptyProfile(profile, theme) {
  const starter = theme === 'cat' ? 'orange_tabby' : 'cavapoo';
  if (profile.treats > 0) return true;
  if (profile.unlockedBreeds.some((b) => b !== starter)) return true;
  if (profile.unlockedGear.length > 0) return true;
  if (Object.keys(profile.factStats || {}).length > 0) return true;
  if (Object.values(profile.parkStars || {}).some((s) => s > 0)) return true;
  return false;
}

export const GameState = {
  theme: 'dog',
  _serverSaveAvailable: true,
  profiles: {
    dog: createDefaultProfile('dog'),
    cat: createDefaultProfile('cat'),
  },
  _listeners: new Set(),

  onChange(fn) {
    if (typeof fn === 'function') this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  },

  _notify() {
    for (const fn of this._listeners) {
      try {
        fn(this);
      } catch (err) {
        console.warn('GameState listener error:', err);
      }
    }
  },

  _active() {
    const t = this.theme === 'cat' ? 'cat' : 'dog';
    if (!this.profiles[t]) {
      this.profiles[t] = createDefaultProfile(t);
    }
    return this.profiles[t];
  },

  get treats() {
    return this._active().treats;
  },
  set treats(val) {
    this._active().treats = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
  },

  get selectedBreed() {
    return this._active().selectedBreed;
  },
  set selectedBreed(id) {
    this._active().selectedBreed = normalizeSavedPetId(id, this.theme);
  },

  get unlockedBreeds() {
    return this._active().unlockedBreeds;
  },
  set unlockedBreeds(list) {
    if (!Array.isArray(list)) return;
    const starter = this.theme === 'cat' ? 'orange_tabby' : 'cavapoo';
    this._active().unlockedBreeds = [...new Set([starter, ...list])];
  },

  get selectedHat() {
    return this._active().selectedHat;
  },
  set selectedHat(val) {
    this._active().selectedHat = typeof val === 'string' ? val : 'none';
  },

  get unlockedHats() {
    return this._active().unlockedHats;
  },
  set unlockedHats(list) {
    if (Array.isArray(list)) {
      this._active().unlockedHats = [...new Set(['none', ...list])];
    }
  },

  get unlockedGear() {
    return this._active().unlockedGear;
  },
  set unlockedGear(list) {
    if (Array.isArray(list)) {
      this._active().unlockedGear = list.filter((g) => Boolean(GEAR_BY_ID[g]));
    }
  },

  get equippedGear() {
    return this._active().equippedGear;
  },
  set equippedGear(obj) {
    if (obj && typeof obj === 'object') {
      this._active().equippedGear = { ...obj };
    }
  },

  get controllerStyle() {
    return this._active().controllerStyle;
  },
  set controllerStyle(val) {
    const style = val === 'xbox' ? 'xbox' : 'snes';
    this.profiles.dog.controllerStyle = style;
    this.profiles.cat.controllerStyle = style;
  },

  get factStats() {
    return this._active().factStats;
  },
  set factStats(obj) {
    if (obj && typeof obj === 'object') {
      this._active().factStats = obj;
    }
  },

  get parkStars() {
    return this._active().parkStars;
  },
  set parkStars(obj) {
    if (obj && typeof obj === 'object') {
      this._active().parkStars = { ...DEFAULT_PARK_STARS, ...obj };
    }
  },

  getEquippedGear(petId = this.selectedBreed) {
    const resolvedId = LEGACY_BREED_MAP[petId] || petId || this.selectedBreed;
    const eqMap = this._active().equippedGear;
    const gearList =
      eqMap && Array.isArray(eqMap[resolvedId]) ? [...eqMap[resolvedId]] : [];
    if (
      resolvedId === this.selectedBreed &&
      this.selectedHat &&
      this.selectedHat !== 'none'
    ) {
      const mappedHat = LEGACY_HAT_MAP[this.selectedHat] || this.selectedHat;
      if (GEAR_BY_ID[mappedHat] && !gearList.includes(mappedHat)) {
        gearList.push(mappedHat);
      }
    }
    return gearList;
  },

  _saveLocalCache(theme) {
    const t = theme === 'cat' ? 'cat' : 'dog';
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ACTIVE_THEME_KEY, this.theme);
        localStorage.setItem(LOCAL_CACHE_KEYS[t], JSON.stringify(this.profiles[t]));
      }
    } catch (err) {
      console.warn('Failed to write local cache:', err);
    }
  },

  async _pushToServer(theme) {
    if (!this._serverSaveAvailable || typeof fetch === 'undefined') return;
    const t = theme === 'cat' ? 'cat' : 'dog';
    try {
      const res = await fetch(`./api/save?theme=${t}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.profiles[t]),
      });
      if (res.status === 404 || res.status === 405) {
        this._serverSaveAvailable = false;
      }
    } catch {
      this._serverSaveAvailable = false;
    }
  },

  save(theme = this.theme) {
    const t = theme === 'cat' ? 'cat' : 'dog';
    this.profiles[t].updatedAt = Date.now();
    this._saveLocalCache(t);
    this._pushToServer(t);
    this._notify();
  },

  async syncFromServer(theme = this.theme) {
    if (!this._serverSaveAvailable || typeof fetch === 'undefined') return;
    const t = theme === 'cat' ? 'cat' : 'dog';
    try {
      const res = await fetch(`./api/save?theme=${t}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          this._serverSaveAvailable = false;
        }
        return;
      }
      const data = await res.json();
      if (data && data.exists && data.state) {
        this.profiles[t] = sanitizeProfile(data.state, t);
        this._saveLocalCache(t);
        this._notify();
      } else if (data && !data.exists && isNonEmptyProfile(this.profiles[t], t)) {
        // Seed the server with existing local progress if server save does not exist yet
        await this._pushToServer(t);
      }
    } catch {
      this._serverSaveAvailable = false;
    }
  },

  load() {
    this.theme = detectInitialTheme();

    try {
      if (typeof localStorage !== 'undefined') {
        const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
        const legacyParsed = legacyRaw ? JSON.parse(legacyRaw) : null;

        for (const t of ['dog', 'cat']) {
          const raw = localStorage.getItem(LOCAL_CACHE_KEYS[t]);
          if (raw) {
            this.profiles[t] = sanitizeProfile(JSON.parse(raw), t);
          } else if (legacyParsed && t === 'dog') {
            // Migrate any pre-split dog progress into the dog profile only
            this.profiles.dog = sanitizeProfile(legacyParsed, 'dog');
            this._saveLocalCache('dog');
          } else {
            this.profiles[t] = createDefaultProfile(t);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load local cache, using defaults:', err);
      this.profiles.dog = createDefaultProfile('dog');
      this.profiles.cat = createDefaultProfile('cat');
    }

    // Asynchronously sync both dog and cat profiles with the server
    this.syncFromServer('dog');
    this.syncFromServer('cat');

    return this;
  },

  setTheme(nextTheme) {
    this.theme = nextTheme === 'cat' ? 'cat' : 'dog';
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ACTIVE_THEME_KEY, this.theme);
      }
    } catch {
      // Ignore
    }
    this.syncFromServer(this.theme);
    this._notify();
    return this.theme;
  },

  toggleTheme() {
    return this.setTheme(this.theme === 'cat' ? 'dog' : 'cat');
  },

  addTreats(n) {
    const delta = Number.isFinite(n) ? Math.floor(n) : 0;
    this.treats = Math.max(0, this.treats + delta);
    this.save();
    return this.treats;
  },

  buyPet(id, cost) {
    const unlocked = this.unlockedBreeds;
    if (unlocked.includes(id)) {
      this.selectPet(id);
      return true;
    }
    if (this.treats < cost) return false;
    this.treats -= cost;
    this._active().unlockedBreeds.push(id);
    this.selectedBreed = id;
    this.save();
    return true;
  },

  selectPet(id) {
    if (!this.unlockedBreeds.includes(id)) return false;
    this.selectedBreed = id;
    this.save();
    return true;
  },

  buyGear(id, cost) {
    if (this.unlockedGear.includes(id)) {
      this.toggleGear(id);
      return true;
    }
    if (this.treats < cost) return false;
    this.treats -= cost;
    this._active().unlockedGear.push(id);
    this.toggleGear(id, true);
    this.save();
    return true;
  },

  toggleGear(id, forceEquip = false) {
    const info = GEAR_BY_ID[id];
    if (!info) return;
    const petId = this.selectedBreed;
    const current = this.getEquippedGear(petId);
    const alreadyWearing = current.includes(id);

    let next;
    if (alreadyWearing && !forceEquip) {
      next = current.filter((g) => g !== id);
    } else {
      next = current.filter((g) => GEAR_BY_ID[g]?.slot !== info.slot);
      next.push(id);
    }
    this._active().equippedGear[petId] = next;
    this.selectedHat = 'none';
    this.save();
    return next;
  },

  clearGear(slot) {
    const petId = this.selectedBreed;
    const current = this.getEquippedGear(petId);
    if (!slot) {
      this._active().equippedGear[petId] = [];
    } else {
      this._active().equippedGear[petId] = current.filter(
        (g) => GEAR_BY_ID[g]?.slot !== slot
      );
    }
    this.selectedHat = 'none';
    this.save();
    return this._active().equippedGear[petId];
  },

  recordFactResult(factKey, correct, timeMs, fastThresholdMs = 2200) {
    if (!factKey) return;
    const stats = this.factStats;
    if (!stats[factKey]) {
      stats[factKey] = {
        attempts: 0,
        correct: 0,
        fastCount: 0,
        avgMs: 3000,
        lastSeen: 0,
      };
    }
    const stat = stats[factKey];
    const clampedTime = Number.isFinite(timeMs) ? Math.max(200, Math.min(15000, timeMs)) : 3000;
    stat.attempts += 1;
    if (correct) {
      stat.correct += 1;
      if (clampedTime <= fastThresholdMs) {
        stat.fastCount += 1;
      }
      stat.avgMs = Math.round(stat.avgMs * 0.65 + clampedTime * 0.35);
    } else {
      stat.avgMs = Math.round(Math.max(stat.avgMs, 3500) * 0.7 + 5000 * 0.3);
    }
    stat.lastSeen = Date.now();
    this.save();
    return stat;
  },

  toggleControllerStyle() {
    this.controllerStyle = this.controllerStyle === 'snes' ? 'xbox' : 'snes';
    this.save('dog');
    this.save('cat');
    return this.controllerStyle;
  },

  resetProgress(theme = this.theme) {
    const t = theme === 'cat' ? 'cat' : 'dog';
    this.profiles[t] = createDefaultProfile(t);
    this.save(t);
    return this;
  },
};

GameState.load();

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    GameState.syncFromServer('dog');
    GameState.syncFromServer('cat');
  });
}
