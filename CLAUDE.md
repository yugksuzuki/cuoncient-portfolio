# Portfólio Cuoncient — contexto do projeto

> Lido automaticamente pelo Claude Code. Fale português (BR) com o Gui.
> Última revisão: 10/09/2026.

## O que é

Site de portfólio da **Cuoncient**, a agência do Guilherme Keidi Suzuki (Gui).
Página única, estática, sem build. O visual nasceu de um design que o Gui mantém
no Canva; o código é a implementação dele e já andou além.

## Estado atual

**Completo e no ar em estrutura.** As 11 seções montadas, responsivo verificado
de 360px a 1440px sem rolagem horizontal, 59 imagens carregando, nenhuma
quebrada. O que falta está em "Pendências", no fim.

## Stack

HTML + CSS + JS puros. Zero dependências, zero build. Live Server no VS Code
para desenvolver; Vercel para publicar (sem build command, sem output directory).

## Estrutura

```
index.html      11 seções
styles.css      bloco TOKENS no topo, depois estilos na ordem das seções
script.js       nav grudada + botão do WhatsApp + reveal on scroll
projetos.json   fonte da grade de 57 sites (o HTML já vem com os cards escritos)
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
| — | `#projetos` | Grade com os 57 sites | *só no código* |
| 9 | `#anuncios` | Anúncios | 9 |
| 10 | `#fechamento` | CTA final + rodapé | 10 |

`#projetos` não tem página no Canva de propósito — é grande demais para caber
numa página e muda toda vez que o Gui entrega um site novo.

## Convenções

**Tokens.** Todo valor de design mora no `:root` do `styles.css`, num bloco
comentado no topo. Mudança de cor ou tamanho é edição de uma linha lá — não
espalhe literais pelo arquivo.

O ciano de destaque é guardado como **triplo RGB** (`--glow-rgb:26,165,184`)
porque é sempre usado com alpha variável: `rgba(var(--glow-rgb),.55)`.

**`data-canva-page`.** Cada `<section>` carrega o número da página correspondente
no Canva. Não remova; se reordenar seções, renumere e atualize o `MAPPING.md`.

**A marca.** Declarada **uma vez só**, num `<symbol id="marca-cuoncient">` logo
depois do `<body>`. Nav e hero apontam para ela com `<use>`. Para trocar a marca,
mexa só no símbolo.

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

**`aspect-ratio` sozinho não vence o atributo `height` do `<img>`.** Nas galerias
é obrigatório `height:auto` junto, senão o card estica.

**Os mockups são medidos em `cqw`**, não em px — é o que faz o "sitezinho"
encolher junto com a moldura no celular. `100cqw` = largura da moldura.

**6 miniaturas da grade vêm de `static.wixstatic.com`.** São os projetos cujo
print ainda não chegou. Em ambiente sem acesso a esse domínio elas aparecem como
blocos escuros — não é bug.

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

- [ ] **8 prints faltando** na grade: CEEA, Azzurro Interiores, Turnflix, XPCon,
      Doege Home, Minimall, Daiana Santos, Cris Cassiano. Enquanto não chegam, 6
      usam a miniatura antiga do Wix e 2 mostram as iniciais. Ver `PASSO-A-PASSO.md`.
- [ ] **`og:image` com caminho relativo.** WhatsApp e LinkedIn não resolvem
      relativo — trocar por URL absoluta quando o domínio existir.
- [ ] **Originais das peças de design.** As 4 vieram do LinkedIn recomprimidas
      (480 a 800px).
- [ ] **Confirmar a atribuição da Eduarda Zucki** em duas peças da galeria —
      foi deduzida pelo filme de marca dela, não confirmada pelo Gui.
- [ ] **Métricas dos cases.** Hoje descrevem escopo, não resultado.
