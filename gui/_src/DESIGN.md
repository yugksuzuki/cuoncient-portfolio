# DESIGN.md: o DNA do currículo do Gui

> Página: suzuki.cuoncient.com, também em cuoncient.com/gui.
> Fonte da verdade do visual. Mudou um token, um movimento ou uma regra aqui? Mude no código também, e vice-versa.
> Revisado em 26/10/2026 com Impeccable (craft floor e os comandos de Enhance: animate, colorize, typeset, layout, delight), Hallmark (floor e pre-emit critique) e Stop Slop no texto.

## O que a página precisa fazer

Quem pergunta "tem um currículo seu sobre IA?" precisa sair sabendo três coisas em um minuto:

1. O Gui publica apps (lojas e APK) e põe agentes e chatbots para rodar em cliente de verdade.
2. Cada afirmação tem prova: identificador do app, custo por artigo, nota antes e depois.
3. Como falar com ele (WhatsApp) e onde baixar o PDF.

O argumento da página são os recibos, e nunca os adjetivos.

## Mundo visual: tinta e carimbo

Escolhida pelo Gui em 26/10/2026, no lugar da paleta azul e ciano. A página é tinta preta, papel e um só acento: o vermelho do carimbo 鈴木. Nenhuma outra cor entra, nem a dos clientes.

| Token | Hex | Papel |
|---|---|---|
| `sumi` 墨 | `#0c0b0a` | fundo. Preto de tinta, quente, nunca `#000` |
| `sumi-2` | `#151311` | faixas alternadas (apps, resultados, formação, contato) e rodapé |
| `sumi-3` | `#1d1a17` | a faixa da agenda e a moldura do celular nos cases |
| `papel` | `#ece6dc` | texto principal, partículas da capa, linha "agora" da agenda |
| `branco` | `#f6f1e8` | hover do botão cheio |
| `nevoa` | `#a39b8f` | texto de apoio (7,2:1 no sumi) |
| `gin` 銀 | `#8a8378` | legendas e metadados (5,2:1) |
| `shu` 朱 | `#d4442c` | o acento: carimbo, kanji, partículas de 鈴木 e 恵二, barras, medidores, indicador da barra. Só em tamanho grande ou em traço (4,4:1) |
| `shu-claro` | `#e66a52` | o acento em texto pequeno: links, provas, números, anos (6,1:1) |

Regra de proporção: o vermelho marca o que é prova ou ação. Se um bloco inteiro ficar vermelho, está errado.

No PDF o acento vira `#a8321d` sobre o papel branco.

## Tipo

- **Archivo variável** (largura 62–125, peso 100–900) para tudo que é título e texto. O eixo de largura é a voz da página.
  - Nome: largura 112, peso 760, e respira (ver Movimento).
  - Títulos de seção: largura 72, peso 540, `line-height .94`, no máximo 96 px. Ficam parados: a largura só se mexe no nome.
  - Nomes de sistema e app: largura 82, que abre para 104 no hover e quando o painel está aberto.
  - Corpo: 17,5 px, peso 360 (um passo acima do normal, por ser texto claro no escuro), `line-height 1.7`, até 64ch.
- **Shippori Mincho** nas frases de abertura (`.sec__lead`, `.hero__role`, `.fim__p`) e em todo japonês. É ela que dá o tom de livro ao lado do Archivo.
- Sem caixa-alta em rótulo, sem sobretítulo acima de título, sem palavra destacada em cor dentro de título.

## Layout

- Shell de 1240 px, calha de 16 px no celular e 32 px a partir de 640.
- Cabeçalho de seção em 7/5: título à esquerda, abertura em Mincho à direita, alinhados pela base.
- Listas com fio de 1 px (`linha`), sem cartões. Hierarquia por tamanho e largura de letra, não por caixa.
- Numeração só onde há sequência real (linha do tempo). Sistemas e apps não levam número.
- Faixas `sumi-2` alternam com o sumi para separar blocos longos sem precisar de borda.

## Assinatura

