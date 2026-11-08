/**
 * Procedural vector/canvas rendering for Puppy Treat Cafe & Dog Park Adventure.
 * Renders expressive cartoon dogs & cats, collectible closet gear, bone/fish treats,
 * speech bubbles, the 4-button 8BitDo diamond answer UI, and celebration particle effects.
 */

import { GameState } from './state.js';
import {
  getPetCanvasImage,
  normalizeBreedId,
  DOG_PETS,
  CAT_PETS,
  DOG_GEAR,
  CAT_GEAR,
} from './pet_avatars.js';

export const DOG_BREEDS = [
  {
    id: 'golden',
    name: 'Sunny the Golden',
    cost: 0,
    bodyColor: '#f59e0b',
    bellyColor: '#fef3c7',
    earColor: '#d97706',
    earType: 'floppy',
    size: 1.0,
    desc: 'Loves belly rubs & tennis balls!'
  },
  {
    id: 'corgi',
    name: 'Waffles the Corgi',
    cost: 15,
    bodyColor: '#ea580c',
    bellyColor: '#ffffff',
    earColor: '#c2410c',
    earType: 'pointy',
    size: 0.9,
    desc: 'Short legs, mega zoomies!'
  },
  {
    id: 'pug',
    name: 'Bean the Pug',
    cost: 25,
    bodyColor: '#d6d3d1',
    bellyColor: '#f5f5f4',
    earColor: '#292524',
    muzzleColor: '#292524',
    earType: 'button',
    size: 0.85,
    desc: 'Snorts happily for treats!'
  },
  {
    id: 'husky',
    name: 'Blizzard the Husky',
    cost: 40,
    bodyColor: '#475569',
    bellyColor: '#f8fafc',
    earColor: '#1e293b',
    earType: 'pointy',
    size: 1.1,
    desc: 'Dramatic howler & snow pup!'
  },
  {
    id: 'dalmatian',
    name: 'Marshall the Dalmatian',
    cost: 55,
    bodyColor: '#ffffff',
    bellyColor: '#f1f5f9',
    earColor: '#1e293b',
    spots: true,
    earType: 'floppy',
    size: 1.05,
    desc: 'Firehouse hero pup!'
  },
  {
    id: 'dane',
    name: 'Barnaby the Great Dane',
    cost: 75,
    bodyColor: '#78350f',
    bellyColor: '#fde68a',
    earColor: '#451a03',
    earType: 'floppy',
    size: 1.35,
    desc: 'Gentle giant who loves BIG numbers!'
  },
  {
    id: 'poodle',
    name: 'Fifi the Cloud Poodle',
    cost: 90,
    bodyColor: '#f472b6',
    bellyColor: '#fce7f3',
    earColor: '#db2777',
    earType: 'fluffy',
    size: 1.0,
    desc: 'Bouncy pink cotton-candy pup!'
  }
];

// Populate all 71 dog breeds and 32 cat breeds from ../math-game/ into DOG_BREEDS
for (const p of [...DOG_PETS, ...CAT_PETS]) {
  if (!DOG_BREEDS.some((b) => b.id === p.id)) {
    DOG_BREEDS.push({
      id: p.id,
      name: `${p.name} the ${p.breed}`,
      shortName: p.name,
      breedName: p.breed,
      cost: p.cost,
      bodyColor: '#f59e0b',
      bellyColor: '#fef3c7',
      earColor: '#d97706',
      earType: 'floppy',
      size: 1.0,
      desc: `${p.name} (${p.breed})`,
    });
  }
}

export const DOG_BREEDS_BY_ID = Object.fromEntries(
  DOG_BREEDS.map((b) => [b.id, b])
);
// Also attach named keys onto DOG_BREEDS array so both array iteration and
// map-style lookup (`DOG_BREEDS['golden']` or `DOG_BREEDS.find(...)`) work seamlessly.
for (const breed of DOG_BREEDS) {
  DOG_BREEDS[breed.id] = breed;
}

export const DOG_HATS = [
  { id: 'none', name: 'No Hat', cost: 0 },
  { id: 'chef', name: 'Cafe Chef Hat', cost: 10 },
  { id: 'crown', name: 'Golden Crown', cost: 20 },
  { id: 'wizard', name: 'Math Wizard Hat', cost: 35 },
  { id: 'shades', name: 'Cool Shades', cost: 50 },
  { id: 'astro', name: 'Space Helmet', cost: 70 }
];

