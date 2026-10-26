/* Currículo do Gui — cuoncient.com/gui
   Idioma, nome vivo, sistemas, agenda das automações, medidores e linha do tempo.
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
      titulo: 'Guilherme Keidi Suzuki — currículo',
      anos: function (n) { return n + ' anos'; },
      dias: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
      diasCurtos: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      agora: function (hm, dia, prox) {
        return 'Agora são ' + hm + ' de ' + dia + ' em Brasília. Próxima automação na agenda: ' + prox + '.';
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
      sistemas: function (n) { return n === 1 ? 'sistema' : 'sistemas'; }
    },
    en: {
      titulo: 'Guilherme Keidi Suzuki — résumé',
      anos: function (n) { return n + ' years old'; },
      dias: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      diasCurtos: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      agora: function (hm, dia, prox) {
        return 'It is ' + hm + ' on ' + dia + ' in Brasília. Next scheduled automation: ' + prox + '.';
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
      sistemas: function (n) { return n === 1 ? 'system' : 'systems'; }
    }
  };
  function T() { return TEXTOS[lang]; }

  var PARES = [
    ['en', 'innerHTML'],
    ['en-href', 'href'],
    ['en-label', 'aria-label'],
    ['en-title', 'title']
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
    { id: 'nf', dias: [1, 2, 3, 4, 5], h: 6, m: 15, cor: '#6fd3e0', pt: 'Planilha de pedidos para tarefas de NF', en: 'Order sheet to invoice tasks' },
    { id: 'manha', dias: [1, 2, 3, 4, 5], h: 6, m: 40, cor: '#1aa5b8', pt: 'Resumo da manhã', en: 'Morning brief' },
    { id: 'blog', dias: [1, 3, 5], h: 10, m: 0, cor: '#eef0f2', pt: 'Motor do blog da Art 7', en: 'Art 7 blog engine' },
    { id: 'qa', dias: [1], h: 10, m: 0, cor: '#9be7f0', pt: 'Vigia semanal das páginas', en: 'Weekly page watch' },
    { id: 'revisao', dias: [5], h: 21, m: 0, cor: '#4cb8c8', pt: 'Revisão semanal', en: 'Weekly review' }
  ];
  var ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]; // linhas: seg..dom

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
          gsap.fromTo(painel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'expo.out', clearProps: 'height' });
        } else {
          gsap.to(painel, { height: 0, opacity: 0, duration: 0.32, ease: 'power2.in', onComplete: function () { painel.hidden = true; gsap.set(painel, { clearProps: 'all' }); } });
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
      var reserva = celular ? 54 : 0; // espaço do carimbo no celular
      var maior = 0;
      $$('.nome__line', h1).forEach(function (l) {
        if (celular) {
          $$('.nome__w', l).forEach(function (w) { maior = Math.max(maior, w.getBoundingClientRect().width); });
        } else {
          maior = Math.max(maior, l.scrollWidth, $$('.nome__w', l).reduce(function (t, w) { return t + w.getBoundingClientRect().width; }, 0));
        }
      });
      if (!maior) return;
      var alvo = Math.min(base * (caixa - reserva) / maior, celular ? 112 : 176);
      h1.style.fontSize = Math.floor(alvo * 0.985) + 'px';
    }

    function revelar() {
      ajustar();
      h1.classList.add('is-pronto');
      window.__guiEntrada = true;
      document.dispatchEvent(new CustomEvent('gui:entrada'));
      if (!temGsap || reduz) return;
      var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo(chars, { '--wd': 62, '--wg': 300, opacity: 0, yPercent: 18 },
        { '--wd': 112, '--wg': 780, opacity: 1, yPercent: 0, duration: 1.4, stagger: 0.035 })
        .from('.hero__role', { opacity: 0, y: 16, duration: 0.9 }, 0.55)
        .from('.hero__facts, .hero__cta', { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, 0.7)
        .from('.hanko', { opacity: 0, scale: 1.25, rotate: -8, duration: 0.7, ease: 'back.out(2)' }, 0.95)
        .from('.hero__now', { opacity: 0, duration: 0.8 }, 1.1);
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
        setters[i].wd(112 - 46 * k);
        setters[i].wg(780 + 120 * k);
      }
    });
    hero.addEventListener('pointerleave', function () {
      setters.forEach(function (s) { s.wd(112); s.wg(780); });
    });
    window.addEventListener('resize', function () { medido = false; });
    window.addEventListener('scroll', function () { medido = false; }, { passive: true });
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

  /* ------------------------------------------------------------------ início */
  function iniciar() {
    rolagem();
    nome();
    sistemas();
    agenda.montar();
    medidores();
    linhaDoTempo();
    $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { aplicarIdioma(b.dataset.lang); }); });
    var pedido = new URLSearchParams(location.search).get('lang');
    aplicarIdioma(pedido || ler('gui-lang') || ((navigator.language || 'pt').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en'));
    window.addEventListener('resize', function () { agenda.atualizar(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
