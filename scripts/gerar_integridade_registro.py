#!/usr/bin/env python3
"""Calcula SHA-512 de TODOS os arquivos versionados e do ZIP completo da revisão."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath


def git(*args: str) -> bytes:
    return subprocess.check_output(["git", *args])


def digest(data: bytes) -> str:
    return hashlib.sha512(data).hexdigest()


def arquivos_versionados() -> list[tuple[str, int, bytes]]:
    saida = []
    for registro in git("ls-files", "--cached", "--stage", "-z").split(b"\0"):
        if not registro:
            continue
        metadados, caminho = registro.split(b"\t", 1)
        modo, _objeto, stage = metadados.split()
        if stage != b"0":
            raise RuntimeError("O índice Git contém arquivos não mesclados")
        nome = caminho.decode("utf-8")
        if "\n" in nome or "\r" in nome or "\\" in nome:
            raise RuntimeError(f"Nome incompatível com manifesto: {nome!r}")
        pasta = PurePosixPath(nome)
        if pasta.is_absolute() or ".." in pasta.parts or str(pasta) != nome:
            raise RuntimeError(f"Caminho inválido: {nome!r}")
        arquivo = Path(nome)
        modo_num = int(modo, 8)
        if modo_num == 0o120000:
            conteudo = os.fsencode(os.readlink(arquivo))
        elif arquivo.is_file():
            conteudo = arquivo.read_bytes()
        else:
            raise RuntimeError(f"Arquivo do commit não localizado: {nome}")
        saida.append((nome, modo_num, conteudo))
    return sorted(saida, key=lambda item: item[0].encode("utf-8"))


def gerar(destino: Path) -> None:
    destino.mkdir(parents=True, exist_ok=True)
    sha_commit = git("rev-parse", "HEAD").decode().strip()
    branch = os.environ.get("GITHUB_REF_NAME", "main")
    arquivos = arquivos_versionados()
    if not arquivos:
        raise RuntimeError("Nenhum arquivo versionado foi encontrado")

    nome_zip = f"A-Quimica-das-Cores-main-{sha_commit[:12]}-fonte-completa.zip"
    caminho_zip = destino / nome_zip
    registros = []

    # ZIP determinístico: ordem estável, horário fixo e sem compactação,
    # evitando que a data de execução altere os bytes do pacote.
    with zipfile.ZipFile(caminho_zip, "w", compression=zipfile.ZIP_STORED,
                         allowZip64=True) as pacote:
        for nome, modo, conteudo in arquivos:
            info = zipfile.ZipInfo(nome, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = modo << 16
            info.compress_type = zipfile.ZIP_STORED
            pacote.writestr(info, conteudo)
            registros.append({
                "arquivo": nome,
                "bytes": len(conteudo),
                "sha512": digest(conteudo),
            })

    # Verificação independente dos bytes do ZIP recém-construído.
    with zipfile.ZipFile(caminho_zip, "r") as pacote:
        nomes = pacote.namelist()
        esperados = [r["arquivo"] for r in registros]
        if nomes != esperados or pacote.testzip() is not None:
            raise RuntimeError("ZIP não reproduz integralmente a lista versionada")
        for r in registros:
            if digest(pacote.read(r["arquivo"])) != r["sha512"]:
                raise RuntimeError(f"Falha de verificação: {r['arquivo']}")

    sha_pacote = hashlib.sha512(caminho_zip.read_bytes()).hexdigest()
    manifesto = "".join(f"{r['sha512']}  {r['arquivo']}\n" for r in registros)
    (destino / "SHA512SUMS-TODOS.txt").write_text(manifesto, encoding="utf-8")
    (destino / "SHA512-PACOTE.txt").write_text(
        f"{sha_pacote}  {nome_zip}\n", encoding="utf-8"
    )
    resumo = {
        "titulo": "A Química das Cores",
        "repositorio": os.environ.get("GITHUB_REPOSITORY", "qui-x/acidobase"),
        "branch": branch,
        "commit": sha_commit,
        "gerado_em_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "algoritmo": "SHA-512",
        "arquivos_versionados": len(registros),
        "bytes_arquivos": sum(r["bytes"] for r in registros),
        "pacote": nome_zip,
        "pacote_bytes": caminho_zip.stat().st_size,
        "pacote_sha512": sha_pacote,
        "arquivos": registros,
    }
    (destino / "RELATORIO-INTEGRIDADE.json").write_text(
        json.dumps(resumo, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
    )
    relatorio = (
        "# Integridade do código-fonte — A Química das Cores\n\n"
        f"- Repositório: `{resumo['repositorio']}`\n"
        f"- Branch: `{branch}`\n"
        f"- Commit integral: `{sha_commit}`\n"
        f"- Momento de emissão (UTC): {resumo['gerado_em_utc']}\n"
        f"- Arquivos versionados verificados: **{len(registros)}**\n"
        f"- Pacote completo: `{nome_zip}`\n"
        f"- Tamanho do pacote: {resumo['pacote_bytes']} bytes\n"
        f"- Algoritmo: **SHA-512**\n\n"
        "## SHA-512 único do pacote completo\n\n"
        f"```text\n{sha_pacote}\n```\n\n"
        "O ZIP contém todos os arquivos rastreados pelo Git neste commit, "
        "inclusive documentos, imagens, mídias, código, workflows e manifestos "
        "preexistentes; não contém a pasta interna `.git`. "
        "O relatório e os manifestos produzidos nesta execução ficam FORA "
        "do ZIP, evitando autorreferência.\n\n"
        "Para verificar depois de extrair o ZIP: "
        "`sha512sum --check SHA512SUMS-TODOS.txt` no diretório extraído. "
        "Para verificar o ZIP sem extraí-lo: "
        "`sha512sum --check SHA512-PACOTE.txt` com o ZIP ao lado.\n\n"
        "**Registro no INPI:** o SHA-512 só identifica o arquivo que se guardar "
        "efetivamente. Conserve o ZIP original byte a byte junto ao relatório; "
        "não confunda este hash com o SHA Git do commit.\n"
    )
    (destino / "RELATORIO-INTEGRIDADE.md").write_text(relatorio, encoding="utf-8")
    print(f"Commit: {sha_commit}")
    print(f"Arquivos: {len(registros)}")
    print(f"SHA-512 do ZIP: {sha_pacote}")
    print(f"Pacote: {nome_zip}")
    print(f"Relatórios: {destino}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--destino", type=Path, required=True)
    parametros = parser.parse_args()
    gerar(parametros.destino)
