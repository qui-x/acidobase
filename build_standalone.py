"""Reúne a versão modular em um HTML offline, sem dependências externas."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
              lambda m: '<style>\n' + (root / m[1]).read_text(encoding='utf-8') + '\n</style>', html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n' + (root / m[1]).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>', html)
for asset in ['assets/siab-icone.svg']:
    data = 'data:image/svg+xml;base64,' + base64.b64encode((root / asset).read_bytes()).decode('ascii')
    html = html.replace('"' + asset + '"', '"' + data + '"')
destination = root.parent / 'SIAB-teste.html'
destination.write_text(html, encoding='utf-8')
print(destination)
