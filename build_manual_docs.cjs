/* Documentos derivados do registro, sem depender de DOM ou de bibliotecas. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,ctx={SIAB:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/data/manual.js'),'utf8'),ctx);
const {topics,categories,aliases}=ctx.SIAB.manualContent,R=ctx.SIAB.manualRegistry;
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const link=id=>`../SIAB-standalone.html#/manual/${id}`;
const text=value=>String(value||'').replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g,(_,id,label)=>`[${label||R.resolve(id)?.title||id}](${link(R.resolve(id)?.id||id)})`);
const write=(name,body)=>fs.writeFileSync(path.join(root,'docs',name),body+'\n');
let manual=`# Manual do SIAB ${version}\n\nEsta referência é gerada a partir do conteúdo do Manual interativo. Para busca, diagramas e navegação por tópicos, abra o SIAB e escolha **Manual**. O botão **Imprimir tópico** inclui os detalhes expansíveis; na home, **Imprimir guia rápido** gera uma visão linear das categorias.\n`;
for(const c of categories){manual+=`\n## ${c.title}\n`;for(const t of topics.filter(t=>t.category===c.id)){
 manual+=`\n### ${t.title}\n\n${text(t.summary)}\n\n**Para que serve:** ${text(t.purpose)}\n\n**Como usar**\n\n${t.steps.map((s,i)=>(i+1)+'. '+text(s)).join('\n')}\n`;
 if(t.example)manual+=`\n**Exemplo:** ${text(t.example)}\n`;
 for(const d of t.details)manual+=`\n**${d.title}:** ${text(d.text)}\n`;
 if(t.generated)manual+=`\nA tabela de referência é gerada a partir do catálogo no [tópico interativo](${link(t.id)}).\n`;
 if(t.related.length)manual+=`\n**Veja também:** ${t.related.map(id=>`[${R.resolve(id).title}](${link(id)})`).join(' · ')}.\n`;
}}
write('MANUAL.md',manual);
write('PAGINAS-MANUAL.md',`# Páginas do Manual — ${version}\n\n${categories.length} categorias e ${topics.length} tópicos. O identificador do tópico é estável e resolve o endereço direto.\n\n| Categoria | Tópico | ID e rota |\n|---|---|---|\n`+topics.map(t=>`| ${R.category(t.category).title} | ${t.title} | [${t.id}](${link(t.id)}) · \`#/manual/${t.id}\` |`).join('\n')+'\n\n## Compatibilidade de endereços\n\n| Endereço antigo | Destino atual |\n|---|---|\n'+Object.entries(aliases).map(([a,b])=>`| \`#/manual/${a}\` | \`#/manual/${b}\` |`).join('\n')+'\n\n`#/manual/roteiros` mantém sua própria explicação. `#/manual/montagens` explica Montagens prontas; o catálogo operacional fica em `#/montagens`.');
write('TERMOS-BUSCA.md',`# Termos e sinônimos do Manual — ${version}\n\nA busca indexa título, resumo, finalidade, palavras-chave, passos, exemplo e detalhes. A tabela lista os termos editoriais explícitos; o vocabulário normalizado completo está em [INDICE-BUSCA.json](INDICE-BUSCA.json).\n\n| Tópico | Termos e sinônimos explícitos |\n|---|---|\n`+topics.map(t=>`| ${t.title} | ${t.keywords.join('; ')} |`).join('\n')+'\n\n## Normalização e ordem\n\n- Sem distinção entre acentos e maiúsculas/minúsculas.\n- Redução simples de plurais (`-s`, `-ões`, `-ais`), sem promessa de análise linguística completa.\n- Palavras de ligação são ignoradas; os demais termos precisam encontrar correspondência.\n- Correspondência no título recebe prioridade; palavras-chave e sinônimos elevam a relevância.\n- Prefixos com mais de dois caracteres também encontram termos.\n- Exemplos: “medidor de pH” → pHmetro; “papel indicador” → Fita de pH.\n- Nenhuma consulta é enviada a servidor; não há dependência externa.');
const entries=R.index.map(x=>({id:x.topic.id,title:x.topic.title,category:x.topic.category,keywords:x.topic.keywords,normalizedTerms:[...new Set(x.words)].sort()}));
write('INDICE-BUSCA.json',JSON.stringify({version,categories,aliases,topics:entries,vocabulary:[...new Set(entries.flatMap(t=>t.normalizedTerms))].sort()},null,2));
console.log(`${topics.length} páginas e ${entries.length} entradas de busca documentadas.`);
