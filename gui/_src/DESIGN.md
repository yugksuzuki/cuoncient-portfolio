# DESIGN.md: o DNA do currículo do Gui

> Página: cuoncient.com/gui (e gsuzuki.cuoncient.com quando o domínio estiver ligado).
> Fonte da verdade do visual. Mudou um token, um movimento ou uma regra aqui? Mude no código também, e vice-versa.
> Revisado em 26/10/2026 com Impeccable (craft floor, animate, typeset), Hallmark (floor e pre-emit critique) e Stop Slop no texto.

## O que a página precisa fazer

Quem pergunta "tem um currículo seu sobre IA?" precisa sair sabendo três coisas em um minuto:

1. O Gui publica apps (lojas e APK) e põe agentes e chatbots para rodar em cliente de verdade.
2. Cada afirmação tem prova: identificador do app, custo por artigo, nota antes e depois.
3. Como falar com ele (WhatsApp) e onde baixar o PDF.

O argumento da página são os recibos, e nunca os adjetivos.

## Mundo visual

Nasce da Cuoncient (o preto do portfólio, o ciano da marca) e do nome japonês do Gui, 鈴木 恵二.
Cada cor tem um papel e um nome em japonês, como os pigmentos tradicionais.

| Token | Hex | Papel |
|---|---|---|
| `sumi` 墨 | `#06070a` | fundo. Preto tingido, nunca `#000` |
| `ai` 藍 | `#0b1222` | faixas alternadas (agenda, resultados, formação) e rodapé |
| `ai-2` | `#111c33` | cartões dentro das faixas |
| `papel` | `#eef1f5` | texto principal |
| `nevoa` | `#b4bdcc` | texto de apoio (contraste > 9:1 no sumi) |
| `gin` 銀 | `#8d96a6` | legendas e metadados (> 6:1) |
| `asagi` 浅葱 | `#1aa5b8` | o ciano da Cuoncient: links, partículas, medidores |
| `asagi-claro` | `#82dce8` | provas (`.sis__prova`) e links sobre o escuro |
| `shu` 朱 | `#e3573c` | carimbo 鈴木, kanji, o japonês. Só aparece onde há japonês |
| `yamabuki` 山吹 | `#e9b452` | a hora atual (linha "agora" da agenda, anos da linha do tempo) |
| `matcha` | `#8fd6a6` | "NFC-e autorizada", o único verde |

Regra de proporção: o asagi fica abaixo de 5% de qualquer tela, menos na capa, onde as partículas são a própria marca. O shu é mais raro ainda: carimbo, kanji, idioma japonês.

## Tipo

- **Archivo variável** (largura 62–125, peso 100–900) para tudo que é título e texto. O eixo de largura é a voz da página.
  - Nome: largura 112, peso 760, e respira (ver Movimento).
  - Títulos de seção: largura 72 em repouso, peso 540, `line-height .94`. Com JS, chegam condensados (58) e abrem até 74 com a rolagem.
  - Nomes de sistema e app: largura 82, que abre para 104 no hover e quando o painel está aberto.
  - Corpo: 17,5 px, peso 340, `line-height 1.72`, até 64ch.
- **Shippori Mincho** nas frases de abertura (`.sec__lead`, `.hero__role`, `.fim__p`) e em todo japonês. É ela que dá o tom de livro ao lado do Archivo.
- Sem caixa-alta em rótulo, sem sobretítulo acima de título, sem palavra destacada em cor dentro de título.

## Layout

- Shell de 1240 px, calha de 16 px no celular e 32 px a partir de 640.
- Cabeçalho de seção em 7/5: título à esquerda, abertura em Mincho à direita, alinhados pela base.
- Listas com fio de 1 px (`linha`), sem cartões. Hierarquia por tamanho e largura de letra, não por caixa.
- Numeração só onde há sequência real (linha do tempo). Sistemas e apps não levam número.
- Faixas `ai` alternam com o sumi para separar blocos longos sem precisar de borda.

## Assinatura

