# Canva → código: como o design vira site

Design: **CUONCIENT — Portfólio (site)** — https://www.canva.com/design/DAHUeGAzfw4/edit
Design ID: `DAHUeGAzfw4`

## O ciclo

1. Você edita as páginas no Canva.
2. Me diz **"sincroniza o portfólio"** (ou aponta as páginas: *"mexi na 3 e na 7"*).
3. Eu leio o design pela API, comparo com o que está no código e aplico as mudanças.
4. Te devolvo o preview e os arquivos atualizados.

Não precisa exportar, printar nem me mandar nada. Eu leio direto da sua conta.

## Uma página do Canva = uma seção do site

Cada `<section>` no `index.html` carrega `data-canva-page="N"`. É esse atributo
que amarra os dois lados — é por ele que eu acho onde aplicar cada mudança.

| Página | Título no Canva | Seção no código | `id` |
|--------|-----------------|-----------------|------|
| 1 | Capa | Hero | `#capa` |
| 2 | Manifesto + diagrama | Manifesto | `#manifesto` |
| 3 | Design | Disciplina | `#design` |
| 4 | Social Media | Disciplina | `#social` |
| 5 | Devop | Abertura dos cases | `#devop` |
| 6 | Case 01 — ART 7 Epoxy | Case | `#case-art7` |
| 7 | Case 02 — DUACT Itapema | Case | `#case-duact` |
| 8 | Case 03 — V.BIKE Store | Case | `#case-vbike` |
| — | *(sem página no Canva)* | **Projetos** — grade com os 50 sites | `#projetos` |
| 9 | Anúncios | Disciplina | `#anuncios` |
| 10 | Encerramento | CTA + rodapé | `#fechamento` |

## A seção Projetos é só do código

A grade com os 57 sites não existe no Canva — ela é grande demais para caber numa
página de 1366×768 e mudaria toda vez que você entrega um site novo. Ela vive só
no `index.html`, logo depois do case da V.BIKE.

Cada projeto é um bloco de cinco linhas. Para **adicionar** um, copie o bloco de
outro projeto e troque nome e URL:

```html
<a class="proj" href="https://exemplo.com.br/" target="_blank" rel="noopener">
  <span class="proj__media"><span class="proj__mono" style="--h:210"><i>EX</i></span></span>
  <span class="proj__name">Exemplo</span>
</a>
```

O card mostra só o nome. O domínio aparecia numa segunda linha abaixo e foi
retirado — a URL continua no `href`, é para onde o clique leva.

O `--h` é o matiz do fundo (0 a 360) — escolha o que combinar com a marca do
cliente. Se tiver print do site, troque o `proj__mono` por:

```html
<span class="proj__shot" style="background-image:url('URL-DA-IMAGEM')"></span>
```

Hoje 49 projetos usam print local (`assets/thumbs/<slug>.jpg`, 900px de largura),
6 ainda usam a miniatura antiga vinda do Wix por URL, e 2 mostram as iniciais.
Para **remover** um projeto, apague o bloco inteiro — e atualize o número no
texto de abertura da seção.

Os prints são gerados pelo `capturar-prints.js` do kit, que salva em 2560px; eu
reduzo para 900px antes de colocar em `assets/`, porque o card exibe a 297px e
900 já cobre tela retina com folga. Os 2560px originais pesariam 10x à toa.

## Os mockups dos cases

Os três cases mostram o print real do site dentro de uma moldura de navegador e
outra de celular. O print é um `<img class="frame__shot">` que preenche a
moldura com `object-fit:cover` e `object-position:top center` — o topo do site
fica sempre visível, o rodapé é que sai do corte.

Os arquivos ficam em `assets/cases/<slug>-desktop.jpg` (1400px) e
`<slug>-mobile.jpg` (420px). Até a captura funcionar, essas molduras traziam uma
recriação da home em HTML/CSS; ela foi removida quando os prints chegaram.

### O celularzinho tem de ser filho direto de `.case__media`

Esta é a estrutura, e ela não admite `</div>` sobrando:

```html
<div class="case__media">        <!-- position:relative — é a âncora -->
  <div class="browser">
    <div class="browser__bar">…</div>
    <div class="browser__view"><img class="frame__shot" …></div>
  </div>
  <div class="phone">            <!-- irmão do .browser, não filho -->
    <div class="phone__view">
      <span class="phone__notch"></span>
      <img class="frame__shot" …>
    </div>
  </div>
</div>
```

`.phone` é `position:absolute`, então ele se ancora no ancestral posicionado
mais próximo. Se um `</div>` a mais fechar o `.case__media` cedo demais, o
celular passa a se ancorar em outra coisa e **aparece deslocado**, longe do
case. Foi exatamente o que aconteceu na troca das recriações pelos prints.

O quanto o celular vaza para fora da moldura (`right`/`bottom` negativos)
precisa ser menor que a calha do `.wrap` — 24px no geral, 16px abaixo de 620px.
Passando disso, a página inteira ganha rolagem horizontal no tablet.

