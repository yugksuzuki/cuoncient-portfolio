# Portfólio Cuoncient — passo a passo até o fim

Onde estamos e o que falta, em ordem. Cada passo diz quem faz.

---

> **Atualizado em 09/09** — os prints chegaram. 49 dos 55 cards já mostram o
> site de verdade, e os 3 cases estão com print real dentro das molduras.
> Falta só a segunda leva (8 sites), listada no fim deste arquivo.

## Onde o projeto está hoje

A pasta `cuoncient-portfolio`, na sua área de trabalho, tem o site inteiro:

```
cuoncient-portfolio/
├── index.html          página única, 10 seções + a grade de projetos
├── styles.css          tokens de design no topo, estilos por seção
├── script.js           nav grudada + animação de entrada
├── projetos.json       a lista dos 57 sites (fonte da grade)
├── MAPPING.md          como mexer em cada parte
├── README.md
└── assets/
    ├── design/         4 peças de design gráfico
    ├── video/          3 filmes de marca + as capas
    ├── thumbs/         49 prints dos sites (900px, os cards da grade)
    └── cases/          6 prints dos cases (desktop + mobile)
```

O que já está pronto: capa, manifesto, Design com galeria, Social Media com os
vídeos, os 3 cases com mockup, a grade com 57 projetos, Anúncios e fechamento.

O que falta: os prints de 6 sites. Enquanto não chegam, eles seguem com a
miniatura velha do portfólio antigo (480px, meio borrada). Nenhum card ficou
vazio. Daiana Santos e Cris Cassiano saíram da grade.

---

## Passo 1 — Capturar os 6 prints que faltam  *(você, ou outra IA)*

O pacote `prints-cuoncient.zip` continua servindo. Como o script pula o que já
existe na pasta `prints/`, rodar de novo captura só os 6 que faltam — dois
minutos, não quinze.

Os 6:

| Site | URL |
|------|-----|
| CEEA | https://voeceea.com.br/ |
| Azzurro Interiores | https://www.azzurrointeriores.com.br/ |
| Turnflix | https://turnflix.com/ |
| XPCon | https://www.xpcon.com.br/ |
| Doege Home | https://www.doegehome.com.br/ |
| Minimall | https://minimall.com.br/ |

Se algum desses acusar **SITE FORA DO AR**, é domínio vencido — me avisa que eu
troco pela URL do Wix ou tiro do portfólio.

### Se for rodar você mesmo no VS Code

Abra o terminal na pasta onde você descompactou o zip:

```bash
npm init -y
npm i playwright
npx playwright install chromium
node capturar-prints.js
```

Demora uns 10 a 15 minutos — ele abre cada site, espera carregar, rola a página
para as imagens preguiçosas aparecerem, e fotografa.

### Se for passar para outra IA

Manda o zip com este pedido:

> Rode o `capturar-prints.js` desta pasta. Node 18+: `npm init -y`,
> `npm i playwright`, `npx playwright install chromium`,
> `node capturar-prints.js`. Ele lê as duas listas JSON e salva os JPEGs em
> `prints/`. **Não mude as resoluções.** No fim me devolve a pasta `prints/`
> inteira e o `falhas.json`, se existir.

### O que sai disso

```
prints/
├── thumbs/    57 arquivos 2560x1600  → os cards da grade
└── cases/      6 arquivos            → art7, duact e vbike, desktop e mobile
```

(2560x1600 porque o script captura em 2x. Eu reduzo para 900px na hora de
colocar no site — o card renderiza a 297px, então 900 já cobre tela retina.)

**Detalhe útil:** se você já rodou o script antes, ele pula o que já existe na
pasta. Rodar de novo captura só os 8 sites novos, em menos de dois minutos.

---

## Passo 2 — Me mandar a pasta `prints/`  *(você)*

Duas formas, tanto faz:

- **Jogar em `Área de trabalho\design-cuoncient`** — eu pego direto de lá, sua
  área de trabalho já está conectada nesta conversa.
- **Anexar aqui no chat** — se for zip, melhor ainda.

Se tiver `falhas.json`, manda junto. Sites que não abriram eu resolvo na mão.

---

## Passo 3 — Eu ligo tudo  *(eu)*

Já fiz isso com a primeira leva: otimizei os 49 prints para 900px, troquei os
cards, e substituí as recriações em HTML dos 3 cases pelos prints de verdade —
desktop dentro da moldura de navegador, mobile dentro da de celular.

Com os 8 que faltam faço o mesmo: otimizo, troco os 6 cards de miniatura velha
e os 2 de iniciais, te devolvo o preview e gravo na pasta.

---

## Passo 4 — Publicar  *(você, quando aprovar)*

O site é estático, sem build. Na Vercel:

1. `vercel.com` → **Add New → Project**
2. Importa a pasta ou o repositório
3. Sem build command, sem output directory — confirma e pronto

Se preferir GitHub antes, na pasta do projeto:

```bash
git init
git add .
git commit -m "portfolio cuoncient"
```

E aí conecta o repositório na Vercel, que passa a publicar sozinho a cada push.

---

## Pendências que dependem só de você

*(A logo oficial saiu daqui em 10/09 — está vetorizada em `assets/brand/`.)*

| O que | Por quê |
|-------|---------|
| **Originais das peças de design** | As 4 vieram do LinkedIn recomprimidas (480–800px). Se achar o que saiu do Canva ou do Affinity, ficam nítidas. |
| **Confirmar Eduarda Zucki** | Duas peças da galeria eu atribuí a ela deduzindo pelo filme de marca. |
| **E-mail de contato** | Hoje o site aponta para `guikeidi@gmail.com`. Se a agência tiver e-mail próprio ou você preferir WhatsApp, eu troco. |
| **Métricas dos cases** | Os 3 cases descrevem escopo, não resultado. Se tiver número real de lead ou faturamento, entra bem. |

---

## Se algo der errado no passo 1

**"playwright não encontrado"** — faltou o `npm i playwright` na pasta certa.

**Muitos sites em `falhas.json`** — provavelmente rede. Roda de novo; ele pula
os que já capturou e tenta só os que faltaram.

**Print saiu com banner de cookie** — o script tenta fechar os mais comuns, mas
não pega todos. Me diz quais e eu capturo esses na mão.

**Print em branco** — site que demora demais. Aumenta o `ESPERA` no topo do
script de `3500` para `6000` e roda de novo só nesse.
