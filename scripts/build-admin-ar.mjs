import fs from 'node:fs';
const source=fs.readFileSync('lib/admin/ar-source.tsv','utf8');const entries={};
for(const line of source.split('\n')){if(!line.trim())continue;const tab=line.indexOf('\t');if(tab<0)throw new Error(`Missing translation: ${line}`);entries[line.slice(0,tab)]=line.slice(tab+1);}
fs.writeFileSync('lib/admin/ar.json',JSON.stringify(entries,null,2)+'\n');console.log(`Built ${Object.keys(entries).length} Arabic interface translations.`);
