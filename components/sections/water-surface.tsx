"use client";

import { useEffect, useRef, useState } from "react";

// Ripples run on a square height field that always covers the longest side of the box,
// so rings stay round while the hero box changes shape on scroll.
const SIM_SIZE = 256;
const MAX_DROPS = 8;
// Bowls from biggest to smallest. Each one rings its own note: the biggest is the lowest.
const BOWL_SPECS = [
  { hx: 0.82, hy: 0.76, scale: 1, hz: 196, sound: "/sounds/bowl-1.mp3" }, // G3
  { hx: 0.17, hy: 0.66, scale: 0.86, hz: 261.63, sound: "/sounds/bowl-2.mp3" }, // C4
  { hx: 0.68, hy: 0.57, scale: 0.74, hz: 293.66, sound: "/sounds/bowl-3.mp3" }, // D4
  { hx: 0.33, hy: 0.82, scale: 0.64, hz: 329.63, sound: "/sounds/bowl-4.mp3" }, // E4
  { hx: 0.93, hy: 0.56, scale: 0.55, hz: 392, sound: "/sounds/bowl-5.mp3" }, // G4
];
const BOWLS = BOWL_SPECS.length;
const DROP_SOUNDS = ["/sounds/drop-1.mp3", "/sounds/drop-2.mp3", "/sounds/drop-3.mp3"];
// The note itself is far too fast to see, so the rim pulses the water at the note divided by this.
const HUM_DIVIDER = 49;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Height field wave step: r = height, g = velocity.
const simShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uState;
  uniform vec2 uDelta;
  uniform vec4 uDrops[${MAX_DROPS}];
  varying vec2 vUv;

  void main() {
    vec4 info = texture2D(uState, vUv);
    float avg = (
      texture2D(uState, vUv - vec2(uDelta.x, 0.0)).r +
      texture2D(uState, vUv + vec2(uDelta.x, 0.0)).r +
      texture2D(uState, vUv - vec2(0.0, uDelta.y)).r +
      texture2D(uState, vUv + vec2(0.0, uDelta.y)).r
    ) * 0.25;
    info.g += (avg - info.r) * 2.0;
    info.g *= 0.993;
    info.r += info.g;
    info.r *= 0.998;

    for (int i = 0; i < ${MAX_DROPS}; i++) {
      vec4 drop = uDrops[i];
      if (drop.w != 0.0) {
        // A negative radius makes a thin ring of that size instead of a disc: the rim of a humming bowl.
        float dist = length(vUv - drop.xy);
        float d = max(0.0, drop.z > 0.0 ? 1.0 - dist / drop.z : 1.0 - abs(dist + drop.z) / 0.012);
        info.r += (0.5 - cos(d * 3.14159265) * 0.5) * drop.w;
      }
    }
    gl_FragColor = info;
  }
