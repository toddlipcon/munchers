import { GameState } from './state.js';

const DIRECTIONS = ['top', 'left', 'bottom', 'right'];

const TIER_1_FACTS = [
  // Doubles
  { op: '+', a: 2, b: 2 },
  { op: '+', a: 3, b: 3 },
  { op: '+', a: 4, b: 4 },
  { op: '+', a: 5, b: 5 },
  { op: '+', a: 6, b: 6 },
  { op: '+', a: 7, b: 7 },
  { op: '+', a: 8, b: 8 },
  { op: '+', a: 9, b: 9 },
  // Partners of 10
  { op: '+', a: 1, b: 9 },
  { op: '+', a: 2, b: 8 },
  { op: '+', a: 3, b: 7 },
  { op: '+', a: 4, b: 6 },
  { op: '+', a: 6, b: 4 },
  { op: '+', a: 7, b: 3 },
  { op: '+', a: 8, b: 2 },
  // +1 / +2 facts and near-doubles
  { op: '+', a: 5, b: 2 },
  { op: '+', a: 6, b: 2 },
  { op: '+', a: 7, b: 2 },
  { op: '+', a: 8, b: 2 },
  { op: '+', a: 4, b: 5 },
  { op: '+', a: 5, b: 6 },
  // Easy subtraction
  { op: '-', a: 10, b: 3 },
  { op: '-', a: 10, b: 4 },
  { op: '-', a: 10, b: 5 },
  { op: '-', a: 8, b: 4 },
  { op: '-', a: 9, b: 2 },
  { op: '-', a: 9, b: 3 },
  { op: '-', a: 7, b: 2 },
];

const TIER_2_FACTS = [
  // Single-digit bridging 10 addition
  { op: '+', a: 7, b: 8 },
  { op: '+', a: 8, b: 7 },
  { op: '+', a: 6, b: 7 },
  { op: '+', a: 7, b: 6 },
  { op: '+', a: 8, b: 5 },
  { op: '+', a: 5, b: 8 },
  { op: '+', a: 9, b: 6 },
  { op: '+', a: 6, b: 9 },
  { op: '+', a: 8, b: 6 },
  { op: '+', a: 6, b: 8 },
  { op: '+', a: 7, b: 5 },
  { op: '+', a: 5, b: 7 },
  { op: '+', a: 9, b: 4 },
  { op: '+', a: 4, b: 9 },
  { op: '+', a: 9, b: 7 },
  { op: '+', a: 7, b: 9 },
  { op: '+', a: 8, b: 9 },
  { op: '+', a: 9, b: 8 },
  // Teen subtraction
  { op: '-', a: 15, b: 8 },
  { op: '-', a: 15, b: 7 },
  { op: '-', a: 13, b: 6 },
  { op: '-', a: 13, b: 7 },
  { op: '-', a: 14, b: 6 },
  { op: '-', a: 14, b: 8 },
  { op: '-', a: 14, b: 5 },
  { op: '-', a: 16, b: 9 },
  { op: '-', a: 16, b: 7 },
  { op: '-', a: 17, b: 8 },
  { op: '-', a: 17, b: 9 },
  { op: '-', a: 12, b: 5 },
  { op: '-', a: 12, b: 7 },
  { op: '-', a: 11, b: 4 },
  { op: '-', a: 11, b: 6 },
];

