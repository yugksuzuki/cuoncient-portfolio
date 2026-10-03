# Portfólio Cuoncient — contexto do projeto

> Lido automaticamente pelo Claude Code. Fale português (BR) com o Gui.
> Última revisão: 10/09/2026.

## O que é

Site de portfólio da **Cuoncient**, a agência do Guilherme Keidi Suzuki (Gui).
Página única, estática, sem build. O visual nasceu de um design que o Gui mantém
no Canva; o código é a implementação dele e já andou além.

## Estado atual

**No ar em https://cuoncient-portfolio.vercel.app** — repositório público
`github.com/yugksuzuki/cuoncient-portfolio` ligado à Vercel, republicando a cada
`git push`. As 11 seções montadas, responsivo verificado de 360px a 1440px sem
rolagem horizontal, imagens todas carregando. O que falta está em "Pendências", no fim.

## Stack

HTML + CSS + JS puros. Zero dependências, zero build. Live Server no VS Code
para desenvolver; Vercel para publicar (sem build command, sem output directory).

## Estrutura

```
index.html      11 seções
styles.css      bloco TOKENS no topo, depois estilos na ordem das seções
script.js       nav grudada + botão do WhatsApp + reveal on scroll
projetos.json   fonte da grade de 55 sites (o HTML já vem com os cards escritos)
assets/
  brand/        marca vetorizada + favicons          (6 arquivos)
  cases/        prints dos 3 cases, desktop e mobile (6)
  design/       peças de design gráfico              (4)
  thumbs/       prints dos sites da grade            (49)
  video/        3 filmes de marca + as capas         (6)
  vendor/       GSAP + ScrollTrigger, auto-hospedados  (2)
```

### As seções

| # | `id` | Conteúdo | Página no Canva |
|---|------|----------|-----------------|
| 1 | `#capa` | Hero: "This is not a (simple) agency marketing" | 1 |
| 2 | `#manifesto` | Texto institucional + Venn das disciplinas | 2 |
| 3 | `#design` | Design + galeria de peças | 3 |
| 4 | `#social` | Social Media + galeria de vídeo | 4 |
| 5 | `#devop` | Abertura dos cases | 5 |
| 6 | `#case-art7` | Case ART 7 Epoxy | 6 |
| 7 | `#case-duact` | Case DUACT Itapema | 7 |
| 8 | `#case-vbike` | Case V.BIKE Store | 8 |
| — | `#projetos` | Grade com os 55 sites | *só no código* |
| 9 | `#anuncios` | Anúncios | 9 |
| — | `#automacoes` | Automações & IA + a esteira | *só no código* |
| 10 | `#fechamento` | CTA final + rodapé | 10 |

`#projetos` não tem página no Canva de propósito — é grande demais para caber
numa página e muda toda vez que o Gui entrega um site novo.

**A grade se comporta diferente no celular.** Até 700px ela abre em duas
colunas com um lote de 12 cards e um botão "ver mais"; o filtro só vira
`sticky` depois que a pessoa pede o resto. Acima de 700px nada disso acontece
e os 55 aparecem de uma vez — no desktop o volume é o argumento. O lote vive
em `LOTE` no `script.js` e o botão nasce com `hidden`: sem JavaScript a grade
aparece inteira, que é o certo para o robô do Google.

**A esteira de Automações & IA.** Segunda seção sem página no Canva. O que ela
descreve é o bot do blog da Art 7 como ele roda de verdade — ver
`Projetos/Bot do blog Art 7` no cofre. Nada ali é promessa; se o bot mudar, a
seção muda junto.

Mecanicamente é um número só: `--p`, de 0 a 1, escrito pelo ScrollTrigger
conforme a rolagem. O CSS decide o que fazer com ele — na horizontal vira
largura do trilho, na vertical vira altura. **O padrão é 1**: sem JS, sem GSAP,
com o download quebrado ou com `prefers-reduced-motion`, a esteira aparece
inteira e acesa. A classe `.is-vivo` só entra depois que o GSAP pinta o
primeiro estado — é ela que autoriza apagar os nós, e é por isso que nada
pisca. Inverter essa ordem traz o piscar de volta.

