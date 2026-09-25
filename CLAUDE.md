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
| 10 | `#fechamento` | CTA final + rodapé | 10 |

`#projetos` não tem página no Canva de propósito — é grande demais para caber
numa página e muda toda vez que o Gui entrega um site novo.

**A grade se comporta diferente no celular.** Até 700px ela abre em duas
colunas com um lote de 12 cards e um botão "ver mais"; o filtro só vira
`sticky` depois que a pessoa pede o resto. Acima de 700px nada disso acontece
e os 55 aparecem de uma vez — no desktop o volume é o argumento. O lote vive
em `LOTE` no `script.js` e o botão nasce com `hidden`: sem JavaScript a grade
aparece inteira, que é o certo para o robô do Google.

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
`aria-live` montado a partir do próprio DOM — ele acompanha o PT/EN sozinho.

**Contato.** 7 links de WhatsApp com o número escrito direto no `href`, sem
JavaScript montando nada. Cada um leva uma frase diferente. Procure `wa.me/`.

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

**A barra do topo não encolhe mais para caber.** Abaixo de 980px ela carrega só
a marca e o botão do menu; seções, idioma e CTA vivem no painel. Se voltar a
entrar coisa na barra, a pílula do orçamento fura a calha do `.wrap` (ia até
374,3px num viewport de 375) e a tipografia começa a ser espremida para 7–10px.

**Foto quebrada no servidor do Art 7.** `art7epoxy.com/wp-content/uploads/2026/08/1920x844.jpg`
está corrompido no servidor do cliente. Não é problema do código.

## Decisões já tomadas (não reabrir sem motivo)

- **Site em código**, não no Wix — mesmo com a conta Wix cheia de sites de cliente.
- **Figma descartado**: exigiria remontar o site lá; o conector só lê.
- **Sem framework.** Estático puro foi escolha, não limitação.
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
