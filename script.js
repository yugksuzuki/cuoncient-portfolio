/* Cuoncient agency — interações mínimas */
(function () {
  // ano no rodapé
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // nav "grudada" ao rolar
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // botão flutuante do WhatsApp. Duas regras:
  //  1. só entra depois que a capa sai da tela, para não tapar o hero de cara;
  //  2. sai de novo quando o rodapé aparece — lá ele cobria a linha do copyright
  //     e não faz falta, porque o rodapé já tem o link do WhatsApp.
  var zap = document.querySelector('.zap');
  var rodape = document.querySelector('.footer');
  var onZap = function () {
    if (!zap) return;
    var passouDaCapa = window.scrollY > window.innerHeight * 0.6;
    var chegouNoRodape = rodape && rodape.getBoundingClientRect().top < window.innerHeight - 40;
    zap.classList.toggle('is-in', passouDaCapa && !chegouNoRodape);
  };
  window.addEventListener('scroll', onZap, { passive: true });
  onZap();

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
      b.setAttribute('aria-current', String(b.dataset.lang === idioma));
    });
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
    agendado = false;
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
    window.requestAnimationFrame(revelar);
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  window.addEventListener('load', agendar);
  revelar();
})();