export const DOG_HATS_BY_ID = Object.fromEntries(
  DOG_HATS.map((h) => [h.id, h])
);
for (const hat of DOG_HATS) {
  DOG_HATS[hat.id] = hat;
}

function resolveBreed(breedOrId) {
  if (!breedOrId) return DOG_BREEDS_BY_ID.golden;
  if (typeof breedOrId === 'string') {
    return DOG_BREEDS_BY_ID[breedOrId] || DOG_BREEDS_BY_ID.golden;
  }
  return breedOrId;
}

function resolveHatId(hatOrId) {
  if (!hatOrId) return 'none';
  if (typeof hatOrId === 'string') return hatOrId;
  return hatOrId.id || 'none';
}

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

function drawStarShape(ctx, cx, cy, spikes, outerR, innerR, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = rotation + (i * Math.PI) / spikes;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHeartShape(ctx, cx, cy, size) {
  const s = size;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.1, cx - s * 0.55, cy - s * 0.55, cx, cy - s * 0.25);
  ctx.bezierCurveTo(cx + s * 0.55, cy - s * 0.55, cx + s * 0.5, cy - s * 0.1, cx, cy + s * 0.35);
  ctx.closePath();
}

/**
 * Draws an expressive, animated cartoon dog centered at (x, y).
 */
