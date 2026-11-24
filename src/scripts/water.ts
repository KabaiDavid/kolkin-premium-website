// Signature water — two lightweight fragment shaders.
//  1. Hero: the real aerial river photograph, brought to life with a flow-map
//     displacement restricted to water pixels and an art-directed tritone grade.
//  2. Eddy: a procedural Rankine vortex that, driven by scroll, turns from river
//     water to dark liquid, to coffee, to crema — and finally resolves into a cup.
import { createScene, visibleLoop, NOISE } from './gl';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────────── Hero ───────────── */
const HERO = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform sampler2D uTex; uniform vec2 uTexSize; uniform float uIn; uniform vec2 uFocus;
${NOISE}
vec2 cover(vec2 uv){
  float ra = uRes.x/uRes.y, ta = uTexSize.x/uTexSize.y;
  vec2 s = ra > ta ? vec2(1.0, ta/ra) : vec2(ra/ta, 1.0);
  return (uv - 0.5) * s + uFocus;
}
uniform sampler2D uMask;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1.0 - uv.y;
  float t = uTime;
  float zoom = 1.0 + 0.012*(1.0 - cos(t*0.07)) + 0.0*uIn;
  vec2 tuv = cover((uv-0.5)/zoom + 0.5);
  vec3 base = texture2D(uTex, tuv).rgb;
  float m = texture2D(uMask, tuv).r;
  // direction field: the river runs right → left, bending around the rock
  vec2 n = vec2(snoise(tuv*2.2 + vec2(0.0, t*0.02)), snoise(tuv*2.2 + vec2(5.2, -t*0.02)));
  vec2 dir = normalize(vec2(1.0, -0.12) + n*0.55);
  float sp = 0.045;
  float p0 = fract(t*sp), p1 = fract(t*sp + 0.5);
  float w = abs(1.0 - 2.0*p0);
  float amp = 0.016 * m;
  vec2 rip = vec2(snoise(tuv*38.0 + t*0.6), snoise(tuv*38.0 - t*0.6 + 3.0)) * 0.0016 * m;
  vec3 c0 = texture2D(uTex, tuv + dir*(p0-0.5)*amp + rip).rgb;
  vec3 c1 = texture2D(uTex, tuv + dir*(p1-0.5)*amp + rip).rgb;
  vec3 c = mix(c0, c1, 1.0 - w);
  c = mix(base, c, m);
  // (the tritone grade is baked into the texture so the poster <img> matches exactly)
  float l = dot(c, vec3(0.299,0.587,0.114));
  // shimmer on foam
  c += m * smoothstep(0.7, 1.0, l) * 0.05 * (0.5 + 0.5*snoise(tuv*60.0 + t*1.2));
  gl_FragColor = vec4(c, 1.0);
}`;

export function initHero(canvas: HTMLCanvasElement, poster: HTMLImageElement, maskSrc: string) {
  const scene = createScene(canvas, HERO, 1.5);
  if (!scene) return;
  const { gl, u, resize, draw } = scene;
  const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
  const upload = (img: HTMLImageElement, unit: number) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };
  const ready = poster.complete && poster.naturalWidth ? Promise.resolve(poster) : new Promise<HTMLImageElement>((r) => poster.addEventListener('load', () => r(poster), { once: true }));
  Promise.all([ready.then(() => load(poster.currentSrc || poster.src)), load(maskSrc)]).then(([img, mask]) => {
    upload(img, 0);
    upload(mask, 1);
    gl.uniform1i(u('uTex'), 0);
    gl.uniform1i(u('uMask'), 1);
    gl.uniform2f(u('uTexSize'), img.naturalWidth, img.naturalHeight);
    const focus = () => gl.uniform2f(u('uFocus'), innerWidth < 760 ? 0.44 : 0.5, 0.5);
    focus();
    const t0 = performance.now();
    visibleLoop(canvas, (t) => {
      if (resize()) focus();
      const intro = reduce ? 1 : Math.min(1, (performance.now() - t0) / 2600);
      gl.uniform1f(u('uIn'), 1 - Math.pow(1 - intro, 3));
      gl.uniform1f(u('uTime'), reduce ? 4.0 : t + 4.0);
      draw();
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    }, { still: reduce });
  }).catch(() => { /* poster image remains */ });
}

/* ───────────── Eddy ───────────── */
const EDDY = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uP; uniform vec2 uPtr; uniform vec2 uCupC;
${NOISE}
mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

// surface height of the swirling liquid. Rotation uses two crossfaded phases so the
// eddy turns forever without "winding up" into a hypnotic spiral.
float layer(vec2 q, float t, float ph, float cup){
  float r = length(q);
  float core = 0.24;
  float w = r < core ? r/core : core/r;
  w = w*w*(3.0 - 2.0*w);
  float ang = 1.5*w + (ph - 0.5)*1.1*w;           // fixed gentle curl + moving phase
  vec2 s = rot(ang) * q;
  vec2 drift = vec2((ph - 0.5)*0.5*(1.0 - w)*(1.0 - cup), 0.0); // river current outside the eddy
  vec2 p = (s + drift) * vec2(2.1, 3.0);            // stretched along the current
  vec2 warp = vec2(fbm(p*0.8 + vec2(0.0, t*0.02)), fbm(p*0.8 + vec2(4.1, -t*0.02)));
  return fbm(p + warp*1.1 + vec2(t*0.015, 0.0));
}
float field(vec2 q, float t, float cup){
  float sp = 0.06;
  float p0 = fract(t*sp), p1 = fract(t*sp + 0.5);
  float k = abs(1.0 - 2.0*p0);
  return mix(layer(q, t, p1, cup), layer(q, t, p0, cup), k);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  float t = uTime;
  float P = uP;
  float cup = smoothstep(0.76, 0.96, P);
  vec2 c = mix(vec2(0.2, 0.02) + uPtr*0.04, uCupC, smoothstep(0.4, 0.9, P));
  vec2 q = uv - c;
  float r = length(q);

  float h = field(q, t, cup);
  float e = 1.5 / min(uRes.x, uRes.y);
  vec2 g = vec2(field(q + vec2(e, 0.0), t, cup) - h, field(q + vec2(0.0, e), t, cup) - h) / e;
  g /= 1.0 + length(g)*0.12;                       // tame quad-derivative spikes
  vec3 nrm = normalize(vec3(-g, 7.0));
  vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
  float dif = clamp(dot(nrm, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, nrm), vec3(0.0,0.0,1.0)), 0.0, 1.0), 16.0);
  float hn = h*0.5 + 0.5;

  // stage palettes
  vec3 waterDeep = vec3(0.03,0.09,0.08), waterMid = vec3(0.15,0.29,0.25), foam = vec3(0.78,0.84,0.79);
  vec3 darkDeep = vec3(0.02,0.03,0.026), darkMid = vec3(0.12,0.1,0.075);
  vec3 cofDeep = vec3(0.045,0.026,0.016), cofMid = vec3(0.2,0.115,0.065), cofHi = vec3(0.44,0.28,0.17);
  vec3 creDark = vec3(0.42,0.24,0.11), creMid = vec3(0.72,0.5,0.29), creHi = vec3(0.92,0.8,0.62);

  vec3 water = mix(waterDeep, waterMid, smoothstep(0.25, 0.8, hn));
  float foamAmt = smoothstep(0.66, 0.86, hn) * (0.5 + 0.5*snoise(q*30.0 + t*0.4));
  water = mix(water, foam, foamAmt*0.8);
  vec3 dark = mix(darkDeep, darkMid, smoothstep(0.3, 0.9, hn));
  vec3 cof = mix(cofDeep, cofMid, smoothstep(0.2, 0.75, hn));
  cof = mix(cof, cofHi, smoothstep(0.75, 0.95, hn)*0.6);
  // crema: tiger-striping + micro-foam
  float stripe = smoothstep(0.35, 0.75, hn + 0.15*snoise(q*14.0));
  vec3 crema = mix(creDark, creMid, stripe);
  crema = mix(crema, creHi, smoothstep(0.72, 0.95, hn + 0.1*snoise(q*40.0 + 2.0)) * 0.8);
  crema *= 0.94 + 0.06*snoise(q*120.0);

  float s1 = smoothstep(0.36, 0.5, P), s2 = smoothstep(0.48, 0.64, P), s3 = smoothstep(0.7, 0.88, P);
  vec3 col = mix(water, dark, s1);
  col = mix(col, cof, s2);
  col = mix(col, crema, s3);

  float lightAmt = mix(1.0, 0.75, s3);
  col *= 0.72 + 0.42*dif*lightAmt;
  col += spec * mix(vec3(0.75,0.85,0.8), vec3(1.0,0.86,0.66), s2) * mix(0.28, 0.12, s3);
  // the eddy's calm centre
  col *= 1.0 - 0.18*smoothstep(0.2, 0.0, r)*(1.0 - s3);

  // resolve into a cup seen from above
  float R = mix(1.6, 0.36, cup);
  float inside = smoothstep(R + 0.004, R - 0.004, r);
  float rim = smoothstep(R + 0.07, R + 0.064, r) * (1.0 - inside);
  float rimShade = 0.82 + 0.18*dot(normalize(q + 1e-4), normalize(vec2(-0.5, 0.6)));
  vec3 bg = vec3(0.055, 0.067, 0.06);
  vec3 ceramic = vec3(0.93, 0.9, 0.84) * rimShade;
  float lip = smoothstep(R + 0.004, R + 0.016, r) * smoothstep(R + 0.07, R + 0.05, r);
  vec3 outC = mix(bg, ceramic, rim);
  outC = mix(outC, ceramic*0.86, lip*rim);
  // inner shadow cast by the rim onto the coffee
  col *= 1.0 - 0.45*cup*smoothstep(R - 0.09, R, r);
  // soft contact shadow of the cup on the table
  outC *= 1.0 - 0.35*cup*smoothstep(R + 0.25, R + 0.07, r)*(1.0 - rim);
  col = mix(outC, col, mix(1.0, inside, cup));

  // vignette
  col *= 1.0 - 0.35*smoothstep(0.45, 1.25, length(uv*vec2(0.85, 1.0)));
  gl_FragColor = vec4(col, 1.0);
}`;

