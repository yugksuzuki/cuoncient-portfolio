# Currículo do Gui — cuoncient.com/gui

Página estática como o resto do site. O que vai para o ar está em `gui/`:
`index.html`, `gui.css`, `gui.js`, `hero3d.js`, `vendor/`, os PDFs, `og.png` e o reel.

Esta pasta (`_src/`) não sobe para a Vercel (ver `.vercelignore`). Ela guarda a fonte
de três arquivos gerados:

| Fonte | Gera | Como |
|---|---|---|
| `index.template.html` | `../index.html` | troca `{{MARK}}` pela marca do `index.html` da raiz e `{{V}}` pela versão (cache) |
| `gui.tw.css` | `../gui.css` | Tailwind 4, minificado |
| `hero3d.src.js` | `../hero3d.js` | esbuild + three@0.186 (só as classes usadas) |
| `terra.mjs` | `terra.js` | pontos de terra do globo da capa, do world-atlas (`npm i world-atlas topojson-client d3-geo`, depois `node terra.mjs terra.js` numa pasta com essas dependências) |

```bash
# numa pasta qualquer com as ferramentas:
npm i tailwindcss@4 @tailwindcss/cli@4 esbuild three@0.186
TOOLS=/caminho/dessa/pasta bash gui/_src/build.sh
```

**Texto:** todo o português fica no HTML; o inglês fica em `data-en` (e `data-en-href`,
`data-en-label`, `data-en-title`). Mudou um texto? Mude os dois.

**Regra da casa:** nenhum número entra sem estar no cofre (Clientes/, Projetos/). A página
diz que cada sistema "existe e roda" — se algum for desligado, sai daqui também.

**PDFs:** gerados da própria página com `@media print` (Chromium, A4). Mudou o conteúdo,
gere de novo os dois (`curriculo-...pdf` em PT, `resume-...pdf` em EN).

**Reel:** `reel.html` é a composição do HyperFrames (1080×1920, 18 s). Para renderizar,
copie para uma pasta como `index.html`, com `assets/gsap.min.js` e as fontes em `assets/fonts/`
(Archivo `archivo-latin-standard-normal.woff2` e os quatro arquivos 700 da Shippori Mincho do
@fontsource), e rode `npx hyperframes render <pasta> -o reel.mp4`. Sem o Chrome do HyperFrames, aponte
`PRODUCER_HEADLESS_SHELL_PATH` para um chrome-headless-shell. Depois, `ffmpeg -crf 26 -preset veryfast`
para o arquivo final e um quadro de 3 s para `reel-capa.jpg`.

**og.png:** print da capa em 1200×630, sem a barra e sem a linha da agenda, com o globo já montado.

**Design:** cores, tipo, movimento e regras estão em `DESIGN.md`. Mexeu num token ou numa animação, atualize lá.
