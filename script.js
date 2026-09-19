/* Cuoncient agency — interações mínimas */
(function () {
  // ano no rodapé
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Tudo que reage ao scroll mora numa função só, chamada uma vez por quadro
  // (ver "agendar", no fim do arquivo). Antes eram três listeners soltos e o
  // do WhatsApp chamava getBoundingClientRect a cada evento — numa página de
  // ~28.000px isso força recálculo de layout o tempo todo.
  var nav = document.getElementById('nav');
  var zap = document.querySelector('.zap');
  var rodape = document.querySelector('.footer');

  function aoRolar() {
    var y = window.scrollY;

    // nav "grudada" ao rolar
    if (nav) nav.classList.toggle('is-stuck', y > 40);

    // botão flutuante do WhatsApp. Duas regras:
    //  1. só entra depois que a capa sai da tela, para não tapar o hero de cara;
    //  2. sai de novo quando o rodapé aparece — lá ele cobria a linha do copyright
    //     e não faz falta, porque o rodapé já tem o link do WhatsApp.
    if (zap) {
      var passouDaCapa = y > window.innerHeight * 0.6;
      var chegouNoRodape = rodape && rodape.getBoundingClientRect().top < window.innerHeight - 40;
      zap.classList.toggle('is-in', passouDaCapa && !chegouNoRodape);
    }

    revelar();
  }

  // ----------------------------------------------------------------- menu
  // Painel de navegação do celular. Abaixo de 980px a barra do topo fica só
  // com a marca e este botão; as seções, o idioma e o CTA vivem no painel.
  //
  // O estado é um só — o aria-expanded do botão — e dele saem tanto o visual
  // (o CSS desenha o X a partir do atributo) quanto o anúncio do leitor de
  // tela. Com o painel fechado ele fica visibility:hidden, então os links
  // saem da ordem de tabulação sozinhos: ninguém tabula para dentro de um
  // menu invisível.
  var botaoMenu = document.getElementById('nav-toggle');
  var painelMenu = document.getElementById('nav-menu');
  var raiz = document.documentElement;
  var conteudo = document.getElementById('conteudo');
  var menuAberto = false;

  function rotularMenu() {
    if (!botaoMenu) return;
    var en = raiz.lang === 'en';
    botaoMenu.setAttribute('aria-label',
      menuAberto ? (en ? 'Close menu' : 'Fechar menu')
                 : (en ? 'Open menu' : 'Abrir menu'));
  }

  function abrirMenu(abrir) {
    if (!botaoMenu || !painelMenu) return;
    menuAberto = abrir;
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    painelMenu.classList.toggle('is-open', abrir);
    // trava a rolagem do fundo: sem isso a página desliza atrás do painel
    raiz.classList.toggle('menu-aberto', abrir);
    // Tira o resto da página da ordem de tabulação: sem isto o Tab sai do
    // painel e continua andando por 77 elementos que estão atrás dele.
    if (conteudo) conteudo.inert = abrir;
    if (rodape) rodape.inert = abrir;
    rotularMenu();
    // O foco espera um quadro: no instante do clique o painel ainda computa
    // visibility:hidden e focus() nao pega num elemento invisivel.
    if (abrir) window.requestAnimationFrame(function () {
      var primeiro = painelMenu.querySelector('a');
      if (primeiro) primeiro.focus();
    });
  }

  if (botaoMenu && painelMenu) {
    botaoMenu.addEventListener('click', function () { abrirMenu(!menuAberto); });

    // clicar numa seção fecha o painel: o alvo está atrás dele
    painelMenu.addEventListener('click', function (e) {
      if (menuAberto && e.target.closest('a')) abrirMenu(false);
    });

    // Esc fecha e devolve o foco para o botão, que é de onde a pessoa veio
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuAberto) { abrirMenu(false); botaoMenu.focus(); }
    });

    // girar o celular ou alargar a janela para o desktop não pode deixar a
    // rolagem travada com o painel já fora de cena
    window.addEventListener('resize', function () {
      if (menuAberto && window.innerWidth > 980) abrirMenu(false);
    }, { passive: true });
  }

  // --------------------------------------------------------------- idioma
  // Troca PT/EN sem recarregar a página.
  //
  // Como funciona: cada elemento traduzível carrega o inglês num atributo
  // `data-en`; o português é o que já está escrito no HTML. Na primeira troca
  // o português original é guardado em `data-pt`, então dá para ir e voltar
  // quantas vezes quiser sem perder nada.
  //
  // O português é o idioma do HTML servido — é ele que o Google indexa e o
  // que aparece na prévia do WhatsApp. O inglês vive só no navegador de quem
  // clicar. Se um dia o inglês precisar ranquear no Google, aí sim vale uma
  // página separada em /en/ com hreflang; isto aqui não substitui isso.
  var traduziveis = document.querySelectorAll('[data-en], [data-en-href]');
  var botoesIdioma = document.querySelectorAll('.lang__op');

  function aplicarIdioma(idioma) {
    var ing = idioma === 'en';
    traduziveis.forEach(function (el) {
      if (el.hasAttribute('data-en')) {
        if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
        el.innerHTML = ing ? el.dataset.en : el.dataset.pt;
      }
      if (el.hasAttribute('data-en-href')) {
        if (el.dataset.ptHref === undefined) el.dataset.ptHref = el.getAttribute('href');
        el.setAttribute('href', ing ? el.dataset.enHref : el.dataset.ptHref);
      }
    });

    // Os textos alternativos das imagens seguem um padrão, então dá para
    // traduzir os 55 de uma vez em vez de encher o HTML de atributos.
    document.querySelectorAll('img[alt]').forEach(function (img) {
      if (img.dataset.ptAlt === undefined) img.dataset.ptAlt = img.alt;
      var pt = img.dataset.ptAlt;
      img.alt = ing
        ? pt.replace(/^Home do site (.+)$/, 'Homepage of $1')
             .replace(/^Site (.+) no desktop$/, '$1 website on desktop')
             .replace(/^Site (.+) no celular$/, '$1 website on mobile')
        : pt;
    });

    document.documentElement.lang = ing ? 'en' : 'pt-BR';
    botoesIdioma.forEach(function (b) {
      // aria-pressed, não aria-current: estes são botões de alternância, e é
      // "pressed" que o leitor de tela anuncia como estado ligado/desligado.
      b.setAttribute('aria-pressed', String(b.dataset.lang === idioma));
    });
    if (typeof rotularMenu === 'function') rotularMenu();
    // a contagem do filtro é montada em JS, então precisa ser refeita ao trocar
    var g = document.querySelector('.proj-grid');
    if (g && g.dataset.filtro && typeof filtrar === 'function') filtrar(g.dataset.filtro);
    try { localStorage.setItem('cuoncient-idioma', idioma); } catch (e) { /* modo privado */ }
  }

  botoesIdioma.forEach(function (b) {
    b.addEventListener('click', function () { aplicarIdioma(b.dataset.lang); });
  });

  // Escolha inicial: o que a pessoa já escolheu antes; senão, o idioma do
  // navegador. Quem chega de fora do Brasil cai direto no inglês.
  var salvo = null;
  try { salvo = localStorage.getItem('cuoncient-idioma'); } catch (e) { /* modo privado */ }
  var doNavegador = (navigator.language || 'pt').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en';
  aplicarIdioma(salvo === 'pt' || salvo === 'en' ? salvo : doNavegador);

  // --------------------------------------------------------------- filtro
  // Grade de projetos por mercado. Cada card tem data-mercado="br" ou "eua";
  // aqui só se esconde o que não bate. Nada é recriado, então a animação de
  // entrada e as imagens já carregadas continuam como estavam.
  var filtroBotoes = document.querySelectorAll('.filtro__op');
  var cards = document.querySelectorAll('.proj-grid .proj');
  var conta = document.querySelector('.filtro__conta');

  function filtrar(mercado) {
    var visiveis = 0;
    cards.forEach(function (c) {
      var mostra = mercado === 'todos' || c.dataset.mercado === mercado;
      c.hidden = !mostra;
      if (mostra) visiveis++;
    });
    filtroBotoes.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mercado === mercado));
    });
    if (conta) {
      conta.textContent = document.documentElement.lang === 'en'
        ? visiveis + (visiveis === 1 ? ' project' : ' projects')
        : visiveis + (visiveis === 1 ? ' projeto' : ' projetos');
    }
    document.querySelector('.proj-grid').dataset.filtro = mercado;
  }

  filtroBotoes.forEach(function (b) {
    b.addEventListener('click', function () { filtrar(b.dataset.mercado); });
  });
  if (cards.length) filtrar('todos');

  // ---------------------------------------------------------------- reveal
  // Anima os blocos ao entrarem na tela.
  //
  // Já foi IntersectionObserver com threshold 0.08, e isso quebrou feio: a
  // grade de projetos, que no celular fica com uns 17.000px numa coluna só,
  // nunca conseguia mostrar 8% de si mesma (cabiam 4,4% da tela). Ela ficava
  // com opacity 0 para sempre — a seção inteira sumia no mobile.
  //
  // Baixar o threshold não bastou: em rolagem rápida ou pulo de âncora, o
  // observer entrega o elemento já com a tela passando por cima e alguns
  // blocos escapavam mesmo assim.
  //
  // Agora é uma varredura simples, presa ao scroll e limitada por
  // requestAnimationFrame. São ~20 elementos e cada um sai da lista assim que
  // aparece, então o custo vai a zero sozinho. Nenhuma dependência da altura
  // do bloco, nenhum caso de borda.
  var pendentes = [].slice.call(document.querySelectorAll('.reveal'));
  var agendado = false;

  function revelar() {
    var limite = window.innerHeight - 60;   // 60px de folga, para não disparar na borda
    for (var i = pendentes.length - 1; i >= 0; i--) {
      // topo acima do limite cobre os dois casos: entrando por baixo, e já
      // passado por cima (top negativo)
      if (pendentes[i].getBoundingClientRect().top < limite) {
        pendentes[i].classList.add('is-in');
        pendentes.splice(i, 1);
      }
    }
  }

  function agendar() {
    if (agendado) return;
    agendado = true;
    window.requestAnimationFrame(function () { agendado = false; aoRolar(); });
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  window.addEventListener('load', agendar);
  aoRolar();
})();
