/* Partículas da página inteira (Three.js + GSAP).
   Uma tela fixa atrás de todo o conteúdo. As mesmas partículas mudam de desenho conforme
   a seção que está na tela:
     capa        marca da Cuoncient, 鈴木 ou 恵二 (clicar troca, arrastar gira)
     apps        um celular com a grade de ícones
     agentes     uma rede de agentes em 3D
     agenda      um relógio com a hora de Brasília
     cuoncient   a marca
     resultados  os três medidores (71, 80 e 98)
     experiência a linha de crescimento
     formação    学 (aprender)
     stack       uma grade cúbica em 3D
     princípios  um ensō, o círculo de tinta
     contato     o carimbo 鈴木
   Em toda a página o cursor afasta e avermelha as partículas e a rolagem agita e gira o desenho.
   Compilado com esbuild para ../hero3d.js (ver README.md desta pasta).
   Sem WebGL ou com "reduzir movimento", a capa fica com a marca em SVG e nada disto roda. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
  Points, ShaderMaterial, AdditiveBlending, Color, Vector2, Vector3, Group
} from 'three';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap; // chega por <script defer> antes deste módulo
if (gsap && window.ScrambleTextPlugin) gsap.registerPlugin(window.ScrambleTextPlugin);
const canvas = document.getElementById('gl');
const hero = document.querySelector('.hero');
const PROF = 0.34; // espessura das formas: é o que aparece quando o desenho gira

function temWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

// ------------------------------------------------------------------ formas
// cada forma devolve { pos: x,y,z por partícula (mais ou menos entre -1 e 1), cor: 0 papel … 1 vermelho }
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

function forma(n, fn) {
  const pos = new Float32Array(n * 3);
  const cor = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = fn(i, n);
    pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
    cor[i] = p[3] || 0;
  }
  return { pos, cor };
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

function deImagem(cheios, n, W, H, sx, sy, cor) {
  const total = cheios.length / 2;
  return forma(n, () => {
    const j = (Math.random() * total) | 0;
    const x = cheios[j * 2] + Math.random() - 0.5;
    const y = cheios[j * 2 + 1] + Math.random() - 0.5;
    return [(x / W - 0.5) * sx, -(y / H - 0.5) * sy, (Math.random() - 0.5) * PROF, cor];
  });
}

function fMarca(n) {
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
  return cheios.length ? deImagem(cheios, n, S, S, 2, 2, 0) : null;
}

async function carregarMincho(texto) {
  if (!document.fonts || !document.fonts.load) return false;
  const fonte = '700 380px "Shippori Mincho"';
  try {
    await Promise.race([document.fonts.load(fonte, texto), new Promise((_, nao) => setTimeout(nao, 6000))]);
  } catch (e) { return false; }
  return document.fonts.check(fonte, texto);
}

// um ou dois kanji (na vertical) em Shippori Mincho
function fKanji(n, texto, cor) {
  const dois = texto.length > 1;
  const W = 420, H = dois ? 840 : 420;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.font = '700 380px "Shippori Mincho"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (dois) { ctx.fillText(texto[0], W / 2, H * 0.26); ctx.fillText(texto[1], W / 2, H * 0.74); }
  else ctx.fillText(texto, W / 2, H / 2);
  const cheios = pixelsCheios(ctx, W, H);
  if (cheios.length / 2 < 500) return null;
  return dois ? deImagem(cheios, n, W, H, 1.15, 2.3, cor) : deImagem(cheios, n, W, H, 1.9, 1.9, cor);
}

// ponto num retângulo arredondado (contorno)
function contornoArredondado(hx, hy, r) {
  const retos = [2 * (hx - r), 2 * (hy - r)];
  const per = 2 * retos[0] + 2 * retos[1] + 2 * Math.PI * r;
  let d = Math.random() * per;
  const lados = [
    [retos[0], (t) => [-hx + r + t, hy]],
    [Math.PI * r / 2, (t) => { const a = t / r; return [hx - r + Math.sin(a) * r, hy - r + Math.cos(a) * r]; }],
    [retos[1], (t) => [hx, hy - r - t]],
    [Math.PI * r / 2, (t) => { const a = t / r; return [hx - r + Math.cos(a) * r, -hy + r - Math.sin(a) * r]; }],
    [retos[0], (t) => [hx - r - t, -hy]],
    [Math.PI * r / 2, (t) => { const a = t / r; return [-hx + r - Math.sin(a) * r, -hy + r - Math.cos(a) * r]; }],
    [retos[1], (t) => [-hx, -hy + r + t]],
    [Math.PI * r / 2, (t) => { const a = t / r; return [-hx + r - Math.cos(a) * r, hy - r + Math.sin(a) * r]; }]
  ];
  for (const [len, f] of lados) { if (d <= len) return f(d); d -= len; }
  return [hx, hy];
}

function fCelular(n) {
  const icones = [];
  for (let lin = 0; lin < 4; lin++) for (let col = 0; col < 3; col++) icones.push([-0.27 + col * 0.27, 0.5 - lin * 0.3]);
  return forma(n, () => {
    const q = Math.random();
    if (q < 0.4) { // carcaça, frente e verso
      const [x, y] = contornoArredondado(0.5, 1, 0.16);
      return [x + gauss() * 0.008, y + gauss() * 0.008, Math.random() < 0.5 ? -0.07 : 0.07, 0];
    }
    if (q < 0.45) return [rnd(-0.12, 0.12), -0.86 + gauss() * 0.006, 0.07, 0]; // barra inferior
    const k = (Math.random() * icones.length) | 0;
    const [cx, cy] = icones[k];
    return [cx + rnd(-0.09, 0.09), cy + rnd(-0.09, 0.09), rnd(-0.02, 0.05), k === 4 ? 1 : 0.12];
  });
}

function fRede(n) {
  const nos = [[0, 0, 0]];
  const M = 13;
  for (let i = 0; i < M; i++) { // espiral de Fibonacci numa esfera
    const y = 1 - (i / (M - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    nos.push([Math.cos(a) * r * 0.85, y * 0.85, Math.sin(a) * r * 0.85]);
  }
  const arestas = [];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  for (let i = 1; i < nos.length; i++) {
    const viz = nos.map((p, j) => [j, dist(nos[i], p)]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 3);
    viz.forEach(([j]) => { if (!arestas.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) arestas.push([i, j]); });
  }
  [1, 4, 8, 11].forEach((j) => arestas.push([0, j]));
  return forma(n, () => {
    if (Math.random() < 0.3) {
      const k = (Math.random() * nos.length) | 0;
      const p = nos[k];
      const raio = k === 0 ? 0.09 : 0.05;
      return [p[0] + gauss() * raio, p[1] + gauss() * raio, p[2] + gauss() * raio, 1];
    }
    const [a, b] = arestas[(Math.random() * arestas.length) | 0];
    const t = Math.random();
    const A = nos[a], B = nos[b];
    return [A[0] + (B[0] - A[0]) * t + gauss() * 0.006, A[1] + (B[1] - A[1]) * t + gauss() * 0.006, A[2] + (B[2] - A[2]) * t, 0.1];
  });
}

function horaBrasilia() {
  try {
    const p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
    return [+p.hour, +p.minute];
  } catch (e) { const d = new Date(); return [d.getHours(), d.getMinutes()]; }
}

function fRelogio(n) {
  const [h, m] = horaBrasilia();
  const aMin = (m / 60) * Math.PI * 2;
  const aHora = (((h % 12) + m / 60) / 12) * Math.PI * 2;
  const ponteiro = (a, comp, larg) => {
    const t = Math.random() * comp;
    const l = gauss() * larg;
    return [Math.sin(a) * t + Math.cos(a) * l, Math.cos(a) * t - Math.sin(a) * l, rnd(0, 0.06), 1];
  };
  return forma(n, () => {
    const q = Math.random();
    if (q < 0.46) { const a = Math.random() * Math.PI * 2; const r = 0.92 + gauss() * 0.02; return [Math.sin(a) * r, Math.cos(a) * r, gauss() * 0.04, 0]; }
    if (q < 0.6) { const k = (Math.random() * 12) | 0; const a = (k / 12) * Math.PI * 2; const r = rnd(0.74, 0.86); return [Math.sin(a) * r, Math.cos(a) * r, 0, k % 3 === 0 ? 0.6 : 0]; }
    if (q < 0.75) return ponteiro(aHora, 0.5, 0.025);
    if (q < 0.93) return ponteiro(aMin, 0.76, 0.016);
    return [gauss() * 0.05, gauss() * 0.05, 0.03, 1];
  });
}

function fMedidores(n) {
  const aneis = [[0.95, 0.71], [0.74, 0.8], [0.53, 0.98]];
  return forma(n, () => {
    const [r0, v] = aneis[(Math.random() * 3) | 0];
    const f = Math.random();
    const a = f * Math.PI * 2;
    const r = r0 + gauss() * 0.035;
    return [Math.sin(a) * r, Math.cos(a) * r, gauss() * 0.05, f <= v ? 1 : 0.05];
  });
}

function fLinha(n) {
  const P = [[-1, -0.62, -0.2], [-0.6, -0.48, -0.1], [-0.2, -0.12, 0], [0.2, 0.02, 0.05], [0.58, 0.42, 0.1], [0.95, 0.8, 0.2]];
  return forma(n, () => {
    if (Math.random() < 0.34) {
      const p = P[(Math.random() * P.length) | 0];
      return [p[0] + gauss() * 0.045, p[1] + gauss() * 0.045, p[2] + gauss() * 0.045, 1];
    }
    if (Math.random() < 0.12) return [rnd(-1, 1), -0.95 + gauss() * 0.006, 0, 0.05]; // eixo
    const k = (Math.random() * (P.length - 1)) | 0;
    const t = Math.random();
    const A = P[k], B = P[k + 1];
    return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t + gauss() * 0.008, A[2] + (B[2] - A[2]) * t, 0];
  });
}

function fCubo(n) {
  const L = 6;
  return forma(n, () => {
    const i = (Math.random() * (L + 1)) | 0, j = (Math.random() * (L + 1)) | 0, k = (Math.random() * (L + 1)) | 0;
    const g = (v) => (v / L - 0.5) * 1.4;
    const vermelho = (i + j + k) % 6 === 0 ? 1 : 0;
    return [g(i) + gauss() * 0.018, g(j) + gauss() * 0.018, g(k) + gauss() * 0.018, vermelho];
  });
}

function fEnso(n) {
  return forma(n, () => {
    const u = Math.random();
    const a = (0.12 + u * 0.82) * Math.PI * 2; // aberto no alto, à direita
    const larg = 0.02 + 0.11 * Math.pow(Math.sin(Math.PI * u), 0.8);
    const seco = Math.random() < 0.18 ? rnd(-1.6, 1.6) * larg : gauss() * larg;
    const r = 0.86 + seco;
    return [Math.sin(a) * r, Math.cos(a) * r, gauss() * 0.05, u > 0.92 ? 0.7 : 0];
  });
}

function fCarimbo(n, suzuki) {
  return forma(n, (i) => {
    if (Math.random() < 0.36 || !suzuki) {
      const [x, y] = contornoArredondado(0.6, 0.95, 0.08);
      return [x + gauss() * 0.02, y + gauss() * 0.02, gauss() * 0.04, 1];
    }
    const j = i * 3;
    return [suzuki.pos[j] * 0.66, suzuki.pos[j + 1] * 0.7, suzuki.pos[j + 2], 1];
  });
}

// ------------------------------------------------------------------ shader
const VERT = /* glsl */`
  uniform float uProg;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixel;
  uniform float uSize;
  uniform float uT;
  uniform float uBurst;
  uniform vec2 uBurstPos;
  uniform float uAgito;
  attribute vec3 aStart;
  attribute vec3 aTo;
  attribute float aCorDe;
  attribute float aCorPara;
  attribute vec4 aRand;
  varying float vBright;
  varying float vAlpha;
  varying float vShu;
  void main() {
    float p = clamp((uProg - aRand.x * 0.45) / 0.55, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 3.0);
    // troca de desenho: cada partícula sai num tempo um pouco diferente e se solta no meio do caminho
    float t = clamp((uT - aRand.z * 0.35) / 0.65, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 forma = mix(position, aTo, t);
    forma += vec3((aRand.yw - 0.5) * 0.5, (aRand.x - 0.5) * 0.4) * sin(t * 3.14159);
    float cor = mix(aCorDe, aCorPara, t);

    vec3 pos = mix(aStart, forma, p);
    float tt = uTime * (0.35 + aRand.w * 0.3);
    vec3 onda = vec3(sin(tt + aRand.z * 6.2831), cos(tt * 0.9 + aRand.z * 4.0), sin(tt * 0.7 + aRand.z * 3.0));
    pos += onda * (0.006 + 0.012 * aRand.w + uAgito * 0.12 * (0.3 + aRand.y));
    vec2 bd = pos.xy - uBurstPos;
    float bl = length(bd);
    float bf = uBurst * exp(-bl * 1.4);
    pos.xy += (bd / max(bl, 0.0001)) * bf * (0.45 + aRand.y) * 0.95;
    pos.z += bf * (aRand.x - 0.5) * 1.8;
    vec2 d = pos.xy - uMouse;
    float dist = length(d);
    float f = smoothstep(0.42, 0.0, dist);
    pos.xy += (d / max(dist, 0.0001)) * f * 0.16 * p;
    pos.z += f * 0.18 * p;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand.y) * uPixel * (2.6 / -mv.z);
    vBright = aRand.w + f * 0.8 + bf * 0.6;
    vShu = clamp(cor * 0.9 + f * 0.55 + bf * 0.4, 0.0, 1.0);
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
    float a = smoothstep(0.5, 0.0, length(c));
    a *= a;
    vec3 cor = mix(uCorA, uCorB, clamp(vBright * 0.85, 0.0, 1.0));
    cor = mix(cor, uCorShu, vShu);
    gl_FragColor = vec4(cor, a * vAlpha * uAlfa);
  }
`;

