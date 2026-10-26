/* Capa em Three.js: partículas que montam a marca da Cuoncient.
   Interações:
   - clicar (ou tocar) nas partículas troca o desenho: marca → 鈴木 → 恵二, com uma explosão
     que sai do ponto do clique;
   - arrastar gira o desenho em 3D, com inércia, e ele volta sozinho devagar;
   - rolar a capa reagrupa as partículas em 鈴木, e rolar rápido agita o enxame;
   - o cursor afasta e esquenta (avermelha) as partículas perto dele;
   - o botão "Trocar o desenho" faz a mesma troca pelo teclado.
   Compilado com esbuild para ../hero3d.js (ver README.md desta pasta).
   Sem WebGL ou com "reduzir movimento", a capa fica com a marca em SVG. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
  Points, ShaderMaterial, AdditiveBlending, Color, Vector2, Vector3, Group
} from 'three';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
// o GSAP chega por <script defer> antes deste módulo; sem ele, as transições rodam à mão
const gsap = window.gsap;
if (gsap && window.ScrambleTextPlugin) gsap.registerPlugin(window.ScrambleTextPlugin);
const canvas = document.getElementById('gl');
const hero = document.querySelector('.hero');
const PROF = 0.34; // espessura das formas no eixo z: é o que aparece quando o desenho gira

function temWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function sortear(cheios, n, W, H, sx, sy) {
  const total = cheios.length / 2;
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const j = (Math.random() * total) | 0;
    const x = cheios[j * 2] + Math.random() - 0.5;
    const y = cheios[j * 2 + 1] + Math.random() - 0.5;
    pts[i * 3] = (x / W - 0.5) * sx;
    pts[i * 3 + 1] = -(y / H - 0.5) * sy;
    pts[i * 3 + 2] = (Math.random() - 0.5) * PROF;
  }
  return pts;
}

function pixelsCheios(ctx, W, H) {
  const dados = ctx.getImageData(0, 0, W, H).data;
  const cheios = [];
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (dados[(y * W + x) * 4 + 3] > 140) cheios.push(x, y);
    }
  }
  return cheios;
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
  const cheios = pixelsCheios(ctx, S, S);
  if (!cheios.length) return null;
  return sortear(cheios, n, S, S, 2, 2);
}

// dois kanji na vertical, em Shippori Mincho; só roda se a fonte carregou de verdade
async function amostrarKanji(n, texto) {
  if (!document.fonts || !document.fonts.load) return null;
  const fonte = '700 380px "Shippori Mincho"';
  try {
    await Promise.race([
      document.fonts.load(fonte, texto),
      new Promise((_, nao) => setTimeout(nao, 5000))
    ]);
  } catch (e) { return null; }
  if (!document.fonts.check(fonte, texto)) return null;
  const W = 420, H = 840;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.font = fonte;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto[0], W / 2, H * 0.26);
  ctx.fillText(texto[1], W / 2, H * 0.74);
  const cheios = pixelsCheios(ctx, W, H);
  if (cheios.length / 2 < 500) return null;
  return sortear(cheios, n, W, H, 1.15, 2.3);
}

const VERT = /* glsl */`
  uniform float uProg;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixel;
  uniform float uSize;
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uT;
  uniform float uScroll;
  uniform float uBurst;
  uniform vec2 uBurstPos;
  uniform float uAgito;
  attribute vec3 aStart;
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec4 aRand;
  varying float vBright;
  varying float vAlpha;
  varying float vShu;
  void main() {
    // montagem inicial
    float p = clamp((uProg - aRand.x * 0.45) / 0.55, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 3.0);
    // troca de desenho (clique): cada partícula sai num tempo um pouco diferente
    float t = clamp((uT - aRand.z * 0.35) / 0.65, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 w = mix(uFrom, uTo, t);
    vec3 forma = position * w.x + aS1 * w.y + aS2 * w.z;
    forma.xy += (aRand.yw - 0.5) * 0.36 * sin(t * 3.14159);
    // rolagem: reagrupa em 鈴木
    float s = clamp((uScroll - aRand.z * 0.35) / 0.65, 0.0, 1.0);
    s = s * s * (3.0 - 2.0 * s);
    forma = mix(forma, aS1, s);
    forma.xy += (aRand.yw - 0.5) * 0.32 * sin(s * 3.14159);
    float vermelho = clamp(w.y + w.z + s, 0.0, 1.0);

    vec3 pos = mix(aStart, forma, p);
    // deriva lenta, mais forte quando a rolagem é rápida
    float tt = uTime * (0.35 + aRand.w * 0.3);
    vec3 onda = vec3(sin(tt + aRand.z * 6.2831), cos(tt * 0.9 + aRand.z * 4.0), sin(tt * 0.7 + aRand.z * 3.0));
    pos += onda * (0.006 + 0.012 * aRand.w + uAgito * 0.1 * (0.3 + aRand.y));
    // explosão a partir do clique
    vec2 bd = pos.xy - uBurstPos;
    float bl = length(bd);
    float bf = uBurst * exp(-bl * 1.4);
    pos.xy += (bd / max(bl, 0.0001)) * bf * (0.45 + aRand.y) * 0.95;
    pos.z += bf * (aRand.x - 0.5) * 1.8;
    // ponteiro
    vec2 d = pos.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(0.42, 0.0, dist);
    pos.xy += (d / max(dist, 0.0001)) * f * 0.16 * p;
    pos.z += f * 0.18 * p;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.y) * uPixel * (2.6 / -mv.z);
    vBright = aRand.w + f * 0.8 + bf * 0.6;
    vShu = clamp(vermelho * 0.85 + f * 0.55 + bf * 0.4, 0.0, 1.0);
    vAlpha = mix(0.35, 1.0, p);
  }
`;