## A marca

Os arquivos da marca ficam em `assets/brand/`:

| Arquivo | Para quê |
|---------|----------|
| `logo-mark.svg` | só os anéis, sem disco, em `currentColor` — é o que aparece no site |
| `favicon.svg` | o badge completo (disco `#212121` + anéis brancos) — aba do navegador |
| `favicon-32.png`, `favicon-16.png` | plano B para navegador que não lê SVG |
| `apple-touch-icon.png` | 180×180, sem transparência — o iOS arredonda sozinho |
| `logo-badge-512.png` | avatar de rede social, WhatsApp, `og:image` |

No HTML a marca é declarada **uma vez só**, num `<symbol id="marca-cuoncient">`
logo depois do `<body>`. A nav e o hero apontam para ela:

```html
<svg class="brand__mark" aria-hidden="true"><use href="#marca-cuoncient"/></svg>
```

Para trocar a marca, mexa só no `<symbol>` — os dois lugares seguem juntos. O
preenchimento é `currentColor`, então a cor vem do CSS do texto ao lado; num
fundo claro ela vira escura sozinha, sem precisar de outro arquivo.

O `<svg class="sprite">` que embrulha o símbolo tem `position:absolute` e
tamanho zero no CSS — ele existe só para guardar o desenho, não ocupa espaço.

**Pendência:** o `og:image` no `<head>` está com caminho relativo. WhatsApp e
LinkedIn não resolvem caminho relativo — quando o domínio final existir, troque
por uma URL absoluta (`https://seudominio.com/assets/brand/logo-badge-512.png`).

## Os links de WhatsApp

Todo contato do site cai no WhatsApp **+55 11 93352-8251**. São **7 links**, com
o número escrito direto no `href` — não há JavaScript montando nada, então
funcionam mesmo com script desligado. Para trocar o número, procure por
`wa.me/` no `index.html`.

Cada um leva uma frase diferente já digitada, para você saber de onde a pessoa
veio antes de responder:

| Onde | Frase que já vem escrita |
|------|--------------------------|
| Botão da nav | *…e queria um orçamento.* |
| Seção Design | *…e queria um orçamento de design.* |
| Seção Social Media | *…e queria um orçamento de social media.* |
| Seção Anúncios | *…e queria um orçamento de anúncios.* |
| Fechamento | *…e queria um orçamento.* |
| Rodapé | *…e queria falar com você.* |
| Botão flutuante | *…e queria um orçamento.* |

Todas começam com "Oi! Vim pelo site da Cuoncient". A frase vai codificada na
URL (`?text=`) — se for editar na mão, lembre que espaço é `%20` e acento vira
sequência (`ç` = `%C3%A7`). Mais seguro é me pedir a troca.

O **botão flutuante** (`.zap`) tem duas regras no `script.js`: só aparece depois
que a capa sai da tela, e some quando o rodapé chega — lá ele tapava a linha do
copyright, e o rodapé já tem o link.

O ícone dele é um balão de conversa que desenhei, não o símbolo do WhatsApp. Se
quiser o oficial, ele está em whatsappbrand.com e é só trocar o `<svg>`.

**Atenção:** hoje o site não tem mais nenhum e-mail de contato — o link do
rodapé virou WhatsApp. Se quiser o e-mail de volta como segunda opção, é uma
linha.

## A galeria de design gráfico

Dentro da seção **Design** (`#design`) há uma grade com as peças de design
gráfico, em `assets/design/`. Cada peça é um `<figure class="dgal__item">` com
imagem, cliente e descrição. As imagens são **locais**, não vêm de fora.

Dois detalhes que quebram o layout se esquecidos:

- O CSS precisa de `height:auto` junto com `aspect-ratio:4/5`. Sem isso o
  atributo `height` do `<img>` vence e o card estica.
- Mantenha os atributos `width`/`height` no `<img>` com o tamanho real do
  arquivo — é o que evita o layout pular enquanto a imagem carrega.

## A galeria de vídeo

Dentro da seção **Social Media** (`#social`) ficam os filmes de marca, em
`assets/video/`. Cada peça tem **dois** arquivos: o `.mp4` e um `.jpg` de mesmo
nome, que é o quadro de capa mostrado antes de dar play.

```html
<figure class="vgal__item">
  <video class="vgal__v" style="--ar:16/9" controls muted playsinline preload="none"
         poster="assets/video/cliente.jpg">
    <source src="assets/video/cliente.mp4" type="video/mp4">
  </video>
  <figcaption><b>Cliente</b><span>Filme de marca · 0:24</span></figcaption>
</figure>
```

- `--ar` é a proporção do vídeo: `16/9` deitado, `9/16` em pé. Tem que bater com
  o arquivo, senão a capa fica esticada.