O nome respira. Uma onda lenta passa pelas letras no eixo de largura do Archivo, e as letras perto do ponteiro condensam e engrossam como numa lente. É o único lugar onde a tipografia se mexe sozinha.

## Movimento

Uma regra do Impeccable (animate) guia tudo: movimento explica estado ou é o único momento autoral que a página ganhou. Tudo respeita `prefers-reduced-motion` e nada some se o JavaScript falhar.

| Onde | O que | Por quê |
|---|---|---|
| Página inteira | 11 mil partículas (7 mil no celular) numa tela fixa atrás de todo o conteúdo. Na capa montam 鈴木 atrás do retrato; em cada seção mudam de desenho (ver Partículas) | o fio que atravessa a página |
| Capa, clique | clicar ou tocar na foto ou nas partículas troca o desenho (鈴木 → retrato → marca → 恵二) com uma explosão que sai do ponto clicado; o carimbo da capa pulsa junto. No retrato a foto se desfaz (opacidade e desfoque) e as partículas viram a silhueta dele, no mesmo lugar | ele vira tinta; o nome inteiro, 鈴木 恵二, aparece pela mão de quem visita |
| Capa, arrastar | arrastar gira o desenho em 3D (as formas têm espessura), com inércia, e ele volta sozinho | mostra que é 3D de verdade |
| Capa, cursor e rolagem | o cursor afasta e avermelha as partículas perto dele; rolar rápido agita o enxame | resposta ao gesto |
| Capa, botão | "Trocar o desenho" faz a mesma troca pelo teclado, e o nome da forma embaralha (ScrambleText). O carimbo 鈴木 ao lado da foto também é botão (`role=button`, Enter e espaço), porque no celular o botão fica abaixo da dobra | acesso sem mouse |
| Nome | entrada letra a letra, depois a respiração e a lente | assinatura |
| Barra | o traço vermelho desliza até a seção atual; uma linha de leitura enche com a rolagem | onde estou e quanto falta |
| Títulos | as letras chegam condensadas e abrem até a largura do título (SplitText por letra, uma vez) | o eixo de largura, a voz da página |
| Apps | o identificador em foco aparece grande no palco e embaralha; o nome do app abre no eixo de largura | o app existe num registro de loja |
| Sistemas | abrir e fechar com opacidade, sem animar altura; filtros reordenam com Flip | estado |
| Agenda | os pontos aparecem na ordem da semana e a linha "agora" corre até a hora certa | mostra que roda enquanto a pessoa lê |
| Cuoncient | 55, 46 e 16 contam até o valor | volume |
| Cases | o print do site carrega de cima para baixo (clip-path) e o celular sobe | um site abrindo |
| Parede dos 55 sites | três fileiras em sentidos opostos que aceleram com a rolagem e quase param no hover | volume como argumento |
| Resultados | o número antigo é riscado antes do novo; os medidores contam de "antes" até "depois" | antes e depois |
| Idiomas | a barra de nível cresce até o nível de cada idioma e o nome embaralha | quatro alfabetos, quatro níveis |
| Linha do tempo | o fio se desenha com a rolagem (DrawSVG) | sequência real |
| 芸術×技術 | o kanji aparece de cima para baixo, como pincelada, preso à rolagem | tinta |
| Fecho | as linhas do convite sobem por trás de uma máscara (SplitText) | última frase |
| Botões | magnéticos e com texto que rola | resposta ao ponteiro |
| Baixar o PDF | um carimbo 鈴木 bate ao lado do botão e some, sem atrasar o download | o hanko assina o documento |
| Rolagem | Lenis só em ponteiro fino (mouse) | o toque do celular fica nativo |

O Gui pediu "bastante GSAP": cada efeito acima explica algo do conteúdo, roda uma vez (ou preso à rolagem) e some com `prefers-reduced-motion`. Tudo em JavaScript puro, sem framework; o Tailwind só compila o CSS.

Ferramentas: GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText, Flip, DrawSVG), Lenis 1.3, Three.js 0.186. Tudo auto-hospedado em `/gui/vendor`.

