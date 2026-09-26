/* Cuoncient agency — interações mínimas */
(function () {
  // ano no rodapé
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // ------------------------------------------------------- tabelas de idioma
  // O site fala três idiomas. O português é o que está escrito no HTML; os
  // outros vivem em atributos `data-<sigla>` e entram sem recarregar a página
  // — ver "idioma", mais abaixo, para o motor que aplica tudo isso.
  //
  // O que mora aqui são as frases que o JavaScript monta sozinho: a contagem
  // do filtro, o rótulo do menu e a fala do Venn. Elas precisam estar no topo
  // porque o Venn e o filtro são escritos antes do motor e leem daqui.
  //
  // Para acrescentar um quarto idioma: entre com a sigla em IDIOMAS, escreva
  // uma linha em FRASES, outra em TAG_HTML e outra em PADROES_ALT, e ponha os
  // `data-<sigla>` no HTML. Nenhum outro trecho deste arquivo precisa saber
  // que ele existe.
  var IDIOMAS = ['pt', 'en', 'es'];
  var BASE = IDIOMAS[0];                 // o idioma escrito direto no HTML
  var idiomaAtual = BASE;

  var FRASES = {
    pt: {
      abrir: 'Abrir menu', fechar: 'Fechar menu',
      cruza: ' cruza com ', e: ' e ', de: ' de ',
      projeto: ' projeto', projetos: ' projetos',
      verMais: function (n) { return 'Ver mais ' + n + (n === 1 ? ' projeto' : ' projetos'); }
    },
    en: {
      abrir: 'Open menu', fechar: 'Close menu',
      cruza: ' crosses with ', e: ' and ', de: ' of ',
      projeto: ' project', projetos: ' projects',
      verMais: function (n) { return 'Show ' + n + (n === 1 ? ' more project' : ' more projects'); }
    },
    es: {
      abrir: 'Abrir menú', fechar: 'Cerrar menú',
      cruza: ' se cruza con ', e: ' y ', de: ' de ',
      projeto: ' proyecto', projetos: ' proyectos',
      verMais: function (n) { return 'Ver ' + n + (n === 1 ? ' proyecto más' : ' proyectos más'); }
    }
  };

  // O que vai no lang= da tag <html>. Só o português leva região: pt-BR e
  // pt-PT divergem o bastante para valer a distinção; en e es aqui não.
  var TAG_HTML = { pt: 'pt-BR', en: 'en', es: 'es' };

  // Atalho para as frases do idioma em uso.
  function frase() { return FRASES[idiomaAtual] || FRASES[BASE]; }

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

  // ----------------------------------------------------------------- venn
  // Acende uma disciplina e os rótulos que vivem dentro do círculo dela.
  //
  // Quem tem mouse só precisa passar por cima; quem está no dedo ou no
  // teclado clica, e aí a escolha trava até clicar de novo ou apertar Esc.
  // O texto da fala é montado a partir do próprio DOM, então ele acompanha a
  // troca de idioma sem precisar de uma segunda lista para manter em dia —
  // só as duas conjunções vêm da tabela FRASES lá do topo.
  //
  // Quando o idioma troca com uma disciplina travada, a fala precisa ser
  // redita no idioma novo — é um aria-live, quem ouve merece a frase certa.
  // O motor de idioma chama isto; fora daqui ninguém mexe no Venn.
  var redizerVenn = null;

  var venn = document.getElementById('venn');
  if (venn) (function () {
    var discs = venn.querySelectorAll('.venn__disc');
    var fala = venn.querySelector('.venn__fala');
    var temMouse = window.matchMedia('(hover:hover)').matches;
    var travado = null;

    function nomesDoCirculo(chave) {
      var fora = [];
      venn.querySelectorAll('.venn__lab:not(.venn__disc)').forEach(function (l) {
        if ((l.dataset.venn || '').split(' ').indexOf(chave) > -1) {
          // o <br> de "Social<br>Media" nao e espaco em branco: sem trocar por
          // um, o leitor de tela le "SocialMedia" numa palavra so
          fora.push(l.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
        }
      });
      return fora;
    }

    function acender(chave) {
      if (chave) venn.dataset.ativo = chave;
      else delete venn.dataset.ativo;

      discs.forEach(function (d) {
        d.setAttribute('aria-pressed', String(!!chave && d.dataset.venn === chave && travado === chave));
      });

      if (!fala) return;
      if (!chave) { fala.textContent = ''; return; }
      var disc = venn.querySelector('.venn__disc[data-venn="' + chave + '"]');
      var lista = nomesDoCirculo(chave);
      var f = frase();
      fala.textContent = disc.textContent.trim()
        + f.cruza
        + lista.slice(0, -1).join(', ')
        + f.e + lista[lista.length - 1] + '.';
    }

    discs.forEach(function (d) {
      var chave = d.dataset.venn;

      d.addEventListener('click', function () {
        travado = (travado === chave) ? null : chave;
        acender(travado);
      });

      // o teclado anda pelos botões: o foco acende sem travar
      d.addEventListener('focus', function () { if (!travado) acender(chave); });
      d.addEventListener('blur', function () { if (!travado) acender(null); });

      if (temMouse) {
        d.addEventListener('pointerenter', function () { if (!travado) acender(chave); });
        d.addEventListener('pointerleave', function () { if (!travado) acender(null); });
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && travado) { travado = null; acender(null); }
    });

    redizerVenn = function () { if (travado) acender(travado); };
  })();

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
    botaoMenu.setAttribute('aria-label', menuAberto ? frase().fechar : frase().abrir);
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
  // Troca PT/EN/ES sem recarregar a página.
  //
  // Como funciona: o português é o que já está escrito no HTML; os outros
  // idiomas vivem em atributos, e o sufixo diz qual pedaço do elemento se
  // traduz:
  //
  //   data-en          o texto        (innerHTML)
  //   data-en-href     o endereço     (as mensagens de WhatsApp)
  //   data-en-label    o aria-label   (o que o leitor de tela anuncia)
  //   data-en-alt      o texto alternativo das fotos que fogem do padrão
  //
  // Na primeira troca o original é guardado no par `data-pt` correspondente,
  // então dá para ir e voltar quantas vezes quiser sem perder nada. Idioma
  // que não declare uma dessas partes cai no português, em vez de apagar o
  // conteúdo.
  //
  // O português é o idioma do HTML servido — é ele que o Google indexa e o
  // que aparece na prévia do WhatsApp. Inglês e espanhol vivem só no
  // navegador de quem clicar. Se um dia um deles precisar ranquear no
  // Google, aí sim vale uma página separada em /en/ ou /es/ com hreflang;
  // isto aqui não substitui isso.
  //
  // Cada linha da tabela: o que se troca no DOM ↔ o sufixo do atributo ↔ a
  // chave no dataset. O texto vem primeiro e é o único que não é atributo —
  // daí o null.
  var PARTES = [
    { attr: null,         sufixo: '',       chave: ''      },
    { attr: 'href',       sufixo: '-href',  chave: 'Href'  },
    { attr: 'aria-label', sufixo: '-label', chave: 'Label' },
    { attr: 'alt',        sufixo: '-alt',   chave: 'Alt'   }
  ];

  // As miniaturas dos 55 projetos seguem um padrão de alt, então três regras
  // dão conta de todas — bem melhor que 55 atributos a mais no HTML. O que
  // foge do padrão leva data-<sigla>-alt escrito à mão.
  var PADROES_ALT = {
    pt: [],
    en: [[/^Home do site (.+)$/, 'Homepage of $1'],
         [/^Site (.+) no desktop$/, '$1 website on desktop'],
         [/^Site (.+) no celular$/, '$1 website on mobile']],
    es: [[/^Home do site (.+)$/, 'Página de inicio de $1'],
         [/^Site (.+) no desktop$/, 'Sitio $1 en escritorio'],
         [/^Site (.+) no celular$/, 'Sitio $1 en móvil']]
  };

  // Traduzível é todo elemento que carregue qualquer data-* de qualquer
  // idioma fora o base. O seletor nasce da tabela: entrar com um idioma novo
  // em IDIOMAS já o inclui aqui, sem tocar nesta linha.
  var seletor = [];
  IDIOMAS.forEach(function (id) {
    if (id === BASE) return;
    PARTES.forEach(function (p) { seletor.push('[data-' + id + p.sufixo + ']'); });
  });
  var traduziveis = document.querySelectorAll(seletor.join(','));
  var botoesIdioma = document.querySelectorAll('.lang__op');

  // Este elemento declara tradução desta parte em algum idioma?
  function declara(el, sufixo) {
    return IDIOMAS.some(function (id) {
      return id !== BASE && el.hasAttribute('data-' + id + sufixo);
    });
  }

  function aplicarIdioma(idioma) {
    if (IDIOMAS.indexOf(idioma) < 0) idioma = BASE;
    idiomaAtual = idioma;

    traduziveis.forEach(function (el) {
      PARTES.forEach(function (p) {
        if (!declara(el, p.sufixo)) return;      // só mexe no que foi declarado

        var base = BASE + p.chave;               // ex.: ptHref
        var alvo = idioma + p.chave;             // ex.: esHref
        if (el.dataset[base] === undefined) {
          el.dataset[base] = p.attr ? el.getAttribute(p.attr) : el.innerHTML;
        }
        var valor = el.dataset[alvo] !== undefined ? el.dataset[alvo] : el.dataset[base];
        if (p.attr) el.setAttribute(p.attr, valor);
        else el.innerHTML = valor;
      });
    });

    // Os alts que seguem o padrão das miniaturas. Quem tem tradução escrita
    // à mão já foi resolvido no laço acima e é pulado aqui.
    document.querySelectorAll('img[alt]').forEach(function (img) {
      if (declara(img, '-alt')) return;
      if (img.dataset.ptAlt === undefined) img.dataset.ptAlt = img.alt;
      var texto = img.dataset.ptAlt;
      (PADROES_ALT[idioma] || []).forEach(function (regra) {
        texto = texto.replace(regra[0], regra[1]);
      });
      img.alt = texto;
    });

    document.documentElement.lang = TAG_HTML[idioma] || TAG_HTML[BASE];
    botoesIdioma.forEach(function (b) {
      // aria-pressed, não aria-current: estes são botões de alternância, e é
      // "pressed" que o leitor de tela anuncia como estado ligado/desligado.
      b.setAttribute('aria-pressed', String(b.dataset.lang === idioma));
    });
    if (typeof rotularMenu === 'function') rotularMenu();
    if (redizerVenn) redizerVenn();
    // a contagem do filtro é montada em JS, então precisa ser refeita ao trocar
    var g = document.querySelector('.proj-grid');
    if (g && g.dataset.filtro && typeof filtrar === 'function') filtrar(g.dataset.filtro);
    try { localStorage.setItem('cuoncient-idioma', idioma); } catch (e) { /* modo privado */ }
  }

  botoesIdioma.forEach(function (b) {
    b.addEventListener('click', function () { aplicarIdioma(b.dataset.lang); });
  });

  // Escolha inicial: o que a pessoa já escolheu antes; senão, o idioma do
  // navegador. Português fica em português, espanhol cai no espanhol, e o
  // resto do mundo cai no inglês.
  var salvo = null;
  try { salvo = localStorage.getItem('cuoncient-idioma'); } catch (e) { /* modo privado */ }
  var tag = (navigator.language || BASE).toLowerCase();
  var doNavegador = tag.indexOf('pt') === 0 ? 'pt'
                  : tag.indexOf('es') === 0 ? 'es' : 'en';
  aplicarIdioma(IDIOMAS.indexOf(salvo) > -1 ? salvo : doNavegador);

  // --------------------------------------------------------------- filtro
  // Grade de projetos por mercado. Cada card tem data-mercado="br" ou "eua";
  // aqui só se esconde o que não bate. Nada é recriado, então a animação de
  // entrada e as imagens já carregadas continuam como estavam.
  var filtroBotoes = document.querySelectorAll('.filtro__op');
  var cards = document.querySelectorAll('.proj-grid .proj');
  var conta = document.querySelector('.filtro__conta');
  var grade = document.querySelector('.proj-grid');

  // ---- lote ----
  // 55 cards em coluna unica davam 16.252px no celular. Em tela estreita a
  // grade abre com um lote e o botao traz o resto; no desktop nada disso
  // acontece e as 55 miniaturas aparecem de uma vez, como sempre.
  var LOTE = 12;
  var verMais = document.getElementById('ver-mais');
  var telaEstreita = window.matchMedia('(max-width:700px)');
  var jaExpandiu = false;
  var recolhido = telaEstreita.matches;

  function filtrar(mercado) {
    var doMercado = 0;   // quantos existem neste mercado
    var naTela = 0;      // quantos estao aparecendo agora
    cards.forEach(function (c) {
      var bate = mercado === 'todos' || c.dataset.mercado === mercado;
      if (bate) doMercado++;
      var mostra = bate && (!recolhido || naTela < LOTE);
      if (mostra) naTela++;
      c.hidden = !mostra;
    });
    filtroBotoes.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.mercado === mercado));
    });

    var f = frase();
    var faltam = doMercado - naTela;

    // A contagem tem aria-live, entao ela e quem avisa o leitor de tela do
    // que mudou. Recolhida ela diz "12 de 55" — numero na tela e total.
    if (conta) {
      var palavra = doMercado === 1 ? f.projeto : f.projetos;
      conta.textContent = faltam > 0
        ? naTela + f.de + doMercado + palavra
        : doMercado + palavra;
    }

    if (verMais) {
      verMais.hidden = faltam < 1;
      verMais.textContent = f.verMais(faltam);
    }

    if (grade) grade.dataset.filtro = mercado;
  }

  if (verMais) {
    verMais.addEventListener('click', function () {
      jaExpandiu = true;
      recolhido = false;
      var secao = document.getElementById('projetos');
      if (secao) secao.classList.add('is-expandido');
      var antes = [].slice.call(cards).filter(function (c) { return !c.hidden; }).length;
      filtrar(grade.dataset.filtro || 'todos');
      // manda o foco para o primeiro card que acabou de entrar, senao ele
      // ficaria num botao que sumiu da tela
      var agora = [].slice.call(cards).filter(function (c) { return !c.hidden; });
      var alvo = agora[antes];
      if (alvo) {
        // os 6 cards "fora do ar" sao <div> e nao recebem foco sozinhos; os
        // outros sao <a> e ja recebem. Poe tabindex so em quem precisa, senao
        // tabindex="-1" num link o tiraria da ordem de tabulacao.
        if (!alvo.hasAttribute('href')) alvo.setAttribute('tabindex', '-1');
        alvo.focus();
      }
    });
  }

  // Girar o celular ou alargar a janela para alem de 700px mostra tudo; ao
  // voltar para a tela estreita a grade so recolhe de novo se a pessoa ainda
  // nao tiver pedido para ver o resto.
  telaEstreita.addEventListener('change', function () {
    recolhido = telaEstreita.matches && !jaExpandiu;
    if (cards.length) filtrar((grade && grade.dataset.filtro) || 'todos');
  });

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