const NOMES = { pt: ['marca', '鈴木', '恵二'], en: ['mark', '鈴木', '恵二'] };
// desenho e giro contínuo (3D) de cada seção
// só as formas em 3D giram sem parar; as planas voltam de frente e só balançam
const SECOES = {
  apps: { forma: 'celular', giro: 0 },
  ia: { forma: 'rede', giro: 0.28 },
  agenda: { forma: 'relogio', giro: 0 },
  cuoncient: { forma: 'marca', giro: 0 },
  resultado: { forma: 'medidores', giro: 0 },
  trajetoria: { forma: 'linha', giro: 0 },
  formacao: { forma: 'manabu', giro: 0 },
  stack: { forma: 'cubo', giro: 0.4 },
  como: { forma: 'enso', giro: 0 },
  contato: { forma: 'carimbo', giro: 0 }
};

function iniciar() {
  if (!canvas || reduz || !temWebGL()) return;
  const celular = innerWidth < 760;
  const N = celular ? 5200 : 11000;
  const marca = fMarca(N);
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
  const de = new BufferAttribute(marca.pos.slice(), 3);
  const para = new BufferAttribute(marca.pos.slice(), 3);
  const corDe = new BufferAttribute(marca.cor.slice(), 1);
  const corPara = new BufferAttribute(marca.cor.slice(), 1);
  const geo = new BufferGeometry();
  geo.setAttribute('position', de);
  geo.setAttribute('aTo', para);
  geo.setAttribute('aCorDe', corDe);
  geo.setAttribute('aCorPara', corPara);
  geo.setAttribute('aStart', new BufferAttribute(inicio, 3));
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
    uT: { value: 1 },
    uBurst: { value: 0 },
    uBurstPos: { value: new Vector2(0, 0) },
    uAgito: { value: 0 },
    uAlfa: { value: celular ? 0.62 : 0.85 }
  };
  const mat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const grupo = new Group();
  grupo.add(new Points(geo, mat));
  scene.add(grupo);

  // ---------------------------------------------------------- catálogo de formas
  const formas = { marca, celular: fCelular(N), rede: fRede(N), medidores: fMedidores(N), linha: fLinha(N), cubo: fCubo(N), enso: fEnso(N) };
  let kanjiPronto = false;
  const formaDe = (nome) => {
    if (nome === 'relogio') return fRelogio(N); // a hora certa toda vez que a agenda aparece
    return formas[nome] || null;
  };
  carregarMincho('鈴木恵二学').then((ok) => {
    if (!ok) return;
    formas.suzuki = fKanji(N, '鈴木', 1);
    formas.keiji = fKanji(N, '恵二', 1);
    formas.manabu = fKanji(N, '学', 1);
    formas.carimbo = fCarimbo(N, formas.suzuki);
    kanjiPronto = !!formas.suzuki;
    atualizarBotao();
    // se a seção atual esperava um kanji, aplica agora
    if (secao && secao !== 'topo') irParaSecao(secao, true);
  });

  // ---------------------------------------------------------- transição entre desenhos
  let atual = 'marca';
  function irPara(nome, explosao) {
    const alvo = formaDe(nome) || marca;
    // posição atual de cada partícula vira o ponto de partida (sem salto, mesmo no meio de uma troca)
    const T = uniforms.uT.value;
    const a = de.array, b = para.array, ca = corDe.array, cb = corPara.array;
    for (let i = 0; i < N; i++) {
      let t = Math.min(1, Math.max(0, (T - rand[i * 4 + 2] * 0.35) / 0.65));
      t = t * t * (3 - 2 * t);
      const j = i * 3;
      a[j] += (b[j] - a[j]) * t; a[j + 1] += (b[j + 1] - a[j + 1]) * t; a[j + 2] += (b[j + 2] - a[j + 2]) * t;
      ca[i] += (cb[i] - ca[i]) * t;
    }
    b.set(alvo.pos); cb.set(alvo.cor);
    de.needsUpdate = para.needsUpdate = corDe.needsUpdate = corPara.needsUpdate = true;
    atual = nome;
    if (gsap) gsap.fromTo(uniforms.uT, { value: 0 }, { value: 1, duration: 1.8, ease: 'power3.out', overwrite: true });
    else uniforms.uT.value = 1;
    if (explosao) {
      uniforms.uBurstPos.value.copy(explosao.pos || new Vector2(0, 0));
      if (gsap) gsap.fromTo(uniforms.uBurst, { value: explosao.forca }, { value: 0, duration: 1.2, ease: 'expo.out', overwrite: true });
    }
  }

  // ---------------------------------------------------------- tamanho e lugar por seção
  let largura = 1, altura = 1;
  function medir() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    altura = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    largura = altura * camera.aspect;
  }
  function lugar(id) {
    const mob = canvas.clientWidth < 760;
    if (id === 'topo') {
      return mob
        ? { x: largura * 0.16, y: altura * 0.2, s: Math.min(largura * 0.62, altura * 0.42) / 2, a: 0.62 }
        : { x: largura * 0.24, y: altura * 0.04, s: Math.min(largura * 0.4, altura * 0.78) / 2, a: 0.85 };
    }
    if (id === 'agenda') { // o relógio fica atrás da grade de horários: mais apagado para não competir com os pontos
      return mob
        ? { x: largura * 0.14, y: altura * 0.06, s: Math.min(largura * 0.7, altura * 0.42) / 2, a: 0.24 }
        : { x: largura * 0.28, y: -altura * 0.02, s: Math.min(largura * 0.34, altura * 0.62) / 2, a: 0.36 };
    }
    if (id === 'contato') { // o reel ocupa a direita: o carimbo fica entre o texto e o vídeo
      return mob
        ? { x: largura * 0.18, y: altura * 0.12, s: Math.min(largura * 0.5, altura * 0.32) / 2, a: 0.42 }
        : { x: largura * 0.13, y: -altura * 0.1, s: (altura * 0.42) / 2, a: 0.62 };
    }
    return mob
      ? { x: largura * 0.14, y: altura * 0.06, s: Math.min(largura * 0.7, altura * 0.42) / 2, a: 0.38 }
      : { x: largura * 0.28, y: -altura * 0.02, s: Math.min(largura * 0.34, altura * 0.62) / 2, a: 0.62 };
  }
  function posicionar(id, instantaneo) {
    const l = lugar(id);
    const d = instantaneo || !gsap ? 0 : 1.4;
    if (!gsap) { grupo.position.set(l.x, l.y, 0); grupo.scale.setScalar(l.s); uniforms.uAlfa.value = l.a; return; }
    gsap.to(grupo.position, { x: l.x, y: l.y, duration: d, ease: 'power3.inOut', overwrite: true });
    gsap.to(grupo.scale, { x: l.s, y: l.s, z: l.s, duration: d, ease: 'power3.inOut', overwrite: true });
    gsap.to(uniforms.uAlfa, { value: l.a, duration: d, ease: 'power2.out', overwrite: true });
  }
  medir();

  // ---------------------------------------------------------- seção atual
  let secao = null;
  let formaCapa = 0; // 0 marca, 1 鈴木, 2 恵二
  const estado = { giro: 0, angulo: 0 };
  function nomeCapa() { return ['marca', 'suzuki', 'keiji'][formaCapa]; }
  function irParaSecao(id, forcar) {
    if (id === secao && !forcar) return;
    const primeira = secao === null;
    secao = id;
    const cfg = id === 'topo' ? { forma: nomeCapa(), giro: 0 } : (SECOES[id] || { forma: 'marca', giro: 0.05 });
    posicionar(id, primeira);
    if (cfg.giro) {
      if (gsap) gsap.to(estado, { giro: cfg.giro, duration: 1.2, overwrite: true }); else estado.giro = cfg.giro;
    } else {
      // forma plana: para de girar e volta de frente pelo caminho mais curto
      const volta = Math.PI * 2;
      const frente = Math.round(estado.angulo / volta) * volta;
      if (gsap) gsap.to(estado, { giro: 0, angulo: frente, duration: 1.4, ease: 'power3.inOut', overwrite: true });
      else { estado.giro = 0; estado.angulo = frente; }
    }
    if (cfg.forma !== atual || id === 'agenda') irPara(cfg.forma, primeira ? null : { forca: 0.35 });
  }
  const ids = ['topo'].concat(Object.keys(SECOES));
  const alvos = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) irParaSecao(en.target.id); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    alvos.forEach((el) => io.observe(el));
  }
  irParaSecao('topo');
  addEventListener('resize', () => { medir(); if (secao) posicionar(secao, true); });

  // ---------------------------------------------------------- ponteiro
  const tmp = new Vector3();
  const dir = new Vector3();
  function local(cx, cy) {
    const nx = (cx / canvas.clientWidth) * 2 - 1;
    const ny = -(cy / canvas.clientHeight) * 2 + 1;
    tmp.set(nx, ny, 0.5).unproject(camera);
    dir.copy(tmp).sub(camera.position).normalize();
    const d = -camera.position.z / dir.z;
    tmp.copy(camera.position).addScaledVector(dir, d);
    grupo.worldToLocal(tmp);
    return new Vector2(tmp.x, tmp.y);
  }
  const perto = (l) => Math.abs(l.x) < 1.15 && Math.abs(l.y) < 1.3;
  let mouseLocal = null;
  const alvoRot = new Vector2(0, 0);
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') alvoRot.set(-((e.clientY / innerHeight) * 2 - 1) * 0.12, ((e.clientX / innerWidth) * 2 - 1) * 0.22);
    mouseLocal = local(e.clientX, e.clientY);
    if (hero) hero.classList.toggle('is-sobre-forma', secao === 'topo' && perto(mouseLocal) && !e.target.closest('a,button'));
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { mouseLocal = null; alvoRot.set(0, 0); });

  // ---------------------------------------------------------- capa: clicar troca, arrastar gira
  const botao = document.querySelector('.js-forma');
  const rotulo = document.querySelector('.js-forma-n');
  const idioma = () => ((document.documentElement.lang || 'pt').toLowerCase().indexOf('en') === 0 ? 'en' : 'pt');
  function atualizarBotao() {
    const nome = NOMES[idioma()][formaCapa];
    if (rotulo && rotulo.textContent !== nome) {
      if (gsap && window.ScrambleTextPlugin) gsap.to(rotulo, { duration: 0.6, scrambleText: { text: nome, chars: '鈴木恵二marcmk', speed: 0.7 }, overwrite: true });
      else rotulo.textContent = nome;
    }
    if (botao) botao.hidden = !kanjiPronto;
  }
  new MutationObserver(atualizarBotao).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  function trocarCapa(ponto) {
    if (!kanjiPronto) { uniforms.uBurstPos.value.copy(ponto || new Vector2()); if (gsap) gsap.fromTo(uniforms.uBurst, { value: 1 }, { value: 0, duration: 1.2, ease: 'expo.out' }); return; }
    formaCapa = (formaCapa + 1) % 3;
    if (secao === 'topo') irPara(nomeCapa(), { pos: ponto, forca: 1 });
    const selo = document.querySelector('.hanko__selo');
    if (gsap && selo) gsap.fromTo(selo, { scale: 1.25, rotate: -9 }, { scale: 1, rotate: -3, duration: 0.5, ease: 'back.out(3)', overwrite: true });
    atualizarBotao();
  }
  botao?.addEventListener('click', () => trocarCapa(null));

  let arrasto = null;
  const giro = new Vector2(0, 0);
  const vel = new Vector2(0, 0);
  hero?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || secao !== 'topo' || e.target.closest('a,button,input,select,textarea')) return;
    const l = local(e.clientX, e.clientY);
    if (!perto(l)) return;
    arrasto = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moveu: false, l };
  });
  addEventListener('pointermove', (e) => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    const dx = e.clientX - arrasto.x, dy = e.clientY - arrasto.y;
    arrasto.x = e.clientX; arrasto.y = e.clientY;
    if (!arrasto.moveu && Math.hypot(e.clientX - arrasto.sx, e.clientY - arrasto.sy) > 6) { arrasto.moveu = true; hero.classList.add('is-girando'); }
    if (arrasto.moveu) { vel.set(dy * 0.005, dx * 0.009); giro.add(vel); giro.x = Math.max(-0.9, Math.min(0.9, giro.x)); }
  }, { passive: true });
  addEventListener('pointerup', (e) => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    if (!arrasto.moveu) trocarCapa(arrasto.l);
    arrasto = null; hero.classList.remove('is-girando');
  });
  addEventListener('pointercancel', () => { arrasto = null; hero?.classList.remove('is-girando'); });

  // ---------------------------------------------------------- montagem inicial
  let t0 = null;
  const comecar = () => {
    if (t0 !== null) return;
    t0 = performance.now();
    if (gsap) gsap.to(uniforms.uProg, { value: 1, duration: 2.8, ease: 'power2.out' });
  };
  if (window.__guiEntrada) comecar();
  document.addEventListener('gui:entrada', comecar);
  setTimeout(comecar, 2200);

  // ---------------------------------------------------------- quadro
  let rodando = false;
  let antes = performance.now();
  let ultimoScroll = window.scrollY;
  const alvoMouse = new Vector2(9, 9);
  function quadro(agora) {
    rodando = false;
    if (document.hidden) return;
    const dt = Math.min((agora - antes) / 1000, 0.05);
    antes = agora;
    uniforms.uTime.value += dt;
    if (t0 !== null && !gsap) uniforms.uProg.value = Math.min(1, (agora - t0) / 2600);
    if (!gsap) uniforms.uBurst.value *= Math.exp(-dt * 4.2);

    // rolagem: agita o enxame e dá um empurrão no giro
    const dS = window.scrollY - ultimoScroll;
    ultimoScroll = window.scrollY;
    uniforms.uAgito.value += (Math.min(1, Math.abs(dS) / 60) - uniforms.uAgito.value) * 0.12;
    if (!arrasto) vel.y += Math.max(-40, Math.min(40, dS)) * 0.00008;

    if (mouseLocal) alvoMouse.copy(mouseLocal); else alvoMouse.set(9, 9);
    uniforms.uMouse.value.lerp(alvoMouse, mouseLocal ? 0.18 : 0.05);

    if (!arrasto) { giro.add(vel); vel.multiplyScalar(0.92); giro.multiplyScalar(0.985); giro.y = Math.max(-0.8, Math.min(0.8, giro.y)); }
    estado.angulo += estado.giro * dt;
    const rx = alvoRot.x + giro.x;
    const ry = alvoRot.y + Math.sin(uniforms.uTime.value * 0.25) * 0.08 + giro.y + estado.angulo;
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { antes = performance.now(); loop(); } });
  document.documentElement.classList.add('gl-on');
  atualizarBotao();
  loop();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
