/* Partículas da página inteira (Three.js + GSAP).
   Uma tela fixa atrás de todo o conteúdo. As mesmas partículas mudam de desenho conforme
   a seção que está na tela:
     capa        um globo pontilhado (os continentes, do Natural Earth) virado para as Américas,
                 com os estados dos clientes acesos e três rotas Brasil ↔ EUA correndo por cima
                 (uma segunda nuvem de pontos com shader próprio). Os nomes dos lugares são HTML
                 preso aos pontos 3D a cada quadro. Clicar troca para 鈴木, a marca e 恵二;
                 arrastar gira
     perfil      鈴木
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
   Em toda a página o cursor afasta e azula as partículas e a rolagem agita e gira o desenho.
   Compilado com esbuild para ../hero3d.js (ver README.md desta pasta).
   Sem WebGL ou com "reduzir movimento", a capa fica com a marca em SVG e nada disto roda. */
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute,
  Points, ShaderMaterial, AdditiveBlending, Color, Vector2, Vector3, Group
} from 'three';
import { TERRA } from './terra.js';

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
// cada forma devolve { pos: x,y,z por partícula (mais ou menos entre -1 e 1), cor: 0 papel … 1 azul }
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

// ------------------------------------------------------------------ globo da capa
// virado para as Américas: o centro da tela fica no Atlântico, entre os EUA e o Brasil
const LON0 = -60, LAT0 = 8;
const RAD = Math.PI / 180;
function geoXYZ(lat, lon, r = 1) {
  const la = lat * RAD, lo = (lon - LON0) * RAD;
  const x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo);
  const t = LAT0 * RAD, ct = Math.cos(t), st = Math.sin(t);
  return [x * r, (y * ct - z * st) * r, (y * st + z * ct) * r];
}
// onde estão os clientes (os mesmos lugares que a página cita)
const CIDADES = [
  { id: 'ma', lat: 42.3, lon: -71.8 },  // Art 7 Epoxy
  { id: 'fl', lat: 26.1, lon: -80.2 },  // Couponlandia
  { id: 'go', lat: -16.7, lon: -49.3 }, // BR Oxigênio
  { id: 'pr', lat: -24.3, lon: -50.6 }, // Center Conveniência
  { id: 'sc', lat: -27.2, lon: -48.6 }  // DUACT e V.BIKE
];
const ARCOS = [['sc', 'ma'], ['pr', 'fl'], ['go', 'ma']];
let terraCache = null;
function terra() {
  if (terraCache) return terraCache;
  const bin = atob(TERRA);
  const n = bin.length / 3;
  const pts = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    pts[i * 2] = bin.charCodeAt(i * 3) / 2 - 90;
    pts[i * 2 + 1] = ((bin.charCodeAt(i * 3 + 1) << 8) | bin.charCodeAt(i * 3 + 2)) / 2 - 180;
  }
  return (terraCache = pts);
}
// cor: 0 papel, 1 azul-aço; negativo apaga a partícula (a malha fica mais fraca que a terra)
function fGlobo(n) {
  const pts = terra();
  const total = pts.length / 2;
  return forma(n, () => {
    const q = Math.random();
    if (q < 0.7) { // terra
      const j = (Math.random() * total) | 0;
      return geoXYZ(pts[j * 2] + gauss() * 0.55, pts[j * 2 + 1] + gauss() * 0.55, 1 + gauss() * 0.004).concat(0);
    }
    if (q < 0.9) { // malha: meridianos e paralelos de 30 em 30 graus
      if (Math.random() < 0.5) return geoXYZ(rnd(-80, 80), Math.round(rnd(-6, 6)) * 30 + gauss() * 0.15).concat(-0.75);
      return geoXYZ(Math.round(rnd(-2.5, 2.5)) * 30 + gauss() * 0.15, rnd(-180, 180)).concat(-0.75);
    }
    const c = CIDADES[(Math.random() * CIDADES.length) | 0]; // os clientes, acesos
    return geoXYZ(c.lat + gauss() * 1.1, c.lon + gauss() * 1.1, 1.01).concat(1);
  });
}
// rotas Brasil ↔ EUA: arcos de círculo máximo que sobem do globo, com um pulso correndo
function fArcos(porArco) {
  const pos = new Float32Array(ARCOS.length * porArco * 3);
  const t = new Float32Array(ARCOS.length * porArco);
  const off = new Float32Array(ARCOS.length * porArco);
  const acha = (id) => CIDADES.find((c) => c.id === id);
  ARCOS.forEach(([a, b], k) => {
    const A = new Vector3(...geoXYZ(acha(a).lat, acha(a).lon));
    const B = new Vector3(...geoXYZ(acha(b).lat, acha(b).lon));
    const ang = A.angleTo(B);
    for (let i = 0; i < porArco; i++) {
      const u = i / (porArco - 1);
      // slerp à mão: (sin((1-u)θ)A + sin(uθ)B) / sin θ
      const v = A.clone().multiplyScalar(Math.sin((1 - u) * ang)).add(B.clone().multiplyScalar(Math.sin(u * ang))).divideScalar(Math.sin(ang));
      v.normalize().multiplyScalar(1 + Math.sin(Math.PI * u) * ang * 0.22);
      const j = k * porArco + i;
      pos[j * 3] = v.x + gauss() * 0.002; pos[j * 3 + 1] = v.y + gauss() * 0.002; pos[j * 3 + 2] = v.z;
      t[j] = u;
      off[j] = k / ARCOS.length;
    }
  });
  return { pos, t, off };
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
  uniform float uFace;
  uniform float uClaro;
  attribute vec3 aStart;
  attribute vec3 aTo;
  attribute float aCorDe;
  attribute float aCorPara;
  attribute vec4 aRand;
  varying float vBright;
  varying float vAlpha;
  varying float vAo;
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
    pos += onda * (0.004 + 0.008 * aRand.w + uAgito * 0.12 * (0.3 + aRand.y));
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
    // o lado de trás do globo apaga: profundidade em relação ao centro do desenho, em raios
    vec4 c0 = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float esc = length((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
    float frente = (mv.z - c0.z) / max(esc, 0.0001);
    float face = mix(1.0, 0.12 + 0.88 * smoothstep(-0.25, 0.55, frente), uFace);
    vBright = aRand.w + f * 0.8 + bf * 0.6 + uClaro * 0.55;
    vAo = clamp(max(cor, 0.0) * 0.9 + f * 0.55 + bf * 0.4, 0.0, 1.0);
    // cor negativa = ponto mais fraco (a malha do globo)
    vAlpha = mix(0.35, 1.0, p) * face * (1.0 + min(cor, 0.0) * 0.72);
  }
`;

const FRAG = /* glsl */`
  uniform vec3 uCorA;
  uniform vec3 uCorB;
  uniform vec3 uCorAo;
  uniform float uAlfa;
  varying float vBright;
  varying float vAlpha;
  varying float vAo;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.0, length(c));
    a *= a;
    vec3 cor = mix(uCorA, uCorB, clamp(vBright * 0.85, 0.0, 1.0));
    cor = mix(cor, uCorAo, vAo);
    gl_FragColor = vec4(cor, a * vAlpha * uAlfa);
  }
