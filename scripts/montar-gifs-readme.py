"""Monta GIFs documentais exclusivamente com quadros capturados no SIAB."""
from pathlib import Path
from collections import defaultdict
from PIL import Image
import json

frames_dir = Path(".readme-frames")
destino = Path(".github/midia")
destino.mkdir(parents=True, exist_ok=True)
manifesto = json.loads((frames_dir / "manifest.json").read_text())
series = defaultdict(list)
for item in manifesto:
    series[item["name"]].append(item)

esperados = {"titulacao-atual", "agitar-atual",
             "particulas-atual", "arco-iris-atual", "celular-atual"}
assert set(series) == esperados, (set(series), esperados)
for nome, itens in sorted(series.items()):
    assert len(itens) >= 7, (nome, len(itens))
    imgs = []
    for item in itens:
        origem = Path(item["filename"])
        with Image.open(origem) as image:
            rgb = image.convert("RGB")
            if rgb.width > 850:
                altura = round(rgb.height * 850 / rgb.width)
                rgb = rgb.resize((850, altura), Image.Resampling.LANCZOS)
            # Uma paleta adaptativa por quadro preserva o contraste dos detalhes.
            imgs.append(rgb.quantize(colors=96, method=Image.Quantize.FASTOCTREE))
    tamanhos = {(img.width,img.height) for img in imgs}
    assert len(tamanhos) == 1, (nome,tamanhos)
    saida = destino / (nome + ".gif")
    imgs[0].save(
        saida, format="GIF", save_all=True, append_images=imgs[1:],
        duration=[x["ms"] for x in itens],
        disposal=2, loop=0, optimize=True
    )
    with Image.open(saida) as verificado:
        assert verificado.n_frames >= 3, (nome,verificado.n_frames,len(itens))
    print(f"{saida}: {len(itens)} quadros, {saida.stat().st_size} bytes")