export function drawDog(ctx, x, y, options = {}) {
  const breed = resolveBreed(options.breed);
  const hatId = resolveHatId(options.hat);
  const baseScale = (options.scale ?? 1.0) * (breed.size ?? 1.0);
  const time = options.time ?? performance.now() / 1000;
  const mood = options.mood || 'happy';
  const wagSpeed = options.wagSpeed ?? (mood === 'excited' || mood === 'zoomies' ? 3.2 : 1.4);
  const facing = options.facing || 'front';
  const flipProgress = options.flipProgress || 0;

  const theme = options.theme || GameState.theme || 'dog';
  const rawBreedId = typeof options.breed === 'string'
    ? options.breed
    : options.breed?.id || GameState.selectedBreed;
  const resolvedBreedId = normalizeBreedId(rawBreedId, theme);
  const gearList = Array.isArray(options.gear)
    ? options.gear
    : GameState.getEquippedGear(resolvedBreedId);

  const svgEntry = getPetCanvasImage({
    theme,
    breed: resolvedBreedId,
    gear: gearList,
    hat: hatId,
    mood,
  });

  if (svgEntry && svgEntry.img && svgEntry.img.complete && svgEntry.img.naturalWidth > 0) {
    ctx.save();
    ctx.translate(x, y);

    const flipJumpY = flipProgress > 0 ? -Math.sin(flipProgress * Math.PI) * 55 * baseScale : 0;
    ctx.translate(0, flipJumpY);

    if (flipProgress > 0) {
      const dir = facing === 'left' ? 1 : -1;
      ctx.rotate(dir * flipProgress * Math.PI * 2);
    }

    ctx.scale(baseScale, baseScale);

    let bounceY = Math.sin(time * 4.5) * 2.2;
    let bodyTilt = Math.sin(time * 2.3) * 0.03;
    if (mood === 'excited' || mood === 'zoomies') {
      bounceY = -Math.abs(Math.sin(time * 11)) * 10;
      bodyTilt = Math.sin(time * 11) * 0.07;
    } else if (mood === 'walking') {
      bounceY = -Math.abs(Math.sin(time * 9)) * 5.5;
      bodyTilt = Math.sin(time * 9) * 0.05;
    } else if (mood === 'munching') {
      bounceY = Math.sin(time * 16) * 2.5;
      bodyTilt = Math.sin(time * 16) * 0.04;
    } else if (mood === 'waiting') {
      bounceY = Math.sin(time * 2.8) * 1.5;
      bodyTilt = 0.06 + Math.sin(time * 2.0) * 0.03;
    } else if (mood === 'impatient') {
      bounceY = -Math.abs(Math.sin(time * 10)) * 3.5;
      bodyTilt = Math.sin(time * 14) * 0.06;
    }

    ctx.translate(0, bounceY);
    ctx.rotate(bodyTilt);
    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    // SVG viewBox="-40 -60 280 290": pet center x=100 is at 140/280, paws y=212 is at 272/290.
    const drawW = 154;
    const drawH = 160;
    ctx.drawImage(svgEntry.img, -drawW / 2, -104, drawW, drawH);

    // Munching crumbs overlay
    if (mood === 'munching') {
      ctx.fillStyle = '#fde047';
      for (let i = 0; i < 3; i++) {
        const a = time * 10 + i * 2.1;
        const cx = Math.cos(a) * 16;
        const cy = -4 + Math.abs(Math.sin(a * 1.3)) * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  // Mid-air celebratory backflip arc
  const flipJumpY = flipProgress > 0 ? -Math.sin(flipProgress * Math.PI) * 55 * baseScale : 0;
  ctx.translate(0, flipJumpY);

  // Soft ground shadow (stays on ground somewhat even when jumping)
  ctx.save();
  const shadowScale = flipProgress > 0 ? 1 - 0.35 * Math.sin(flipProgress * Math.PI) : 1;
  ctx.translate(0, 48 * baseScale - flipJumpY * 0.6);
  ctx.scale(shadowScale, shadowScale);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 42 * baseScale, 11 * baseScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (flipProgress > 0) {
    const dir = facing === 'left' ? 1 : -1;
    ctx.rotate(dir * flipProgress * Math.PI * 2);
  }

  const facingSign = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  ctx.scale(baseScale, baseScale);

  // Mood-driven body bounce & head tilt
  let bounceY = Math.sin(time * 4.5) * 2.2;
  let bodyTilt = 0;
  let headBobY = Math.sin(time * 4.5 - 0.5) * 2.0;
  let headTilt = Math.sin(time * 2.3) * 0.05;

  if (mood === 'excited' || mood === 'zoomies') {
    bounceY = -Math.abs(Math.sin(time * 11)) * 12;
    bodyTilt = Math.sin(time * 11) * 0.08;
    headBobY = Math.sin(time * 14) * 3.5;
    headTilt = Math.sin(time * 7) * 0.12;
  } else if (mood === 'walking') {
    bounceY = -Math.abs(Math.sin(time * 9)) * 6;
    bodyTilt = Math.sin(time * 9) * 0.05;
  } else if (mood === 'munching') {
    bounceY = Math.sin(time * 16) * 2.5;
    headBobY = Math.abs(Math.sin(time * 16)) * 4;
  } else if (mood === 'waiting') {
    bounceY = Math.sin(time * 2.8) * 1.5;
    headTilt = 0.12 + Math.sin(time * 2.0) * 0.04; // Curious puppy head tilt
  } else if (mood === 'impatient') {
    bounceY = -Math.abs(Math.sin(time * 10)) * 3.5;
    bodyTilt = Math.sin(time * 14) * 0.05;
    headBobY = Math.sin(time * 12) * 2.2;
    headTilt = Math.sin(time * 8) * 0.09;
  }

  ctx.translate(0, bounceY);
  ctx.rotate(bodyTilt);

  const outlineColor = '#1e293b';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- 1. Wagging Tail (behind body) ---
  ctx.save();
  const tailBaseX = facingSign === 0 ? 24 : -facingSign * 26;
  const tailBaseY = 18;
  ctx.translate(tailBaseX, tailBaseY);
  const wagAngle = Math.sin(time * 10 * wagSpeed) * 0.48 + (facingSign <= 0 ? 0.45 : -0.45);
  ctx.rotate(wagAngle);

  ctx.fillStyle = breed.earColor || breed.bodyColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 3.2;

  if (breed.id === 'poodle') {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, -14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(17, -17, 9, 0, Math.PI * 2);
    ctx.fillStyle = breed.bodyColor;
    ctx.fill();
    ctx.stroke();
  } else if (breed.id === 'pug') {
    // Curly cinnamon-roll pug tail
    ctx.beginPath();
    ctx.arc(8, -8, 8, 0.3, Math.PI * 1.85);
    ctx.lineWidth = 6;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = breed.bodyColor;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.quadraticCurveTo(22, -8, 26, -24);
    ctx.quadraticCurveTo(14, -22, -3, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // --- 2. Torso & Belly ---
  const isShortLegs = breed.id === 'corgi';
  const bodyW = isShortLegs ? 36 : 33;
  const bodyH = isShortLegs ? 24 : 28;
  const bodyY = 18;

  ctx.fillStyle = breed.bodyColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(facingSign * -3, bodyY, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly patch
  ctx.fillStyle = breed.bellyColor;
  ctx.beginPath();
  ctx.ellipse(facingSign * 3, bodyY + 4, bodyW * 0.62, bodyH * 0.68, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dalmatian spots on torso
  if (breed.spots) {
    ctx.fillStyle = '#1e293b';
    const bodySpots = [
      { x: -18, y: 12, r: 4.5 },
      { x: -12, y: 24, r: 3.5 },
      { x: 17, y: 10, r: 5 },
      { x: 20, y: 23, r: 3.2 },
      { x: -4, y: 3, r: 3.8 }
    ];
    for (const s of bodySpots) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cute collar with golden tag
  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(facingSign * 2, -2, 22, 0.22 * Math.PI, 0.78 * Math.PI);
  ctx.stroke();
  // Collar tag
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(facingSign * 4, 19, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- 3. Paws (animated stepping when walking/excited/impatient) ---
  const pawSwing = (mood === 'walking' || mood === 'excited' || mood === 'zoomies')
    ? Math.sin(time * 12) * 6
    : mood === 'impatient'
    ? Math.sin(time * 18) * 4.5
    : 0;
  const pawYBase = isShortLegs ? 39 : 43;
  const paws = [
    { x: -20, y: pawYBase - pawSwing * 0.6, r: 9 },
    { x: 20, y: pawYBase + pawSwing * 0.6, r: 9 },
    { x: -9, y: pawYBase + 2 + pawSwing, r: 9.5 },
    { x: 9, y: pawYBase + 2 - pawSwing, r: 9.5 }
  ];

  for (const paw of paws) {
    ctx.fillStyle = breed.bellyColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(paw.x, paw.y, paw.r, paw.r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Little toe lines
    ctx.beginPath();
    ctx.moveTo(paw.x - 3, paw.y + 1);
    ctx.lineTo(paw.x - 3, paw.y + 5);
    ctx.moveTo(paw.x + 3, paw.y + 1);
    ctx.lineTo(paw.x + 3, paw.y + 5);
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // --- 4. Head Group ---
  ctx.save();
  ctx.translate(facingSign * 5, -18 + headBobY);
  ctx.rotate(headTilt);

  const earBounce = Math.sin(time * 7) * 0.08 + (mood === 'excited' || mood === 'zoomies' ? Math.sin(time * 14) * 0.14 : 0);

  // Pointy ears draw behind the head silhouette
  if (breed.earType === 'pointy') {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 20, -18);
      ctx.rotate(side * (0.22 + earBounce));
      ctx.fillStyle = breed.earColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-12, 8);
      ctx.quadraticCurveTo(0, -28, 2, -26);
      ctx.quadraticCurveTo(12, -10, 12, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner pink ear
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(-6, 5);
      ctx.lineTo(0, -16);
      ctx.lineTo(6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Head main shape
  ctx.fillStyle = breed.bodyColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Husky / Corgi facial mask markings
  if (breed.id === 'husky' || breed.id === 'corgi') {
    ctx.fillStyle = breed.bellyColor;
    ctx.beginPath();
    ctx.ellipse(-11, 2, 12, 15, -0.2, 0, Math.PI * 2);
    ctx.ellipse(11, 2, 12, 15, 0.2, 0, Math.PI * 2);
    ctx.ellipse(0, 8, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dalmatian head spots
  if (breed.spots) {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-16, -8, 7, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(18, -11, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Poodle top fluff cloud
  if (breed.id === 'poodle') {
    ctx.fillStyle = breed.bellyColor;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;
    const puffs = [
      { x: -10, y: -23, r: 10 },
      { x: 10, y: -23, r: 10 },
      { x: 0, y: -27, r: 12 }
    ];
    for (const p of puffs) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Floppy / Button / Fluffy ears (drawn framing the head)
  if (breed.earType === 'floppy' || breed.earType === 'button' || breed.earType === 'fluffy') {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 27, -8);
      ctx.rotate(side * (0.18 + earBounce));
      ctx.fillStyle = breed.earColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 3.2;

      if (breed.earType === 'button') {
        ctx.beginPath();
        ctx.ellipse(side * 2, 4, 9, 13, side * -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (breed.earType === 'fluffy') {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(side * 3, 6 + i * 8, 9 - i * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else {
        // Floppy ear
        ctx.beginPath();
        ctx.ellipse(side * 4, 14, 10, 19, side * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (breed.spots && side === 1) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(side * 4, 16, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // --- 5. Muzzle, Nose, Mouth & Tongue ---
  const faceShiftX = facingSign * 4;
  ctx.save();
  ctx.translate(faceShiftX, 0);

  // Snout / Muzzle
  ctx.fillStyle = breed.muzzleColor || breed.bellyColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 8, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Happy panting pink tongue (visible when happy, excited, zoomies, or munching)
  if (mood === 'happy' || mood === 'excited' || mood === 'zoomies' || mood === 'munching') {
    const pantLen = mood === 'munching'
      ? 4 + Math.abs(Math.sin(time * 18)) * 5
      : 8 + Math.sin(time * 12) * 3;
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-5, 12);
    ctx.lineTo(-5, 12 + pantLen);
    ctx.arc(0, 12 + pantLen, 5, Math.PI, 0, true);
    ctx.lineTo(5, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tongue center crease
    ctx.beginPath();
    ctx.moveTo(0, 13);
    ctx.lineTo(0, 12 + pantLen);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Cute W-mouth smile (or impatient wavy/pleading mouth)
  const chewOffset = mood === 'munching' ? Math.sin(time * 18) * 1.5 : 0;
  ctx.strokeStyle = breed.muzzleColor ? '#f5f5f4' : outlineColor;
  ctx.lineWidth = 2.6;
  if (mood === 'impatient') {
    ctx.beginPath();
    ctx.arc(0, 14, 5.5, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-5, 10 + chewOffset, 5, 0.15 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, 10 + chewOffset, 5, 0.1 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Crumbs flying while munching
  if (mood === 'munching') {
    ctx.fillStyle = '#fde047';
    for (let i = 0; i < 3; i++) {
      const a = time * 10 + i * 2.1;
      const cx = Math.cos(a) * 14;
      const cy = 12 + Math.abs(Math.sin(a * 1.3)) * 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Shiny button nose
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(0, 4, 6.5, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-2, 2.5, 2.2, 1.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-19, 6, 5.5, 3.5, 0, 0, Math.PI * 2);
  ctx.ellipse(19, 6, 5.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 6. Expressive Eyes ---
  const happyArcEyes = mood === 'munching' || mood === 'zoomies';
  for (const side of [-1, 1]) {
    const ex = side * 12;
    const ey = -4;
    if (happyArcEyes) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(ex, ey + 2, 6, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      // Big glossy puppy eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ex, ey, 6.2, 0, Math.PI * 2);
      ctx.fill();

      // Main white catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 2, ey - 2.2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Secondary sparkle catchlight
      ctx.beginPath();
      ctx.arc(ex + 2.2, ey + 1.8, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Expressive eyebrows
      ctx.strokeStyle = mood === 'impatient' ? '#b45309' : breed.earColor;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      if (mood === 'impatient') {
        // Furrowed/pleading eyebrows angled toward center
        ctx.moveTo(ex - side * 6, ey - 8);
        ctx.lineTo(ex + side * 5, ey - 11);
      } else {
        ctx.arc(ex, ey - 3, 7, Math.PI * 1.25, Math.PI * 1.75);
      }
      ctx.stroke();
    }
  }
  ctx.restore(); // end faceShiftX

  // --- 7. Collectible Hat ---
  drawDogHat(ctx, hatId, faceShiftX, time, outlineColor, breed);

  ctx.restore(); // end head group
  ctx.restore(); // end root dog transform
}

function drawDogHat(ctx, hatId, faceShiftX, time, outlineColor, breed) {
  if (!hatId || hatId === 'none') return;

  const topY = breed && breed.id === 'poodle' ? -33 : -27;

  ctx.save();
  if (hatId === 'chef') {
    ctx.translate(faceShiftX * 0.35, topY);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;

    // Unified puffy chef toque silhouette above the headband
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    ctx.bezierCurveTo(-24, -10, -22, -24, -10, -23);
    ctx.bezierCurveTo(-7, -31, 7, -31, 10, -23);
    ctx.bezierCurveTo(22, -24, 24, -10, 15, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved headband that hugs the crown of the dog's head
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(0, -2, 16, 2);
    ctx.lineTo(15, -6);
    ctx.quadraticCurveTo(0, -9, -15, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (hatId === 'crown') {
    ctx.translate(faceShiftX * 0.35, topY);
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-18, -14);
    ctx.lineTo(-8, -5);
    ctx.lineTo(0, -18);
    ctx.lineTo(8, -5);
    ctx.lineTo(18, -14);
    ctx.lineTo(16, 2);
    // Curve along the top of the head so it looks worn rather than flat
    ctx.quadraticCurveTo(0, -2, -16, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gems
    const gems = [
      { x: -10, y: -3.5, color: '#3b82f6' },
      { x: 0, y: -5.5, color: '#ef4444' },
      { x: 10, y: -3.5, color: '#10b981' }
    ];
    for (const g of gems) {
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (hatId === 'wizard') {
    ctx.translate(faceShiftX * 0.35, topY);
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 3;

    // Cone sitting on the crown of the head
    ctx.beginPath();
    ctx.moveTo(-16, 1);
    ctx.quadraticCurveTo(-4, -26, 6, -32);
    ctx.quadraticCurveTo(10, -16, 16, 1);
    ctx.quadraticCurveTo(0, -3, -16, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved front brim hugging the top of the head (does not hang down over the forehead)
    ctx.beginPath();
    ctx.moveTo(-24, 3);
    ctx.quadraticCurveTo(0, -5, 24, 3);
    ctx.quadraticCurveTo(0, 0, -24, 3);
    ctx.closePath();
    ctx.fillStyle = '#1d4ed8';
    ctx.fill();
    ctx.stroke();

    // Golden stars on wizard hat
    ctx.fillStyle = '#fde047';
    drawStarShape(ctx, -3, -11, 5, 4.2, 2, time);
    ctx.fill();
    drawStarShape(ctx, 4, -20, 5, 3.0, 1.4, -time);
    ctx.fill();
  } else if (hatId === 'shades') {
    ctx.translate(faceShiftX, -4);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.6;

    // Temple arms tucking back toward ears
    ctx.beginPath();
    ctx.moveTo(-21, -4);
    ctx.lineTo(-28, -7);
    ctx.moveTo(21, -4);
    ctx.lineTo(28, -7);
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(-5, -4);
    ctx.lineTo(5, -4);
    ctx.stroke();

    // Left & right cool lenses positioned over the eyes without covering the nose
    drawRoundedRect(ctx, -21, -8, 16, 10, 3);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, 5, -8, 16, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Lens shine
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-17, -5);
    ctx.lineTo(-12, 0);
    ctx.moveTo(9, -5);
    ctx.lineTo(14, 0);
    ctx.stroke();
  } else if (hatId === 'astro') {
    // Space bubble helmet surrounding the head without a bar cutting across the face
    ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -3, 39, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Little antenna on top of the space helmet
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(0, -50);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -52, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Subtle lower neck rim along the bottom edge of the bubble (below the chin/tongue)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -3, 39, 0.32 * Math.PI, 0.68 * Math.PI);
    ctx.stroke();

    // Glossy visor reflection arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -3, 32, Math.PI * 1.15, Math.PI * 1.48);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws a classic cartoon dog bone treat centered at (x, y).
 */
export function drawBoneTreat(ctx, x, y, scale = 1, angle = 0, color = '#fef08a') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  if (GameState.theme === 'cat') {
    // Draw a Golden Fish Treat in Kitty Mode
    ctx.fillStyle = color === '#fef08a' ? '#facc15' : color;
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.6;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.bezierCurveTo(-18, -10, -4, -12, 6, -9);
    ctx.bezierCurveTo(11, -7, 14, -3, 16, 0);
    ctx.lineTo(24, -8);
    ctx.lineTo(22, 0);
    ctx.lineTo(24, 8);
    ctx.lineTo(16, 0);
    ctx.bezierCurveTo(14, 3, 11, 7, 6, 9);
    ctx.bezierCurveTo(-4, 12, -18, 10, -18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gill & eye
    ctx.beginPath();
    ctx.arc(4, 0, 5, -0.7, 0.7);
    ctx.stroke();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-9, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  const w = 16;
  const h = 6;
  const knobR = 6.5;

  ctx.fillStyle = color;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.6;
  ctx.lineJoin = 'round';

  // Draw unified bone silhouette using 4 corner knobs + center bar
  ctx.beginPath();
  ctx.arc(-w, -h, knobR, Math.PI * 0.25, Math.PI * 1.65);
  ctx.lineTo(w, -h - knobR * 0.55);
  ctx.arc(w, -h, knobR, Math.PI * 1.35, Math.PI * 0.75);
  ctx.arc(w, h, knobR, -Math.PI * 0.75, Math.PI * 0.65);
  ctx.lineTo(-w, h + knobR * 0.55);
  ctx.arc(-w, h, knobR, Math.PI * 0.35, Math.PI * 1.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.6, -2);
  ctx.lineTo(w * 0.6, -2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a cheerful cartoon speech bubble with a tail pointing toward (tailTargetX, tailTargetY).
 */
export function drawSpeechBubble(ctx, x, y, w, h, options = {}) {
  const radius = options.radius ?? 22;
  const bgColor = options.bgColor || '#ffffff';
  const borderColor = options.borderColor || '#f59e0b';
  const tailX = options.tailX ?? x + w * 0.25;
  const tailY = options.tailY ?? y + h + 18;

  ctx.save();
  // Drop shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
  drawRoundedRect(ctx, x + 4, y + 6, w, h, radius);
  ctx.fill();

  // Tail triangle
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';

  const baseCenterX = Math.max(x + radius + 14, Math.min(x + w - radius - 14, tailX));
  const baseY = tailY >= y + h / 2 ? y + h : y;
  ctx.beginPath();
  ctx.moveTo(baseCenterX - 12, baseY);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(baseCenterX + 12, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bubble body
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.stroke();

  if (options.text) {
    ctx.fillStyle = options.textColor || '#1e293b';
    ctx.font = options.font || 'bold 28px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.text, x + w / 2, y + h / 2);
  }
  ctx.restore();
}

const DEFAULT_DIAMOND_LABELS = {
  top: { key: 'X', color: '#3b82f6', arrow: '▲' },
  left: { key: 'Y', color: '#10b981', arrow: '◀' },
  bottom: { key: 'B', color: '#f59e0b', arrow: '▼' },
  right: { key: 'A', color: '#ef4444', arrow: '▶' }
};

/**
 * Draws the signature 4-Button 8BitDo Diamond UI around (centerX, centerY)
 * and returns clickable bounding boxes `{ top, left, bottom, right }`.
 */
export function drawDiamondController(ctx, centerX, centerY, choices = {}, diamondLabels = DEFAULT_DIAMOND_LABELS, options = {}) {
  const radiusX = options.radiusX ?? 138;
  const radiusY = options.radiusY ?? 88;
  const btnW = options.buttonWidth ?? 136;
  const btnH = options.buttonHeight ?? 78;
  const disabledDirs = options.disabledDirs || [];
  const highlightDir = options.highlightDir || null;
  const time = options.time ?? performance.now() / 1000;

  const isDisabled = (dir) =>
    Array.isArray(disabledDirs)
      ? disabledDirs.includes(dir)
      : disabledDirs instanceof Set
      ? disabledDirs.has(dir)
      : Boolean(disabledDirs[dir]);

  const positions = {
    top: { cx: centerX, cy: centerY - radiusY },
    left: { cx: centerX - radiusX, cy: centerY },
    bottom: { cx: centerX, cy: centerY + radiusY },
    right: { cx: centerX + radiusX, cy: centerY }
  };

  ctx.save();

  // Subtle connecting diamond track & center D-pad emblem
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(positions.top.cx, positions.top.cy);
  ctx.lineTo(positions.right.cx, positions.right.cy);
  ctx.lineTo(positions.bottom.cx, positions.bottom.cy);
  ctx.lineTo(positions.left.cx, positions.left.cy);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // Center paw badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐾', centerX, centerY + 1);

  const bounds = {};
  const dirs = ['top', 'left', 'right', 'bottom'];

  for (const dir of dirs) {
    const { cx, cy } = positions[dir];
    const labelInfo = (diamondLabels && diamondLabels[dir]) || DEFAULT_DIAMOND_LABELS[dir];
    const disabled = isDisabled(dir);
    const highlighted = highlightDir === dir;
    const value = choices[dir] ?? '';

    const pulseScale = highlighted ? 1.08 + Math.sin(time * 10) * 0.04 : 1.0;

    bounds[dir] = {
      x: cx - btnW / 2,
      y: cy - btnH / 2,
      w: btnW,
      h: btnH
    };

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulseScale, pulseScale);

    // Highlight glow halo
    if (highlighted) {
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 24;
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      drawRoundedRect(ctx, -btnW / 2 - 6, -btnH / 2 - 6, btnW + 12, btnH + 12, 26);
      ctx.fill();
      ctx.restore();
    }

    // 3D Bowl/Platter base shadow
    ctx.fillStyle = disabled ? '#94a3b8' : labelInfo.color;
    drawRoundedRect(ctx, -btnW / 2, -btnH / 2 + 6, btnW, btnH, 22);
    ctx.fill();

    // Main Biscuit Platter face
    ctx.fillStyle = disabled ? '#e2e8f0' : highlighted ? '#fef9c3' : '#fffbeb';
    ctx.strokeStyle = disabled ? '#94a3b8' : highlighted ? '#eab308' : labelInfo.color;
    ctx.lineWidth = highlighted ? 5 : 4;
    drawRoundedRect(ctx, -btnW / 2, -btnH / 2, btnW, btnH, 22);
    ctx.fill();
    ctx.stroke();

    // Inner biscuit rim detail
    ctx.strokeStyle = disabled ? 'rgba(148, 163, 184, 0.3)' : 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, -btnW / 2 + 6, -btnH / 2 + 6, btnW - 12, btnH - 12, 16);
    ctx.stroke();

    // Answer number text (shifted slightly right to balance badge)
    ctx.fillStyle = disabled ? '#94a3b8' : '#0f172a';
    ctx.font = '900 36px "Rounded Mplus 1c", "Fredoka One", "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), 12, 2);

    // 8BitDo colored physical button badge on left rim
    const badgeX = -btnW / 2 + 24;
    const badgeY = 0;
    const badgeR = 17;

    ctx.fillStyle = disabled ? '#94a3b8' : labelInfo.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelInfo.key || '', badgeX, badgeY + 1);

    // Gentle cross / tried indicator when disabled
    if (disabled) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-12, -16);
      ctx.lineTo(36, 16);
      ctx.moveTo(36, -16);
      ctx.lineTo(-12, 16);
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.restore();
  return bounds;
}

/**
 * Celebratory particle & floating popup system.
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  clear() {
    this.particles.length = 0;
    this.floatingTexts.length = 0;
  }

  emitHearts(x, y, count = 8) {
    const colors = ['#f43f5e', '#fb7185', '#ec4899', '#f472b6'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 60 + Math.random() * 90;
      this.particles.push({
        type: 'heart',
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        gravity: -15, // floats upward!
        size: 14 + Math.random() * 12,
        rotation: (Math.random() - 0.5) * 0.4,
        vRot: (Math.random() - 0.5) * 1.5,
        color: colors[i % colors.length],
        life: 0,
        maxLife: 1.0 + Math.random() * 0.5
      });
    }
  }

  emitStars(x, y, count = 15) {
    const colors = ['#facc15', '#fde047', '#fbbf24', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 80 + Math.random() * 150;
      this.particles.push({
        type: 'star',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 220,
        size: 8 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        color: colors[i % colors.length],
        life: 0,
        maxLife: 0.85 + Math.random() * 0.45
      });
    }
  }

  emitCrumbs(x, y, count = 10) {
    const colors = ['#fef08a', '#fde047', '#f59e0b', '#d97706'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const speed = 40 + Math.random() * 110;
      this.particles.push({
        type: 'crumb',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 340,
        size: 3.5 + Math.random() * 4,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10,
        color: colors[i % colors.length],
        life: 0,
        maxLife: 0.55 + Math.random() * 0.35
      });
    }
  }

  emitConfetti(x, y, count = 30) {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 120 + Math.random() * 220;
      const isBone = i % 5 === 0;
      this.particles.push({
        type: isBone ? 'bone' : 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        gravity: 260,
        size: isBone ? 0.55 : 7 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        color: colors[i % colors.length],
        life: 0,
        maxLife: 1.2 + Math.random() * 0.7
      });
    }
  }

  addFloatingText(x, y, text, color = '#f59e0b', scale = 1.0) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      scale,
      vy: -55,
      life: 0,
      maxLife: 1.35
    });
  }

  update(dt) {
    const safeDt = Math.min(dt || 0.016, 0.1);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += safeDt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * safeDt;
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;
      p.rotation += p.vRot * safeDt;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += safeDt;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * safeDt;
      ft.vy *= 0.96;
    }
  }

  draw(ctx) {
    ctx.save();

    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'heart') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        drawHeartShape(ctx, 0, 0, p.size);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        drawStarShape(ctx, 0, 0, 5, p.size, p.size * 0.45, 0);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'bone') {
        drawBoneTreat(ctx, 0, 0, p.size, 0, '#fef08a');
      } else if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
      } else {
        // Crumb
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    for (const ft of this.floatingTexts) {
      const progress = ft.life / ft.maxLife;
      const alpha = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;
      const popScale = progress < 0.15 ? 0.6 + (progress / 0.15) * 0.5 : 1.0;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale * popScale, ft.scale * popScale);

      ctx.font = '900 28px "Comic Sans MS", "Chalkboard SE", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeText(ft.text, 0, 0);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}

export const Sprites = {
  DOG_BREEDS,
  DOG_BREEDS_BY_ID,
  DOG_HATS,
  DOG_HATS_BY_ID,
  drawDog,
  drawBoneTreat,
  drawSpeechBubble,
  drawDiamondController
};

export default Sprites;
