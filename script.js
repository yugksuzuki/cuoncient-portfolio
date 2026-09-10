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
