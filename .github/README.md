<div align="center">

<img src="../assets/siab-icone.svg" width="96" alt="Ícone do SIAB: uma gota caindo em um tubo de ensaio com líquido em degradê do vermelho ao roxo">

# SIAB · Simulador de Indicadores Ácido-Base

### A química das cores

**Observe. Meça. Interprete. Investigue.**

<img src="midia/escala-ph.svg" width="720" alt="Escala de pH de 0 a 14 com as cores do indicador universal do SIAB: vermelho no ácido, verde no neutro e roxo no básico">

![Versão 1.0.0](https://img.shields.io/badge/vers%C3%A3o-1.0.0-c026d3)
![140 substâncias](https://img.shields.io/badge/subst%C3%A2ncias-140-db2777)
![Funciona offline](https://img.shields.io/badge/funciona-offline-7c3aed)
![Licença GPL-3.0](https://img.shields.io/badge/licen%C3%A7a-GPL--3.0-dc2626)

### [Abrir o SIAB no navegador <img src="midia/icones/next.svg" width="20" height="20" alt="">](https://qui-x.github.io/acidobase/)
### [Pacotes de Instalação <img src="midia/icones/next.svg" width="20" height="20" alt="">](https://drive.google.com/drive/u/1/folders/1RN7ACQXWp_Ho-LZKXxt03sdt0mKZDaWK)
<sub>Sem cadastro, sem instalar nada, no computador ou no celular.</sub>

<br>

<img src="midia/abertura-atual.gif" width="800" alt="Captura animada real da abertura atual do SIAB e da tela inicial A química das cores">

<sub>Capturas da versão publicada em 12/11/2026 · Chromium desktop e visualização mobile</sub>

</div>

---

## <img src="midia/icones/lab.svg" width="22" height="22" alt=""> O que é o SIAB?

O SIAB é um **laboratório de ácidos e bases que cabe no navegador**. Você monta a bancada, escolhe uma solução e um indicador, pinga gota a gota e acompanha o que acontece:

- a **cor** do indicador mudando;
- o **pH** medido com fita ou pHmetro;
- as **partículas** reagindo lá dentro;
- o **gráfico** se desenhando a cada leitura.

### Por que ele existe

Ácidos e bases são cheios de coisas que **não dá para ver**: íons, prótons pulando de uma molécula para outra, equilíbrios que nunca param. E nem toda escola tem reagentes, vidraria e tempo de laboratório para todo mundo experimentar.

O SIAB traduz esse conteúdo para o mundo digital **sem abrir mão da ciência**. Cada cor que aparece na tela vem de um cálculo de equilíbrio químico, não de uma animação enfeitada. Ele não substitui o laboratório de verdade: é o lugar para errar, repetir e perguntar "e se…?" quantas vezes quiser.

**Para quem:** estudantes do ensino médio e técnico, e professores que querem levar a investigação para a sala de aula, o laboratório de informática ou o celular dos alunos.

---

## <img src="midia/icones/tour.svg" width="22" height="22" alt=""> Comece em 30 segundos

1. Abra o **[SIAB](https://qui-x.github.io/acidobase/)** e entre no **Laboratório**.
2. Em **Montagem**, escolha uma solução (que tal *Suco de limão*?) e um indicador (*Extrato de repolho roxo*).
3. Segure **+ Segure para gotejar** e veja a cor mudar.
4. Em **Ver → Medir**, mergulhe uma fita de pH ou ligue o pHmetro.
5. Em **Ver → Analisar**, acompanhe o gráfico. Em **Dados**, ficam a tabela e o relatório.

> **Dica:** quer ir direto ao ponto? Em **Montagens prontas** há 11 bancadas montadas, como *Ácido forte × base forte* e o *Arco-íris do pH*.

---

## <img src="midia/icones/eye.svg" width="22" height="22" alt=""> Um passeio pelo laboratório

### Pingue e veja a cor virar

<img src="midia/titulacao-atual.gif" width="800" alt="Titulação de ácido clorídrico com hidróxido de sódio usando azul de bromotimol: o tubo passa de amarelo a verde e a azul, enquanto o gráfico de pH por volume desenha uma curva em S com um salto perto de 1 mL">

Nesta montagem pronta, ácido clorídrico (HCl, 0,0100 mol/L) recebe hidróxido de sódio (NaOH) com **azul de bromotimol**. A cor e as leituras do pHmetro acompanham as sucessivas doses, enquanto o gráfico conecta as medições realizadas.

O experimento foi executado diretamente no SIAB: doses maiores na região inicial e incrementos de uma gota próximos da equivalência, sem inserir valores fictícios. O gráfico mostra os pontos efetivamente registrados.

### Cada gota cai em um lugar

<div align="center">
<img src="midia/agitar-atual.gif" width="530" alt="Gotas de hidróxido de sódio caem no tubo amarelo e formam uma mancha azul onde caem; ao tocar em Agitar a cor se espalha, e o tubo fica verde e depois azul">
</div>

As regiões coloridas das gotas são representadas localmente antes da agitação. Ao usar **Agitar**, o SIAB representa a homogeneização, exibindo a cor correspondente ao pH global calculado.

### Veja o invisível

<div align="center">
<img src="midia/particulas-atual.gif" width="623" alt="Ao lado do tubo, uma caixa de partículas mostra íons H3O+ vermelhos sendo consumidos pelos OH- que chegam, com o aviso H3O+ + OH- formam 2 H2O; depois da equivalência sobram Na+, Cl- e OH-">
</div>

Em **Ver → Observar → Partículas**, a visualização do motor atual mostra a presença relativa das espécies e a neutralização **H₃O⁺ + OH⁻ → 2 H₂O**. O Cl⁻ e o Na⁺ são íons espectadores; após a equivalência, há excesso de OH⁻.

### O arco-íris do pH

<img src="midia/arco-iris-atual.gif" width="800" alt="Sete tubos com indicador universal aparecem na bancada, do vermelho ao roxo; cada um é mostrado em foco e depois todos juntos na visão geral">

Sete soluções, um indicador universal, todas as cores da escala: ácido clorídrico, ácido clorídrico diluído, cloreto de amônio, água pura, acetato de sódio, amônia e hidróxido de sódio. De **vermelho** a **roxo**, passando pelo verde da água pura. Sais também mudam o pH!

### No celular também

<table>
<tr>
<td width="300"><img src="midia/celular-atual.gif" width="280" alt="Demonstração animada da bancada móvel do SIAB atual, com gotejamento de NaOH durante titulação e controles de toque"></td>
<td>

O SIAB foi pensado para **caber na palma da mão**:

- segure o botão e as gotas caem sem parar; solte e elas param;
- cada sequência termina com um aviso do **volume que realmente entrou**;
- a fita de pH mostra a leitura logo abaixo do tubo;
- Montagem, Ver e Dados abrem como painéis que sobem da parte de baixo da tela.

A imagem mostra a **interface mobile atual**, com a bancada ocupando a área central e controles reorganizados para toque.

</td>
</tr>
</table>

---

### A interface atual da bancada

<img src="midia/bancada-atual.png" width="800" alt="Captura atual do laboratório SIAB em tela desktop: área de investigação central e controles de ação">

## <img src="midia/icones/mount.svg" width="22" height="22" alt=""> Tem muito mais

<table>
<tr>
<td width="50%"><img src="midia/missoes.png" alt="Tela Missões com desafios como O que o repolho roxo revela e Todo sal é neutro?"><br><b>Missões:</b> problemas abertos com condições de sucesso, como <i>"Todo sal é neutro?"</i></td>
<td width="50%"><img src="midia/manual.png" alt="Manual do usuário com busca e atalhos para medir pH e abrir montagens"><br><b>Manual:</b> busca, passo a passo e ajuda sobre cada controle da bancada.</td>
</tr>
<tr>
<td><img src="midia/professor.png" alt="Área do professor para preparar uma atividade em três passos"><br><b>Área do Professor:</b> monte a atividade, escolha os instrumentos e gere um link para a turma.</td>
<td><img src="midia/acessibilidade.png" alt="Painel de acessibilidade com modo escuro, alto contraste, tamanho do texto, simulação de daltonismo e som do pH"><br><b>Acessibilidade:</b> contraste, tamanho do texto, daltonismo, som do pH e mais.</td>
</tr>
<tr>
<td width="50%"><img src="midia/roteiros-atual.png" alt="Tela atual de Roteiros Experimentais do SIAB"><br><b>Roteiros:</b> percursos de investigação para realizar e registrar.</td>
<td width="50%"><img src="midia/menu-mobile-atual.png" alt="Menu mobile atual do SIAB sem informativos técnicos de armazenamento"><br><b>Navegação móvel:</b> acesso direto às ferramentas e à instalação, com controles adaptados.</td>
</tr>
</table>

| | O que tem |
|---|---|
| <img src="midia/icones/prepare.svg" width="18" height="18" alt=""> **140 substâncias** | 5 ácidos fortes, 13 ácidos fracos, 5 bases fortes, 12 bases fracas, 35 sais, 12 ácidos polipróticos e aminoácidos (ácido fosfórico, ácido cítrico, glicina…), 2 suspensões, água e **55 amostras do cotidiano**: suco de limão, vinagre, refrigerante, leite, café, água sanitária, saliva, água do mar… |
| <img src="midia/icones/lab.svg" width="18" height="18" alt=""> **11 indicadores** | Fenolftaleína, azul de bromotimol, alaranjado de metila, vermelho de metila, verde de bromocresol, vermelho de fenol, timolftaleína, tornassol, indicador universal e dois naturais: **repolho roxo** e **cúrcuma** |
| <img src="midia/icones/mount.svg" width="18" height="18" alt=""> **3 vidrarias** | Tubo de ensaio, béquer e erlenmeyer |
| <img src="midia/icones/meter.svg" width="18" height="18" alt=""> **Instrumentos** | Fita de pH, pHmetro com calibração de dois pontos, termômetro e condutivímetro |
| <img src="midia/icones/chart.svg" width="18" height="18" alt=""> **Gráficos e dados** | pH × volume, ΔpH/ΔV, distribuição de espécies, tabela de medições e histórico |
| <img src="midia/icones/explore.svg" width="18" height="18" alt=""> **Três módulos** | **Explorar** (observar a cor mudar), **Medir** (controlar quantidades e registrar leituras) e **Calcular** (concentrações, [H₃O⁺], [OH⁻], Ka, Kb e α) |
| <img src="midia/icones/mission.svg" width="18" height="18" alt=""> **Para aprender** | 14 temas, 19 missões, 35 roteiros experimentais e 11 montagens prontas |
| <img src="midia/icones/notebook.svg" width="18" height="18" alt=""> **Caderno e relatório** | O Caderno guarda notas e práticas. O relatório sai completo, para preencher à mão ou como atividade de análise, e pode ser impresso ou salvo em PDF |

---

## <img src="midia/icones/learn.svg" width="22" height="22" alt=""> A ciência por trás das cores

O SIAB não "chuta" o pH. Para cada tubo ele resolve o equilíbrio químico de verdade:

- **Balanço de cargas e de massa.** O pH é a raiz numérica do balanço de cargas (soma das cargas positivas = soma das negativas), junto com os balanços de massa de cada par ácido-base. Por isso misturas, diluições, sais e tampões funcionam sem regras especiais. O pH de uma mistura nunca é a média dos pHs!
- **Temperatura.** O pKw da água muda com a temperatura, e a neutralidade é **pH = pKw/2**. A 25 °C isso dá 7, mas a água pura continua neutra mesmo quando o pH dela não é 7.
- **Indicadores.** A cor sai do pKIn e da faixa de viragem de cada indicador.
- **Condutividade.** Usa a lei de Kohlrausch, **κ = Σ λ°·c**, com as condutividades iônicas limite do *CRC Handbook*.
- **Instrumentos honestos.** A fita arredonda para uma unidade de pH. O pHmetro tem resolução de 0,01 e leva 0,5 s para estabilizar. Os gráficos usam só leituras que você registrou; o que é resultado do modelo vem identificado como tal.

E os limites são assumidos às claras. É um modelo didático: solução ideal, atividades aproximadas por concentrações, equilíbrio instantâneo. As amostras do cotidiano têm composição representativa, não a de um produto real. O SIAB **não** é instrumento de laboratório nem de diagnóstico.

<sub>Referências: OpenStax Chemistry 2e; D. C. Harris, <i>Análise Química Quantitativa</i>; <i>CRC Handbook of Chemistry and Physics</i>; IAPWS (ionização da água); Bandura e Lvov (2006); Nelson e Cox, <i>Lehninger</i>; Baes e Mesmer, <i>The Hydrolysis of Cations</i>.</sub>

---

## <img src="midia/icones/professor.svg" width="22" height="22" alt=""> Para professores

- **Prepare em três passos:** escolha uma missão, um roteiro ou uma montagem; defina instrumentos, temperatura e navegação; gere o link e **abra como aluno** para conferir.
- **Modo projetor** para mostrar a bancada para a turma toda.
- **Relatórios** separam condições iniciais, medições, representações, interpretação e condições finais. A versão **para preencher à mão** mantém os dados e deixa em branco só os campos de autoria do aluno.
- As respostas de referência ficam na área do professor, e cada link carrega a própria configuração.

## <img src="midia/icones/accessibility.svg" width="22" height="22" alt=""> Acessível de verdade

Modo escuro e claro, **alto contraste**, tamanho do texto, espaçamento de letras, **reduzir animações**, leitura simples e **simulação de daltonismo**. A cor de cada tubo também é descrita em texto. O **som do pH** fica mais agudo quanto maior o pH, e o celular pode **vibrar na viragem**. O VLibras é opcional e precisa de internet.

## <img src="midia/icones/install.svg" width="22" height="22" alt=""> Instalação e uso offline

Na versão para navegador, **Instalar app** permite escolher entre PWA, APK para Android, EXE (instalador ou portátil) e MSI para Windows, e AppImage para Linux, com sugestão baseada no dispositivo.

<table>
<tr>
<td width="65%"><img src="midia/instalacao-desktop.png" alt="Diálogo de instalação atual do SIAB no desktop, com opções PWA, Android, Windows e Linux"></td>
<td width="35%"><img src="midia/instalacao-mobile.png" alt="Seleção de instalação do SIAB em navegador Android, com indicação de APK"></td>
</tr>
</table>

### Funciona sem internet

- **Como PWA:** abra o SIAB conectado uma vez e escolha **Instalar app → Aplicativo pelo navegador (PWA)**; após a instalação e o carregamento inicial, seus recursos locais continuam disponíveis offline.
- **Como aplicativo de sistema:** escolha APK (Android), EXE/MSI (Windows) ou AppImage (Linux), em [Pacotes de Instalação](https://drive.google.com/drive/u/1/folders/1RN7ACQXWp_Ho-LZKXxt03sdt0mKZDaWK).
- **Arquivo único:** baixe o [`SIAB-1.0.0-standalone.html`](../SIAB-1.0.0-standalone.html) (botão de download na página do arquivo) e abra direto no navegador, sem servidor e sem instalar nada.
- **Seus dados ficam com você:** não há conta. Caderno, sessões e relatórios ficam guardados no próprio navegador. Só os extras opcionais (clima da sua cidade e VLibras) usam a internet.

---

## <img src="midia/icones/projector.svg" width="22" height="22" alt=""> Rodar no seu computador

```bash
git clone https://github.com/qui-x/acidobase.git
cd acidobase
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Não precisa de Node, npm nem compilação: é HTML, CSS e JavaScript puros.

<details>
<summary><b>Como o repositório está organizado</b></summary>

<br>

| Ramo | O que tem |
|---|---|
| `acidosebases1.0.0` (principal) | Só o que roda o programa: `index.html`, `css/`, `js/`, `assets/`, `vendor/`, `sw.js`, o manifesto, o standalone e a licença |
| [`claude/testes`](https://github.com/qui-x/acidobase/tree/claude/testes) | Tudo o mais: [manual](https://github.com/qui-x/acidobase/blob/claude/testes/docs/MANUAL.md), [modelo científico](https://github.com/qui-x/acidobase/blob/claude/testes/docs/MODELO-CIENTIFICO.md), [limitações](https://github.com/qui-x/acidobase/blob/claude/testes/docs/LIMITACOES.md), [validação](https://github.com/qui-x/acidobase/blob/claude/testes/VALIDACAO.md), [histórico de versões](https://github.com/qui-x/acidobase/blob/claude/testes/CHANGELOG.md), scripts de geração e manifestos SHA |

</details>

---

## <img src="midia/icones/report.svg" width="22" height="22" alt=""> Licença

SIAB é software livre sob a licença [GPL-3.0](../LICENSE): use, estude, modifique e compartilhe. O [dialog-polyfill](../vendor/dialog-polyfill/LICENSE) incluído segue a licença BSD-3-Clause.

---

## <img src="midia/icones/about.svg" width="22" height="22" alt=""> Créditos

Desenvolvido por **Thiago Weslei** no **IFBA**, o Instituto Federal de Educação, Ciência e Tecnologia da Bahia - Campus Vitória da Conquista.

<div align="center">

<br>

**Feito para quem ensina e aprende química.**

<sub>Gostou? Deixe uma estrela no repositório e mostre o SIAB para sua turma.</sub>

</div>
