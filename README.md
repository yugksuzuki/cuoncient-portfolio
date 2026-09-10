# Cuoncient agency — portfólio

**No ar em https://cuoncient.com**

Site estático: HTML + CSS + JS puros. Sem build, sem dependências, sem
`node_modules`. Abrir o `index.html` no navegador já funciona.

## Arquivos

| Arquivo | O que é |
|---------|---------|
| `index.html` | a página inteira — 11 seções, em português com tradução para inglês embutida |
| `styles.css` | tokens de design no `:root` do topo, depois os estilos por seção |
| `script.js` | seletor de idioma, nav grudada, botão flutuante do WhatsApp, animação de entrada |
| `projetos.json` | a lista dos 55 sites; fonte para regerar a grade (o HTML já vem pronto) |
| `assets/` | tudo que o site mostra — marca, prints, peças de design, vídeos |

Documentos de apoio, que **não** vão para o ar (ver `.vercelignore`):

| Arquivo | Para quê |
|---------|----------|
| `MAPPING.md` | como cada parte funciona e onde mexer. **Leia antes de editar.** |
| `PUBLICAR.md` | como publicar e como atualizar |
| `PASSO-A-PASSO.md` | como capturar os prints que faltam |
| `CLAUDE.md` | contexto do projeto para o Claude Code |

## Rodar

Abra a pasta no VS Code e use o **Live Server** (botão direito no `index.html` →
*Open with Live Server*), ou abra o `index.html` direto no navegador.

## Onde mexer

| Quero mudar | Onde |
|-------------|------|
| Cor, fonte, tamanho, espaçamento | `styles.css` → bloco `TOKENS` no topo |
| Qualquer texto em português | `index.html` |
| O mesmo texto em inglês | o atributo `data-en` do mesmo elemento |
| Número ou frase do WhatsApp | `index.html` → procure `wa.me/` (7 links, cada um com versão em inglês) |
| A marca | `index.html` → o `<symbol id="marca-cuoncient">`, uma vez só |
| Adicionar/remover projeto | `index.html` → seção `#projetos`, e o total no texto acima dela |
| Domínio | `index.html` → procure `cuoncient.com` (12 ocorrências, com o schema) |

## Publicar

O repositório `github.com/yugksuzuki/cuoncient-portfolio` está ligado à Vercel:
cada `git push` republica sozinho, sem build. O `PUBLICAR.md` tem o passo a
passo, incluindo a conferência antes do push.

## Contato do site

Todos os botões vão para o WhatsApp **+55 11 93352-8251**, cada um com uma frase
diferente já escrita — e traduzida quando o site está em inglês. Não há e-mail.
