// Gera gui/_src/android (o app Android do currículo, uma Trusted Web Activity) com o @bubblewrap/core, sem os prompts da CLI.
// Uso: suba o servidor local na porta 8123 (ícones e manifesto saem dele), depois
//   cd gui/_src && npm i --no-save @bubblewrap/core@1.27.0 && node twa.mjs
// Mudou versão do app? Suba appVersionCode e appVersionName aqui antes de gerar.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');
const AQUI = new URL('.', import.meta.url).pathname;
const DESTINO = AQUI + 'android';
const URL_MANIFESTO = 'https://suzuki.cuoncient.com/gui/manifest.webmanifest';
const web = JSON.parse(readFileSync(AQUI + '../manifest.webmanifest', 'utf8'));
delete web.shortcuts; // atalhos com ícone remoto: ficam só no PWA
const m = TwaManifest.fromWebManifestJson(new URL(URL_MANIFESTO), web);
m.packageId = 'com.cuoncient.curriculo';
m.host = 'suzuki.cuoncient.com';
m.name = 'Guilherme Keidi Suzuki';
m.launcherName = 'G. Suzuki';
m.startUrl = '/gui/';
const COR = { hex: () => '#101214', toString: () => '#101214' };
m.themeColor = m.themeColorDark = m.navigationColor = m.navigationColorDark = m.navigationDividerColor = m.navigationDividerColorDark = m.backgroundColor = COR;
// o androidbrowserhelper 2.7 exige Android 7 (API 24) ou mais novo
m.minSdkVersion = 24;
m.appVersionName = '1.0.0';
m.appVersionCode = 1;
m.signingKey = { path: './curriculo.keystore', alias: 'curriculo' };
m.fallbackType = 'customtabs';
m.enableNotifications = false;
m.splashScreenFadeOutDuration = 300;
m.shortcuts = [];
// os ícones são baixados na geração: aqui vêm do servidor local, no arquivo ficam os endereços públicos
const publico = { icon: 'https://suzuki.cuoncient.com/gui/app/icone-512.png', mask: 'https://suzuki.cuoncient.com/gui/app/icone-512.png' };
m.iconUrl = 'http://localhost:8123/gui/app/icone-512.png';
m.webManifestUrl = new URL('http://localhost:8123/gui/manifest.webmanifest');
m.maskableIconUrl = 'http://localhost:8123/gui/app/icone-512.png';
rmSync(DESTINO, { recursive: true, force: true });
mkdirSync(DESTINO, { recursive: true });
await new TwaGenerator().createTwaProject(DESTINO, m, new ConsoleLog('twa'));
m.iconUrl = publico.icon; m.maskableIconUrl = publico.mask; m.webManifestUrl = new URL(URL_MANIFESTO);
await m.saveToFile(DESTINO + '/twa-manifest.json');
console.log('ok');
// o gerador grava no build.gradle o endereço de onde baixou o manifesto; no app vale o público
import { readFileSync as ler, writeFileSync as gravar } from 'node:fs';
const g = DESTINO + '/app/build.gradle';
gravar(g, ler(g, 'utf8').replaceAll('http://localhost:8123/gui/manifest.webmanifest', URL_MANIFESTO));
// o template ainda traz jcenter(), que só lê e pode sair do ar; o Maven Central resolve o mesmo
const raiz = DESTINO + '/build.gradle';
gravar(raiz, ler(raiz, 'utf8').replaceAll('jcenter()', 'mavenCentral()'));
console.log('projeto Android em', DESTINO);
