# DESIGN.md: o DNA do currículo do Gui

> Página: suzuki.cuoncient.com, também em cuoncient.com/gui.
> Fonte da verdade do visual. Mudou um token, um movimento ou uma regra aqui? Mude no código também, e vice-versa.
> Revisado em 27/10/2026: paleta grafite e azul-aço, capa sem foto (globo em Three.js), seção Perfil, raio-X e painel medido ao vivo. Conferido com `impeccable detect` (0 achados no computador e no celular), axe-core (0 violações) e varredura de CLS.

## O que a página precisa fazer

Quem pergunta "tem um currículo seu sobre IA?" precisa sair sabendo três coisas em um minuto:

1. O Gui publica apps (lojas e APK) e põe agentes e chatbots para rodar em cliente de verdade.
2. Cada afirmação tem prova: identificador do app, custo por artigo, nota antes e depois.
3. Como falar com ele (WhatsApp) e onde baixar o PDF.

O argumento da página são os recibos, e nunca os adjetivos.

## Mundo visual: grafite e azul-aço

Pedido do Gui em 27/10/2026: "cores mais profissionais, neutras". Sai o azul elétrico (#3d73ff) e o preto quase puro; entra um grafite com um azul-aço dessaturado. Nenhuma outra cor entra, nem a dos clientes. Os nomes dos tokens ficaram (墨 sumi, 銀 gin, 青 ao).

| Token | Hex | Papel |
|---|---|---|
| `sumi` 墨 | `#101214` | fundo grafite |
| `sumi-2` | `#15181b` | faixas alternadas (perfil, agentes, resultados, formação, contato) e rodapé |
| `sumi-3` | `#1b1f23` | a faixa da agenda, as caixas dos fluxos e a moldura do celular nos cases |
| `papel` | `#e6e8ea` | texto principal e partículas claras (15,3:1 no sumi) |
| `branco` | `#ffffff` | hover do botão cheio e app em foco |
| `nevoa` | `#a3a9b0` | texto de apoio (7,9:1) |
| `gin` 銀 | `#8a9199` | legendas e metadados (5,9:1) |
| `ao` 青 | `#6a90b9` | o acento azul-aço: marcas, fios, medidores, indicador da barra (5,6:1) |
| `ao-claro` | `#a9c0d9` | o acento em texto pequeno: links, provas, números; fundo das etiquetas do raio-X (10:1) |

Contraste calculado pela fórmula da WCAG contra o `sumi` e conferido no navegador com o axe-core. Regra de proporção: o azul marca o que é prova, ação ou movimento. Se um bloco inteiro ficar azul, está errado.

No PDF o acento vira `#2e4d70` sobre o papel branco.


## Tipo

- **Archivo variável** (largura 62–125, peso 100–900) para tudo que é título e texto. O eixo de largura é a voz da página.
  - Nome: largura 104, peso 520 (era 112 e 760; o hero novo pediu um nome mais leve), e respira (ver Movimento).
  - Frase do cargo na capa: Archivo 18 a 22 px, peso 380, até 40ch. Saiu da Mincho para a capa ficar mais limpa.
  - Títulos de seção: largura 72, peso 540, `line-height .94`, no máximo 96 px. Ficam parados: a largura só se mexe no nome.
  - Nomes de sistema e app: largura 82, que abre para 104 no hover e quando o painel está aberto.
  - Corpo: 17,5 px, peso 360 (um passo acima do normal, por ser texto claro no escuro), `line-height 1.7`, até 64ch.
- **Shippori Mincho** nas frases de abertura das seções (`.sec__lead`, `.fim__p`) e em todo japonês. É ela que dá o tom de livro ao lado do Archivo.
- Sem caixa-alta em rótulo, sem sobretítulo acima de título, sem palavra destacada em cor dentro de título.

## Layout

- Shell de 1240 px, calha de 16 px no celular e 32 px a partir de 640.
- **Capa sem foto.** Desktop (900 px ou mais): o nome à esquerda (7 colunas) e o globo à direita (5 colunas), com a legenda dos lugares embaixo. Celular: a legenda à esquerda e o globo à direita, os dois acima do nome; o nome e o primeiro botão cabem na primeira tela.
- **Perfil** logo depois da capa: o retrato pequeno (128 px no celular, 176 px no desktop, 4:5, preto e branco, espelhado para olhar o texto), o título, um parágrafo de bio e os dados em duas colunas (idade, cargo, clientes, idiomas) com o contato numa linha só.
- Cabeçalho de seção em 7/5: título à esquerda, abertura em Mincho à direita, alinhados pela base.
- Listas com fio de 1 px (`linha`), sem cartões. Hierarquia por tamanho e largura de letra, não por caixa.
- Numeração só onde há sequência real (linha do tempo). Sistemas e apps não levam número.
- Faixas `sumi-2` alternam com o fundo para separar blocos longos sem precisar de borda.
- Menu: Perfil, Aplicativos, Agentes de IA, Resultados, Experiência e Competências, a partir de 1200 px (Cuoncient e Formação continuam na página, fora do menu).


## Assinatura

O nome respira. Uma onda lenta passa pelas letras no eixo de largura do Archivo, e as letras perto do ponteiro condensam e engrossam como numa lente. É o único lugar onde a tipografia se mexe sozinha.

## Movimento

Uma regra do Impeccable (animate) guia tudo: movimento explica estado ou é o único momento autoral que a página ganhou. Tudo respeita `prefers-reduced-motion` e nada some se o JavaScript falhar. **Nada que anima mexe no layout**: só transform, opacity, clip-path e atributos de SVG (ver Estabilidade de layout).

| Onde | O que | Por quê |
|---|---|---|
| Página inteira | 11 mil partículas (7 mil no celular) numa tela fixa atrás de todo o conteúdo; na capa formam o globo, em cada seção mudam de desenho (ver Partículas) | o fio que atravessa a página |
| Capa, globo | os continentes em pontos (Natural Earth), virados para as Américas; os estados dos clientes acesos em azul; três rotas Brasil ↔ EUA se desenham na entrada e um pulso corre por elas sem parar; o lado de trás do globo apaga | onde o trabalho acontece, com dado real |
| Capa, nomes dos lugares | HTML preso aos pontos 3D a cada quadro (projeção da câmera), some quando o ponto vai para trás do globo | Three.js e DOM juntos |
| Capa, clique e arraste | clicar troca o desenho (globo → 鈴木 → marca → 恵二) com uma explosão no ponto clicado; arrastar gira com inércia e volta sozinho | interação real com o 3D |
| Capa, botão | "Trocar o desenho" faz a mesma troca pelo teclado, e o nome da forma embaralha (ScrambleText) | acesso sem mouse |
| Nome | entrada letra a letra (largura 70 e peso 260 até 104 e 520), depois a respiração (±4 na largura) e a lente perto do cursor | assinatura |
| Perfil | a moldura do retrato abre de baixo para cima (clip-path) e a foto assenta; os dados sobem em cascata | a foto chega pequena e discreta |
| Barra | o traço desliza até a seção atual; uma linha de leitura enche com a rolagem | onde estou e quanto falta |
| Títulos | SplitText por letra: cada letra chega estreita (scaleX 0,35) e abre. Só transform; antes era o eixo de largura da fonte, que mudava a quebra de linha | o eixo de largura, sem empurrar a página |
| Padrões de agente | quatro fluxos em SVG: um pedido percorre as etapas como o sistema roda (reescrita no revisor, três saídas no roteamento, o visto da pessoa na aprovação, os trechos voltando do índice no RAG); os fios se desenham com DrawSVG e o laço só roda com o fluxo na tela | o padrão funcionando, não descrito |
| Apps | o identificador em foco aparece grande no palco e embaralha; o nome do app clareia | o app existe num registro de loja |
| Sistemas | abrir e fechar com opacidade; filtros reordenam com Flip | estado |
| Agenda | os pontos aparecem na ordem da semana e a linha "agora" corre até a hora certa | mostra que roda enquanto a pessoa lê |
| Cuoncient | 55, 46 e 16 contam até o valor, com a largura final reservada | volume |
| Cases | o print do site carrega de cima para baixo (clip-path) e o celular sobe | um site abrindo |
| Parede dos 55 sites | três fileiras em sentidos opostos **presas à rolagem** (scrub): parou de rolar, a parede para. Antes era uma marquise automática | volume como argumento, no ritmo de quem lê |
| Resultados | o número antigo é riscado antes do novo; os medidores contam de "antes" até "depois" | antes e depois |
| Idiomas | a barra de nível cresce e o nome embaralha | quatro alfabetos, quatro níveis |
| Linha do tempo | o fio se desenha com a rolagem (DrawSVG) | sequência real |
| 芸術×技術 | o kanji aparece de cima para baixo, preso à rolagem | tinta |
| Fecho | as linhas do convite sobem por trás de uma máscara (SplitText) | última frase |
| Botões | magnéticos (com mouse) e com texto que rola | resposta ao ponteiro |
| Baixar o PDF | um carimbo 鈴木 bate ao lado do botão e some | o hanko assina o documento |
| Raio-X | as etiquetas entram com um leve zoom e seguem cada elemento a cada quadro (gsap.ticker) | ver a tecnologia de cada parte |
| Rolagem | Lenis só em ponteiro fino (mouse) | o toque do celular fica nativo |

Ferramentas: GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText, Flip, DrawSVG), Lenis 1.3, Three.js 0.186, axe-core 4.14 (sob demanda). Tudo auto-hospedado em `/gui/vendor`.