const FRAG = /* glsl */`
  uniform vec3 uCorA;
  uniform vec3 uCorB;
  uniform vec3 uCorShu;
  uniform float uAlfa;
  varying float vBright;
  varying float vAlpha;
  varying float vShu;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float a = smoothstep(0.5, 0.0, r);
    a *= a;
    vec3 cor = mix(uCorA, uCorB, clamp(vBright * 0.85, 0.0, 1.0));
    cor = mix(cor, uCorShu, vShu);
    gl_FragColor = vec4(cor, a * vAlpha * uAlfa);
  }
`;

const NOMES = { pt: ['marca', '鈴木', '恵二'], en: ['mark', '鈴木', '恵二'] };
const PESOS = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

function iniciar() {
  if (!canvas || reduz || !temWebGL()) return;
  const celular = innerWidth < 760;
  const N = celular ? 5200 : 11000;
  const marca = amostrarMarca(N);
  if (!marca) return;

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
  geo.setAttribute('position', new BufferAttribute(marca, 3));
  geo.setAttribute('aStart', new BufferAttribute(inicio, 3));
  // enquanto a fonte não chega, os dois kanji valem a própria marca
  const s1 = new BufferAttribute(marca.slice(), 3);
  const s2 = new BufferAttribute(marca.slice(), 3);
  geo.setAttribute('aS1', s1);
  geo.setAttribute('aS2', s2);
  geo.setAttribute('aRand', new BufferAttribute(rand, 4));

  const uniforms = {
    uProg: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new Vector2(9, 9) },
    uPixel: { value: dpr },
    uSize: { value: celular ? 4.2 : 5.2 },
    uCorA: { value: new Color('#8f877b') },
    uCorB: { value: new Color('#f6f1e8') },
    uCorShu: { value: new Color('#d4442c') },
    uFrom: { value: new Vector3(1, 0, 0) },
    uTo: { value: new Vector3(1, 0, 0) },
    uT: { value: 1 },
    uScroll: { value: 0 },
    uBurst: { value: 0 },
    uBurstPos: { value: new Vector2(0, 0) },
    uAgito: { value: 0 },
    uAlfa: { value: celular ? 0.62 : 0.85 }
  };
  const pronto = [true, false, false];
  amostrarKanji(N, '鈴木').then((pts) => { if (pts) { s1.array.set(pts); s1.needsUpdate = true; pronto[1] = true; atualizarBotao(); } });
  amostrarKanji(N, '恵二').then((pts) => { if (pts) { s2.array.set(pts); s2.needsUpdate = true; pronto[2] = true; atualizarBotao(); } });

  const mat = new ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms,
    transparent: true, depthWrite: false, blending: AdditiveBlending
  });
  const pontos = new Points(geo, mat);
  const grupo = new Group();
  grupo.add(pontos);
  scene.add(grupo);

  let escala = 1;
  let baseY = 0, pxMundo = 0;
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
    } else {
      escala = Math.min(largura * 0.4, altura * 0.78) / 2;
      grupo.position.set(largura * 0.24, altura * 0.04, 0);
    }
    grupo.scale.setScalar(escala);
    baseY = grupo.position.y;
    pxMundo = altura / Math.max(h, 1);
  }
  tamanho();
  addEventListener('resize', tamanho);

  // ponto da tela → coordenadas do plano do desenho
  const tmp = new Vector3();
  const dir = new Vector3();
  function local(cx, cy) {
    const r = canvas.getBoundingClientRect();
    const nx = ((cx - r.left) / r.width) * 2 - 1;
    const ny = -((cy - r.top) / r.height) * 2 + 1;
    tmp.set(nx, ny, 0.5).unproject(camera);
    dir.copy(tmp).sub(camera.position).normalize();
    const d = -camera.position.z / dir.z;
    tmp.copy(camera.position).addScaledVector(dir, d);
    grupo.worldToLocal(tmp);
    return new Vector2(tmp.x, tmp.y);
  }
  const perto = (l) => Math.abs(l.x) < 1.15 && Math.abs(l.y) < 1.3;

  // ---------------------------------------------------------------- ponteiro
  let mouseLocal = null;
  const alvoRot = new Vector2(0, 0);
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') {
      const nx = (e.clientX / innerWidth) * 2 - 1, ny = -(e.clientY / innerHeight) * 2 + 1;
      alvoRot.set(ny * 0.12, nx * 0.22);
    }
    if (!visivel) return;
    mouseLocal = local(e.clientX, e.clientY);
    if (hero) hero.classList.toggle('is-sobre-forma', perto(mouseLocal) && !e.target.closest('a,button'));
  }, { passive: true });
  hero?.addEventListener('pointerleave', () => { mouseLocal = null; alvoRot.set(0, 0); hero.classList.remove('is-sobre-forma'); });

  // ------------------------------------------------------- trocar o desenho
  let forma = 0;
  let tTroca = null;
  const botao = document.querySelector('.js-forma');
  const rotulo = document.querySelector('.js-forma-n');
  function idioma() { return (document.documentElement.lang || 'pt').toLowerCase().indexOf('en') === 0 ? 'en' : 'pt'; }
  function atualizarBotao() {
    const nome = NOMES[idioma()][forma];
    if (rotulo && rotulo.textContent !== nome) {
      if (gsap && window.ScrambleTextPlugin) gsap.to(rotulo, { duration: 0.6, scrambleText: { text: nome, chars: '鈴木恵二marcmk', speed: 0.7 }, overwrite: true });
      else rotulo.textContent = nome;
    }
    if (botao) botao.hidden = !(pronto[1] || pronto[2]);
  }
  new MutationObserver(atualizarBotao).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function pesoAtual() {
    const k = uniforms.uT.value;
    return new Vector3().copy(uniforms.uFrom.value).lerp(uniforms.uTo.value, k);
  }
  function trocar(ponto) {
    let prox = forma;
    do { prox = (prox + 1) % 3; } while (!pronto[prox] && prox !== forma);
    uniforms.uBurstPos.value.copy(ponto || new Vector2(0, 0));
    if (gsap) gsap.fromTo(uniforms.uBurst, { value: 1 }, { value: 0, duration: 1.2, ease: 'expo.out', overwrite: true });
    else uniforms.uBurst.value = 1;
    if (prox === forma) return;
    uniforms.uFrom.value.copy(pesoAtual());
    uniforms.uTo.value.set(...PESOS[prox]);
    forma = prox;
    if (gsap) {
      tTroca = 'gsap';
      gsap.fromTo(uniforms.uT, { value: 0 }, { value: 1, duration: 1.7, ease: 'power3.out', overwrite: true, onComplete: () => { tTroca = null; } });
    } else {
      uniforms.uT.value = 0;
      tTroca = performance.now();
    }
    // o carimbo da capa acompanha o desenho
    const selo = document.querySelector('.hanko__selo');
    if (gsap && selo) gsap.fromTo(selo, { scale: 1.25, rotate: -9 }, { scale: 1, rotate: -3, duration: 0.5, ease: 'back.out(3)', overwrite: true });
    atualizarBotao();
  }
  botao?.addEventListener('click', () => trocar(null));

  // --------------------------------------------- clicar troca, arrastar gira
  let arrasto = null;
  const giro = new Vector2(0, 0);
  const vel = new Vector2(0, 0);
  hero?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('a,button,input,select,textarea')) return;
    const l = local(e.clientX, e.clientY);
    if (!perto(l)) return;
    arrasto = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moveu: false, l };
  });
  addEventListener('pointermove', (e) => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    const dx = e.clientX - arrasto.x, dy = e.clientY - arrasto.y;
    arrasto.x = e.clientX; arrasto.y = e.clientY;
    if (!arrasto.moveu && Math.hypot(e.clientX - arrasto.sx, e.clientY - arrasto.sy) > 6) {
      arrasto.moveu = true;
      hero.classList.add('is-girando');
    }
    if (arrasto.moveu) {
      vel.set(dy * 0.005, dx * 0.009);
      giro.add(vel);
      giro.x = Math.max(-0.9, Math.min(0.9, giro.x));
    }
  }, { passive: true });
  function soltar(e) {
    if (!arrasto || (e && e.pointerId !== arrasto.id)) return;
    if (!arrasto.moveu && e && e.type === 'pointerup') trocar(arrasto.l);
    arrasto = null;
    hero.classList.remove('is-girando');
  }
  addEventListener('pointerup', soltar);
  addEventListener('pointercancel', () => { arrasto = null; hero?.classList.remove('is-girando'); });

  // a montagem começa junto com a entrada do nome
  let t0 = null;
  const comecar = () => {
    if (t0 !== null) return;
    t0 = performance.now();
    if (gsap) gsap.to(uniforms.uProg, { value: 1, duration: 2.8, ease: 'power2.out' });
  };
  if (window.__guiEntrada) comecar();
  document.addEventListener('gui:entrada', comecar);
  setTimeout(comecar, 2200);

  let visivel = true;
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => { visivel = es[0].isIntersecting; if (visivel) loop(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  let rodando = false;
  let antes = performance.now();
  let ultimoScroll = window.scrollY;
  const alvoMouse = new Vector2(9, 9);
  function quadro(agora) {
    rodando = false;
    if (!visivel || document.hidden) return;
    const dt = Math.min((agora - antes) / 1000, 0.05);
    antes = agora;
    uniforms.uTime.value += dt;
    if (t0 !== null && !gsap) uniforms.uProg.value = Math.min(1, (agora - t0) / 2600);
    if (typeof tTroca === 'number') {
      uniforms.uT.value = Math.min(1, (agora - tTroca) / 1500);
      if (uniforms.uT.value >= 1) tTroca = null;
    }
    if (!gsap) uniforms.uBurst.value *= Math.exp(-dt * 4.2);

    // rolar a capa reagrupa em 鈴木; rolar rápido agita
    if (pronto[1] && hero) {
      const alvoS = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.32)));
      uniforms.uScroll.value += (alvoS - uniforms.uScroll.value) * 0.08;
    }
    const vScroll = Math.abs(window.scrollY - ultimoScroll);
    ultimoScroll = window.scrollY;
    uniforms.uAgito.value += (Math.min(1, vScroll / 60) - uniforms.uAgito.value) * 0.12;
    // o grupo desce junto com parte da rolagem, para o 鈴木 ficar à vista enquanto se forma
    grupo.position.y = baseY - Math.min(window.scrollY, innerHeight) * pxMundo * 0.75;

    if (mouseLocal) alvoMouse.copy(mouseLocal); else alvoMouse.set(9, 9);
    uniforms.uMouse.value.lerp(alvoMouse, mouseLocal ? 0.18 : 0.05);

    // giro: inércia depois de soltar e volta lenta para a frente
    if (!arrasto) {
      giro.add(vel);
      vel.multiplyScalar(0.92);
      giro.multiplyScalar(0.985);
    }
    const rx = alvoRot.x + giro.x;
    const ry = alvoRot.y + Math.sin(uniforms.uTime.value * 0.25) * 0.08 + giro.y;
    grupo.rotation.x += (rx - grupo.rotation.x) * 0.12;
    grupo.rotation.y += (ry - grupo.rotation.y) * 0.12;

    renderer.render(scene, camera);
    loop();
  }
  function loop() {
    if (rodando) return;
    rodando = true;
    requestAnimationFrame(quadro);
  }
  document.documentElement.classList.add('gl-on');
  atualizarBotao();
  loop();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
