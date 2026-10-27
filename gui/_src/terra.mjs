// Gera os pontos de terra do globo (grade de 1,5° com densidade igual) a partir do world-atlas 110m.
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
const topo = JSON.parse(readFileSync(new URL('./node_modules/world-atlas/land-110m.json', import.meta.url)));
const terra = feature(topo, topo.objects.land);
const PASSO = 1.5;
const bytes = [];
let total = 0;
for (let lat = -58.5; lat <= 82.5; lat += PASSO) {   // sem Antártida: ela só ocuparia a borda de baixo
  const n = Math.max(1, Math.round((360 / PASSO) * Math.cos((lat * Math.PI) / 180)));
  for (let k = 0; k < n; k++) {
    const lon = -180 + (k + 0.5) * (360 / n);
    total++;
    if (geoContains(terra, [lon, lat])) {
      // lat em 0..180 (meio grau) e lon em 0..720 (meio grau): 3 bytes por ponto
      const a = Math.round((lat + 90) * 2), o = Math.round((lon + 180) * 2);
      bytes.push(a, o >> 8, o & 255);
    }
  }
}
const b64 = Buffer.from(Uint8Array.from(bytes)).toString('base64');
writeFileSync(process.argv[2], `/* Pontos de terra do globo da capa: grade de 1,5° com a mesma densidade em toda latitude,
   tirada do world-atlas (Natural Earth 110m, domínio público) por _src/terra.mjs.
   3 bytes por ponto: latitude e longitude em meio grau. */
export const TERRA = '${b64}';
`);
console.log('pontos de terra:', bytes.length / 3, 'de', total, '| base64', b64.length, 'bytes');