O reel de 18 s (`reel-guilherme-keidi-suzuki.mp4`) é HTML + GSAP renderizado com HyperFrames, com as mesmas cores e fontes. A fonte está em `_src/reel.html`.


## Partículas

É uma tela só (`#gl`, `position: fixed`, `z-index: -1`) com dois `Points`: o enxame que muda de desenho e, por cima, as rotas do globo (shader próprio, só aparece na capa). Cada seção que chega ao meio da tela troca o alvo, e a troca sai do ponto onde cada partícula está, sem salto.

| Seção | Desenho | Detalhe |
|---|---|---|
| Capa | globo, 鈴木, marca ou 恵二 | o globo usa 4.846 pontos de terra (grade de 1,5° com densidade igual, gerada por `_src/terra.mjs` a partir do world-atlas), malha de 30 em 30 graus mais fraca e os cinco lugares dos clientes em azul. Centro em 60° O, 8° N. Fica dentro da caixa `.hero__globo` (medida pelo `medirCaixa()`), rola junto com ela e solta ao sair da capa |
| Perfil | 鈴木 | à direita do texto, apagado |
| Aplicativos | celular com a grade de ícones | um ícone em azul |
| Agentes | rede de agentes em 3D | mais apagada: os fluxos ocupam a largura toda |
| Automações | relógio | marca a hora de Brasília; bem apagado atrás da agenda |
| Cuoncient | a marca | |
| Resultados | três anéis | 71, 80 e 98 em azul |
| Experiência | linha de crescimento | mais apagada, passa atrás dos cargos |
| Formação | 学 (aprender) | |
| Competências | grade cúbica 7×7×7 | bem apagada atrás do painel ao vivo |
| Princípios | ensō | |
| Contato | o carimbo 鈴木 | entre o texto e o reel |