**"Também rodando hoje".** Abaixo da esteira, seis cartões (`.auto`) com as
outras automações em produção: vigia das páginas (QA semanal da Art 7), blog →
Google (OneUp), LP a partir do Instagram, proposta que vira página, Cérebro da
agência e resumo da manhã. A regra é a mesma da esteira: **só entra o que roda
de verdade**. A lista foi conferida em 03/10/2026 contra o n8n, o GitHub e
`Automações/Mapa das ferramentas` no cofre. Workflow desligado ou em teste
(o RAG da Art 7, Instagram → identidade visual) fica de fora até virar rotina;
automação que for desligada sai do site. A grade é `auto-fill` com
`minmax(min(100%,300px),1fr)` — três colunas no desktop, duas no tablet, uma no
celular, sem media query. O `min()` é o que segura os 320px.

## Convenções

**Tokens.** Todo valor de design mora no `:root` do `styles.css`, num bloco
comentado no topo. Mudança de cor ou tamanho é edição de uma linha lá — não
espalhe literais pelo arquivo.

O ciano de destaque é guardado como **triplo RGB** (`--glow-rgb:26,165,184`)
porque é sempre usado com alpha variável: `rgba(var(--glow-rgb),.55)`.

**`data-canva-page`.** Cada `<section>` carrega o número da página correspondente
no Canva. Não remova; se reordenar seções, renumere e atualize o `MAPPING.md`.

**A marca.** Declarada **uma vez só**, num `<symbol id="marca-cuoncient">` logo
depois do `<body>`. Nav, hero e o miolo do Venn apontam para ela com `<use>`.
Para trocar a marca, mexa só no símbolo.

O Venn era a exceção: tinha seis círculos desenhados à mão no lugar do
logotipo, parecido de longe e errado de perto. Se aparecer outro `<svg>` com
formas soltas querendo ser a marca, é bug — troque por `<use>`.

**O Venn é interativo, e o `data-venn` é a fonte da verdade.** Cada rótulo diz
em quais círculos ele cai (`t` Briefing, `b` Devop, `l` Anúncios, `r` Design), e
isso não é opinião: os quatro círculos têm raio 29% com centros em (50,29),
(50,71), (29,50) e (71,50), então a posição decide sozinha. Mexeu num `left`/
`top` de rótulo, recalcule o `data-venn`. Passar o mouse acende; clicar trava;
Esc solta. Quem não enxerga recebe a mesma informação pelo `.venn__fala`, um
`aria-live` montado a partir do próprio DOM — ele acompanha PT/EN/ES sozinho.

**Contato.** 7 links de WhatsApp com o número escrito direto no `href`, sem
JavaScript montando nada. Cada um leva uma frase diferente, e cada um leva
essa frase nos três idiomas (`data-en-href`, `data-es-href`) — são 21 `href`
ao todo, mais o do schema. Procure `wa.me/`.

**O site fala três idiomas: português, inglês e espanhol.** O português é o
que está escrito no HTML — é ele que é servido, indexado e lido pelo robô do
WhatsApp. Os outros dois vivem em atributos e entram sem recarregar a página:

| Atributo | Traduz |
|----------|--------|
| `data-en` / `data-es` | o texto (aceita `<b>`, porque a troca é de `innerHTML`) |
| `data-en-href` / `data-es-href` | o endereço — as frases do WhatsApp |
| `data-en-label` / `data-es-label` | o `aria-label` |
| `data-en-alt` / `data-es-alt` | o `alt` das fotos que fogem do padrão |

O `data-pt` (e irmãos) é criado pelo script na primeira troca e guarda o
original, então ir e voltar não perde nada. Idioma que não declare uma dessas
partes cai no português em vez de esvaziar o elemento.

Os alts das 55 miniaturas não usam atributo: seguem o padrão `Home do site X`
e três expressões regulares por idioma dão conta de todos — ver `PADROES_ALT`.

**Para entrar com um quarto idioma:** sigla em `IDIOMAS`, uma linha em
`FRASES`, outra em `TAG_HTML`, outra em `PADROES_ALT`, um botão no seletor, e
os `data-<sigla>` no HTML. O resto do `script.js` não precisa saber que ele
existe — o seletor de elementos traduzíveis nasce da própria tabela.

