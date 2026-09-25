/* Service worker do SIAB: guarda os arquivos do app para funcionar sem internet.
   Ao publicar uma versão nova, mude VERSAO: o navegador baixa tudo de novo e
   o app mostra "Nova versão disponível". A lista ARQUIVOS precisa conter todo
   arquivo usado pela página (o teste tests/pwa.test.cjs confere isso). */
const VERSAO = 'siab-0.3.0';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './a11y.js',
  './css/stylesiab.css',
  './assets/siab-icone.svg',
  './favicon-dark.svg',
  './favicon-light.svg',
  './assets/icones/icone-192.png',
  './assets/icones/icone-512.png',
  './assets/icones/icone-maskable-512.png',
  './assets/icones/apple-touch-icon.png',
  './js/core/namespace.js',
  './js/core/util.js',
  './js/data/catalogo.js',
  './js/data/cotidiano.js',
  './js/data/sais.js',
  './js/data/ambiente-saude.js',
  './js/data/funcoes.js',
  './js/simulation/quimica.js',
  './js/core/estado.js',
  './js/core/loja.js',
  './js/core/progresso.js',
  './js/core/roteador.js',
  './js/data/missoes.js',
  './js/data/trilhas.js',
  './js/simulation/motor-missoes.js',
  './js/ui/tubo.js',
  './js/ui/regua-ph.js',
  './js/ui/grafico.js',
  './js/ui/lupa.js',
  './js/ui/equacao.js',
  './js/ui/som.js',
  './js/ui/conta-gotas.js',
  './js/ui/seletores.js',
  './js/ui/prateleira.js',
  './js/ui/render.js',
  './js/telas/bancada.js',
  './js/telas/laboratorio.js',
  './js/telas/missao.js',
  './js/telas/inicio.js',
  './js/telas/aprender.js',
  './js/telas/desafios.js',
  './js/telas/detetive.js',
  './js/telas/titulacao.js',
  './js/telas/trunfo.js',
  './js/telas/regua.js',
  './js/telas/construtor.js',
  './js/telas/professor.js',
  './js/telas/caderno.js',
  './js/a11y/preferencias.js',
  './js/init/pwa.js',
  './js/init/app.js'
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(VERSAO).then(cache => cache.addAll(ARQUIVOS)));
});

// Remove caches de versões antigas.
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(chave => chave.startsWith('siab-') && chave !== VERSAO).map(chave => caches.delete(chave))))
      .then(() => self.clients.claim())
  );
});

// A página pede para ativar a versão nova (botão "Atualizar").
self.addEventListener('message', evento => {
  if (evento.data?.tipo === 'ATUALIZAR') self.skipWaiting();
});

// Primeiro o cache; se não houver, a rede (e guarda a resposta para depois).
// A página pode ter parâmetros de acessibilidade (?theme=…): ignoreSearch.
self.addEventListener('fetch', evento => {
  const pedido = evento.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  const navegacao = pedido.mode === 'navigate';
  evento.respondWith(
    caches.match(navegacao ? './index.html' : pedido, { ignoreSearch: true }).then(guardado => {
      if (guardado) return guardado;
      return fetch(pedido).then(resposta => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(VERSAO).then(cache => cache.put(pedido, copia));
        }
        return resposta;
      }).catch(() => (navegacao ? caches.match('./index.html') : Response.error()));
    })
  );
});