O reel de 18 s (`reel-guilherme-keidi-suzuki.mp4`) é HTML + GSAP renderizado com HyperFrames, com as mesmas cores, as mesmas fontes e o mesmo carimbo. A fonte está em `_src/reel.html`.

## Partículas

Pedido do Gui: "abuse das partículas". É uma tela só (`#gl`, `position: fixed`, `z-index: -1`) e um único `Points`; o que muda é o desenho. Cada seção que chega ao meio da tela troca o alvo, e a troca sai do ponto onde cada partícula está, então não há salto nem no meio de outra transição.

| Seção | Desenho | Detalhe |
|---|---|---|
| Capa | 鈴木, retrato, marca ou 恵二 | o lugar de cada desenho é medido na foto (`LUGAR_CAPA`): os kanji ficam atrás dele, puxados para o lado para onde ele olha, e o retrato cai em cima da foto. Na capa o desenho rola junto com a foto; ao sair dela solta e vai para o lugar da seção |
| Aplicativos | celular com a grade de ícones | um ícone em vermelho, carcaça com espessura |
| Agentes | rede de agentes em 3D | nós vermelhos, arestas em papel, gira sem parar |
| Automações | relógio | os ponteiros marcam a hora de Brasília no momento em que a seção aparece; mais apagado para não competir com a agenda |
| Cuoncient | a marca | |
| Resultados | três anéis | 71, 80 e 98: a parte em vermelho é a nota |
| Experiência | linha de crescimento | marcos em vermelho |
| Formação | 学 (aprender) | |
| Competências | grade cúbica 7×7×7 | gira sem parar |
| Princípios | ensō, o círculo de tinta | aberto no alto, com traço seco |
| Contato | o carimbo 鈴木 | entre o texto e o reel |

Fora da capa as partículas ficam a 62% de opacidade (38% no celular) e as faixas de seção são translúcidas (45%) para elas aparecerem. Formas planas param de girar e voltam de frente; só as em 3D (rede, cubo) giram sem parar. A rolagem agita o enxame e dá um empurrão limitado no giro. O laço de desenho para quando a aba fica escondida.

## O retrato (26/10)

Foto do Gui de terno azul-marinho, recortada com IS-Net (fundo transparente) em `gui/foto/`: `guilherme-recorte.webp` (659×1249) e `-760.webp` para tela de densidade 1; `guilherme-rosto.jpg` (360×360, cabeça e ombros sobre papel quente) para o PDF, o JSON-LD e o vCard.

- **Desktop (900 px ou mais):** à direita, de pé sobre a linha da faixa de baixo, com altura `--foto-h` (tela menos barra e faixa, até 960 px). O bloco do nome para `--foto-w + 36px` antes dele, e o `ajustar()` do nome encaixa nessa largura. A perna esmaece com `mask-image` a partir de 66%.
- **Celular e tablet em pé:** a foto vem antes do nome, à direita, com 60svh (até 560 px), e o nome sobe sobre a parte que esmaece. O carimbo vai para o alto à esquerda, para onde ele olha.
- **Silhueta em partículas:** amostrada do alfa do recorte, com peso maior no contorno e nas partes claras (camisa, rosto, mãos) e quase nada no terno. O contorno sai em shu; o brilho sobe (`uClaro`) só nesse desenho.
- Na tela o avatar redondo some (o retrato grande faz o papel dele); no PDF ele volta, com o QR code de `suzuki.cuoncient.com` no canto.
- A foto é o LCP: carrega com `fetchpriority="high"` e aparece na hora. Nenhuma animação de entrada esconde a foto.

## Texto em registro de currículo (26/10)

O Gui achou o texto informal demais para um currículo. A cópia foi reescrita em registro formal, em PT e EN: títulos de seção como num CV ("Aplicativos desenvolvidos", "Experiência profissional", "Competências técnicas", "Princípios de trabalho"), descrições em frase nominal ou terceira pessoa ("Direção da agência e responsabilidade técnica por…"), sem "faço", "me conta" ou "toco e dou aula". As regras do Stop Slop continuam valendo: sem travessão, sem frase de efeito, número com fonte.

