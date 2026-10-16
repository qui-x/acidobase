"""Reúne a versão modular em um único HTML offline, sem dependências externas.

Uso: python3 build_standalone.py [destino.html]
Sem destino, grava SIAB-<versão>-standalone.html na pasta do projeto.
O arquivo único funciona aberto direto no navegador, mas não é instalável:
para instalar como aplicativo (PWA), publique a pasta em um endereço https.
"""
from pathlib import Path
import base64
import re
import sys

root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')
versao = re.search(r'version: "([^"]+)"', (root / 'js/core/namespace.js').read_text(encoding='utf-8'))[1]

# Marca o arquivo único (o PWA fica desligado) e informa a versão.
html = html.replace('<html lang=', '<html data-siab-standalone="true" lang=', 1)
html = html.replace('<meta charset="utf-8" />', f'<meta charset="utf-8" />\n    <meta name="application-version" content="{versao}" />', 1)

# Estilos e scripts entram no próprio HTML.
# O parâmetro de versão só serve para o cache do navegador: é removido aqui.
arquivo = lambda endereco: root / endereco.split('?')[0]
def embed_link(match):
    tag = match.group(0)
    rel = re.search(r'rel="([^"]+)"', tag)
    href = re.search(r'href="([^"]+)"', tag)
    if rel and rel[1] in ('manifest', 'apple-touch-icon'):
        return ''
    if rel and rel[1] == 'stylesheet' and href:
        return '<style>\n' + arquivo(href[1]).read_text(encoding='utf-8') + '\n</style>'
    return tag

html = re.sub(r'<link\b[^>]*>', embed_link, html)
html = re.sub(r'<script\b[^>]*src="([^"]+)"[^>]*>\s*</script>',
              lambda m: '<script>\n' + arquivo(m[1]).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>', html)

# Imagens viram data URI.
uri = {}
for asset in ['assets/siab-icone.svg', 'favicon-dark.svg', 'favicon-light.svg']:
    uri[asset] = 'data:image/svg+xml;base64,' + base64.b64encode((root / asset).read_bytes()).decode('ascii')
    html = html.replace('"' + asset + '"', '"' + uri[asset] + '"')

# O favicon acompanha o tema também no arquivo único (a11y.js troca o arquivo .svg).
favicon = "if (link && (link.getAttribute('href') || '').startsWith('data:')) return;"
assert favicon in html, 'a11y.js mudou: revise a troca do favicon'
html = html.replace(favicon, "if (link && (link.getAttribute('href') || '').startsWith('data:')) {"
                    f"link.setAttribute('href', tema === 'light' ? \"{uri['favicon-light.svg']}\" : \"{uri['favicon-dark.svg']}\"); return; }}")

# Sem service worker no arquivo único, nem servido por localhost.
pwa = '      "serviceWorker" in navigator &&'
assert pwa in html, 'pwa.js mudou: revise o bloqueio do service worker'
html = html.replace(pwa, '      !document.documentElement.hasAttribute("data-siab-standalone") &&\n' + pwa, 1)

destination = Path(sys.argv[1]) if len(sys.argv) > 1 else root / f'SIAB-{versao}-standalone.html'
destination.write_text(html, encoding='utf-8')
print(destination)
