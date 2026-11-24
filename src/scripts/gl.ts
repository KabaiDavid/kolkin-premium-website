// Tiny WebGL helper — one full-screen triangle, one fragment shader. No dependencies.
export interface GLScene {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  u: (name: string) => WebGLUniformLocation | null;
  resize: () => boolean;
  draw: () => void;
  destroy: () => void;
}

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float fbm(vec2 p){
  float s=0.0, a=0.5;
  mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<4;i++){ s+=a*snoise(p); p=r*p*2.03+3.1; a*=0.5; }
  return s;
}`;

export function createScene(canvas: HTMLCanvasElement, frag: string, maxDpr = 1.5, extensions: string[] = []): GLScene | null {
  const gl = (canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false }) ||
    canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  if (!gl) return null;
  for (const ext of extensions) if (!gl.getExtension(ext)) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[gl]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
    return cache.get(name)!;
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u('uRes'), w, h);
    return true;
  };
  resize();

  return {
    gl, program, u, resize,
    draw: () => gl.drawArrays(gl.TRIANGLES, 0, 3),
    destroy: () => { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}

/** Runs `frame` only while `el` is on screen and the tab is visible. */
export function visibleLoop(el: Element, frame: (t: number) => void, { still = false } = {}) {
  let raf = 0;
  let onScreen = false;
  const start = performance.now();
  const tick = (now: number) => {
    frame((now - start) / 1000);
    if (!still) raf = requestAnimationFrame(tick);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    if (onScreen && !document.hidden) raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); }, { rootMargin: '120px' });
  io.observe(el);
  document.addEventListener('visibilitychange', run);
  return { kick: () => { if (onScreen) requestAnimationFrame(tick); } };
}
