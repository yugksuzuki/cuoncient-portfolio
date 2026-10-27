/* Currículo do Gui — suzuki.cuoncient.com (também cuoncient.com/gui)
   Idioma, nome vivo, sistemas, fluxos dos agentes, agenda das automações, medidores, linha do
   tempo, raio-X (a tecnologia de cada parte) e o painel medido ao vivo.
   Tudo funciona sem este arquivo: ele só acrescenta. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var temGsap = typeof window.gsap !== 'undefined';
  var NASC = { a: 2000, m: 8, d: 21 };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ------------------------------------------------------------------ idioma */
  var lang = 'pt';
  var TEXTOS = {
    pt: {
      titulo: 'Currículo de Guilherme Keidi Suzuki',
      anos: function (n) { return n + ' anos'; },
      dias: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
      diasCurtos: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      agora: function (hm, dia, prox) {
        return 'Horário de Brasília: ' + dia + ', ' + hm + '. Próxima automação: ' + prox + '.';
      },
      proxFmt: function (nome, dia, hm, hoje, amanha) {
        var quando = hoje ? 'hoje' : amanha ? 'amanhã' : dia;
        return nome + ', ' + quando + ' às ' + hm;
      },
      em: function (min) {
        var d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
        if (d > 0) return 'em ' + d + (d > 1 ? ' dias' : ' dia') + (h ? ' e ' + h + ' h' : '');
        if (h > 0) return 'em ' + h + ' h' + (m ? ' ' + m + ' min' : '');
        return 'em ' + m + ' min';
      },
      proxima: 'próxima',
      dica: function (nome, dia, hm) { return nome + ': ' + dia + ' às ' + hm + '.'; },
      sistemas: function (n) { return n === 1 ? 'sistema' : 'sistemas'; },
      glOff: 'Three.js desligado (movimento reduzido ou sem WebGL)',
      axeCarrega: 'Carregando o axe-core…',
      axeRoda: 'Auditando a página…',
      axeDeNovo: 'Rodar de novo',
      axeFalhou: 'Não foi possível carregar o axe-core agora.',
      axeOk: function (pass, inc, ms) { return pass + ' regras aprovadas e ' + inc + ' para conferência manual, em ' + ms + ' ms.'; },
      axeRuim: function (ids) { return 'Regras com problema: ' + ids + '.'; }
    },
    en: {
      titulo: 'Guilherme Keidi Suzuki, résumé',
      anos: function (n) { return n + ' years old'; },
      dias: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      diasCurtos: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      agora: function (hm, dia, prox) {
        return 'Brasília time: ' + dia + ', ' + hm + '. Next automation: ' + prox + '.';
      },
      proxFmt: function (nome, dia, hm, hoje, amanha) {
        var quando = hoje ? 'today' : amanha ? 'tomorrow' : dia;
        return nome + ', ' + quando + ' at ' + hm;
      },
      em: function (min) {
        var d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
        if (d > 0) return 'in ' + d + (d > 1 ? ' days' : ' day') + (h ? ' ' + h + ' h' : '');
        if (h > 0) return 'in ' + h + ' h' + (m ? ' ' + m + ' min' : '');
        return 'in ' + m + ' min';
      },
      proxima: 'next',
      dica: function (nome, dia, hm) { return nome + ': ' + dia + ' at ' + hm + '.'; },
      sistemas: function (n) { return n === 1 ? 'system' : 'systems'; },
      glOff: 'Three.js off (reduced motion or no WebGL)',
      axeCarrega: 'Loading axe-core…',
      axeRoda: 'Auditing the page…',
      axeDeNovo: 'Run again',
      axeFalhou: 'Could not load axe-core right now.',
      axeOk: function (pass, inc, ms) { return pass + ' rules passed and ' + inc + ' left for manual review, in ' + ms + ' ms.'; },
      axeRuim: function (ids) { return 'Failing rules: ' + ids + '.'; }
    }
  };
  function T() { return TEXTOS[lang]; }

  var PARES = [
    ['en', 'innerHTML'],
    ['en-href', 'href'],
    ['en-label', 'aria-label'],
    ['en-title', 'title'],
    ['en-alt', 'alt'],
    ['en-tec', 'data-tec']
  ];
  function aplicarIdioma(novo) {
    lang = novo === 'en' ? 'en' : 'pt';
    PARES.forEach(function (par) {
      var attr = 'data-' + par[0], alvo = par[1];
      var orig = 'data-pt' + par[0].slice(2);
      $$('[' + attr + ']').forEach(function (el) {
        if (!el.hasAttribute(orig)) {
          el.setAttribute(orig, alvo === 'innerHTML' ? el.innerHTML : (el.getAttribute(alvo) || ''));
        }
        var valor = lang === 'en' ? el.getAttribute(attr) : el.getAttribute(orig);
        if (alvo === 'innerHTML') el.innerHTML = valor; else el.setAttribute(alvo, valor);
      });
    });
    doc.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.title = T().titulo;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    guardar('gui-lang', lang);
    idade();
    contarSistemas();
    agenda.atualizar();
  }

  /* ------------------------------------------------------------------- idade */
  function idade() {
    var hoje = partesBrasilia(new Date());
    var n = hoje.ano - NASC.a - ((hoje.mes < NASC.m || (hoje.mes === NASC.m && hoje.dia < NASC.d)) ? 1 : 0);
    $$('.js-idade').forEach(function (el) { el.textContent = T().anos(n); });
  }

  /* --------------------------------------------------------- hora de Brasília */
  var fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23', weekday: 'short'
  });
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function partesBrasilia(d) {
    var o = {};
    fmt.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return {
      ano: +o.year, mes: +o.month, dia: +o.day, h: +o.hour % 24, m: +o.minute, wd: WD[o.weekday]
    };
  }
  function hm(h, m) { return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }

  /* ------------------------------------------------------- agenda semanal */
  // dias: 0 = domingo ... 6 = sábado (como o Date). Horário de Brasília.
  var ROTINAS = [
    { id: 'nf', dias: [1, 2, 3, 4, 5], h: 6, m: 15, cor: 'var(--color-ao)', pt: 'Planilha de pedidos para tarefas de NF', en: 'Order sheet to invoice tasks' },
    { id: 'manha', dias: [1, 2, 3, 4, 5], h: 6, m: 40, cor: 'var(--color-ao-claro)', pt: 'Resumo da manhã', en: 'Morning brief' },
    { id: 'blog', dias: [1, 3, 5], h: 10, m: 0, cor: 'var(--color-papel)', pt: 'Motor do blog da Art 7', en: 'Art 7 blog engine' },
    { id: 'qa', dias: [1], h: 10, m: 0, cor: 'var(--color-nevoa)', pt: 'Vigia semanal das páginas', en: 'Weekly page watch' },
    { id: 'revisao', dias: [5], h: 21, m: 0, cor: 'var(--color-gin)', pt: 'Revisão semanal', en: 'Weekly review' }
  ];
  var ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]; // linhas: seg..dom

  // as faixas ficam a 9 px uma da outra: o clique e o toque pegam o ponto mais próximo (até 30 px),
  // em vez de deixar um alvo grande cobrir o vizinho. O teclado continua indo ponto a ponto.
  function maisPerto(trilho, x, y) {
    var melhor = null, dm = 30;
    $$('.ponto', trilho).forEach(function (p) {
      var b = p.getBoundingClientRect();
      var d = Math.sqrt(Math.pow(b.left + b.width / 2 - x, 2) + Math.pow(b.top + b.height / 2 - y, 2));
      if (d < dm) { dm = d; melhor = p; }
    });
    return melhor;
  }
  function miraNoTrilho(trilho) {
    var mirado = null;
    function mirar(p) {
      if (p === mirado) return;
      if (mirado) mirado.classList.remove('is-perto');
      mirado = p;
      if (p) p.classList.add('is-perto');
      trilho.classList.toggle('is-mira', !!p);
    }
    trilho.addEventListener('click', function (e) {
      if (e.target !== trilho) return; // o clique sintético do próprio ponto não volta para cá
      var p = maisPerto(trilho, e.clientX, e.clientY);
      if (p) p.click();
    });
    trilho.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') mirar(maisPerto(trilho, e.clientX, e.clientY)); });
    trilho.addEventListener('pointerleave', function () { mirar(null); });
  }

  var agenda = {
    montado: false,
    montar: function () {
      var box = $('#semana');
      if (!box) return;
      ORDEM_DIAS.forEach(function (wd, i) {
        var linha = document.createElement('div');
        linha.className = 'dia';
        linha.dataset.wd = wd;
        linha.innerHTML = '<span class="dia__n"></span><div class="dia__trilho"></div>';
        box.appendChild(linha);
        var trilho = linha.lastChild;
        miraNoTrilho(trilho);
        ROTINAS.forEach(function (r, faixa) {
          if (r.dias.indexOf(wd) < 0) return;
          var p = document.createElement('button');
          p.type = 'button';
          p.className = 'ponto';
          p.dataset.r = r.id;
          p.dataset.wd = wd;
          p.style.left = ((r.h * 60 + r.m) / 1440 * 100) + '%';
          p.style.top = (18 + faixa * 16) + '%'; // uma faixa por rotina, de 18% a 82%
          p.style.setProperty('--c', r.cor);
          p.addEventListener('click', function () { agenda.dica(p, r, wd); });
          trilho.appendChild(p);
        });
      });
      var agora = document.createElement('div');
      agora.className = 'agora';
      agora.innerHTML = '<span class="agora__rot"></span>';
      box.appendChild(agora);
      ROTINAS.forEach(function (r) {
        var li = $('.rotinas [data-r="' + r.id + '"]');
        if (li) li.style.setProperty('--c', r.cor);
      });
      this.montado = true;
      this.atualizar();
      var self = this;
      setInterval(function () { self.atualizar(); }, 30000);
    },
    proximas: function (agora) {
      // devolve, para cada rotina, quantos minutos faltam para a próxima execução
      var minAgora = agora.h * 60 + agora.m;
      return ROTINAS.map(function (r) {
        for (var off = 0; off <= 7; off++) {
          var wd = (agora.wd + off) % 7;
          if (r.dias.indexOf(wd) < 0) continue;
          var t = r.h * 60 + r.m;
          if (off === 0 && t <= minAgora) continue;
          return { r: r, falta: off * 1440 + t - minAgora, wd: wd, off: off };
        }
        return null;
      }).filter(Boolean).sort(function (a, b) { return a.falta - b.falta; });
    },
    atualizar: function () {
      var agora = partesBrasilia(new Date());
      var t = T();
      var prox = this.proximas(agora);
      var p0 = prox[0];
      var linhaAgora = $('.js-agora');
      if (linhaAgora && p0) {
        linhaAgora.textContent = t.agora(hm(agora.h, agora.m), t.dias[agora.wd],
          t.proxFmt(p0.r[lang], t.dias[p0.wd], hm(p0.r.h, p0.r.m), p0.off === 0, p0.off === 1));
      }
      prox.forEach(function (x) {
        var em = $('.rotinas [data-r="' + x.r.id + '"] .js-prox');
        if (em) em.textContent = t.proxima + ': ' + t.em(x.falta);
      });
      if (!this.montado) return;
      var minAgora = agora.h * 60 + agora.m;
      var idxHoje = ORDEM_DIAS.indexOf(agora.wd);
      $$('.dia').forEach(function (linha, i) {
        linha.classList.toggle('is-hoje', i === idxHoje);
        linha.querySelector('.dia__n').textContent = t.diasCurtos[i];
      });
      $$('.ponto').forEach(function (p) {
        var r = ROTINAS.filter(function (x) { return x.id === p.dataset.r; })[0];
        var wd = +p.dataset.wd;
        var i = ORDEM_DIAS.indexOf(wd);
        var passado = i < idxHoje || (i === idxHoje && r.h * 60 + r.m <= minAgora);
        p.classList.toggle('is-passado', passado);
        p.classList.toggle('is-prox', !!p0 && p0.r.id === r.id && p0.wd === wd);
        p.setAttribute('aria-label', r[lang] + ', ' + t.dias[wd] + ' ' + hm(r.h, r.m));
      });
      var ag = $('.agora');
      var trilho = $('.dia__trilho');
      var box = $('#semana');
      if (ag && trilho && box) {
        var bx = box.getBoundingClientRect(), tr = trilho.getBoundingClientRect();
        ag.style.left = (tr.left - bx.left + tr.width * minAgora / 1440 - 1) + 'px';
        ag.firstChild.textContent = hm(agora.h, agora.m);
      }
      if (this.sel) this.dica.apply(this, this.sel);
    },
    dica: function (el, r, wd) {
      this.sel = [el, r, wd];
      $$('.ponto.is-sel').forEach(function (p) { p.classList.remove('is-sel'); });
      el.classList.add('is-sel');
      var d = $('.js-dica');
      if (d) d.textContent = T().dica(r[lang], T().dias[wd], hm(r.h, r.m));
    }
  };

  /* ------------------------------------------------------------ sistemas */
  function contarSistemas() {
    var n = $$('.sis:not(.is-off)').length;
    var el = $('.js-nsis');
    if (el) {
      el.textContent = n;
      var rot = el.nextElementSibling;
      if (rot) rot.textContent = T().sistemas(n);
    }
  }
  function sistemas() {
    $$('.sis__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var painel = document.getElementById(btn.getAttribute('aria-controls'));
        var abrir = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(abrir));
        if (!temGsap || reduz) { painel.hidden = !abrir; return; }
        if (abrir) {
          painel.hidden = false;
          gsap.fromTo(painel, { opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.45, ease: 'expo.out', clearProps: 'clipPath,transform' });
        } else {
          gsap.to(painel, { opacity: 0, duration: 0.18, ease: 'power2.in', onComplete: function () { painel.hidden = true; gsap.set(painel, { clearProps: 'all' }); } });
        }
      });
    });
    var botoes = $$('.filtros button');
    botoes.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.dataset.filtro;
        botoes.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var itens = $$('.sis');
        var estado = (temGsap && window.Flip && !reduz) ? Flip.getState(itens) : null;
        itens.forEach(function (li) {
          var tags = (li.dataset.tags || '').split(' ');
          li.classList.toggle('is-off', f !== 'todos' && tags.indexOf(f) < 0);
        });
        contarSistemas();
        if (estado) {
          Flip.from(estado, {
            duration: 0.55, ease: 'power3.inOut', absolute: true, nested: true,
            onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.1 }); },
            onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: 0.25 }); }
          });
        }
        if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 650);
      });
    });
  }

  /* ---------------------------------------------------------------- nome vivo */
  function nome() {
    var h1 = $('#nome');
    if (!h1) return;
    // divide em letras (o aria-label do h1 guarda o nome inteiro para leitor de tela)
    $$('.nome__w', h1).forEach(function (w) {
      var txt = w.textContent;
      w.textContent = '';
      for (var i = 0; i < txt.length; i++) {
        var c = document.createElement('span');
        c.className = 'char';
        c.textContent = txt[i];
        w.appendChild(c);
      }
    });
    var chars = $$('.char', h1);

    function ajustar() {
      // maior tamanho em que a linha mais larga cabe no shell
      h1.style.fontSize = '';
      var base = parseFloat(getComputedStyle(h1).fontSize);
      var caixa = h1.parentElement.getBoundingClientRect().width;
      var celular = window.innerWidth < 640;
      var reserva = 0; // o retrato tem coluna própria no desktop e fica acima do nome no celular
      var maior = 0;
      $$('.nome__line', h1).forEach(function (l) {
        if (celular) {
          $$('.nome__w', l).forEach(function (w) { maior = Math.max(maior, w.getBoundingClientRect().width); });
        } else {
          maior = Math.max(maior, l.scrollWidth, $$('.nome__w', l).reduce(function (t, w) { return t + w.getBoundingClientRect().width; }, 0));
        }
      });
      if (!maior) return;
      var alvo = Math.min(base * (caixa - reserva) / maior, celular ? 112 : 150);
      h1.style.fontSize = Math.floor(alvo * 0.985) + 'px';
    }

    function revelar() {
      ajustar();
      h1.classList.add('is-pronto');
      var heroEl = $('.hero');
      if (heroEl) heroEl.classList.add('is-pronto');
      window.__guiEntrada = true;
      document.dispatchEvent(new CustomEvent('gui:entrada'));
      if (!temGsap || reduz) return;
      // as letras chegam condensadas e finas e abrem até a largura e o peso do nome (a voz da página);
      // power4.out é a curva de saída forte, a mesma família do cubic-bezier(.23,1,.32,1) do retrato
      var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(chars, { '--wd': 70, '--wg': 260, opacity: 0, yPercent: 26 },
        { '--wd': 104, '--wg': 520, opacity: 1, yPercent: 0, duration: 1.2, stagger: 0.03 })
        .from('.hero__role', { opacity: 0, y: 12, duration: 0.8 }, 0.45)
        .from('.hero__cta', { opacity: 0, y: 10, duration: 0.7 }, 0.58)
        .from('.hero__legenda', { opacity: 0, duration: 0.8 }, 1.6)
        .from('.hero__now', { opacity: 0, duration: 0.6 }, 0.9)
        .add(respirar, 1.4);
    }

    // respiração: uma onda lenta no eixo de largura passa pelas letras
    var respirando = false;
    function respirar() {
      if (respirando || reduz || !temGsap) return;
      respirando = true;
      var t0 = performance.now();
      var visivel = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }).observe(h1);
      }
      gsap.ticker.add(function () {
        if (!visivel || document.hidden) return;
        var t = (performance.now() - t0) / 1000;
        for (var i = 0; i < chars.length; i++) {
          chars[i].style.setProperty('--resp', (4 * Math.sin(t * 1.15 - i * 0.42)).toFixed(2));
        }
      });
    }

    var pronto = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var feito = false;
    function vai() { if (!feito) { feito = true; revelar(); } }
    pronto.then(vai);
    setTimeout(vai, 1600); // fonte lenta não segura o nome escondido

    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(ajustar, 120); });

    // lente: as letras perto do ponteiro condensam e engrossam
    if (!ponteiroFino || reduz || !temGsap) return;
    var hero = $('.hero');
    var centros = [];
    function medir() {
      centros = chars.map(function (c) { var r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY }; });
    }
    var setters = chars.map(function (c) {
      return { wd: gsap.quickTo(c, '--wd', { duration: 0.6, ease: 'power3' }), wg: gsap.quickTo(c, '--wg', { duration: 0.6, ease: 'power3' }) };
    });
    var medido = false;
    hero.addEventListener('pointermove', function (e) {
      if (!medido) { medir(); medido = true; }
      var y = e.clientY + window.scrollY;
      for (var i = 0; i < chars.length; i++) {
        var dx = e.clientX - centros[i].x, dy = y - centros[i].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / 260);
        k = k * k * (3 - 2 * k);
        setters[i].wd(104 - 34 * k);
        setters[i].wg(520 + 160 * k);
      }
    });
    hero.addEventListener('pointerleave', function () {
      setters.forEach(function (s) { s.wd(104); s.wg(520); });
    });
    window.addEventListener('resize', function () { medido = false; });
    window.addEventListener('scroll', function () { medido = false; }, { passive: true });
  }

  /* ------------------------------------------------- títulos que respiram */
  // a largura do título acompanha a rolagem: chega condensado e abre até a medida
  function titulos() {
    if (!temGsap || reduz || !window.ScrollTrigger) return;
    // fecho: as linhas do convite sobem por trás de uma máscara (SplitText)
    var fim = $('.fim__t');
    if (fim && window.SplitText) {
      gsap.registerPlugin(SplitText);
      var sp = new SplitText(fim, { type: 'lines', mask: 'lines', linesClass: 'fim__l' });
      gsap.from(sp.lines, {
        yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: fim, start: 'top 92%', once: true },
        onComplete: function () { sp.revert(); }
      });
    }
  }

  /* ------------------------------------------------------- botões magnéticos */
  function magneticos() {
    if (!ponteiroFino || reduz || !temGsap) return;
    $$('.js-ima').forEach(function (b) {
      var x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      var y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.22);
        y((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      b.addEventListener('pointerleave', function () { x(0); y(0); });
    });
  }

  /* ---------------------------------------------------------- parede de sites */
  // as três fileiras andam em sentidos alternados, presas à rolagem: parou de rolar, a parede para
  function parede() {
    var filas = $$('.parede__fila');
    if (!filas.length || !temGsap || reduz || !window.ScrollTrigger) return;
    var caixa = $('.parede');
    filas.forEach(function (f) {
      var trilho = $('.parede__trilho', f);
      var dir = +f.dataset.dir || 1;
      var dist = function () { return Math.max(0, trilho.scrollWidth - f.clientWidth); };
      gsap.fromTo(trilho,
        { x: function () { return dir > 0 ? 0 : -dist() * 0.5; } },
        { x: function () { return dir > 0 ? -dist() * 0.5 : 0; }, ease: 'none',
          scrollTrigger: { trigger: caixa, start: 'top bottom', end: 'bottom top', scrub: 0.8, invalidateOnRefresh: true } });
    });
  }

  /* ------------------------------------------------- carimbo no PDF */
  // baixar o currículo "carimba" o 鈴木 ao lado do botão, como o hanko que assina um documento
  function carimbo() {
    $$('.js-pdf').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = b.getBoundingClientRect();
        var c = document.createElement('span');
        c.className = 'carimbo';
        c.setAttribute('aria-hidden', 'true');
        c.lang = 'ja';
        c.textContent = '鈴木';
        document.body.appendChild(c);
        var w = c.offsetWidth, h = c.offsetHeight;
        var x = Math.min(window.innerWidth - w - 12, r.right - w * 0.35);
        var y = Math.max(8, r.top - h * 0.55);
        c.style.left = x + 'px';
        c.style.top = y + 'px';
        if (!temGsap) { setTimeout(function () { c.remove(); }, 1400); return; }
        var tl = gsap.timeline({ onComplete: function () { c.remove(); } });
        if (reduz) tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.2 }).to(c, { opacity: 0, duration: 0.3, delay: 0.9 });
        else tl.fromTo(c, { opacity: 0, scale: 1.7, rotate: -14 }, { opacity: 1, scale: 1, rotate: -4, duration: 0.32, ease: 'expo.out' })
               .to(c, { opacity: 0, y: -6, duration: 0.35, ease: 'power2.in', delay: 0.9 });
      });
    });
  }

  /* ------------------------------------------------- apps: o identificador */
  function apps() {
    var palco = $('.js-app-id');
    var itens = $$('.app');
    if (!palco || !itens.length || !('IntersectionObserver' in window)) return;
    var atual = null;
    var podeEmbaralhar = temGsap && !reduz && window.ScrambleTextPlugin;
    if (podeEmbaralhar) gsap.registerPlugin(ScrambleTextPlugin);
    function ativar(li) {
      if (li === atual) return;
      atual = li;
      itens.forEach(function (x) { x.classList.toggle('is-ativa', x === li); });
      var id = li.dataset.id;
      if (podeEmbaralhar) gsap.to(palco, { duration: 0.7, scrambleText: { text: id, chars: 'abcdefghijklmnopqrstuvwxyz.', speed: 0.6 }, ease: 'none', overwrite: true });
      else palco.textContent = id;
    }
    // o primeiro app já começa em foco, igual ao identificador que vem no HTML
    atual = itens[0];
    itens[0].classList.add('is-ativa');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) ativar(en.target); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    itens.forEach(function (li) { io.observe(li); });
  }

  /* ------------------------------------------------------ idiomas embaralham */
  function idiomas() {
    if (!temGsap || reduz || !window.ScrollTrigger || !window.ScrambleTextPlugin) return;
    gsap.registerPlugin(ScrambleTextPlugin);
    var lista = $('.idiomas');
    if (!lista) return;
    ScrollTrigger.create({
      trigger: lista, start: 'top 80%', once: true,
      onEnter: function () {
        $$('.js-scramble', lista).forEach(function (el, i) {
          var ja = el.getAttribute('lang') === 'ja';
          gsap.to(el, {
            duration: 1.1, delay: i * 0.12, ease: 'none',
            scrambleText: { text: el.textContent, chars: ja ? '日本語能力試験言葉文字読書' : 'abcdefghijklmnopqrstuvwxyzñãçé', speed: 0.5, revealDelay: 0.25 }
          });
        });
      }
    });
  }

  /* ----------------------------------------------------------- medidores */
  function medidores() {
    $$('.med').forEach(function (m) {
      var de = +m.dataset.de, para = +m.dataset.para;
      m.style.setProperty('--de', de);
      m.style.setProperty('--para', para);
    });
    if (!temGsap || reduz || !window.ScrollTrigger) return;
    $$('.med').forEach(function (m) {
      var de = +m.dataset.de, para = +m.dataset.para;
      var n = $('.js-n', m);
      var o = { v: de };
      m.style.setProperty('--v', de);
      n.textContent = de;
      ScrollTrigger.create({
        trigger: m, start: 'top 85%', once: true,
        onEnter: function () {
          gsap.to(o, {
            v: para, duration: 1.8, ease: 'power3.out', delay: 0.15,
            onUpdate: function () { m.style.setProperty('--v', o.v); n.textContent = Math.round(o.v); }
          });
        }
      });
    });
  }

  /* --------------------------------------------------------- linha do tempo */
  function linhaDoTempo() {
    if (!temGsap || reduz || !window.ScrollTrigger || !window.DrawSVGPlugin) return;
    gsap.fromTo('.linha__fio line', { drawSVG: '0%' }, {
      drawSVG: '100%', ease: 'none',
      scrollTrigger: { trigger: '.linha', start: 'top 80%', end: 'bottom 60%', scrub: 0.6 }
    });
  }

  /* -------------------------------------------------------- barra e rolagem */
  var lenis = null;
  function rolagem() {
    var bar = $('#bar');
    function solida() { bar.classList.toggle('is-solida', window.scrollY > 40); }
    solida();
    window.addEventListener('scroll', solida, { passive: true });

    if (temGsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      if (window.Flip) gsap.registerPlugin(Flip);
      if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
    }
    if (!reduz && window.Lenis && temGsap && ponteiroFino) {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var alvo = document.getElementById(a.getAttribute('href').slice(1));
        if (!alvo) return;
        if (lenis) { e.preventDefault(); lenis.scrollTo(alvo, { offset: -72 }); history.replaceState(null, '', a.getAttribute('href')); }
      });
    });
    // seção atual na barra
    if ('IntersectionObserver' in window) {
      var links = $$('.bar__nav a');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle('is-aqui', l.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('main > section[id]').forEach(function (s) { io.observe(s); });
    }
  }

  /* ------------------------------------------------------- mais GSAP */
  // cada efeito explica alguma coisa do conteúdo; nenhum esconde texto se o JS falhar
  function movimento() {
    if (!temGsap || !window.ScrollTrigger) return;

    // indicador da seção atual desliza entre os links da barra
    var nav = $('.bar__nav'), ind = $('.bar__ind');
    if (nav && ind) {
      document.documentElement.classList.add('tem-ind');
      var moverInd = function () {
        var a = $('.bar__nav a.is-aqui');
        if (!a || !nav.offsetWidth) { gsap.to(ind, { opacity: 0, duration: 0.2 }); return; }
        gsap.to(ind, { x: a.offsetLeft + 10, width: a.offsetWidth - 20, opacity: 1, duration: reduz ? 0 : 0.55, ease: 'expo.out' });
      };
      new MutationObserver(moverInd).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
      window.addEventListener('resize', moverInd);
    }

    // barra de leitura no rodapé da barra
    var prog = $('.bar__prog');
    if (prog) gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

    if (reduz) return;

    // títulos: as letras chegam estreitas e abrem até a largura do título. Só transform (scaleX):
    // mexer no eixo de largura da fonte mudava a quebra de linha e empurrava a página (CLS)
    if (window.SplitText) {
      gsap.registerPlugin(SplitText);
      $$('.sec__t').forEach(function (t) {
        ScrollTrigger.create({
          trigger: t, start: 'top 88%', once: true,
          onEnter: function () {
            t.style.minHeight = t.offsetHeight + 'px';
            var sp = new SplitText(t, { type: 'words,chars', charsClass: 'tl' });
            gsap.from(sp.chars, {
              scaleX: 0.35, opacity: 0, yPercent: 35, transformOrigin: '0% 100%', duration: 0.9, ease: 'expo.out',
              stagger: { each: 0.018, from: 'start' },
              onComplete: function () { sp.revert(); t.style.minHeight = ''; }
            });
          }
        });
      });
    }

    // placar da Cuoncient: os números contam até o valor
    $$('.placar b').forEach(function (b) {
      var fim = parseInt(b.textContent, 10);
      if (!fim) return;
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: b, start: 'top 85%', once: true,
        onEnter: function () {
          // reserva a largura final do número (já com a fonte carregada) enquanto ele conta
          b.style.display = 'inline-block';
          b.style.minWidth = b.getBoundingClientRect().width + 'px';
          gsap.to(o, { v: fim, duration: 1.6, ease: 'power3.out', onUpdate: function () { b.textContent = Math.round(o.v); } });
        }
      });
    });

    // agenda: a semana "toca" da segunda ao domingo e a linha de agora corre até a hora certa
    var semana = $('#semana');
    if (semana) {
      ScrollTrigger.create({
        trigger: semana, start: 'top 80%', once: true,
        onEnter: function () {
          gsap.from($$('.ponto', semana), { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(3)', stagger: 0.035 });
          var ag = $('.agora', semana);
          if (ag) gsap.from(ag, { left: '52px', duration: 1.6, ease: 'power3.inOut', delay: 0.2 });
          gsap.from($$('.dia', semana), { opacity: 0, x: -12, duration: 0.5, stagger: 0.06, ease: 'power2.out' });
        }
      });
    }

    // cases: o print do site "carrega" de cima para baixo e o celular sobe
    $$('.caso').forEach(function (c) {
      var desk = $('.caso__desk', c), cel = $('.caso__cel', c), txt = $('.caso__txt', c);
      var tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 78%', once: true } });
      if (desk) tl.fromTo(desk, { clipPath: 'inset(0% 0% 100% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.1, ease: 'power3.inOut' });
      if (cel) tl.from(cel, { yPercent: 40, opacity: 0, duration: 0.8, ease: 'expo.out' }, '-=0.45');
      if (txt) tl.from(txt.children, { y: 18, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.2);
    });

    // resultados: o número antigo é riscado antes do novo aparecer
    var extra = $('.res-extra');
    if (extra) {
      var riscos = $$('s', extra);
      riscos.forEach(function (r) { r.style.setProperty('--risco', '0%'); });
      ScrollTrigger.create({
        trigger: extra, start: 'top 85%', once: true,
        onEnter: function () {
          riscos.forEach(function (r, i) {
            var o = { v: 0 };
            gsap.to(o, { v: 100, duration: 0.6, delay: 0.2 + i * 0.25, ease: 'power2.inOut', onUpdate: function () { r.style.setProperty('--risco', o.v + '%'); } });
          });
        }
      });
    }

    // idiomas: a barra de nível cresce até o nível de cada idioma
    var idis = $$('.idiomas li');
    if (idis.length) {
      idis.forEach(function (li) { li.style.setProperty('--nvp', 0); });
      ScrollTrigger.create({
        trigger: idis[0], start: 'top 85%', once: true,
        onEnter: function () { gsap.to(idis, { '--nvp': 1, duration: 1.2, ease: 'expo.out', stagger: 0.12 }); }
      });
    }

    // 芸術×技術: o kanji aparece como uma pincelada, de cima para baixo
    var kanji = $('.como__kanji');
    if (kanji) {
      gsap.fromTo(kanji, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: kanji, start: 'top 85%', end: 'bottom 55%', scrub: 0.6 }
      });
    }

    // apps: o nome do app chega da esquerda e assenta
    $$('.app').forEach(function (li) {
      var n = $('.app__nome', li);
      if (!n) return;
      gsap.from(n, { x: -24, opacity: 0.3, duration: 0.9, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: li, start: 'top 80%', once: true } });
    });
  }

  /* ----------------------------------------------- fluxos dos agentes (SVG + GSAP) */
  // um pedido (o ponto) percorre cada padrão como ele roda de verdade; só anima com o fluxo na tela
  function fluxos() {
    var svgs = $$('.fluxo');
    if (!svgs.length || !temGsap || reduz || !window.ScrollTrigger) return;
    svgs.forEach(function (svg) {
      var nos = $$('.fl-no', svg), tk = $('.fl-tk', svg);
      var fios = $$('.fl-ar', svg);
      var tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9, paused: true, defaults: { ease: 'power2.inOut' } });
      function on(i) { return function () { nos.forEach(function (n, k) { n.classList.toggle('is-on', k === i); }); }; }
      function centro(i) { var r = $('rect', nos[i]); return { x: +r.getAttribute('x') + +r.getAttribute('width') / 2, y: +r.getAttribute('y') + 14 }; }
      function ir(i, dur) { var c = centro(i); tl.to(tk, { attr: { cx: c.x, cy: c.y }, duration: dur || 0.6 }).call(on(i)); }
      function curva(alvo, path, dur, pos) {
        var L = path.getTotalLength(), o = { p: 0 };
        tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease: 'power1.inOut', onUpdate: function () {
          var pt = path.getPointAtLength(o.p * L); alvo.setAttribute('cx', pt.x); alvo.setAttribute('cy', pt.y);
        } }, pos);
      }
      function pausa(d) { tl.to({}, { duration: d }); }
      var c0 = centro(0);
      tl.set(tk, { attr: { cx: c0.x, cy: c0.y }, opacity: 1 }).call(on(0));
      pausa(0.3);
      var tipo = svg.getAttribute('data-fluxo');
      if (tipo === 'revisor') {
        ir(1); pausa(0.35); ir(2); pausa(0.3);
        tl.to(tk, { attr: { cy: 78 }, duration: 0.15 });
        curva(tk, $('.fl-ar--volta', svg), 0.9);
        tl.to(tk, { attr: { cy: 64 }, duration: 0.15 }).call(on(1));
        pausa(0.35); ir(2); pausa(0.3); ir(3); pausa(0.7);
      } else if (tipo === 'rota') {
        [2, 3, 4].forEach(function (saida, k) {
          if (k) { tl.set(tk, { attr: { cx: c0.x, cy: c0.y }, opacity: 1 }).call(on(0)); pausa(0.25); }
          ir(1); pausa(0.3);
          tl.to(tk, { attr: { cx: 168 }, duration: 0.2, ease: 'none' });
          curva(tk, fios[k + 1], 0.45);
          ir(saida, 0.35); pausa(0.45);
          tl.to(tk, { opacity: 0, duration: 0.2 });
        });
      } else if (tipo === 'aprova') {
        var ok = $('.fl-ok', svg), traco = $('.fl-ok path', svg);
        tl.set(ok, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, 0);
        if (window.DrawSVGPlugin) tl.set(traco, { drawSVG: '0%' }, 0);
        ir(1); pausa(0.4);
        tl.to(ok, { opacity: 1, scale: 1, duration: 0.35, ease: 'expo.out' });
        if (window.DrawSVGPlugin) tl.to(traco, { drawSVG: '100%', duration: 0.4, ease: 'power2.out' });
        pausa(0.4); ir(2); pausa(0.8);
        tl.to(ok, { opacity: 0, duration: 0.3 }, '-=0.3');
      } else if (tipo === 'rag') {
        var trechos = $$('.fl-tr', svg), arco = $('.fl-ar--trecho', svg);
        ir(1); pausa(0.2);
        trechos.forEach(function (tr, k) {
          tl.set(tr, { opacity: 1 }, '>-' + (k ? 0.5 : 0));
          curva(tr, arco, 0.7, '<');
          tl.set(tr, { opacity: 0 });
        });
        tl.to(tk, { attr: { cx: centro(2).x }, duration: 0.5 }, '-=0.6').call(on(2));
        pausa(0.4); ir(3); pausa(0.8);
      }
      tl.to(tk, { opacity: 0, duration: 0.3 }).call(on(-1));
      // os fios se desenham na primeira vez; depois o laço só roda com o fluxo visível
      var cheios = fios.filter(function (f) { return !f.classList.contains('fl-ar--volta') && !f.classList.contains('fl-ar--trecho'); });
      ScrollTrigger.create({
        trigger: svg, start: 'top 92%', end: 'bottom 8%',
        onEnter: function () {
          if (svg.__desenhado) return;
          svg.__desenhado = true;
          if (window.DrawSVGPlugin) gsap.from(cheios, { drawSVG: '0%', duration: 0.7, stagger: 0.08, ease: 'power2.out' });
          gsap.from($$('.fl-no', svg), { opacity: 0, y: 6, duration: 0.5, stagger: 0.07, ease: 'power2.out' });
        },
        onToggle: function (st) { if (st.isActive) tl.play(); else tl.pause(); }
      });
    });
  }

  /* ------------------------------------------------- perfil: o retrato abre */
  function perfil() {
    if (!temGsap || reduz || !window.ScrollTrigger) return;
    var foto = $('.perfil__foto');
    if (!foto) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.perfil', start: 'top 75%', once: true } });
    tl.fromTo(foto, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' })
      .from($('img', foto), { scale: 1.14, duration: 1.5, ease: 'power3.out' }, 0)
      .from('.perfil__bio', { opacity: 0, y: 14, duration: 0.8, ease: 'power2.out' }, 0.25)
      .from($$('.perfil__dados > div'), { opacity: 0, y: 12, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.4);
  }

  /* ------------------------------------------- raio-X: a tecnologia de cada parte */
  var raio = { ligado: false, ligar: function () {} };
  function numero(n, casas) {
    return (+n).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: casas || 0, maximumFractionDigits: casas || 0 });
  }
  function raioX() {
    var botoes = $$('.js-rx');
    if (!botoes.length) return;
    var camada = null, tags = [];
    function montar() {
      camada = document.createElement('div');
      camada.className = 'rx-camada';
      camada.setAttribute('aria-hidden', 'true');
      document.body.appendChild(camada);
      tags = $$('[data-tec]').map(function (el) {
        var t = document.createElement('span');
        t.className = 'rx-tag';
        t.style.opacity = '0';
        camada.appendChild(t);
        return { el: el, t: t, txt: '', vis: false };
      });
    }
    function vivo(txt) {
      if (txt.indexOf('{fps}') < 0) return txt;
      var g = window.__gl;
      if (!g || !g.pontos) return T().glOff;
      return txt.replace('{fps}', g.fps || '–').replace('{pontos}', numero(g.pontos));
    }
    function posicionar() {
      var W = window.innerWidth, H = window.innerHeight, topo = 72;
      tags.forEach(function (o) {
        var r = o.el.getBoundingClientRect();
        var ve = r.width > 0 && r.height > 0 && r.bottom > topo + 24 && r.top < H - 24;
        if (!ve) { if (o.vis) { o.t.style.opacity = '0'; o.vis = false; } return; }
        var txt = vivo(o.el.getAttribute('data-tec') || '');
        if (txt !== o.txt) { o.t.textContent = txt; o.txt = txt; }
        var w = o.t.offsetWidth, h = o.t.offsetHeight;
        var x = Math.max(8, Math.min(r.left - 6, W - w - 8));
        var y = Math.max(topo, Math.min(r.top - 6 - h / 2, H - h - 8)); // em cima do contorno tracejado
        o.t.style.transform = 'translate3d(' + Math.round(x) + 'px,' + Math.round(y) + 'px,0)';
        if (!o.vis) { o.t.style.opacity = '1'; o.vis = true; if (temGsap && !reduz) gsap.fromTo(o.t, { scale: 0.92 }, { scale: 1, duration: 0.35, ease: 'expo.out', transformOrigin: '0 100%' }); }
      });
    }
    function ligar(sim) {
      raio.ligado = sim;
      doc.classList.toggle('rx-on', sim);
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(sim)); });
      if (sim && !camada) montar();
      if (camada) camada.hidden = !sim;
      if (sim) { tags.forEach(function (o) { o.vis = false; o.t.style.opacity = '0'; }); posicionar(); }
      if (temGsap) { if (sim) gsap.ticker.add(posicionar); else gsap.ticker.remove(posicionar); }
      else if (sim) { (function laco() { if (!raio.ligado) return; posicionar(); requestAnimationFrame(laco); })(); }
    }
    raio.ligar = ligar;
    botoes.forEach(function (b) { b.addEventListener('click', function () { ligar(!raio.ligado); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && raio.ligado) ligar(false); });

    // "em uso nesta página": liga o raio-X e leva até a parte que usa aquela tecnologia
    $$('.emuso [data-alvo]').forEach(function (b) {
      b.addEventListener('click', function () {
        var alvo = $(b.getAttribute('data-alvo'));
        if (!alvo) return;
        if (!raio.ligado) ligar(true);
        if (lenis) lenis.scrollTo(alvo, { offset: -Math.round(window.innerHeight * 0.3), duration: 1.4 });
        else alvo.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'center' });
        $$('.is-alvo').forEach(function (x) { x.classList.remove('is-alvo'); });
        alvo.classList.add('is-alvo');
        setTimeout(function () { alvo.classList.remove('is-alvo'); }, 2400);
      });
    });
  }

  /* --------------------------------------- painel ao vivo: medido no navegador */
  function aoVivo() {
    var painel = $('.aovivo');
    if (!painel) return;
    var cwv = { lcp: null, cls: 0, inp: null };
    function observar(tipo, fn, extra) {
      try {
        var o = { type: tipo, buffered: true };
        for (var k in extra) o[k] = extra[k];
        new PerformanceObserver(function (l) { l.getEntries().forEach(fn); }).observe(o);
      } catch (e) {}
    }
    observar('largest-contentful-paint', function (e) { cwv.lcp = e.renderTime || e.startTime; });
    observar('layout-shift', function (e) { if (!e.hadRecentInput) cwv.cls += e.value; });
    observar('event', function (e) { if (e.interactionId) cwv.inp = Math.max(cwv.inp || 0, e.duration); }, { durationThreshold: 16 });
    observar('first-input', function (e) { if (cwv.inp === null) cwv.inp = e.duration; });

    var hist = [];
    var linha = $('.js-v-spark', painel);
    function pinta(sel, v) { var el = $(sel, painel); if (el && el.textContent !== v) el.textContent = v; }
    function desenhar() {
      if (!linha || hist.length < 2) return;
      var max = Math.max(60, Math.max.apply(null, hist));
      var d = hist.map(function (v, i) {
        var x = (i / (hist.length - 1)) * 240, y = 42 - (v / max) * 38;
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join('');
      linha.setAttribute('d', d);
    }
    function medir() {
      var g = window.__gl;
      if (g && g.pontos) {
        pinta('.js-v-fps', String(g.fps || '–'));
        pinta('.js-v-pts', numero(g.pontos));
        pinta('.js-v-calls', String(g.chamadas || '–'));
        hist.push(g.fps || 0);
        if (hist.length > 60) hist.shift();
        desenhar();
      } else {
        pinta('.js-v-fps', '0');
        var d = $('[data-v="gl"] .vivo__d', painel);
        if (d && d.textContent !== T().glOff) d.textContent = T().glOff;
      }
      if (window.ScrollTrigger) pinta('.js-v-st', String(ScrollTrigger.getAll().length));
      if (temGsap) pinta('.js-v-tw', String(gsap.globalTimeline.getChildren(true, true, false).filter(function (t) { return t.isActive(); }).length));
      if (cwv.lcp !== null) pinta('.js-v-lcp', numero(cwv.lcp / 1000, 1) + ' s');
      pinta('.js-v-cls', numero(cwv.cls, 2));
      pinta('.js-v-inp', cwv.inp === null ? '–' : Math.round(cwv.inp) + ' ms');
      if (window.performance && performance.getEntriesByType) {
        var nav = performance.getEntriesByType('navigation')[0];
        var rec = performance.getEntriesByType('resource');
        var bytes = (nav && nav.transferSize) || 0;
        rec.forEach(function (r) { bytes += r.transferSize || 0; });
        pinta('.js-v-kb', bytes >= 1048576 ? numero(bytes / 1048576, 1) + ' MB' : numero(bytes / 1024) + ' KB');
        pinta('.js-v-req', String(rec.length + 1));
      }
    }
    var relogio = null;
    function ligar(sim) {
      if (sim && !relogio) { medir(); relogio = setInterval(medir, 500); }
      if (!sim && relogio) { clearInterval(relogio); relogio = null; }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { ligar(es[0].isIntersecting); }, { rootMargin: '200px 0px' }).observe(painel);
    } else ligar(true);
    aoVivo.medir = medir;

    // acessibilidade: o axe-core só baixa quando a pessoa pede
    var bAxe = $('.js-axe', painel);
    if (!bAxe) return;
    function carregarAxe() {
      if (window.axe) return Promise.resolve(window.axe);
      return new Promise(function (ok, erro) {
        var sc = document.createElement('script');
        sc.src = '/gui/vendor/axe.min.js';
        sc.onload = function () { ok(window.axe); };
        sc.onerror = erro;
        document.head.appendChild(sc);
      });
    }
    bAxe.addEventListener('click', function () {
      var rot = $('span', bAxe), det = $('.js-v-axe-d', painel);
      bAxe.disabled = true;
      det.textContent = T().axeCarrega;
      var t0 = performance.now();
      carregarAxe().then(function (axe) {
        det.textContent = T().axeRoda;
        t0 = performance.now();
        return axe.run({ exclude: [['#gl'], ['.rx-camada'], ['.globo-rot']] }, { resultTypes: ['violations'] });
      }).then(function (r) {
        var ms = Math.round(performance.now() - t0);
        pinta('.js-v-axe', String(r.violations.length));
        var txt = T().axeOk(r.passes.length, r.incomplete.length, numero(ms));
        if (r.violations.length) txt += ' ' + T().axeRuim(r.violations.map(function (v) { return v.id; }).join(', '));
        det.textContent = txt;
        if (temGsap && !reduz) gsap.fromTo($('.js-v-axe', painel), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' });
        rot.removeAttribute('data-en'); rot.removeAttribute('data-pt');
        rot.textContent = T().axeDeNovo;
      }).catch(function () { det.textContent = T().axeFalhou; }).then(function () { bAxe.disabled = false; });
    });
  }

  /* ------------------------------------------------------------------ início */
  function iniciar() {
    rolagem();
    nome();
    sistemas();
    agenda.montar();
    medidores();
    linhaDoTempo();
    titulos();
    magneticos();
    parede();
    carimbo();
    apps();
    movimento();
    idiomas();
    fluxos();
    perfil();
    raioX();
    aoVivo();
    $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { aplicarIdioma(b.dataset.lang); }); });
    var pedido = new URLSearchParams(location.search).get('lang');
    aplicarIdioma(pedido || ler('gui-lang') || ((navigator.language || 'pt').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en'));
    window.addEventListener('resize', function () { agenda.atualizar(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
