/* Service worker do currículo (escopo /gui/): o app instalado abre mesmo sem internet.
   Gerado por _src/build.sh a partir deste arquivo; 202610271012 é a versão do build, a mesma do ?v= dos arquivos.
   - A página (/gui/) vem da rede primeiro e cai no cache quando não há conexão.
   - CSS, JS, bibliotecas, foto e ícones: cache primeiro (o ?v= muda a cada build).
   - Fontes do Google: o cache responde e a rede atualiza por trás.
   - PDF, vídeo, APK, vCard e o axe-core passam direto: são grandes ou baixados de propósito. */
const V = '202610271012';
const CACHE = 'gui-' + V;
const FONTES = 'gui-fontes';
const PAGINA = '/gui/';
const ESSENCIAL = [
  PAGINA,
  '/gui/gui.css?v=' + V,
  '/gui/gui.js?v=' + V,
  '/gui/hero3d.js?v=' + V,
  '/gui/vendor/gsap.min.js',
  '/gui/vendor/ScrollTrigger.min.js',
  '/gui/vendor/SplitText.min.js',
  '/gui/vendor/ScrambleTextPlugin.min.js',
  '/gui/vendor/Flip.min.js',
  '/gui/vendor/DrawSVGPlugin.min.js',
  '/gui/vendor/lenis.min.js',
  '/gui/foto/guilherme-retrato.webp',
  '/gui/app/icone-192.png',
  '/gui/manifest.webmanifest',
  '/assets/brand/favicon.svg'
];
const PASSA_DIRETO = /\.(pdf|mp4|apk|vcf)$|\/axe\.min\.js$/;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESSENCIAL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('gui-') && n !== CACHE && n !== FONTES).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// a cópia sai antes de devolver a resposta: depois o navegador já consumiu o corpo
function guardar(cache, pedido, resposta) {
  if (resposta && resposta.ok) {
    const copia = resposta.clone();
    caches.open(cache).then((c) => c.put(pedido, copia));
  }
  return resposta;
}

self.addEventListener('fetch', (e) => {
  const pedido = e.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);

  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith(caches.match(pedido).then((tem) => {
      const rede = fetch(pedido).then((r) => guardar(FONTES, pedido, r)).catch(() => tem);
      return tem || rede;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (pedido.mode === 'navigate') {
    if (url.pathname !== PAGINA && url.pathname !== '/gui/index.html') return;
    e.respondWith(fetch(pedido).then((r) => guardar(CACHE, PAGINA, r)).catch(() => caches.match(PAGINA)));
    return;
  }
  if (PASSA_DIRETO.test(url.pathname)) return;
  if (!url.pathname.startsWith('/gui/') && !url.pathname.startsWith('/assets/brand/')) return;
  e.respondWith(caches.match(pedido).then((tem) => tem || fetch(pedido).then((r) => guardar(CACHE, pedido, r))));
});
