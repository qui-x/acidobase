"""Reúne a versão modular em um único HTML offline, sem dependências externas.

Uso: python3 build_standalone.py [destino.html]
Sem destino, grava SIAB-teste.html na pasta acima do projeto.
O arquivo único funciona aberto direto no navegador, mas não é instalável:
para instalar como aplicativo (PWA), publique a pasta em um endereço https.
"""
from pathlib import Path
import base64
import re
import sys

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')

# Estilos e scripts entram no próprio HTML.
# O "?v=0.3.1" dos endereços só serve para o cache do navegador: é removido aqui.
arquivo = lambda endereco: root / endereco.split('?')[0]
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
              lambda m: '<style>\n' + arquivo(m[1]).read_text(encoding='utf-8') + '\n</style>', html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n' + arquivo(m[1]).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>', html)

# Manifesto e ícone da tela inicial só funcionam com a pasta publicada.
html = re.sub(r'\s*<link rel="(manifest|apple-touch-icon)"[^>]*>', '', html)

# Imagens viram data URI.
for asset in ['assets/siab-icone.svg']:
    data = 'data:image/svg+xml;base64,' + base64.b64encode((root / asset).read_bytes()).decode('ascii')
    html = html.replace('"' + asset + '"', '"' + data + '"')

destination = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / 'SIAB-teste.html'
destination.write_text(html, encoding='utf-8')
print(destination)
