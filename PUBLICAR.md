# Publicar o portfólio — GitHub + Vercel

Objetivo: o código num repositório público e o site no ar, publicando sozinho a
cada `git push`.

Tempo: uns 10 minutos na primeira vez. Depois, cada atualização é um comando.

---

## Antes de começar

Abra o **PowerShell** e confira se o Git existe:

```powershell
git --version
```

Se aparecer algo como `git version 2.x`, segue. Se der erro, instale em
[git-scm.com/download/win](https://git-scm.com/download/win) — instalação
padrão, "Next" até o fim — e **feche e reabra o PowerShell** depois.

---

## Passo 1 — Criar o repositório no GitHub

No navegador, em [github.com/new](https://github.com/new):

| Campo | O que pôr |
|-------|-----------|
| Repository name | `cuoncient-portfolio` |
| Description | Portfólio da Cuoncient agency |
| Visibilidade | **Public** |
| Add a README file | **desmarcado** |
| Add .gitignore | **None** |
| Choose a license | **None** |

As três últimas linhas importam: se o GitHub criar qualquer arquivo, o repositório
nasce com um commit que o seu não conhece, e o primeiro `push` é recusado.

Clique em **Create repository**. A próxima tela mostra um endereço terminado em
`.git` — deixe essa aba aberta.

---

## Passo 2 — Preparar a pasta

```powershell
cd "$env:USERPROFILE\Desktop\cuoncient-portfolio"
git init
git add .
```

### Agora confira que nada ficou de fora

Este é o passo que não dá para pular:

```powershell
git ls-files assets | Measure-Object -Line
```

**Tem que aparecer 72.** É a conta dos assets:

| Pasta | Arquivos |
|-------|----------|
| `assets/brand` | 6 |
| `assets/cases` | 6 |
| `assets/design` | 4 |
| `assets/thumbs` | 49 |
| `assets/video` | 6 |
| `assets/README.md` | 1 |
| **total** | **72** |

Se der 72, está tudo lá — os 49 prints, os 3 vídeos, os 6 prints dos cases, as 4
peças de design e a marca. Se der outro número, **pare e me avise**: alguma coisa
está sendo ignorada e o site subiria furado.

Confira também os três vídeos, que são os arquivos pesados:

```powershell
git ls-files assets/video
```

Devem aparecer os seis nomes: `casetti-lab`, `eduarda-zucki` e `ponto-zero`, cada
um com `.mp4` e `.jpg`.

---

## Passo 3 — Primeiro commit e envio

```powershell
git commit -m "portfolio cuoncient"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/cuoncient-portfolio.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub — o endereço certo está naquela
aba que você deixou aberta.

No `push` o Windows abre uma janela pedindo para entrar no GitHub. Faça o login
por lá; ele guarda e não pergunta de novo.

São 8,6 MB, então o envio leva algum tempo dependendo da sua internet. Ao final,
recarregue a página do repositório: os arquivos devem estar lá, com a pasta
`assets` dentro.

---

## Passo 4 — Ligar na Vercel

Em [vercel.com/new](https://vercel.com/new), logado como **yugksuzuki**:

1. **Import Git Repository** — se for a primeira vez, ele pede para autorizar o
   GitHub. Autorize.
2. Ache `cuoncient-portfolio` na lista e clique em **Import**.
3. Na tela de configuração, **não mexa em nada**. Framework Preset fica em
   *Other*, Build Command e Output Directory ficam vazios. O site é HTML puro,
   não tem build.
4. **Deploy**.

Um ou dois minutos e ele te dá o endereço, algo como
`cuoncient-portfolio.vercel.app`.

---

## Passo 5 — Me mandar a URL

Falta uma coisa que só dá para fechar depois que o endereço existe: a imagem que
aparece quando alguém manda o link no WhatsApp ou no LinkedIn (`og:image`) está
com caminho relativo, e esses dois não resolvem caminho relativo. Com a URL em
mãos eu troco por absoluta.

---

## Depois: como atualizar o site

### Antes do push, confira o que está na pasta

Já aconteceu de um arquivo ser sobrescrito entre a hora em que foi gravado e a
hora do push — e o site subir pela metade sem ninguém perceber. Trinta segundos
de conferência evitam isso:

```powershell
cd "$env:USERPROFILE\Desktop\cuoncient-portfolio"
@{
  'traducoes (80)'   = (Select-String -Path index.html -Pattern 'data-en=' -AllMatches).Matches.Count
  'links WhatsApp (7)' = (Select-String -Path index.html -Pattern '\shref="https://wa\.me/' -AllMatches).Matches.Count
  'frases em ingles (7)' = (Select-String -Path index.html -Pattern 'data-en-href=' -AllMatches).Matches.Count
  'seletor idioma (1)' = (Select-String -Path index.html -Pattern 'class="lang"' -AllMatches).Matches.Count
  'dominio proprio (12)' = (Select-String -Path index.html -Pattern 'cuoncient\.com' -AllMatches).Matches.Count
  'sobrou vercel.app (0)' = (Select-String -Path index.html -Pattern 'vercel\.app' -AllMatches).Matches.Count
  'projetos (55)'    = (Select-String -Path index.html -Pattern 'class="proj" href' -AllMatches).Matches.Count
  'assets (74)'      = (git ls-files assets | Measure-Object -Line).Lines
} | Format-Table -AutoSize
```

Os números entre parênteses são os esperados. O padrão do WhatsApp começa com
`\s` (um espaço) de propósito: sem isso ele conta também os `data-en-href` e o
resultado vem dobrado — 14 em vez de 7. (Os 74 assets incluem dois
arquivos órfãos que ninguém usa — `assets/brand/og-cover.png` e
`assets/brand/logo-quadrado.png`. Se apagar os dois, o esperado vira 72.) **Bateu tudo, pode subir. Algum
número diferente, me avise antes do push** — provavelmente um arquivo foi
sobrescrito.

### O push

```powershell
git add .
git commit -m "o que mudou"
git push
```

A Vercel percebe o push e republica sozinha, em um ou dois minutos. Não precisa
entrar no painel.

### Depois de mudar a imagem de compartilhamento

WhatsApp, Instagram e LinkedIn guardam a prévia antiga por dias. Depois que o
deploy terminar, cole `https://cuoncient.com` em:

- **developers.facebook.com/tools/debug** → botão *Scrape Again* (WhatsApp e Instagram)
- **linkedin.com/post-inspector**

Sem isso, quem já recebeu o link continua vendo a prévia velha.

---

## Se der errado

**`remote origin already exists`** — já tinha um endereço configurado. Troque por:

```powershell
git remote set-url origin https://github.com/SEU-USUARIO/cuoncient-portfolio.git
```

**`Updates were rejected`** — o repositório do GitHub nasceu com README ou
licença. Resolva puxando antes:

```powershell
git pull --rebase origin main
git push -u origin main
```

**O site subiu sem as imagens** — o Passo 2 não deu 72. Rode
`git ls-files assets | Measure-Object -Line` de novo e me diga o número.

**A Vercel pede Build Command** — deixe vazio e Framework Preset em *Other*.
Se ela insistir, apague o que estiver escrito e salve.

---

## O que fica público e o que não fica

O `.vercelignore` já cuida disso. Vai para o ar só `index.html`, `styles.css`,
`script.js` e a pasta `assets/`.

Este arquivo, o `MAPPING.md` e o `PASSO-A-PASSO.md` ficam visíveis no GitHub
(o repositório é público) mas **não** são servidos pelo site. Se preferir que nem
no GitHub apareçam, crie o repositório como **Private** no Passo 1 — a Vercel
publica repositório privado no plano Hobby sem problema.