- O vertical leva a classe extra `vgal__item--tall`, que faz a coluna dele ocupar
  duas linhas. A divisão `41fr 59fr` da grade é calculada para o vertical ter
  exatamente a altura dos dois horizontais empilhados — mexer nela abre um buraco.
- `preload="none"` é de propósito: sem isso o navegador baixa os 5 MB de vídeo
  em toda visita, mesmo de quem não der play.

Para gerar a capa de um vídeo novo, um quadro do meio serve:
`ffmpeg -ss 12 -i cliente.mp4 -frames:v 1 -q:v 4 cliente.jpg`

## O que eu consigo ler do Canva

A API devolve, para cada elemento da página:

- **texto** — o conteúdo exato, incluindo quais trechos estão em negrito
- **tipografia** — tamanho em px, peso, cor hex, entrelinha, espaçamento, alinhamento
- **geometria** — posição (top/left) e tamanho (width/height) em px, numa página de 1366×768
- **cores** — preenchimento e contorno de formas, cor de fundo da página
- **imagens** — qual asset está em cada moldura, e o recorte aplicado

Ou seja: mudou a cor de um título, o tamanho de um texto, a ordem de dois blocos,
a foto de um case ou a palavra de um botão — eu vejo e reproduzo.

## Onde cada tipo de mudança aterrissa

| Você muda no Canva | Eu mexo em |
|--------------------|-----------|
| Cor de fundo, de texto, de destaque | Tokens no `:root` do `styles.css` |
| Tamanho de título / corpo | Tokens `--fs-*` no `:root` |
| Fonte | `--font` + o `<link>` do Google Fonts |
| Texto de qualquer bloco | O HTML da seção correspondente |
| Foto de um case | A URL em `.site__photo` daquele case |
| Espaçamento entre seções | `--pad-section` e `--gap-col` |
| Ordem das páginas | Ordem das `<section>` + o menu |

Os tokens ficam todos no topo do `styles.css`, num bloco comentado. É de propósito:
mudança de cor ou de escala tipográfica vira edição de uma linha, não caça ao valor
espalhado pelo arquivo.

## O que o Canva não sabe dizer

Cada página é fixa em 1366×768. O site é fluido. Então:

- **Você desenha o desktop, eu derivo o mobile.** As regras de mobile ficam no
  bloco `RESPONSIVO` no fim do `styles.css`. Se quiser algo específico no celular,
  me fala em texto — não dá para expressar isso no Canva.
- **Posição vira intenção, não pixel.** Se você move um bloco 12px para a direita,
  eu não replico os 12px: eu leio como "esse bloco encostou mais na margem" e
  ajusto o espaçamento do lado. Pixel a pixel só quebraria em outras telas.
- **Efeitos** (brilho da capa, sombra dos mockups, blur) são CSS. Se quiser mudar,
  descreve em texto que eu ajusto.

## Combinados para não quebrar o vínculo

- **Pode** editar texto, cor, fonte, tamanho, foto e posição à vontade.
- **Pode** adicionar ou apagar páginas — só me avisa quais, para eu recriar ou
  remover a seção e atualizar esta tabela.
- **Evite** reordenar páginas sem falar, senão o `data-canva-page` aponta para o
  lugar errado. Se reordenar, é só me dizer a nova ordem.
- Trabalhe sempre **nesse** design. Se duplicar, o ID muda e eu passo a ler a
  cópia velha.

## Pendências

- [ ] **Logo oficial.** O símbolo no código é um SVG que desenhei olhando o
      template. Me manda o arquivo e eu troco.
- [ ] **Páginas 3 e 4 do Canva** ainda têm clientes errados (Mara Flor na Design;
      Coisa Querida e Caramelia na Social Media). Só o Dr. Wandyk está certo.
      Me passa quem entra e os links, que eu monto igual aos outros três.
- [ ] **Fontes das páginas 6, 7 e 8** saíram na fonte padrão do Canva — a API não
      deixa escolher família. Aplica a fonte das outras páginas por aí.
- [ ] **8 prints faltando** — CEEA, Azzurro Interiores, Turnflix, XPCon, Doege
      Home, Minimall, Daiana Santos e Cris Cassiano. Seis deles ainda mostram a
      miniatura antiga (que vem de fora, pelo Wix); dois mostram as iniciais.
- [ ] **Peças de design em baixa resolução.** As 4 peças da galeria vieram do
      LinkedIn, que recomprime tudo: três estão em 480px e uma em 800px. Ficam
      aceitáveis no tamanho do card, mas suavizadas em tela retina. Se achar os
      arquivos originais, é só trocar em `assets/design/`.
- [ ] **Confirmar a atribuição das duas peças da Eduarda Zucki.** Deduzi pelo
      filme de marca, que mostra o mesmo interior do moodboard. Se forem de
      outro cliente, me avisa.
- [ ] **Foto quebrada no Art 7.** O arquivo `2026/08/1920x844.jpg` no servidor do
      art7epoxy.com está corrompido — não abre. Vale trocar lá.