`;

// rotas: um rastro fraco e um pulso que corre de uma ponta à outra; uRevela desenha o arco na entrada
const VERT_ARCO = /* glsl */`
  uniform float uTime;
  uniform float uPixel;
  uniform float uSize;
  uniform float uRevela;
  attribute float aT;
  attribute float aOff;
  varying float vPulso;
  varying float vVis;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float fase = fract(uTime * 0.16 + aOff);
    float dd = aT - fase;
    vPulso = smoothstep(0.07, 0.0, abs(dd)) * step(dd, 0.0) + smoothstep(0.015, 0.0, abs(dd));
    vec4 c0 = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float esc = length((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
    float frente = (mv.z - c0.z) / max(esc, 0.0001);
    vVis = step(aT, uRevela) * (0.15 + 0.85 * smoothstep(-0.2, 0.5, frente));
    gl_PointSize = uSize * (0.7 + vPulso * 0.9) * uPixel * (2.6 / -mv.z);
  }
`;
const FRAG_ARCO = /* glsl */`
  uniform vec3 uCorB;
  uniform vec3 uCorAo;
  uniform float uAlfa;
  varying float vPulso;
  varying float vVis;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.0, length(c));
    vec3 cor = mix(uCorAo, uCorB, vPulso * 0.7);
    gl_FragColor = vec4(cor, a * (0.34 + vPulso * 0.66) * vVis * uAlfa);
  }
