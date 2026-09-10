# Cuoncient agency — portfólio

Site estático: HTML + CSS + JS puros. Sem build, sem dependências, sem
`node_modules`. Abrir o `index.html` no navegador já funciona.

## Arquivos

| Arquivo | O que é |
|---------|---------|
| `index.html` | a página inteira — 11 seções |
| `styles.css` | tokens de design no `:root` do topo, depois os estilos por seção |
| `script.js` | nav grudada, botão flutuante do WhatsApp, animação de entrada |
| `projetos.json` | a lista dos 57 sites; fonte para regerar a grade (o HTML já vem pronto) |
| `assets/` | tudo que o site mostra — marca, prints, peças de design, vídeos |

Documentos de apoio, que **não** vão para o ar:

| Arquivo | Para quê |
|---------|----------|
| `MAPPING.md` | como cada parte funciona e onde mexer. **Leia antes de editar.** |
| `PUBLICAR.md` | passo a passo para subir no GitHub e na Vercel |
| `PASSO-A-PASSO.md` | como capturar os prints que faltam |
| `CLAUDE.md` | contexto do projeto para o Claude Code |

## Rodar

Abra a pasta no VS Code e use o **Live Server** (botão direito no `index.html` →
*Open with Live Server*), ou abra o `index.html` direto no navegador.

Os vídeos e alguns detalhes de layout só se comportam direito servidos por HTTP,
então prefira o Live Server quando for conferir de verdade.

## Onde mexer

| Quero mudar | Onde |
|-------------|------|
| Cor, fonte, tamanho, espaçamento | `styles.css` → bloco `TOKENS` no topo |
| Qualquer texto | `index.html` |
| Número ou frase do WhatsApp | `index.html` → procure `wa.me/` (7 links) |
| A marca | `index.html` → o `<symbol id="marca-cuoncient">`, uma vez só |
| Adicionar/remover projeto da grade | `index.html` → seção `#projetos`, e o total no texto acima dela |

## Publicar

Estático puro: qualquer host serve. Na Vercel é importar o repositório e
confirmar — sem build command, sem output directory. O `PUBLICAR.md` tem o
passo a passo completo.

## Contato do site

Todos os botões vão para o WhatsApp **+55 11 93352-8251**, cada um com uma frase
diferente já escrita. Não há e-mail no site.
