/* Capa em Three.js: partículas que montam a marca da Cuoncient.
   Compilado com esbuild para ../hero3d.js (ver README.md desta pasta).
   Sem WebGL ou com "reduzir movimento", a capa fica com a marca em SVG. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
  Points, ShaderMaterial, AdditiveBlending, Color, Vector2, Vector3, Group
} from 'three';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('gl');

function temWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function amostrarMarca(n) {
  const sym = document.querySelector('#marca path');
  if (!sym || typeof Path2D === 'undefined') return null;
  const S = 420;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const k = S / 337.6;
  ctx.setTransform(k, 0, 0, k, -92.05 * k, -93.6 * k);
  ctx.fillStyle = '#fff';
  ctx.fill(new Path2D(sym.getAttribute('d')), 'evenodd');
  const dados = ctx.getImageData(0, 0, S, S).data;
  const cheios = [];
  for (let y = 0; y < S; y += 1) {
    for (let x = 0; x < S; x += 1) {
      if (dados[(y * S + x) * 4 + 3] > 140) cheios.push(x, y);
    }
  }
  const total = cheios.length / 2;
  if (!total) return null;
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const j = (Math.random() * total) | 0;
    const x = cheios[j * 2] + Math.random() - 0.5;
    const y = cheios[j * 2 + 1] + Math.random() - 0.5;
    pts[i * 3] = (x / S - 0.5) * 2;
    pts[i * 3 + 1] = -(y / S - 0.5) * 2;
    pts[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
  }
  return pts;
}

const VERT = /* glsl */`
  uniform float uProg;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixel;
  uniform float uSize;
  attribute vec3 aStart;
  attribute vec4 aRand;
  varying float vBright;
  varying float vAlpha;
  void main() {
    float p = clamp((uProg - aRand.x * 0.45) / 0.55, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 3.0);
    vec3 pos = mix(aStart, position, p);
    float t = uTime * (0.35 + aRand.w * 0.3);
    pos += vec3(sin(t + aRand.z * 6.2831), cos(t * 0.9 + aRand.z * 4.0), sin(t * 0.7 + aRand.z * 3.0)) * (0.006 + 0.012 * aRand.w);
    vec2 d = pos.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(0.42, 0.0, dist);
    pos.xy += (d / max(dist, 0.0001)) * f * 0.16 * p;
    pos.z += f * 0.18 * p;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.y) * uPixel * (2.6 / -mv.z);
    vBright = aRand.w + f * 0.8;
    vAlpha = mix(0.35, 1.0, p);
  }
`;

const FRAG = /* glsl */`
  uniform vec3 uCorA;
  uniform vec3 uCorB;
  varying float vBright;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    vec3 cor = mix(uCorA, uCorB, clamp(vBright * 0.85, 0.0, 1.0));
    gl_FragColor = vec4(cor, a * vAlpha * 0.9);
  }
`;

function iniciar() {
  if (!canvas || reduz || !temWebGL()) return;
  const celular = innerWidth < 760;
  const N = celular ? 5200 : 11000;
  const alvo = amostrarMarca(N);
  if (!alvo) return;

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  const inicio = new Float32Array(N * 3);
  const rand = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    // começam espalhadas numa casca larga
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const rr = 2.2 + Math.random() * 2.4;
    inicio[i * 3] = rr * Math.sin(ph) * Math.cos(th);
    inicio[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th) * 0.7;
    inicio[i * 3 + 2] = rr * Math.cos(ph) * 0.6 - 0.5;
    rand[i * 4] = Math.random();
    rand[i * 4 + 1] = Math.random();
    rand[i * 4 + 2] = Math.random();
    rand[i * 4 + 3] = Math.pow(Math.random(), 2.2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(alvo, 3));
  geo.setAttribute('aStart', new BufferAttribute(inicio, 3));
  geo.setAttribute('aRand', new BufferAttribute(rand, 4));

  const uniforms = {
    uProg: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new Vector2(9, 9) },
    uPixel: { value: dpr },
    uSize: { value: celular ? 4.2 : 5.2 },
    uCorA: { value: new Color('#1aa5b8') },
    uCorB: { value: new Color('#e9fbff') }
  };
  const mat = new ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms,
    transparent: true, depthWrite: false, blending: AdditiveBlending
  });
  const pontos = new Points(geo, mat);
  const grupo = new Group();
  grupo.add(pontos);
  scene.add(grupo);

  let escala = 1;
  function tamanho() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // altura visível no plano z=0
    const altura = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const largura = altura * camera.aspect;
    if (w < 760) {
      escala = Math.min(largura * 0.62, altura * 0.42) / 2;
      grupo.position.set(largura * 0.16, altura * 0.2, 0);
      mat.opacity = 1;
    } else {
      escala = Math.min(largura * 0.4, altura * 0.78) / 2;
      grupo.position.set(largura * 0.24, altura * 0.04, 0);
    }
    grupo.scale.setScalar(escala);
  }
  tamanho();
  addEventListener('resize', tamanho);

  // ponteiro em coordenadas do plano da marca
  const ndc = new Vector2(9, 9);
  const alvoRot = new Vector2(0, 0);
  const tmp = new Vector3();
  const dir = new Vector3();
  function ponteiro(x, y) {
    ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    alvoRot.set(ndc.y * 0.12, ndc.x * 0.22);
  }
  addEventListener('pointermove', (e) => ponteiro(e.clientX, e.clientY), { passive: true });
  document.querySelector('.hero')?.addEventListener('pointerleave', () => { ndc.set(9, 9); alvoRot.set(0, 0); });

  // a montagem começa junto com a entrada do nome
  let t0 = null;
  const comecar = () => { if (t0 === null) t0 = performance.now(); };
  if (window.__guiEntrada) comecar();
  document.addEventListener('gui:entrada', comecar);
  setTimeout(comecar, 2200);

  let visivel = true;
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => { visivel = es[0].isIntersecting; if (visivel) loop(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  let rodando = false;
  let antes = performance.now();
  function quadro(agora) {
    rodando = false;
    if (!visivel || document.hidden) return;
    const dt = Math.min((agora - antes) / 1000, 0.05);
    antes = agora;
    uniforms.uTime.value += dt;
    if (t0 !== null) uniforms.uProg.value = Math.min(1, (agora - t0) / 2600);

    if (ndc.x < 5) {
      tmp.set(ndc.x, ndc.y, 0.5).unproject(camera);
      dir.copy(tmp).sub(camera.position).normalize();
      const d = -camera.position.z / dir.z;
      tmp.copy(camera.position).addScaledVector(dir, d);
      grupo.worldToLocal(tmp);
      uniforms.uMouse.value.lerp(new Vector2(tmp.x, tmp.y), 0.18);
    } else {
      uniforms.uMouse.value.lerp(new Vector2(9, 9), 0.05);
    }
    grupo.rotation.x += (alvoRot.x - grupo.rotation.x) * 0.05;
    grupo.rotation.y += (alvoRot.y + Math.sin(uniforms.uTime.value * 0.25) * 0.08 - grupo.rotation.y) * 0.05;

    renderer.render(scene, camera);
    loop();
  }
  function loop() {
    if (rodando) return;
    rodando = true;
    requestAnimationFrame(quadro);
  }
  document.documentElement.classList.add('gl-on');
  loop();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