`;

// capa: a ordem do clique e o nome de cada desenho no botão
const CAPA = ['globo', 'suzuki', 'marca', 'keiji'];
const ROTULOS = {
  pt: { globo: 'globo', suzuki: '鈴木', marca: 'marca', keiji: '恵二' },
  en: { globo: 'globe', suzuki: '鈴木', marca: 'mark', keiji: '恵二' }
};
// tamanho de cada desenho da capa em alturas da caixa do globo (o globo tem raio 1)
const ESCALA_CAPA = { globo: 0.5, suzuki: 0.44, keiji: 0.44, marca: 0.44 };
// desenho e giro contínuo (3D) de cada seção
// só as formas em 3D giram sem parar; as planas voltam de frente e só balançam
const SECOES = {
  perfil: { forma: 'suzuki', giro: 0 },
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

const ALFA_SECAO = { ia: 0.62, stack: 0.4, cuoncient: 0.8, trajetoria: 0.6 };

// medidas que a seção "ao vivo" e o raio-X leem
const medidas = { fps: 0, pontos: 0, chamadas: 0, forma: '', webgl: '' };
window.__gl = medidas;

function iniciar() {
  if (!canvas || reduz || !temWebGL()) return;
  const celular = innerWidth < 760;
  const N = celular ? 7000 : 11000;
  const marca = fMarca(N);
  if (!marca) return;

  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  medidas.webgl = renderer.capabilities.isWebGL2 ? 'WebGL 2' : 'WebGL 1';
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
  const globo = fGlobo(N);
  const de = new BufferAttribute(globo.pos.slice(), 3);
  const para = new BufferAttribute(globo.pos.slice(), 3);
  const corDe = new BufferAttribute(globo.cor.slice(), 1);
  const corPara = new BufferAttribute(globo.cor.slice(), 1);
  const geo = new BufferGeometry();
  geo.setAttribute('position', de);
  geo.setAttribute('aTo', para);
  geo.setAttribute('aCorDe', corDe);
  geo.setAttribute('aCorPara', corPara);
  geo.setAttribute('aStart', new BufferAttribute(inicio, 3));
  geo.setAttribute('aRand', new BufferAttribute(rand, 4));

  // grafite e azul-aço: as mesmas cores dos tokens do CSS
  const COR_A = new Color('#4a5058'), COR_B = new Color('#e6e8ea'), COR_AO = new Color('#6a90b9');
  const uniforms = {
    uProg: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new Vector2(9, 9) },
    uPixel: { value: dpr },
    uSize: { value: celular ? 4.2 : 5.2 },
    uCorA: { value: COR_A },
    uCorB: { value: COR_B },
    uCorAo: { value: COR_AO },
    uT: { value: 1 },
    uBurst: { value: 0 },
    uBurstPos: { value: new Vector2(0, 0) },
    uAgito: { value: 0 },
    uFace: { value: 1 },
    uClaro: { value: 1 },
    uAlfa: { value: celular ? 0.62 : 0.85 }
  };
  const mat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const grupo = new Group();
  grupo.add(new Points(geo, mat));

  // rotas Brasil ↔ EUA, por cima do globo
  const POR_ARCO = celular ? 260 : 420;
  const arcos = fArcos(POR_ARCO);
  const geoArco = new BufferGeometry();
  geoArco.setAttribute('position', new BufferAttribute(arcos.pos, 3));
  geoArco.setAttribute('aT', new BufferAttribute(arcos.t, 1));
  geoArco.setAttribute('aOff', new BufferAttribute(arcos.off, 1));
  const uArco = {
    uTime: uniforms.uTime, uPixel: uniforms.uPixel, uSize: { value: celular ? 4.2 : 5.2 },
    uRevela: { value: 0 }, uCorB: uniforms.uCorB, uCorAo: uniforms.uCorAo, uAlfa: { value: 0 }
  };
  const matArco = new ShaderMaterial({ vertexShader: VERT_ARCO, fragmentShader: FRAG_ARCO, uniforms: uArco, transparent: true, depthWrite: false, blending: AdditiveBlending });
  const pontosArco = new Points(geoArco, matArco);
  grupo.add(pontosArco);
  medidas.pontos = N + arcos.t.length;

  // na capa o desenho fica preso à caixa do globo e rola com ela; nas outras seções fica parado na tela
  const ancora = new Group();
  ancora.add(grupo);
  scene.add(ancora);
  const preso = { v: 1 };

  // ---------------------------------------------------------- catálogo de formas
  const formas = { marca, globo, celular: fCelular(N), rede: fRede(N), medidores: fMedidores(N), linha: fLinha(N), cubo: fCubo(N), enso: fEnso(N) };
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
    atualizarBotao();
    // se a seção atual esperava um kanji, aplica agora
    if (secao) irParaSecao(secao, true);
  });

  // ---------------------------------------------------------- transição entre desenhos
  let atual = 'globo';
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
    medidas.forma = nome;
    const eGlobo = nome === 'globo';
    if (gsap) {
      gsap.to(uniforms.uFace, { value: eGlobo ? 1 : 0, duration: 1.2, ease: 'power2.out', overwrite: true });
      gsap.to(uniforms.uClaro, { value: eGlobo ? 1 : 0, duration: 1.2, ease: 'power2.out', overwrite: true });
      gsap.to(uArco.uAlfa, { value: eGlobo && secao === 'topo' ? 1 : 0, duration: eGlobo ? 1.2 : 0.4, delay: eGlobo ? 0.8 : 0, ease: 'power2.out', overwrite: true });
      gsap.fromTo(uniforms.uT, { value: 0 }, { value: 1, duration: 1.8, ease: 'power3.out', overwrite: true });
    } else {
      uniforms.uFace.value = eGlobo ? 1 : 0;
      uniforms.uClaro.value = eGlobo ? 1 : 0;
      uArco.uAlfa.value = eGlobo && secao === 'topo' ? 1 : 0;
      uniforms.uT.value = 1;
    }
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
  // a caixa do globo na capa, em coordenadas do mundo, com a página no topo
  let caixa = null;
  function medirCaixa() {
    const el = document.querySelector('.hero__globo');
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const r = el ? el.getBoundingClientRect() : null;
    if (!r || !r.width || !r.height || !W || !H) { caixa = null; return; }
    const cx = r.left + r.width / 2, cy = r.top + window.scrollY + r.height / 2;
    caixa = { x: (cx / W - 0.5) * largura, y: -(cy / H - 0.5) * altura, h: (Math.min(r.width, r.height) / H) * altura };
  }
  function lugar(id, nome) {
    const mob = canvas.clientWidth < 760;
    if (id === 'topo' && caixa) return { x: caixa.x, y: caixa.y, s: caixa.h * (ESCALA_CAPA[nome] || 0.44), a: mob ? 0.78 : 0.9 };
    if (id === 'topo') {
      return mob
        ? { x: largura * 0.1, y: altura * 0.2, s: Math.min(largura * 0.62, altura * 0.42) / 2, a: 0.7 }
        : { x: largura * 0.24, y: altura * 0.04, s: Math.min(largura * 0.4, altura * 0.78) / 2, a: 0.9 };
    }
    if (id === 'agenda') { // o relógio fica atrás da grade de horários: mais apagado para não competir com os pontos
      return mob
        ? { x: largura * 0.14, y: altura * 0.06, s: Math.min(largura * 0.7, altura * 0.42) / 2, a: 0.24 }
        : { x: largura * 0.28, y: -altura * 0.02, s: Math.min(largura * 0.34, altura * 0.62) / 2, a: 0.24 };
    }
    if (id === 'perfil') { // à direita do texto, longe da foto (que fica à esquerda)
      return mob
        ? { x: largura * 0.22, y: altura * 0.18, s: Math.min(largura * 0.5, altura * 0.32) / 2, a: 0.32 }
        : { x: largura * 0.3, y: -altura * 0.02, s: Math.min(largura * 0.3, altura * 0.56) / 2, a: 0.42 };
    }
    if (id === 'contato') { // o reel ocupa a direita: o carimbo fica entre o texto e o vídeo
      return mob
        ? { x: largura * 0.18, y: altura * 0.12, s: Math.min(largura * 0.5, altura * 0.32) / 2, a: 0.42 }
        : { x: largura * 0.13, y: -altura * 0.1, s: (altura * 0.42) / 2, a: 0.62 };
    }
    // seções com conteúdo na largura toda (fluxos, painel ao vivo) pedem o desenho mais apagado
    const k = ALFA_SECAO[id] || 1;
    return mob
      ? { x: largura * 0.14, y: altura * 0.06, s: Math.min(largura * 0.7, altura * 0.42) / 2, a: 0.38 * k }
      : { x: largura * 0.28, y: -altura * 0.02, s: Math.min(largura * 0.34, altura * 0.62) / 2, a: 0.62 * k };
  }
  function posicionar(id, instantaneo, nome) {
    const l = lugar(id, nome);
    const d = instantaneo || !gsap ? 0 : 1.4;
    if (!gsap) { grupo.position.set(l.x, l.y, 0); grupo.scale.setScalar(l.s); uniforms.uAlfa.value = l.a; return; }
    gsap.to(grupo.position, { x: l.x, y: l.y, duration: d, ease: 'power3.inOut', overwrite: true });
    gsap.to(grupo.scale, { x: l.s, y: l.s, z: l.s, duration: d, ease: 'power3.inOut', overwrite: true });
    gsap.to(uniforms.uAlfa, { value: l.a, duration: d, ease: 'power2.out', overwrite: true });
  }
  medir();
  medirCaixa();

  // ---------------------------------------------------------- seção atual
  let secao = null;
  let formaCapa = 'globo';
  const estado = { giro: 0, angulo: 0 };
  const disponivel = (nome) => nome === 'marca' || !!formas[nome];
  // forma 3D gira sem parar; forma plana (e o globo, que precisa mostrar as Américas) volta de frente
  function girar(g) {
    if (g) {
      if (gsap) gsap.to(estado, { giro: g, duration: 1.2, overwrite: true }); else estado.giro = g;
      return;
    }
    const volta = Math.PI * 2;
    const frente = Math.round(estado.angulo / volta) * volta;
    if (gsap) gsap.to(estado, { giro: 0, angulo: frente, duration: 1.4, ease: 'power3.inOut', overwrite: true });
    else { estado.giro = 0; estado.angulo = frente; }
  }
  function nomeCapa() { return disponivel(formaCapa) ? formaCapa : 'globo'; }
  function proximaCapa() {
    const i = CAPA.indexOf(nomeCapa());
    for (let k = 1; k <= CAPA.length; k++) { const n = CAPA[(i + k) % CAPA.length]; if (disponivel(n)) return n; }
    return nomeCapa();
  }
  function irParaSecao(id, forcar) {
    if (id === secao && !forcar) return;
    const primeira = secao === null;
    secao = id;
    document.documentElement.classList.toggle('na-capa', id === 'topo');
    const cfg = id === 'topo' ? { forma: nomeCapa(), giro: 0 } : (SECOES[id] || { forma: 'marca', giro: 0.05 });
    posicionar(id, primeira, cfg.forma);
    if (gsap && !primeira) gsap.to(preso, { v: id === 'topo' ? 1 : 0, duration: 1.4, ease: 'power3.inOut', overwrite: true });
    else preso.v = id === 'topo' ? 1 : 0;
    girar(cfg.giro);
    if (cfg.forma !== atual || id === 'agenda') irPara(cfg.forma, primeira ? null : { forca: 0.35 });
    else if (gsap) gsap.to(uArco.uAlfa, { value: id === 'topo' && atual === 'globo' ? 1 : 0, duration: 0.6, overwrite: true });
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
  medidas.forma = 'globo';
  const remedir = (instantaneo) => { medir(); medirCaixa(); if (secao) posicionar(secao, instantaneo, secao === 'topo' ? nomeCapa() : null); };
  addEventListener('resize', () => remedir(true));
  // o nome só ganha o tamanho final depois da fonte; isso pode mexer na caixa do globo
  document.addEventListener('gui:entrada', () => requestAnimationFrame(() => remedir(false)));
  addEventListener('load', () => remedir(false));

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
  // na capa vale o globo, mas não o texto nem os botões
  const sobreCapa = (alvo, l) => !alvo.closest('a,button,input,select,textarea,[role=button],.hero__main') && (!!alvo.closest('.hero__globo') || perto(l));
  let mouseLocal = null;
  const alvoRot = new Vector2(0, 0);
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') alvoRot.set(-((e.clientY / innerHeight) * 2 - 1) * 0.12, ((e.clientX / innerWidth) * 2 - 1) * 0.22);
    mouseLocal = local(e.clientX, e.clientY);
    if (hero) hero.classList.toggle('is-sobre-forma', secao === 'topo' && sobreCapa(e.target, mouseLocal));
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { mouseLocal = null; alvoRot.set(0, 0); });

  // ---------------------------------------------------------- capa: clicar troca, arrastar gira
  const botao = document.querySelector('.js-forma');
  const rotulo = document.querySelector('.js-forma-n');
  const idioma = () => ((document.documentElement.lang || 'pt').toLowerCase().indexOf('en') === 0 ? 'en' : 'pt');
  function atualizarBotao() {
    const atualNome = nomeCapa();
    const nome = ROTULOS[idioma()][atualNome];
    if (rotulo && rotulo.textContent !== nome) {
      rotulo.lang = atualNome === 'suzuki' || atualNome === 'keiji' ? 'ja' : idioma();
      if (gsap && window.ScrambleTextPlugin) gsap.to(rotulo, { duration: 0.6, scrambleText: { text: nome, chars: '鈴木恵二globemarc', speed: 0.7 }, overwrite: true });
      else rotulo.textContent = nome;
    }
    if (botao) botao.hidden = CAPA.filter(disponivel).length < 2;
  }
  new MutationObserver(atualizarBotao).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  function trocarCapa(ponto) {
    const prox = proximaCapa();
    if (prox === nomeCapa()) { uniforms.uBurstPos.value.copy(ponto || new Vector2()); if (gsap) gsap.fromTo(uniforms.uBurst, { value: 1 }, { value: 0, duration: 1.2, ease: 'expo.out' }); return; }
    formaCapa = prox;
    if (secao === 'topo') {
      posicionar('topo', false, prox);
      irPara(prox, { pos: ponto, forca: 1 });
      girar(0);
    }
    atualizarBotao();
  }
  botao?.addEventListener('click', () => trocarCapa(null));

  let arrasto = null;
  const giro = new Vector2(0, 0);
  const vel = new Vector2(0, 0);
  hero?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || secao !== 'topo') return;
    const l = local(e.clientX, e.clientY);
    if (!sobreCapa(e.target, l)) return;
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

  // ---------------------------------------------------------- nomes dos lugares, presos aos pontos 3D
  const rotulos = Array.from(document.querySelectorAll('.globo-rot [data-c]')).map((el) => {
    const c = CIDADES.find((x) => x.id === el.dataset.c);
    return c ? { el, v: new Vector3(...geoXYZ(c.lat, c.lon, 1.02)), w: new Vector3(), vis: -1 } : null;
  }).filter(Boolean);
  const centro = new Vector3();
  const lado = new Vector3();
  function rotularLugares() {
    if (!rotulos.length) return;
    const mostrar = secao === 'topo' && atual === 'globo' && uArco.uAlfa.value > 0.05 && canvas.clientWidth >= 760;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    centro.set(0, 0, 0).applyMatrix4(grupo.matrixWorld);
    const raio = lado.set(1, 0, 0).applyMatrix4(grupo.matrixWorld).sub(centro).length() || 1;
    rotulos.forEach((r) => {
      let vis = 0;
      if (mostrar) {
        r.w.copy(r.v).applyMatrix4(grupo.matrixWorld);
        const frente = (r.w.z - centro.z) / raio;
        vis = Math.max(0, Math.min(1, (frente - 0.25) / 0.3)) * uArco.uAlfa.value;
        r.w.project(camera);
        r.el.style.transform = 'translate3d(' + ((r.w.x + 1) / 2 * W).toFixed(1) + 'px,' + ((1 - r.w.y) / 2 * H).toFixed(1) + 'px,0)';
      }
      if (Math.abs(vis - r.vis) > 0.01) { r.el.style.opacity = vis.toFixed(2); r.vis = vis; }
    });
  }

  // ---------------------------------------------------------- montagem inicial
  let t0 = null;
  const comecar = () => {
    if (t0 !== null) return;
    t0 = performance.now();
    if (gsap) {
      gsap.to(uniforms.uProg, { value: 1, duration: 2.8, ease: 'power2.out' });
      gsap.to(uArco.uAlfa, { value: 1, duration: 1, delay: 1.2 });
      gsap.to(uArco.uRevela, { value: 1, duration: 1.8, delay: 1.2, ease: 'power2.inOut' });
    } else { uArco.uAlfa.value = 1; uArco.uRevela.value = 1; }
  };
  if (window.__guiEntrada) comecar();
  document.addEventListener('gui:entrada', comecar);
  setTimeout(comecar, 2200);

  // ---------------------------------------------------------- quadro
  let rodando = false;
  let antes = performance.now();
  let ultimoScroll = window.scrollY;
  let fpsAcum = 0, fpsQuadros = 0;
  const alvoMouse = new Vector2(9, 9);
  function quadro(agora) {
    rodando = false;
    if (document.hidden) return;
    const dtBruto = (agora - antes) / 1000;
    const dt = Math.min(dtBruto, 0.05);
    antes = agora;
    fpsAcum += dtBruto; fpsQuadros++;
    if (fpsAcum >= 0.5) { medidas.fps = Math.round(fpsQuadros / fpsAcum); fpsAcum = 0; fpsQuadros = 0; }
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
    const ry = alvoRot.y + Math.sin(uniforms.uTime.value * 0.25) * 0.1 + giro.y + estado.angulo;
    grupo.rotation.x += (rx - grupo.rotation.x) * 0.12;
    grupo.rotation.y += (ry - grupo.rotation.y) * 0.12;
    ancora.position.y = preso.v * window.scrollY * (altura / (canvas.clientHeight || 1));
    pontosArco.visible = uArco.uAlfa.value > 0.002;

    renderer.render(scene, camera);
    medidas.chamadas = renderer.info.render.calls;
    rotularLugares();
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