export function initEddy(section: HTMLElement, canvas: HTMLCanvasElement) {
  // Liquid is soft by nature: render below CSS resolution and let the browser upscale.
  const scene = createScene(canvas, EDDY, innerWidth < 760 ? 0.7 : 0.6);
  if (!scene) {
    // Photographic fallback: river → cup, cross-faded by scroll progress.
    section.classList.add('no-gl');
    const set = () => {
      const r = section.getBoundingClientRect();
      section.style.setProperty('--p', Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))).toFixed(3));
    };
    addEventListener('scroll', set, { passive: true });
    set();
    return;
  }
  const { gl, u, resize, draw } = scene;
  let p = 0, pTarget = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

  const measure = () => {
    const rect = section.getBoundingClientRect();
    const total = rect.height - innerHeight;
    pTarget = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
  };
  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', measure);
  measure();
  p = pTarget;

  if (!reduce && matchMedia('(pointer: fine)').matches) {
    section.addEventListener('pointermove', (e) => {
      ptr.tx = (e.clientX / innerWidth - 0.5) * 2;
      ptr.ty = -(e.clientY / innerHeight - 0.5) * 2;
    });
  }

  const setCup = () => {
    const wide = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    // keep the final cup clear of the copy: left of centre on wide screens, raised on phones
    gl.uniform2f(u('uCupC'), wide > 1.2 ? -Math.min(0.32, (wide - 1) * 0.45) : 0, wide > 1.2 ? 0 : 0.16);
  };
  setCup();
  const loop = visibleLoop(canvas, (t) => {
    if (resize()) setCup();
    p += (pTarget - p) * (reduce ? 1 : 0.08);
    ptr.x += (ptr.tx - ptr.x) * 0.04;
    ptr.y += (ptr.ty - ptr.y) * 0.04;
    gl.uniform1f(u('uP'), p);
    gl.uniform2f(u('uPtr'), ptr.x, ptr.y);
    gl.uniform1f(u('uTime'), reduce ? 12.0 : t + 12.0);
    section.style.setProperty('--p', p.toFixed(4));
    draw();
  }, { still: reduce });
  addEventListener('scroll', () => loop.kick(), { passive: true });
  canvas.classList.add('is-ready');
}