## Armadilhas conhecidas

**O celularzinho dos cases precisa ser filho direto de `.case__media`.** Ele é
`position:absolute` e se ancora no ancestral posicionado mais próximo. Um
`</div>` sobrando que feche o `.case__media` cedo demais faz o mockup aparecer
deslocado, longe do case. Já aconteceu uma vez.

**O quanto o celular vaza da moldura** (`right`/`bottom` negativos) precisa ser
menor que a calha do `.wrap` — 24px no geral, 16px abaixo de 620px. Passando
disso, a página inteira ganha rolagem horizontal no tablet.

**E agora ela ganha de verdade: o `body{overflow-x:hidden}` saiu.** Ele existia
para engolir a pílula do orçamento, que furava a calha no celular, e engolia
calado qualquer outro estouro junto — foi por isso que aquele bug viveu tanto
tempo sem ninguém ver. A pílula foi resolvida na origem e uma varredura de
320px a 1920px (mais menu aberto e grade expandida) não acha mais nada
transbordando. Sem o curativo, um estouro novo aparece como barra de rolagem
em vez de sumir sem aviso, e `position:sticky` volta a funcionar nos
descendentes. O brilho da capa continua contido pelo `overflow:hidden` do
próprio `.hero` — esse é intencional, o glow vaza de propósito.

**A animação de entrada não pode depender do tamanho do bloco.** O
`IntersectionObserver` com `threshold: 0.08` exigia 8% do elemento visível — a
grade de projetos, com ~17.000px numa coluna no celular, nunca chegava lá e a
seção inteira ficava com `opacity: 0`. Hoje é uma varredura no scroll presa a
`requestAnimationFrame`, sem relação com a altura. E o `opacity: 0` mora atrás
de `.js` (classe posta por um script no `<head>`): JavaScript quebrado deixa o
site visível em vez de em branco.

**`aspect-ratio` sozinho não vence o atributo `height` do `<img>`.** Nas galerias
é obrigatório `height:auto` junto, senão o card estica.

**Os mockups são medidos em `cqw`**, não em px — é o que faz o "sitezinho"
encolher junto com a moldura no celular. `100cqw` = largura da moldura.

**`backdrop-filter` num ancestral prende `position:fixed`.** Vale para
`filter`, `transform` e `will-change` também: o elemento vira bloco de contenção e
o filho fixo passa a se ancorar nele, não na janela. Foi por isso que o painel
do menu nasceu preso à altura da barra. Abaixo de 980px a barra abre mão do
desfoque (`.nav{backdrop-filter:none}`) e quem desfoca passa a ser o painel.

**`visibility` não pode entrar na `transition` de um painel que recebe foco.**
Enquanto ela interpola, o navegador ainda trata o elemento como invisível e
`focus()` não pega. O padrão certo é `visibility 0s linear .3s` no estado
fechado e `0s linear 0s` no aberto: instantânea ao abrir, espera o fade ao
fechar.

**A barra do topo é o lugar mais justo do site, e o espanhol é quem aperta.**
Ela carrega marca, sete seções, o seletor de três idiomas e a pílula do
orçamento. Em espanhol os rótulos são os mais longos ("Nosotros", "Publicidad",
"Proyectos", "Automatización") e a pílula vira "Pide tu presupuesto".

São **três regimes, e os limites saíram de medição**, não de chute — todos com
os rótulos em espanhol, que é o pior caso:

| Largura | Regime | Por quê |
|---|---|---|
| até 1099px | painel | nenhum aperto salva: em 1024 a pílula furava a calha em 64px e saía 25px da tela; em 981, furava 107px e saía 68px |
| 1100–1239px | barra apertada | `@media (min-width:1100px) and (max-width:1239px)` encolhe só a respiração entre os itens — tipografia nenhuma muda de tamanho |
| 1240px+ | barra normal | sem aperto a pílula só cabe a partir daqui |