O nome respira. Uma onda lenta passa pelas letras no eixo de largura do Archivo, e as letras perto do ponteiro condensam e engrossam como numa lente. É o único lugar onde a tipografia se mexe sozinha.

## Movimento

Uma regra do Impeccable (animate) guia tudo: movimento explica estado ou é o único momento autoral que a página ganhou. Tudo respeita `prefers-reduced-motion` e nada some se o JavaScript falhar.

| Onde | O que | Por quê |
|---|---|---|
| Capa | 11 mil partículas (Three.js) montam a marca da Cuoncient e, com a rolagem, se reagrupam em 鈴木 na vertical, passando do asagi para o shu | o momento autoral: a agência vira o nome |
| Nome | entrada letra a letra, depois a respiração e a lente | assinatura |
| Títulos | largura 58 → 74 presa à rolagem | o título "chega" sem fade genérico |
| Apps | o identificador do app em foco (`br.com.brazukaclubapp`…) aparece grande no palco e embaralha ao trocar (ScrambleText) | mostra que o app existe num registro de loja |
| Sistemas | abrir e fechar com opacidade, sem animar altura; filtros reordenam com Flip | estado |
| Agenda | linha "agora" em yamabuki, ponto da próxima rotina pulsando | mostra que roda enquanto a pessoa lê |
| Cases | o celular desliza contra o desktop (scrub) | profundidade entre as duas telas |
| Parede dos 55 sites | três fileiras em sentidos opostos que aceleram com a velocidade da rolagem e quase param no hover | volume como argumento |
| Medidores | contagem de "antes" até "depois" | o número antigo ao lado do novo |
| Idiomas | o nome de cada idioma embaralha uma vez ao entrar | quatro alfabetos, um gesto |
| Linha do tempo | o fio se desenha com a rolagem (DrawSVG) | sequência real |
| Fecho | as linhas do convite sobem por trás de uma máscara (SplitText) | última frase |
| Botões | magnéticos e com texto que rola | resposta ao ponteiro |
| Rolagem | Lenis só em ponteiro fino (mouse) | o toque do celular fica nativo |

Ferramentas: GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText, Flip, DrawSVG), Lenis 1.3, Three.js 0.186. Tudo auto-hospedado em `/gui/vendor`.

O reel de 18 s (`reel-guilherme-keidi-suzuki.mp4`) é HTML + GSAP renderizado com HyperFrames, com as mesmas cores, as mesmas fontes e o mesmo carimbo. A fonte está em `_src/reel.html`.

## Texto

- Humanizer e Stop Slop em toda copy: nada de travessão no meio da frase, trio de adjetivos, "não é X, é Y", pergunta retórica, frase de efeito no fim do parágrafo ou palavra de vendedor.
- Primeira pessoa, verbo concreto, número com fonte. Nenhum número entra sem estar no cofre ou numa fonte pública (loja, repositório).
- PT no HTML, EN em `data-en*`. A troca não recarrega a página.

## Acessibilidade e qualidade

- Contraste medido no navegador, não só no lint: todo texto passa de 4,5:1 sobre o fundo real.
- Alvos de toque de 44 px, foco visível em asagi-claro, `aria-expanded` nos sistemas, `aria-live` na agenda e no filtro.
- Sem rolagem horizontal de 320 a 1920 px (a parede usa `overflow: clip`).
- Sem JS: nome visível, sistemas fechados mas legíveis, capa com a marca em SVG.

## Impressão

O PDF é a mesma página com `@media print`: papel branco, 4 páginas A4, sem agenda, parede, reel nem capa animada. O 鈴木 恵二 aparece ao lado do nome. Gerado com Playwright (`emulateMedia print`) em PT e EN.

## Achados do Impeccable detect que ficam como estão

- `low-contrast`: o detector estático lê o texto contra branco porque não resolve o fundo do Tailwind compilado. A medição no navegador passa.
- `tight-leading`: vem do `line-height .9` do nome e dos títulos grandes, que é intencional em display.
- `repeating-stripes-gradient`: são as 24 marcas de hora da agenda, e carregam informação.
- `clipped-overflow-container`: o `overflow-x: clip` do html/body segura a parede de sites.
