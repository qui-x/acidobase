// Servidor local mínimo, sem dependências, para testar o SIAB como aplicativo (PWA).
// Uso: node tools/servidor.cjs [porta]   → abre em http://localhost:8080
// O service worker só funciona em http://localhost ou em https.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json',
  '.md': 'text/markdown; charset=utf-8'
};

// transformar(caminho, conteúdo) permite aos testes simular uma versão nova de um arquivo.
function criarServidor({ transformar = null } = {}) {
  return http.createServer((pedido, resposta) => {
    const caminho = decodeURIComponent(pedido.url.split('?')[0]);
    const arquivo = path.join(RAIZ, caminho === '/' ? 'index.html' : caminho);
    if (!arquivo.startsWith(RAIZ) || !fs.existsSync(arquivo) || fs.statSync(arquivo).isDirectory()) {
      resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      resposta.end('Não encontrado');
      return;
    }
    resposta.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    const conteudo = fs.readFileSync(arquivo);
    resposta.end(transformar ? transformar(path.relative(RAIZ, arquivo), conteudo) : conteudo);
  });
}

module.exports = { criarServidor };

if (require.main === module) {
  const porta = Number(process.argv[2] || 8080);
  criarServidor().listen(porta, () => console.log(`SIAB em http://localhost:${porta}  (Ctrl+C para parar)`));
}
