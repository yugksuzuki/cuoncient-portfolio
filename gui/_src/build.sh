#!/usr/bin/env bash
# Regera index.html, gui.css e hero3d.js a partir de _src/.
# Uso: TOOLS=/caminho/com/node_modules bash gui/_src/build.sh
# (precisa de: tailwindcss@4 + @tailwindcss/cli, esbuild e three@0.186 em $TOOLS/node_modules)
set -euo pipefail
cd "$(dirname "$0")"
TOOLS="${TOOLS:?defina TOOLS apontando para a pasta com node_modules}"
V=$(date +%Y%m%d%H%M)
python3 - "$V" <<'PY'
import sys, re, json, html, pathlib
v = sys.argv[1]
idx = pathlib.Path('../../index.html').read_text(encoding='utf-8')
mark = re.search(r'<symbol id="marca-cuoncient"[^>]*>\s*<path d="([^"]+)"', idx).group(1)
# parede dos sites da fase Wix: três filas, a JS duplica cada uma para o loop
sites = json.loads(pathlib.Path('parede.json').read_text(encoding='utf-8'))
filas = [sites[0::3], sites[1::3], sites[2::3]]
blocos = []
for i, fila in enumerate(filas):
    itens = ''.join(
        f'<figure class="mini"><img src="{s["img"]}" width="400" height="250" loading="lazy" decoding="async" alt="">'
        f'<figcaption>{html.escape(s["nome"])}</figcaption></figure>' for s in fila)
    blocos.append(f'    <div class="parede__fila" data-dir="{-1 if i % 2 else 1}"><div class="parede__trilho">{itens}</div></div>')
t = pathlib.Path('index.template.html').read_text(encoding='utf-8')
t = t.replace('{{MARK}}', mark).replace('{{V}}', v).replace('{{PAREDE}}', '\n'.join(blocos))
pathlib.Path('../index.html').write_text(t, encoding='utf-8')
PY
ln -sfn "$TOOLS/node_modules" node_modules   # o Tailwind resolve o @import a partir desta pasta
trap 'rm -f node_modules' EXIT
"$TOOLS/node_modules/.bin/tailwindcss" -i gui.tw.css -o ../gui.css --minify
NODE_PATH="$TOOLS/node_modules" "$TOOLS/node_modules/.bin/esbuild" hero3d.src.js --bundle --minify --format=esm \
  --target=es2019 --legal-comments=none --outfile=../hero3d.js --alias:three="$TOOLS/node_modules/three/build/three.module.js"
echo "ok: versão $V"
