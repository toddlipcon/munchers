/**
 * Auto-ported Pet Avatars (71 Dog Breeds + 32 Cat Breeds) and Closet Gear (179 Items across 9 slots)
 * from ../math-game/ for Puppy Treat Cafe & Dog Park Adventure.
 */

let _idCounter = 0;
function useId() {
  _idCounter = (_idCounter + 1) % 100000;
  return "pet-clip-" + _idCounter;
}
const __jsx_Fragment = Symbol("Fragment");
const motion = new Proxy({}, {
  get: (_, tag) => tag
});
const AnimatePresence = ({ children }) => children;

const CAMEL_SVG_ATTRS = new Set([
  "viewBox", "preserveAspectRatio", "gradientUnits", "gradientTransform",
  "patternUnits", "patternTransform", "clipPathUnits", "maskUnits",
  "stdDeviation", "baseFrequency", "numOctaves", "stitchTiles",
  "spreadMethod", "startOffset", "textLength", "lengthAdjust",
  "filterUnits", "primitiveUnits", "specularConstant", "specularExponent",
  "surfaceScale", "diffuseConstant", "kernelMatrix", "targetX", "targetY",
  "edgeMode", "xChannelSelector", "yChannelSelector"
]);

const SKIP_PROPS = new Set([
  "initial", "animate", "exit", "transition", "variants", "whileHover", "whileTap", "key"
]);

function formatAttrName(k) {
  if (k === "className") return "class";
  if (CAMEL_SVG_ATTRS.has(k)) return k;
  return k.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
}

function escapeAttr(val) {
  return String(val).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function __jsx_h(tag, props, ...children) {
  const flatChildren = [];
  const pushChild = (c) => {
    if (c === null || c === undefined || c === false || c === true) return;
    if (Array.isArray(c)) {
      for (const item of c) pushChild(item);
    } else {
      flatChildren.push(String(c));
    }
  };
  for (const c of children) pushChild(c);

  if (tag === __jsx_Fragment) {
    return flatChildren.join("");
  }
  if (typeof tag === "function") {
    return tag({ ...(props || {}), children: flatChildren }) || "";
  }
  let attrStr = "";
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === null || v === undefined || v === false || k === "children" || SKIP_PROPS.has(k)) continue;
      if (k === "style" && typeof v === "object") {
        const styleStr = Object.entries(v)
          .map(([sk, sv]) => sk.replace(/[A-Z]/g, m => "-" + m.toLowerCase()) + ":" + sv)
          .join(";");
        if (styleStr) attrStr += ` style="${escapeAttr(styleStr)}"`;
        continue;
      }
      if (typeof v === "function" || typeof v === "object") continue;
      const attrName = formatAttrName(k);
      attrStr += ` ${attrName}="${escapeAttr(v)}"`;
    }
  }
  if (tag === "svg" && (!props || !props.xmlns)) {
    attrStr = ` xmlns="http://www.w3.org/2000/svg"` + attrStr;
  }
  if (flatChildren.length === 0) {
    return `<${tag}${attrStr}/>`;
  }
  return `<${tag}${attrStr}>${flatChildren.join("")}</${tag}>`;
}

const { EXTRA_GEAR_INFO, ExtraLayer } = (() => {
 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }// The big closet: 80 more accessories, mostly built from a few families with different colours.
// Drawn in the shared pet frame: hats sit on y≈46, eyes on y=82 (x=82/118), the neck near y=120,
// and outfits/back pieces are drawn for a body 40 wide (the avatar stretches them to fit).




const O = '#3b2a1a';
const line = { stroke: O, strokeWidth: 3, strokeLinejoin: 'round'  };
const thin = { stroke: O, strokeWidth: 2, strokeLinejoin: 'round'  };

function star(cx, cy, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d + 'Z';
}

function flower(cx, cy, r, petal, centre = '#fde047', n = 5) {
  return (
    __jsx_h('g', { key: `${cx}-${cy}`,}
      , Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return __jsx_h('circle', { key: i, cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: r * 0.85, fill: petal, stroke: O, strokeWidth: 1.1,} );
      })
      , __jsx_h('circle', { cx: cx, cy: cy, r: r * 0.7, fill: centre, stroke: O, strokeWidth: 1.1,} )
    )
  );
}

/** Points along the neck curve, for necklaces. */
const arc = (n, x0 = 66, x1 = 134, y = 124, sag = 15) =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [x0 + t * (x1 - x0), y + Math.sin(t * Math.PI) * sag] ;
  });

/* ---------------- hats ---------------- */

function Beanie({ c, band }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M60 54 Q58 10 100 8 Q142 10 140 54Z"         , fill: c, ...line,} )
      , __jsx_h('path', { d: "M80 14 Q76 34 78 50 M100 10 L100 50 M120 14 Q124 34 122 50"               , stroke: O, strokeWidth: 1.4, opacity: 0.25, fill: "none",} )
      , __jsx_h('path', { d: "M57 46 Q100 36 143 46 L143 58 Q100 48 57 58Z"           , fill: band, ...line,} )
      , __jsx_h('g', { stroke: O, strokeWidth: 1.2, opacity: 0.3,}
        , Array.from({ length: 13 }, (_, i) => (
          __jsx_h('path', { key: i, d: `M${62 + i * 6.3} ${44 - Math.sin((i / 12) * Math.PI) * 4} l0 11`,} )
        ))
      )
      , __jsx_h('circle', { cx: 100, cy: 6, r: 10, fill: band, ...line,} )
    )
  );
}

function Cap({ c, brim }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 50 Q62 12 100 10 Q138 12 138 50Z"         , fill: c, ...line,} )
      , __jsx_h('path', { d: "M100 12 L100 50 M80 16 Q74 32 76 48 M120 16 Q126 32 124 48"               , stroke: O, strokeWidth: 1.4, opacity: 0.3, fill: "none",} )
      , __jsx_h('circle', { cx: 100, cy: 11, r: 3.5, fill: brim, ...thin,} )
      , __jsx_h('path', { d: star(100, 32, 8), fill: "white", opacity: 0.9,} )
      , __jsx_h('path', { d: "M58 48 Q100 72 142 48 Q100 58 58 48Z"         , fill: brim, ...line,} )
    )
  );
}

function PartyHat2({ c, stripe, ball }) {
  return (
    __jsx_h('g', { transform: "rotate(-10 96 40)"  ,}
      , __jsx_h('path', { d: "M72 46 L96 -6 L120 46Z"     , fill: c, ...line,} )
      , __jsx_h('path', { d: star(96, 26, 5), fill: stripe,} )
      , __jsx_h('circle', { cx: 86, cy: 38, r: 3, fill: stripe,} )
      , __jsx_h('circle', { cx: 106, cy: 36, r: 3, fill: stripe,} )
      , __jsx_h('circle', { cx: 96, cy: -8, r: 7, fill: ball, ...thin,} )
    )
  );
}

function TopHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M76 44 L78 -6 Q100 -12 122 -6 L124 44Z"         , fill: "#1f2937", ...line,} )
      , __jsx_h('path', { d: "M77 30 Q100 34 123 30 L123.5 40 Q100 44 76.5 40Z"           , fill: "#dc2626",} )
      , __jsx_h('ellipse', { cx: 100, cy: 46, rx: 40, ry: 7, fill: "#111827", ...line,} )
      , __jsx_h('path', { d: "M84 0 L84 26"   , stroke: "white", strokeWidth: 3, opacity: 0.15, strokeLinecap: "round",} )
    )
  );
}

function PirateHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M48 52 Q56 14 100 16 Q144 14 152 52 Q124 38 100 46 Q76 38 48 52Z"                 , fill: "#1f2937", ...line,} )
      , __jsx_h('path', { d: "M52 48 Q76 36 100 43 Q124 36 148 48"         , stroke: "#facc15", strokeWidth: 3, fill: "none",} )
      , __jsx_h('circle', { cx: 100, cy: 28, r: 7, fill: "white",} )
      , __jsx_h('path', { d: "M96 27 h2 M102 27 h2 M97 32 h6"        , stroke: "#1f2937", strokeWidth: 1.6,} )
      , __jsx_h('path', { d: "M90 36 L110 44 M110 36 L90 44"       , stroke: "white", strokeWidth: 3, strokeLinecap: "round",} )
    )
  );
}

function VikingHelmet() {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('path', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined, d: "M66 40 C48 38 38 22 44 2 C50 16 58 24 70 28Z"             , fill: "#fef3c7", ...line,} )
      ))
      , __jsx_h('path', { d: "M62 54 Q62 14 100 12 Q138 14 138 54Z"         , fill: "#9ca3af", ...line,} )
      , __jsx_h('path', { d: "M100 12 L100 54"   , stroke: "#6b7280", strokeWidth: 6,} )
      , __jsx_h('path', { d: "M60 46 Q100 38 140 46 L140 56 Q100 48 60 56Z"           , fill: "#92400e", ...line,} )
      , [70, 85, 100, 115, 130].map((x) => (
        __jsx_h('circle', { key: x, cx: x, cy: 49, r: 2, fill: "#fde68a",} )
      ))
    )
  );
}

function SantaHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 50 Q66 10 104 6 Q136 4 154 34 L144 40 Q126 22 112 24 Q136 30 138 50Z"                   , fill: "#dc2626", ...line,} )
      , __jsx_h('path', { d: "M58 44 Q100 34 142 44 L142 56 Q100 48 58 56Z"           , fill: "white", ...line,} )
      , __jsx_h('circle', { cx: 152, cy: 40, r: 9, fill: "white", ...line,} )
    )
  );
}

function ElfHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M64 50 Q88 28 124 -14 Q128 20 136 50Z"         , fill: "#16a34a", ...line,} )
      , __jsx_h('path', { d: "M62 44 Q100 36 138 44 L138 54 Q100 46 62 54Z"           , fill: "#dc2626", ...line,} )
      , __jsx_h('g', { fill: "#fde047",}
        , [70, 84, 100, 116, 130].map((x) => (
          __jsx_h('path', { key: x, d: `M${x - 4} 54 L${x} 60 L${x + 4} 54Z`,} )
        ))
      )
      , __jsx_h('circle', { cx: 124, cy: -16, r: 5.5, fill: "#facc15", ...thin,} )
    )
  );
}

function PropellerCap() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 52 Q62 14 100 12 L100 52Z"       , fill: "#ef4444", ...line,} )
      , __jsx_h('path', { d: "M100 12 Q138 14 138 52 L100 52Z"       , fill: "#3b82f6", ...line,} )
      , __jsx_h('path', { d: "M62 52 Q62 34 72 24 L100 52Z"       , fill: "#facc15", opacity: 0.9,} )
      , __jsx_h('path', { d: "M138 52 Q138 34 128 24 L100 52Z"       , fill: "#22c55e", opacity: 0.9,} )
      , __jsx_h('path', { d: "M58 48 Q100 62 142 48 Q100 54 58 48Z"         , fill: "#1d4ed8", ...thin,} )
      , __jsx_h('path', { d: "M100 12 L100 2"   , stroke: O, strokeWidth: 3,} )
      , __jsx_h(motion.g, { style: { originX: 0.5, originY: 0.5 }, animate: { scaleX: [1, -1, 1] }, transition: { duration: 0.5, repeat: Infinity, ease: 'linear' },}
        , __jsx_h('ellipse', { cx: 86, cy: 1, rx: 14, ry: 4, fill: "#facc15", ...thin,} )
        , __jsx_h('ellipse', { cx: 114, cy: 1, rx: 14, ry: 4, fill: "#f472b6", ...thin,} )
      )
      , __jsx_h('circle', { cx: 100, cy: 1, r: 3, fill: O,} )
    )
  );
}

function GradCap() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M72 34 L72 50 Q100 60 128 50 L128 34Z"         , fill: "#111827", ...line,} )
      , __jsx_h('path', { d: "M46 30 L100 12 L154 30 L100 48Z"       , fill: "#1f2937", ...line,} )
      , __jsx_h('circle', { cx: 100, cy: 30, r: 3, fill: "#facc15",} )
      , __jsx_h('path', { d: "M100 30 L140 38 L140 58"     , stroke: "#facc15", strokeWidth: 2.5, fill: "none",} )
      , __jsx_h('path', { d: "M136 56 L144 56 L142 68 L138 68Z"       , fill: "#facc15", ...thin,} )
    )
  );
}

function FireHelmet() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M50 52 Q52 40 64 40 L136 40 Q148 40 150 52 Q100 60 50 52Z"               , fill: "#b91c1c", ...line,} )
      , __jsx_h('path', { d: "M64 46 Q62 10 100 8 Q138 10 136 46Z"         , fill: "#dc2626", ...line,} )
      , __jsx_h('path', { d: "M100 8 L100 44"   , stroke: "#991b1b", strokeWidth: 5,} )
      , __jsx_h('path', { d: "M90 22 L110 22 L112 38 L100 44 L88 38Z"         , fill: "#facc15", ...thin,} )
      , __jsx_h('text', { x: 100, y: 36, textAnchor: "middle", fontSize: 11, fontWeight: 900, fill: "#991b1b",}, "1")
    )
  );
}

function Halo() {
  return (
    __jsx_h(motion.g, { animate: { y: [0, -4, 0] }, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },}
      , __jsx_h('ellipse', { cx: 100, cy: 22, rx: 32, ry: 8, fill: "none", stroke: "#fde047", strokeWidth: 9, opacity: 0.35,} )
      , __jsx_h('ellipse', { cx: 100, cy: 22, rx: 32, ry: 8, fill: "none", stroke: "#facc15", strokeWidth: 5,} )
      , __jsx_h('ellipse', { cx: 100, cy: 20.5, rx: 30, ry: 6.5, fill: "none", stroke: "#fef9c3", strokeWidth: 1.5,} )
    )
  );
}

function UnicornHorn() {
  return (
    __jsx_h('g', null
      , flower(82, 44, 5, '#f9a8d4')
      , flower(118, 44, 5, '#a5b4fc')
      , __jsx_h('path', { d: "M90 46 L100 -10 L110 46Z"     , fill: "#fde68a", ...line,} )
      , __jsx_h('path', { d: "M92 38 L108 30 M94 26 L106 20 M96 14 L104 10"           , stroke: "#f59e0b", strokeWidth: 2.5, strokeLinecap: "round",} )
      , __jsx_h('circle', { cx: 100, cy: -10, r: 2, fill: "white",} )
    )
  );
}

function Antlers() {
  return (
    __jsx_h('g', { fill: "none", strokeLinecap: "round", strokeLinejoin: "round",}
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('path', { d: "M80 46 C76 32 72 22 64 8 M73 26 C64 24 56 18 52 10 M77 36 C68 36 60 32 56 26 M68 16 C70 10 72 6 76 2"                               , stroke: O, strokeWidth: 9,} )
          , __jsx_h('path', { d: "M80 46 C76 32 72 22 64 8 M73 26 C64 24 56 18 52 10 M77 36 C68 36 60 32 56 26 M68 16 C70 10 72 6 76 2"                               , stroke: "#a16207", strokeWidth: 5,} )
        )
      ))
      , __jsx_h('path', { d: "M66 50 Q100 30 134 50"     , stroke: "#dc2626", strokeWidth: 5,} )
      , flower(100, 38, 4, '#16a34a', '#dc2626', 3)
    )
  );
}

function BeeAntennae() {
  return (
    __jsx_h('g', { fill: "none", strokeLinecap: "round",}
      , __jsx_h('path', { d: "M60 56 Q100 22 140 56"     , stroke: O, strokeWidth: 7,} )
      , __jsx_h('path', { d: "M60 56 Q100 22 140 56"     , stroke: "#1f2937", strokeWidth: 4,} )
      , [0, 1].map((s) => (
        __jsx_h(motion.g, { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined, animate: { rotate: [0, -8, 0] }, transition: { duration: 1.2, repeat: Infinity, delay: s * 0.3 }, style: { originX: 1, originY: 1 },}
          , __jsx_h('path', { d: "M86 36 C84 22 78 14 70 10"       , stroke: "#1f2937", strokeWidth: 3,} )
          , __jsx_h('circle', { cx: 69, cy: 9, r: 7, fill: "#facc15", stroke: O, strokeWidth: 2,} )
          , __jsx_h('path', { d: "M63 9 L75 9"   , stroke: "#1f2937", strokeWidth: 2.5,} )
        )
      ))
    )
  );
}

function Sunflower() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M120 54 Q126 48 134 50"     , stroke: "#16a34a", strokeWidth: 4, fill: "none",} )
      , Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return __jsx_h('ellipse', { key: i, cx: 132 + Math.cos(a) * 11, cy: 44 + Math.sin(a) * 11, rx: 7, ry: 3.6, transform: `rotate(${(a * 180) / Math.PI} ${132 + Math.cos(a) * 11} ${44 + Math.sin(a) * 11})`, fill: "#facc15", stroke: O, strokeWidth: 1.2,} );
      })
      , __jsx_h('circle', { cx: 132, cy: 44, r: 8, fill: "#78350f", ...thin,} )
      , __jsx_h('g', { fill: "#451a03",}
        , __jsx_h('circle', { cx: 129, cy: 42, r: 1.2,} )
        , __jsx_h('circle', { cx: 134, cy: 41, r: 1.2,} )
        , __jsx_h('circle', { cx: 131, cy: 46, r: 1.2,} )
        , __jsx_h('circle', { cx: 135, cy: 46, r: 1.2,} )
      )
    )
  );
}

function Headphones() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M54 76 Q52 20 100 18 Q148 20 146 76"         , fill: "none", stroke: O, strokeWidth: 11, strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M54 76 Q52 20 100 18 Q148 20 146 76"         , fill: "none", stroke: "#a855f7", strokeWidth: 6, strokeLinecap: "round",} )
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('rect', { x: 44, y: 68, width: 20, height: 30, rx: 9, fill: "#f472b6", ...line,} )
          , __jsx_h('rect', { x: 48, y: 72, width: 8, height: 22, rx: 4, fill: "#fbcfe8",} )
        )
      ))
    )
  );
}

function PumpkinHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M58 54 Q54 14 100 12 Q146 14 142 54 Q100 46 58 54Z"             , fill: "#f97316", ...line,} )
      , __jsx_h('path', { d: "M78 16 Q70 34 74 52 M100 12 L100 48 M122 16 Q130 34 126 52"               , stroke: "#c2410c", strokeWidth: 2.5, fill: "none",} )
      , __jsx_h('path', { d: "M98 14 Q96 4 104 0"     , stroke: "#15803d", strokeWidth: 5, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M104 8 Q116 0 122 8 Q114 14 104 8Z"         , fill: "#22c55e", ...thin,} )
    )
  );
}

function MushroomHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M48 54 Q50 4 100 2 Q150 4 152 54 Q100 42 48 54Z"             , fill: "#ef4444", ...line,} )
      , __jsx_h('g', { fill: "white", stroke: O, strokeWidth: 1.2,}
        , __jsx_h('ellipse', { cx: 100, cy: 18, rx: 9, ry: 6,} )
        , __jsx_h('ellipse', { cx: 74, cy: 30, rx: 7, ry: 5,} )
        , __jsx_h('ellipse', { cx: 126, cy: 30, rx: 7, ry: 5,} )
        , __jsx_h('ellipse', { cx: 62, cy: 46, rx: 4, ry: 3,} )
        , __jsx_h('ellipse', { cx: 138, cy: 46, rx: 4, ry: 3,} )
        , __jsx_h('ellipse', { cx: 92, cy: 38, rx: 4, ry: 3,} )
        , __jsx_h('ellipse', { cx: 112, cy: 40, rx: 4.5, ry: 3.2,} )
      )
    )
  );
}

function DuckHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M60 54 Q58 8 100 6 Q142 8 140 54 Q100 46 60 54Z"             , fill: "#fde047", ...line,} )
      , __jsx_h('path', { d: "M96 8 Q90 -2 98 -6 M100 8 Q104 -4 110 -4"           , stroke: "#facc15", strokeWidth: 3, fill: "none", strokeLinecap: "round",} )
      , [84, 116].map((x) => (
        __jsx_h('g', { key: x,}
          , __jsx_h('circle', { cx: x, cy: 24, r: 6, fill: "white", ...thin,} )
          , __jsx_h('circle', { cx: x + 1, cy: 25, r: 3, fill: "#1c1410",} )
        )
      ))
      , __jsx_h('path', { d: "M82 38 Q100 30 118 38 Q114 48 100 48 Q86 48 82 38Z"             , fill: "#fb923c", ...line,} )
      , __jsx_h('path', { d: "M86 40 Q100 36 114 40"     , stroke: "#c2410c", strokeWidth: 1.5, fill: "none",} )
    )
  );
}

function RainbowCrown() {
  const pts = [
    ['#ef4444', 'M68 46 L64 14 L80 30Z'],
    ['#f97316', 'M76 46 L80 30 L90 10 L94 46Z'],
    ['#facc15', 'M92 46 L90 10 L100 2 L110 10 L108 46Z'],
    ['#22c55e', 'M106 46 L110 10 L120 30 L124 46Z'],
    ['#3b82f6', 'M122 46 L120 30 L136 14 L132 46Z'],
  ] ;
  return (
    __jsx_h('g', null
      , pts.map(([c, d]) => (
        __jsx_h('path', { key: c, d: d, fill: c, ...thin,} )
      ))
      , __jsx_h('path', { d: "M66 46 L134 46 L132 52 L68 52Z"       , fill: "#a855f7", ...thin,} )
      , __jsx_h('circle', { cx: 100, cy: 2, r: 3, fill: "white", ...thin,} )
    )
  );
}

function HairBow({ c, dots }) {
  return (
    __jsx_h('g', { transform: "rotate(-16 72 46)"  , stroke: O, strokeWidth: 2.5, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M72 46 L50 32 Q46 46 50 60Z"       , fill: c,} )
      , __jsx_h('path', { d: "M72 46 L94 32 Q98 46 94 60Z"       , fill: c,} )
      , dots && (
        __jsx_h('g', { fill: dots, stroke: "none",}
          , __jsx_h('circle', { cx: 56, cy: 42, r: 2,} )
          , __jsx_h('circle', { cx: 58, cy: 52, r: 2,} )
          , __jsx_h('circle', { cx: 88, cy: 41, r: 2,} )
          , __jsx_h('circle', { cx: 86, cy: 52, r: 2,} )
        )
      )
      , __jsx_h('circle', { cx: 72, cy: 46, r: 6.5, fill: c,} )
    )
  );
}

function StarClips() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: star(76, 48, 9), fill: "#facc15", ...thin, transform: "rotate(-14 76 48)"  ,} )
      , __jsx_h('path', { d: star(124, 48, 9), fill: "#f472b6", ...thin, transform: "rotate(14 124 48)"  ,} )
      , __jsx_h('circle', { cx: 73, cy: 45, r: 1.5, fill: "white",} )
      , __jsx_h('circle', { cx: 121, cy: 45, r: 1.5, fill: "white",} )
    )
  );
}

function IceCreamHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M60 52 Q58 12 100 10 Q142 12 140 52Z"         , fill: "#fbcfe8", ...line,} )
      , __jsx_h('path', { d: "M60 40 Q66 50 72 42 Q78 54 86 44 Q92 54 100 44 Q108 54 114 44 Q122 54 128 42 Q134 50 140 40 L142 54 Q100 46 58 54Z"                               , fill: "#fdf2f8", stroke: O, strokeWidth: 2,} )
      , __jsx_h('g', { fill: "#a855f7",}
        , [
          [80, 26, 20],
          [96, 20, -30],
          [114, 28, 40],
          [88, 36, 70],
          [122, 38, -10],
        ].map(([x, y, r]) => (
          __jsx_h('rect', { key: x, x: x, y: y, width: 7, height: 2.5, rx: 1.2, transform: `rotate(${r} ${x} ${y})`,} )
        ))
      )
      , __jsx_h('circle', { cx: 100, cy: 4, r: 7, fill: "#dc2626", ...thin,} )
      , __jsx_h('path', { d: "M100 -3 Q104 -12 110 -12"     , stroke: "#15803d", strokeWidth: 2.5, fill: "none",} )
    )
  );
}

function Beret({ c }) {
  return (
    __jsx_h('g', null
      , __jsx_h('ellipse', { cx: 108, cy: 38, rx: 44, ry: 15, fill: c, ...line, transform: "rotate(-10 108 38)"  ,} )
      , __jsx_h('path', { d: "M66 46 Q100 56 140 40"     , stroke: O, strokeWidth: 2, fill: "none", opacity: 0.4,} )
      , __jsx_h('path', { d: "M112 24 L116 14"   , stroke: O, strokeWidth: 4, strokeLinecap: "round",} )
    )
  );
}

function SailorHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M64 52 Q64 22 100 20 Q136 22 136 52Z"         , fill: "white", ...line,} )
      , __jsx_h('path', { d: "M62 44 Q100 36 138 44 L138 54 Q100 46 62 54Z"           , fill: "#1d4ed8", ...line,} )
      , __jsx_h('path', { d: "M56 50 Q100 66 144 50 Q100 58 56 50Z"         , fill: "white", ...line,} )
      , __jsx_h('path', { d: star(100, 32, 5), fill: "#1d4ed8",} )
    )
  );
}

/* ---------------- glasses ---------------- */

const eyeL = 82;
const eyeR = 118;
const eyeY = 82;

function RoundGlasses({ c = '#ca8a04' }) {
  return (
    __jsx_h('g', { fill: "#e0f2fe", fillOpacity: 0.3, stroke: c, strokeWidth: 3.5,}
      , __jsx_h('circle', { cx: eyeL, cy: eyeY, r: 13,} )
      , __jsx_h('circle', { cx: eyeR, cy: eyeY, r: 13,} )
      , __jsx_h('path', { d: "M95 80 Q100 76 105 80"     , fill: "none",} )
    )
  );
}

function NerdGlasses() {
  return (
    __jsx_h('g', null
      , [eyeL, eyeR].map((x) => (
        __jsx_h('rect', { key: x, x: x - 14, y: eyeY - 11, width: 28, height: 22, rx: 6, fill: "#e0f2fe", fillOpacity: 0.25, stroke: "#111827", strokeWidth: 5,} )
      ))
      , __jsx_h('path', { d: "M96 80 L104 80"   , stroke: "#111827", strokeWidth: 5,} )
      , __jsx_h('rect', { x: 96, y: 76, width: 8, height: 8, fill: "white", stroke: "#9ca3af", strokeWidth: 1,} )
    )
  );
}

function StarGlasses() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: star(eyeL, eyeY, 16), fill: "#fde047", fillOpacity: 0.5, stroke: "#f59e0b", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: star(eyeR, eyeY, 16), fill: "#fde047", fillOpacity: 0.5, stroke: "#f59e0b", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M96 80 Q100 76 104 80"     , stroke: "#f59e0b", strokeWidth: 3, fill: "none",} )
    )
  );
}

function Monocle() {
  return (
    __jsx_h('g', null
      , __jsx_h('circle', { cx: eyeR, cy: eyeY, r: 13, fill: "#e0f2fe", fillOpacity: 0.3, stroke: "#ca8a04", strokeWidth: 3.5,} )
      , __jsx_h('path', { d: "M130 88 Q138 108 128 126"     , stroke: "#ca8a04", strokeWidth: 1.8, fill: "none",} )
    )
  );
}

function Glasses3D() {
  return (
    __jsx_h('g', null
      , __jsx_h('rect', { x: 64, y: 70, width: 72, height: 24, rx: 5, fill: "white", ...line,} )
      , __jsx_h('rect', { x: 69, y: 74, width: 26, height: 16, rx: 3, fill: "#ef4444", opacity: 0.85,} )
      , __jsx_h('rect', { x: 105, y: 74, width: 26, height: 16, rx: 3, fill: "#3b82f6", opacity: 0.85,} )
    )
  );
}

function SkiGoggles() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M50 80 L64 80 M136 80 L150 80"       , stroke: "#7c3aed", strokeWidth: 8, strokeLinecap: "round",} )
      , __jsx_h('rect', { x: 62, y: 68, width: 76, height: 28, rx: 14, fill: "#1f2937", ...line,} )
      , __jsx_h('rect', { x: 66, y: 71, width: 68, height: 22, rx: 11, fill: "#fb923c",} )
      , __jsx_h('path', { d: "M72 76 Q100 70 128 76"     , stroke: "#fde68a", strokeWidth: 3, fill: "none", opacity: 0.8,} )
    )
  );
}

function SwimGoggles() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M52 82 L68 82 M132 82 L148 82"       , stroke: "#0ea5e9", strokeWidth: 4,} )
      , [eyeL, eyeR].map((x) => (
        __jsx_h('ellipse', { key: x, cx: x, cy: eyeY, rx: 13, ry: 10, fill: "#38bdf8", fillOpacity: 0.55, stroke: "#0369a1", strokeWidth: 3.5,} )
      ))
      , __jsx_h('path', { d: "M95 82 L105 82"   , stroke: "#0369a1", strokeWidth: 3,} )
    )
  );
}

function RainbowShades() {
  const bands = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "rb-lens",}
          , __jsx_h('path', { d: "M66 74 L96 74 Q96 96 81 96 Q66 96 66 78Z M104 74 L134 74 L134 78 Q134 96 119 96 Q104 96 104 74Z"                         ,} )
        )
      )
      , __jsx_h('g', { clipPath: "url(#rb-lens)",}
        , bands.map((c, i) => (
          __jsx_h('rect', { key: c, x: 60, y: 74 + i * 4, width: 80, height: 4, fill: c,} )
        ))
      )
      , __jsx_h('path', { d: "M66 74 L96 74 Q96 96 81 96 Q66 96 66 78Z M104 74 L134 74 L134 78 Q134 96 119 96 Q104 96 104 74Z"                         , fill: "none", stroke: "white", strokeWidth: 3,} )
      , __jsx_h('path', { d: "M96 77 Q100 73 104 77"     , stroke: "white", strokeWidth: 3, fill: "none",} )
    )
  );
}

function EyePatch() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M58 66 L142 98"   , stroke: "#111827", strokeWidth: 3,} )
      , __jsx_h('ellipse', { cx: eyeL, cy: eyeY + 1, rx: 13, ry: 11, fill: "#111827", ...line,} )
    )
  );
}

function CatEyeGlasses() {
  return (
    __jsx_h('g', { fill: "#fce7f3", fillOpacity: 0.35, stroke: "#db2777", strokeWidth: 3.5, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M64 74 Q80 70 96 76 Q96 94 82 94 Q66 94 64 78 L58 68Z"               ,} )
      , __jsx_h('path', { d: "M136 74 Q120 70 104 76 Q104 94 118 94 Q134 94 136 78 L142 68Z"               ,} )
      , __jsx_h('path', { d: "M96 79 Q100 75 104 79"     , fill: "none",} )
    )
  );
}

function TintedShades({ c }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M68 76 L96 76 Q96 96 82 96 Q68 96 68 80Z"           , fill: c, stroke: "#e5e7eb", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M104 76 L132 76 L132 80 Q132 96 118 96 Q104 96 104 76Z"             , fill: c, stroke: "#e5e7eb", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M96 79 Q100 75 104 79"     , stroke: "#e5e7eb", strokeWidth: 3, fill: "none",} )
      , __jsx_h('path', { d: "M74 80 L80 80 M110 80 L116 80"       , stroke: "white", strokeWidth: 2.5, opacity: 0.6, strokeLinecap: "round",} )
    )
  );
}

function FlowerGlasses() {
  return (
    __jsx_h('g', null
      , [eyeL, eyeR].map((x) => (
        __jsx_h('g', { key: x,}
          , Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return __jsx_h('circle', { key: i, cx: x + Math.cos(a) * 11, cy: eyeY + Math.sin(a) * 11, r: 6, fill: "#fbcfe8", stroke: "#db2777", strokeWidth: 1.5,} );
          })
          , __jsx_h('circle', { cx: x, cy: eyeY, r: 10, fill: "#fef9c3", fillOpacity: 0.4, stroke: "#db2777", strokeWidth: 2.5,} )
        )
      ))
      , __jsx_h('path', { d: "M95 80 Q100 76 105 80"     , stroke: "#db2777", strokeWidth: 3, fill: "none",} )
    )
  );
}

/* ---------------- neck ---------------- */

function Bandana2({ c, dot }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 120 Q100 136 138 120 L100 162Z"       , fill: c, ...line,} )
      , __jsx_h('g', { fill: dot,}
        , [
          [84, 132, 2.5],
          [112, 133, 2.5],
          [100, 146, 2.5],
          [96, 134, 1.5],
          [106, 142, 1.5],
          [92, 142, 1.8],
        ].map(([x, y, r]) => (
          __jsx_h('circle', { key: `${x}-${y}`, cx: x, cy: y, r: r,} )
        ))
      )
    )
  );
}

function BowTie2({ c, dot }) {
  return (
    __jsx_h('g', { stroke: O, strokeWidth: 3, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M100 128 L78 115 L78 141Z"     , fill: c,} )
      , __jsx_h('path', { d: "M100 128 L122 115 L122 141Z"     , fill: c,} )
      , __jsx_h('circle', { cx: 100, cy: 128, r: 6.5, fill: c,} )
      , dot && (
        __jsx_h('g', { fill: dot, stroke: "none",}
          , __jsx_h('circle', { cx: 85, cy: 124, r: 2,} )
          , __jsx_h('circle', { cx: 86, cy: 134, r: 2,} )
          , __jsx_h('circle', { cx: 115, cy: 124, r: 2,} )
          , __jsx_h('circle', { cx: 114, cy: 134, r: 2,} )
        )
      )
    )
  );
}

function Scarf({ a, b }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M118 128 L134 170 L120 174 L106 132Z"       , fill: a, ...line,} )
      , __jsx_h('path', { d: "M124 144 L132 162 M114 136 L120 150"       , stroke: b, strokeWidth: 5,} )
      , __jsx_h('path', { d: "M120 174 L118 180 M126 172 L125 178 M132 170 L132 176"           , stroke: b, strokeWidth: 2.5, strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M60 114 Q100 132 140 114 L142 130 Q100 150 58 130Z"           , fill: a, ...line,} )
      , [72, 92, 112, 130].map((x) => (
        __jsx_h('path', { key: x, d: `M${x} ${118 + (x < 100 ? (x - 60) * 0.25 : (140 - x) * 0.25)} l2 14`, stroke: b, strokeWidth: 6,} )
      ))
    )
  );
}

function Necktie() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M94 124 L106 124 L104 134 L96 134Z"       , fill: "#b91c1c", ...thin,} )
      , __jsx_h('path', { d: "M96 134 L104 134 L110 168 L100 178 L90 168Z"         , fill: "#dc2626", ...line,} )
      , __jsx_h('path', { d: "M95 146 L106 140 M93 158 L108 150 M93 168 L109 160"           , stroke: "#fca5a5", strokeWidth: 2.5,} )
    )
  );
}

function Lei() {
  const colors = ['#f472b6', '#facc15', '#a78bfa', '#fb923c', '#38bdf8'];
  return __jsx_h('g', null, arc(9, 62, 138, 122, 20).map(([x, y], i) => flower(x, y, 4.5, colors[i % colors.length], '#fef9c3')));
}

function GoldChain() {
  return (
    __jsx_h('g', null
      , arc(14, 64, 136, 122, 16).map(([x, y], i) => (
        __jsx_h('ellipse', { key: i, cx: x, cy: y, rx: 4, ry: 3, fill: "none", stroke: "#a16207", strokeWidth: 4,} )
      ))
      , arc(14, 64, 136, 122, 16).map(([x, y], i) => (
        __jsx_h('ellipse', { key: `h${i}`, cx: x, cy: y, rx: 4, ry: 3, fill: "none", stroke: "#facc15", strokeWidth: 2,} )
      ))
    )
  );
}

function Pendant({ shape }) {
  const s = 9;
  const cx = 100;
  const cy = 150;
  const heart = `M${cx} ${cy + s * 0.9} C${cx - s * 1.7} ${cy - s * 0.1} ${cx - s * 0.9} ${cy - s * 1.2} ${cx} ${cy - s * 0.35} C${cx + s * 0.9} ${cy - s * 1.2} ${cx + s * 1.7} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z`;
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M68 122 Q100 148 132 122"     , stroke: shape === 'heart' ? '#ca8a04' : '#9ca3af', strokeWidth: 2, fill: "none",} )
      , __jsx_h('path', { d: shape === 'heart' ? heart : star(cx, cy, 11), fill: shape === 'heart' ? '#facc15' : '#e5e7eb', ...thin,} )
      , __jsx_h('circle', { cx: cx - 3, cy: cy - 3, r: 1.6, fill: "white",} )
    )
  );
}

function RuffleCollar() {
  return (
    __jsx_h('g', null
      , arc(10, 60, 140, 118, 16).map(([x, y], i) => (
        __jsx_h('ellipse', { key: i, cx: x, cy: y + 4, rx: 8, ry: 9, fill: "white", stroke: O, strokeWidth: 1.8,} )
      ))
      , arc(10, 64, 136, 122, 16).map(([x, y], i) => (
        __jsx_h('ellipse', { key: `b${i}`, cx: x, cy: y + 6, rx: 5, ry: 6, fill: "#fbcfe8", stroke: O, strokeWidth: 1.2,} )
      ))
    )
  );
}

function JingleCollar() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 122 Q100 140 138 122"     , stroke: "#15803d", strokeWidth: 9, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M62 122 Q100 140 138 122"     , stroke: "#dc2626", strokeWidth: 3, fill: "none", strokeDasharray: "4 6" , strokeLinecap: "round",} )
      , [
        [80, 138],
        [100, 142],
        [120, 138],
      ].map(([x, y]) => (
        __jsx_h('g', { key: x,}
          , __jsx_h('circle', { cx: x, cy: y, r: 6.5, fill: "#facc15", stroke: O, strokeWidth: 2,} )
          , __jsx_h('path', { d: `M${x - 4} ${y} L${x + 4} ${y}`, stroke: "#a16207", strokeWidth: 1.5,} )
        )
      ))
    )
  );
}

function SailorCollar() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 116 L80 150 L100 128 L120 150 L138 116 Q100 132 62 116Z"             , fill: "#1e3a8a", ...line,} )
      , __jsx_h('path', { d: "M68 122 L82 144 M132 122 L118 144"       , stroke: "white", strokeWidth: 2.5,} )
      , __jsx_h('path', { d: "M92 132 L100 140 L108 132 L104 152 L100 146 L96 152Z"           , fill: "#dc2626", ...thin,} )
    )
  );
}

function DaisyChain() {
  return __jsx_h('g', null, arc(8, 64, 136, 122, 18).map(([x, y]) => flower(x, y, 4, 'white', '#facc15', 6)));
}

/* ---------------- back ---------------- */

function AngelWings() {
  const wing = (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M90 134 C70 100 30 92 18 112 C28 114 30 120 22 128 C34 128 36 134 28 142 C42 142 46 148 40 156 C62 156 80 150 92 142Z"                               , fill: "white", ...line,} )
      , __jsx_h('path', { d: "M40 116 Q60 116 82 130 M38 134 Q60 132 84 138"           , stroke: "#cbd5e1", strokeWidth: 2, fill: "none",} )
    )
  );
  return (
    __jsx_h(motion.g, { style: { originX: 0.5, originY: 0.5 }, animate: { scaleX: [1, 0.92, 1] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },}
      , __jsx_h('g', { transform: "translate(-8 -18)" ,}, wing)
      , __jsx_h('g', { transform: "translate(208 -18) scale(-1 1)"   ,}, wing)
    )
  );
}

function BatWings() {
  const wing = __jsx_h('path', { d: "M90 130 C70 104 40 96 16 104 C24 112 22 120 14 126 C26 128 30 136 24 144 C36 142 44 148 42 158 C56 150 76 148 92 144Z"                               , fill: "#4c1d95", ...line,} );
  return (
    __jsx_h(motion.g, { style: { originX: 0.5, originY: 0.5 }, animate: { scaleX: [1, 0.88, 1] }, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },}
      , __jsx_h('g', { transform: "translate(-8 -18)" ,}, wing)
      , __jsx_h('g', { transform: "translate(208 -18) scale(-1 1)"   ,}, wing)
    )
  );
}

function DragonWings() {
  const wing = (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M90 136 C72 96 40 74 12 80 L22 96 L10 108 L26 116 L16 130 L34 134 L28 148 C52 146 76 148 92 146Z"                         , fill: "#22c55e", ...line,} )
      , __jsx_h('path', { d: "M88 138 L22 96 M88 140 L26 116 M88 142 L34 134"           , stroke: "#15803d", strokeWidth: 2.5,} )
    )
  );
  return (
    __jsx_h(motion.g, { style: { originX: 0.5, originY: 0.5 }, animate: { scaleX: [1, 0.9, 1] }, transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },}
      , __jsx_h('g', { transform: "translate(-8 -18)" ,}, wing)
      , __jsx_h('g', { transform: "translate(208 -18) scale(-1 1)"   ,}, wing)
    )
  );
}

function BeeWings() {
  const wing = (
    __jsx_h('g', { fill: "#e0f2fe", fillOpacity: 0.75, stroke: "#7dd3fc", strokeWidth: 2.5,}
      , __jsx_h('ellipse', { cx: 52, cy: 122, rx: 30, ry: 18, transform: "rotate(-25 52 122)"  ,} )
      , __jsx_h('ellipse', { cx: 56, cy: 150, rx: 22, ry: 13, transform: "rotate(15 56 150)"  ,} )
    )
  );
  return (
    __jsx_h(motion.g, { style: { originX: 0.5, originY: 0.5 }, animate: { scaleX: [1, 0.8, 1] }, transition: { duration: 0.25, repeat: Infinity },}
      , __jsx_h('g', { transform: "translate(-8 -18)" ,}, wing)
      , __jsx_h('g', { transform: "translate(208 -18) scale(-1 1)"   ,}, wing)
    )
  );
}

function Backpack() {
  return (
    __jsx_h('g', null
      , __jsx_h('rect', { x: 42, y: 124, width: 22, height: 50, rx: 9, fill: "#3b82f6", ...line,} )
      , __jsx_h('rect', { x: 136, y: 124, width: 22, height: 50, rx: 9, fill: "#3b82f6", ...line,} )
      , __jsx_h('rect', { x: 42, y: 150, width: 22, height: 14, rx: 4, fill: "#facc15", ...thin,} )
      , __jsx_h('rect', { x: 136, y: 150, width: 22, height: 14, rx: 4, fill: "#facc15", ...thin,} )
    )
  );
}

function BackpackStraps() {
  return (
    __jsx_h('g', { stroke: O, strokeWidth: 2, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M70 122 L64 176 L72 176 L78 124Z"       , fill: "#2563eb",} )
      , __jsx_h('path', { d: "M130 122 L136 176 L128 176 L122 124Z"       , fill: "#2563eb",} )
      , __jsx_h('rect', { x: 66, y: 146, width: 10, height: 6, rx: 2, fill: "#facc15",} )
      , __jsx_h('rect', { x: 124, y: 146, width: 10, height: 6, rx: 2, fill: "#facc15",} )
    )
  );
}

function TurtleShell() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M40 200 Q30 130 100 112 Q170 130 160 200Z"         , fill: "#16a34a", ...line,} )
      , __jsx_h('g', { fill: "#4ade80", stroke: "#14532d", strokeWidth: 2,}
        , __jsx_h('path', { d: "M46 170 L58 150 L76 156 L74 178 L56 184Z"         ,} )
        , __jsx_h('path', { d: "M154 170 L142 150 L124 156 L126 178 L144 184Z"         ,} )
        , __jsx_h('path', { d: "M70 132 L86 124 L100 132 L94 146 L76 146Z"         ,} )
        , __jsx_h('path', { d: "M130 132 L114 124 L100 132 L106 146 L124 146Z"         ,} )
      )
      , __jsx_h('path', { d: "M38 198 Q100 210 162 198"     , stroke: "#facc15", strokeWidth: 5, fill: "none",} )
    )
  );
}

function Jetpack() {
  return (
    __jsx_h('g', null
      , [34, 150].map((x) => (
        __jsx_h('g', { key: x,}
          , __jsx_h(motion.path, {
            d: `M${x + 4} 178 Q${x + 8} 200 ${x + 8} 206 Q${x + 12} 196 ${x + 12} 178Z`,
            fill: "#fb923c",
            animate: { scaleY: [1, 1.3, 0.9, 1] },
            transition: { duration: 0.3, repeat: Infinity },
            style: { originX: 0.5, originY: 0 },}
          )
          , __jsx_h('path', { d: `M${x + 6} 178 Q${x + 8} 192 ${x + 8} 196 Q${x + 10} 190 ${x + 10} 178Z`, fill: "#fde047",} )
          , __jsx_h('rect', { x: x, y: 104, width: 16, height: 74, rx: 8, fill: "#cbd5e1", ...line,} )
          , __jsx_h('path', { d: `M${x} 172 L${x + 16} 172`, stroke: O, strokeWidth: 2,} )
          , __jsx_h('rect', { x: x + 4, y: 124, width: 8, height: 10, rx: 2, fill: "#ef4444",} )
        )
      ))
    )
  );
}

function LadybugWings() {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('path', { d: "M96 122 C60 112 34 132 38 168 C42 194 74 200 96 186Z"             , fill: "#dc2626", ...line,} )
          , __jsx_h('g', { fill: "#111827",}
            , __jsx_h('circle', { cx: 60, cy: 142, r: 7,} )
            , __jsx_h('circle', { cx: 52, cy: 170, r: 6,} )
            , __jsx_h('circle', { cx: 78, cy: 164, r: 5,} )
          )
        )
      ))
    )
  );
}

/* ---------------- outfits ---------------- */

const TORSO = 'M64 118 Q100 132 136 118 C144 138 146 160 142 182 Q100 194 58 182 C54 160 56 138 64 118Z';

function Sweater({ c, stripe }) {
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: `sw-${c.slice(1)}`,}
          , __jsx_h('path', { d: TORSO,} )
        )
      )
      , __jsx_h('path', { d: TORSO, fill: c, ...line,} )
      , __jsx_h('g', { clipPath: `url(#sw-${c.slice(1)})`,}
        , [134, 152, 170].map((y) => (
          __jsx_h('rect', { key: y, x: 40, y: y, width: 120, height: 7, fill: stripe,} )
        ))
      )
      , __jsx_h('path', { d: "M58 178 Q100 190 142 178"     , stroke: O, strokeWidth: 1.4, fill: "none", opacity: 0.4, strokeDasharray: "2 3" ,} )
      , __jsx_h('path', { d: "M66 118 Q100 134 134 118"     , stroke: stripe, strokeWidth: 5, fill: "none",} )
    )
  );
}

function Hoodie() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M52 124 Q52 96 72 100 L128 100 Q148 96 148 124 Q100 140 52 124Z"               , fill: "#2563eb", ...line,} )
      , __jsx_h('path', { d: TORSO, fill: "#3b82f6", ...line,} )
      , __jsx_h('path', { d: "M78 156 L122 156 L126 176 L74 176Z"       , fill: "#2563eb", ...thin,} )
      , __jsx_h('path', { d: "M92 126 L90 148 M108 126 L110 148"       , stroke: "white", strokeWidth: 2.5, strokeLinecap: "round",} )
      , __jsx_h('circle', { cx: 90, cy: 149, r: 2.5, fill: "white",} )
      , __jsx_h('circle', { cx: 110, cy: 149, r: 2.5, fill: "white",} )
    )
  );
}

function Raincoat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: TORSO, fill: "#facc15", ...line,} )
      , __jsx_h('path', { d: "M64 118 L86 136 L100 126 L114 136 L136 118 Q100 130 64 118Z"             , fill: "#eab308", ...thin,} )
      , __jsx_h('path', { d: "M100 128 L100 186"   , stroke: O, strokeWidth: 2,} )
      , [146, 162, 178].map((y) => (
        __jsx_h('circle', { key: y, cx: 106, cy: y, r: 3, fill: "#1d4ed8", ...thin,} )
      ))
      , __jsx_h('path', { d: "M68 168 L84 168 M116 168 L132 168"       , stroke: "#a16207", strokeWidth: 2.5, strokeLinecap: "round",} )
    )
  );
}

function Tutu() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M66 126 Q100 138 134 126 L132 160 Q100 168 68 160Z"           , fill: "#f9a8d4", ...line,} )
      , [0, 1].map((layer) => (
        __jsx_h('path', {
          key: layer,
          d: Array.from({ length: 11 }, (_, i) => {
            const x = 38 + i * 12.4;
            const y = 166 + layer * 6 + (i % 2 ? 6 : 0);
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y}`;
          }).join(' ') + ` L160 ${160 + layer * 6} Q100 ${150 + layer * 6} 40 ${160 + layer * 6}Z`,
          fill: layer ? '#fbcfe8' : '#f472b6',
          ...thin,}
        )
      ))
      , [84, 100, 116].map((x) => (
        __jsx_h('circle', { key: x, cx: x, cy: 144, r: 2, fill: "white",} )
      ))
    )
  );
}

function LifeVest() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 120 Q74 116 86 126 L86 184 Q70 186 58 180 C54 158 56 138 62 120Z"                 , fill: "#f97316", ...line,} )
      , __jsx_h('path', { d: "M138 120 Q126 116 114 126 L114 184 Q130 186 142 180 C146 158 144 138 138 120Z"                 , fill: "#f97316", ...line,} )
      , __jsx_h('path', { d: "M60 150 L86 150 M114 150 L140 150"       , stroke: "#e5e7eb", strokeWidth: 5,} )
      , __jsx_h('path', { d: "M86 160 L114 160"   , stroke: "#111827", strokeWidth: 5,} )
      , __jsx_h('rect', { x: 95, y: 155, width: 10, height: 10, rx: 2, fill: "#9ca3af", ...thin,} )
    )
  );
}

function PolkaDress() {
  const skirt = 'M70 124 Q100 136 130 124 L134 150 L150 190 Q100 200 50 190 L66 150Z';
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "polka-dress",}
          , __jsx_h('path', { d: skirt,} )
        )
      )
      , __jsx_h('path', { d: skirt, fill: "#ef4444", ...line,} )
      , __jsx_h('g', { clipPath: "url(#polka-dress)", fill: "white",}
        , Array.from({ length: 24 }, (_, i) => (
          __jsx_h('circle', { key: i, cx: 56 + (i % 6) * 18 + (Math.floor(i / 6) % 2) * 9, cy: 134 + Math.floor(i / 6) * 16, r: 3,} )
        ))
      )
      , __jsx_h('path', { d: "M66 150 Q100 160 134 150"     , stroke: "white", strokeWidth: 4, fill: "none",} )
    )
  );
}

function Tuxedo() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: TORSO, fill: "#111827", ...line,} )
      , __jsx_h('path', { d: "M84 122 L100 132 L116 122 L108 186 L92 186Z"         , fill: "white", ...thin,} )
      , __jsx_h('path', { d: "M84 122 L96 160 L80 150 L70 124Z M116 122 L104 160 L120 150 L130 124Z"               , fill: "#1f2937", stroke: "#4b5563", strokeWidth: 1.5,} )
      , [146, 160, 174].map((y) => (
        __jsx_h('circle', { key: y, cx: 100, cy: y, r: 2, fill: "#111827",} )
      ))
      , __jsx_h('path', { d: "M100 128 L90 122 L90 134Z M100 128 L110 122 L110 134Z"           , fill: "#111827",} )
    )
  );
}

function XmasSweater() {
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "xmas-sw",}
          , __jsx_h('path', { d: TORSO,} )
        )
      )
      , __jsx_h('path', { d: TORSO, fill: "#16a34a", ...line,} )
      , __jsx_h('g', { clipPath: "url(#xmas-sw)",}
        , __jsx_h('rect', { x: 40, y: 140, width: 120, height: 10, fill: "#dc2626",} )
        , __jsx_h('rect', { x: 40, y: 174, width: 120, height: 14, fill: "#dc2626",} )
        , __jsx_h('g', { fill: "white",}
          , [66, 84, 102, 120, 138].map((x) => (
            __jsx_h('path', { key: x, d: star(x, 145, 3.5),} )
          ))
          , [74, 94, 114, 134].map((x) => (
            __jsx_h('path', { key: x, d: star(x, 162, 4.5),} )
          ))
        )
      )
      , __jsx_h('path', { d: "M66 118 Q100 134 134 118"     , stroke: "white", strokeWidth: 5, fill: "none",} )
    )
  );
}

const heartPath = (cx, cy, s) =>
  `M${cx} ${cy + s * 0.9} C${cx - s * 1.7} ${cy - s * 0.1} ${cx - s * 0.9} ${cy - s * 1.2} ${cx} ${cy - s * 0.35} C${cx + s * 0.9} ${cy - s * 1.2} ${cx + s * 1.7} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z`;

/** Scalloped hem: little round bumps from x0 to x1 along y. */
const scallops = (x0, x1, y, n, r) => {
  const w = (x1 - x0) / n;
  let d = `M${x0} ${y}`;
  for (let k = 0; k < n; k++) d += ` a${w / 2} ${r} 0 0 0 ${w} 0`;
  return d;
};

/** Little pirate: striped shirt with a ruffly collar, a short round red coat and a heart buckle. Goes with the Pirate Hat and Patch. */
function PirateOutfit() {
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "pirate-shirt",}
          , __jsx_h('path', { d: TORSO,} )
        )
      )
      , __jsx_h('path', { d: TORSO, fill: "white", ...line,} )
      , __jsx_h('g', { clipPath: "url(#pirate-shirt)",}
        , [136, 152, 168, 184].map((y) => (
          __jsx_h('rect', { key: y, x: 40, y: y, width: 120, height: 7, fill: "#60a5fa",} )
        ))
      )
      /* short, rounded coat panels */
      , __jsx_h('path', { d: "M62 118 Q78 114 88 126 Q90 156 84 176 Q66 182 56 172 C52 152 54 134 62 118Z"                   , fill: "#f87171", ...line,} )
      , __jsx_h('path', { d: "M138 118 Q122 114 112 126 Q110 156 116 176 Q134 182 144 172 C148 152 146 134 138 118Z"                   , fill: "#f87171", ...line,} )
      , __jsx_h('path', { d: "M88 128 Q90 156 84 175 M112 128 Q110 156 116 175"           , stroke: "#fde047", strokeWidth: 3.5, fill: "none", strokeLinecap: "round",} )
      , [142, 158].map((y) => (
        __jsx_h('g', { key: y,}
          , __jsx_h('circle', { cx: 76, cy: y, r: 3.2, fill: "#fde047", ...thin,} )
          , __jsx_h('circle', { cx: 124, cy: y, r: 3.2, fill: "#fde047", ...thin,} )
        )
      ))
      /* ruffly collar */
      , __jsx_h('path', { d: "M84 124 Q100 136 116 124 L112 138 Q100 146 88 138Z"           , fill: "white", ...thin,} )
      , __jsx_h('path', { d: scallops(88, 112, 138, 4, 4), fill: "none", stroke: O, strokeWidth: 1.6,} )
      /* belt with a heart buckle */
      , __jsx_h('path', { d: "M86 164 Q100 168 114 164 L114 172 Q100 176 86 172Z"           , fill: "#7c4a2a", ...thin,} )
      , __jsx_h('path', { d: heartPath(100, 168, 8), fill: "#fde047", ...thin,} )
    )
  );
}

/** Pink ball gown: big puffy striped sleeves, a pearl neckline, a bow at the waist and a ruffled skirt with hearts. */
function PrincessDress() {
  const skirt = 'M72 146 Q100 154 128 146 Q148 168 156 192 Q100 204 44 192 Q52 168 72 146Z';
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "princess-skirt",}
          , __jsx_h('path', { d: skirt,} )
        )
      )
      /* big puffy sleeves */
      , [62, 138].map((x) => (
        __jsx_h('g', { key: x,}
          , __jsx_h('circle', { cx: x, cy: 128, r: 13, fill: "#fbcfe8", ...line,} )
          , __jsx_h('path', { d: `M${x - 6} 117 Q${x - 9} 128 ${x - 6} 139 M${x} 115 L${x} 141 M${x + 6} 117 Q${x + 9} 128 ${x + 6} 139`, stroke: "#f472b6", strokeWidth: 1.6, fill: "none",} )
        )
      ))
      , __jsx_h('path', { d: skirt, fill: "#f9a8d4", ...line,} )
      , __jsx_h('g', { clipPath: "url(#princess-skirt)",}
        /* ruffle layers */
        , __jsx_h('path', { d: scallops(40, 160, 176, 10, 6) + ' L160 210 L40 210Z', fill: "#f472b6", stroke: O, strokeWidth: 1.6,} )
        , [
          [64, 164],
          [100, 162],
          [136, 164],
          [80, 188],
          [120, 188],
        ].map(([x, y]) => (
          __jsx_h('path', { key: `${x}-${y}`, d: heartPath(x, y, 4.5), fill: "white",} )
        ))
      )
      , __jsx_h('path', { d: scallops(44, 156, 192, 12, 4), fill: "none", stroke: "#fde047", strokeWidth: 3,} )
      /* bodice with a pearl neckline */
      , __jsx_h('path', { d: "M70 122 Q100 134 130 122 L126 148 Q100 156 74 148Z"           , fill: "#f472b6", ...line,} )
      , arc(9, 72, 128, 125, 9).map(([x, y], k) => (
        __jsx_h('circle', { key: k, cx: x, cy: y, r: 2.4, fill: "white", stroke: "#be185d", strokeWidth: 0.8,} )
      ))
      /* bow at the waist */
      , __jsx_h('g', { transform: "translate(100 149)" ,}
        , __jsx_h('path', { d: "M0 0 Q-16 -10 -16 0 Q-16 10 0 0Z M0 0 Q16 -10 16 0 Q16 10 0 0Z"                   , fill: "#c084fc", ...thin,} )
        , __jsx_h('path', { d: "M-2 2 L-8 14 M2 2 L8 14"       , stroke: "#c084fc", strokeWidth: 4, strokeLinecap: "round",} )
        , __jsx_h('circle', { r: 4, fill: "#a855f7", ...thin,} )
      )
    )
  );
}

/** A torso-shaped garment with its pattern clipped inside. */
function Shirt({ id, c, children, d = TORSO }) {
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: id,}
          , __jsx_h('path', { d: d,} )
        )
      )
      , __jsx_h('path', { d: d, fill: c, ...line,} )
      , __jsx_h('g', { clipPath: `url(#${id})`,}, children)
      , __jsx_h('path', { d: d, fill: "none", ...line,} )
    )
  );
}

function bolt(cx, cy, s) {
  return `M${cx + 2 * s} ${cy - 10 * s} L${cx - 6 * s} ${cy + 1 * s} L${cx - 0.5 * s} ${cy + 1 * s} L${cx - 3 * s} ${cy + 10 * s} L${cx + 6 * s} ${cy - 2 * s} L${cx + 0.5 * s} ${cy - 2 * s}Z`;
}

/** Superhero suit with an emblem on the chest and a belt. */
function HeroSuit({ c, dark, emblem }) {
  const id = `hero-${c.slice(1)}`;
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: id, c: c,}
        , __jsx_h('rect', { x: 40, y: 170, width: 120, height: 30, fill: dark,} )
      )
      , __jsx_h('path', { d: "M58 166 Q100 176 142 166 L142 174 Q100 184 58 174Z"           , fill: "#facc15", ...thin,} )
      , __jsx_h('rect', { x: 93, y: 166, width: 14, height: 11, rx: 2, fill: "#fde68a", ...thin,} )
      , __jsx_h('path', { d: "M100 128 L122 138 L100 162 L78 138Z"       , fill: emblem, ...line,} )
      , __jsx_h('path', { d: bolt(100, 145, 1), fill: c, ...thin,} )
    )
  );
}

function Astronaut() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "astro", c: "#f8fafc",}
        , __jsx_h('path', { d: "M40 160 L160 160"   , stroke: "#cbd5e1", strokeWidth: 3,} )
        , __jsx_h('path', { d: "M56 140 Q64 150 60 176 M144 140 Q136 150 140 176"           , stroke: "#cbd5e1", strokeWidth: 2, fill: "none",} )
      )
      , __jsx_h('rect', { x: 84, y: 136, width: 32, height: 22, rx: 4, fill: "#94a3b8", ...thin,} )
      , __jsx_h('circle', { cx: 92, cy: 144, r: 3, fill: "#ef4444",} )
      , __jsx_h('circle', { cx: 100, cy: 144, r: 3, fill: "#22c55e",} )
      , __jsx_h('circle', { cx: 108, cy: 144, r: 3, fill: "#3b82f6",} )
      , __jsx_h('rect', { x: 89, y: 150, width: 22, height: 4, rx: 2, fill: "#e2e8f0",} )
      , __jsx_h('rect', { x: 66, y: 128, width: 14, height: 9, fill: "#1d4ed8", stroke: O, strokeWidth: 1,} )
      , __jsx_h('path', { d: "M66 130.5 h14 M66 133 h14"     , stroke: "white", strokeWidth: 1,} )
      , __jsx_h('path', { d: "M62 120 Q100 136 138 120"     , stroke: "#f97316", strokeWidth: 5, fill: "none",} )
      , __jsx_h('path', { d: "M58 170 Q100 182 142 170"     , stroke: "#f97316", strokeWidth: 5, fill: "none",} )
    )
  );
}

/** A white doctor's coat with a stethoscope and a pocket pen. */
function DoctorCoat() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "doc", c: "#ffffff",}
        , __jsx_h('path', { d: "M100 128 L100 200"   , stroke: "#cbd5e1", strokeWidth: 2,} )
      )
      , __jsx_h('path', { d: "M78 120 L92 146 L100 128 L108 146 L122 120"         , fill: "#e0f2fe", ...thin,} )
      , __jsx_h('rect', { x: 112, y: 150, width: 18, height: 14, rx: 2, fill: "none", stroke: "#94a3b8", strokeWidth: 2,} )
      , __jsx_h('path', { d: "M118 146 L118 156"   , stroke: "#3b82f6", strokeWidth: 3, strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M84 124 Q74 150 88 162 Q98 168 96 148 M116 124 Q122 140 112 148"               , stroke: "#374151", strokeWidth: 3, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('circle', { cx: 95, cy: 146, r: 5, fill: "#9ca3af", ...thin,} )
      , __jsx_h('path', { d: "M72 172 L82 172 M77 167 L77 177"       , stroke: "#ef4444", strokeWidth: 4,} )
    )
  );
}

function Jersey({ c, trim, num }) {
  const id = `jersey-${c.slice(1)}`;
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: id, c: c,}
        , __jsx_h('path', { d: "M56 130 L72 124 L72 200 L56 200Z M144 130 L128 124 L128 200 L144 200Z"               , fill: trim, opacity: 0.9,} )
      )
      , __jsx_h('path', { d: "M84 120 L100 134 L116 120"     , stroke: trim, strokeWidth: 5, fill: "none", strokeLinejoin: "round",} )
      , __jsx_h('text', { x: 100, y: 172, textAnchor: "middle", fontSize: 30, fontWeight: 900, fontFamily: "Arial Rounded MT Bold, Arial, sans-serif"     , fill: trim, stroke: O, strokeWidth: 1.5,}
        , num
      )
    )
  );
}

function FireCoat() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "firecoat", c: "#a16207",}
        , [150, 176].map((y) => (
          __jsx_h('g', { key: y,}
            , __jsx_h('rect', { x: 40, y: y, width: 120, height: 8, fill: "#fde047",} )
            , __jsx_h('rect', { x: 40, y: y + 2.5, width: 120, height: 3, fill: "#e5e7eb",} )
          )
        ))
      )
      , __jsx_h('path', { d: "M100 124 L100 192"   , stroke: O, strokeWidth: 2.5,} )
      , [136, 164].map((y) => (
        __jsx_h('path', { key: y, d: `M94 ${y} L106 ${y}`, stroke: "#111827", strokeWidth: 4, strokeLinecap: "round",} )
      ))
      , __jsx_h('path', { d: "M66 120 Q100 136 134 120 L130 130 Q100 142 70 130Z"           , fill: "#854d0e", ...thin,} )
    )
  );
}

/** Black ninja suit with a wrapped front and a red belt. Goes with the Ninja Headband and Katana. */
function NinjaSuit() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "ninja", c: "#1f2937",}
        , __jsx_h('path', { d: "M70 118 L118 176"   , stroke: "#374151", strokeWidth: 10,} )
      )
      , __jsx_h('path', { d: "M72 120 L114 172 M128 120 L104 150"       , stroke: "#4b5563", strokeWidth: 2.5, fill: "none",} )
      , __jsx_h('path', { d: "M58 160 Q100 170 142 160 L142 170 Q100 180 58 170Z"           , fill: "#dc2626", ...thin,} )
      , __jsx_h('path', { d: "M122 168 L128 188 L134 186 L127 168 M126 168 L140 184 L144 180 L130 166"               , fill: "#dc2626", ...thin,} )
      , __jsx_h('path', { d: star(80, 142, 6), fill: "#9ca3af", ...thin,} )
    )
  );
}

/** Shiny knight armour with a shield crest. Goes with the Knight Sword. */
function KnightArmor() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "knight", c: "#cbd5e1",}
        , [134, 152, 170, 188].map((y) => (
          __jsx_h('path', { key: y, d: `M40 ${y} Q100 ${y + 12} 160 ${y}`, stroke: "#94a3b8", strokeWidth: 2.5, fill: "none",} )
        ))
        , __jsx_h('path', { d: "M70 120 Q78 150 72 200"     , stroke: "white", strokeWidth: 6, opacity: 0.6, fill: "none",} )
      )
      , __jsx_h('path', { d: "M86 132 L114 132 L114 150 Q114 164 100 170 Q86 164 86 150Z"             , fill: "#2563eb", ...line,} )
      , __jsx_h('path', { d: "M100 134 L100 168 M88 148 L112 148"       , stroke: "#facc15", strokeWidth: 3.5,} )
      , [60, 140].map((x) => (
        __jsx_h('ellipse', { key: x, cx: x, cy: 126, rx: 13, ry: 9, fill: "#e2e8f0", ...line,} )
      ))
      , [[68, 140], [132, 140], [68, 178], [132, 178]].map(([x, y]) => (
        __jsx_h('circle', { key: `${x}${y}`, cx: x, cy: y, r: 2, fill: "#64748b",} )
      ))
    )
  );
}

function Overalls() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M76 120 L82 148 M124 120 L118 148"       , stroke: O, strokeWidth: 11, strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M76 120 L82 148 M124 120 L118 148"       , stroke: "#2563eb", strokeWidth: 7, strokeLinecap: "round",} )
      , __jsx_h(Shirt, { id: "overalls", c: "#3b82f6", d: "M78 144 L122 144 L124 158 Q140 160 144 168 Q146 178 142 184 Q100 196 58 184 Q54 176 56 168 Q60 160 76 158Z"                         ,}
        , __jsx_h('path', { d: "M100 166 L100 200"   , stroke: "#1d4ed8", strokeWidth: 2, strokeDasharray: "3 3" ,} )
        , __jsx_h('path', { d: "M58 184 Q100 196 142 184"     , stroke: "#fde047", strokeWidth: 1.5, strokeDasharray: "3 3" , fill: "none", transform: "translate(0 -5)" ,} )
      )
      , __jsx_h('rect', { x: 88, y: 148, width: 24, height: 14, rx: 2, fill: "#60a5fa", ...thin,} )
      , __jsx_h('circle', { cx: 82, cy: 148, r: 3.5, fill: "#facc15", ...thin,} )
      , __jsx_h('circle', { cx: 118, cy: 148, r: 3.5, fill: "#facc15", ...thin,} )
    )
  );
}

/** Cowboy vest with fringes and a sheriff star. Goes with the Cowboy Hat. */
function CowboyVest() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "plaid", c: "#ef4444",}
        , [60, 76, 92, 108, 124, 140].map((x) => (
          __jsx_h('rect', { key: x, x: x, y: 110, width: 6, height: 90, fill: "#7f1d1d", opacity: 0.35,} )
        ))
        , [128, 144, 160, 176].map((y) => (
          __jsx_h('rect', { key: y, x: 40, y: y, width: 120, height: 6, fill: "#7f1d1d", opacity: 0.35,} )
        ))
      )
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('path', { d: "M62 118 Q74 116 86 128 L90 176 Q72 182 58 176 C54 156 56 136 62 118Z"                 , fill: "#92400e", ...line,} )
          , __jsx_h('path', { d: `M60 176 ${Array.from({ length: 6 }, () => 'l2 8 l3 -8').join(' ')}`, stroke: "#92400e", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
        )
      ))
      , __jsx_h('path', { d: star(74, 146, 9), fill: "#facc15", ...thin,} )
      , __jsx_h('circle', { cx: 74, cy: 146, r: 2, fill: "#a16207",} )
    )
  );
}

function Pajamas() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "pjs", c: "#a5b4fc",}
        , [[66, 136], [96, 148], [126, 134], [80, 170], [116, 172], [140, 158], [60, 160]].map(([x, y], i) =>
          i % 2 ? (
            __jsx_h('path', { key: i, d: star(x, y, 5), fill: "#fde047",} )
          ) : (
            __jsx_h('path', { key: i, d: `M${x} ${y - 6} A6 6 0 1 0 ${x} ${y + 6} A4.5 4.5 0 1 1 ${x} ${y - 6}Z`, fill: "#fef9c3",} )
          ),
        )
      )
      , __jsx_h('path', { d: "M84 120 L100 134 L116 120"     , stroke: "#818cf8", strokeWidth: 4, fill: "none",} )
      , [144, 160, 176].map((y) => (
        __jsx_h('circle', { key: y, cx: 100, cy: y, r: 2.6, fill: "white", ...thin, strokeWidth: 1,} )
      ))
    )
  );
}

/** Fuzzy bumblebee costume. Goes with the Bee Antennae and Bee Wings. */
function BeeCostume() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "bee", c: "#facc15",}
        , [138, 160, 182].map((y) => (
          __jsx_h('path', { key: y, d: `M40 ${y} Q100 ${y + 10} 160 ${y} L160 ${y + 10} Q100 ${y + 20} 40 ${y + 10}Z`, fill: "#1f2937",} )
        ))
      )
      , __jsx_h('path', { d: "M66 118 Q100 134 134 118"     , stroke: "#fef08a", strokeWidth: 5, fill: "none",} )
      , __jsx_h('path', { d: heartPath(118, 150, 5), fill: "#f472b6", ...thin,} )
    )
  );
}

/** Fluffy bunny onesie: a fuzzy collar, a pink tummy and a carrot in the pocket. Goes with the Bunny Ears and Bunny Puff Tail. */
function BunnyCostume({ c, belly }) {
  const id = `bunny-${c.slice(1)}`;
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: id, c: c,}
        , __jsx_h('ellipse', { cx: 100, cy: 170, rx: 24, ry: 28, fill: belly,} )
        , __jsx_h('path', { d: "M40 196 Q100 206 160 196"     , stroke: belly, strokeWidth: 8, fill: "none",} )
      )
      /* fuzzy collar */
      , __jsx_h('path', { d: scallops(66, 134, 124, 8, 5), fill: "none", stroke: O, strokeWidth: 6, strokeLinecap: "round",} )
      , __jsx_h('path', { d: scallops(66, 134, 124, 8, 5), fill: "none", stroke: "white", strokeWidth: 3, strokeLinecap: "round",} )
      /* pocket with a carrot poking out */
      , __jsx_h('path', { d: "M112 148 L130 148 L129 164 Q121 168 113 164Z"         , fill: belly, ...thin,} )
      , __jsx_h('path', { d: "M118 150 L121 132 L126 150Z"     , fill: "#f97316", ...thin,} )
      , __jsx_h('path', { d: "M121 134 Q116 126 118 122 M121 134 Q122 124 126 122"           , stroke: "#16a34a", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M119.5 142 L123.5 142"   , stroke: "#c2410c", strokeWidth: 1.2,} )
      /* little paw prints */
      , [[74, 150], [80, 176]].map(([x, y]) => (
        __jsx_h('g', { key: y, fill: belly,}
          , __jsx_h('ellipse', { cx: x, cy: y, rx: 4, ry: 3.4,} )
          , __jsx_h('circle', { cx: x - 4, cy: y - 5, r: 1.6,} )
          , __jsx_h('circle', { cx: x, cy: y - 6.5, r: 1.6,} )
          , __jsx_h('circle', { cx: x + 4, cy: y - 5, r: 1.6,} )
        )
      ))
    )
  );
}

/** Green dino onesie with a pale belly and orange back spikes peeking out. Goes with the Dino Tail. */
function DinoCostume() {
  return (
    __jsx_h('g', null
      , [[58, 132], [56, 150], [57, 168]].map(([x, y]) => (
        __jsx_h('path', { key: y, d: `M${x + 2} ${y - 7} L${x - 9} ${y} L${x + 2} ${y + 7}Z`, fill: "#f97316", ...thin,} )
      ))
      , __jsx_h(Shirt, { id: "dino", c: "#4ade80",}
        , __jsx_h('ellipse', { cx: 100, cy: 166, rx: 24, ry: 30, fill: "#fef9c3",} )
        , [150, 162, 174, 186].map((y) => (
          __jsx_h('path', { key: y, d: `M78 ${y} Q100 ${y + 5} 122 ${y}`, stroke: "#d9d07a", strokeWidth: 1.5, fill: "none",} )
        ))
        , [[70, 140], [132, 150], [128, 176]].map(([x, y]) => (
          __jsx_h('circle', { key: x, cx: x, cy: y, r: 4, fill: "#22c55e",} )
        ))
      )
    )
  );
}

/** Fairy dress: a leafy petal skirt with sparkles. */
function FairyDress() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M70 122 Q100 134 130 122 L126 150 Q100 158 74 150Z"           , fill: "#86efac", ...line,} )
      , [-48, -30, -12, 12, 30, 48].map((dx, i) => (
        __jsx_h('path', {
          key: dx,
          d: `M${100 + dx * 0.4} 150 Q${100 + dx * 1.3 - 10} 172 ${100 + dx * 1.15} 196 Q${100 + dx * 1.3 + 10} 172 ${100 + dx * 0.4} 150Z`,
          fill: i % 2 ? '#a7f3d0' : '#c4b5fd',
          ...thin,}
        )
      ))
      , __jsx_h('path', { d: "M100 150 Q96 172 100 198 Q104 172 100 150Z"         , fill: "#f9a8d4", ...thin,} )
      , [[86, 136], [112, 132], [72, 182], [130, 186], [100, 140]].map(([x, y], i) => (
        __jsx_h(motion.path, { key: i, d: star(x, y, 3.5), fill: "white", animate: { opacity: [0.2, 1, 0.2] }, transition: { duration: 1.6, repeat: Infinity, delay: i * 0.3 },} )
      ))
    )
  );
}

function HawaiianShirt() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "hawaii", c: "#06b6d4",}
        , [[68, 134], [118, 128], [92, 160], [136, 166], [64, 182], [112, 190]].map(([x, y]) => flower(x, y, 5, '#f9fafb', '#f472b6'))
        , [[84, 140], [128, 148], [76, 164], [104, 180]].map(([x, y]) => (
          __jsx_h('path', { key: `${x}${y}`, d: `M${x} ${y} q8 -10 16 -4 q-6 10 -16 4Z`, fill: "#16a34a",} )
        ))
      )
      , __jsx_h('path', { d: "M80 120 L94 140 L100 128 L106 140 L120 120"         , fill: "#0891b2", ...thin,} )
      , __jsx_h('path', { d: "M100 132 L100 196"   , stroke: O, strokeWidth: 1.5,} )
    )
  );
}

/** A big puffy winter jacket. */
function PufferJacket({ c, dark }) {
  const id = `puffer-${c.slice(1)}`;
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: id, c: c,}
        , [138, 158, 178].map((y) => (
          __jsx_h('path', { key: y, d: `M40 ${y} Q100 ${y + 10} 160 ${y}`, stroke: dark, strokeWidth: 2.5, fill: "none",} )
        ))
        , [128, 148, 168].map((y) => (
          __jsx_h('path', { key: y, d: `M46 ${y} Q100 ${y + 10} 154 ${y}`, stroke: "white", strokeWidth: 3, opacity: 0.35, fill: "none",} )
        ))
      )
      , __jsx_h('path', { d: "M100 126 L100 194"   , stroke: O, strokeWidth: 2.5,} )
      , __jsx_h('rect', { x: 97, y: 128, width: 6, height: 9, rx: 1.5, fill: "#e5e7eb", ...thin, strokeWidth: 1,} )
      , __jsx_h('path', { d: "M62 118 Q100 140 138 118 Q140 108 128 108 Q100 124 72 108 Q60 108 62 118Z"                 , fill: "white", stroke: O, strokeWidth: 2,} )
    )
  );
}

/** Long starry wizard robe. Goes with the Wizard Hat. */
function WizardRobe() {
  const robe = 'M66 118 Q100 132 134 118 Q148 156 154 196 Q100 206 46 196 Q52 156 66 118Z';
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "wizard-robe", c: "#6d28d9", d: robe,}
        , [[70, 150], [118, 140], [92, 172], [134, 178], [62, 186], [108, 196]].map(([x, y], i) =>
          i % 3 === 2 ? (
            __jsx_h('path', { key: i, d: `M${x} ${y - 6} A6 6 0 1 0 ${x} ${y + 6} A4.5 4.5 0 1 1 ${x} ${y - 6}Z`, fill: "#fde047",} )
          ) : (
            __jsx_h('path', { key: i, d: star(x, y, 5), fill: "#fde047",} )
          ),
        )
        , __jsx_h('path', { d: "M40 192 Q100 204 160 192"     , stroke: "#facc15", strokeWidth: 5, fill: "none",} )
      )
      , __jsx_h('path', { d: "M78 120 L100 148 L122 120"     , stroke: "#facc15", strokeWidth: 4, fill: "none", strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M100 148 L100 200"   , stroke: "#4c1d95", strokeWidth: 2.5,} )
    )
  );
}

/** A rainbow-striped party dress. */
function RainbowDress() {
  const skirt = 'M72 144 Q100 152 128 144 Q146 168 154 192 Q100 204 46 192 Q54 168 72 144Z';
  const cols = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "rainbow-skirt", c: "#ef4444", d: skirt,}
        , cols.map((c, i) => (
          __jsx_h('rect', { key: c, x: 40, y: 146 + i * 9, width: 120, height: 9.5, fill: c,} )
        ))
      )
      , __jsx_h('path', { d: scallops(46, 154, 192, 12, 4), fill: "none", stroke: "white", strokeWidth: 3,} )
      , __jsx_h('path', { d: "M70 122 Q100 134 130 122 L126 148 Q100 156 74 148Z"           , fill: "white", ...line,} )
      , [84, 100, 116].map((x, i) => (
        __jsx_h('path', { key: x, d: heartPath(x, 138, 4), fill: cols[i * 2],} )
      ))
    )
  );
}

/* ---------------- swords ---------------- */
// Drawn upright with the grip centred on (0,0); the avatar puts it in the pet's paw and tilts it.












function Sword({ blade, edge, guard, grip, pommel = guard, len = 84, curve = 0, round }) {
  const top = -8 - len;
  const outline = `M-5 -8 Q${-5 + curve * 0.4} ${-8 - len * 0.6} ${curve} ${top} Q${5 + curve * 0.8} ${-8 - len * 0.55} 5 -8Z`;
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: outline, fill: blade, ...line,} )
      , __jsx_h('path', { d: `M0 -12 Q${curve * 0.35} ${-8 - len * 0.55} ${curve * 0.85} ${top + 12}`, stroke: edge, strokeWidth: 2.4, fill: "none", strokeLinecap: "round", opacity: 0.85,} )
      , round ? __jsx_h('ellipse', { cx: 0, cy: -8, rx: 11, ry: 4.5, fill: guard, ...thin,} ) : __jsx_h('rect', { x: -16, y: -12, width: 32, height: 7, rx: 3.5, fill: guard, ...thin,} )
      , __jsx_h('rect', { x: -3.5, y: -5, width: 7, height: 19, rx: 2.5, fill: grip, ...thin,} )
      , __jsx_h('path', { d: "M-3.5 0 L3.5 3 M-3.5 5 L3.5 8 M-3.5 10 L3.5 13"           , stroke: O, strokeWidth: 1, opacity: 0.35,} )
      , __jsx_h('circle', { cx: 0, cy: 17, r: 5, fill: pommel, ...thin,} )
    )
  );
}

/** A glowing laser blade on a silver hilt. */
function LaserSword({ c, glow }) {
  return (
    __jsx_h('g', null
      , __jsx_h('rect', { x: -9, y: -104, width: 18, height: 100, rx: 9, fill: glow, opacity: 0.35,} )
      , __jsx_h('rect', { x: -5.5, y: -100, width: 11, height: 94, rx: 5.5, fill: c, stroke: glow, strokeWidth: 2,} )
      , __jsx_h('rect', { x: -2, y: -96, width: 4, height: 86, rx: 2, fill: "white", opacity: 0.85,} )
      , __jsx_h('rect', { x: -5, y: -8, width: 10, height: 24, rx: 2.5, fill: "#cbd5e1", ...thin,} )
      , [-2, 4, 10].map((y) => (
        __jsx_h('rect', { key: y, x: -5, y: y, width: 10, height: 2.5, fill: "#475569",} )
      ))
      , __jsx_h('circle', { cx: 0, cy: -4, r: 1.8, fill: "#ef4444",} )
    )
  );
}

function FireSword() {
  return (
    __jsx_h('g', null
      /* flames licking up the blade */
      , __jsx_h('path', { d: "M-12 -14 Q-20 -40 -10 -58 Q-14 -72 -4 -96 Q2 -80 4 -70 Q14 -84 12 -100 Q24 -76 14 -50 Q22 -40 12 -14Z"                         , fill: "#fb923c", opacity: 0.85,} )
      , __jsx_h('path', { d: "M-7 -16 Q-12 -40 -4 -60 Q0 -48 2 -42 Q8 -62 8 -76 Q16 -50 8 -16Z"                 , fill: "#fde047", opacity: 0.9,} )
      , __jsx_h(Sword, { blade: "#ef4444", edge: "#fecaca", guard: "#1f2937", grip: "#7f1d1d", pommel: "#f97316",} )
    )
  );
}

function IceSword() {
  return (
    __jsx_h('g', null
      , __jsx_h(Sword, { blade: "#bae6fd", edge: "#ffffff", guard: "#38bdf8", grip: "#0c4a6e", pommel: "#e0f2fe",} )
      /* frosty crystals */
      , [
        [-7, -30],
        [7, -52],
        [-6, -70],
      ].map(([x, y]) => (
        __jsx_h('path', { key: y, d: `M${x} ${y - 6} L${x + 3} ${y} L${x} ${y + 6} L${x - 3} ${y}Z`, fill: "white", stroke: "#38bdf8", strokeWidth: 1,} )
      ))
    )
  );
}

function RainbowSword() {
  const colors = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "rainbow-blade",}
          , __jsx_h('path', { d: "M-6 -8 L-6 -86 L0 -100 L6 -86 L6 -8Z"         ,} )
        )
      )
      , __jsx_h('g', { clipPath: "url(#rainbow-blade)",}
        , colors.map((c, i) => (
          __jsx_h('rect', { key: c, x: -6, y: -100 + i * 16, width: 12, height: 16.5, fill: c,} )
        ))
      )
      , __jsx_h('path', { d: "M-6 -8 L-6 -86 L0 -100 L6 -86 L6 -8Z"         , fill: "none", ...line,} )
      , __jsx_h('path', { d: star(0, -60, 4), fill: "white",} )
      , __jsx_h('path', { d: "M-18 -12 Q0 -4 18 -12 L18 -5 Q0 3 -18 -5Z"           , fill: "#f472b6", ...thin,} )
      , __jsx_h('rect', { x: -3.5, y: -5, width: 7, height: 19, rx: 2.5, fill: "#a855f7", ...thin,} )
      , __jsx_h('path', { d: star(0, 18, 7), fill: "#fde047", ...thin,} )
    )
  );
}

/* ---------------- costume tails ---------------- */
// Drawn from where the tail joins the body at (0,0), curving out to the left (negative x) and up.
// Most are built as tubes along a curve, so they taper and shade like a real tail.





function curveAt(curve, t) {
  const k = Math.min(curve.length - 1, Math.floor(t * curve.length));
  const u = t * curve.length - k;
  const [a, b, c, d] = curve[k];
  const m = 1 - u;
  const p = [
    m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0],
    m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1],
  ];
  const dx = 3 * m * m * (b[0] - a[0]) + 6 * m * u * (c[0] - b[0]) + 3 * u * u * (d[0] - c[0]);
  const dy = 3 * m * m * (b[1] - a[1]) + 6 * m * u * (c[1] - b[1]) + 3 * u * u * (d[1] - c[1]);
  const len = Math.hypot(dx, dy) || 1;
  return { p, n: [-dy / len, dx / len], angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}












/** Outline of a tube along the curve whose width at t is width(t). */
function tube(curve, width, { from = 0, to = 1, off = 0, k = 1, fuzz = 0 } = {}) {
  const n = 36;
  const left = [];
  const right = [];
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    const { p, n: nn } = curveAt(curve, t);
    const half = width(t) / 2;
    const ragged = fuzz && i > 0 && i < n ? (i % 2 ? 1 + fuzz : 1 - fuzz) : 1;
    const cx = p[0] + nn[0] * half * off;
    const cy = p[1] + nn[1] * half * off;
    const r = half * k * ragged;
    left.push(`${(cx + nn[0] * r).toFixed(1)} ${(cy + nn[1] * r).toFixed(1)}`);
    right.push(`${(cx - nn[0] * r).toFixed(1)} ${(cy - nn[1] * r).toFixed(1)}`);
  }
  return `M${left.join(' L')} L${right.reverse().join(' L')}Z`;
}

/** Thick in the middle, pointed at the end. */
const bushy = (base, mid, tip) => (t) => base * (1 - t) + tip * t + mid * Math.sin(Math.PI * Math.pow(t, 0.8));
const tapered = (base, tip) => (t) => base + (tip - base) * t;

/** A soft round pompom with a fluffy edge. */
function fuzzBall(cx, cy, r, bumps = 14) {
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2;
    const a1 = ((i + 0.5) / bumps) * Math.PI * 2;
    const x0 = cx + Math.cos(a0) * r;
    const y0 = cy + Math.sin(a0) * r;
    const bx = cx + Math.cos(a1) * r * 1.16;
    const by = cy + Math.sin(a1) * r * 1.16;
    const x1 = cx + Math.cos(a0 + (Math.PI * 2) / bumps) * r;
    const y1 = cy + Math.sin(a0 + (Math.PI * 2) / bumps) * r;
    d += i === 0 ? `M${x0.toFixed(1)} ${y0.toFixed(1)} ` : '';
    if (i < bumps) d += `Q${bx.toFixed(1)} ${by.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)} `;
  }
  return d + 'Z';
}

/** Short fur strokes along the tail. */
function furLines(curve, ts, width, color) {
  return ts.map((t) => {
    const { p, n } = curveAt(curve, t);
    const h = width(t) * 0.28;
    return (
      __jsx_h('path', {
        key: t,
        d: `M${(p[0] + n[0] * h).toFixed(1)} ${(p[1] + n[1] * h).toFixed(1)} q${(-n[1] * 5).toFixed(1)} ${(n[0] * 5).toFixed(1)} ${(-n[1] * 8 + n[0] * 3).toFixed(1)} ${(n[0] * 8 + n[1] * 3).toFixed(1)}`,
        stroke: color,
        strokeWidth: 1.6,
        fill: "none",
        strokeLinecap: "round",}
      )
    );
  });
}

function FoxTail() {
  const curve = [[[4, -4], [-40, 2], [-54, -48], [-28, -86]]];
  const w = bushy(10, 30, 4);
  const shape = tube(curve, w, { fuzz: 0.07 });
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "fox-tail",}
          , __jsx_h('path', { d: shape,} )
        )
      )
      , __jsx_h('path', { d: shape, fill: "#f97316",} )
      , __jsx_h('g', { clipPath: "url(#fox-tail)",}
        , __jsx_h('path', { d: tube(curve, w, { off: -0.55, k: 0.55, to: 0.8 }), fill: "#c2410c", opacity: 0.55,} )
        , __jsx_h('path', { d: tube(curve, w, { off: 0.5, k: 0.35, from: 0.1, to: 0.7 }), fill: "#fdba74", opacity: 0.7,} )
        , __jsx_h('path', { d: tube(curve, w, { from: 0.74, fuzz: 0.12, k: 1.2 }), fill: "#fffaf2",} )
      )
      , __jsx_h('path', { d: shape, fill: "none", ...line,} )
      , furLines(curve, [0.25, 0.4, 0.55], w, '#9a3412')
    )
  );
}

function LionTail() {
  const curve = [[[4, -2], [-30, 12], [-50, -26], [-38, -64]]];
  const w = tapered(8, 5.5);
  const end = curveAt(curve, 1).p;
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: tube(curve, w), fill: "#e0a458", ...line,} )
      , __jsx_h('path', { d: tube(curve, w, { off: -0.5, k: 0.4, to: 0.95 }), fill: "#b7792f", opacity: 0.6,} )
      , __jsx_h('path', { d: fuzzBall(end[0], end[1] - 6, 10, 12), fill: "#7c3a12", ...line,} )
      , __jsx_h('path', { d: fuzzBall(end[0] + 2, end[1] - 9, 5, 8), fill: "#a2541d",} )
    )
  );
}

function TigerTail() {
  const curve = [[[4, -2], [-38, 8], [-54, -40], [-30, -78]]];
  const w = tapered(14, 9);
  const shape = tube(curve, w);
  const end = curveAt(curve, 1);
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "tiger-tail",}
          , __jsx_h('path', { d: shape,} )
          , __jsx_h('circle', { cx: end.p[0], cy: end.p[1], r: 4.5,} )
        )
      )
      , __jsx_h('path', { d: shape, fill: "#fb923c",} )
      , __jsx_h('circle', { cx: end.p[0], cy: end.p[1], r: 4.5, fill: "#1f2937",} )
      , __jsx_h('g', { clipPath: "url(#tiger-tail)",}
        , __jsx_h('path', { d: tube(curve, w, { off: -0.5, k: 0.5 }), fill: "#c2410c", opacity: 0.45,} )
        , __jsx_h('path', { d: tube(curve, w, { off: 0.55, k: 0.3 }), fill: "#fed7aa", opacity: 0.8,} )
        , [0.14, 0.3, 0.46, 0.62, 0.77].map((t) => {
          const { p, n } = curveAt(curve, t);
          const h = w(t) * 0.75;
          return (
            __jsx_h('path', {
              key: t,
              d: `M${(p[0] + n[0] * h).toFixed(1)} ${(p[1] + n[1] * h).toFixed(1)} Q${(p[0] + n[1] * 4).toFixed(1)} ${(p[1] - n[0] * 4).toFixed(1)} ${(p[0] - n[0] * h).toFixed(1)} ${(p[1] - n[1] * h).toFixed(1)}`,
              stroke: "#1f2937",
              strokeWidth: 4,
              fill: "none",}
            )
          );
        })
        , __jsx_h('path', { d: tube(curve, w, { from: 0.9, k: 1.3 }), fill: "#1f2937",} )
      )
      , __jsx_h('path', { d: shape, fill: "none", ...line,} )
      , __jsx_h('circle', { cx: end.p[0], cy: end.p[1], r: 4.5, fill: "none", ...line, strokeDasharray: "0 7 15 100"   ,} )
    )
  );
}

function DinoTail({ c, spikes }) {
  const curve = [[[4, -8], [-30, -4], [-46, -16], [-50, -50]]];
  const w = tapered(24, 3);
  const shape = tube(curve, w);
  return (
    __jsx_h('g', null
      /* back plates, on the outside of the curve */
      , [0.15, 0.35, 0.55, 0.74].map((t, i) => {
        const { p, n, angle } = curveAt(curve, t);
        const h = w(t) / 2;
        const s = 1 - i * 0.18;
        return (
          __jsx_h('path', {
            key: t,
            d: "M-7 0 Q-5 -13 0 -15 Q5 -13 7 0Z"         ,
            transform: `translate(${(p[0] - n[0] * h).toFixed(1)} ${(p[1] - n[1] * h).toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s.toFixed(2)})`,
            fill: spikes,
            ...thin,}
          )
        );
      })
      , __jsx_h('path', { d: shape, fill: c,} )
      , __jsx_h('path', { d: tube(curve, w, { off: 0.55, k: 0.4, to: 0.85 }), fill: "#fef9c3", opacity: 0.85,} )
      , __jsx_h('path', { d: tube(curve, w, { off: -0.55, k: 0.3, to: 0.9 }), fill: O, opacity: 0.12,} )
      , [0.22, 0.42, 0.62].map((t) => {
        const { p, n } = curveAt(curve, t);
        return __jsx_h('circle', { key: t, cx: p[0] - n[0] * w(t) * 0.18, cy: p[1] - n[1] * w(t) * 0.18, r: 2.4, fill: O, opacity: 0.2,} );
      })
      , __jsx_h('path', { d: shape, fill: "none", ...line,} )
    )
  );
}

/** A spade-shaped tip pointing along +x before rotation. */
function Spade({ x, y, angle, s, c, hi }) {
  return (
    __jsx_h('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s})`,}
      , __jsx_h('path', { d: "M-2 0 C-2 -4 -6 -10 -2 -10 C4 -10 10 -4 16 0 C10 4 4 10 -2 10 C-6 10 -2 4 -2 0Z"                         , fill: c, ...line,} )
      , __jsx_h('path', { d: "M2 -5 Q8 -4 11 -1"     , stroke: hi, strokeWidth: 2, fill: "none", strokeLinecap: "round",} )
    )
  );
}

function DragonTail() {
  const curve = [[[6, -8], [-36, -2], [-54, -38], [-32, -70]]];
  const w = tapered(18, 5);
  const shape = tube(curve, w);
  const end = curveAt(curve, 1);
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "dragon-tail",}
          , __jsx_h('path', { d: shape,} )
        )
      )
      , [0.2, 0.4, 0.6, 0.78].map((t) => {
        const { p, n, angle } = curveAt(curve, t);
        const h = w(t) / 2;
        return (
          __jsx_h('path', {
            key: t,
            d: "M-5 0 L0 -11 L5 0Z"     ,
            transform: `translate(${(p[0] - n[0] * h).toFixed(1)} ${(p[1] - n[1] * h).toFixed(1)}) rotate(${angle.toFixed(1)})`,
            fill: "#f0abfc",
            ...thin,}
          )
        );
      })
      , __jsx_h('path', { d: shape, fill: "#7c3aed",} )
      , __jsx_h('g', { clipPath: "url(#dragon-tail)",}
        , __jsx_h('path', { d: tube(curve, w, { off: 0.55, k: 0.5 }), fill: "#c4b5fd",} )
        , [0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((t) => {
          const { p, n } = curveAt(curve, t);
          const h = w(t) / 2;
          return __jsx_h('path', { key: t, d: `M${(p[0] + n[0] * h * 0.1).toFixed(1)} ${(p[1] + n[1] * h * 0.1).toFixed(1)} L${(p[0] + n[0] * h).toFixed(1)} ${(p[1] + n[1] * h).toFixed(1)}`, stroke: "#7c3aed", strokeWidth: 1.2,} );
        })
        , __jsx_h('path', { d: tube(curve, w, { off: -0.6, k: 0.25 }), fill: "#4c1d95", opacity: 0.6,} )
      )
      , __jsx_h('path', { d: shape, fill: "none", ...line,} )
      , __jsx_h(Spade, { x: end.p[0], y: end.p[1], angle: end.angle, s: 1.15, c: "#a855f7", hi: "#e9d5ff",} )
    )
  );
}

function MermaidTail() {
  const curve = [[[6, -6], [-30, 0], [-48, -26], [-36, -56]]];
  const w = tapered(20, 8);
  const shape = tube(curve, w);
  const end = curveAt(curve, 1);
  return (
    __jsx_h('g', null
      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: "mermaid-tail",}
          , __jsx_h('path', { d: shape,} )
        )
      )
      /* tail fin, fanning out at the end */
      , __jsx_h('g', { transform: `translate(${end.p[0].toFixed(1)} ${end.p[1].toFixed(1)}) rotate(${end.angle.toFixed(1)})`,}
        , [-1, 1].map((s) => (
          __jsx_h('g', { key: s,}
            , __jsx_h('path', { d: `M-2 0 C4 ${-4 * s} 12 ${-18 * s} 22 ${-20 * s} C18 ${-12 * s} 18 ${-6 * s} 20 ${-1 * s} C12 ${-2 * s} 4 ${-1 * s} -2 0Z`, fill: "#c4b5fd", ...line,} )
            , __jsx_h('path', { d: `M2 ${-2 * s} L17 ${-15 * s} M4 ${-1 * s} L18 ${-6 * s}`, stroke: "#ede9fe", strokeWidth: 1.6,} )
          )
        ))
      )
      , __jsx_h('path', { d: shape, fill: "#14b8a6",} )
      , __jsx_h('g', { clipPath: "url(#mermaid-tail)", fill: "none", stroke: "#99f6e4", strokeWidth: 1.4,}
        , Array.from({ length: 9 }, (_, i) => i / 9 + 0.04).map((t) =>
          [-0.6, 0, 0.6].map((o) => {
            const { p, n, angle } = curveAt(curve, t + (o === 0 ? 0.05 : 0));
            const h = (w(t) / 2) * o;
            return __jsx_h('path', { key: `${t}${o}`, d: "M-3 -3 Q0 4 3 -3"     , transform: `translate(${(p[0] + n[0] * h).toFixed(1)} ${(p[1] + n[1] * h).toFixed(1)}) rotate(${(angle - 90).toFixed(1)})`,} );
          }),
        )
        , __jsx_h('path', { d: tube(curve, w, { off: -0.6, k: 0.3 }), fill: "#0f766e", stroke: "none", opacity: 0.5,} )
        , __jsx_h('path', { d: tube(curve, w, { off: 0.6, k: 0.18, to: 0.8 }), fill: "white", stroke: "none", opacity: 0.45,} )
      )
      , __jsx_h('path', { d: shape, fill: "none", ...line,} )
      , __jsx_h('path', { d: star(-30, -30, 3.5), fill: "white",} )
    )
  );
}

function UnicornTail() {
  const strands = [
    ['#f9a8d4', [[[2, -4], [-26, -10], [-48, -30], [-42, -66]]]],
    ['#fdba74', [[[2, -2], [-28, -2], [-50, -20], [-50, -50]]]],
    ['#fde047', [[[2, 0], [-28, 4], [-46, -8], [-50, -34]]]],
    ['#86efac', [[[2, 2], [-24, 10], [-40, 4], [-48, -16]]]],
    ['#93c5fd', [[[2, 2], [-20, 14], [-34, 14], [-44, 2]]]],
    ['#c4b5fd', [[[2, 4], [-16, 16], [-28, 22], [-38, 16]]]],
  ];
  const w = bushy(6, 7, 1);
  return (
    __jsx_h('g', null
      , strands.map(([col, curve]) => (
        __jsx_h('g', { key: col,}
          , __jsx_h('path', { d: tube(curve, w), fill: col, ...thin,} )
          , __jsx_h('path', { d: tube(curve, w, { off: 0.4, k: 0.25, from: 0.15, to: 0.75 }), fill: "white", opacity: 0.6,} )
        )
      ))
      /* sparkly band where it's tied on */
      , __jsx_h('ellipse', { cx: 2, cy: 0, rx: 5, ry: 9, fill: "#facc15", ...thin,} )
      , __jsx_h('path', { d: star(-44, -66, 4), fill: "#fde047", stroke: O, strokeWidth: 1,} )
      , __jsx_h('path', { d: star(-40, 18, 3), fill: "white",} )
    )
  );
}

function PeacockTail() {
  const angles = [-165, -142, -119, -96];
  const len = 62;
  return (
    __jsx_h('g', null
      , angles.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const tip = [Math.cos(a) * len, Math.sin(a) * len];
        const curve = [[[0, 0], [tip[0] * 0.33, tip[1] * 0.33], [tip[0] * 0.66, tip[1] * 0.66], tip]];
        const vane = (t) => (t < 0.3 ? 0 : 20 * Math.sin((Math.PI * (t - 0.3)) / 0.7) ** 0.7);
        const eye = curveAt(curve, 0.8).p;
        return (
          __jsx_h('g', { key: deg,}
            , __jsx_h('path', { d: tube(curve, vane, { from: 0.3, fuzz: 0.12 }), fill: i % 2 ? '#16a34a' : '#22c55e', ...thin,} )
            , __jsx_h('path', { d: `M0 0 L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`, stroke: "#14532d", strokeWidth: 1.4,} )
            , __jsx_h('g', { transform: `rotate(${deg} ${eye[0].toFixed(1)} ${eye[1].toFixed(1)})`,}
              , __jsx_h('ellipse', { cx: eye[0], cy: eye[1], rx: 8.5, ry: 6.5, fill: "#facc15",} )
              , __jsx_h('ellipse', { cx: eye[0], cy: eye[1], rx: 6.5, ry: 5, fill: "#0d9488",} )
              , __jsx_h('ellipse', { cx: eye[0] - 0.8, cy: eye[1], rx: 4, ry: 3.2, fill: "#1d4ed8",} )
              , __jsx_h('ellipse', { cx: eye[0] - 1.2, cy: eye[1], rx: 2, ry: 1.8, fill: "#172554",} )
            )
          )
        );
      })
    )
  );
}

function DevilTail() {
  const curve = [
    [[4, -2], [-26, 12], [-50, -12], [-38, -38]],
    [[-38, -38], [-28, -56], [-46, -64], [-42, -72]],
  ];
  const w = tapered(7, 3.5);
  const end = curveAt(curve, 1);
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: tube(curve, w), fill: "#dc2626", ...line,} )
      , __jsx_h('path', { d: tube(curve, w, { off: 0.5, k: 0.3, from: 0.05, to: 0.9 }), fill: "#fca5a5", opacity: 0.8,} )
      , __jsx_h(Spade, { x: end.p[0], y: end.p[1], angle: end.angle, s: 1, c: "#dc2626", hi: "#fecaca",} )
    )
  );
}

function MonkeyTail() {
  const curve = [
    [[4, -2], [-26, 6], [-46, -14], [-42, -40]],
    [[-42, -40], [-39, -60], [-14, -62], [-16, -46]],
    [[-16, -46], [-17, -36], [-29, -36], [-29, -45]],
  ];
  const w = tapered(9, 4.5);
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: tube(curve, w), fill: "#8b5a2b", ...line,} )
      , __jsx_h('path', { d: tube(curve, w, { off: 0.5, k: 0.35, to: 0.92 }), fill: "#d6a46a", opacity: 0.85,} )
    )
  );
}

function BunnyTail() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: fuzzBall(-18, -8, 13, 16), fill: "white", ...line,} )
      , __jsx_h('path', { d: fuzzBall(-15, -5, 8, 10), fill: "#e7e5e4", opacity: 0.7,} )
      , __jsx_h('circle', { cx: -22, cy: -12, r: 5, fill: "white",} )
      , __jsx_h('circle', { cx: -24, cy: -14, r: 1.8, fill: "#f5f5f4",} )
    )
  );
}

/** A teardrop feather pointing out from (cx, cy) at `deg`, starting `r0` out and `len` long. */
function feather(cx, cy, deg, len, w, r0 = 0) {
  const a = (deg * Math.PI) / 180;
  const [ux, uy, nx, ny] = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a)];
  const at = (d, side) => `${(cx + ux * d + nx * side).toFixed(1)} ${(cy + uy * d + ny * side).toFixed(1)}`;
  const mid = r0 + (len - r0) * 0.68;
  return `M${at(r0, 0)} Q${at(mid, w)} ${at(len, 0)} Q${at(mid, -w)} ${at(r0, 0)}Z`;
}

const TURKEY_FEATHERS = ['#dc2626', '#f97316', '#facc15', '#92400e'];

/** A fan of autumn feathers, a long back row and a short front row. */
function FeatherFan({ cx, cy, from, to, len, r0 = 0 }) {
  const row = (n, l, w, shift, inset = 0) =>
    Array.from({ length: n }, (_, i) => {
      const deg = from + inset + ((to - from - 2 * inset) * i) / (n - 1);
      const c = TURKEY_FEATHERS[(i + shift) % TURKEY_FEATHERS.length];
      return (
        __jsx_h('g', { key: `${l}-${i}`,}
          , __jsx_h('path', { d: feather(cx, cy, deg, l, w, r0), fill: c, ...thin,} )
          , __jsx_h('path', { d: feather(cx, cy, deg, l - 6, w * 0.45, r0 + l * 0.45), fill: "white", opacity: 0.3,} )
        )
      );
    });
  return (
    __jsx_h('g', null
      , row(7, len, len * 0.2, 0)
      , row(6, len * 0.78, len * 0.17, 2, (to - from) / 12)
    )
  );
}

/** A turkey on your head: a fan of feathers behind a brown cap with big eyes, a beak and a wobbly red wattle. */
function TurkeyHat() {
  return (
    __jsx_h('g', null
      , __jsx_h(FeatherFan, { cx: 100, cy: 60, from: -162, to: -18, len: 64, r0: 20,} )
      , __jsx_h('path', { d: "M62 54 Q60 12 100 10 Q140 12 138 54Z"         , fill: "#a16207", ...line,} )
      , __jsx_h('path', { d: "M78 20 Q90 14 104 14"     , stroke: "#ca8a04", strokeWidth: 4, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M58 46 Q100 38 142 46 L142 57 Q100 49 58 57Z"           , fill: "#78350f", ...line,} )
      /* turkey face */
      , [89, 111].map((x) => (
        __jsx_h('g', { key: x,}
          , __jsx_h('circle', { cx: x, cy: 27, r: 6.5, fill: "white", ...thin,} )
          , __jsx_h('circle', { cx: x + 1, cy: 28, r: 3.4, fill: "#1f2937",} )
          , __jsx_h('circle', { cx: x + 2.2, cy: 26.5, r: 1.2, fill: "white",} )
        )
      ))
      , __jsx_h('path', { d: "M93 33 L107 33 L100 43Z"     , fill: "#f59e0b", ...thin,} )
      , __jsx_h(motion.g, { animate: { rotate: [0, 9, -6, 0] }, transition: { duration: 1.6, repeat: Infinity }, style: { originX: 0.5, originY: 0 },}
        , __jsx_h('path', { d: "M101 38 Q109 40 107 50 Q105 58 100 55 Q97 50 101 38Z"             , fill: "#ef4444", ...thin,} )
      )
    )
  );
}

/** Feathery brown turkey suit with a tan tummy and little wings. Goes with the Turkey Hat and Turkey Tail Feathers. */
function TurkeyCostume() {
  return (
    __jsx_h('g', null
      , __jsx_h(Shirt, { id: "turkey", c: "#92400e",}
        , [124, 140, 156, 172, 188].map((y, r) =>
          Array.from({ length: 10 }, (_, i) => {
            const x = 44 + i * 13 + (r % 2) * 6.5;
            return __jsx_h('path', { key: `${y}-${i}`, d: `M${x - 7} ${y} Q${x - 7} ${y + 15} ${x} ${y + 15} Q${x + 7} ${y + 15} ${x + 7} ${y}`, fill: (i + r) % 2 ? '#b45309' : '#a16207', stroke: "#78350f", strokeWidth: 1.4,} );
          }),
        )
        , __jsx_h('ellipse', { cx: 100, cy: 168, rx: 21, ry: 27, fill: "#fde68a", stroke: "#d6a046", strokeWidth: 1.5,} )
        , [156, 168, 180].map((y) => (
          __jsx_h('path', { key: y, d: `M90 ${y} Q100 ${y + 5} 110 ${y}`, stroke: "#d6a046", strokeWidth: 1.5, fill: "none",} )
        ))
      )
      /* little wings */
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('path', { d: "M66 136 Q48 150 54 176 Q62 170 66 172 Q70 160 74 150Z"             , fill: "#78350f", ...thin,} )
          , __jsx_h('path', { d: "M60 158 L68 150 M58 167 L67 160"       , stroke: "#facc15", strokeWidth: 2, strokeLinecap: "round",} )
        )
      ))
      /* autumn-leaf pin */
      , __jsx_h('path', { d: feather(122, 138, -60, 14, 6), fill: "#f97316", ...thin,} )
    )
  );
}

/** A big fan of turkey tail feathers. */
function TurkeyTail() {
  return __jsx_h(FeatherFan, { cx: 0, cy: 0, from: -178, to: -80, len: 64, r0: 4,} );
}

/* ---------------- wigs ---------------- */
// A cap of hair over the top of the head with bangs above the eyes, and locks hanging beside the face.

/** The top of the wig: rounded crown with scalloped bangs ending above the eyes. */
function WigTop({ c, hi, d }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: _nullishCoalesce(d, () => ( 'M52 74 Q44 12 100 10 Q156 12 148 74 Q142 54 130 50 Q120 64 106 56 Q100 64 92 56 Q80 64 70 50 Q58 54 52 74Z')), fill: c, ...line,} )
      , __jsx_h('path', { d: "M72 26 Q90 16 112 18"     , stroke: hi, strokeWidth: 4, fill: "none", strokeLinecap: "round", opacity: 0.8,} )
    )
  );
}

/** Long locks of hair down both sides of the face, wavy or straight. */
function Locks({ c, hi, len = 150, wave = 0 }) {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('path', {
            d: `M58 44 C40 64 ${44 - wave} 92 ${40 + wave} ${len - 30} Q${36 - wave} ${len - 8} 46 ${len} Q56 ${len + 4} 60 ${len - 8} C${62 + wave} ${len - 34} ${56 - wave} 96 66 62Z`,
            fill: c,
            ...line,}
          )
          , __jsx_h('path', { d: `M50 70 C${46 - wave} 92 ${48 + wave} 110 46 ${len - 20}`, stroke: hi, strokeWidth: 2.5, fill: "none", strokeLinecap: "round", opacity: 0.7,} )
        )
      ))
    )
  );
}

function LongWig({ c, hi, wave = 0, len = 150 }) {
  return (
    __jsx_h('g', null
      , __jsx_h(Locks, { c: c, hi: hi, wave: wave, len: len,} )
      , __jsx_h(WigTop, { c: c, hi: hi,} )
    )
  );
}

function BobWig({ c, hi }) {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('path', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined, d: "M58 44 C40 60 38 92 44 112 Q56 118 66 110 C62 90 60 70 68 56Z"                 , fill: c, ...line,} )
      ))
      /* blunt straight-across bangs */
      , __jsx_h(WigTop, { c: c, hi: hi, d: "M52 76 Q44 12 100 10 Q156 12 148 76 Q146 62 140 60 L60 60 Q54 62 52 76Z"                   ,} )
    )
  );
}

function PigtailWig({ c, hi, ribbon }) {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h('path', { d: "M54 50 Q22 50 18 84 Q16 110 30 124 Q30 98 40 84 Q48 70 58 64Z"                 , fill: c, ...line,} )
          , __jsx_h('path', { d: "M30 70 Q24 90 28 112"     , stroke: hi, strokeWidth: 2.5, fill: "none", opacity: 0.7,} )
          , __jsx_h('g', { transform: "translate(52 54)" ,}
            , __jsx_h('path', { d: "M0 0 Q-12 -12 -14 -2 Q-12 8 0 0Z M0 0 Q4 -14 12 -8 Q10 2 0 0Z"                   , fill: ribbon, ...thin,} )
            , __jsx_h('circle', { r: 4, fill: ribbon, ...thin,} )
          )
        )
      ))
      , __jsx_h(WigTop, { c: c, hi: hi,} )
    )
  );
}

function BraidWig({ c, hi, ribbon }) {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , [0, 1, 2, 3, 4].map((i) => (
            __jsx_h('ellipse', { key: i, cx: 50 - i * 1.5, cy: 74 + i * 14, rx: 9 - i * 0.6, ry: 9, fill: c, ...thin,} )
          ))
          , [0, 1, 2, 3].map((i) => (
            __jsx_h('path', { key: i, d: `M${44 - i * 1.5} ${78 + i * 14} q6 5 12 0`, stroke: hi, strokeWidth: 1.6, fill: "none", opacity: 0.8,} )
          ))
          , __jsx_h('circle', { cx: 43, cy: 140, r: 4.5, fill: ribbon, ...thin,} )
          , __jsx_h('path', { d: "M43 140 l-6 10 M43 140 l5 10"       , stroke: ribbon, strokeWidth: 3, strokeLinecap: "round",} )
        )
      ))
      , __jsx_h(WigTop, { c: c, hi: hi,} )
    )
  );
}

/** A big round puffy wig: an afro, or a clown wig in rainbow puffs. */
function PuffWig({ colors }) {
  const puffs = [
    [56, 70, 20],
    [144, 70, 20],
    [62, 38, 22],
    [138, 38, 22],
    [84, 18, 22],
    [116, 18, 22],
    [100, 30, 20],
  ];
  return (
    __jsx_h('g', null
      , puffs.map(([x, y, r], i) => (
        __jsx_h('path', { key: i, d: fuzzBall(x, y, r, 12), fill: colors[i % colors.length], ...line,} )
      ))
    )
  );
}

function CurlyWig({ c, hi }) {
  const curls = [
    [52, 80, 11], [148, 80, 11], [50, 62, 12], [150, 62, 12], [58, 44, 13], [142, 44, 13],
    [74, 28, 13], [126, 28, 13], [100, 22, 14], [86, 50, 10], [114, 50, 10], [100, 44, 10],
  ];
  return (
    __jsx_h('g', null
      , curls.map(([x, y, r]) => (
        __jsx_h('g', { key: `${x}-${y}`,}
          , __jsx_h('path', { d: fuzzBall(x, y, r, 9), fill: c, ...thin,} )
          , __jsx_h('path', { d: `M${x - r * 0.4} ${y} a${r * 0.4} ${r * 0.4} 0 1 1 ${r * 0.4} ${r * 0.4}`, stroke: hi, strokeWidth: 1.6, fill: "none", opacity: 0.8,} )
        )
      ))
    )
  );
}

function Mohawk({ c, tip }) {
  return (
    __jsx_h('g', null
      , [
        [76, 34, -30],
        [88, 22, -14],
        [100, 18, 0],
        [112, 22, 14],
        [124, 34, 30],
      ].map(([x, y, a], i) => (
        __jsx_h('g', { key: i, transform: `rotate(${a} ${x} ${y + 26})`,}
          , __jsx_h('path', { d: `M${x - 9} ${y + 28} L${x} ${y - 20} L${x + 9} ${y + 28}Z`, fill: c, ...line,} )
          , __jsx_h('path', { d: `M${x - 3} ${y - 4} L${x} ${y - 18} L${x + 3} ${y - 4}Z`, fill: tip,} )
        )
      ))
    )
  );
}

/** Slicked-back rock'n'roll quiff with long sideburns. */
function Pompadour() {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('path', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined, d: "M56 50 Q50 70 54 92 L62 92 Q60 72 66 54Z"           , fill: "#1f2937", ...thin,} )
      ))
      , __jsx_h('path', { d: "M54 62 Q48 22 86 14 Q110 -6 140 8 Q156 18 146 32 Q150 46 146 62 Q136 46 120 46 Q96 44 84 54 Q66 52 54 62Z"                             , fill: "#1f2937", ...line,} )
      , __jsx_h('path', { d: "M90 20 Q114 4 138 14 M96 30 Q118 18 140 26"           , stroke: "#6b7280", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
    )
  );
}

/** Super spiky cartoon-hero hair. */
function SpikyWig({ c, hi }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', {
        d: "M50 76 L36 52 L54 50 L44 22 L66 34 L70 4 L88 26 L100 -4 L112 26 L130 4 L134 34 L156 22 L146 50 L164 52 L150 76 Q142 56 130 52 L122 64 L112 54 L100 66 L88 54 L78 64 L70 52 Q58 56 50 76Z"                                                 ,
        fill: c,
        ...line,}
      )
      , __jsx_h('path', { d: "M84 20 L90 36 M104 8 L102 30 M120 22 L114 38"           , stroke: hi, strokeWidth: 2.5, fill: "none", strokeLinecap: "round", opacity: 0.8,} )
    )
  );
}

/** Grandma's curly grey hair with a bun on top. */
function GrannyWig() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: fuzzBall(100, 8, 15, 9), fill: "#d1d5db", ...line,} )
      , __jsx_h('path', { d: "M92 8 Q100 2 108 10"     , stroke: "#9ca3af", strokeWidth: 2, fill: "none",} )
      , __jsx_h(CurlyWig, { c: "#e5e7eb", hi: "#9ca3af",} )
    )
  );
}

/* ---------------- headbands ---------------- */
// A band over the top of the head from ear to ear; decorations sit on it.

const BAND = 'M58 66 Q56 22 100 20 Q144 22 142 66';

/** The band itself, with an optional pattern of dots or stripes. */
function Band({ c, hi, dots, w = 7 }) {
  return (
    __jsx_h('g', { fill: "none", strokeLinecap: "round",}
      , __jsx_h('path', { d: BAND, stroke: O, strokeWidth: w + 4,} )
      , __jsx_h('path', { d: BAND, stroke: c, strokeWidth: w,} )
      , hi && __jsx_h('path', { d: "M64 50 Q66 28 100 25 Q134 28 136 50"         , stroke: hi, strokeWidth: 1.8, opacity: 0.8,} )
      , dots && (
        __jsx_h('g', { fill: dots, stroke: "none",}
          , [0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92].map((t) => {
            const [x, y] = bandAt(t);
            return __jsx_h('circle', { key: t, cx: x, cy: y, r: 1.8,} );
          })
        )
      )
    )
  );
}

/** A point along the band (t from 0 at the left ear to 1 at the right). */
function bandAt(t) {
  const q = (a, u) => (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * a[1] + u * u * a[2];
  if (t < 0.5) {
    const u = t * 2;
    return [q([58, 56, 100], u), q([66, 22, 20], u)];
  }
  const u = (t - 0.5) * 2;
  return [q([100, 144, 142], u), q([20, 22, 66], u)];
}

function EarBand({ c, inner, shape }) {
  return (
    __jsx_h('g', null
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , shape === 'cat' && (
            __jsx_h(__jsx_Fragment, null
              , __jsx_h('path', { d: "M66 36 L64 4 L90 24Z"     , fill: c, ...line,} )
              , __jsx_h('path', { d: "M70 30 L69 13 L83 24Z"     , fill: inner,} )
            )
          )
          , shape === 'devil' && __jsx_h('path', { d: "M70 30 Q60 14 66 -2 Q76 16 88 23Z"         , fill: c, ...line,} )
          , shape === 'bear' && (
            __jsx_h(__jsx_Fragment, null
              , __jsx_h('circle', { cx: 70, cy: 22, r: 13, fill: c, ...line,} )
              , __jsx_h('circle', { cx: 70, cy: 22, r: 6.5, fill: inner,} )
            )
          )
          , shape === 'mouse' && (
            __jsx_h(__jsx_Fragment, null
              , __jsx_h('circle', { cx: 64, cy: 16, r: 19, fill: c, ...line,} )
              , __jsx_h('circle', { cx: 64, cy: 16, r: 11, fill: inner,} )
            )
          )
        )
      ))
      , __jsx_h(Band, { c: shape === 'devil' ? '#1f2937' : c,} )
    )
  );
}

function BowBand({ c, band, dots }) {
  return (
    __jsx_h('g', null
      , __jsx_h(Band, { c: band,} )
      , __jsx_h('g', { transform: "rotate(-20 72 32)"  , stroke: O, strokeWidth: 2.5, strokeLinejoin: "round",}
        , __jsx_h('path', { d: "M72 32 L46 14 Q40 32 46 50Z"       , fill: c,} )
        , __jsx_h('path', { d: "M72 32 L98 14 Q104 32 98 50Z"       , fill: c,} )
        , dots && (
          __jsx_h('g', { fill: dots, stroke: "none",}
            , __jsx_h('circle', { cx: 52, cy: 26, r: 2.4,} )
            , __jsx_h('circle', { cx: 54, cy: 39, r: 2.4,} )
            , __jsx_h('circle', { cx: 92, cy: 25, r: 2.4,} )
            , __jsx_h('circle', { cx: 90, cy: 39, r: 2.4,} )
          )
        )
        , __jsx_h('circle', { cx: 72, cy: 32, r: 7.5, fill: c,} )
      )
    )
  );
}

function FlowerBand() {
  const cols = ['#f9a8d4', '#fde047', '#a5b4fc', '#fdba74', '#f9a8d4'];
  return (
    __jsx_h('g', null
      , __jsx_h(Band, { c: "#22c55e",} )
      , [0.12, 0.31, 0.5, 0.69, 0.88].map((t, i) => {
        const [x, y] = bandAt(t);
        return flower(x, y - 2, i === 2 ? 6.5 : 5, cols[i], i === 2 ? '#f97316' : '#fde047');
      })
    )
  );
}

/** Springy boppers that wobble on top. */
function Boppers({ kind }) {
  return (
    __jsx_h('g', null
      , __jsx_h(Band, { c: kind === 'star' ? '#7c3aed' : '#ec4899',} )
      , [0, 1].map((s) => (
        __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
          , __jsx_h(motion.g, { animate: { rotate: [0, -10, 6, 0] }, transition: { duration: 1.4, repeat: Infinity, delay: s * 0.35 }, style: { originX: 0.5, originY: 1 },}
            , __jsx_h('path', { d: "M82 23 Q76 20 80 17 Q85 14 78 12 Q75 11 76 10"             , stroke: "#6b7280", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
            , kind === 'star' ? (
              __jsx_h(__jsx_Fragment, null
                , __jsx_h('path', { d: star(76, 6, 9), fill: "#facc15", ...thin,} )
                , __jsx_h('circle', { cx: 72, cy: 3, r: 1.8, fill: "white",} )
              )
            ) : (
              __jsx_h(__jsx_Fragment, null
                , __jsx_h('path', { d: heartPath(76, 6, 7.5), fill: "#ef4444", ...thin,} )
                , __jsx_h('circle', { cx: 72, cy: 2, r: 1.8, fill: "white",} )
              )
            )
          )
        )
      ))
    )
  );
}

/** A sporty terry-cloth band around the forehead. */
function Sweatband({ c, stripe }) {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M58 40 Q100 28 142 40 L144 56 Q100 44 56 56Z"           , fill: c, ...line,} )
      , __jsx_h('path', { d: "M58 46 Q100 35 142 46"     , stroke: stripe, strokeWidth: 4, fill: "none",} )
      , __jsx_h('g', { stroke: O, strokeWidth: 1, opacity: 0.2,}
        , Array.from({ length: 14 }, (_, i) => (
          __jsx_h('path', { key: i, d: `M${62 + i * 5.7} ${40 - Math.sin((i / 13) * Math.PI) * 5} l0 13`,} )
        ))
      )
    )
  );
}

/** A ninja band around the forehead, knotted with two tails flying off the side. */
function NinjaBand() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M140 46 Q156 44 168 54 Q160 58 150 54 M140 50 Q154 56 160 70 Q150 68 144 58"                   , fill: "#dc2626", ...line,} )
      , __jsx_h('path', { d: "M58 40 Q100 28 142 40 L144 56 Q100 44 56 56Z"           , fill: "#dc2626", ...line,} )
      , __jsx_h('rect', { x: 88, y: 36, width: 24, height: 13, rx: 2, fill: "#d1d5db", ...thin,} )
      , __jsx_h('path', { d: "M94 42 h12 M100 38 v8"     , stroke: "#4b5563", strokeWidth: 2,} )
      , __jsx_h('circle', { cx: 142, cy: 48, r: 5, fill: "#b91c1c", ...thin,} )
    )
  );
}

function ButterflyBand() {
  return (
    __jsx_h('g', null
      , __jsx_h(Band, { c: "#38bdf8", hi: "#e0f2fe",} )
      , __jsx_h(motion.g, { animate: { scaleX: [1, 0.75, 1] }, transition: { duration: 0.9, repeat: Infinity }, style: { originX: 0.5, originY: 0.5 },}
        , [0, 1].map((s) => (
          __jsx_h('g', { key: s, transform: s ? 'translate(200 0) scale(-1 1)' : undefined,}
            , __jsx_h('path', { d: "M100 18 Q84 -2 74 6 Q68 18 98 22Z"         , fill: "#f472b6", ...thin,} )
            , __jsx_h('path', { d: "M98 22 Q76 26 80 36 Q90 40 100 24Z"         , fill: "#a78bfa", ...thin,} )
            , __jsx_h('circle', { cx: 82, cy: 10, r: 3, fill: "#fde047",} )
          )
        ))
        , __jsx_h('ellipse', { cx: 100, cy: 20, rx: 3, ry: 10, fill: "#1f2937",} )
        , __jsx_h('path', { d: "M99 11 Q94 2 90 0 M101 11 Q106 2 110 0"           , stroke: "#1f2937", strokeWidth: 1.6, fill: "none", strokeLinecap: "round",} )
      )
    )
  );
}

function RainbowBand() {
  const cols = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  return (
    __jsx_h('g', { fill: "none", strokeLinecap: "round",}
      , __jsx_h('path', { d: BAND, stroke: O, strokeWidth: 15,} )
      , cols.map((c, i) => (
        __jsx_h('path', { key: c, d: BAND, stroke: c, strokeWidth: 11 - i * 2, transform: `translate(0 ${-i * 0.2})`,} )
      ))
      , [0.2, 0.5, 0.8].map((t) => {
        const [x, y] = bandAt(t);
        return __jsx_h('path', { key: t, d: star(x, y - 9, 5), fill: "white", stroke: "none",} );
      })
    )
  );
}

/** A sparkly band with a big gem in the middle. */
function JewelBand() {
  return (
    __jsx_h('g', null
      , __jsx_h(Band, { c: "#facc15", hi: "#fef9c3",} )
      , [0.15, 0.3, 0.7, 0.85].map((t) => {
        const [x, y] = bandAt(t);
        return __jsx_h('circle', { key: t, cx: x, cy: y, r: 3, fill: "#e0f2fe", ...thin, strokeWidth: 1.2,} );
      })
      , __jsx_h('path', { d: "M100 4 L112 16 L100 32 L88 16Z"       , fill: "#ec4899", ...line,} )
      , __jsx_h('path', { d: "M100 4 L100 32 M88 16 L112 16"       , stroke: "#fbcfe8", strokeWidth: 1.4,} )
      , __jsx_h(motion.path, { d: star(112, 6, 5), fill: "white", animate: { opacity: [0, 1, 0] }, transition: { duration: 1.6, repeat: Infinity },} )
    )
  );
}

/* ---------------- the catalog ---------------- */












const EXTRA_GEAR = {
  // hats (34)
  beanie_red: { name: 'Red Beanie', layer: 'head', cost: 15, draw: () => __jsx_h(Beanie, { c: "#ef4444", band: "#fecaca",} ) },
  beanie_blue: { name: 'Blue Beanie', layer: 'head', cost: 15, draw: () => __jsx_h(Beanie, { c: "#3b82f6", band: "#bfdbfe",} ) },
  beanie_pink: { name: 'Pink Beanie', layer: 'head', cost: 15, draw: () => __jsx_h(Beanie, { c: "#f472b6", band: "#fbcfe8",} ) },
  beanie_green: { name: 'Green Beanie', layer: 'head', cost: 15, draw: () => __jsx_h(Beanie, { c: "#22c55e", band: "#bbf7d0",} ) },
  beanie_purple: { name: 'Purple Beanie', layer: 'head', cost: 15, draw: () => __jsx_h(Beanie, { c: "#a855f7", band: "#e9d5ff",} ) },
  beanie_yellow: { name: 'Sunny Beanie', layer: 'head', cost: 15, draw: () => __jsx_h(Beanie, { c: "#facc15", band: "#fb923c",} ) },
  cap_red: { name: 'Red Cap', layer: 'head', cost: 20, draw: () => __jsx_h(Cap, { c: "#ef4444", brim: "#b91c1c",} ) },
  cap_blue: { name: 'Blue Cap', layer: 'head', cost: 20, draw: () => __jsx_h(Cap, { c: "#3b82f6", brim: "#1d4ed8",} ) },
  cap_black: { name: 'Black Cap', layer: 'head', cost: 20, draw: () => __jsx_h(Cap, { c: "#374151", brim: "#111827",} ) },
  cap_pink: { name: 'Pink Cap', layer: 'head', cost: 20, draw: () => __jsx_h(Cap, { c: "#f472b6", brim: "#db2777",} ) },
  party_blue: { name: 'Blue Party Hat', layer: 'head', cost: 15, draw: () => __jsx_h(PartyHat2, { c: "#3b82f6", stripe: "#fde047", ball: "#f472b6",} ) },
  party_green: { name: 'Green Party Hat', layer: 'head', cost: 15, draw: () => __jsx_h(PartyHat2, { c: "#22c55e", stripe: "#ffffff", ball: "#facc15",} ) },
  bow_blue: { name: 'Blue Bow', layer: 'head', cost: 15, draw: () => __jsx_h(HairBow, { c: "#60a5fa",} ) },
  bow_yellow: { name: 'Polka-Dot Bow', layer: 'head', cost: 20, draw: () => __jsx_h(HairBow, { c: "#facc15", dots: "#ffffff",} ) },
  star_clips: { name: 'Star Clips', layer: 'head', cost: 20, draw: () => __jsx_h(StarClips, null ) },
  sunflower: { name: 'Sunflower', layer: 'head', cost: 25, draw: () => __jsx_h(Sunflower, null ) },
  beret: { name: 'Red Beret', layer: 'head', cost: 25, draw: () => __jsx_h(Beret, { c: "#dc2626",} ) },
  sailor_hat: { name: 'Sailor Hat', layer: 'head', cost: 30, draw: () => __jsx_h(SailorHat, null ) },
  bee_antennae: { name: 'Bee Antennae', layer: 'head', cost: 30, draw: () => __jsx_h(BeeAntennae, null ) },
  pumpkin_hat: { name: 'Pumpkin Hat', layer: 'head', cost: 35, draw: () => __jsx_h(PumpkinHat, null ) },
  mushroom_hat: { name: 'Mushroom Hat', layer: 'head', cost: 35, draw: () => __jsx_h(MushroomHat, null ) },
  duck_hat: { name: 'Duck Hat', layer: 'head', cost: 40, draw: () => __jsx_h(DuckHat, null ) },
  ice_cream_hat: { name: 'Ice Cream Hat', layer: 'head', cost: 40, draw: () => __jsx_h(IceCreamHat, null ) },
  santa_hat: { name: 'Santa Hat', layer: 'head', cost: 40, draw: () => __jsx_h(SantaHat, null ) },
  elf_hat: { name: 'Elf Hat', layer: 'head', cost: 40, draw: () => __jsx_h(ElfHat, null ) },
  antlers: { name: 'Reindeer Antlers', layer: 'head', cost: 45, draw: () => __jsx_h(Antlers, null ) },
  headphones: { name: 'Headphones', layer: 'head', cost: 50, draw: () => __jsx_h(Headphones, null ) },
  propeller_cap: { name: 'Propeller Cap', layer: 'head', cost: 60, draw: () => __jsx_h(PropellerCap, null ) },
  pirate_hat: { name: 'Pirate Hat', layer: 'head', cost: 70, draw: () => __jsx_h(PirateHat, null ) },
  grad_cap: { name: 'Graduation Cap', layer: 'head', cost: 80, draw: () => __jsx_h(GradCap, null ) },
  fire_helmet: { name: 'Firefighter Helmet', layer: 'head', cost: 90, draw: () => __jsx_h(FireHelmet, null ) },
  top_hat: { name: 'Top Hat', layer: 'head', cost: 100, draw: () => __jsx_h(TopHat, null ) },
  viking_helmet: { name: 'Viking Helmet', layer: 'head', cost: 140, draw: () => __jsx_h(VikingHelmet, null ) },
  unicorn_horn: { name: 'Unicorn Horn', layer: 'head', cost: 180, draw: () => __jsx_h(UnicornHorn, null ) },
  halo: { name: 'Halo', layer: 'head', cost: 220, draw: () => __jsx_h(Halo, null ) },
  rainbow_crown: { name: 'Rainbow Crown', layer: 'head', cost: 260, draw: () => __jsx_h(RainbowCrown, null ) },
  // wigs (14)
  wig_blonde: { name: 'Princess Wig', layer: 'wig', cost: 40, draw: () => __jsx_h(LongWig, { c: "#fcd34d", hi: "#fef3c7", wave: 6,} ) },
  wig_brown_long: { name: 'Long Brown Wig', layer: 'wig', cost: 35, draw: () => __jsx_h(LongWig, { c: "#7c4a2a", hi: "#b07a52",} ) },
  wig_mermaid: { name: 'Mermaid Wig', layer: 'wig', cost: 90, draw: () => __jsx_h(LongWig, { c: "#2dd4bf", hi: "#ccfbf1", wave: 8, len: 164,} ) },
  wig_purple_bob: { name: 'Purple Bob', layer: 'wig', cost: 35, draw: () => __jsx_h(BobWig, { c: "#a855f7", hi: "#e9d5ff",} ) },
  wig_black_bob: { name: 'Black Bob', layer: 'wig', cost: 30, draw: () => __jsx_h(BobWig, { c: "#1f2937", hi: "#6b7280",} ) },
  wig_pigtails: { name: 'Pink Pigtails', layer: 'wig', cost: 45, draw: () => __jsx_h(PigtailWig, { c: "#f472b6", hi: "#fce7f3", ribbon: "#facc15",} ) },
  wig_braids: { name: 'Braids', layer: 'wig', cost: 50, draw: () => __jsx_h(BraidWig, { c: "#a16207", hi: "#ca8a04", ribbon: "#ef4444",} ) },
  wig_red_curls: { name: 'Red Curls', layer: 'wig', cost: 55, draw: () => __jsx_h(CurlyWig, { c: "#ea580c", hi: "#fdba74",} ) },
  wig_afro: { name: 'Big Afro', layer: 'wig', cost: 60, draw: () => __jsx_h(PuffWig, { colors: ['#3f2a1d'],} ) },
  wig_granny: { name: 'Grandma Wig', layer: 'wig', cost: 65, draw: () => __jsx_h(GrannyWig, null ) },
  wig_pompadour: { name: 'Rock Star Wig', layer: 'wig', cost: 70, draw: () => __jsx_h(Pompadour, null ) },
  wig_spiky: { name: 'Hero Spikes', layer: 'wig', cost: 80, draw: () => __jsx_h(SpikyWig, { c: "#facc15", hi: "#fef9c3",} ) },
  wig_mohawk: { name: 'Mohawk', layer: 'wig', cost: 85, draw: () => __jsx_h(Mohawk, { c: "#22c55e", tip: "#bbf7d0",} ) },
  wig_clown: { name: 'Rainbow Clown Wig', layer: 'wig', cost: 100, draw: () => __jsx_h(PuffWig, { colors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'],} ) },
  // headbands (18)
  band_pink: { name: 'Pink Headband', layer: 'band', cost: 10, draw: () => __jsx_h(Band, { c: "#f472b6", hi: "#fce7f3",} ) },
  band_blue: { name: 'Blue Headband', layer: 'band', cost: 10, draw: () => __jsx_h(Band, { c: "#3b82f6", hi: "#dbeafe",} ) },
  band_polka: { name: 'Polka-Dot Headband', layer: 'band', cost: 15, draw: () => __jsx_h(Band, { c: "#ef4444", dots: "#ffffff", w: 9,} ) },
  sweatband_red: { name: 'Red Sweatband', layer: 'band', cost: 15, draw: () => __jsx_h(Sweatband, { c: "#ef4444", stripe: "#ffffff",} ) },
  sweatband_blue: { name: 'Blue Sweatband', layer: 'band', cost: 15, draw: () => __jsx_h(Sweatband, { c: "#ffffff", stripe: "#3b82f6",} ) },
  bow_band_pink: { name: 'Big Bow Headband', layer: 'band', cost: 25, draw: () => __jsx_h(BowBand, { c: "#f472b6", band: "#f472b6", dots: "#ffffff",} ) },
  bow_band_black: { name: 'Black Bow Headband', layer: 'band', cost: 25, draw: () => __jsx_h(BowBand, { c: "#1f2937", band: "#1f2937",} ) },
  kitty_ears: { name: 'Kitty Ears', layer: 'band', cost: 30, draw: () => __jsx_h(EarBand, { c: "#1f2937", inner: "#f9a8d4", shape: "cat",} ) },
  bear_ears: { name: 'Bear Ears', layer: 'band', cost: 30, draw: () => __jsx_h(EarBand, { c: "#8b5a2b", inner: "#d6a46a", shape: "bear",} ) },
  mouse_ears: { name: 'Mouse Ears', layer: 'band', cost: 35, draw: () => __jsx_h(EarBand, { c: "#1f2937", inner: "#374151", shape: "mouse",} ) },
  flower_band: { name: 'Flower Headband', layer: 'band', cost: 35, draw: () => __jsx_h(FlowerBand, null ) },
  devil_horns: { name: 'Devil Horns', layer: 'band', cost: 40, draw: () => __jsx_h(EarBand, { c: "#dc2626", inner: "#dc2626", shape: "devil",} ) },
  star_boppers: { name: 'Star Boppers', layer: 'band', cost: 45, draw: () => __jsx_h(Boppers, { kind: "star",} ) },
  heart_boppers: { name: 'Heart Boppers', layer: 'band', cost: 45, draw: () => __jsx_h(Boppers, { kind: "heart",} ) },
  ninja_band: { name: 'Ninja Headband', layer: 'band', cost: 60, draw: () => __jsx_h(NinjaBand, null ) },
  butterfly_band: { name: 'Butterfly Headband', layer: 'band', cost: 80, draw: () => __jsx_h(ButterflyBand, null ) },
  rainbow_band: { name: 'Rainbow Headband', layer: 'band', cost: 120, draw: () => __jsx_h(RainbowBand, null ) },
  jewel_band: { name: 'Jewel Headband', layer: 'band', cost: 180, draw: () => __jsx_h(JewelBand, null ) },
  // glasses (12)
  round_glasses: { name: 'Round Glasses', layer: 'eyes', cost: 15, draw: () => __jsx_h(RoundGlasses, null ) },
  nerd_glasses: { name: 'Big Black Glasses', layer: 'eyes', cost: 20, draw: () => __jsx_h(NerdGlasses, null ) },
  blue_shades: { name: 'Blue Shades', layer: 'eyes', cost: 20, draw: () => __jsx_h(TintedShades, { c: "#1d4ed8",} ) },
  pink_shades: { name: 'Pink Shades', layer: 'eyes', cost: 20, draw: () => __jsx_h(TintedShades, { c: "#db2777",} ) },
  swim_goggles: { name: 'Swim Goggles', layer: 'eyes', cost: 25, draw: () => __jsx_h(SwimGoggles, null ) },
  cat_eye_glasses: { name: 'Fancy Glasses', layer: 'eyes', cost: 30, draw: () => __jsx_h(CatEyeGlasses, null ) },
  glasses_3d: { name: '3-D Glasses', layer: 'eyes', cost: 30, draw: () => __jsx_h(Glasses3D, null ) },
  star_glasses: { name: 'Star Glasses', layer: 'eyes', cost: 40, draw: () => __jsx_h(StarGlasses, null ) },
  flower_glasses: { name: 'Flower Glasses', layer: 'eyes', cost: 45, draw: () => __jsx_h(FlowerGlasses, null ) },
  eye_patch: { name: 'Pirate Patch', layer: 'eyes', cost: 45, draw: () => __jsx_h(EyePatch, null ) },
  ski_goggles: { name: 'Ski Goggles', layer: 'eyes', cost: 60, draw: () => __jsx_h(SkiGoggles, null ) },
  monocle: { name: 'Monocle', layer: 'eyes', cost: 80, draw: () => __jsx_h(Monocle, null ) },
  rainbow_shades: { name: 'Rainbow Shades', layer: 'eyes', cost: 120, draw: () => __jsx_h(RainbowShades, null ) },
  // neck (18)
  bandana_blue: { name: 'Blue Bandana', layer: 'neck', cost: 15, draw: () => __jsx_h(Bandana2, { c: "#3b82f6", dot: "#ffffff",} ) },
  bandana_pink: { name: 'Pink Bandana', layer: 'neck', cost: 15, draw: () => __jsx_h(Bandana2, { c: "#f472b6", dot: "#ffffff",} ) },
  bandana_green: { name: 'Green Bandana', layer: 'neck', cost: 15, draw: () => __jsx_h(Bandana2, { c: "#22c55e", dot: "#fef9c3",} ) },
  bandana_purple: { name: 'Purple Bandana', layer: 'neck', cost: 15, draw: () => __jsx_h(Bandana2, { c: "#7c3aed", dot: "#fde047",} ) },
  bow_tie_red: { name: 'Red Bow Tie', layer: 'neck', cost: 15, draw: () => __jsx_h(BowTie2, { c: "#ef4444",} ) },
  bow_tie_pink: { name: 'Pink Polka Bow Tie', layer: 'neck', cost: 20, draw: () => __jsx_h(BowTie2, { c: "#f472b6", dot: "#ffffff",} ) },
  bow_tie_gold: { name: 'Gold Bow Tie', layer: 'neck', cost: 30, draw: () => __jsx_h(BowTie2, { c: "#facc15", dot: "#fef9c3",} ) },
  scarf_red: { name: 'Candy Scarf', layer: 'neck', cost: 25, draw: () => __jsx_h(Scarf, { a: "#ef4444", b: "#ffffff",} ) },
  scarf_blue: { name: 'Cozy Scarf', layer: 'neck', cost: 25, draw: () => __jsx_h(Scarf, { a: "#3b82f6", b: "#facc15",} ) },
  necktie: { name: 'Necktie', layer: 'neck', cost: 25, draw: () => __jsx_h(Necktie, null ) },
  daisy_chain: { name: 'Daisy Chain', layer: 'neck', cost: 30, draw: () => __jsx_h(DaisyChain, null ) },
  flower_lei: { name: 'Flower Lei', layer: 'neck', cost: 35, draw: () => __jsx_h(Lei, null ) },
  sailor_collar: { name: 'Sailor Collar', layer: 'neck', cost: 35, draw: () => __jsx_h(SailorCollar, null ) },
  jingle_collar: { name: 'Jingle Bells', layer: 'neck', cost: 40, draw: () => __jsx_h(JingleCollar, null ) },
  ruffle_collar: { name: 'Ruffle Collar', layer: 'neck', cost: 50, draw: () => __jsx_h(RuffleCollar, null ) },
  star_pendant: { name: 'Star Necklace', layer: 'neck', cost: 60, draw: () => __jsx_h(Pendant, { shape: "star",} ) },
  heart_locket: { name: 'Heart Locket', layer: 'neck', cost: 90, draw: () => __jsx_h(Pendant, { shape: "heart",} ) },
  gold_chain: { name: 'Gold Chain', layer: 'neck', cost: 150, draw: () => __jsx_h(GoldChain, null ) },
  // back (8)
  backpack: { name: 'Backpack', layer: 'back', cost: 30, draw: () => __jsx_h(Backpack, null ), front: () => __jsx_h(BackpackStraps, null ) },
  bee_wings: { name: 'Bee Wings', layer: 'back', cost: 50, draw: () => __jsx_h(BeeWings, null ) },
  ladybug_wings: { name: 'Ladybug Shell', layer: 'back', cost: 60, draw: () => __jsx_h(LadybugWings, null ) },
  turtle_shell: { name: 'Turtle Shell', layer: 'back', cost: 80, draw: () => __jsx_h(TurtleShell, null ) },
  bat_wings: { name: 'Bat Wings', layer: 'back', cost: 120, draw: () => __jsx_h(BatWings, null ) },
  jetpack: { name: 'Jetpack', layer: 'back', cost: 160, draw: () => __jsx_h(Jetpack, null ) },
  angel_wings: { name: 'Angel Wings', layer: 'back', cost: 220, draw: () => __jsx_h(AngelWings, null ) },
  dragon_wings: { name: 'Dragon Wings', layer: 'back', cost: 280, draw: () => __jsx_h(DragonWings, null ) },
  // outfits (33)
  sweater_red: { name: 'Stripy Sweater', layer: 'body', cost: 30, draw: () => __jsx_h(Sweater, { c: "#ef4444", stripe: "#ffffff",} ) },
  sweater_blue: { name: 'Cozy Sweater', layer: 'body', cost: 30, draw: () => __jsx_h(Sweater, { c: "#60a5fa", stripe: "#fde047",} ) },
  raincoat: { name: 'Raincoat', layer: 'body', cost: 45, draw: () => __jsx_h(Raincoat, null ) },
  hoodie: { name: 'Hoodie', layer: 'body', cost: 50, draw: () => __jsx_h(Hoodie, null ) },
  life_vest: { name: 'Life Vest', layer: 'body', cost: 50, draw: () => __jsx_h(LifeVest, null ) },
  tutu: { name: 'Tutu', layer: 'body', cost: 70, draw: () => __jsx_h(Tutu, null ) },
  polka_dress: { name: 'Polka-Dot Dress', layer: 'body', cost: 90, draw: () => __jsx_h(PolkaDress, null ) },
  xmas_sweater: { name: 'Holiday Sweater', layer: 'body', cost: 100, draw: () => __jsx_h(XmasSweater, null ) },
  pirate_outfit: { name: 'Pirate Outfit', layer: 'body', cost: 120, draw: () => __jsx_h(PirateOutfit, null ) },
  tuxedo: { name: 'Tuxedo', layer: 'body', cost: 150, draw: () => __jsx_h(Tuxedo, null ) },
  princess_dress: { name: 'Princess Dress', layer: 'body', cost: 200, draw: () => __jsx_h(PrincessDress, null ) },
  hero_red: { name: 'Super Suit', layer: 'body', cost: 60, draw: () => __jsx_h(HeroSuit, { c: "#ef4444", dark: "#1d4ed8", emblem: "#facc15",} ) },
  hero_purple: { name: 'Purple Super Suit', layer: 'body', cost: 60, draw: () => __jsx_h(HeroSuit, { c: "#a855f7", dark: "#1f2937", emblem: "#22d3ee",} ) },
  jersey_blue: { name: 'Blue Soccer Jersey', layer: 'body', cost: 40, draw: () => __jsx_h(Jersey, { c: "#2563eb", trim: "#ffffff", num: "10",} ) },
  jersey_red: { name: 'Red Soccer Jersey', layer: 'body', cost: 40, draw: () => __jsx_h(Jersey, { c: "#dc2626", trim: "#fde047", num: "7",} ) },
  overalls: { name: 'Overalls', layer: 'body', cost: 35, draw: () => __jsx_h(Overalls, null ) },
  pajamas: { name: 'Starry Pajamas', layer: 'body', cost: 35, draw: () => __jsx_h(Pajamas, null ) },
  hawaiian_shirt: { name: 'Hawaiian Shirt', layer: 'body', cost: 40, draw: () => __jsx_h(HawaiianShirt, null ) },
  puffer_red: { name: 'Red Puffer Jacket', layer: 'body', cost: 55, draw: () => __jsx_h(PufferJacket, { c: "#ef4444", dark: "#991b1b",} ) },
  puffer_mint: { name: 'Mint Puffer Jacket', layer: 'body', cost: 55, draw: () => __jsx_h(PufferJacket, { c: "#5eead4", dark: "#0f766e",} ) },
  bee_costume: { name: 'Bumblebee Costume', layer: 'body', cost: 65, draw: () => __jsx_h(BeeCostume, null ) },
  cowboy_vest: { name: 'Cowboy Vest', layer: 'body', cost: 70, draw: () => __jsx_h(CowboyVest, null ) },
  doctor_coat: { name: 'Doctor Coat', layer: 'body', cost: 80, draw: () => __jsx_h(DoctorCoat, null ) },
  fire_coat: { name: 'Firefighter Coat', layer: 'body', cost: 90, draw: () => __jsx_h(FireCoat, null ) },
  ninja_suit: { name: 'Ninja Suit', layer: 'body', cost: 100, draw: () => __jsx_h(NinjaSuit, null ) },
  bunny_costume: { name: 'Bunny Costume', layer: 'body', cost: 75, draw: () => __jsx_h(BunnyCostume, { c: "#ffffff", belly: "#fbcfe8",} ) },
  bunny_costume_pink: { name: 'Pink Bunny Costume', layer: 'body', cost: 75, draw: () => __jsx_h(BunnyCostume, { c: "#f9a8d4", belly: "#fdf2f8",} ) },
  turkey_costume: { name: 'Turkey Costume', layer: 'body', cost: 80, draw: () => __jsx_h(TurkeyCostume, null ) },
  dino_costume: { name: 'Dino Costume', layer: 'body', cost: 110, draw: () => __jsx_h(DinoCostume, null ) },
  rainbow_dress: { name: 'Rainbow Dress', layer: 'body', cost: 120, draw: () => __jsx_h(RainbowDress, null ) },
  fairy_dress: { name: 'Fairy Dress', layer: 'body', cost: 140, draw: () => __jsx_h(FairyDress, null ) },
  astronaut: { name: 'Space Suit', layer: 'body', cost: 170, draw: () => __jsx_h(Astronaut, null ) },
  wizard_robe: { name: 'Wizard Robe', layer: 'body', cost: 180, draw: () => __jsx_h(WizardRobe, null ) },
  knight_armor: { name: 'Knight Armor', layer: 'body', cost: 240, draw: () => __jsx_h(KnightArmor, null ) },
  turkey_hat: { name: 'Turkey Hat', layer: 'head', cost: 45, draw: () => __jsx_h(TurkeyHat, null ) },
  // swords (11)
  wooden_sword: { name: 'Wooden Sword', layer: 'hand', cost: 20, draw: () => __jsx_h(Sword, { blade: "#d6a368", edge: "#f3d3a6", guard: "#8b5a2b", grip: "#6b4423", len: 70,} ) },
  knight_sword: { name: 'Knight Sword', layer: 'hand', cost: 45, draw: () => __jsx_h(Sword, { blade: "#e5e7eb", edge: "#ffffff", guard: "#facc15", grip: "#7c2d12", pommel: "#ef4444",} ) },
  cutlass: { name: 'Pirate Cutlass', layer: 'hand', cost: 60, draw: () => __jsx_h(Sword, { blade: "#d1d5db", edge: "#ffffff", guard: "#eab308", grip: "#1f2937", curve: 16, len: 76,} ) },
  katana: { name: 'Ninja Katana', layer: 'hand', cost: 80, draw: () => __jsx_h(Sword, { blade: "#f1f5f9", edge: "#94a3b8", guard: "#111827", grip: "#b91c1c", pommel: "#111827", curve: 9, len: 92, round: true,} ) },
  laser_blue: { name: 'Blue Laser Sword', layer: 'hand', cost: 110, draw: () => __jsx_h(LaserSword, { c: "#bfdbfe", glow: "#3b82f6",} ) },
  laser_green: { name: 'Green Laser Sword', layer: 'hand', cost: 110, draw: () => __jsx_h(LaserSword, { c: "#bbf7d0", glow: "#22c55e",} ) },
  laser_pink: { name: 'Pink Laser Sword', layer: 'hand', cost: 110, draw: () => __jsx_h(LaserSword, { c: "#fbcfe8", glow: "#ec4899",} ) },
  gold_sword: { name: 'Golden Sword', layer: 'hand', cost: 160, draw: () => __jsx_h(Sword, { blade: "#facc15", edge: "#fef9c3", guard: "#a16207", grip: "#7c2d12", pommel: "#3b82f6",} ) },
  fire_sword: { name: 'Fire Sword', layer: 'hand', cost: 200, draw: () => __jsx_h(FireSword, null ) },
  ice_sword: { name: 'Ice Sword', layer: 'hand', cost: 200, draw: () => __jsx_h(IceSword, null ) },
  rainbow_sword: { name: 'Rainbow Sword', layer: 'hand', cost: 280, draw: () => __jsx_h(RainbowSword, null ) },
  // costume tails (11)
  bunny_tail: { name: 'Bunny Puff Tail', layer: 'tail', cost: 20, draw: () => __jsx_h(BunnyTail, null ) },
  devil_tail: { name: 'Devil Tail', layer: 'tail', cost: 30, draw: () => __jsx_h(DevilTail, null ) },
  monkey_tail: { name: 'Monkey Tail', layer: 'tail', cost: 35, draw: () => __jsx_h(MonkeyTail, null ) },
  lion_tail: { name: 'Lion Tail', layer: 'tail', cost: 40, draw: () => __jsx_h(LionTail, null ) },
  fox_tail: { name: 'Fox Tail', layer: 'tail', cost: 50, draw: () => __jsx_h(FoxTail, null ) },
  tiger_tail: { name: 'Tiger Tail', layer: 'tail', cost: 60, draw: () => __jsx_h(TigerTail, null ) },
  dino_tail: { name: 'Dino Tail', layer: 'tail', cost: 80, draw: () => __jsx_h(DinoTail, { c: "#4ade80", spikes: "#f97316",} ) },
  mermaid_tail: { name: 'Mermaid Tail', layer: 'tail', cost: 120, draw: () => __jsx_h(MermaidTail, null ) },
  dragon_tail: { name: 'Dragon Tail', layer: 'tail', cost: 160, draw: () => __jsx_h(DragonTail, null ) },
  unicorn_tail: { name: 'Unicorn Tail', layer: 'tail', cost: 220, draw: () => __jsx_h(UnicornTail, null ) },
  turkey_tail: { name: 'Turkey Tail Feathers', layer: 'tail', cost: 60, draw: () => __jsx_h(TurkeyTail, null ) },
  peacock_tail: { name: 'Peacock Tail', layer: 'tail', cost: 260, draw: () => __jsx_h(PeacockTail, null ) },
} ;

 

const SLOT = { head: 'head', wig: 'wig', band: 'band', eyes: 'eyes', neck: 'neck', back: 'back', body: 'body', hand: 'hand', tail: 'tail' };

/** Shop entries for the big closet. */
const EXTRA_GEAR_INFO = (Object.keys(EXTRA_GEAR) ).map((id) => ({
  id,
  name: EXTRA_GEAR[id].name,
  slot: SLOT[EXTRA_GEAR[id].layer],
  cost: EXTRA_GEAR[id].cost,
}));

/** Draw the extras on one layer. */
function ExtraLayer({ gear, layer, front }) {
  return (
    __jsx_h(__jsx_Fragment, null
      , gear.map((g) => {
        const e = (EXTRA_GEAR )[g];
        if (!e) return null;
        if (front) return e.front ? __jsx_h('g', { key: g,}, e.front()) : null;
        return e.layer === layer ? __jsx_h('g', { key: g,}, e.draw()) : null;
      })
    )
  );
}

return { EXTRA_GEAR_INFO, ExtraLayer };
})();

const { OUTLINE, BackGear, BodyGear, NeckGear, HeadGear } = (() => {






const OUTLINE = '#3b2a1a';

function Cape() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 122 Q26 182 34 214 L166 214 Q174 182 138 122Z"           , fill: "#dc2626", stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M44 206 L156 206"   , stroke: "#fbbf24", strokeWidth: 5, strokeLinecap: "round",} )
    )
  );
}

function CapeClasp() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M64 122 Q100 134 136 122"     , stroke: "#dc2626", strokeWidth: 7, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('circle', { cx: 100, cy: 130, r: 8, fill: "#fbbf24", stroke: OUTLINE, strokeWidth: 2.5,} )
      , __jsx_h('path', { d: "M97 126 L103 126 L99 130 L103 130 L97 135"         , stroke: "#b45309", strokeWidth: 1.8, fill: "none",} )
    )
  );
}

function Bandana() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M62 120 Q100 136 138 120 L100 162Z"       , fill: "#ef4444", stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('g', { fill: "white",}
        , __jsx_h('circle', { cx: 86, cy: 132, r: 2.5,} )
        , __jsx_h('circle', { cx: 112, cy: 133, r: 2.5,} )
        , __jsx_h('circle', { cx: 100, cy: 146, r: 2.5,} )
        , __jsx_h('circle', { cx: 96, cy: 134, r: 1.5,} )
        , __jsx_h('circle', { cx: 106, cy: 142, r: 1.5,} )
      )
    )
  );
}

function Shades() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M68 76 L96 76 Q96 96 82 96 Q68 96 68 80Z"           , fill: "#1e293b", stroke: "#ca8a04", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M104 76 L132 76 L132 80 Q132 96 118 96 Q104 96 104 76Z"             , fill: "#1e293b", stroke: "#ca8a04", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M96 79 Q100 75 104 79"     , stroke: "#ca8a04", strokeWidth: 3, fill: "none",} )
      , __jsx_h('path', { d: "M74 80 L80 80"   , stroke: "white", strokeWidth: 2.5, opacity: 0.6, strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M110 80 L116 80"   , stroke: "white", strokeWidth: 2.5, opacity: 0.6, strokeLinecap: "round",} )
    )
  );
}

function ChefHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('g', { fill: "white", stroke: OUTLINE, strokeWidth: 3,}
        , __jsx_h('circle', { cx: 82, cy: 22, r: 14,} )
        , __jsx_h('circle', { cx: 118, cy: 22, r: 14,} )
        , __jsx_h('circle', { cx: 100, cy: 12, r: 17,} )
      )
      , __jsx_h('rect', { x: 76, y: 22, width: 48, height: 22, rx: 4, fill: "white", stroke: OUTLINE, strokeWidth: 3,} )
      , __jsx_h('path', { d: "M78 24 L122 24"   , stroke: "white", strokeWidth: 6,} )
      , __jsx_h('path', { d: "M92 28 L92 40 M108 28 L108 40"       , stroke: "#e5e7eb", strokeWidth: 2,} )
    )
  );
}

function PartyHat() {
  return (
    __jsx_h('g', { transform: "rotate(12 104 40)"  ,}
      , __jsx_h('path', { d: "M80 46 L104 -6 L128 46Z"     , fill: "#a855f7", stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M92 20 L116 20 M86 34 L122 34"       , stroke: "#fde047", strokeWidth: 5,} )
      , __jsx_h('circle', { cx: 104, cy: -8, r: 7, fill: "#f472b6", stroke: OUTLINE, strokeWidth: 2.5,} )
    )
  );
}

function Crown() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', {
        d: "M72 46 L68 14 L84 30 L100 8 L116 30 L132 14 L128 46Z"             ,
        fill: "#facc15",
        stroke: OUTLINE,
        strokeWidth: 3,
        strokeLinejoin: "round",}
      )
      , __jsx_h('circle', { cx: 100, cy: 36, r: 4.5, fill: "#ef4444",} )
      , __jsx_h('circle', { cx: 84, cy: 38, r: 3.5, fill: "#3b82f6",} )
      , __jsx_h('circle', { cx: 116, cy: 38, r: 3.5, fill: "#22c55e",} )
      , __jsx_h('circle', { cx: 100, cy: 8, r: 3, fill: "#fef08a",} )
    )
  );
}

function starPath(cx, cy, r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d + 'Z';
}

function heartPath(cx, cy, s) {
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.7} ${cy - s * 0.1} ${cx - s * 0.9} ${cy - s * 1.2} ${cx} ${cy - s * 0.35} C${cx + s * 0.9} ${cy - s * 1.2} ${cx + s * 1.7} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z`;
}

function BowTie() {
  return (
    __jsx_h('g', { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M100 128 L78 115 L78 141Z"     , fill: "#3b82f6",} )
      , __jsx_h('path', { d: "M100 128 L122 115 L122 141Z"     , fill: "#3b82f6",} )
      , __jsx_h('circle', { cx: 100, cy: 128, r: 6.5, fill: "#1d4ed8",} )
      , __jsx_h('g', { fill: "#bfdbfe", stroke: "none",}
        , __jsx_h('circle', { cx: 85, cy: 124, r: 2,} )
        , __jsx_h('circle', { cx: 86, cy: 134, r: 2,} )
        , __jsx_h('circle', { cx: 115, cy: 124, r: 2,} )
        , __jsx_h('circle', { cx: 114, cy: 134, r: 2,} )
      )
    )
  );
}

function GoldMedal() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M80 118 L96 150 M120 118 L104 150"       , stroke: "#2563eb", strokeWidth: 7, strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M80 118 L96 150 M120 118 L104 150"       , stroke: "#ef4444", strokeWidth: 2.5, strokeLinecap: "round",} )
      , __jsx_h('circle', { cx: 100, cy: 157, r: 12, fill: "#facc15", stroke: OUTLINE, strokeWidth: 2.5,} )
      , __jsx_h('path', { d: starPath(100, 157, 7), fill: "#f59e0b",} )
    )
  );
}

function BunnyEars() {
  return (
    __jsx_h('g', { stroke: OUTLINE, strokeWidth: 3,}
      , __jsx_h('g', { transform: "rotate(-14 84 34)"  ,}
        , __jsx_h('ellipse', { cx: 84, cy: 8, rx: 10, ry: 28, fill: "white",} )
        , __jsx_h('ellipse', { cx: 84, cy: 10, rx: 4.5, ry: 19, fill: "#f9a8d4", stroke: "none",} )
      )
      , __jsx_h('g', { transform: "rotate(14 116 34)"  ,}
        , __jsx_h('ellipse', { cx: 116, cy: 8, rx: 10, ry: 28, fill: "white",} )
        , __jsx_h('ellipse', { cx: 116, cy: 10, rx: 4.5, ry: 19, fill: "#f9a8d4", stroke: "none",} )
      )
      , __jsx_h('path', { d: "M60 56 Q100 22 140 56"     , fill: "none", stroke: "#ec4899", strokeWidth: 6, strokeLinecap: "round",} )
    )
  );
}

function FlowerCrown() {
  const flowers = [
    [64, 54, '#f472b6'],
    [80, 44, '#facc15'],
    [100, 40, '#a78bfa'],
    [120, 44, '#fb923c'],
    [136, 54, '#f472b6'],
  ];
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M60 58 Q100 30 140 58"     , fill: "none", stroke: "#16a34a", strokeWidth: 4,} )
      , [72, 90, 110, 128].map((x, i) => (
        __jsx_h('ellipse', { key: x, cx: x, cy: i === 0 || i === 3 ? 50 : 42, rx: 5, ry: 2.5, fill: "#22c55e", transform: `rotate(${i < 2 ? -30 : 30} ${x} 46)`,} )
      ))
      , flowers.map(([x, y, c]) => (
        __jsx_h('g', { key: x,}
          , [0, 72, 144, 216, 288].map((a) => (
            __jsx_h('circle', { key: a, cx: x + Math.cos((a * Math.PI) / 180) * 5, cy: y + Math.sin((a * Math.PI) / 180) * 5, r: 4.2, fill: c, stroke: OUTLINE, strokeWidth: 1.2,} )
          ))
          , __jsx_h('circle', { cx: x, cy: y, r: 3.2, fill: "#fef08a", stroke: OUTLINE, strokeWidth: 1.2,} )
        )
      ))
    )
  );
}

function HeartGlasses() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: heartPath(82, 82, 13), fill: "#f472b6", fillOpacity: 0.85, stroke: "#be185d", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: heartPath(118, 82, 13), fill: "#f472b6", fillOpacity: 0.85, stroke: "#be185d", strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M95 77 Q100 73 105 77"     , stroke: "#be185d", strokeWidth: 3, fill: "none",} )
      , __jsx_h('circle', { cx: 76, cy: 76, r: 2.5, fill: "white", opacity: 0.8,} )
      , __jsx_h('circle', { cx: 112, cy: 76, r: 2.5, fill: "white", opacity: 0.8,} )
    )
  );
}

function CowboyHat() {
  return (
    __jsx_h('g', { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M74 42 Q70 12 88 10 Q100 18 112 10 Q130 12 126 42Z"             , fill: "#a16207",} )
      , __jsx_h('path', { d: "M75 34 Q100 40 125 34 L126 42 Q100 48 74 42Z"           , fill: "#7c2d12",} )
      , __jsx_h('path', { d: "M52 40 Q56 54 100 54 Q144 54 148 40 Q138 46 126 42 Q100 50 74 42 Q62 46 52 40Z"                     , fill: "#b45309",} )
      , __jsx_h('path', { d: starPath(100, 38, 4), fill: "#fde047", strokeWidth: 1,} )
    )
  );
}

function WizardHat() {
  return (
    __jsx_h('g', { transform: "rotate(-8 100 44)"  ,}
      , __jsx_h('path', { d: "M70 46 Q90 20 98 -16 Q112 4 132 46Z"         , fill: "#6d28d9", stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('ellipse', { cx: 100, cy: 46, rx: 40, ry: 8, fill: "#5b21b6", stroke: OUTLINE, strokeWidth: 3,} )
      , __jsx_h('path', { d: starPath(104, 22, 6), fill: "#fde047",} )
      , __jsx_h('path', { d: starPath(90, 36, 4), fill: "#fde047",} )
      , __jsx_h('path', { d: starPath(116, 38, 3.5), fill: "#fde047",} )
      , __jsx_h('circle', { cx: 98, cy: -16, r: 4, fill: "#fde047", stroke: OUTLINE, strokeWidth: 2,} )
    )
  );
}

function ButterflyWings() {
  const wing = (
    __jsx_h('g', { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M96 140 C64 92 18 100 26 136 C30 156 64 156 96 148Z"             , fill: "#a78bfa",} )
      , __jsx_h('path', { d: "M96 150 C62 156 34 176 48 196 C60 210 88 186 98 160Z"             , fill: "#f0abfc",} )
      , __jsx_h('circle', { cx: 52, cy: 128, r: 7, fill: "#fde047", stroke: "none",} )
      , __jsx_h('circle', { cx: 64, cy: 182, r: 5, fill: "#fde047", stroke: "none",} )
    )
  );
  return (
    __jsx_h(motion.g, {
      style: { originX: 0.5, originY: 0.5 },
      animate: { scaleX: [1, 0.9, 1] },
      transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },}

      , wing
      , __jsx_h('g', { transform: "translate(200 0) scale(-1 1)"   ,}, wing)
    )
  );
}


/* ---- kitty closet ---- */

function BellCollar() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M64 124 Q100 140 136 124"     , stroke: "#ec4899", strokeWidth: 9, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('path', { d: "M64 124 Q100 140 136 124"     , stroke: "#f9a8d4", strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeDasharray: "2 7" ,} )
      , __jsx_h('circle', { cx: 100, cy: 141, r: 8.5, fill: "#facc15", stroke: OUTLINE, strokeWidth: 2.5,} )
      , __jsx_h('path', { d: "M94 141 L106 141"   , stroke: "#a16207", strokeWidth: 2,} )
      , __jsx_h('circle', { cx: 100, cy: 145, r: 1.8, fill: "#a16207",} )
      , __jsx_h('circle', { cx: 97, cy: 137.5, r: 1.8, fill: "white", opacity: 0.8,} )
    )
  );
}

function PearlNecklace() {
  const pearls = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return [66 + t * 68, 124 + Math.sin(t * Math.PI) * 15] ;
  });
  return (
    __jsx_h('g', null
      , pearls.map(([x, y], i) => (
        __jsx_h('circle', { key: i, cx: x, cy: y, r: i === 5 ? 5.5 : 4.2, fill: "#fdf8f0", stroke: "#a8a29e", strokeWidth: 1.4,} )
      ))
      , pearls.map(([x, y], i) => (
        __jsx_h('circle', { key: `h${i}`, cx: x - 1.3, cy: y - 1.3, r: 1.2, fill: "white",} )
      ))
    )
  );
}

function PinkBow() {
  return (
    __jsx_h('g', { transform: "rotate(16 128 46)"  , stroke: OUTLINE, strokeWidth: 2.5, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M128 46 L106 32 Q102 46 106 60Z"       , fill: "#f472b6",} )
      , __jsx_h('path', { d: "M128 46 L150 32 Q154 46 150 60Z"       , fill: "#f472b6",} )
      , __jsx_h('path', { d: "M110 38 L112 54 M146 38 L144 54"       , stroke: "#fbcfe8", strokeWidth: 2,} )
      , __jsx_h('circle', { cx: 128, cy: 46, r: 6.5, fill: "#ec4899",} )
    )
  );
}

function Tiara() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', {
        d: "M70 52 Q100 40 130 52 L126 40 L116 44 L108 30 L100 40 L92 30 L84 44 L74 40Z"                   ,
        fill: "#e5e7eb",
        stroke: "#6b7280",
        strokeWidth: 2.5,
        strokeLinejoin: "round",}
      )
      , __jsx_h('circle', { cx: 100, cy: 40, r: 4.5, fill: "#f472b6", stroke: "#be185d", strokeWidth: 1.5,} )
      , __jsx_h('circle', { cx: 92, cy: 30, r: 3, fill: "#a78bfa",} )
      , __jsx_h('circle', { cx: 108, cy: 30, r: 3, fill: "#a78bfa",} )
      , __jsx_h('circle', { cx: 84, cy: 45, r: 2.2, fill: "#67e8f9",} )
      , __jsx_h('circle', { cx: 116, cy: 45, r: 2.2, fill: "#67e8f9",} )
    )
  );
}

function StrawberryHat() {
  return (
    __jsx_h('g', null
      , __jsx_h('path', { d: "M58 56 Q56 6 100 4 Q144 6 142 56 Q100 44 58 56Z"             , fill: "#ef4444", stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('g', { fill: "#fde68a",}
        , [
          [78, 26],
          [96, 18],
          [116, 24],
          [70, 42],
          [88, 36],
          [108, 36],
          [128, 40],
        ].map(([x, y]) => (
          __jsx_h('ellipse', { key: `${x}-${y}`, cx: x, cy: y, rx: 2, ry: 3,} )
        ))
      )
      , __jsx_h('path', { d: "M78 8 Q88 14 100 4 Q112 14 122 8 Q116 -2 100 -4 Q84 -2 78 8Z"                 , fill: "#22c55e", stroke: OUTLINE, strokeWidth: 2.5, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M100 -4 Q100 -12 106 -16"     , stroke: "#15803d", strokeWidth: 4, fill: "none", strokeLinecap: "round",} )
    )
  );
}

function FrogHat() {
  return (
    __jsx_h('g', { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M58 56 Q56 10 100 8 Q144 10 142 56 Q100 46 58 56Z"             , fill: "#4ade80",} )
      , [78, 122].map((x) => (
        __jsx_h('g', { key: x,}
          , __jsx_h('circle', { cx: x, cy: 12, r: 13, fill: "#4ade80",} )
          , __jsx_h('circle', { cx: x, cy: 12, r: 7.5, fill: "white", strokeWidth: 2,} )
          , __jsx_h('circle', { cx: x + 1, cy: 13, r: 4, fill: "#1c1410", stroke: "none",} )
        )
      ))
      , __jsx_h('path', { d: "M86 36 Q100 46 114 36"     , fill: "none", strokeLinecap: "round",} )
      , __jsx_h('g', { fill: "#f9a8d4", stroke: "none", opacity: 0.8,}
        , __jsx_h('ellipse', { cx: 74, cy: 38, rx: 6, ry: 3.5,} )
        , __jsx_h('ellipse', { cx: 126, cy: 38, rx: 6, ry: 3.5,} )
      )
    )
  );
}

function WitchHat() {
  return (
    __jsx_h('g', { transform: "rotate(-8 100 44)"  ,}
      , __jsx_h('path', { d: "M68 46 Q86 22 96 -18 Q116 0 134 46Z"         , fill: "#3b0764", stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M74 38 Q100 30 128 38 L130 46 Q100 38 72 46Z"           , fill: "#a855f7",} )
      , __jsx_h('rect', { x: 93, y: 33, width: 14, height: 11, rx: 2, fill: "#facc15", stroke: OUTLINE, strokeWidth: 2,} )
      , __jsx_h('ellipse', { cx: 100, cy: 47, rx: 44, ry: 8, fill: "#581c87", stroke: OUTLINE, strokeWidth: 3,} )
      , __jsx_h('path', { d: starPath(108, 14, 4), fill: "#fde047",} )
    )
  );
}

/* ---------------- Layers ---------------- */

/** Stretches body-sized pieces (drawn for a body 40 wide) to fit the pet. */
function Fit({ scale, children }) {
  return scale === 1 ? __jsx_h(__jsx_Fragment, null, children) : __jsx_h('g', { transform: `translate(100 0) scale(${scale.toFixed(3)} 1) translate(-100 0)`,}, children);
}

/** Behind everything (capes, wings). */
function BackGear({ gear, scale = 1 }) {
  return (
    __jsx_h(__jsx_Fragment, null
      , __jsx_h(Fit, { scale: scale,}
        , gear.includes('super_cape') && __jsx_h(Cape, null )
        , gear.includes('butterfly_wings') && __jsx_h(ButterflyWings, null )
        , __jsx_h(ExtraLayer, { gear: gear, layer: "back",} )
      )
      /* A costume tail pokes out on the left, away from the pet's own tail. */
      , __jsx_h('g', { transform: `translate(${(100 - 34 * scale).toFixed(1)} 190) scale(1.15)`,}
        , __jsx_h(ExtraLayer, { gear: gear, layer: "tail",} )
      )
    )
  );
}

/** Outfits, over the body and legs, under the neck pieces. */
function BodyGear({ gear, scale = 1 }) {
  return (
    __jsx_h(__jsx_Fragment, null
      , __jsx_h(Fit, { scale: scale,}
        , __jsx_h(ExtraLayer, { gear: gear, layer: "body",} )
        , __jsx_h(ExtraLayer, { gear: gear, layer: "back", front: true,} )
      )
      /* A sword held up in the paw on the right, tilted outwards. */
      , __jsx_h('g', { transform: `translate(${(100 + 30 * scale).toFixed(1)} 194) rotate(16)`,}
        , __jsx_h(ExtraLayer, { gear: gear, layer: "hand",} )
      )
    )
  );
}

/** Over the body, under the head. */
function NeckGear({ gear }) {
  const has = (g) => gear.includes(g);
  return (
    __jsx_h(__jsx_Fragment, null
      , has('red_bandana') && __jsx_h(Bandana, null )
      , has('bow_tie') && __jsx_h(BowTie, null )
      , has('gold_medal') && __jsx_h(GoldMedal, null )
      , has('bell_collar') && __jsx_h(BellCollar, null )
      , has('pearl_necklace') && __jsx_h(PearlNecklace, null )
      , has('super_cape') && __jsx_h(CapeClasp, null )
      , __jsx_h(ExtraLayer, { gear: gear, layer: "neck",} )
    )
  );
}

/** Inside the head group, over the face. Glasses lift onto the forehead when the eyes are closed. */
function HeadGear({ gear, mood }) {
  const has = (g) => gear.includes(g);
  const lift = (el) => (mood === 'happy' ? __jsx_h('g', { transform: "translate(0 -26)" ,}, el) : el);
  return (
    __jsx_h(__jsx_Fragment, null
      , has('aviator_shades') && lift(__jsx_h(Shades, null ))
      , has('heart_glasses') && lift(__jsx_h(HeartGlasses, null ))
      , lift(__jsx_h(ExtraLayer, { gear: gear, layer: "eyes",} ))
      , __jsx_h(ExtraLayer, { gear: gear, layer: "wig",} )
      , __jsx_h(ExtraLayer, { gear: gear, layer: "band",} )
      , __jsx_h(ExtraLayer, { gear: gear, layer: "head",} )
      , has('chef_hat') && __jsx_h(ChefHat, null )
      , has('bunny_ears') && __jsx_h(BunnyEars, null )
      , has('flower_crown') && __jsx_h(FlowerCrown, null )
      , has('cowboy_hat') && __jsx_h(CowboyHat, null )
      , has('wizard_hat') && __jsx_h(WizardHat, null )
      , has('witch_hat') && __jsx_h(WitchHat, null )
      , has('strawberry_hat') && __jsx_h(StrawberryHat, null )
      , has('frog_hat') && __jsx_h(FrogHat, null )
      , has('tiara') && __jsx_h(Tiara, null )
      , has('pink_bow') && __jsx_h(PinkBow, null )
      , has('party_hat') && __jsx_h(PartyHat, null )
      , has('gold_crown') && __jsx_h(Crown, null )
    )
  );
}

return { OUTLINE, BackGear, BodyGear, NeckGear, HeadGear };
})();

const { DogAvatar } = (() => {
 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }




// A front-facing sitting dog, drawn from breed proportions: skull, snout, ears, chest, legs and tail.
// Everything lives in the shared 200x240 pet frame (eyes on y=82, neck near y=120, paws on y=206)
// so that accessories fit every breed.










































const LOOKS = {
  cavapoo: {
    fur: '#d9975a', furDark: '#a8692f', furLight: '#f0c08a', light: '#f3d2a8', muzzle: '#e8b27a',
    coat: 'curly', head: [44, 36], snout: [16, 16], ear: 'curlyFlop', build: [38, 34, 17], tail: 'curly', marks: [], topknot: true,
  },
  pomeranian: {
    fur: '#ef9a2c', furDark: '#b8650e', furLight: '#fcc66a', light: '#fde1a8', earColor: '#d97e16', earInner: '#fbd3a0',
    coat: 'fluffy', head: [40, 34], snout: [11, 13], ear: 'smallPrick', build: [42, 22, 14], tail: 'pom', marks: ['chest'],
  },
  westie: {
    fur: '#fbfaf4', furDark: '#d3cdbb', furLight: '#ffffff', light: '#ffffff', earInner: '#f6c6c3',
    coat: 'shaggy', head: [44, 36], snout: [15, 15], ear: 'smallPrick', build: [38, 28, 17], tail: 'carrot', marks: [],
  },
  yorkiepoo: {
    // Yorkie looks: tan face and legs, steel-blue silky saddle, small upright V ears, long whiskery muzzle fringe.
    fur: '#d9a35e', furDark: '#a06a2c', furLight: '#f2c88c', light: '#ecc58e', body: '#5d6878', bodyDark: '#323944', muzzle: '#e7b977',
    earColor: '#b97c3a', earInner: '#f2bfa8',
    coat: 'shaggy', head: [40, 34], snout: [12, 12], ear: 'smallPrick', earScale: 1.2, build: [33, 30, 14], tail: 'plume', marks: ['beard'], topknot: true, bow: '#f472b6',
  },
  pug: {
    fur: '#e3c695', furDark: '#b8975f', furLight: '#f3ddb5', light: '#efdcb8', earColor: '#2f2622', muzzle: '#2f2622',
    coat: 'smooth', head: [47, 36], snout: [19, 9], ear: 'fold', build: [42, 28, 17], tail: 'curl', marks: ['pugMask', 'wrinkles'],
  },
  maltipoo: {
    fur: '#fbf4e8', furDark: '#dccbb0', furLight: '#ffffff', light: '#ffffff', earColor: '#f0d9b8',
    coat: 'curly', head: [40, 34], snout: [13, 13], ear: 'curlyFlop', earScale: 0.9, build: [34, 30, 15], tail: 'curly', marks: [], topknot: true,
  },
  chihuahua: {
    fur: '#d9a05b', furDark: '#945d20', furLight: '#f4c98e', light: '#fff8ec', muzzle: '#f9e8cb', brow: '#fff5e4', earInner: '#f5b0a8',
    coat: 'smooth', head: [44, 39], snout: [10.5, 9], ear: 'satellite', earScale: 1.0, build: [26, 28, 12], tail: 'sickleThin',
    marks: ['brows', 'chest', 'socks'], eyeSize: 9.8, cheeks: 0.68,
  },
  corgi: {
    fur: '#e08532', furDark: '#a85a17', furLight: '#f5a95c', light: '#fffaf2', earInner: '#f6c3ad',
    coat: 'smooth', head: [44, 36], snout: [14, 19], ear: 'bigPrick', build: [44, 16, 18], tail: 'stub', marks: ['blaze', 'chest', 'socks'],
  },
  beagle: {
    fur: '#c4843f', furDark: '#8e5520', furLight: '#dfa565', light: '#fffaf2', earColor: '#8b5527', body: '#2f2924',
    coat: 'smooth', head: [42, 37], snout: [15, 21], ear: 'flop', earScale: 1.15, build: [38, 34, 16], tail: 'whip', tailTip: true, marks: ['blaze', 'chest', 'socks'],
  },
  shih_tzu: {
    fur: '#d6a15a', furDark: '#a3712e', furLight: '#efc488', light: '#fffaf0', earColor: '#c38b44',
    coat: 'shaggy', head: [44, 35], snout: [14, 10], ear: 'shaggyFlop', build: [36, 26, 16], tail: 'pom', marks: ['blaze', 'chest'], topknot: true, bow: '#a855f7',
  },
  frenchie: {
    fur: '#8e8f99', furDark: '#62636d', furLight: '#b2b3bc', light: '#e7e7ec', muzzle: '#a9aab2', earInner: '#efb2b8',
    coat: 'smooth', head: [46, 36], snout: [18, 10], ear: 'bat', build: [42, 28, 18], tail: 'stub', marks: ['wrinkles', 'chest'],
  },
  goldendoodle: {
    fur: '#e9c27a', furDark: '#b98b3c', furLight: '#f8dea6', light: '#f6e2b8', muzzle: '#f1d398',
    coat: 'curly', head: [46, 37], snout: [17, 19], ear: 'curlyFlop', earScale: 1.08, build: [44, 38, 19], tail: 'curly', marks: [], topknot: true,
  },
  dalmatian: {
    fur: '#fbfaf5', furDark: '#d6d2c6', furLight: '#ffffff', light: '#ffffff', earColor: '#2d2a2a',
    coat: 'smooth', head: [41, 37], snout: [14, 22], ear: 'flop', build: [38, 42, 16], tail: 'whip', marks: ['spots'],
  },
  husky: {
    fur: '#6e7888', furDark: '#454d5a', furLight: '#97a1b0', light: '#f8fafc', earInner: '#f0c4c4', iris: '#5ab8f0',
    coat: 'smooth', head: [44, 36], snout: [14, 21], ear: 'prick', build: [42, 40, 18], tail: 'sickle', marks: ['huskyMask', 'chest', 'socks'],
  },
  shiba: {
    fur: '#d6762f', furDark: '#9e4d14', furLight: '#eda05e', light: '#fcefd9', earInner: '#fcefd9', brow: '#fcefd9',
    coat: 'smooth', head: [43, 35], snout: [13, 18], ear: 'prick', earScale: 0.85, build: [38, 34, 16], tail: 'curl', marks: ['urajiro', 'brows', 'chest', 'socks'],
  },
  lab: {
    fur: '#74462a', furDark: '#4b2a16', furLight: '#9a6643', light: '#8e5c3c', earColor: '#5a3520',
    coat: 'smooth', head: [46, 37], snout: [17, 21], ear: 'flop', build: [44, 40, 19], tail: 'otter', marks: [],
  },
  bernedoodle: {
    fur: '#2a2a2f', furDark: '#121214', furLight: '#4a4a52', light: '#f8f8f8', brow: '#c98a4b', iris: '#6b4a2b', dark: true,
    coat: 'curly', head: [45, 37], snout: [16, 19], ear: 'curlyFlop', build: [44, 38, 19], tail: 'curly', marks: ['blaze', 'brows', 'chest', 'socks'], topknot: true,
  },
  pomsky: {
    fur: '#7a8494', furDark: '#4f5866', furLight: '#a3acba', light: '#f8fafc', earInner: '#f0c4c4', iris: '#5ab8f0',
    coat: 'fluffy', head: [41, 34], snout: [12, 15], ear: 'prick', earScale: 0.85, build: [40, 28, 15], tail: 'pom', marks: ['huskyMask', 'chest'],
  },
  collie: {
    fur: '#26262a', furDark: '#0f0f12', furLight: '#45454c', light: '#fafafa', earInner: '#55555e', iris: '#6b4a2b', dark: true,
    coat: 'smooth', head: [40, 37], snout: [12, 23], ear: 'tipped', build: [38, 40, 16], tail: 'plume', tailTip: true, marks: ['blaze', 'chest', 'socks'],
  },
  german_shepherd: {
    fur: '#c98a45', furDark: '#8e5520', furLight: '#e2ab6b', light: '#e9c48f', body: '#2c2420', muzzle: '#2c2420', earColor: '#3a2e26', earInner: '#5a463a', darkMuzzle: true,
    coat: 'smooth', head: [42, 36], snout: [14, 23], ear: 'bigPrick', build: [42, 40, 18], tail: 'plume', marks: ['chest'],
  },
  boxer: {
    fur: '#c4803e', furDark: '#8a5222', furLight: '#df9f5e', light: '#fffaf2', muzzle: '#2c2420', earColor: '#a86a32', darkMuzzle: true,
    coat: 'smooth', head: [45, 36], snout: [19, 12], ear: 'fold', earScale: 1.25, build: [42, 40, 18], tail: 'stub', marks: ['blaze', 'chest', 'socks'],
  },
  dachshund: {
    fur: '#a8532a', furDark: '#6e3015', furLight: '#c97446', light: '#c97446', earColor: '#7a3818',
    coat: 'smooth', head: [40, 35], snout: [13, 24], ear: 'flop', earScale: 1.1, build: [40, 14, 16], tail: 'whip', marks: [],
  },
  boston_terrier: {
    fur: '#24242a', furDark: '#0f0f12', furLight: '#45454e', light: '#fafafa', earInner: '#d9a3a8', dark: true,
    coat: 'smooth', head: [44, 37], snout: [15, 10], ear: 'bat', build: [36, 34, 15], tail: 'stub', marks: ['blaze', 'chest', 'socks'], eyeSize: 8,
  },
  schnauzer: {
    fur: '#7c7f86', furDark: '#4f5258', furLight: '#a3a6ac', light: '#e3e4e7', earColor: '#5f6268', earInner: '#8e9096',
    coat: 'smooth', head: [40, 36], snout: [15, 21], ear: 'tipped', build: [36, 36, 16], tail: 'stub', marks: ['beard', 'bushyBrows', 'chest', 'socks'],
  },
  golden_retriever: {
    fur: '#dfa752', furDark: '#a8731f', furLight: '#f2c983', light: '#f3d49a', earColor: '#c98e3c',
    coat: 'smooth', head: [45, 37], snout: [16, 21], ear: 'shaggyFlop', earScale: 0.9, build: [44, 40, 19], tail: 'plume', marks: ['chest'],
  },
  saint_bernard: {
    fur: '#fbf7f0', furDark: '#d7cfc0', furLight: '#ffffff', light: '#ffffff', patch: '#b0581f', body: '#b0581f', bodyDark: '#6e3410', earColor: '#5a2a10', blazeW: 0.55,
    coat: 'smooth', head: [51, 40], snout: [21, 15], ear: 'flop', earScale: 0.82, build: [50, 38, 23], tail: 'plume', tailTip: true,
    marks: ['cap', 'saintMask', 'blaze', 'wrinkles', 'jowls', 'collar', 'chest', 'socks', 'barrel'],
  },
  cavalier: {
    fur: '#fdf9f2', furDark: '#d9cfbf', furLight: '#ffffff', light: '#ffffff', patch: '#b8642c', earColor: '#a8582a',
    coat: 'smooth', head: [42, 36], snout: [13, 13], ear: 'shaggyFlop', build: [36, 30, 16], tail: 'plume', marks: ['eyePatches', 'blaze', 'chest'], eyeSize: 8,
  },
  bichon: {
    fur: '#fdfcf8', furDark: '#dcd6c8', furLight: '#ffffff', light: '#ffffff',
    coat: 'curly', head: [46, 38], snout: [12, 12], ear: 'curlyFlop', earScale: 0.85, build: [36, 30, 15], tail: 'curly', marks: [], topknot: true, eyeSize: 7.5,
  },
  australian_shepherd: {
    fur: '#9aa1ad', furDark: '#5f6672', furLight: '#c3c8d0', light: '#fafafa', brow: '#c9773a', iris: '#5ab8f0', iris2: '#6b4a2b', spotColor: '#2d2d33',
    coat: 'smooth', head: [42, 36], snout: [14, 20], ear: 'tipped', build: [40, 38, 17], tail: 'stub', marks: ['spots', 'blaze', 'brows', 'cheekPatches', 'chest', 'socks'],
  },
  bernese: {
    fur: '#25252a', furDark: '#0f0f12', furLight: '#46464e', light: '#fafafa', brow: '#b8692c', earColor: '#25252a', dark: true,
    coat: 'smooth', head: [46, 38], snout: [17, 19], ear: 'flop', build: [46, 38, 20], tail: 'plume', tailTip: true, marks: ['blaze', 'brows', 'cheekPatches', 'chest', 'socks'],
  },
  papillon: {
    fur: '#fdfaf4', furDark: '#d9d0c0', furLight: '#ffffff', light: '#ffffff', patch: '#8a5230', earColor: '#8a5230', earInner: '#5e3720',
    coat: 'smooth', head: [37, 34], snout: [9, 14], ear: 'butterfly', build: [28, 36, 12], tail: 'feather', marks: ['cap', 'blaze', 'frill', 'bodyPatch'], eyeSize: 7.6, cheeks: 0.72,
  },
  affenpinscher: {
    fur: '#26262b', furDark: '#0e0e10', furLight: '#45454e', light: '#3a3a42', earInner: '#4a3c3e', iris: '#2b1a10', dark: true,
    coat: 'shaggy', bodyCoat: 'smooth', head: [40, 34], snout: [12, 6], ear: 'smallPrick', earScale: 1.15, build: [31, 32, 14], tail: 'carrot',
    marks: ['monkeyFace', 'underbite'], ruff: true, eyeSize: 9.2,
  },
  poodle: {
    fur: '#fbf7ef', furDark: '#d9cdb8', furLight: '#ffffff', light: '#ffffff', earColor: '#f1e6d2',
    coat: 'curly', head: [40, 38], snout: [12, 22], ear: 'curlyFlop', earScale: 1.1, build: [34, 44, 14], tail: 'pom', marks: [], topknot: true, bow: '#38bdf8',
  },
  yellow_lab: {
    fur: '#e8c27e', furDark: '#b98f4c', furLight: '#f6dca8', light: '#f3d7a3', earColor: '#d5a862',
    coat: 'smooth', head: [46, 37], snout: [17, 21], ear: 'flop', build: [44, 40, 19], tail: 'otter', marks: [],
  },
  black_lab: {
    fur: '#24211f', furDark: '#0d0c0b', furLight: '#45403c', light: '#3a3532', earColor: '#1a1817', iris: '#6b4a2b', dark: true,
    coat: 'smooth', head: [46, 37], snout: [17, 21], ear: 'flop', build: [44, 40, 19], tail: 'otter', marks: [],
  },
  sheltie: {
    fur: '#c98a45', furDark: '#8e5520', furLight: '#e6b077', light: '#fffaf2', earColor: '#b5763a',
    coat: 'fluffy', head: [38, 36], snout: [11, 22], ear: 'tipped', build: [38, 34, 15], tail: 'plume', tailTip: true, marks: ['blaze', 'chest', 'socks', 'frill'], ruff: true, cheeks: 0.75,
  },
  greyhound: {
    fur: '#a7a39c', furDark: '#77736d', furLight: '#c9c5bf', light: '#f4f2ee', earColor: '#8f8b85',
    coat: 'smooth', head: [34, 36], snout: [11, 27], ear: 'flop', earScale: 0.75, build: [32, 48, 13], tail: 'whip', marks: ['chest'], cheeks: 0.65,
  },
  pitbull: {
    fur: '#8c8f99', furDark: '#5e616b', furLight: '#b0b3bc', light: '#fbfaf7', earColor: '#7b7e88', iris: '#5ab8f0',
    coat: 'smooth', head: [48, 37], snout: [18, 17], ear: 'fold', earScale: 1.05, build: [46, 34, 19], tail: 'whip', marks: ['blaze', 'chest'], blazeW: 0.5,
  },
  maltese: {
    fur: '#ffffff', furDark: '#e3ddd2', furLight: '#ffffff', light: '#ffffff', earColor: '#f7f3ec',
    coat: 'shaggy', head: [40, 34], snout: [11, 10], ear: 'shaggyFlop', earScale: 1.15, build: [34, 24, 14], tail: 'plume', marks: [], topknot: true, bow: '#f472b6', eyeSize: 7.5,
  },
  vizsla: {
    fur: '#c56b35', furDark: '#8f4519', furLight: '#df8d55', light: '#d5824c', earColor: '#b45f2b', iris: '#c98a45',
    coat: 'smooth', head: [40, 37], snout: [14, 23], ear: 'flop', earScale: 1.15, build: [40, 42, 16], tail: 'whip', marks: [],
  },
  springer: {
    fur: '#fbfaf5', furDark: '#d6d2c6', furLight: '#ffffff', light: '#ffffff', earColor: '#6b3a1f', patch: '#6b3a1f', spotColor: '#6b3a1f',
    coat: 'smooth', head: [42, 37], snout: [14, 19], ear: 'shaggyFlop', earScale: 1.25, build: [40, 36, 16], tail: 'feather', marks: ['eyePatches', 'spots', 'bodyPatch'], body: '#6b3a1f', bodyDark: '#4a2512',
  },
  old_english: {
    fur: '#f4f2ed', furDark: '#cfcbc2', furLight: '#ffffff', light: '#ffffff', body: '#8c929c', bodyDark: '#5f646d', earColor: '#dad6cd',
    coat: 'shaggy', head: [48, 40], snout: [15, 14], ear: 'shaggyFlop', build: [46, 32, 19], tail: 'stub', marks: ['beard'], eyeSize: 6.5,
  },
  blue_heeler: {
    fur: '#7e8ea6', furDark: '#4f5d73', furLight: '#a6b3c6', light: '#d39a5c', brow: '#d39a5c', spotColor: '#3b4658', patch: '#2f3848', earInner: '#c58a52',
    coat: 'smooth', head: [42, 36], snout: [14, 19], ear: 'bigPrick', build: [40, 36, 17], tail: 'plume', tailTip: true, marks: ['eyePatches', 'brows', 'spots', 'socks'],
  },
  red_heeler: {
    fur: '#c4703a', furDark: '#8c461b', furLight: '#df9461', light: '#f6e2cc', brow: '#f6e2cc', spotColor: '#8c461b', patch: '#8c461b', earInner: '#efbf9a',
    coat: 'smooth', head: [42, 36], snout: [14, 19], ear: 'bigPrick', build: [40, 36, 17], tail: 'plume', tailTip: true, marks: ['eyePatches', 'brows', 'spots', 'socks'],
  },
  samoyed: {
    fur: '#fbfaf5', furDark: '#d8d3c4', furLight: '#ffffff', light: '#ffffff', earInner: '#f6cccc',
    coat: 'fluffy', head: [44, 35], snout: [13, 17], ear: 'smallPrick', earScale: 1.15, build: [44, 34, 18], tail: 'pom', marks: [],
  },
  great_dane: {
    fur: '#d4a463', furDark: '#9c6d30', furLight: '#ecc38a', light: '#e8c896', muzzle: '#2c2420', earColor: '#3a2e26', darkMuzzle: true,
    coat: 'smooth', head: [40, 42], snout: [13, 27], ear: 'flop', earScale: 0.95, build: [42, 46, 19], tail: 'whip', marks: ['chest'], cheeks: 0.7,
  },
  rottweiler: {
    fur: '#222226', furDark: '#0e0e10', furLight: '#43434b', light: '#a8622a', brow: '#a8622a', earColor: '#222226', iris: '#6b4a2b', dark: true,
    coat: 'smooth', head: [47, 38], snout: [18, 17], ear: 'fold', build: [46, 36, 20], tail: 'stub', marks: ['brows', 'cheekPatches', 'chest', 'socks'],
  },
  doberman: {
    fur: '#1f1d22', furDark: '#0c0b0e', furLight: '#403d46', light: '#b8692c', brow: '#b8692c', earInner: '#5a463a', iris: '#6b4a2b', dark: true,
    coat: 'smooth', head: [38, 37], snout: [13, 25], ear: 'bigPrick', earScale: 1.1, build: [38, 44, 16], tail: 'stub', marks: ['brows', 'cheekPatches', 'chest', 'socks'], cheeks: 0.7,
  },
  basset_hound: {
    fur: '#c4843f', furDark: '#8e5520', furLight: '#dfa565', light: '#fffaf2', earColor: '#8b5527', body: '#2f2924',
    coat: 'smooth', head: [44, 37], snout: [16, 20], ear: 'flop', earScale: 1.5, build: [44, 14, 18], tail: 'whip', tailTip: true, marks: ['blaze', 'jowls', 'chest', 'socks'],
  },
  bulldog: {
    fur: '#e6c39a', furDark: '#b48f62', furLight: '#f5dcbb', light: '#fffaf2', earColor: '#c9a070',
    coat: 'smooth', head: [50, 37], snout: [22, 8], ear: 'fold', earScale: 0.9, build: [48, 24, 20], tail: 'stub', marks: ['blaze', 'wrinkles', 'jowls', 'underbite', 'chest', 'socks'], cheeks: 1,
  },
  cocker_spaniel: {
    fur: '#d79a4a', furDark: '#9f6620', furLight: '#efbd78', light: '#efbd78', earColor: '#c0802e',
    coat: 'smooth', head: [42, 37], snout: [14, 16], ear: 'shaggyFlop', earScale: 1.3, build: [38, 32, 16], tail: 'feather', marks: [], eyeSize: 8,
  },
  jack_russell: {
    fur: '#fdfaf4', furDark: '#d9d0c0', furLight: '#ffffff', light: '#ffffff', patch: '#9a5a2e', earColor: '#9a5a2e',
    coat: 'smooth', head: [40, 35], snout: [13, 19], ear: 'tipped', build: [34, 34, 15], tail: 'sickleThin', marks: ['eyePatches', 'blaze', 'bodyPatch'],
  },
  weimaraner: {
    fur: '#9b9a96', furDark: '#6d6c68', furLight: '#bdbcb7', light: '#b9b8b3', earColor: '#878681', iris: '#c9a94a',
    coat: 'smooth', head: [41, 37], snout: [15, 23], ear: 'flop', earScale: 1.15, build: [40, 42, 17], tail: 'stub', marks: [],
  },
  newfoundland: {
    fur: '#26262b', furDark: '#0f0f12', furLight: '#47474f', light: '#3a3a42', earColor: '#26262b', iris: '#6b4a2b', dark: true,
    coat: 'fluffy', head: [50, 40], snout: [18, 16], ear: 'flop', earScale: 0.85, build: [50, 36, 22], tail: 'plume', marks: [],
  },
  chow_chow: {
    fur: '#c9762f', furDark: '#8f4a14', furLight: '#e69a55', light: '#e69a55', earInner: '#a85f22',
    coat: 'fluffy', head: [46, 36], snout: [16, 10], ear: 'smallPrick', earScale: 0.9, build: [46, 30, 20], tail: 'pom', marks: [], ruff: true, eyeSize: 5.5,
  },
  akita: {
    fur: '#c9763a', furDark: '#8e4a16', furLight: '#e69c62', light: '#fcefd9', earInner: '#fcefd9', brow: '#fcefd9',
    coat: 'fluffy', head: [47, 38], snout: [15, 17], ear: 'prick', build: [44, 38, 19], tail: 'curl', marks: ['urajiro', 'brows', 'chest', 'socks'],
  },
  bloodhound: {
    fur: '#a5562b', furDark: '#6e3010', furLight: '#c77a4c', light: '#c77a4c', earColor: '#7e3b17', body: '#3a2a22', bodyDark: '#1c1410',
    coat: 'smooth', head: [42, 39], snout: [17, 23], ear: 'flop', earScale: 1.5, build: [42, 38, 18], tail: 'whip', marks: ['wrinkles', 'jowls'],
  },  labradoodle: {
    fur: '#c99a63', furDark: '#93683a', furLight: '#e3bd8a', light: '#e8c99c', muzzle: '#d8ad78',
    coat: 'curly', head: [45, 37], snout: [16, 19], ear: 'curlyFlop', build: [42, 38, 18], tail: 'curly', marks: [], topknot: true,
  },
  cockapoo: {
    fur: '#2d2a2a', furDark: '#141212', furLight: '#4d4848', light: '#3d3939', earColor: '#232020', iris: '#6b4a2b', dark: true,
    coat: 'curly', head: [42, 36], snout: [14, 14], ear: 'curlyFlop', earScale: 1.2, build: [36, 30, 16], tail: 'curly', marks: [], topknot: true,
  },
  havanese: {
    fur: '#f5e7cf', furDark: '#d2bd98', furLight: '#fffaf0', light: '#fffaf0', earColor: '#c99a5e', patch: '#c99a5e',
    coat: 'shaggy', head: [42, 35], snout: [12, 11], ear: 'shaggyFlop', earScale: 1.1, build: [34, 26, 15], tail: 'plume', marks: ['eyePatches'], topknot: true, bow: '#facc15',
  },
  scottie: {
    fur: '#26262b', furDark: '#0f0f12', furLight: '#47474f', light: '#3a3a42', earInner: '#55555e', iris: '#6b4a2b', dark: true,
    coat: 'shaggy', bodyCoat: 'smooth', head: [38, 36], snout: [14, 22], ear: 'smallPrick', earScale: 1.2, build: [40, 18, 17], tail: 'carrot', marks: ['beard', 'bushyBrows'],
  },
  irish_setter: {
    fur: '#a8401c', furDark: '#6e2408', furLight: '#c9633a', light: '#c35a30', earColor: '#8f3313',
    coat: 'smooth', head: [38, 37], snout: [13, 24], ear: 'shaggyFlop', earScale: 1.3, build: [38, 42, 15], tail: 'feather', marks: [], cheeks: 0.72,
  },
  malamute: {
    fur: '#5f6470', furDark: '#3b3f48', furLight: '#868b96', light: '#f8fafc', earInner: '#e8c0c0', iris: '#6b4a2b',
    coat: 'fluffy', head: [48, 38], snout: [16, 19], ear: 'prick', earScale: 0.8, build: [48, 38, 21], tail: 'pom', marks: ['huskyMask', 'chest', 'socks'],
  },
  great_pyrenees: {
    fur: '#fdfbf5', furDark: '#d9d3c4', furLight: '#ffffff', light: '#ffffff', earColor: '#efe2c8',
    coat: 'fluffy', head: [50, 40], snout: [17, 18], ear: 'flop', earScale: 0.8, build: [52, 38, 22], tail: 'plume', marks: [], ruff: true,
  },
  pekingese: {
    fur: '#e3a45a', furDark: '#a86c24', furLight: '#f5c88a', light: '#f5d7a8', muzzle: '#f2c88a', earColor: '#a86c24',
    coat: 'shaggy', head: [44, 34], snout: [16, 7], ear: 'shaggyFlop', earScale: 1.2, build: [40, 18, 16], tail: 'plume', marks: [], ruff: true, eyeSize: 8.4,
  },
  bull_terrier: {
    fur: '#fbfaf5', furDark: '#d6d2c6', furLight: '#ffffff', light: '#ffffff', earInner: '#f4b7b7',
    coat: 'smooth', head: [36, 42], snout: [17, 26], ear: 'prick', earScale: 0.85, build: [44, 32, 19], tail: 'whip', marks: [], eyeSize: 5.5, cheeks: 0.9,
  },
  basenji: {
    fur: '#c8743a', furDark: '#8c4a1a', furLight: '#e0985e', light: '#fffaf2', earInner: '#f2c3a6',
    coat: 'smooth', head: [37, 36], snout: [12, 19], ear: 'bigPrick', build: [34, 40, 14], tail: 'curl', tailTip: true, marks: ['blaze', 'chest', 'socks', 'wrinkles'], cheeks: 0.72,
  },
  shar_pei: {
    fur: '#d29a5e', furDark: '#9a6630', furLight: '#e9bb85', light: '#e2b07a', muzzle: '#c78c50', earColor: '#b07a40',
    coat: 'smooth', head: [48, 38], snout: [21, 13], ear: 'fold', earScale: 0.7, build: [44, 32, 19], tail: 'curl', marks: ['wrinkles', 'jowls'], eyeSize: 5.5, cheeks: 1,
  },
  cairn_terrier: {
    fur: '#b88a5a', furDark: '#7d5a36', furLight: '#d5aa7a', light: '#d9b98c', earColor: '#6e4f30', earInner: '#d8a890', muzzle: '#8a6440',
    coat: 'shaggy', head: [42, 35], snout: [14, 14], ear: 'smallPrick', build: [36, 26, 16], tail: 'carrot', marks: ['beard'],
  },
  pomchi: {
    fur: '#e8a24a', furDark: '#a8661c', furLight: '#f8c77e', light: '#fdf1dc', muzzle: '#f2c48a', earInner: '#f6c0a8',
    coat: 'fluffy', bodyCoat: 'smooth', head: [40, 37], snout: [10, 12], ear: 'satellite', earScale: 0.85, build: [32, 28, 13], tail: 'pom', marks: ['chest'], eyeSize: 8.4, cheeks: 0.75,
  },
  pomapoo: {
    fur: '#e9b77c', furDark: '#b07e42', furLight: '#f7d4a6', light: '#f8dfba', muzzle: '#f1c995', earColor: '#d9a060',
    coat: 'curly', head: [41, 35], snout: [11, 12], ear: 'curlyFlop', earScale: 0.8, build: [36, 24, 14], tail: 'pom', marks: [], topknot: true, eyeSize: 8,
  },
};

const EYE_Y = 82;
const EYE_DX = 18;
/** Puppy proportions: eyes this much bigger than the breed's, snouts shortened by this factor. */
const EYE_BOOST = 5;
const SNOUT_SHORTEN = 0.72;
/** Heads are drawn this much bigger than the body, scaled from the neck so hats and collars still line up. */
const HEAD_SCALE = 1.17;

/* ---------------- shape helpers ---------------- */

const f = (v) => v.toFixed(1);

function ellipsePath(cx, cy, rx, ry) {
  return `M${f(cx - rx)} ${f(cy)} a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0 a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
}

function ring(cx, cy, rx, ry, rot = 0) {
  const r = (rot * Math.PI) / 180;
  return (a, grow) => {
    const x = Math.cos(a) * (rx + grow);
    const y = Math.sin(a) * (ry + grow);
    return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  };
}

/** Bumps (curls) around an ellipse. */
function scallop(cx, cy, rx, ry, bumps, depth, rot = 0) {
  const pt = ring(cx, cy, rx, ry, rot);
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const [x, y] = pt((i / bumps) * Math.PI * 2, 0);
    if (i === 0) d += `M${f(x)} ${f(y)}`;
    else {
      const [qx, qy] = pt(((i - 0.5) / bumps) * Math.PI * 2, depth);
      d += ` Q${f(qx)} ${f(qy)} ${f(x)} ${f(y)}`;
    }
  }
  return d + 'Z';
}

/** Soft pointed tufts around an ellipse — fluffy or shaggy fur. */
function tufts(cx, cy, rx, ry, n, depth, rot = 0) {
  const pt = ring(cx, cy, rx, ry, rot);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const [x0, y0] = pt(a0, 0);
    const [c1x, c1y] = pt(a0 + (a1 - a0) * 0.35, depth * 0.6);
    const [tx, ty] = pt(a0 + (a1 - a0) * 0.75, depth);
    const [x1, y1] = pt(a1, 0);
    if (i === 0) d += `M${f(x0)} ${f(y0)}`;
    d += ` Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)} Q${f(x1 + (tx - x1) * 0.2)} ${f(y1 + (ty - y1) * 0.2)} ${f(x1)} ${f(y1)}`;
  }
  return d + 'Z';
}

/** A blob in the breed's coat style. */
function blob(coat, cx, cy, rx, ry, rot = 0) {
  const per = Math.round((rx + ry) / 3.2);
  switch (coat) {
    case 'curly':
      return scallop(cx, cy, rx, ry, per, 3.2, rot);
    case 'fluffy':
      return tufts(cx, cy, rx, ry, per, 4.5, rot);
    case 'shaggy':
      return tufts(cx, cy, rx, ry, per, 4.5, rot);
    default:
      return ellipsePath(cx, cy, rx, ry);
  }
}

/** Shapes that read as one silhouette: a thick outline pass, then a fill pass that hides the inner seams. */
function Silhouette({ paths, fill }) {
  return (
    __jsx_h('g', null
      , paths.map((d, i) => (
        __jsx_h('path', { key: `o${i}`, d: d, fill: OUTLINE, stroke: OUTLINE, strokeWidth: 6, strokeLinejoin: "round",} )
      ))
      , paths.map((d, i) => (
        __jsx_h('path', { key: `f${i}`, d: d, fill: fill,} )
      ))
    )
  );
}

const outlined = { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: 'round'  };

/* ---------------- geometry from proportions ---------------- */

function headGeometry(look) {
  const [w, h] = look.head;
  const sw = look.snout[0];
  const len = look.snout[1] * SNOUT_SHORTEN;
  const skull = { cx: 100, cy: 72, rx: w, ry: h };
  const cheeks = { cx: 100, cy: 95, rx: w * (_nullishCoalesce(look.cheeks, () => ( 0.8))), ry: 21 };
  const nose = EYE_Y + 5 + len * 0.55;
  const muzzle = { cx: 100, cy: nose + 5, rx: sw, ry: 9 + len * 0.45 };
  return { w, h, sw, len, skull, cheeks, nose, muzzle };
}


function bodyGeometry(look) {
  const [bw, leg, lw] = look.build;
  const bc = _nullishCoalesce(look.bodyCoat, () => ( look.coat));
  const torso =
    bc === 'smooth'
      ? `M${f(100 - bw * 0.62)} 114 C${f(100 - bw - 4)} 130 ${f(100 - bw - 4)} 176 ${f(100 - bw + 6)} 206 L${f(100 + bw - 6)} 206 C${f(100 + bw + 4)} 176 ${f(100 + bw + 4)} 130 ${f(100 + bw * 0.62)} 114Z`
      : blob(bc, 100, 164, bw + 2, 44);
  const hr = Math.min(20, Math.max(14, bw * 0.5));
  const haunches = [-1, 1].map((s) => blob(bc, 100 + s * (bw - 2), 188 - (20 - hr) * 0.4, hr, hr + 1));
  const legGap = Math.max(bw * 0.42, lw + 1);
  const legX = [100 - legGap, 100 + legGap];
  return { bw, leg, lw, torso, haunches, legX };
}

/* ---------------- ears ---------------- */

/** The LEFT ear in a frame where the skull is 46 wide; the right ear is mirrored. */
function EarShape({ look }) {
  const fill = _nullishCoalesce(look.earColor, () => ( look.fur));
  const inner = _nullishCoalesce(look.earInner, () => ( '#f2b8b0'));
  switch (look.ear) {
    case 'flop':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M76 46 C60 40 44 50 42 70 C40 94 44 116 54 124 C61 130 70 122 70 110 C70 94 72 72 80 56Z"                         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M70 58 C64 74 62 96 64 112"       , stroke: look.furDark, strokeWidth: 2.5, fill: "none", opacity: 0.45, strokeLinecap: "round",} )
        )
      );
    case 'curlyFlop':
      return __jsx_h('path', { d: scallop(55, 88, 15, 30, 14, 4, 10), fill: fill, ...outlined,} );
    case 'shaggyFlop':
      return __jsx_h('path', { d: tufts(53, 98, 15, 36, 14, 5, 8), fill: fill, ...outlined,} );
    case 'fold':
      return __jsx_h('path', { d: "M70 44 C56 38 44 46 46 60 C54 56 62 54 76 56Z"             , fill: fill, ...outlined,} );
    case 'smallPrick':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M60 52 Q60 32 66 20 Q78 26 88 40Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M65 46 Q65 34 68 28 Q76 32 82 41Z"         , fill: inner,} )
        )
      );
    case 'prick':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M56 58 Q54 30 60 10 Q80 22 92 40Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M62 50 Q61 32 64 22 Q76 30 84 41Z"         , fill: inner,} )
          , __jsx_h('path', { d: "M63 48 L67 40 M66 50 L71 43"       , stroke: look.light, strokeWidth: 1.6, strokeLinecap: "round", opacity: 0.8,} )
        )
      );
    case 'bigPrick':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M52 64 Q46 30 52 4 Q82 16 96 40Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M59 54 Q55 32 58 16 Q78 26 88 41Z"         , fill: inner,} )
        )
      );
    case 'bat':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M58 60 C42 46 42 18 58 14 C76 12 90 32 92 48Z"             , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M61 53 C51 43 51 26 60 23 C72 22 82 35 84 46Z"             , fill: inner,} )
        )
      );
    case 'butterfly':
      // Papillon: big upright ears with a long fringe, like butterfly wings.
      return (
        __jsx_h('g', null
          /* long silky fringe hanging from the outer edge */
          , __jsx_h('path', {
            d: "M92 42 C80 22 54 2 30 -2 C20 -2 14 4 14 12 C8 20 12 28 6 36 C10 44 6 52 14 58 C18 64 24 64 30 70 C38 72 44 66 52 72 C58 70 62 64 68 60Z"                                           ,
            fill: "#d8b08a",
            ...outlined,}
          )
          , __jsx_h('g', { stroke: "#a8764e", strokeWidth: 1.6, fill: "none", strokeLinecap: "round", opacity: 0.8,}
            , __jsx_h('path', { d: "M24 8 C18 22 16 36 18 50"       ,} )
            , __jsx_h('path', { d: "M32 14 C26 30 24 44 28 60"       ,} )
            , __jsx_h('path', { d: "M44 24 C38 38 38 52 42 64"       ,} )
            , __jsx_h('path', { d: "M14 30 C12 38 12 46 16 54"       ,} )
          )
          , __jsx_h('path', { d: "M68 58 C52 46 38 28 32 8 C32 4 36 2 40 4 C62 12 84 26 95 44Z"                   , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M69 50 C57 40 46 26 42 13 C59 18 76 30 87 42Z"             , fill: inner,} )
        )
      );
    case 'satellite':
      // Classic Chihuahua radar ears: wide base on the side of the apple dome, flaring out & up at ~35°.
      return (
        __jsx_h('g', null
          , __jsx_h('path', {
            d: "M60 66 C42 54 28 32 27 10 C27 4 32 2 38 5 C58 14 76 28 86 44Z"                   ,
            fill: fill,
            ...outlined,}
          )
          , __jsx_h('path', {
            d: "M62 59 C47 49 36 31 35 14 C35 10 38 9 42 11 C57 19 71 30 79 43Z"                   ,
            fill: inner,}
          )
          , __jsx_h('path', {
            d: "M54 35 C59 40 64 46 67 52 M45 25 C51 30 55 35 59 41"               ,
            stroke: "#d98279",
            strokeWidth: 1.6,
            fill: "none",
            strokeLinecap: "round",}
          )
          , __jsx_h('path', {
            d: "M35 9 C40 13 45 18 49 23"       ,
            stroke: look.furLight,
            strokeWidth: 2,
            fill: "none",
            strokeLinecap: "round",}
          )
        )
      );
    case 'tipped':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M58 56 L62 22 C70 16 84 26 92 42Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M62 22 C70 16 80 22 84 32 C76 30 70 30 62 34Z"             , fill: inner,} )
        )
      );
  }
}

const FLOPPY = ['flop', 'curlyFlop', 'shaggyFlop', 'fold'];

/* ---------------- face ---------------- */

const SPOTS_HEAD = [[72, 60, 4.5], [128, 56, 4], [112, 46, 3], [88, 48, 2.6], [136, 92, 3.4], [64, 96, 3], [116, 110, 2.4], [84, 112, 2.2]];
const SPOTS_BODY = [[72, 140, 4.5], [128, 136, 4], [132, 176, 4], [68, 178, 4], [90, 150, 3], [112, 162, 3], [84, 194, 3], [118, 196, 3.2]];

function Markings({ look, g }) {
  const has = (m) => look.marks.includes(m);
  const { w, sw, nose, muzzle } = g;
  const bw = (_nullishCoalesce(look.blazeW, () => ( 0.35))) - 0.35; // wider blazes are wider at the top too
  const muzzleShape = blob(look.coat, muzzle.cx, muzzle.cy, muzzle.rx, muzzle.ry);
  return (
    __jsx_h(__jsx_Fragment, null
      , has('huskyMask') && (
        __jsx_h('g', { fill: look.light,}
          , __jsx_h('ellipse', { cx: 100, cy: 100, rx: w * 0.82, ry: 24,} )
          , __jsx_h('ellipse', { cx: 100 - EYE_DX, cy: EYE_Y - 2, rx: 10, ry: 8,} )
          , __jsx_h('ellipse', { cx: 100 + EYE_DX, cy: EYE_Y - 2, rx: 10, ry: 8,} )
          , __jsx_h('path', { d: `M100 ${EYE_Y - 6} L${f(100 - sw * 0.7)} ${f(nose)} L${f(100 + sw * 0.7)} ${f(nose)}Z`,} )
          , __jsx_h('path', { d: `M100 44 L94 ${EYE_Y - 10} L100 ${EYE_Y - 2} L106 ${EYE_Y - 10}Z`, fill: look.fur,} )
        )
      )
      , has('urajiro') && (
        __jsx_h('path', {
          d: `M${f(100 - w * 0.86)} 92 C${f(100 - w * 0.7)} 118 ${f(100 - w * 0.3)} 122 100 122 C${f(100 + w * 0.3)} 122 ${f(100 + w * 0.7)} 118 ${f(100 + w * 0.86)} 92 C${f(100 + w * 0.5)} 98 112 94 100 ${EYE_Y + 4} C88 94 ${f(100 - w * 0.5)} 98 ${f(100 - w * 0.86)} 92Z`,
          fill: look.light,}
        )
      )
      , has('cap') && __jsx_h('ellipse', { cx: 100, cy: EYE_Y - 30, rx: 70, ry: 48, fill: look.patch,} )
      , has('eyePatches') && (
        __jsx_h('g', { fill: look.patch,}
          , __jsx_h('ellipse', { cx: 100 - EYE_DX - (look.patchHigh ? 12 : 8), cy: EYE_Y - (look.patchHigh ? 18 : 12), rx: 22, ry: 23,} )
          , __jsx_h('ellipse', { cx: 100 + EYE_DX + (look.patchHigh ? 12 : 8), cy: EYE_Y - (look.patchHigh ? 18 : 12), rx: 22, ry: 23,} )
        )
      )
      , has('monkeyFace') && __jsx_h('ellipse', { cx: 100, cy: EYE_Y + 5, rx: 31, ry: 21, fill: look.light,} )
      , has('saintMask') && (
        __jsx_h('g', { fill: "#3a1a08",}
          , __jsx_h('ellipse', { cx: 100 - EYE_DX - 2, cy: EYE_Y, rx: 14, ry: 11, opacity: 0.6,} )
          , __jsx_h('ellipse', { cx: 100 + EYE_DX + 2, cy: EYE_Y, rx: 14, ry: 11, opacity: 0.6,} )
        )
      )
      , has('blaze') && (
        __jsx_h('path', {
          d: `M${f(100 - 3 - bw * 10)} 40 Q100 37 ${f(100 + 3 + bw * 10)} 40 L${f(100 + sw * (_nullishCoalesce(look.blazeW, () => ( 0.35))))} ${EYE_Y - 4} Q${f(100 + sw * 0.9)} ${f(nose - 6)} ${f(100 + sw)} ${f(muzzle.cy)} L${f(100 - sw)} ${f(muzzle.cy)} Q${f(100 - sw * 0.9)} ${f(nose - 6)} ${f(100 - sw * (_nullishCoalesce(look.blazeW, () => ( 0.35))))} ${EYE_Y - 4}Z`,
          fill: look.light,}
        )
      )
      , (has('blaze') || has('huskyMask') || has('urajiro')) && __jsx_h('path', { d: muzzleShape, fill: look.light,} )
      , look.muzzle && __jsx_h('path', { d: muzzleShape, fill: look.muzzle,} )
      , has('pugMask') && (
        __jsx_h('g', { fill: "#2f2622", opacity: 0.55,}
          , __jsx_h('ellipse', { cx: 100 - EYE_DX, cy: EYE_Y, rx: 10, ry: 8.5,} )
          , __jsx_h('ellipse', { cx: 100 + EYE_DX, cy: EYE_Y, rx: 10, ry: 8.5,} )
        )
      )
      , has('spots') && (
        __jsx_h('g', { fill: _nullishCoalesce(look.spotColor, () => ( '#2d2a2a')),}
          , SPOTS_HEAD.map(([x, y, r]) => (
            __jsx_h('circle', { key: `${x}-${y}`, cx: x, cy: y, r: r,} )
          ))
        )
      )
      , has('cheekPatches') && (
        __jsx_h('g', { fill: look.brow,}
          , __jsx_h('ellipse', { cx: 100 - sw - 3, cy: nose + 6, rx: 6, ry: 7,} )
          , __jsx_h('ellipse', { cx: 100 + sw + 3, cy: nose + 6, rx: 6, ry: 7,} )
        )
      )
      , has('beard') && __jsx_h('path', { d: tufts(100, muzzle.cy + 6, sw + 3, muzzle.ry + 6, 14, 5), fill: look.light,} )
      , has('bushyBrows') && (
        __jsx_h('g', { fill: look.light,}
          , __jsx_h('path', { d: tufts(100 - EYE_DX, EYE_Y - 11, 11, 5, 8, 3.5, -10),} )
          , __jsx_h('path', { d: tufts(100 + EYE_DX, EYE_Y - 11, 11, 5, 8, 3.5, 10),} )
        )
      )
      , has('brows') && (
        __jsx_h('g', { fill: _nullishCoalesce(look.brow, () => ( look.light)),}
          , __jsx_h('ellipse', { cx: 100 - EYE_DX + 2, cy: EYE_Y - 12, rx: 5, ry: 3.4,} )
          , __jsx_h('ellipse', { cx: 100 + EYE_DX - 2, cy: EYE_Y - 12, rx: 5, ry: 3.4,} )
        )
      )
      , has('wrinkles') && (
        __jsx_h('g', { stroke: look.furDark, strokeWidth: 2.4, fill: "none", strokeLinecap: "round", opacity: 0.8,}
          , __jsx_h('path', { d: "M88 56 Q100 50 112 56"     ,} )
          , __jsx_h('path', { d: "M91 63 Q100 59 109 63"     ,} )
          , __jsx_h('path', { d: `M92 ${f(nose - 9)} Q100 ${f(nose - 13)} 108 ${f(nose - 9)}`,} )
        )
      )
    )
  );
}

function Eyes({ look, mood }) {
  const lid = look.dark ? '#8a8a94' : OUTLINE;
  if (mood === 'happy') {
    return (
      __jsx_h('g', { stroke: lid, strokeWidth: 3.5, fill: "none", strokeLinecap: "round",}
        , __jsx_h('path', { d: `M${100 - EYE_DX - 8} ${EYE_Y + 2} Q${100 - EYE_DX} ${EYE_Y - 7} ${100 - EYE_DX + 8} ${EYE_Y + 2}`,} )
        , __jsx_h('path', { d: `M${100 + EYE_DX - 8} ${EYE_Y + 2} Q${100 + EYE_DX} ${EYE_Y - 7} ${100 + EYE_DX + 8} ${EYE_Y + 2}`,} )
      )
    );
  }
  const big = mood === 'excited' || mood === 'curious';
  const r = (_nullishCoalesce(look.eyeSize, () => ( 6.5))) + EYE_BOOST + (big ? 0.8 : 0);
  return (
    __jsx_h('g', null
      , [-1, 1].map((s) => {
        const x = 100 + s * EYE_DX;
        return (
          __jsx_h('g', { key: s,}
            , __jsx_h('ellipse', { cx: x, cy: EYE_Y + 1, rx: r + 2, ry: r + 1.2, fill: look.furDark, opacity: 0.14,} )
            , __jsx_h('ellipse', { cx: x, cy: EYE_Y, rx: r, ry: r * 0.95, fill: (s === 1 && look.iris2) || look.iris || '#4a2a14', stroke: look.dark ? '#6b6b74' : '#1c1410', strokeWidth: 1.6,} )
            , __jsx_h('circle', { cx: x, cy: EYE_Y + 0.5, r: r * 0.58, fill: "#0b0705",} )
            /* a glossy glow in the lower iris, and big sparkly highlights */
            , __jsx_h('ellipse', { cx: x, cy: EYE_Y + r * 0.55, rx: r * 0.62, ry: r * 0.28, fill: "white", opacity: 0.22,} )
            , __jsx_h('circle', { cx: x + r * 0.3, cy: EYE_Y - r * 0.32, r: r * 0.42, fill: "white",} )
            , __jsx_h('circle', { cx: x - r * 0.4, cy: EYE_Y + r * 0.34, r: r * 0.2, fill: "white", opacity: 0.95,} )
            , __jsx_h('circle', { cx: x + r * 0.52, cy: EYE_Y + r * 0.2, r: r * 0.09, fill: "white", opacity: 0.9,} )
          )
        );
      })
      , mood === 'curious' && (
        __jsx_h('path', { d: `M${100 + EYE_DX - 9} ${EYE_Y - 15} Q${100 + EYE_DX} ${EYE_Y - 21} ${100 + EYE_DX + 9} ${EYE_Y - 15}`, stroke: lid, strokeWidth: 2.6, fill: "none", strokeLinecap: "round",} )
      )
    )
  );
}

function NoseMouth({ look, g, mood }) {
  const n = g.nose;
  const nw = Math.min(10, Math.max(6.5, g.sw * 0.48));
  const mw = Math.min(13, Math.max(8, g.sw * 0.62));
  const darkMuzzle = look.marks.includes('pugMask') || !!look.darkMuzzle;
  const line = darkMuzzle ? '#8c7a66' : OUTLINE;
  return (
    __jsx_h('g', null
      /* nose: wide on top, narrowing to the philtrum, with nostrils and a shine */
      , __jsx_h('path', {
        d: `M${f(100 - nw)} ${f(n - 3)} Q100 ${f(n - 7.5)} ${f(100 + nw)} ${f(n - 3)} Q${f(100 + nw + 1)} ${f(n + 3)} 102 ${f(n + 4.5)} L98 ${f(n + 4.5)} Q${f(100 - nw - 1)} ${f(n + 3)} ${f(100 - nw)} ${f(n - 3)}Z`,
        fill: "#1c1410",}
      )
      , __jsx_h('ellipse', { cx: 100 - nw * 0.45, cy: n + 0.5, rx: 1.8, ry: 1.2, fill: "#000",} )
      , __jsx_h('ellipse', { cx: 100 + nw * 0.45, cy: n + 0.5, rx: 1.8, ry: 1.2, fill: "#000",} )
      , __jsx_h('ellipse', { cx: 100 - nw * 0.25, cy: n - 4, rx: nw * 0.35, ry: 1.4, fill: "white", opacity: 0.45,} )
      , mood === 'excited' ? (
        __jsx_h('g', null
          , __jsx_h('path', { d: `M${f(100 - mw)} ${f(n + 8)} Q100 ${f(n + 27)} ${f(100 + mw)} ${f(n + 8)} Q100 ${f(n + 12)} ${f(100 - mw)} ${f(n + 8)}Z`, fill: "#6b1a1a", stroke: OUTLINE, strokeWidth: 2, strokeLinejoin: "round",} )
          , __jsx_h('path', { d: `M94 ${f(n + 16)} Q100 ${f(n + 12)} 106 ${f(n + 16)} Q104 ${f(n + 23)} 100 ${f(n + 23)} Q96 ${f(n + 23)} 94 ${f(n + 16)}Z`, fill: "#f17a8a",} )
        )
      ) : (
        __jsx_h(__jsx_Fragment, null
          , mood === 'happy' && (
            __jsx_h('path', { d: `M94.5 ${f(n + 10)} Q94.5 ${f(n + 25)} 100 ${f(n + 25)} Q105.5 ${f(n + 25)} 105.5 ${f(n + 10)}Z`, fill: "#f17a8a", stroke: OUTLINE, strokeWidth: 1.8,} )
          )
          , __jsx_h('path', {
            d: `M100 ${f(n + 4.5)} L100 ${f(n + 8.5)} M${f(100 - mw)} ${f(n + 7)} Q${f(100 - mw * 0.45)} ${f(n + 13)} 100 ${f(n + 8.5)} Q${f(100 + mw * 0.45)} ${f(n + 13)} ${f(100 + mw)} ${f(n + 7)}`,
            stroke: line,
            strokeWidth: 2.2,
            fill: "none",
            strokeLinecap: "round",}
          )
          , look.marks.includes('underbite') && (
            __jsx_h('g', { fill: "white", stroke: OUTLINE, strokeWidth: 1,}
              , __jsx_h('path', { d: `M94.5 ${f(n + 9.5)} l2 -3.2 l2 3.2Z`,} )
              , __jsx_h('path', { d: `M101.5 ${f(n + 9.5)} l2 -3.2 l2 3.2Z`,} )
            )
          )
        )
      )
      /* whisker dots */
      , __jsx_h('g', { fill: darkMuzzle ? '#5c4d40' : look.furDark, opacity: 0.5,}
        , [-1, 1].map((s) => (
          __jsx_h('g', { key: s,}
            , __jsx_h('circle', { cx: 100 + s * (mw - 1), cy: n + 1, r: 1,} )
            , __jsx_h('circle', { cx: 100 + s * (mw + 2), cy: n + 3.5, r: 1,} )
            , __jsx_h('circle', { cx: 100 + s * (mw - 2), cy: n + 4, r: 1,} )
          )
        ))
      )
    )
  );
}

function HairBow({ color }) {
  return (
    __jsx_h('g', { stroke: OUTLINE, strokeWidth: 2.5, strokeLinejoin: "round",}
      , __jsx_h('path', { d: "M100 36 L84 27 L84 45Z"     , fill: color,} )
      , __jsx_h('path', { d: "M100 36 L116 27 L116 45Z"     , fill: color,} )
      , __jsx_h('circle', { cx: 100, cy: 36, r: 4.5, fill: color,} )
    )
  );
}

/* ---------------- tail ---------------- */

function Tail({ look, bw, fill }) {
  const dx = bw - 40;
  const tip = look.tailTip ? look.light : null;
  let el;
  switch (look.tail) {
    case 'sickleThin':
      el = (
        __jsx_h('g', { fill: "none", strokeLinecap: "round",}
          , __jsx_h('path', { d: "M132 196 C158 194 170 172 162 150 C158 140 150 138 146 142"             , stroke: OUTLINE, strokeWidth: 11,} )
          , __jsx_h('path', { d: "M132 196 C158 194 170 172 162 150 C158 140 150 138 146 142"             , stroke: fill, strokeWidth: 5.5,} )
        )
      );
      break;
    case 'sickle':
      el = __jsx_h('path', { d: "M132 198 C162 198 180 174 174 144 C172 134 164 128 157 131 C162 152 154 178 130 184Z"                   , fill: fill, ...outlined,} );
      break;
    case 'plume':
      el = (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M132 200 C164 202 184 178 180 148 C178 138 171 134 167 139 C170 162 156 184 130 186Z"                   , fill: fill, ...outlined,} )
          , tip && __jsx_h('path', { d: "M180 148 C178 138 171 134 167 139 C169 146 170 152 170 158 C176 156 180 152 180 148Z"                   , fill: tip,} )
        )
      );
      break;
    case 'otter':
      el = __jsx_h('path', { d: "M130 202 C160 204 180 188 184 166 C177 168 160 184 130 188Z"             , fill: fill, ...outlined,} );
      break;
    case 'curl':
      el = (
        __jsx_h('g', { fill: "none", strokeLinecap: "round",}
          , __jsx_h('path', { d: "M134 184 C160 182 170 162 158 152 C148 145 138 158 149 164"             , stroke: OUTLINE, strokeWidth: 17,} )
          , __jsx_h('path', { d: "M134 184 C160 182 170 162 158 152 C148 145 138 158 149 164"             , stroke: fill, strokeWidth: 11,} )
          , look.marks.includes('urajiro') && __jsx_h('path', { d: "M146 179 C160 174 164 162 158 156"       , stroke: look.light, strokeWidth: 4,} )
        )
      );
      break;
    case 'whip':
      el = (
        __jsx_h('g', { fill: "none", strokeLinecap: "round",}
          , __jsx_h('path', { d: "M132 198 C156 196 172 178 168 146"       , stroke: OUTLINE, strokeWidth: 11,} )
          , __jsx_h('path', { d: "M132 198 C156 196 172 178 168 146"       , stroke: fill, strokeWidth: 5.5,} )
          , tip && __jsx_h('path', { d: "M169.5 158 C169.5 153 169 149 168 146"       , stroke: tip, strokeWidth: 5.5,} )
        )
      );
      break;
    case 'stub':
      el = __jsx_h('ellipse', { cx: 140, cy: 198, rx: 10, ry: 8, fill: fill, ...outlined,} );
      break;
    case 'carrot':
      el = __jsx_h('path', { d: "M130 194 C142 178 146 156 150 138 C159 154 159 180 144 198Z"             , fill: fill, ...outlined,} );
      break;
    case 'feather':
      // Plumed tail arching over the back, with long flowing hair.
      el = (
        __jsx_h('g', null
          , __jsx_h('path', {
            d: "M132 194 C150 176 152 148 140 124 C152 116 172 122 182 140 C190 154 186 170 178 180 C172 178 170 186 162 188 C156 186 150 194 142 194Z"                               ,
            fill: look.light,
            ...outlined,}
          )
          , __jsx_h('path', { d: "M146 130 C162 128 174 140 176 158"       , stroke: _nullishCoalesce(look.patch, () => ( look.furDark)), strokeWidth: 6, fill: "none", strokeLinecap: "round", opacity: 0.85,} )
          , __jsx_h('g', { stroke: look.furDark, strokeWidth: 1.5, fill: "none", strokeLinecap: "round", opacity: 0.7,}
            , __jsx_h('path', { d: "M150 142 C160 152 162 166 158 180"       ,} )
            , __jsx_h('path', { d: "M160 136 C172 148 174 162 170 176"       ,} )
          )
        )
      );
      break;
    case 'pom':
      el = __jsx_h('path', { d: tufts(148, 156, 16, 26, 10, 6, 28), fill: fill, ...outlined,} );
      break;
    case 'curly':
      el = __jsx_h('path', { d: scallop(150, 170, 11, 22, 11, 4, 28), fill: fill, ...outlined,} );
      break;
  }
  return __jsx_h('g', { transform: `translate(${dx} 0)`,}, el);
}

/* ---------------- avatar ---------------- */









function DogAvatar({ breed, gear = [], mood = 'idle', size = 200, className }) {
  const look = _nullishCoalesce(LOOKS[breed], () => ( LOOKS.cavapoo));
  const uid = useId().replace(/:/g, '');
  const has = (m) => look.marks.includes(m);
  const g = headGeometry(look);
  const b = bodyGeometry(look);
  const wagFast = mood === 'happy' || mood === 'excited';
  const floppy = FLOPPY.includes(look.ear);
  const earShift = 46 - g.w;
  const earScale = _nullishCoalesce(look.earScale, () => ( 1));

  const headFill = `url(#hf-${uid})`;
  const bodyBase = _nullishCoalesce(look.body, () => ( look.fur));
  const bodyFill = `url(#bf-${uid})`;
  const headPaths = [
    blob(look.coat, g.skull.cx, g.skull.cy, g.skull.rx, g.skull.ry),
    blob(look.coat, g.cheeks.cx, g.cheeks.cy, g.cheeks.rx, g.cheeks.ry),
    blob(look.coat, g.muzzle.cx, g.muzzle.cy, g.muzzle.rx, g.muzzle.ry),
  ];
  if (look.ruff) headPaths.unshift(tufts(100, 90, g.w + 10, 39, 26, 7)); // scruffy halo
  if (look.coat === 'fluffy') headPaths.unshift(tufts(100, 92, g.w + 11, 37, 22, 6.5)); // ruff
  const bodyPaths = [b.torso, ...b.haunches];
  const legFill = look.body ? headFill : bodyFill;
  const pawFill = has('socks') ? look.light : look.fur;
  const texture = look.coat === 'smooth' ? null : `url(#tx-${uid})`;

  const ear = (side) => (
    __jsx_h('g', { key: side, transform: side ? 'translate(200 0) scale(-1 1)' : undefined,}
      , __jsx_h(motion.g, {
        style: { originX: floppy ? 0.85 : 0.6, originY: floppy ? 0 : 1 },
        animate: {
          rotate: mood === 'curious' && side ? -16 : mood === 'excited' ? [0, -9, 0] : [0, -4, 0, 0, 0],
        },
        transition: 
          mood === 'curious'
            ? { type: 'spring', stiffness: 200 }
            : { duration: mood === 'excited' ? 0.45 : 3.5, repeat: Infinity, ease: 'easeInOut', delay: side ? 0.15 : 0 }
        ,}

        , __jsx_h('g', { transform: `translate(${earShift} 0) translate(78 46) scale(${earScale}) translate(-78 -46)`,}
          , __jsx_h(EarShape, { look: look,} )
        )
      )
    )
  );

  return (
    __jsx_h(motion.svg, {
      viewBox: "0 -20 200 240"   ,
      width: size,
      height: size * 1.2,
      className: className,
      animate: mood === 'excited' ? { y: [0, -14, 0] } : { y: 0 },
      transition: mood === 'excited' ? { duration: 0.45, repeat: Infinity, ease: 'easeOut' } : { duration: 0.2 },
      style: { overflow: 'visible' },}

      , __jsx_h('defs', null
        , __jsx_h('radialGradient', { id: `hf-${uid}`, gradientUnits: "userSpaceOnUse", cx: 96, cy: 60, r: 66,}
          , __jsx_h('stop', { offset: "0", stopColor: look.furLight,} )
          , __jsx_h('stop', { offset: "0.55", stopColor: look.fur,} )
          , __jsx_h('stop', { offset: "1", stopColor: look.furDark,} )
        )
        , __jsx_h('radialGradient', { id: `bf-${uid}`, gradientUnits: "userSpaceOnUse", cx: 96, cy: 140, r: 80,}
          , __jsx_h('stop', { offset: "0", stopColor: look.body ? bodyBase : look.furLight,} )
          , __jsx_h('stop', { offset: "0.5", stopColor: bodyBase,} )
          , __jsx_h('stop', { offset: "1", stopColor: look.body ? (_nullishCoalesce(look.bodyDark, () => ( '#1f1b18'))) : look.furDark,} )
        )
        , __jsx_h('pattern', { id: `tx-${uid}`, width: 9, height: 8, patternUnits: "userSpaceOnUse",}
          , look.coat === 'curly' ? (
            __jsx_h('path', { d: "M1 5 q2.5 -4.5 5 0"     , stroke: look.furDark, strokeWidth: 1.3, fill: "none", opacity: 0.45,} )
          ) : (
            __jsx_h('path', { d: "M2 1 l1.5 5 M6.5 3 l1 4"       , stroke: look.furDark, strokeWidth: 1, opacity: 0.35,} )
          )
        )
        , __jsx_h('clipPath', { id: `hc-${uid}`,}
          , headPaths.map((d, i) => (
            __jsx_h('path', { key: i, d: d,} )
          ))
        )
        , __jsx_h('clipPath', { id: `bc-${uid}`,}
          , bodyPaths.map((d, i) => (
            __jsx_h('path', { key: i, d: d,} )
          ))
        )
      )

      , __jsx_h('ellipse', { cx: 100, cy: 210, rx: b.bw + 26, ry: 8, fill: "black", opacity: 0.13,} )

      , __jsx_h(BackGear, { gear: gear, scale: b.bw / 40,} )

      /* tail */
      , __jsx_h(motion.g, {
        style: { originX: 0.05, originY: 0.95 },
        animate: { rotate: wagFast ? [-14, 18, -14] : [-6, 8, -6] },
        transition: { duration: wagFast ? 0.32 : 1.2, repeat: Infinity, ease: 'easeInOut' },}

        , __jsx_h(Tail, { look: look, bw: b.bw, fill: bodyFill,} )
      )

      /* body (breathing) */
      , __jsx_h(motion.g, {
        style: { originX: 0.5, originY: 1 },
        animate: { scaleY: [1, 1.025, 1] },
        transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },}

        /* hind paws peeking out beside the haunches */
        , [-1, 1].map((s) => (
          __jsx_h('ellipse', { key: s, cx: 100 + s * (b.bw + 8), cy: 204, rx: b.bw < 32 ? 9 : 12, ry: 6, fill: pawFill, ...outlined,} )
        ))
        , __jsx_h(Silhouette, { paths: bodyPaths, fill: bodyFill,} )
        , __jsx_h('g', { clipPath: `url(#bc-${uid})`,}
          , texture && __jsx_h('rect', { x: 0, y: 100, width: 200, height: 120, fill: texture,} )
          , (has('chest') || look.body) && __jsx_h('ellipse', { cx: 100, cy: 146, rx: b.bw * 0.52, ry: 30, fill: has('chest') ? look.light : look.fur,} )
          , has('collar') && __jsx_h('path', { d: `M${100 - b.bw - 6} 116 Q100 140 ${100 + b.bw + 6} 116 L${100 + b.bw + 6} 134 Q100 158 ${100 - b.bw - 6} 134Z`, fill: look.light,} )
          , has('bodyPatch') && __jsx_h('ellipse', { cx: 100 + b.bw * 0.9, cy: 150, rx: 16, ry: 20, fill: look.patch,} )
          , has('spots') && SPOTS_BODY.map(([x, y, r]) => __jsx_h('circle', { key: `${x}-${y}`, cx: x, cy: y, r: look.spotColor ? r * 1.8 : r, fill: _nullishCoalesce(look.spotColor, () => ( '#2d2a2a')),} ))
          /* haunch creases */
          , [-1, 1].map((s) => (
            __jsx_h('path', { key: s, d: `M${100 + s * (b.bw - 14)} 176 Q${100 + s * (b.bw - 6)} 170 ${100 + s * (b.bw + 4)} 174`, stroke: look.furDark, strokeWidth: 2, fill: "none", opacity: 0.4,} )
          ))
        )
        , has('frill') && (
          __jsx_h('path', { d: tufts(100, 128, b.bw * 0.72, 17, 16, 5), fill: look.light, stroke: look.furDark, strokeWidth: 1.2, strokeLinejoin: "round",} )
        )
        /* front legs + paws */
        , b.legX.map((x) => (
          __jsx_h('g', { key: x,}
            , __jsx_h('rect', { x: x - b.lw / 2, y: 206 - b.leg, width: b.lw, height: b.leg, rx: b.lw / 2, fill: legFill, ...outlined,} )
            , has('socks') && __jsx_h('rect', { x: x - b.lw / 2 + 1.5, y: 206 - Math.min(14, b.leg * 0.4), width: b.lw - 3, height: Math.min(14, b.leg * 0.4), rx: b.lw / 2 - 1.5, fill: look.light,} )
            , __jsx_h('ellipse', { cx: x, cy: 204, rx: b.lw * 0.68, ry: 7, fill: pawFill, ...outlined,} )
            , __jsx_h('path', { d: `M${x - 3.5} 200 L${x - 3.5} 206 M${x + 3.5} 200 L${x + 3.5} 206`, stroke: OUTLINE, strokeWidth: 1.8,} )
          )
        ))
      )

      , __jsx_h(BodyGear, { gear: gear, scale: b.bw / 40,} )

      , has('barrel') && (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M100 122 L100 130"   , stroke: "#7c2d12", strokeWidth: 3,} )
          , __jsx_h('rect', { x: 88, y: 128, width: 24, height: 17, rx: 6, fill: "#a16207", stroke: OUTLINE, strokeWidth: 2.5,} )
          , __jsx_h('path', { d: "M93 128.5 L93 144.5 M107 128.5 L107 144.5"       , stroke: "#713f12", strokeWidth: 2.5,} )
          , __jsx_h('path', { d: "M91 133 L109 133"   , stroke: "#fbbf24", strokeWidth: 1.5, opacity: 0.7,} )
        )
      )
      , __jsx_h(NeckGear, { gear: gear,} )

      /* head */
      , __jsx_h(motion.g, {
        style: { originX: 0.5, originY: 0.95 },
        animate: { rotate: mood === 'curious' ? 12 : 0, y: mood === 'idle' ? [0, 1.5, 0] : 0 },
        transition: {
          rotate: { type: 'spring', stiffness: 200, damping: 12 },
          y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        },}

        , __jsx_h('g', { transform: `translate(100 118) scale(${HEAD_SCALE}) translate(-100 -118)`,}
        /* upright ears sit behind the skull */
        , !floppy && [ear(0), ear(1)]

        , __jsx_h(Silhouette, { paths: headPaths, fill: headFill,} )
        , __jsx_h('g', { clipPath: `url(#hc-${uid})`,}
          , texture && __jsx_h('rect', { x: 0, y: 20, width: 200, height: 110, fill: texture,} )
          , __jsx_h(Markings, { look: look, g: g,} )
        )
        , look.topknot && __jsx_h('path', { d: blob(look.coat, 100, 42, 16, 10), fill: headFill, ...outlined,} )
        , look.bow && __jsx_h(HairBow, { color: look.bow,} )

        /* floppy ears hang over the sides of the head */
        , floppy && [ear(0), ear(1)]

        , has('monkeyFace') && (
          __jsx_h('g', { strokeLinecap: "round",}
            /* jutting chin with a bristly beard */
            , __jsx_h('path', { d: tufts(100, g.nose + 15, 18, 10, 13, 6), fill: look.fur, stroke: OUTLINE, strokeWidth: 1.8, strokeLinejoin: "round",} )
            /* wiry brows: an awning of strands over each eye */
            , [-1, 1].map((sd) => (
              __jsx_h('g', { key: sd,}
                , __jsx_h('path', { d: tufts(100 + sd * (EYE_DX + 1), EYE_Y - 12, 13, 5, 9, 6, sd * -14), fill: look.fur, stroke: OUTLINE, strokeWidth: 1.6, strokeLinejoin: "round",} )
                , __jsx_h('g', { stroke: "#6e6e7a", strokeWidth: 1.4,}
                  , [0, 1, 2, 3].map((i) => {
                    const x = 100 + sd * (EYE_DX - 7 + i * 5);
                    return __jsx_h('path', { key: i, d: `M${x} ${EYE_Y - 10} l${sd * (3 + i)} ${-7 + i}`,} );
                  })
                )
              )
            ))
            /* mustache bristles flaring out from the snout */
            , __jsx_h('g', { stroke: "#6e6e7a", strokeWidth: 1.4, fill: "none",}
              , [-1, 1].map((sd) => (
                __jsx_h('path', { key: sd, d: `M${100 + sd * 5} ${f(g.nose + 3)} l${sd * 14} 3 M${100 + sd * 6} ${f(g.nose + 6)} l${sd * 13} 8 M${100 + sd * 4} ${f(g.nose + 9)} l${sd * 9} 11 M${100 + sd * 2} ${f(g.nose + 14)} l${sd * 3} 10`,} )
              ))
            )
          )
        )
        , has('jowls') && (
          __jsx_h('g', null
            , [-1, 1].map((sd) => (
              __jsx_h('path', {
                key: sd,
                d: `M${f(100 + sd * g.sw * 0.45)} ${f(g.nose + 2)} C${f(100 + sd * (g.sw + 7))} ${f(g.nose + 3)} ${f(100 + sd * (g.sw + 7))} ${f(g.nose + 19)} ${f(100 + sd * (g.sw - 3))} ${f(g.nose + 22)} C${f(100 + sd * 8)} ${f(g.nose + 24)} ${f(100 + sd * 3)} ${f(g.nose + 19)} ${f(100 + sd * 2)} ${f(g.nose + 12)}Z`,
                fill: look.light,
                stroke: OUTLINE,
                strokeWidth: 2.2,
                strokeLinejoin: "round",}
              )
            ))
          )
        )
        , __jsx_h(Eyes, { look: look, mood: mood,} )
        , has('saintMask') && mood !== 'happy' && (
          __jsx_h('g', { stroke: "#c86b5e", strokeWidth: 1.6, fill: "none", strokeLinecap: "round", opacity: 0.7,}
            , __jsx_h('path', { d: `M${100 - EYE_DX - 7} ${EYE_Y + 6} Q${100 - EYE_DX} ${EYE_Y + 11} ${100 - EYE_DX + 7} ${EYE_Y + 6}`,} )
            , __jsx_h('path', { d: `M${100 + EYE_DX - 7} ${EYE_Y + 6} Q${100 + EYE_DX} ${EYE_Y + 11} ${100 + EYE_DX + 7} ${EYE_Y + 6}`,} )
          )
        )
        /* rosy cheeks, rosier when happy */
        , __jsx_h('g', { fill: "#f472b6", opacity: mood === 'happy' || mood === 'excited' ? 0.55 : 0.4,}
          , __jsx_h('ellipse', { cx: 100 - EYE_DX - 12, cy: EYE_Y + 15, rx: 8.5, ry: 5.2,} )
          , __jsx_h('ellipse', { cx: 100 + EYE_DX + 12, cy: EYE_Y + 15, rx: 8.5, ry: 5.2,} )
        )
        , __jsx_h(NoseMouth, { look: look, g: g, mood: mood,} )

        , __jsx_h(HeadGear, { gear: gear, mood: mood,} )
        )
      )
    )
  );
}

return { DogAvatar };
})();

const { CatAvatar } = (() => {
 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }




 






























const CALICO_ORANGE = '#f58c38';
const CALICO_BLACK = '#242024';

const LOOKS = {
  orange_tabby: { fur: '#f7943c', light: '#fff0d4', stripe: '#c86018', iris: '#34d399', coat: 'short', ear: 'normal', marks: ['tabby'] },
  tuxedo: {
    fur: '#1f2128', light: '#ffffff', iris: '#4ade80', whisker: '#e4e4e7', coat: 'short', ear: 'normal', marks: ['blaze', 'chest', 'socks'],
  },
  gray_tabby: { fur: '#949fab', light: '#edf0f5', stripe: '#3e4756', iris: '#facc15', coat: 'short', ear: 'normal', marks: ['tabby'] },
  calico: {
    fur: '#fffcf5', light: '#ffffff', iris: '#22c55e', coat: 'short', ear: 'normal', marks: [], earColors: [CALICO_BLACK, CALICO_ORANGE],
    patches: [
      { x: 64, y: 64, r: 24, c: CALICO_BLACK, on: 'head' },
      { x: 138, y: 62, r: 25, c: CALICO_ORANGE, on: 'head' },
      { x: 68, y: 180, r: 20, c: CALICO_BLACK, on: 'body' },
      { x: 132, y: 154, r: 20, c: CALICO_ORANGE, on: 'body' },
      { x: 124, y: 194, r: 13, c: CALICO_BLACK, on: 'body' },
    ],
  },
  black_cat: { fur: '#1e1b24', light: '#302b38', muzzle: '#302b38', iris: '#a3e635', whisker: '#a1a1aa', coat: 'short', ear: 'normal', marks: [] },
  siamese: {
    fur: '#f7efe0', light: '#fffaf0', points: '#4e3629', muzzle: '#5c4032', iris: '#38bdf8', whisker: '#ede2d0', coat: 'short', ear: 'normal', marks: ['points'],
  },
  scottish_fold: { fur: '#d8c5ae', light: '#f8f1e7', stripe: '#9c8268', iris: '#38bdf8', coat: 'short', ear: 'fold', marks: ['tabby'], headRx: 52 },
  ragdoll: {
    fur: '#faf3e8', light: '#ffffff', points: '#75859c', muzzle: '#ffffff', iris: '#60a5fa', coat: 'long', ear: 'normal', marks: ['points', 'chest', 'socks'],
  },
  persian: { fur: '#fae8cc', light: '#fff8ec', iris: '#60a5fa', coat: 'long', ear: 'normal', marks: [], headRx: 54, flatFace: true },
  tortie: {
    fur: '#33241e', light: '#453129', muzzle: '#453129', iris: '#84cc16', whisker: '#ceb8a8', coat: 'short', ear: 'normal', marks: [], earColors: ['#33241e', '#e07b32'],
    patches: [
      { x: 68, y: 66, r: 17, c: '#e07b32', on: 'head' },
      { x: 126, y: 110, r: 13, c: '#f0af65', on: 'head' },
      { x: 114, y: 52, r: 9, c: '#f0af65', on: 'head' },
      { x: 72, y: 162, r: 15, c: '#e07b32', on: 'body' },
      { x: 130, y: 182, r: 17, c: '#f0af65', on: 'body' },
      { x: 118, y: 144, r: 9, c: '#e07b32', on: 'body' },
    ],
  },
  russian_blue: { fur: '#7d8c9e', light: '#9cb0c4', iris: '#34d399', nose: '#6b778a', coat: 'short', ear: 'normal', marks: [] },
  munchkin: { fur: '#f0d8b4', light: '#fff6e6', stripe: '#bf925b', iris: '#38bdf8', coat: 'short', ear: 'normal', marks: ['tabby'], shortLegs: true },
  british_shorthair: { fur: '#8592a3', light: '#a3b1c2', iris: '#fbbf24', nose: '#6e798a', coat: 'short', ear: 'normal', marks: [], headRx: 55 },
  snowshoe: {
    fur: '#f5ead8', light: '#ffffff', points: '#5e4334', iris: '#38bdf8', coat: 'short', ear: 'normal', marks: ['points', 'blaze', 'socks'],
  },
  bengal: { fur: '#e89d42', light: '#fbe5be', stripe: '#523216', iris: '#22c55e', coat: 'short', ear: 'normal', marks: ['rosettes', 'forehead'] },
  sphynx: {
    fur: '#f5cab8', light: '#fce2d7', iris: '#38bdf8', nose: '#e88798', earInner: '#eda0a6', whisker: '#dea896', coat: 'short', ear: 'big', marks: ['wrinkles'],
  },
  abyssinian: { fur: '#cc7636', light: '#f2cc9f', stripe: '#8f4e20', iris: '#4ade80', coat: 'short', ear: 'big', marks: ['forehead'] },
  maine_coon: { fur: '#9c6635', light: '#f0d5b2', stripe: '#543318', iris: '#facc15', coat: 'long', ear: 'tufted', marks: ['tabby', 'chest'] },
  norwegian_forest: { fur: '#aeb4bf', light: '#ffffff', stripe: '#5c6472', iris: '#34d399', coat: 'long', ear: 'tufted', marks: ['tabby', 'chest', 'socks'] },
  ginger_white: { fur: '#f5983d', light: '#ffffff', stripe: '#c96b1e', iris: '#facc15', coat: 'short', ear: 'normal', marks: ['tabby', 'blaze', 'chest', 'socks'] },
  gray_white: { fur: '#848d99', light: '#ffffff', iris: '#4ade80', nose: '#f29ea8', coat: 'short', ear: 'normal', marks: ['blaze', 'chest', 'socks'] },
  birman: {
    fur: '#f6ead5', light: '#fffcf5', points: '#63493a', muzzle: '#705342', iris: '#60a5fa', whisker: '#ede2d0', coat: 'long', ear: 'normal', marks: ['points', 'socks'],
  },
  himalayan: {
    fur: '#f8efe0', light: '#fffcf5', points: '#7d5e4a', muzzle: '#7d5e4a', iris: '#38bdf8', whisker: '#ede2d0', coat: 'long', ear: 'normal', marks: ['points'], headRx: 54, flatFace: true,
  },
  savannah: { fur: '#e6b462', light: '#faeed4', stripe: '#362312', iris: '#eab308', coat: 'short', ear: 'big', marks: ['rosettes', 'forehead'] },
  silver_tabby: { fur: '#cfd5dc', light: '#f8f9fa', stripe: '#373d47', iris: '#38bdf8', nose: '#de8895', coat: 'short', ear: 'normal', marks: ['tabby', 'forehead'] },
  burmese: { fur: '#61412b', light: '#7d5940', muzzle: '#4f3320', iris: '#a3e635', whisker: '#ccb6a6', coat: 'short', ear: 'normal', marks: [], headRx: 52 },
  turkish_angora: { fur: '#fcf6ea', light: '#ffffff', iris: '#38bdf8', coat: 'long', ear: 'tufted', marks: [] },
  egyptian_mau: { fur: '#c2c7cf', light: '#f0f2f5', stripe: '#323740', iris: '#22c55e', coat: 'short', ear: 'normal', marks: ['rosettes', 'forehead'] },
  devon_rex: { fur: '#dec4a4', light: '#f6ebd9', iris: '#34d399', nose: '#e69ca2', earInner: '#f2b4ae', coat: 'short', ear: 'big', marks: ['wrinkles'], headRx: 46 },
  chartreux: { fur: '#74869c', light: '#92a3b8', iris: '#fbbf24', nose: '#5e6f84', coat: 'short', ear: 'normal', marks: [], headRx: 56 },
  cream_tabby: { fur: '#f5dbb0', light: '#fff6e6', stripe: '#d4a360', iris: '#4ade80', coat: 'long', ear: 'normal', marks: ['tabby', 'chest'] },
  odd_eyed_white: { fur: '#ffffff', light: '#ffffff', iris: '#facc15', iris2: '#38bdf8', coat: 'short', ear: 'normal', marks: [] },
};

function scallopEllipse(cx, cy, rx, ry, bumps, depth) {
  const pt = (a, grow) => [cx + Math.cos(a) * (rx + grow), cy + Math.sin(a) * (ry + grow)].map((v) => v.toFixed(1));
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const [x, y] = pt((i / bumps) * Math.PI * 2, 0);
    if (i === 0) d += `M${x} ${y}`;
    else {
      const [qx, qy] = pt(((i - 0.5) / bumps) * Math.PI * 2, depth);
      d += ` Q${qx} ${qy} ${x} ${y}`;
    }
  }
  return d + 'Z';
}

const SHORT_BODY = 'M62 206 C54 172 64 130 100 126 C136 130 146 172 138 206Z';
const LONG_BODY = scallopEllipse(100, 168, 43, 40, 22, 5);
const LONG_RUFF = scallopEllipse(100, 130, 30, 14, 12, 5);
const TAIL = 'M128 198 C160 200 178 178 170 150 C164 130 170 116 182 110';
const outlined = { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: 'round'  };
/** Kitten proportions: the head is drawn this much bigger, scaled from the neck so hats and collars still line up. */
const HEAD_SCALE = 1.18;

function Ear({ look, side }) {
  const fill = _nullishCoalesce(_nullishCoalesce(_optionalChain([look, 'access', _ => _.earColors, 'optionalAccess', _2 => _2[side]]), () => ( look.points)), () => ( look.fur));
  const inner = _nullishCoalesce(look.earInner, () => ( '#f9b4c0'));
  switch (look.ear) {
    case 'fold':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M62 62 Q60 40 78 38 Q92 38 96 52Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M66 52 Q70 44 84 46"     , stroke: OUTLINE, strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
        )
      );
    case 'big':
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M52 78 L48 8 Q50 2 57 6 L100 46Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M60 66 L56 20 L90 49Z"     , fill: inner,} )
        )
      );
    default:
      return (
        __jsx_h('g', null
          , __jsx_h('path', { d: "M56 72 L58 20 Q60 14 66 17 L98 48Z"         , fill: fill, ...outlined,} )
          , __jsx_h('path', { d: "M64 62 L64 30 L88 50Z"     , fill: inner,} )
          , look.ear === 'tufted' && __jsx_h('path', { d: "M60 17 L54 0 M61 16 L62 -2 M62 17 L68 2"           , stroke: fill, strokeWidth: 3, strokeLinecap: "round",} )
        )
      );
  }
}

const TABBY_HEAD = ['M100 48 L100 62', 'M88 50 L90 62', 'M112 50 L110 62', 'M50 86 L64 88', 'M52 96 L64 96', 'M150 86 L136 88', 'M148 96 L136 96'];
const TABBY_BODY = ['M62 156 Q72 154 78 162', 'M60 172 Q70 170 76 178', 'M62 188 Q70 186 76 194', 'M138 156 Q128 154 122 162', 'M140 172 Q130 170 124 178', 'M138 188 Q130 186 124 194'];
const ROSETTES = [[70, 66, 4], [130, 66, 4], [60, 96, 3.5], [140, 96, 3.5], [70, 150, 5], [130, 150, 5], [66, 176, 5.5], [134, 178, 5.5], [76, 196, 4], [124, 198, 4]];









function CatAvatar({ breed, gear = [], mood = 'idle', size = 200, className }) {
  const look = _nullishCoalesce(LOOKS[breed], () => ( LOOKS.orange_tabby));
  const uid = useId().replace(/:/g, '');
  const has = (m) => look.marks.includes(m);
  const long = look.coat === 'long';
  const headRx = _nullishCoalesce(look.headRx, () => ( 50));
  const headPath = long ? scallopEllipse(100, 88, headRx, 42, 28, 4.5) : null;
  const wagFast = mood === 'happy' || mood === 'excited';
  const lineColor = _nullishCoalesce(look.whisker, () => ( OUTLINE));
  const tailColor = _nullishCoalesce(look.points, () => ( look.fur));
  const legColor = _nullishCoalesce(look.points, () => ( look.fur));
  const pawColor = has('socks') ? look.light : legColor;
  const closedEyes = mood === 'happy';
  // Big round pupils read as kittenish; they grow when excited.
  const pupilRx = mood === 'excited' ? 8 : mood === 'curious' ? 7 : 6;
  const legY = look.shortLegs ? 188 : 168;
  const headPatches = _nullishCoalesce(_optionalChain([look, 'access', _3 => _3.patches, 'optionalAccess', _4 => _4.filter, 'call', _5 => _5((p) => p.on === 'head')]), () => ( []));
  const bodyPatches = _nullishCoalesce(_optionalChain([look, 'access', _6 => _6.patches, 'optionalAccess', _7 => _7.filter, 'call', _8 => _8((p) => p.on === 'body')]), () => ( []));

  return (
    __jsx_h(motion.svg, {
      viewBox: "0 -20 200 240"   ,
      width: size,
      height: size * 1.2,
      className: className,
      animate: mood === 'excited' ? { y: [0, -14, 0] } : { y: 0 },
      transition: mood === 'excited' ? { duration: 0.45, repeat: Infinity, ease: 'easeOut' } : { duration: 0.2 },
      style: { overflow: 'visible' },}

      , __jsx_h('defs', null
        , __jsx_h('clipPath', { id: `head-${uid}`,}, headPath ? __jsx_h('path', { d: headPath,} ) : __jsx_h('ellipse', { cx: 100, cy: 88, rx: headRx, ry: 42,} ))
        , __jsx_h('clipPath', { id: `body-${uid}`,}
          , __jsx_h('path', { d: long ? LONG_BODY : SHORT_BODY,} )
        )
      )
      , __jsx_h('ellipse', { cx: 100, cy: 212, rx: 60, ry: 8, fill: "black", opacity: 0.12,} )

      , __jsx_h(BackGear, { gear: gear,} )

      /* tail: a slow swish, quicker when happy */
      , __jsx_h(motion.g, {
        style: { originX: 0.05, originY: 0.95 },
        animate: { rotate: wagFast ? [-10, 14, -10] : [-4, 6, -4] },
        transition: { duration: wagFast ? 0.6 : 2.2, repeat: Infinity, ease: 'easeInOut' },}

        , __jsx_h('g', { fill: "none", strokeLinecap: "round",}
          , __jsx_h('path', { d: TAIL, stroke: OUTLINE, strokeWidth: long ? 26 : 16,} )
          , __jsx_h('path', { d: TAIL, stroke: tailColor, strokeWidth: long ? 20 : 10,} )
          , look.stripe && has('tabby') && __jsx_h('path', { d: TAIL, stroke: look.stripe, strokeWidth: long ? 20 : 10, strokeDasharray: "5 11" ,} )
        )
      )

      /* body (breathing) */
      , __jsx_h(motion.g, {
        style: { originX: 0.5, originY: 1 },
        animate: { scaleY: [1, 1.03, 1] },
        transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },}

        , __jsx_h('path', { d: long ? LONG_BODY : SHORT_BODY, fill: look.fur, ...outlined,} )
        , __jsx_h('g', { clipPath: `url(#body-${uid})`,}
          , bodyPatches.map((p) => (
            __jsx_h('circle', { key: `${p.x}-${p.y}`, cx: p.x, cy: p.y, r: p.r, fill: p.c,} )
          ))
          , has('tabby') && look.stripe && (
            __jsx_h('g', { stroke: look.stripe, strokeWidth: 4, fill: "none", strokeLinecap: "round",}
              , TABBY_BODY.map((d) => (
                __jsx_h('path', { key: d, d: d,} )
              ))
            )
          )
          , has('rosettes') &&
            ROSETTES.filter(([, y]) => y > 130).map(([x, y, r]) => (
              __jsx_h('g', { key: `${x}-${y}`,}
                , __jsx_h('ellipse', { cx: x, cy: y, rx: r + 2, ry: r, fill: look.stripe,} )
                , __jsx_h('ellipse', { cx: x, cy: y, rx: r - 1, ry: r - 2.5, fill: "#c9802f",} )
              )
            ))
        )
        , __jsx_h('ellipse', { cx: 100, cy: 164, rx: has('chest') ? 24 : 20, ry: 30, fill: look.light,} )
        , long && __jsx_h('path', { d: LONG_RUFF, fill: has('chest') ? look.light : look.fur, ...outlined,} )
        /* front legs + paws */
        , [84, 116].map((x) => (
          __jsx_h('g', { key: x,}
            , __jsx_h('rect', { x: x - 9, y: legY, width: 18, height: 206 - legY, rx: 9, fill: legColor, stroke: OUTLINE, strokeWidth: 3,} )
            , __jsx_h('ellipse', { cx: x, cy: 205, rx: 12, ry: 7, fill: pawColor, stroke: OUTLINE, strokeWidth: 3,} )
            , __jsx_h('path', { d: `M${x - 3.5} 201 L${x - 3.5} 207 M${x + 3.5} 201 L${x + 3.5} 207`, stroke: OUTLINE, strokeWidth: 1.8,} )
          )
        ))
      )

      , __jsx_h(BodyGear, { gear: gear,} )
      , __jsx_h(NeckGear, { gear: gear,} )

      /* head */
      , __jsx_h(motion.g, {
        style: { originX: 0.5, originY: 0.95 },
        animate: { rotate: mood === 'curious' ? 12 : 0, y: mood === 'idle' ? [0, 1.5, 0] : 0 },
        transition: {
          rotate: { type: 'spring', stiffness: 200, damping: 12 },
          y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
        },}

        , __jsx_h('g', { transform: `translate(100 128) scale(${HEAD_SCALE}) translate(-100 -128)`,}
        , ([0, 1] ).map((side) => (
          __jsx_h('g', { key: side, transform: side === 1 ? 'translate(200 0) scale(-1 1)' : undefined,}
            , __jsx_h(motion.g, {
              style: { originX: 0.6, originY: 1 },
              animate: {
                rotate: mood === 'curious' && side === 1 ? -14 : mood === 'excited' ? [0, -8, 0] : [0, 0, -6, 0, 0, 0],
              },
              transition: 
                mood === 'curious'
                  ? { type: 'spring', stiffness: 200 }
                  : { duration: mood === 'excited' ? 0.45 : 4, repeat: Infinity, ease: 'easeInOut', delay: side ? 0.2 : 0 }
              ,}

              , __jsx_h(Ear, { look: look, side: side,} )
            )
          )
        ))

        , headPath ? __jsx_h('path', { d: headPath, fill: look.fur, ...outlined,} ) : __jsx_h('ellipse', { cx: 100, cy: 88, rx: headRx, ry: 42, fill: look.fur, stroke: OUTLINE, strokeWidth: 3,} )

        , __jsx_h('g', { clipPath: `url(#head-${uid})`,}
          , headPatches.map((p) => (
            __jsx_h('circle', { key: `${p.x}-${p.y}`, cx: p.x, cy: p.y, r: p.r, fill: p.c,} )
          ))
          , has('points') && (
            __jsx_h('g', { fill: look.points,}
              , __jsx_h('ellipse', { cx: 100, cy: 100, rx: 40, ry: 32, opacity: 0.35,} )
              , __jsx_h('ellipse', { cx: 100, cy: 100, rx: 30, ry: 25, opacity: 0.85,} )
            )
          )
          , has('blaze') && __jsx_h('path', { d: "M100 66 C92 78 84 90 78 102 C78 120 90 132 100 132 C110 132 122 120 122 102 C116 90 108 78 100 66Z"                         , fill: look.light,} )
          , (has('tabby') || has('forehead')) && look.stripe && (
            __jsx_h('g', { stroke: look.stripe, strokeWidth: 4, fill: "none", strokeLinecap: "round",}
              , TABBY_HEAD.slice(0, has('tabby') ? undefined : 3).map((d) => (
                __jsx_h('path', { key: d, d: d,} )
              ))
            )
          )
          , has('rosettes') &&
            ROSETTES.filter(([, y]) => y < 130).map(([x, y, r]) => __jsx_h('ellipse', { key: `${x}-${y}`, cx: x, cy: y, rx: r + 1.5, ry: r, fill: look.stripe,} ))
          , has('wrinkles') && (
            __jsx_h('g', { stroke: "#d9a592", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",}
              , __jsx_h('path', { d: "M86 56 Q100 50 114 56"     ,} )
              , __jsx_h('path', { d: "M90 63 Q100 59 110 63"     ,} )
            )
          )
        )

        /* muzzle puffs */
        , __jsx_h('g', { fill: _nullishCoalesce(look.muzzle, () => ( look.light)),}
          , __jsx_h('ellipse', { cx: 92, cy: 107, rx: 10, ry: 8,} )
          , __jsx_h('ellipse', { cx: 108, cy: 107, rx: 10, ry: 8,} )
        )

        /* eyes */
        , closedEyes ? (
          __jsx_h('g', { stroke: _nullishCoalesce(look.whisker, () => ( OUTLINE)), strokeWidth: 4, fill: "none", strokeLinecap: "round",}
            , __jsx_h('path', { d: "M70 89 Q80 79 90 89"     ,} )
            , __jsx_h('path', { d: "M110 89 Q120 79 130 89"     ,} )
          )
        ) : (
          __jsx_h('g', null
            , [80, 120].map((x, i) => (
              __jsx_h('g', { key: x,}
                , __jsx_h('ellipse', { cx: x, cy: 86, rx: 13.5, ry: 14.5, fill: i === 1 && look.iris2 ? look.iris2 : look.iris, stroke: OUTLINE, strokeWidth: 2,} )
                , __jsx_h('ellipse', { cx: x, cy: 86.5, rx: pupilRx + 1.5, ry: 10.8, fill: "#111827",} )
                /* a glossy glow in the lower iris, and big sparkly highlights */
                , __jsx_h('ellipse', { cx: x, cy: 95, rx: 8.2, ry: 3.4, fill: "white", opacity: 0.25,} )
                , __jsx_h('circle', { cx: x + 4.3, cy: 80.5, r: 5.2, fill: "white",} )
                , __jsx_h('circle', { cx: x - 4.5, cy: 91.5, r: 2.4, fill: "white", opacity: 0.95,} )
                , __jsx_h('circle', { cx: x + 6.5, cy: 89, r: 1.1, fill: "white", opacity: 0.9,} )
              )
            ))
          )
        )

        /* rosy cheeks, rosier when happy */
        , __jsx_h('g', { fill: "#f472b6", opacity: mood === 'happy' || mood === 'excited' ? 0.55 : 0.4,}
          , __jsx_h('ellipse', { cx: 65, cy: 103, rx: 8.5, ry: 5.2,} )
          , __jsx_h('ellipse', { cx: 135, cy: 103, rx: 8.5, ry: 5.2,} )
        )

        /* nose + mouth */
        , __jsx_h('path', {
          d: look.flatFace ? 'M95 99 Q100 97 105 99 L100 104Z' : 'M93 99 Q100 96 107 99 L100 106Z',
          fill: _nullishCoalesce(look.nose, () => ( '#f9a8b8')),
          stroke: OUTLINE,
          strokeWidth: 1.6,
          strokeLinejoin: "round",}
        )
        , mood === 'excited' ? (
          __jsx_h('path', { d: "M92 109 Q100 122 108 109 Z"      , fill: "#7f1d1d", stroke: OUTLINE, strokeWidth: 2.2, strokeLinejoin: "round",} )
        ) : (
          __jsx_h(__jsx_Fragment, null
            , mood === 'happy' && __jsx_h('path', { d: "M97 110 Q97 117 100 117 Q103 117 103 110Z"         , fill: "#fb7185", stroke: OUTLINE, strokeWidth: 1.5,} )
            , __jsx_h('path', { d: "M100 106 L100 109 M91 108 Q95.5 114 100 109 Q104.5 114 109 108"             , stroke: lineColor, strokeWidth: 2.2, fill: "none", strokeLinecap: "round",} )
          )
        )

        /* whiskers */
        , __jsx_h('g', { stroke: lineColor, strokeWidth: 1.8, strokeLinecap: "round", opacity: 0.6,}
          , __jsx_h('path', { d: "M82 104 L48 96 M82 108 L46 110 M83 112 L52 122"           ,} )
          , __jsx_h('path', { d: "M118 104 L152 96 M118 108 L154 110 M117 112 L148 122"           ,} )
        )

        , __jsx_h(HeadGear, { gear: gear, mood: mood,} )
        )
      )
    )
  );
}

const isCatBreed = (id) => id in LOOKS;

/** A cat's colours and markings, e.g. for the owner's matching cat costume. */
const catLook = (id) => LOOKS[id];

return { CatAvatar };
})();

const { BoneBiscuit, TreatIcon } = (() => {
// Small inline-SVG game pieces shared by subgames.

function BoneShape({ fill, stroke }) {
  const knobs = [
    [10, 9],
    [10, 21],
    [50, 9],
    [50, 21],
  ];
  const shapes = (extra) => (
    __jsx_h(__jsx_Fragment, null
      , knobs.map(([cx, cy]) => (
        __jsx_h('circle', { key: `${cx}-${cy}`, cx: cx, cy: cy, r: 7.5, ...extra,} )
      ))
      , __jsx_h('rect', { x: 10, y: 8, width: 40, height: 14, rx: 3, ...extra,} )
    )
  );
  return (
    __jsx_h(__jsx_Fragment, null
      /* stroked layer, then a fill-only layer on top hides the inner seams */
      , shapes({ fill: stroke, stroke, strokeWidth: 5 })
      , shapes({ fill })
    )
  );
}

function BoneBiscuit({ size = 40, tone = 'baked' }) {
  const fill = tone === 'baked' ? '#d4a056' : tone === 'fresh' ? '#f4c27a' : '#facc15';
  const stroke = tone === 'gold' ? '#a16207' : '#8a5a22';
  return (
    __jsx_h('svg', {
      viewBox: "-2 -2 64 34"   ,
      width: size,
      height: typeof size === 'number' ? size * 0.53 : undefined,
      style: { overflow: 'visible', display: 'block' },}

      , __jsx_h(BoneShape, { fill: fill, stroke: stroke,} )
      , tone !== 'gold' ? (
        __jsx_h('g', { fill: stroke, opacity: 0.5,}
          , __jsx_h('circle', { cx: 24, cy: 13, r: 1.6,} )
          , __jsx_h('circle', { cx: 32, cy: 17, r: 1.6,} )
          , __jsx_h('circle', { cx: 39, cy: 12, r: 1.6,} )
        )
      ) : (
        __jsx_h('path', { d: "M16 12 L40 12"   , stroke: "#fef9c3", strokeWidth: 2.5, strokeLinecap: "round",} )
      )
    )
  );
}

function TreatIcon({ size = 28 }) {
  return __jsx_h(BoneBiscuit, { size: size, tone: "gold",} );
}

/** A gold crate holding ten little bones in a 2x5 layout (like a ten-frame). */
function TenCrate({ size = 90 }) {
  return (
    __jsx_h('svg', { viewBox: "0 0 100 56"   , width: size, height: size * 0.56, style: { display: 'block' },}
      , __jsx_h('rect', { x: 2, y: 2, width: 96, height: 52, rx: 8, fill: "#f59e0b", stroke: "#78350f", strokeWidth: 3,} )
      , __jsx_h('rect', { x: 7, y: 7, width: 86, height: 42, rx: 5, fill: "#92400e",} )
      , Array.from({ length: 10 }, (_, i) => {
        const x = 11 + (i % 5) * 16.4;
        const y = Math.floor(i / 5) === 0 ? 17 : 36;
        return (
          __jsx_h('g', { key: i, fill: "#fff7ed",}
            , __jsx_h('rect', { x: x + 1.5, y: y - 2, width: 9, height: 4, rx: 1,} )
            , __jsx_h('circle', { cx: x + 1.5, cy: y - 2.2, r: 2.3,} )
            , __jsx_h('circle', { cx: x + 1.5, cy: y + 2.2, r: 2.3,} )
            , __jsx_h('circle', { cx: x + 10.5, cy: y - 2.2, r: 2.3,} )
            , __jsx_h('circle', { cx: x + 10.5, cy: y + 2.2, r: 2.3,} )
          )
        );
      })
    )
  );
}

function SingleBone({ size = 44 }) {
  return (
    __jsx_h('svg', { viewBox: "-2 -2 64 34"   , width: size, height: size * 0.53, style: { overflow: 'visible' },}
      , __jsx_h(BoneShape, { fill: "#fff7ed", stroke: "#92400e",} )
    )
  );
}

function TreasureChest({ open, size = 200 }) {
  return (
    __jsx_h('svg', { viewBox: "0 0 120 100"   , width: size, height: size * 0.83, style: { overflow: 'visible' },}
      , open && (
        __jsx_h('g', null
          , __jsx_h('circle', { cx: 60, cy: 44, r: 30, fill: "#fde047", opacity: 0.5,} )
          , __jsx_h('circle', { cx: 60, cy: 44, r: 18, fill: "#fef08a", opacity: 0.8,} )
        )
      )
      , __jsx_h('rect', { x: 14, y: 48, width: 92, height: 46, rx: 6, fill: "#b45309", stroke: "#451a03", strokeWidth: 3,} )
      , __jsx_h('rect', { x: 14, y: 60, width: 92, height: 8, fill: "#facc15", stroke: "#451a03", strokeWidth: 2,} )
      , __jsx_h('rect', { x: 52, y: 56, width: 16, height: 18, rx: 3, fill: "#facc15", stroke: "#451a03", strokeWidth: 2,} )
      , __jsx_h('circle', { cx: 60, cy: 65, r: 2.5, fill: "#451a03",} )
      , open ? (
        __jsx_h('path', { d: "M14 48 L24 14 L96 14 L106 48Z"       , fill: "#92400e", stroke: "#451a03", strokeWidth: 3, strokeLinejoin: "round", transform: "translate(0 -18) skewX(-4)"  ,} )
      ) : (
        __jsx_h('path', { d: "M14 48 Q14 22 60 22 Q106 22 106 48Z"         , fill: "#d97706", stroke: "#451a03", strokeWidth: 3,} )
      )
    )
  );
}

/** Sunny dog park with a kennel. */
function ParkBackdrop() {
  return (
    __jsx_h('svg', { className: "absolute inset-0 h-full w-full"   , viewBox: "0 0 1000 700"   , preserveAspectRatio: "xMidYMax slice" , 'aria-hidden': true,}
      , __jsx_h('defs', null
        , __jsx_h('linearGradient', { id: "sky", x1: "0", y1: "0", x2: "0", y2: "1",}
          , __jsx_h('stop', { offset: "0", stopColor: "#bae6fd",} )
          , __jsx_h('stop', { offset: "1", stopColor: "#fef3c7",} )
        )
      )
      , __jsx_h('rect', { width: "1000", height: "700", fill: "url(#sky)",} )
      , __jsx_h('circle', { cx: "860", cy: "110", r: "60", fill: "#fde047",} )
      , __jsx_h('circle', { cx: "860", cy: "110", r: "80", fill: "#fde047", opacity: "0.25",} )
      , __jsx_h('g', { fill: "white", opacity: "0.9",}
        , __jsx_h('ellipse', { cx: "200", cy: "110", rx: "70", ry: "26",} )
        , __jsx_h('ellipse', { cx: "250", cy: "95", rx: "50", ry: "28",} )
        , __jsx_h('ellipse', { cx: "560", cy: "160", rx: "60", ry: "20",} )
        , __jsx_h('ellipse', { cx: "600", cy: "148", rx: "40", ry: "22",} )
      )
      , __jsx_h('path', { d: "M0 430 Q250 360 500 420 T1000 400 L1000 700 L0 700Z"           , fill: "#86efac",} )
      , __jsx_h('path', { d: "M0 500 Q300 440 600 500 T1000 480 L1000 700 L0 700Z"           , fill: "#4ade80",} )
      /* fence */
      , __jsx_h('g', { fill: "#fef3c7", stroke: "#b45309", strokeWidth: "3",}
        , __jsx_h('rect', { x: "0", y: "440", width: "1000", height: "12",} )
        , __jsx_h('rect', { x: "0", y: "470", width: "1000", height: "12",} )
        , Array.from({ length: 21 }, (_, i) => (
          __jsx_h('path', { key: i, d: `M${i * 50 + 10} 500 L${i * 50 + 10} 425 L${i * 50 + 20} 412 L${i * 50 + 30} 425 L${i * 50 + 30} 500Z`,} )
        ))
      )
      , __jsx_h('path', { d: "M0 520 Q300 480 600 520 T1000 505 L1000 700 L0 700Z"           , fill: "#22c55e",} )
      /* kennel */
      , __jsx_h('g', { transform: "translate(60 330)" ,}
        , __jsx_h('path', { d: "M0 110 L100 20 L200 110Z"     , fill: "#dc2626", stroke: "#7f1d1d", strokeWidth: "5", strokeLinejoin: "round",} )
        , __jsx_h('rect', { x: "20", y: "105", width: "160", height: "130", fill: "#f59e0b", stroke: "#78350f", strokeWidth: "5",} )
        , __jsx_h('path', { d: "M65 235 L65 170 Q100 130 135 170 L135 235Z"         , fill: "#451a03",} )
        , __jsx_h('rect', { x: "70", y: "75", width: "60", height: "22", rx: "6", fill: "#fff7ed", stroke: "#78350f", strokeWidth: "3",} )
      )
      /* flowers */
      , __jsx_h('g', null
        , [
          [320, 600],
          [420, 640],
          [700, 610],
          [880, 650],
          [180, 660],
        ].map(([x, y], i) => (
          __jsx_h('g', { key: i, transform: `translate(${x} ${y})`,}
            , [0, 72, 144, 216, 288].map((a) => (
              __jsx_h('circle', { key: a, cx: Math.cos((a * Math.PI) / 180) * 8, cy: Math.sin((a * Math.PI) / 180) * 8, r: "7", fill: ['#f472b6', '#fde047', '#a78bfa'][i % 3],} )
            ))
            , __jsx_h('circle', { r: "5", fill: "#fbbf24",} )
          )
        ))
      )
    )
  );
}

return { BoneBiscuit, TreatIcon };
})();

const { FishTreat } = (() => {
// Kitty versions of the shared game pieces: fish cookies, fish treats, sardines, tins of ten and a toy mouse.

const FISH = 'M4 17 C4 6 18 3 28 4 C36 5 42 10 46 15 L59 4 Q62 2 62 6 L58 17 L62 28 Q62 32 59 30 L46 19 C42 24 36 29 28 30 C18 31 4 28 4 17Z';

function Fish({ fill, stroke, eye = true }) {
  return (
    __jsx_h(__jsx_Fragment, null
      , __jsx_h('path', { d: FISH, fill: fill, stroke: stroke, strokeWidth: 3.5, strokeLinejoin: "round",} )
      , __jsx_h('path', { d: "M36 9 Q31 17 36 25"     , stroke: stroke, strokeWidth: 2.2, fill: "none", strokeLinecap: "round", opacity: 0.6,} )
      , eye && __jsx_h('circle', { cx: 14, cy: 14, r: 2.6, fill: stroke,} )
    )
  );
}

/** Bakery cookie. 'baked' ones were already on the tray; 'fresh' ones have pink icing. */
function FishCookie({ size = 40, tone = 'baked' }) {
  return (
    __jsx_h('svg', { viewBox: "-2 -2 66 36"   , width: size, height: typeof size === 'number' ? size * 0.55 : undefined, style: { overflow: 'visible', display: 'block' },}
      , __jsx_h(Fish, { fill: tone === 'baked' ? '#d9a05b' : '#f4c27a', stroke: "#8a5a22",} )
      , tone === 'fresh' ? (
        __jsx_h('path', { d: "M10 22 Q20 26 30 22 Q38 20 44 18"         , stroke: "#f472b6", strokeWidth: 4, fill: "none", strokeLinecap: "round",} )
      ) : (
        __jsx_h('g', { fill: "#8a5a22", opacity: 0.45,}
          , __jsx_h('circle', { cx: 24, cy: 12, r: 1.6,} )
          , __jsx_h('circle', { cx: 28, cy: 21, r: 1.6,} )
          , __jsx_h('circle', { cx: 20, cy: 22, r: 1.6,} )
        )
      )
    )
  );
}

function FishTreat({ size = 28 }) {
  return (
    __jsx_h('svg', { viewBox: "-2 -2 66 36"   , width: size, height: size * 0.55, style: { overflow: 'visible', display: 'block' },}
      , __jsx_h(Fish, { fill: "#facc15", stroke: "#a16207",} )
      , __jsx_h('path', { d: "M18 10 Q24 8 30 10"     , stroke: "#fef9c3", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
    )
  );
}

function Sardine({ size = 44 }) {
  return (
    __jsx_h('svg', { viewBox: "-2 -2 66 36"   , width: size, height: size * 0.55, style: { overflow: 'visible' },}
      , __jsx_h(Fish, { fill: "#dbe4ee", stroke: "#475569",} )
      , __jsx_h('path', { d: "M8 19 Q24 24 42 18"     , stroke: "#93a4bb", strokeWidth: 2.5, fill: "none", strokeLinecap: "round",} )
    )
  );
}

/** A tin holding ten sardines in a 2x5 layout (like a ten-frame). */
function FishTin({ size = 90 }) {
  return (
    __jsx_h('svg', { viewBox: "0 0 100 56"   , width: size, height: size * 0.56, style: { display: 'block' },}
      , __jsx_h('rect', { x: 2, y: 2, width: 96, height: 52, rx: 10, fill: "#5eb8c9", stroke: "#164e63", strokeWidth: 3,} )
      , __jsx_h('rect', { x: 7, y: 7, width: 86, height: 42, rx: 7, fill: "#1e3a5f",} )
      , Array.from({ length: 10 }, (_, i) => {
        const x = 10 + (i % 5) * 16.4;
        const y = Math.floor(i / 5) === 0 ? 11 : 30;
        return (
          __jsx_h('g', { key: i, transform: `translate(${x} ${y}) scale(0.22)`,}
            , __jsx_h('path', { d: FISH, fill: "#e2e8f0",} )
          )
        );
      })
      , __jsx_h('circle', { cx: 92, cy: 8, r: 4, fill: "#a5f3fc", stroke: "#164e63", strokeWidth: 2,} )
    )
  );
}

/** Wind-up toy mouse, waiting at the end of a Mouse Chase hop. */
function ToyMouse({ size = 44 }) {
  return (
    __jsx_h('svg', { viewBox: "0 0 64 36"   , width: size, height: size * 0.56, style: { overflow: 'visible', display: 'block' },}
      , __jsx_h('path', { d: "M50 28 Q62 30 62 20 Q62 12 55 11"         , stroke: "#f472b6", strokeWidth: 3, fill: "none", strokeLinecap: "round",} )
      , __jsx_h('circle', { cx: 22, cy: 11, r: 7, fill: "#f9a8d4", stroke: "#475569", strokeWidth: 3,} )
      , __jsx_h('path', { d: "M4 29 C6 15 22 7 36 10 C46 13 52 20 52 29 Z"              , fill: "#cbd5e1", stroke: "#475569", strokeWidth: 3.5, strokeLinejoin: "round",} )
      , __jsx_h('circle', { cx: 15, cy: 20, r: 2.4, fill: "#334155",} )
      , __jsx_h('circle', { cx: 5, cy: 28, r: 3, fill: "#f472b6",} )
      , __jsx_h('path', { d: "M30 13 Q32 6 37 4"     , stroke: "#facc15", strokeWidth: 3, fill: "none", strokeLinecap: "round",} )
    )
  );
}

function TreatBowl({ open, size = 200 }) {
  return (
    __jsx_h('svg', { viewBox: "0 0 120 100"   , width: size, height: size * 0.83, style: { overflow: 'visible' },}
      , open && (
        __jsx_h('g', null
          , __jsx_h('circle', { cx: 60, cy: 44, r: 32, fill: "#fde047", opacity: 0.5,} )
          , [
            [40, 46, -20],
            [62, 36, 10],
            [80, 48, 30],
          ].map(([x, y, r]) => (
            __jsx_h('g', { key: x, transform: `translate(${x - 14} ${y - 8}) rotate(${r} 14 8) scale(0.45)`,}
              , __jsx_h(Fish, { fill: "#facc15", stroke: "#a16207",} )
            )
          ))
        )
      )
      /* gift box with a bow */
      , __jsx_h('rect', { x: 18, y: 50, width: 84, height: 44, rx: 6, fill: "#c084fc", stroke: "#581c87", strokeWidth: 3,} )
      , __jsx_h('rect', { x: 54, y: 50, width: 12, height: 44, fill: "#f9a8d4", stroke: "#581c87", strokeWidth: 2,} )
      , open ? (
        __jsx_h('path', { d: "M14 50 L22 18 L98 18 L106 50Z"       , fill: "#a855f7", stroke: "#581c87", strokeWidth: 3, strokeLinejoin: "round", transform: "translate(0 -22) skewX(-4)"  ,} )
      ) : (
        __jsx_h('g', null
          , __jsx_h('rect', { x: 12, y: 36, width: 96, height: 16, rx: 4, fill: "#a855f7", stroke: "#581c87", strokeWidth: 3,} )
          , __jsx_h('rect', { x: 54, y: 36, width: 12, height: 16, fill: "#f9a8d4", stroke: "#581c87", strokeWidth: 2,} )
          , __jsx_h('path', { d: "M60 36 Q40 14 44 32 Z M60 36 Q80 14 76 32 Z"             , fill: "#f472b6", stroke: "#581c87", strokeWidth: 2.5, strokeLinejoin: "round",} )
        )
      )
    )
  );
}

/** Cozy living room with a cat tree, a sunny window and a yarn basket. */
function CozyBackdrop() {
  return (
    __jsx_h('svg', { className: "absolute inset-0 h-full w-full"   , viewBox: "0 0 1000 700"   , preserveAspectRatio: "xMidYMax slice" , 'aria-hidden': true,}
      , __jsx_h('defs', null
        , __jsx_h('linearGradient', { id: "win-sky", x1: "0", y1: "0", x2: "0", y2: "1",}
          , __jsx_h('stop', { offset: "0", stopColor: "#7dd3fc",} )
          , __jsx_h('stop', { offset: "1", stopColor: "#e0f2fe",} )
        )
        , __jsx_h('pattern', { id: "wallpaper", width: "60", height: "60", patternUnits: "userSpaceOnUse",}
          , __jsx_h('rect', { width: "60", height: "60", fill: "#fce7f3",} )
          , __jsx_h('circle', { cx: "15", cy: "15", r: "4", fill: "#fbcfe8",} )
          , __jsx_h('circle', { cx: "45", cy: "45", r: "4", fill: "#e9d5ff",} )
        )
      )
      , __jsx_h('rect', { width: "1000", height: "700", fill: "url(#wallpaper)",} )
      /* window */
      , __jsx_h('g', { transform: "translate(560 70)" ,}
        , __jsx_h('rect', { x: "0", y: "0", width: "300", height: "250", rx: "12", fill: "url(#win-sky)", stroke: "#f5f5f4", strokeWidth: "16",} )
        , __jsx_h('circle', { cx: "230", cy: "70", r: "34", fill: "#fde047",} )
        , __jsx_h('g', { fill: "white", opacity: "0.95",}
          , __jsx_h('ellipse', { cx: "90", cy: "80", rx: "46", ry: "18",} )
          , __jsx_h('ellipse', { cx: "120", cy: "68", rx: "32", ry: "20",} )
        )
        , __jsx_h('path', { d: "M0 200 Q80 170 150 196 T300 186 L300 250 L0 250Z"           , fill: "#86efac",} )
        , __jsx_h('path', { d: "M150 0 L150 250 M0 125 L300 125"       , stroke: "#f5f5f4", strokeWidth: "10",} )
        , __jsx_h('path', { d: "M-24 -10 Q20 120 -16 262 L-36 262 L-36 -10Z"         , fill: "#f9a8d4",} )
        , __jsx_h('path', { d: "M324 -10 Q280 120 316 262 L336 262 L336 -10Z"         , fill: "#f9a8d4",} )
        , __jsx_h('rect', { x: "-44", y: "-22", width: "388", height: "14", rx: "7", fill: "#a16207",} )
        , __jsx_h('rect', { x: "-10", y: "250", width: "320", height: "18", rx: "6", fill: "#f5f5f4",} )
      )
      /* fish picture */
      , __jsx_h('g', { transform: "translate(400 120)" ,}
        , __jsx_h('rect', { width: "110", height: "84", rx: "6", fill: "#fef3c7", stroke: "#b45309", strokeWidth: "8",} )
        , __jsx_h('g', { transform: "translate(22 26) scale(1.05)"  ,}
          , __jsx_h('path', { d: FISH, fill: "#fb923c", stroke: "#9a3412", strokeWidth: "3",} )
          , __jsx_h('circle', { cx: "14", cy: "14", r: "2.6", fill: "#9a3412",} )
        )
      )
      /* floor + rug */
      , __jsx_h('rect', { y: "470", width: "1000", height: "230", fill: "#e8c39e",} )
      , __jsx_h('g', { stroke: "#d4a373", strokeWidth: "3",}
        , [520, 580, 650].map((y) => (
          __jsx_h('path', { key: y, d: `M0 ${y} L1000 ${y}`,} )
        ))
      )
      , __jsx_h('rect', { y: "462", width: "1000", height: "14", fill: "#fbcfe8",} )
      , __jsx_h('ellipse', { cx: "520", cy: "615", rx: "360", ry: "70", fill: "#c4b5fd",} )
      , __jsx_h('ellipse', { cx: "520", cy: "615", rx: "290", ry: "50", fill: "none", stroke: "#ddd6fe", strokeWidth: "10",} )
      /* cat tree */
      , __jsx_h('g', { transform: "translate(70 170)" ,}
        , __jsx_h('rect', { x: "70", y: "60", width: "28", height: "420", fill: "#d6b98c", stroke: "#8a6a3b", strokeWidth: "4",} )
        , __jsx_h('g', { stroke: "#b8945e", strokeWidth: "3",}
          , Array.from({ length: 14 }, (_, i) => (
            __jsx_h('path', { key: i, d: `M72 ${120 + i * 24} L96 ${128 + i * 24}`,} )
          ))
        )
        , __jsx_h('rect', { x: "0", y: "40", width: "170", height: "26", rx: "13", fill: "#a78bfa", stroke: "#5b21b6", strokeWidth: "4",} )
        , __jsx_h('rect', { x: "10", y: "200", width: "150", height: "110", rx: "20", fill: "#a78bfa", stroke: "#5b21b6", strokeWidth: "4",} )
        , __jsx_h('ellipse', { cx: "85", cy: "262", rx: "36", ry: "32", fill: "#4c1d95",} )
        , __jsx_h('rect', { x: "-10", y: "470", width: "190", height: "26", rx: "13", fill: "#a78bfa", stroke: "#5b21b6", strokeWidth: "4",} )
        , __jsx_h('path', { d: "M150 66 L150 130"   , stroke: "#f472b6", strokeWidth: "3",} )
        , __jsx_h('circle', { cx: "150", cy: "140", r: "12", fill: "#f472b6", stroke: "#be185d", strokeWidth: "3",} )
      )
      /* yarn basket */
      , __jsx_h('g', { transform: "translate(860 560)" ,}
        , __jsx_h('circle', { cx: "-30", cy: "-8", r: "28", fill: "#f472b6", stroke: "#be185d", strokeWidth: "4",} )
        , __jsx_h('circle', { cx: "22", cy: "-14", r: "26", fill: "#60a5fa", stroke: "#1d4ed8", strokeWidth: "4",} )
        , __jsx_h('path', { d: "M-50 -14 Q-30 -30 -10 -10 M10 -24 Q24 -36 40 -14"           , stroke: "white", strokeWidth: "3", fill: "none", opacity: "0.6",} )
        , __jsx_h('path', { d: "M-70 0 L70 0 L56 70 L-56 70Z"       , fill: "#d97706", stroke: "#78350f", strokeWidth: "5", strokeLinejoin: "round",} )
        , __jsx_h('path', { d: "M-64 24 L64 24 M-60 46 L60 46"       , stroke: "#92400e", strokeWidth: "4",} )
      )
      , __jsx_h('path', { d: "M800 576 Q740 640 660 620"     , stroke: "#f472b6", strokeWidth: "4", fill: "none",} )
    )
  );
}

return { FishTreat };
})();

const { dogTheme } = (() => {





const dogTheme = {
  id: 'dog',
  appName: 'Pup School',
  saveKey: 'pup-math-save-v1',
  starterPet: 'cavapoo',
  other: { name: 'Kitty Home', href: './cats.html', pet: 'orange_tabby' },
  // Shown in the shop cheapest first.
  pets: (
    [
      { id: 'cavapoo', name: 'Peanut', breed: 'Cavapoo', cost: 0 },
      { id: 'pug', name: 'Pudge', breed: 'Pug', cost: 25 },
      { id: 'beagle', name: 'Bagel', breed: 'Beagle', cost: 25 },
      { id: 'lab', name: 'Fudge', breed: 'Chocolate Lab', cost: 30 },
      { id: 'chihuahua', name: 'Cheewee', breed: 'Chihuahua', cost: 35 },
      { id: 'dalmatian', name: 'Pongo', breed: 'Dalmatian', cost: 40 },
      { id: 'jack_russell', name: 'Skipper', breed: 'Jack Russell Terrier', cost: 40 },
      { id: 'german_shepherd', name: 'Bandit', breed: 'German Shepherd', cost: 45 },
      { id: 'boxer', name: 'Buster', breed: 'Boxer', cost: 45 },
      { id: 'dachshund', name: 'Pretzel', breed: 'Dachshund', cost: 50 },
      { id: 'basset_hound', name: 'Barnaby', breed: 'Basset Hound', cost: 50 },
      { id: 'boston_terrier', name: 'Pebbles', breed: 'Boston Terrier', cost: 55 },
      { id: 'husky', name: 'Koda', breed: 'Husky', cost: 60 },
      { id: 'collie', name: 'Dash', breed: 'Border Collie', cost: 60 },
      { id: 'schnauzer', name: 'Fritz', breed: 'Schnauzer', cost: 65 },
      { id: 'cocker_spaniel', name: 'Hazel', breed: 'Cocker Spaniel', cost: 65 },
      { id: 'frenchie', name: 'Louie', breed: 'French Bulldog', cost: 75 },
      { id: 'shiba', name: 'Yuzu', breed: 'Shiba Inu', cost: 75 },
      { id: 'bulldog', name: 'Churro', breed: 'English Bulldog', cost: 80 },
      { id: 'golden_retriever', name: 'Biscuit', breed: 'Golden Retriever', cost: 85 },
      { id: 'shih_tzu', name: 'Mimi', breed: 'Shih Tzu', cost: 90 },
      { id: 'weimaraner', name: 'Sterling', breed: 'Weimaraner', cost: 90 },
      { id: 'saint_bernard', name: 'Yeti', breed: 'Saint Bernard', cost: 100 },
      { id: 'rottweiler', name: 'Diesel', breed: 'Rottweiler', cost: 110 },
      { id: 'westie', name: 'Pippin', breed: 'Westie', cost: 120 },
      { id: 'doberman', name: 'Onyx', breed: 'Doberman', cost: 120 },
      { id: 'affenpinscher', name: 'Sprocket', breed: 'Affenpinscher', cost: 130 },
      { id: 'bloodhound', name: 'Watson', breed: 'Bloodhound', cost: 135 },
      { id: 'pomeranian', name: 'Puff', breed: 'Pomeranian', cost: 140 },
      { id: 'cavalier', name: 'Poppy', breed: 'Cavalier King Charles', cost: 150 },
      { id: 'yorkiepoo', name: 'Cricket', breed: 'Yorkiepoo', cost: 160 },
      { id: 'bichon', name: 'Nimbus', breed: 'Bichon Frise', cost: 170 },
      { id: 'bernedoodle', name: 'Panda', breed: 'Bernedoodle', cost: 180 },
      { id: 'chow_chow', name: 'Bao', breed: 'Chow Chow', cost: 190 },
      { id: 'goldendoodle', name: 'Waffle', breed: 'Goldendoodle', cost: 200 },
      { id: 'australian_shepherd', name: 'Sierra', breed: 'Australian Shepherd', cost: 220 },
      { id: 'akita', name: 'Kenji', breed: 'Akita', cost: 230 },
      { id: 'maltipoo', name: 'Vanilla', breed: 'Maltipoo', cost: 250 },
      { id: 'bernese', name: 'Summit', breed: 'Bernese Mountain Dog', cost: 260 },
      { id: 'corgi', name: 'Cheddar', breed: 'Corgi', cost: 280 },
      { id: 'papillon', name: 'Bijou', breed: 'Papillon', cost: 300 },
      { id: 'great_dane', name: 'Atlas', breed: 'Great Dane', cost: 320 },
      { id: 'pomsky', name: 'Nova', breed: 'Pomsky', cost: 340 },
      { id: 'newfoundland', name: 'Grizzly', breed: 'Newfoundland', cost: 360 },
      { id: 'samoyed', name: 'Flurry', breed: 'Samoyed', cost: 400 },
      { id: 'poodle', name: 'Gigi', breed: 'Poodle', cost: 95 },
      { id: 'yellow_lab', name: 'Goldie', breed: 'Yellow Lab', cost: 35 },
      { id: 'black_lab', name: 'Jet', breed: 'Black Lab', cost: 35 },
      { id: 'sheltie', name: 'Clover', breed: 'Shetland Sheepdog', cost: 125 },
      { id: 'greyhound', name: 'Flash', breed: 'Greyhound', cost: 105 },
      { id: 'pitbull', name: 'Meatball', breed: 'Pit Bull', cost: 70 },
      { id: 'maltese', name: 'Pearl', breed: 'Maltese', cost: 145 },
      { id: 'vizsla', name: 'Copper', breed: 'Vizsla', cost: 100 },
      { id: 'springer', name: 'Badger', breed: 'Springer Spaniel', cost: 115 },
      { id: 'old_english', name: 'Moppet', breed: 'Old English Sheepdog', cost: 240 },
      { id: 'blue_heeler', name: 'Indigo', breed: 'Blue Heeler', cost: 210 },
      { id: 'red_heeler', name: 'Chili', breed: 'Red Heeler', cost: 210 },
      { id: 'labradoodle', name: 'Snickerdoodle', breed: 'Labradoodle', cost: 150 },
      { id: 'cockapoo', name: 'Truffle', breed: 'Cockapoo', cost: 110 },
      { id: 'havanese', name: 'Chico', breed: 'Havanese', cost: 130 },
      { id: 'scottie', name: 'Angus', breed: 'Scottish Terrier', cost: 95 },
      { id: 'irish_setter', name: 'Scarlet', breed: 'Irish Setter', cost: 175 },
      { id: 'malamute', name: 'Denali', breed: 'Alaskan Malamute', cost: 270 },
      { id: 'great_pyrenees', name: 'Avalanche', breed: 'Great Pyrenees', cost: 380 },
      { id: 'pekingese', name: 'Mochi', breed: 'Pekingese', cost: 165 },
      { id: 'bull_terrier', name: 'Sparky', breed: 'Bull Terrier', cost: 140 },
      { id: 'basenji', name: 'Zuri', breed: 'Basenji', cost: 155 },
      { id: 'shar_pei', name: 'Rolly', breed: 'Shar Pei', cost: 185 },
      { id: 'cairn_terrier', name: 'Barnacle', breed: 'Cairn Terrier', cost: 85 },
      { id: 'pomchi', name: 'Tater Tot', breed: 'Pomchi', cost: 145 },
      { id: 'pomapoo', name: 'Buttercup', breed: 'Pomapoo', cost: 175 },
    ] 
  ).sort((x, y) => x.cost - y.cost),
  gear: ([
    { id: 'red_bandana', name: 'Red Bandana', slot: 'neck', cost: 15 },
    { id: 'party_hat', name: 'Party Hat', slot: 'head', cost: 15 },
    { id: 'bow_tie', name: 'Bow Tie', slot: 'neck', cost: 20 },
    { id: 'bunny_ears', name: 'Bunny Ears', slot: 'head', cost: 25 },
    { id: 'aviator_shades', name: 'Cool Shades', slot: 'eyes', cost: 30 },
    { id: 'chef_hat', name: 'Chef Hat', slot: 'head', cost: 30 },
    { id: 'cowboy_hat', name: 'Cowboy Hat', slot: 'head', cost: 40 },
    { id: 'heart_glasses', name: 'Heart Glasses', slot: 'eyes', cost: 50 },
    { id: 'flower_crown', name: 'Flower Crown', slot: 'head', cost: 60 },
    { id: 'gold_medal', name: 'Gold Medal', slot: 'neck', cost: 80 },
    { id: 'super_cape', name: 'Super Cape', slot: 'back', cost: 120 },
    { id: 'wizard_hat', name: 'Wizard Hat', slot: 'head', cost: 150 },
    { id: 'butterfly_wings', name: 'Butterfly Wings', slot: 'back', cost: 200 },
    { id: 'gold_crown', name: 'Gold Crown', slot: 'head', cost: 300 },
  ] ).concat(EXTRA_GEAR_INFO).sort((x, y) => x.cost - y.cost),
  voice: () => sound.playBark(),
  player: 'pet',
  older: true,
  words: {
    pet: 'dog',
    home: 'Kennel',
    adopt: 'Adopt a Pup',
    roundWin: 'Pawsome work!',
    prize: 'treasure chest',
    petActive: 'Playing',
    petPick: 'Play with me',
  },
  bakery: {
    title: 'Barking Bakery',
    blurb: 'Bake biscuits to make 10 and 20!',
    item: 'bone biscuit',
    items: 'bone biscuits',
    short: 'biscuit',
    shorts: 'biscuits',
    bag: 'doggy bag',
    thanks: ['Yum! Thank you!', 'Woof! Perfect!', 'Delicious!', 'Pawsome baking!'],
  },
  park: { title: 'Bark Park Dash', blurb: 'Hop along the number line!', caught: () => 'You caught the treat!' },
  bank: {
    title: 'Bone Box',
    blurb: 'Add & subtract big numbers with crates of 10!',
    helpId: 'bone_box',
    welcome: 'Welcome to the Bone Box!',
    unit: 'bone',
    units: 'bones',
    box: 'crate',
    boxes: 'crates',
    keeps: 'Your dog keeps bones here.',
    addTitle: 'A friend brings bones? Add!',
    subTitle: 'Giving bones away? Subtract!',
  },
  art: {},
};

return { dogTheme };
})();

const { catTheme } = (() => {





const catTheme = {
  id: 'cat',
  appName: 'Kitty Home',
  saveKey: 'kitty-math-save-v1',
  starterPet: 'orange_tabby',
  other: { name: 'Pup School', href: './', pet: 'cavapoo' },
  // Shown in the shop cheapest first.
  pets: (
    [
      { id: 'orange_tabby', name: 'Marmalade', breed: 'Orange Tabby', cost: 0 },
      { id: 'gray_tabby', name: 'Cinder', breed: 'Gray Tabby', cost: 25 },
      { id: 'black_cat', name: 'Salem', breed: 'Black Cat', cost: 25 },
      { id: 'russian_blue', name: 'Cosmo', breed: 'Russian Blue', cost: 30 },
      { id: 'tuxedo', name: 'Figaro', breed: 'Tuxedo Cat', cost: 35 },
      { id: 'abyssinian', name: 'Saffron', breed: 'Abyssinian', cost: 40 },
      { id: 'tortie', name: 'Nutmeg', breed: 'Tortoiseshell', cost: 60 },
      { id: 'british_shorthair', name: 'Bramble', breed: 'British Shorthair', cost: 60 },
      { id: 'siamese', name: 'Suki', breed: 'Siamese', cost: 75 },
      { id: 'bengal', name: 'Rajah', breed: 'Bengal', cost: 75 },
      { id: 'sphynx', name: 'Gollum', breed: 'Sphynx', cost: 90 },
      { id: 'calico', name: 'Confetti', breed: 'Calico', cost: 120 },
      { id: 'maine_coon', name: 'Acorn', breed: 'Maine Coon', cost: 140 },
      { id: 'norwegian_forest', name: 'Freya', breed: 'Norwegian Forest Cat', cost: 160 },
      { id: 'snowshoe', name: 'Boots', breed: 'Snowshoe', cost: 180 },
      { id: 'persian', name: 'Duchess', breed: 'Persian', cost: 200 },
      { id: 'ragdoll', name: 'Teacup', breed: 'Ragdoll', cost: 250 },
      { id: 'odd_eyed_white', name: 'Opal', breed: 'Odd-Eyed White', cost: 280 },
      { id: 'ginger_white', name: 'Tangerine', breed: 'Ginger & White', cost: 30 },
      { id: 'gray_white', name: 'Pebble', breed: 'Gray & White', cost: 30 },
      { id: 'cream_tabby', name: 'Custard', breed: 'Cream Tabby', cost: 45 },
      { id: 'silver_tabby', name: 'Quicksilver', breed: 'Silver Tabby', cost: 55 },
      { id: 'burmese', name: 'Espresso', breed: 'Burmese', cost: 65 },
      { id: 'chartreux', name: 'Periwinkle', breed: 'Chartreux', cost: 70 },
      { id: 'devon_rex', name: 'Dobby', breed: 'Devon Rex', cost: 110 },
      { id: 'egyptian_mau', name: 'Pharaoh', breed: 'Egyptian Mau', cost: 130 },
      { id: 'birman', name: 'Sapphire', breed: 'Birman', cost: 150 },
      { id: 'savannah', name: 'Serengeti', breed: 'Savannah', cost: 190 },
      { id: 'himalayan', name: 'Tiramisu', breed: 'Himalayan', cost: 220 },
      { id: 'turkish_angora', name: 'Bianca', breed: 'Turkish Angora', cost: 300 },
      { id: 'scottish_fold', name: 'Shortcake', breed: 'Scottish Fold', cost: 340 },
      { id: 'munchkin', name: 'Sprout', breed: 'Munchkin', cost: 400 },
    ] 
  ).sort((x, y) => x.cost - y.cost),
  gear: ([
    { id: 'bow_tie', name: 'Bow Tie', slot: 'neck', cost: 15 },
    { id: 'party_hat', name: 'Party Hat', slot: 'head', cost: 15 },
    { id: 'bell_collar', name: 'Bell Collar', slot: 'neck', cost: 20 },
    { id: 'aviator_shades', name: 'Cool Shades', slot: 'eyes', cost: 25 },
    { id: 'pink_bow', name: 'Pink Bow', slot: 'head', cost: 30 },
    { id: 'heart_glasses', name: 'Heart Glasses', slot: 'eyes', cost: 40 },
    { id: 'pearl_necklace', name: 'Pearl Necklace', slot: 'neck', cost: 50 },
    { id: 'flower_crown', name: 'Flower Crown', slot: 'head', cost: 60 },
    { id: 'frog_hat', name: 'Froggy Hat', slot: 'head', cost: 80 },
    { id: 'strawberry_hat', name: 'Strawberry Hat', slot: 'head', cost: 100 },
    { id: 'super_cape', name: 'Super Cape', slot: 'back', cost: 120 },
    { id: 'witch_hat', name: 'Witch Hat', slot: 'head', cost: 150 },
    { id: 'tiara', name: 'Sparkle Tiara', slot: 'head', cost: 200 },
    { id: 'butterfly_wings', name: 'Fairy Wings', slot: 'back', cost: 250 },
    { id: 'gold_crown', name: 'Gold Crown', slot: 'head', cost: 300 },
  ] ).concat(EXTRA_GEAR_INFO).sort((x, y) => x.cost - y.cost),
  voice: () => sound.playMeow(),
  player: 'owner',
  older: false,
  words: {
    pet: 'kitty',
    home: 'Home',
    adopt: 'Adopt a Kitty',
    roundWin: 'Purrfect work!',
    prize: 'present',
    petActive: 'With you',
    petPick: 'Cuddle me',
    chatter: [
      "Meow! I'm hungry. Bake me some cookies?",
      'Can we play Mouse Chase?',
      'Pet me, please!',
      'Is the pantry full of fish?',
      'Purr... I love you!',
    ],
  },
  bakery: {
    title: 'Kitty Kitchen',
    blurb: 'Bake for your hungry kitties to make 10 and 20!',
    item: 'fish cookie',
    items: 'fish cookies',
    short: 'cookie',
    shorts: 'cookies',
    bag: 'snack bag',
    thanks: ['Yum! Thank you!', 'Purr! My favorite!', 'Mrrow! Full tummy!', 'Purrfect baking!'],
  },
  park: { title: 'Mouse Chase', blurb: 'Lead your kitty along the number line!', caught: (name) => `${name} caught the mouse!` },
  bank: {
    title: 'Kitty Pantry',
    blurb: 'Stock up & feed your kitties with tins of 10!',
    helpId: 'kitty_pantry',
    welcome: 'Welcome to the Kitty Pantry!',
    unit: 'fish',
    units: 'fish',
    box: 'tin',
    boxes: 'tins',
    keeps: 'You keep fish for your kitties here.',
    addTitle: 'Bought more fish? Add!',
    subTitle: 'Feeding your kitty? Subtract!',
  },
  art: {},
};

return { catTheme };
})();

export const DOG_THEME = dogTheme;
export const CAT_THEME = catTheme;
export const DOG_PETS = dogTheme.pets;
export const CAT_PETS = catTheme.pets;
export const DOG_GEAR = dogTheme.gear;
export const CAT_GEAR = catTheme.gear;

export const DOG_PETS_BY_ID = Object.fromEntries(DOG_PETS.map(p => [p.id, p]));
export const CAT_PETS_BY_ID = Object.fromEntries(CAT_PETS.map(p => [p.id, p]));
export const GEAR_BY_ID = Object.fromEntries([...DOG_GEAR, ...CAT_GEAR].map(g => [g.id, g]));

export const LEGACY_BREED_MAP = {
  golden: "golden_retriever",
  dane: "great_dane",
};

export const LEGACY_HAT_MAP = {
  chef: "chef_hat",
  crown: "gold_crown",
  wizard: "wizard_hat",
  shades: "aviator_shades",
  astro: "astronaut",
};

export function normalizeBreedId(breedOrObj, theme = "dog") {
  let id = typeof breedOrObj === "string" ? breedOrObj : breedOrObj?.id;
  if (!id) return theme === "cat" ? "orange_tabby" : "cavapoo";
  if (LEGACY_BREED_MAP[id]) id = LEGACY_BREED_MAP[id];
  if (theme === "cat") {
    if (CAT_PETS_BY_ID[id]) return id;
    // Deterministically map a dog breed to a cat breed when in cat mode!
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return CAT_PETS[hash % CAT_PETS.length].id;
  }
  if (DOG_PETS_BY_ID[id]) return id;
  if (CAT_PETS_BY_ID[id]) return id;
  return "cavapoo";
}

export function normalizeGearList(gear, legacyHat) {
  const list = Array.isArray(gear) ? [...gear] : [];
  if (legacyHat && legacyHat !== "none") {
    const mapped = LEGACY_HAT_MAP[legacyHat] || legacyHat;
    if (GEAR_BY_ID[mapped] && !list.includes(mapped)) {
      list.push(mapped);
    }
  }
  return list;
}

export function normalizeMood(mood) {
  if (mood === "excited" || mood === "zoomies" || mood === "munching") return "excited";
  if (mood === "happy") return "happy";
  if (mood === "waiting" || mood === "impatient" || mood === "curious") return "curious";
  return "idle";
}

export function renderPetSvg({ theme = "dog", breed, gear = [], hat, mood = "idle", size = 200, className = "" } = {}) {
  const resolvedBreed = normalizeBreedId(breed, theme);
  const resolvedGear = normalizeGearList(gear, hat);
  const resolvedMood = normalizeMood(mood);
  const isCat = theme === "cat" || Boolean(CAT_PETS_BY_ID[resolvedBreed]);
  if (isCat) {
    return CatAvatar({ breed: resolvedBreed, gear: resolvedGear, mood: resolvedMood, size, className });
  }
  return DogAvatar({ breed: resolvedBreed, gear: resolvedGear, mood: resolvedMood, size, className });
}

export function renderTreatIconSvg(theme = "dog", size = 28) {
  return theme === "cat" ? FishTreat({ size }) : TreatIcon({ size });
}

const _canvasImageCache = new Map();

export function getPetCanvasImage({ theme = "dog", breed, gear = [], hat, mood = "idle" } = {}) {
  if (typeof Image === "undefined") return null;
  const resolvedBreed = normalizeBreedId(breed, theme);
  const resolvedGear = normalizeGearList(gear, hat);
  const resolvedMood = normalizeMood(mood);
  const isCat = theme === "cat" || Boolean(CAT_PETS_BY_ID[resolvedBreed]);
  const key = `${isCat ? "cat" : "dog"}:${resolvedBreed}:${resolvedGear.slice().sort().join(",")}:${resolvedMood}`;

  let entry = _canvasImageCache.get(key);
  if (entry) return entry;

  let svg = isCat
    ? CatAvatar({ breed: resolvedBreed, gear: resolvedGear, mood: resolvedMood, size: 200 })
    : DogAvatar({ breed: resolvedBreed, gear: resolvedGear, mood: resolvedMood, size: 200 });

  // Expand viewBox so tall hats, crowns, wings, and swords never clip when rasterized by HTMLImageElement
  svg = svg
    .replace('viewBox="0 -20 200 240"', 'viewBox="-40 -60 280 290"')
    .replace('width="200"', 'width="280"')
    .replace('height="240"', 'height="290"');

  const img = new Image();
  entry = { img, loaded: false };
  img.onload = () => {
    entry.loaded = true;
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  _canvasImageCache.set(key, entry);
  return entry;
}

export { DogAvatar, CatAvatar, TreatIcon, FishTreat, EXTRA_GEAR_INFO };
