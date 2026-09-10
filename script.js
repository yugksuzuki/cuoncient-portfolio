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

  // reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