A opacidade por seção fica em `ALFA_SECAO` no `hero3d.src.js`. O shader apaga o lado de trás do globo (`uFace`) e clareia a terra (`uClaro`) só nesse desenho; cor negativa no atributo deixa a partícula mais fraca (é assim que a malha fica atrás dos continentes). O laço de desenho para quando a aba fica escondida, e as medidas (fps, pontos, chamadas de desenho) ficam em `window.__gl` para o painel e o raio-X.

## Raio-X e painel ao vivo: a tecnologia aplicada, não só listada

Pedido do Gui: "mostre todas as ferramentas aplicadas, não só ditas".

- **Raio-X** (botão na barra; Esc desliga): todo elemento com `data-tec` (e `data-en-tec`) ganha um contorno tracejado e uma etiqueta com a tecnologia que o move, presa a ele a cada quadro. A etiqueta da capa mostra pontos e fps ao vivo (`{pontos}`, `{fps}`). Para marcar uma parte nova, basta pôr `data-tec` nela.
- **Painel em Competências**, medido no navegador de quem visita: Three.js (fps com linha dos últimos 30 s, partículas, chamadas de desenho), GSAP (ScrollTriggers e animações vivas), Core Web Vitals (LCP, CLS, INP por PerformanceObserver), peso da visita (Resource Timing), acessibilidade (o axe-core só baixa quando a pessoa clica e roda na página inteira) e a revisão de design (o resultado do Impeccable, com data).
- **"Em uso nesta página"**: botões que ligam o raio-X e levam até a parte que usa cada tecnologia.
- O número do Impeccable no painel é estático: mudou o design, rode `impeccable detect` de novo e atualize o texto (PT e EN) no template.

## Estabilidade de layout (CLS)

Medido em 27/10/2026 com rolagem programada da página inteira: o CLS caiu de 0,335 para 0,024 no desktop e de 0,182 para 0,007 no celular. O que causava e como ficou:

- Títulos animados no eixo de largura da fonte mudavam a quebra de linha e empurravam tudo abaixo. Agora é `scaleX` e o título guarda a altura (`min-height`) enquanto está dividido.
- O nome do app em foco abria no eixo de largura e quebrava em duas linhas. Agora só muda a cor.
- O placar contava a partir de 0 e mudava de largura. Agora reserva a largura final.
- O bloco da capa aparecia antes do nome ganhar o tamanho final. Agora espera (`.hero.is-pronto`), e a linha da agenda tem altura mínima para o botão "Trocar o desenho" entrar sem empurrar nada.