const TIER_3_EXTRA_FACTS = [
  { op: '+', a: 14, b: 5 },
  { op: '+', a: 13, b: 6 },
  { op: '+', a: 20, b: 7 },
  { op: '+', a: 12, b: 8 },
  { op: '+', a: 15, b: 4 },
  { op: '+', a: 11, b: 9 },
  { op: '-', a: 16, b: 8 },
  { op: '-', a: 18, b: 9 },
  { op: '-', a: 20, b: 6 },
  { op: '-', a: 20, b: 8 },
  { op: '-', a: 19, b: 5 },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function computeWeight(factKey, lastPickedKey) {
  if (factKey === lastPickedKey) {
    return 0.15;
  }
  const stats = GameState.factStats && GameState.factStats[factKey];
  if (!stats || stats.attempts === 0) {
    // Unseen facts get a high baseline priority so players explore the pool.
    return 3.5;
  }
  let weight = 1.0;
  const accuracy = stats.correct / stats.attempts;
  if (accuracy < 0.85) {
    weight += (1 - accuracy) * 5.0;
  }
  if (stats.avgMs > 2200) {
    weight += Math.min(4.0, (stats.avgMs - 2200) / 700);
  } else if (stats.fastCount >= 3 && accuracy >= 0.9) {
    // Mastered fast facts appear less often but stay in rotation.
    weight = 0.5;
  }
  return Math.max(0.2, weight);
}

let lastSingleFactKey = null;

export const MathEngine = {
  /**
   * Generates 4 distinct non-negative integer choices mapped to top/left/bottom/right
   * with plausible close distractors tailored for 2nd grade arithmetic.
   */
  generateDiamondChoices(correctAnswer, minVal = 0, maxVal = 99) {
    const safeMin = Math.max(0, Math.min(minVal, correctAnswer));
    const safeMax = Math.max(maxVal, correctAnswer + 4);

    // Candidate offsets ordered by pedagogical plausibility (off-by-1, off-by-2, ±10 for 2-digit).
    const candidateOffsets = [1, -1, 2, -2, 3, -3];
    if (correctAnswer >= 12 || safeMax >= 25) {
      candidateOffsets.push(10, -10, 9, -9, 11, -11);
    }
    candidateOffsets.push(4, -4, 5, -5);

    const shuffledOffsets = shuffle(candidateOffsets);
    const chosen = new Set([correctAnswer]);

    for (const offset of shuffledOffsets) {
      if (chosen.size >= 4) break;
      const val = correctAnswer + offset;
      if (val >= safeMin && val <= safeMax && val >= 0) {
        chosen.add(val);
      }
    }

    // Fallback scan if range is very tight (e.g., 0..5).
    for (let delta = 1; chosen.size < 4 && delta <= 20; delta++) {
      if (correctAnswer + delta <= safeMax) chosen.add(correctAnswer + delta);
      if (chosen.size < 4 && correctAnswer - delta >= safeMin && correctAnswer - delta >= 0) {
        chosen.add(correctAnswer - delta);
      }
    }

    const values = shuffle([...chosen]);
    const result = {};
    let correctDir = 'top';
    for (let i = 0; i < 4; i++) {
      const dir = DIRECTIONS[i];
      result[dir] = values[i];
      if (values[i] === correctAnswer) {
        correctDir = dir;
      }
    }
    result.correctDir = correctDir;
    return result;
  },

  /**
   * Generates a single-step mental math fact using adaptive spaced repetition weights.
   */
  generateSingleFact(tier = 1) {
    let pool;
    if (tier === 1) {
      pool = TIER_1_FACTS;
    } else if (tier === 2) {
      pool = TIER_2_FACTS;
    } else {
      pool = [...TIER_2_FACTS, ...TIER_3_EXTRA_FACTS];
    }

    const weights = pool.map((item) => {
      const key = `${item.a}${item.op}${item.b}`;
      return computeWeight(key, lastSingleFactKey);
    });

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    let r = Math.random() * totalWeight;
    let picked = pool[0];
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        picked = pool[i];
        break;
      }
    }

    const answer = picked.op === '+' ? picked.a + picked.b : picked.a - picked.b;
    const key = `${picked.a}${picked.op}${picked.b}`;
    lastSingleFactKey = key;

    const minChoice = Math.max(0, answer - 5);
    const maxChoice = Math.max(20, answer + 6);

    return {
      key,
      prompt: `${picked.a} ${picked.op} ${picked.b}`,
      op: picked.op,
      a: picked.a,
      b: picked.b,
      answer,
      choices: this.generateDiamondChoices(answer, minChoice, maxChoice),
    };
  },

  /**
   * Generates a multi-digit step-by-step problem teaching Ones column first,
   * Regrouping/Carrying or Borrowing, and then Tens column.
   */
  generateMultiDigitProblem(difficulty = 1) {
    let op = '+';
    let needsRegroup = false;

    if (difficulty <= 1) {
      op = '+';
      // 65% with regrouping so the player gets plenty of carry practice, 35% without.
      needsRegroup = Math.random() < 0.65;
    } else {
      // Difficulty 2 mixes 2-digit addition with regrouping and 2-digit subtraction (with & without borrowing).
      if (Math.random() < 0.4) {
        op = '+';
        needsRegroup = true;
      } else {
        op = '-';
        needsRegroup = Math.random() < 0.7;
      }
    }

    let aTens, aOnes, bTens, bOnes;

    if (op === '+') {
      aTens = randomInt(2, 5);
      bTens = randomInt(1, 9 - aTens - 1);
      if (needsRegroup) {
        aOnes = randomInt(4, 9);
        bOnes = randomInt(10 - aOnes, 9);
      } else {
        aOnes = randomInt(1, 7);
        bOnes = randomInt(1, 9 - aOnes);
      }
    } else {
      aTens = randomInt(4, 8);
      bTens = randomInt(1, aTens - 1);
      if (needsRegroup) {
        aOnes = randomInt(1, 6);
        bOnes = randomInt(aOnes + 1, 9);
      } else {
        aOnes = randomInt(3, 9);
        bOnes = randomInt(1, aOnes - 1);
      }
    }

    const a = aTens * 10 + aOnes;
    const b = bTens * 10 + bOnes;
    const answer = op === '+' ? a + b : a - b;
    const steps = [];

    if (op === '+') {
      const onesSum = aOnes + bOnes;
      const onesDigit = onesSum % 10;
      const carryTen = onesSum >= 10 ? 1 : 0;

      steps.push({
        column: 'ones',
        prompt: `First, add the ONES: ${aOnes} + ${bOnes} = ?`,
        subEquation: `${aOnes} + ${bOnes}`,
        factKey: `${aOnes}+${bOnes}`,
        correctValue: onesSum,
        onesDigit,
        carryTen,
        choices: this.generateDiamondChoices(onesSum, 0, 19),
      });

      const tensSum = aTens + bTens + carryTen;
      if (carryTen === 1) {
        steps.push({
          column: 'tens',
          prompt: `Carry the 1 ten! Now add the TENS: 1 + ${aTens} + ${bTens} = ?`,
          subEquation: `1 + ${aTens} + ${bTens}`,
          factKey: `${aTens}+${bTens}+1`,
          correctValue: tensSum,
          choices: this.generateDiamondChoices(tensSum, 1, 9),
        });
      } else {
        steps.push({
          column: 'tens',
          prompt: `Now add the TENS: ${aTens} + ${bTens} = ?`,
          subEquation: `${aTens} + ${bTens}`,
          factKey: `${aTens}+${bTens}`,
          correctValue: tensSum,
          choices: this.generateDiamondChoices(tensSum, 1, 9),
        });
      }
    } else {
      if (needsRegroup) {
        const borrowedOnes = 10 + aOnes;
        const remainingTens = aTens - 1;
        const onesDiff = borrowedOnes - bOnes;
        const tensDiff = remainingTens - bTens;

        steps.push({
          column: 'borrow',
          prompt: `${aOnes} is smaller than ${bOnes}! Borrow 1 ten from ${aTens * 10}: ${aOnes} ones becomes...`,
          subEquation: `10 + ${aOnes}`,
          factKey: `10+${aOnes}`,
          correctValue: borrowedOnes,
          choices: this.generateDiamondChoices(borrowedOnes, 10, 19),
        });

        steps.push({
          column: 'ones',
          prompt: `Now subtract the ONES: ${borrowedOnes} - ${bOnes} = ?`,
          subEquation: `${borrowedOnes} - ${bOnes}`,
          factKey: `${borrowedOnes}-${bOnes}`,
          correctValue: onesDiff,
          onesDigit: onesDiff,
          carryTen: 0,
          choices: this.generateDiamondChoices(onesDiff, 0, 9),
        });

        steps.push({
          column: 'tens',
          prompt: `Now subtract the TENS: ${remainingTens} - ${bTens} = ?`,
          subEquation: `${remainingTens} - ${bTens}`,
          factKey: `${remainingTens}-${bTens}`,
          correctValue: tensDiff,
          choices: this.generateDiamondChoices(tensDiff, 1, 9),
        });
      } else {
        const onesDiff = aOnes - bOnes;
        const tensDiff = aTens - bTens;

        steps.push({
          column: 'ones',
          prompt: `First, subtract the ONES: ${aOnes} - ${bOnes} = ?`,
          subEquation: `${aOnes} - ${bOnes}`,
          factKey: `${aOnes}-${bOnes}`,
          correctValue: onesDiff,
          onesDigit: onesDiff,
          carryTen: 0,
          choices: this.generateDiamondChoices(onesDiff, 0, 9),
        });

        steps.push({
          column: 'tens',
          prompt: `Now subtract the TENS: ${aTens} - ${bTens} = ?`,
          subEquation: `${aTens} - ${bTens}`,
          factKey: `${aTens}-${bTens}`,
          correctValue: tensDiff,
          choices: this.generateDiamondChoices(tensDiff, 1, 9),
        });
      }
    }

    return {
      op,
      a,
      b,
      aTens,
      aOnes,
      bTens,
      bOnes,
      answer,
      needsRegroup,
      steps,
    };
  },

  /**
   * Generates a 4x4 Park Munchers board with a target number and 16 cells
   * (6 matching target equations and 10 non-matching distractor equations).
   */
  generateMunchersBoard(tier = 1) {
    const targetsByTier = {
      1: [10, 12, 14],
      2: [12, 13, 14, 15, 16],
      3: [13, 14, 15, 16, 17, 18],
    };
    const targetList = targetsByTier[tier] || targetsByTier[2];
    const target = targetList[randomInt(0, targetList.length - 1)];

    // Build candidate matching equations for `target`.
    const matchingPool = [];
    for (let a = 1; a < target; a++) {
      const b = target - a;
      if (a <= 12 && b <= 12) {
        matchingPool.push({ prompt: `${a} + ${b}`, key: `${a}+${b}`, value: target });
      }
    }
    for (let b = 1; b <= 6; b++) {
      const a = target + b;
      if (a <= 20) {
        matchingPool.push({ prompt: `${a} - ${b}`, key: `${a}-${b}`, value: target });
      }
    }

    // Build candidate non-matching equations with values close to `target`.
    const distractorPool = [];
    const offsets = [-3, -2, -1, 1, 2, 3];
    for (const offset of offsets) {
      const val = target + offset;
      if (val < 4) continue;
      for (let a = 2; a < val; a++) {
        const b = val - a;
        if (a <= 10 && b <= 10) {
          distractorPool.push({ prompt: `${a} + ${b}`, key: `${a}+${b}`, value: val });
        }
      }
      for (let b = 1; b <= 5; b++) {
        const a = val + b;
        if (a <= 20) {
          distractorPool.push({ prompt: `${a} - ${b}`, key: `${a}-${b}`, value: val });
        }
      }
    }

    const selectedMatching = shuffle(matchingPool).slice(0, 6).map((item) => ({
      ...item,
      isMatch: true,
      munched: false,
    }));

    const selectedDistractors = shuffle(distractorPool).slice(0, 10).map((item) => ({
      ...item,
      isMatch: false,
      munched: false,
    }));

    const cells = shuffle([...selectedMatching, ...selectedDistractors]).map((cell, idx) => ({
      ...cell,
      row: Math.floor(idx / 4),
      col: idx % 4,
      index: idx,
    }));

    return {
      target,
      totalMatches: 6,
      cells,
      grid: [
        cells.slice(0, 4),
        cells.slice(4, 8),
        cells.slice(8, 12),
        cells.slice(12, 16),
      ],
    };
  },
};
