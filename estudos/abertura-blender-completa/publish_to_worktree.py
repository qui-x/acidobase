#!/usr/bin/env python3
"""Integra somente a animação *renderizada pelo Blender* ao SIAB.
Executar: python3 publish_to_worktree.py <checkout> <dist/siab3d>
PWA, controle de acessibilidade e dados de bancada preservados.
"""
from pathlib import Path
import sys, shutil, re

dest=Path(sys.argv[1]).resolve()
render=Path(sys.argv[2]).resolve()
mp4=render/"SIAB_abertura_Blender.mp4"
poster=render/"poster.png"
assert mp4.is_file() and mp4.stat().st_size>1024, "Faltou vídeo renderizado"
assert poster.is_file() and poster.stat().st_size>1024, "Faltou poster real Blender"
assert mp4.read_bytes()[4:8]==b"ftyp","O vídeo não é MP4 válido"
assert poster.read_bytes()[:8]==b"\x89PNG\r\n\x1a\n","Poster não é PNG válido"
assets=dest/"assets/abertura"
assets.mkdir(parents=True,exist_ok=True)
shutil.copyfile(mp4,assets/"siab-blender-intro.mp4")
shutil.copyfile(poster,assets/"siab-blender-poster.png")

script=dest/"js/ui/abertura.js"
js=script.read_text(encoding="utf8")
start=js.index("  function iniciar() {")
end=js.index("\n  function definir(",start)
new=r'''  function iniciar() {
    const caixa = document.getElementById("abertura");
    if (!caixa) return;
    const reduzir = window.A11Y?.estado?.motion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!ligada() || reduzir || getComputedStyle(caixa).display === "none") {
      caixa.remove();
      document.documentElement.dataset.abertura = "fim";
      return;
    }
    ativa = true;
    caixa.classList.add("abertura-blender");
    // A cena é inteiramente modelada e renderizada pelo Blender.
    // O navegador apenas reproduz o filme; não desenha objetos SVG.
    const palco = caixa.querySelector(".abertura-palco");
    const filme = document.createElement("video");
    filme.className = "abertura-3d-video";
    filme.src = "assets/abertura/siab-blender-intro.mp4";
    filme.poster = "assets/abertura/siab-blender-poster.png";
    filme.autoplay = true;
    filme.muted = true;
    filme.defaultMuted = true;
    filme.playsInline = true;
    filme.preload = "auto";
    filme.controls = false;
    filme.setAttribute("aria-hidden","true");
    palco.replaceChildren(filme);
    // Nenhum SVG/gradiente CSS é usado na cena 3D.
    filme.addEventListener("ended", encerrar, { once: true });
    filme.addEventListener("error", encerrar, { once: true });
    caixa.addEventListener("pointerdown", encerrar);
    document.addEventListener("keydown", encerrar, true);
    // Video corrompido, autoplay negado ou mídia indisponível não bloqueiam o SIAB.
    timers.push(setTimeout(encerrar, 8000));
    const play = filme.play();
    if (play?.catch) play.catch(encerrar);
  }
'''
js=js[:start]+new+js[end:]
script.write_text(js,encoding="utf8")
style=dest/"css/abertura-v5.css"
css=style.read_text(encoding="utf8")
append=r'''
/* SIAB Blender: geometria, materiais, tipografia e luzes vêm do vídeo renderizado. */
.abertura.abertura-blender .abertura-palco {
  width: min(96vw, 1100px);
  max-width: 1100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.abertura.abertura-blender .abertura-3d-video {
  display: block;
  width: 100%;
  max-width: min(96vw, 1100px);
  max-height: min(78vh, 720px);
  height: auto;
  aspect-ratio: 840 / 472;
  object-fit: contain;
  border: 0;
  background: transparent;
}
.abertura.abertura-blender .abertura-pular {
  position: relative;
  z-index: 2;
}
@media (max-width:560px) {
  .abertura.abertura-blender .abertura-palco { width: 100%; }
  .abertura.abertura-blender .abertura-3d-video { width: 100%; max-height: 64vh; }
}
'''
if ".abertura.abertura-blender .abertura-3d-video" not in css:style.write_text(css+"\n"+append,encoding="utf8")

index=dest/"index.html"
html=index.read_text(encoding="utf8")
assert 'js/ui/abertura.js?v=' in html,"Script da abertura não encontrado"
assert 'css/abertura-v5.css?v=' in html,"CSS da abertura não encontrado"
html=re.sub(r'(js/ui/abertura\.js\?v=)[^"]+',r'\g<1>1.0.0+20261026-blender',html)
html=re.sub(r'(css/abertura-v5\.css\?v=)[^"]+',r'\g<1>1.0.0+20261026-blender',html)
index.write_text(html,encoding="utf8")

sw=dest/"sw.js"
cache=sw.read_text(encoding="utf8")
cache,n=re.subn(r'(const VERSAO = ")[^"]+(";)',r'\g<1>siab-1.0.0+20261026-blender\2',cache,count=1)
assert n==1
for line in ('  "./assets/abertura/siab-blender-intro.mp4",','  "./assets/abertura/siab-blender-poster.png",'):
    if line not in cache:cache=cache.replace('  "./index.html",','  "./index.html",\n'+line)
sw.write_text(cache,encoding="utf8")

print("SIAB_BLEND_3D_INTEGRADO",dest,mp4.stat().st_size,poster.stat().st_size)