## O retrato (27/10)

O Gui achou a foto da capa grande demais e, no mesmo dia, mandou uma foto nova: sorrindo, camisa preta, fundo escuro. A capa ficou sem foto; a foto nova está pequena na seção Perfil, e a antiga (de terno, em duotom) saiu do site, do PDF e do vCard.

- **Fonte:** `_src/foto-perfil-original.jpg` (256×256, como chegou; fora do deploy).
- **`gui/foto/guilherme-retrato.webp`** (320×400): recorte 4:5 centralizado, em cor natural, sem espelhar. No Perfil aparece com 128 px (celular) e 176 px (desktop). Como a original tem 256 px, em tela de alta densidade ela fica um pouco macia; chegando a foto em resolução maior, é só refazer o recorte e trocar o arquivo.
- **`gui/foto/guilherme-rosto.jpg`** (360×360): quadrado do rosto e ombros. É o avatar do PDF (no `.hero__eu`, que só aparece na impressão e carrega com `loading="lazy"`) e a imagem do JSON-LD.
- **`gui/guilherme-keidi-suzuki.vcf`**: o mesmo rosto em 240 px, em base64, com dobra de linha de 75 colunas.


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
- Alvos de toque de 44 px (links da barra, PT/EN, Raio-X, botões pequenos e o de trocar o desenho), foco visível em ao-claro, `aria-expanded` nos sistemas, `aria-pressed` no Raio-X, `aria-live` na agenda e no filtro.
- axe-core na página inteira (27/10/2026, PT, depois das animações de entrada): 0 violações. A agenda era `role="img"` com botões dentro (`nested-interactive`); virou `role="group"`. Os fluxos dos agentes são `aria-hidden`: o mesmo conteúdo está no título e no parágrafo de cada padrão.
- Os pontos da agenda são a exceção medida: as faixas ficam a 9 px uma da outra, e alvo grande cobriria o vizinho (na segunda às 10:00 há dois pontos juntos). O clique e o toque são resolvidos no trilho, pelo ponto mais próximo até 30 px; o teclado vai ponto a ponto. O `verifica.mjs` continua apontando 24×24, e é de propósito.
- Sem rolagem horizontal de 320 a 1920 px (a parede usa `overflow: clip`).
- Sem JS, sem WebGL ou com movimento reduzido: nome visível, sistemas fechados mas legíveis, a caixa do globo mostra a marca em SVG e os nomes dos lugares ficam na legenda.

## Impressão

O PDF é a mesma página com `@media print`: papel branco, 4 páginas A4, sem capa animada, perfil, agenda, parede, fluxos, painel ao vivo nem reel. O 鈴木 恵二 aparece ao lado do nome, o rosto em 40 pt e um QR code de `suzuki.cuoncient.com` no canto direito do cabeçalho. Gerado com Playwright (`emulateMedia print`, A4) em PT e EN; antes de imprimir, o script tira o `loading="lazy"` do avatar.


## Contato salvo e cabeçalhos

- `gui/guilherme-keidi-suzuki.vcf`: vCard 3.0 com nome, cargo, WhatsApp, endereço do currículo, GitHub e o rosto em base64. O link fica no contato, sem `download`, para o iPhone abrir direto o cartão de "Novo contato". Sem e-mail, pela mesma regra do portfólio.
- `vercel.json`: `X-Frame-Options`, `frame-ancestors 'none'`, `nosniff` e `Referrer-Policy` só em `/gui` e no host `suzuki.cuoncient.com` (regra da skill cuoncient-web-stack), e `text/vcard` para o `.vcf`. O portfólio da raiz ficou de fora de propósito.

## Impeccable detect

27/10/2026, página servida localmente e lida pelo `impeccable detect --cdp` (o navegador já com a página aberta e as animações terminadas), em 1440×900 e 390×844: **0 achados e 0 avisos**. Na primeira leitura desta versão eram 3 achados e 16 avisos:

- `low-contrast` nos números riscados (o risco era um `linear-gradient` no fundo do texto): o risco virou um `::after`.
- `straggler` (palavra sozinha na última linha) em vários parágrafos: `text-wrap: pretty` em `p`, `li` e `dd`.
- `repeating-stripes-gradient` na régua da agenda: virou um `linear-gradient` com `background-size` de 1/24, que é a régua de horas de verdade.
- `marquee` não aparece mais porque a parede de sites deixou de rolar sozinha.