`;

const displayShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uState;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec3 uFlower;
  uniform float uFlowerSize;
  uniform sampler2D uText;
  uniform vec4 uTextRect;
  uniform float uTextAlpha;
  uniform float uTextRise;
  uniform vec4 uBowls[${BOWLS}]; // x, y, angle, how loud it is singing
  uniform float uBowlSize;
  uniform float uBowlScale[${BOWLS}];
  varying vec2 vUv;

  #define TAU 6.28318530718

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }

  // Light lines on the water, after the "tileable water caustic" shader by joltz0r.
  float caustic(vec2 p, float t) {
    vec2 i = p;
    float c = 1.0;
    for (int n = 0; n < 4; n++) {
      float tt = t * (1.0 - 3.5 / float(n + 1));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005)));
    }
    c = 1.17 - pow(c / 4.0, 1.4);
    return pow(abs(c), 8.0);
  }

  float height(vec2 p) { return texture2D(uState, p).r; }

  mat2 rotate(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  float ellipseSd(vec2 p, vec2 ab) { return (length(p / ab) - 1.0) * min(ab.x, ab.y); }

  // One cherry petal in its own frame: x runs from the flower center out to the notched tip.
  float petalSd(vec2 p) {
    float taper = 1.0 + 1.1 * (1.0 - smoothstep(0.0, 0.6, p.x));
    float d = ellipseSd(vec2(p.x - 0.55, p.y * taper), vec2(0.47, 0.36));
    float notch = length((p - vec2(1.05, 0.0)) * vec2(1.0, 0.75)) - 0.1;
    return max(d, -notch);
  }

  float petalAngle(float i) { return i * TAU / 5.0 + 0.09 * sin(i * 2.3 + 1.0); }
  float petalScale(float i) { return 0.94 + 0.09 * hash(vec2(i, 7.0)); }

  float flowerSd(vec2 d) {
    float sd = length(d) - 0.12;
    for (int j = 0; j < 5; j++) {
      float i = float(j);
      float s = petalScale(i);
      sd = min(sd, petalSd(rotate(petalAngle(i)) * d / s) * s);
    }
    return sd;
  }

  void main() {
    vec2 scale = uRes / max(uRes.x, uRes.y);
    vec2 sp = 0.5 + (vUv - 0.5) * scale;
    float e = 1.0 / ${SIM_SIZE}.0;
    vec2 slope = vec2(height(sp + vec2(e, 0.0)) - height(sp - vec2(e, 0.0)),
                      height(sp + vec2(0.0, e)) - height(sp - vec2(0.0, e)));
    float t = uTime;

    // Slow swell that is always moving, even untouched.
    vec2 q = sp * 3.0;
    vec2 warp = vec2(fbm(q + t * 0.05), fbm(q + vec2(5.2, 1.3) - t * 0.04));
    float swell = fbm(q * 1.4 + warp * 1.8 + t * 0.03);
    vec2 rp = sp + slope * 3.0 + (warp - 0.5) * 0.02;

    vec3 deep = vec3(0.020, 0.120, 0.130);
    vec3 mid = vec3(0.070, 0.300, 0.310);
    vec3 lite = vec3(0.200, 0.470, 0.465);
    vec3 col = mix(deep, mid, smoothstep(0.25, 0.75, swell));
    col = mix(col, lite, smoothstep(0.6, 0.95, swell) * 0.55);

    // Wordmark lies just under the surface: ripples bend it and split its edges,
    // and the caustics and highlights below play over it like the rest of the water.
    if (uTextAlpha > 0.0) {
      float longest = max(uRes.x, uRes.y);
      vec2 bend = (slope * 5.0 + (warp - 0.5) * 0.006) * longest;
      vec2 tuv = (vUv * uRes + bend - uTextRect.xy) / uTextRect.zw;
      tuv.y += uTextRise;
      vec2 fringe = slope * 0.7 * longest / uTextRect.zw;
      float shade = texture2D(uText, tuv + vec2(-0.006, 0.025), 3.0).a;
      col *= 1.0 - 0.35 * shade * uTextAlpha;
      vec3 ink = vec3(texture2D(uText, tuv + fringe).a, texture2D(uText, tuv).a, texture2D(uText, tuv - fringe).a);
      vec3 pearl = mix(vec3(0.96, 0.95, 0.90), lite + 0.5, 0.18);
      col = mix(col, pearl, ink * uTextAlpha * 0.94);
    }

    float c = caustic(rp * TAU * 1.3 - 250.0, t * 0.3 + 23.0);
    col += vec3(0.55, 0.80, 0.78) * c * 0.45 * (0.3 + swell);

    // Ripples catch the light coming from the top left.
    vec3 n = normalize(vec3(-slope * 40.0 - (warp - 0.5) * 0.12, 1.0));
    vec3 l = normalize(vec3(-0.5, 0.6, 0.8));
    float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);
    col += vec3(0.95, 0.93, 0.86) * spec * 0.7;
    col += vec3(0.45, 0.65, 0.62) * clamp((slope.y - slope.x) * 14.0, -0.12, 0.35);

    // Sun glints in the top left corner.
    float glintArea = smoothstep(0.42, 0.0, length((vUv - vec2(0.06, 0.88)) * vec2(1.0, 1.5)));
    float glint = smoothstep(0.8, 0.97, fbm(rp * 16.0 + vec2(t * 0.15, -t * 0.1)));
    col += vec3(1.0, 0.97, 0.9) * glint * glintArea * 1.3;

    col *= mix(0.7, 1.0, smoothstep(1.05, 0.35, length(vUv - 0.5) * 1.35));

    // Brass singing bowls seen from above, tipping on the ripples. Unit radius is the outer rim.
    vec2 lightDir = normalize(vec2(-0.6, 0.7));
    for (int k = 0; k < ${BOWLS}; k++) {
      vec4 b = uBowls[k];
      float size = uBowlSize * uBowlScale[k];
      vec2 bs = vec2(height(b.xy + vec2(e, 0.0)) - height(b.xy - vec2(e, 0.0)),
                     height(b.xy + vec2(0.0, e)) - height(b.xy - vec2(0.0, e)));
      vec2 d = (sp - b.xy - bs * 0.3) / size;
      float r = length(d);
      if (r > 2.2) continue;
      float baa = 1.2 / (max(uRes.x, uRes.y) * size);

      col *= 1.0 - 0.5 * (1.0 - smoothstep(0.8, 1.4, length(d - vec2(0.14, -0.18))));
      col += vec3(0.50, 0.72, 0.68) * 0.16 * (1.0 - smoothstep(0.0, 0.07, abs(r - 1.05)));
      col += vec3(1.0, 0.78, 0.42) * b.w * 0.22 * exp(-max(r - 1.0, 0.0) * 5.0);

      if (r < 1.0 + baa) {
        vec2 dir = d / max(r, 1e-4);
        vec2 tilt = clamp(bs * 15.0, -0.1, 0.1);
        vec2 dl = d + tilt;
        vec2 td = rotate(b.z) * d;
        vec3 dark = vec3(0.26, 0.16, 0.06);
        vec3 brass = vec3(0.70, 0.50, 0.22);
        vec3 bright = vec3(1.0, 0.87, 0.58);
        float hammer = noise(td * 11.0 + float(k) * 7.0) - 0.5;

        // Inside is concave: the wall facing away from the light catches it, the near wall is shaded by the rim.
        float facing = dot(normalize(dl + 1e-4), -lightDir) * smoothstep(0.1, 0.75, length(dl));
        vec3 ic = mix(dark, brass, clamp(0.5 + 0.45 * facing + 0.25 * hammer, 0.0, 1.0));
        ic *= 1.0 - 0.4 * smoothstep(0.45, 0.8, r) * max(dot(dir, lightDir), 0.0);
        ic *= 0.96 + 0.04 * sin(r * 170.0 + hammer * 3.0);
        ic += bright * 0.55 * exp(-pow(length(dl + lightDir * 0.42) * 4.0, 2.0));
        ic *= 1.0 - 0.3 * (1.0 - smoothstep(0.0, 0.018, abs(r - 0.58)));
        ic *= 1.0 - 0.3 * (1.0 - smoothstep(0.0, 0.012, abs(r - 0.64)));

        // Rounded lip: lit on the light side, bright glint along its crest.
        float lip = sin(clamp((r - 0.8) / 0.2, 0.0, 1.0) * 3.14159);
        float rimLight = dot(dir, lightDir);
        vec3 rc = mix(dark * 1.3, bright, clamp(0.45 + 0.55 * rimLight * lip, 0.0, 1.0));
        rc += vec3(1.0, 0.96, 0.84) * pow(max(rimLight, 0.0), 14.0) * lip * 0.7;
        rc *= 1.0 + 0.12 * hammer;

        vec3 bc = mix(rc, ic, smoothstep(0.82, 0.78, r));
        bc = mix(bc, bright * 1.15, b.w * 0.25 * lip);
        col = mix(col, bc, 1.0 - smoothstep(1.0 - baa, 1.0 + baa, r));
      }
    }

    // Flower: rocks with the ripples under it and casts a soft shadow.
    vec2 flowerSlope = vec2(height(uFlower.xy + vec2(e, 0.0)) - height(uFlower.xy - vec2(e, 0.0)),
                            height(uFlower.xy + vec2(0.0, e)) - height(uFlower.xy - vec2(0.0, e)));
    vec2 center = uFlower.xy + flowerSlope * 0.3;
    mat2 spin = rotate(uFlower.z);
    vec2 sd0 = spin * (sp - center - vec2(0.008, -0.011)) / uFlowerSize;
    if (length(sd0) < 1.4) col *= 1.0 - 0.5 * (1.0 - smoothstep(-0.05, 0.25, flowerSd(sd0)));

    vec2 fd = spin * (sp - center) / uFlowerSize;
    float aa = 1.2 / (max(uRes.x, uRes.y) * uFlowerSize);
    if (length(fd) < 1.15 && flowerSd(fd) < aa) {
      vec3 water = col;
      vec2 ld = spin * normalize(vec2(-0.6, 0.7));
      float covered = 0.0;

      // Petals overlap one another; each casts a soft shadow on whatever lies under it.
      for (int j = 0; j < 5; j++) {
        float i = float(j);
        float s = petalScale(i);
        mat2 R = rotate(petalAngle(i));
        vec2 p = R * fd / s;
        float sd = petalSd(p) * s;
        float sh = 1.0 - smoothstep(-0.02, 0.09, petalSd(R * (fd + ld * 0.05) / s) * s);
        col *= 1.0 - 0.26 * sh * covered;
        float m = 1.0 - smoothstep(-aa, aa, sd);
        if (m > 0.0) {
          float u = p.x, v = p.y;
          float inner = smoothstep(0.0, 0.16, -sd);
          vec2 pl = R * ld;

          vec3 pc = vec3(0.985, 0.978, 0.958);
          pc = mix(vec3(0.95, 0.83, 0.83), pc, smoothstep(0.1, 0.45, u));
          pc = mix(vec3(0.72, 0.76, 0.52), pc, smoothstep(0.04, 0.18, u));
          pc *= 0.8 + 0.2 * smoothstep(0.03, 0.3, u);

          // Veins fan out from the base, with a faint crease down the middle.
          float phi = atan(v, u + 0.15);
          float wob = noise(vec2(phi * 18.0, u * 4.0 + i * 5.0));
          float vein = 1.0 - smoothstep(0.0, 0.3, abs(sin(phi * 22.0 + wob * 1.6)));
          pc -= vec3(0.07, 0.06, 0.05) * vein * smoothstep(0.08, 0.4, u) * (0.4 + 0.6 * inner);
          float rib = (1.0 - smoothstep(0.0, 0.025, abs(v))) * smoothstep(0.05, 0.3, u) * (1.0 - smoothstep(0.55, 0.9, u));
          pc -= vec3(0.05) * rib;
          pc *= 0.965 + 0.05 * noise(p * 26.0 + i * 13.0);

          // Cupped petal: the rim curls up, catching light on one side and dimming on the other.
          vec2 g = vec2(petalSd(p + vec2(0.01, 0.0)) - petalSd(p - vec2(0.01, 0.0)),
                        petalSd(p + vec2(0.0, 0.01)) - petalSd(p - vec2(0.0, 0.01)));
          float curl = dot(normalize(g + 1e-5), pl) * (1.0 - inner);
          pc *= 1.0 + 0.14 * curl;
          pc *= 0.95 + 0.07 * pl.x * smoothstep(0.2, 1.0, u);
          pc += vec3(0.06) * pow(max(curl, 0.0), 3.0);

          // Thin rim lets the water show through.
          pc = mix(pc, water * 1.4 + vec3(0.40, 0.45, 0.44), (1.0 - inner) * 0.32);

          col = mix(col, pc, m);
          covered = max(covered, m);
        }
      }

      float r = length(fd);
      if (r < 0.42) {
        float disc = 1.0 - smoothstep(0.1 - aa, 0.1 + aa, r);
        vec3 dc = mix(vec3(0.50, 0.12, 0.09), vec3(0.80, 0.76, 0.44), smoothstep(0.035, 0.1, r));
        dc *= 0.85 + 0.15 * noise(fd * 60.0);
        col = mix(col, dc, disc * 0.92);

        float fil = 0.0, filSh = 0.0, anth = 0.0, anthSh = 0.0, pollen = 0.0;
        for (int j = 0; j < 26; j++) {
          float i = float(j);
          float sa = (i + 0.5 * hash(vec2(i, 1.7))) * TAU / 26.0;
          float len = 0.19 + 0.13 * hash(vec2(i, 4.2));
          vec2 dir = vec2(cos(sa), sin(sa));
          vec2 base = dir * 0.05;
          vec2 tip = dir * len + vec2(-dir.y, dir.x) * 0.04 * (hash(vec2(i, 9.1)) - 0.5);
          vec2 ba = tip - base;
          vec2 pa = fd - base;
          float dseg = length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
          fil = max(fil, 1.0 - smoothstep(0.004, 0.004 + aa, dseg));
          vec2 ps = pa + ld * 0.025;
          filSh = max(filSh, 1.0 - smoothstep(0.0, 0.018, length(ps - ba * clamp(dot(ps, ba) / dot(ba, ba), 0.0, 1.0))));
          vec2 ta = (fd - tip) * rotate(sa);
          float dA = length(ta * vec2(1.0, 1.35));
          anth = max(anth, 1.0 - smoothstep(0.017, 0.017 + aa, dA));
          anthSh = max(anthSh, 1.0 - smoothstep(0.01, 0.04, length(fd + ld * 0.03 - tip)));
          pollen = max(pollen, 1.0 - smoothstep(0.0, 0.009, length(fd - tip - ld * 0.006)));
        }
        col *= 1.0 - 0.28 * max(filSh, anthSh) * covered;
        vec3 fc = mix(vec3(0.93, 0.78, 0.72), vec3(0.72, 0.24, 0.17), smoothstep(0.06, 0.3, r));
        col = mix(col, fc, fil * 0.95);
        vec3 ac = mix(vec3(0.42, 0.09, 0.05), vec3(0.88, 0.50, 0.30), pollen);
        col = mix(col, ac, anth);

        // Pistil standing up in the middle.
        float pist = 1.0 - smoothstep(0.022, 0.022 + aa, r);
        col = mix(col, vec3(0.30, 0.10, 0.06), (1.0 - smoothstep(0.03, 0.03 + aa, r)) * 0.6);
        col = mix(col, mix(vec3(0.70, 0.74, 0.46), vec3(0.92, 0.94, 0.75), smoothstep(0.02, 0.0, length(fd - ld * 0.008))), pist);
      }
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

type Drop = { x: number; y: number; radius: number; strength: number };

const SUB_LINE = "Heal with";
const MAIN_LINE = "Mahima";

// Draws the wordmark once in the site serif; the shader places and bends it.
async function drawWordmark() {
  const family = getComputedStyle(document.body).getPropertyValue("--font-instrument-serif").trim() || "serif";
  const big = 360;
  const small = big * 0.4;
  const pad = big * 0.12;
  const mainFont = `${big}px ${family}`;
  const subFont = `italic ${small}px ${family}`;
  await Promise.all([document.fonts.load(mainFont), document.fonts.load(subFont)]).catch(() => {});

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.font = mainFont;
  const main = ctx.measureText(MAIN_LINE);
  ctx.font = subFont;
  const sub = ctx.measureText(SUB_LINE);
  const subBase = pad + sub.actualBoundingBoxAscent;
  const mainBase = subBase + big * 0.8;
  canvas.width = Math.ceil(Math.max(main.width, sub.width + big * 0.06) + pad * 2);
  canvas.height = Math.ceil(mainBase + main.actualBoundingBoxDescent + pad);

  ctx.fillStyle = "#fff";
  ctx.font = subFont;
  ctx.fillText(SUB_LINE, pad + big * 0.05, subBase);
  ctx.font = mainFont;
  ctx.fillText(MAIN_LINE, pad, mainBase);
  return canvas;
}

export function WaterSurface() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glText, setGlText] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
      } catch {
        return; // No WebGL: the teal gradient behind the canvas stays.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const targetOptions = {
        type: THREE.HalfFloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
      };
      let read = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, targetOptions);
      let write = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, targetOptions);

      const dropUniforms = Array.from({ length: MAX_DROPS }, () => new THREE.Vector4());
      const simMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: simShader,
        uniforms: {
          uState: { value: read.texture },
          uDelta: { value: new THREE.Vector2(1 / SIM_SIZE, 1 / SIM_SIZE) },
          uDrops: { value: dropUniforms },
        },
      });
      const displayMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: displayShader,
        uniforms: {
          uState: { value: read.texture },
          uRes: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uFlower: { value: new THREE.Vector3(0.5, 0.56, 0.4) },
          uFlowerSize: { value: 0.09 },
          uText: { value: null as InstanceType<typeof THREE.CanvasTexture> | null },
          uTextRect: { value: new THREE.Vector4(0, 0, 1, 1) },
          uTextAlpha: { value: 0 },
          uTextRise: { value: 0 },
          uBowls: { value: Array.from({ length: BOWLS }, () => new THREE.Vector4()) },
          uBowlSize: { value: 0.05 },
          uBowlScale: { value: BOWL_SPECS.map((b) => b.scale) },
        },
      });
      const simScene = new THREE.Scene();
      simScene.add(new THREE.Mesh(geometry, simMaterial));
      const displayScene = new THREE.Scene();
      displayScene.add(new THREE.Mesh(geometry, displayMaterial));

      let width = 0;
      let height = 0;
      let scaleX = 1;
      let scaleY = 1;
      let flowerSize = 0.06;
      let bowlSize = 0.05;
      let textAspect = 0;
      let textStart = -1;
      const section = canvas.closest("section");

      // Bottom left, at most 90% of the width and 40% of the height of the box.
      const layoutText = () => {
        if (!textAspect || !width) return;
        const tw = Math.min(width * 0.9, height * 0.4 * textAspect);
        const margin = Math.max(12, width * 0.03);
        displayMaterial.uniforms.uTextRect.value.set(margin, height * 0.04, tw, tw / textAspect);
      };

      const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h || (w === width && h === height)) return;
        width = w;
        height = h;
        renderer.setSize(w, h, false);
        displayMaterial.uniforms.uRes.value.set(w, h);
        const longest = Math.max(w, h);
        scaleX = w / longest;
        scaleY = h / longest;
        flowerSize = Math.max(0.062 * longest, 0.13 * Math.min(w, h)) / longest;
        bowlSize = Math.max(0.045 * longest, 0.09 * Math.min(w, h)) / longest;
        layoutText();
      };

      const pending: Drop[] = [];
      const flower = { x: 0.5, y: 0.62, vx: 0, vy: 0, angle: 0.4, spin: 0.0006 };
      // Home spots are fractions of the visible box, all above the wordmark.
      const bowls = BOWL_SPECS.map((spec, i) => ({
        ...spec,
        phase: i * 2.1,
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0,
        angle: i * 1.7 + 1,
        spin: i % 2 ? -0.0003 : 0.0003,
        ring: 0,
        hum: 0,
        humPhase: 0,
      }));
      const floaters = [flower, ...bowls];
      let bowlsPlaced = false;

      const addDrop = (drop: Drop) => {
        if (pending.length >= MAX_DROPS) pending.shift();
        pending.push(drop);
        // The ripple pushes whatever floats nearby away and gives it a little turn.
        for (const f of floaters) {
          const dx = f.x - drop.x;
          const dy = f.y - drop.y;
          const dist = Math.hypot(dx, dy) || 1e-4;
          const reach = 0.28;
          if (dist < reach) {
            const push = (1 - dist / reach) * Math.abs(drop.strength) * (f === flower ? 0.012 : 0.008);
            f.vx += (dx / dist) * push;
            f.vy += (dy / dist) * push;
            f.spin += (dx * 0.5 - dy) * push * 0.4;
          }
        }
      };

      // A struck bowl sings: its rim glows, it sends out a ring, and it keeps humming.
      const sing = (bowl: (typeof bowls)[number], loud: number) => {
        bowl.ring = Math.max(bowl.ring, loud);
        bowl.hum = Math.max(bowl.hum, loud);
        bowl.humPhase = 0;
        addDrop({ x: bowl.x, y: bowl.y, radius: bowlSize * bowl.scale * 1.3, strength: -0.012 * loud });
      };

      // While a bowl hums, its rim pushes the water up and down at its own (slowed) note,
      // so each one throws its own train of rings: low bowls wide apart, high bowls tight.
      // These skip addDrop so the steady hum does not shove the flower around.
      const humBowls = (dt: number) => {
        for (const b of bowls) {
          if (b.hum < 0.02) continue;
          b.humPhase += dt * (b.hz / HUM_DIVIDER);
          b.hum *= Math.pow(0.7, dt);
          if (pending.length >= MAX_DROPS) continue;
          pending.push({
            x: b.x,
            y: b.y,
            radius: -bowlSize * b.scale * 1.08,
            strength: 0.014 * b.hum * Math.sin(b.humPhase * Math.PI * 2),
          });
        }
      };

      // Sound only plays when a visitor taps. Browsers only start audio inside
      // a tap or click, so the audio context and the recordings are set up on the first one.
      let audio: AudioContext | null = null;
      const tones = new Map<string, Promise<AudioBuffer | null>>();
      const tone = (ctx: AudioContext, url: string) => {
        let buffer = tones.get(url);
        if (!buffer) {
          buffer = fetch(url)
            .then((res) => res.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data))
            .catch(() => null);
          tones.set(url, buffer);
        }
        return buffer;
      };
      const play = (url: string, volume: number, detune: number) => {
        if (!audio) {
          try {
            audio = new AudioContext();
          } catch {
            return;
          }
        }
        const ctx = audio;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const struck = performance.now();
        tone(ctx, url).then((buffer) => {
          // A sound that arrives long after the tap would feel unrelated, so skip it.
          if (!buffer || performance.now() - struck > 600) return;
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = 1 + (Math.random() - 0.5) * detune;
          const gain = ctx.createGain();
          gain.gain.value = volume;
          source.connect(gain).connect(ctx.destination);
          source.start();
        });
        for (const b of bowls) tone(ctx, b.sound);
        for (const d of DROP_SOUNDS) tone(ctx, d);
      };

      // Phones only allow a buzz from a finished tap (finger lifted), so the pattern waits for it.
      // iOS Safari has no navigator.vibrate, but toggling a native switch input gives one haptic tick.
      let buzz: number | number[] | null = null;
      let iosSwitch: HTMLLabelElement | null = null;
      const vibrate = (pattern: number | number[]) => {
        buzz = pattern;
      };
      const fireBuzz = () => {
        if (buzz === null) return;
        const pattern = buzz;
        buzz = null;
        if (typeof navigator.vibrate === "function") {
          navigator.vibrate(pattern);
          return;
        }
        if (!iosSwitch) {
          iosSwitch = document.createElement("label");
          iosSwitch.ariaHidden = "true";
          iosSwitch.style.display = "none";
          const input = document.createElement("input");
          input.type = "checkbox";
          input.setAttribute("switch", "");
          iosSwitch.appendChild(input);
          document.head.appendChild(iosSwitch);
        }
        iosSwitch.click();
      };

      // A strike, then a fading shimmer; bigger bowls buzz longer and slower.
      const strike = (bowl: (typeof bowls)[number]) => {
        sing(bowl, 1);
        const gap = Math.round(60 * bowl.scale);
        vibrate([Math.round(34 * bowl.scale), gap, 14, gap, 9, gap, 6]);
        play(bowl.sound, 0.7, 0.008);
      };

      // Water and flower taps get a short tick and a little drop sound.
      const splash = (onFlower: boolean) => {
        vibrate(onFlower ? [12, 40, 8] : 10);
        play(DROP_SOUNDS[Math.floor(Math.random() * DROP_SOUNDS.length)], onFlower ? 0.14 : 0.18, 0.1);
      };

      const toSim = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        const u = (clientX - rect.left) / rect.width;
        const v = 1 - (clientY - rect.top) / rect.height;
        return { x: 0.5 + (u - 0.5) * scaleX, y: 0.5 + (v - 0.5) * scaleY };
      };

      let lastPoint: { x: number; y: number } | null = null;
      const stir = (clientX: number, clientY: number, pressed: boolean) => {
        const p = toSim(clientX, clientY);
        const moved = lastPoint ? Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y) : 0;
        lastPoint = p;
        if (pressed) {
          const hit = bowls.find((b) => Math.hypot(p.x - b.x, p.y - b.y) < bowlSize * b.scale * 1.2);
          if (hit) strike(hit);
          else {
            addDrop({ ...p, radius: 0.035, strength: 0.05 });
            splash(Math.hypot(p.x - flower.x, p.y - flower.y) < flowerSize * 1.1);
          }
        }
        else if (moved > 0.002) addDrop({ ...p, radius: 0.025, strength: Math.min(0.02, moved * 0.6) });
      };

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === "mouse") stir(e.clientX, e.clientY, false);
      };
      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse") {
          stir(e.clientX, e.clientY, true);
          fireBuzz();
        }
      };
      const onPointerLeave = () => {
        lastPoint = null;
      };
      // Touch uses passive listeners so the page still scrolls under the finger.
      const onTouchStart = (e: TouchEvent) => {
        lastPoint = null;
        for (const touch of Array.from(e.changedTouches)) stir(touch.clientX, touch.clientY, true);
      };
      const onTouchMove = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (touch) stir(touch.clientX, touch.clientY, false);
      };
      const onTouchEnd = () => fireBuzz();

      let raf = 0;
      let running = false;
      let time = 20;
      let last = 0;
      let nextIdleDrop = 1.5;
      let nextFlowerDrop = 0.5;

      const stepFlower = (dt: number) => {
        // Gentle drift around a home spot, kept inside the visible water.
        const homeX = 0.5 + 0.05 * scaleX * Math.sin(time * 0.07);
        const homeY = 0.5 + 0.1 * scaleY + 0.03 * scaleY * Math.cos(time * 0.05);
        const k = dt * 60;
        flower.vx = (flower.vx + (homeX - flower.x) * 0.0002 * k) * Math.pow(0.972, k);
        flower.vy = (flower.vy + (homeY - flower.y) * 0.0002 * k) * Math.pow(0.972, k);
        const fs = Math.hypot(flower.vx, flower.vy);
        if (fs > 0.0012) {
          flower.vx *= 0.0012 / fs;
          flower.vy *= 0.0012 / fs;
        }
        flower.spin = Math.max(-0.004, Math.min(0.004, flower.spin * Math.pow(0.985, k) + 0.00001 * k));
        flower.x += flower.vx * dt * 60;
        flower.y += flower.vy * dt * 60;
        flower.angle += flower.spin * dt * 60;
        // Keep the flower clear of the edges and above the wordmark (bottom ~45%).
        const marginX = 0.5 * scaleX - flowerSize * 1.2;
        const top = 0.5 + 0.5 * scaleY - 0.12 * scaleY - flowerSize * 1.2;
        const bottom = 0.5 - 0.5 * scaleY + 0.47 * scaleY + flowerSize;
        flower.x = Math.min(0.5 + marginX, Math.max(0.5 - marginX, flower.x));
        flower.y = Math.min(top, Math.max(bottom, flower.y));
      };

      const stepBowls = (dt: number) => {
        const left = 0.5 - 0.5 * scaleX;
        const base = 0.5 - 0.5 * scaleY;
        for (const b of bowls) {
          const homeX = left + scaleX * (b.hx + 0.03 * Math.sin(time * 0.06 + b.phase));
          const homeY = base + scaleY * (b.hy + 0.03 * Math.cos(time * 0.045 + b.phase));
          if (!bowlsPlaced) {
            b.x = homeX;
            b.y = homeY;
          }
          const k = dt * 60;
          b.vx = (b.vx + (homeX - b.x) * 0.00012 * k) * Math.pow(0.978, k);
          b.vy = (b.vy + (homeY - b.y) * 0.00012 * k) * Math.pow(0.978, k);
          const bv = Math.hypot(b.vx, b.vy);
          if (bv > 0.0009) {
            b.vx *= 0.0009 / bv;
            b.vy *= 0.0009 / bv;
          }
          b.spin = Math.max(-0.003, Math.min(0.003, b.spin * Math.pow(0.985, k) + 0.000004 * k));
          b.x += b.vx * dt * 60;
          b.y += b.vy * dt * 60;
          b.angle += b.spin * dt * 60;
          b.ring *= Math.pow(0.4, dt);

          // Bowls and flower nudge apart instead of overlapping.
          for (const o of floaters) {
            if (o === b) continue;
            const reach = bowlSize * b.scale * 1.15 + (o === flower ? flowerSize * 1.1 : bowlSize * (o as typeof b).scale * 1.15);
            const dx = b.x - o.x;
            const dy = b.y - o.y;
            const dist = Math.hypot(dx, dy) || 1e-4;
            if (dist < reach) {
              const push = (reach - dist) * 0.004;
              b.vx += (dx / dist) * push;
              b.vy += (dy / dist) * push;
              o.vx -= (dx / dist) * push * 0.5;
              o.vy -= (dy / dist) * push * 0.5;
            }
          }

          const size = bowlSize * b.scale;
          const marginX = 0.5 * scaleX - size * 1.4;
          b.x = Math.min(0.5 + marginX, Math.max(0.5 - marginX, b.x));
          b.y = Math.min(0.5 + 0.5 * scaleY - 0.12 * scaleY - size * 1.3, Math.max(base + 0.47 * scaleY + size, b.y));
        }
        bowlsPlaced = true;
      };

      const simulate = () => {
        for (let step = 0; step < 2; step++) {
          dropUniforms.forEach((u, i) => {
            const drop = step === 0 ? pending[i] : undefined;
            if (drop) u.set(drop.x, drop.y, drop.radius, drop.strength);
            else u.set(0, 0, 0, 0);
          });
          simMaterial.uniforms.uState.value = read.texture;
          renderer.setRenderTarget(write);
          renderer.render(simScene, camera);
          [read, write] = [write, read];
        }
        pending.length = 0;
        renderer.setRenderTarget(null);
      };

      const draw = () => {
        const u = displayMaterial.uniforms;
        u.uState.value = read.texture;
        u.uTime.value = time;
        u.uFlower.value.set(flower.x, flower.y, flower.angle);
        u.uFlowerSize.value = flowerSize * (1 + 0.015 * Math.sin(time * 1.3));
        u.uBowlSize.value = bowlSize;
        bowls.forEach((b, i) => u.uBowls.value[i].set(b.x, b.y, b.angle, b.ring));
        if (textStart >= 0) {
          // Rises up out of the depth, then fades as the hero box opens up on scroll.
          const reveal = reducedMotion ? 1 : 1 - Math.pow(1 - Math.min(1, (time - textStart) / 1.6), 3);
          const progress = parseFloat(section?.style.getPropertyValue("--hero-p") || "0") || 0;
          u.uTextAlpha.value = reveal * Math.max(0, 1 - progress / 0.14);
          u.uTextRise.value = (1 - reveal) * 0.25;
        }
        renderer.render(displayScene, camera);
      };

      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
        last = now;
        time += dt;
        resize();

        // Something always stirs: a slow ring from the flower and the odd drop elsewhere.
        if (time >= nextFlowerDrop) {
          addDrop({ x: flower.x, y: flower.y, radius: 0.05, strength: 0.006 });
          nextFlowerDrop = time + 2.6 + Math.random() * 1.4;
        }
        if (time >= nextIdleDrop) {
          addDrop({
            x: 0.5 + (Math.random() - 0.5) * scaleX * 0.9,
            y: 0.5 + (Math.random() - 0.5) * scaleY * 0.9,
            radius: 0.02,
            strength: 0.008,
          });
          nextIdleDrop = time + 3 + Math.random() * 4;
        }

        stepFlower(dt);
        stepBowls(dt);
        humBowls(dt);
        simulate();
        draw();
      };

      const start = () => {
        if (running) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(tick);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };

      resize();
      if (reducedMotion) {
        draw();
      } else {
        canvas.addEventListener("pointermove", onPointerMove, { passive: true });
        canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
        canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchmove", onTouchMove, { passive: true });
        canvas.addEventListener("touchend", onTouchEnd, { passive: true });
      }
      canvas.style.opacity = "1";

      let textTexture: InstanceType<typeof THREE.CanvasTexture> | null = null;
      drawWordmark().then((wordmark) => {
        if (disposed || !wordmark) return;
        textTexture = new THREE.CanvasTexture(wordmark);
        displayMaterial.uniforms.uText.value = textTexture;
        textAspect = wordmark.width / wordmark.height;
        layoutText();
        textStart = time;
        setGlText(true);
        if (reducedMotion) draw();
      });

      const observer = new IntersectionObserver(([entry]) => {
        if (reducedMotion) return;
        if (entry.isIntersecting) start();
        else stop();
      });
      observer.observe(canvas);

      cleanup = () => {
        stop();
        observer.disconnect();
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
        iosSwitch?.remove();
        read.dispose();
        write.dispose();
        simMaterial.dispose();
        displayMaterial.dispose();
        textTexture?.dispose();
        geometry.dispose();
        renderer.dispose();
        audio?.close().catch(() => {});
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,#1f5552_0%,#0e3537_45%,#06191b_100%)]">
      <canvas
        ref={canvasRef}
        aria-label="Still water with a floating white flower and five brass singing bowls. Move or touch to make ripples; tap the water to hear a drop, or a bowl to hear it ring."
        className="block h-full w-full opacity-0 transition-opacity duration-700"
      />
      {/* Real heading for readers and search; shown as plain text until the water draws it. */}
      <h1
        className={
          glText
            ? "sr-only"
            : "pointer-events-none absolute bottom-[4%] left-[3%] font-serif text-6xl leading-[0.85] text-[#f4f2ea] md:text-8xl"
        }
      >
        <span className="block text-[0.4em] italic">{SUB_LINE}</span> {MAIN_LINE}
      </h1>
    </div>
  );
}
