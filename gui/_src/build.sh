#!/usr/bin/env bash
# Regera index.html, gui.css e hero3d.js a partir de _src/.
# Uso: TOOLS=/caminho/com/node_modules bash gui/_src/build.sh
# (precisa de: tailwindcss@4 + @tailwindcss/cli, esbuild e three@0.186 em $TOOLS/node_modules)
set -euo pipefail
cd "$(dirname "$0")"
TOOLS="${TOOLS:?defina TOOLS apontando para a pasta com node_modules}"
V=$(date +%Y%m%d%H%M)
python3 - "$V" <<'PY'
import sys, re, pathlib
v = sys.argv[1]
raiz = pathlib.Path('..')
idx = pathlib.Path('../../index.html').read_text(encoding='utf-8')
mark = re.search(r'<symbol id="marca-cuoncient"[^>]*>\s*<path d="([^"]+)"', idx).group(1)
t = pathlib.Path('index.template.html').read_text(encoding='utf-8')
t = t.replace('{{MARK}}', mark).replace('{{V}}', v)
(raiz / 'index.html').write_text(t, encoding='utf-8')
PY
ln -sfn "$TOOLS/node_modules" node_modules   # o Tailwind resolve o @import a partir desta pasta
trap 'rm -f node_modules' EXIT
"$TOOLS/node_modules/.bin/tailwindcss" -i gui.tw.css -o ../gui.css --minify
NODE_PATH="$TOOLS/node_modules" "$TOOLS/node_modules/.bin/esbuild" hero3d.src.js --bundle --minify --format=esm \
  --target=es2019 --legal-comments=none --outfile=../hero3d.js --alias:three="$TOOLS/node_modules/three/build/three.module.js"
echo "ok: versão $V"