O limite era 980/1180 e subiu em 02/10/2026, quando o sétimo item
("Automações") entrou no menu. **Mexeu no menu, nos rótulos ou no texto da
pílula? Remeça em espanhol nos três regimes** e mova o número em três lugares:
no `@media (max-width:1099px)`, na faixa apertada e no `resize` do `script.js`.

**E atenção ao método:** varredura de larguras **não pega** esse bug. A nav é
`position:fixed`, e elemento fixo não entra no `scrollWidth` do documento — a
pílula sai da tela sem gerar rolagem horizontal nenhuma. O único teste que
pega é medir a borda direita da pílula contra a borda direita do `.wrap`.

**Abaixo do limite a barra não encolhe para caber.** Ela fica só com a marca e
o botão do menu; seções, idioma e CTA vivem no painel. Se voltar a entrar coisa
na barra, a pílula fura a calha (ia até 374,3px num viewport de 375) e a
tipografia começa a ser espremida para 7–10px.

**Foto quebrada no servidor do Art 7.** `art7epoxy.com/wp-content/uploads/2026/08/1920x844.jpg`
está corrompido no servidor do cliente. Não é problema do código.

## Decisões já tomadas (não reabrir sem motivo)

- **Site em código**, não no Wix — mesmo com a conta Wix cheia de sites de cliente.
- **Figma descartado**: exigiria remontar o site lá; o conector só lê.
- **Sem framework.** Estático puro foi escolha, não limitação. A tabela de
  decisão da skill `cuoncient-web-stack` põe "portfolio" na coluna Vanilla;
  React fica para LP, dashboard e workbench.
- **GSAP é exceção consciente, e só para a esteira.** Entrou em 02/10/2026 a
  pedido do Gui. Precedente: o Eloá já é Tailwind + GSAP + esbuild, então GSAP
  sem React não é novidade na casa. Três regras que o mantêm honesto:
  **(1)** auto-hospedado em `assets/vendor/` — nada de CDN, o site não faz
  requisição externa; **(2)** baixado sob demanda, só quando a esteira chega a
  menos de duas telas (116 KB brutos, ~47 KB na rede, contra 3 KB de todo o
  resto do JS — quem sai antes não paga); **(3)** nenhuma outra seção depende
  dele. Se um dia sair, só a esteira perde o scrub e volta a aparecer inteira.
- **Repositório público** no GitHub, nome `cuoncient-portfolio`.
- **`assets/` vai para o repositório.** São 8,6 MB, maior arquivo 2,7 MB, bem
  abaixo do limite do GitHub. Não precisa de LFS. Se `assets/` voltar para o
  `.gitignore`, o site sobe sem imagem nenhuma.
- **URL duplicada:** quando um projeto tem dois endereços, usar o subdomínio do
  Wix e não o domínio próprio — se tem dois, o comprado provavelmente caiu.
- **Contato é WhatsApp**, não e-mail. Em repo público, `mailto:` vira alvo de
  scraper de spam.
- **Não invente métricas de resultado** nos cases.

## Pendências

- [x] ~~**6 prints faltando** na grade~~ — resolvido por outro caminho. CEEA,
      Azzurro Interiores, Turnflix, XPCon, Doege Home e Minimall ganharam o
      selo "fora do ar", e a miniatura que vinha do Wix foi **baixada para
      `assets/thumbs/`**. Fora o Google Fonts, o site não faz mais nenhuma
      requisição externa. Daiana Santos e Cris Cassiano saíram da grade.
      Chegando o print de verdade, é só trocar o arquivo.
- [x] ~~`og:image` relativo~~ — resolvido. Open Graph, Twitter Card e JSON-LD
      apontam para `https://cuoncient-portfolio.vercel.app`. Trocou de domínio?
      São 12 ocorrências no `index.html`.
- [ ] **Originais das peças de design.** As 4 vieram do LinkedIn recomprimidas
      (480 a 800px).
- [ ] **Confirmar a atribuição da Eduarda Zucki** em duas peças da galeria —
      foi deduzida pelo filme de marca dela, não confirmada pelo Gui.
- [ ] **Métricas dos cases.** Hoje descrevem escopo, não resultado.