## O que o passe de Enhance mudou (26/10)

- **animate:** saíram a largura dos títulos presa à rolagem e o parallax do celular nos cases. No passe seguinte, a pedido do Gui, voltou mais GSAP, cada efeito ligado a um conteúdo (ver Movimento).
- **typeset:** corpo de 340 para 360, título de seção limitado a 96 px, Archivo sem o eixo itálico (não era usado, era download à toa).
- **layout:** o print dos cases e o vídeo ficaram só com a borda de 1 px. Borda com sombra larga embaixo é o "cartão fantasma".
- **colorize:** nenhuma cor nova naquele passe. Depois o Gui trocou a paleta inteira por tinta e carimbo (ver Mundo visual).
- **delight:** o carimbo ao baixar o PDF.

Ficou de propósito: os medidores circulares. Eles repetem o formato do PageSpeed do Google, que é de onde vêm as notas.

## Texto

- Registro formal de currículo, com Stop Slop: nada de travessão no meio da frase, trio de adjetivos, "não é X, é Y", pergunta retórica, frase de efeito no fim do parágrafo ou palavra de vendedor.
- Primeira pessoa, verbo concreto, número com fonte. Nenhum número entra sem estar no cofre ou numa fonte pública (loja, repositório).
- PT no HTML, EN em `data-en*`. A troca não recarrega a página.

## Acessibilidade e qualidade

- Contraste medido no navegador, não só no lint: todo texto passa de 4,5:1 sobre o fundo real.
- Alvos de toque de 44 px (links da barra, PT/EN, botões pequenos e o de trocar o desenho), foco visível em shu-claro, `aria-expanded` nos sistemas, `aria-live` na agenda e no filtro.
- Os pontos da agenda são a exceção medida: as faixas ficam a 9 px uma da outra, e alvo grande cobriria o vizinho (na segunda às 10:00 há dois pontos juntos). O clique e o toque são resolvidos no trilho, pelo ponto mais próximo até 30 px; o teclado vai ponto a ponto. O `verifica.mjs` continua apontando 24×24, e é de propósito.
- Sem rolagem horizontal de 320 a 1920 px (a parede usa `overflow: clip`).
- Sem JS: nome visível, sistemas fechados mas legíveis, capa com a marca em SVG.

## Impressão

O PDF é a mesma página com `@media print`: papel branco, 4 páginas A4, sem agenda, parede, reel nem capa animada. O 鈴木 恵二 aparece ao lado do nome, o rosto em 40 pt e um QR code de `suzuki.cuoncient.com` no canto direito do cabeçalho (gerado com segno, embutido como SVG). Gerado com Playwright (`emulateMedia print`) em PT e EN.

## Contato salvo e cabeçalhos

- `gui/guilherme-keidi-suzuki.vcf`: vCard 3.0 com nome, cargo, WhatsApp, endereço do currículo, GitHub e o rosto em base64. O link fica no contato, sem `download`, para o iPhone abrir direto o cartão de "Novo contato". Sem e-mail, pela mesma regra do portfólio.
- `vercel.json`: `X-Frame-Options`, `frame-ancestors 'none'`, `nosniff` e `Referrer-Policy` só em `/gui` e no host `suzuki.cuoncient.com` (regra da skill cuoncient-web-stack), e `text/vcard` para o `.vcf`. O portfólio da raiz ficou de fora de propósito.

## Achados do Impeccable detect que ficam como estão

- `low-contrast`: o detector estático lê o texto contra branco porque não resolve o fundo do Tailwind compilado. A medição no navegador passa.
- `tight-leading`: vem do `line-height .9` do nome e dos títulos grandes, que é intencional em display.
- `repeating-stripes-gradient`: são as 24 marcas de hora da agenda, e carregam informação.
- `clipped-overflow-container`: o `overflow-x: clip` do html/body segura a parede de sites.
