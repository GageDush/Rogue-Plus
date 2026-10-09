import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateDexReferences } from './generate-dex-references.mjs';
const root=resolve(import.meta.dirname,'..');
const lock=JSON.parse(await readFile(resolve(root,'reference-sources.lock.json'),'utf8'));
const ref=lock.game.commit;
if(!/^[0-9a-f]{40}$/.test(ref)) throw Error('Game source must be pinned to a commit');
async function source(path){
 const url='https://raw.githubusercontent.com/'+lock.game.repository+'/'+ref+'/'+path;
 const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
 if(!response.ok) throw Error('Upstream error '+response.status+': '+path);
 return response.text();
}
export function parseIds(src) {
 const body=src.match(/export enum SpeciesId\s*\{([\s\S]*?)^\}/m)?.[1];
 if(!body) throw Error('Missing SpeciesId enum');
 let n=-1;const ids=new Map();
 for(const line of body.split('\n')){
  const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*(?:=\s*(\d+))?\s*,/);
  if(!m)continue;
  n=m[2]===undefined?n+1:Number(m[2]);
  ids.set(m[1],n);
 }
 if(ids.size<1000)throw Error('Incomplete species enum: '+ids.size);
 return ids;
}
const aliases={NIDORAN_F:'Nidoran♀',NIDORAN_M:'Nidoran♂',MR_MIME:'Mr. Mime',MIME_JR:'Mime Jr.',MR_RIME:'Mr. Rime',FARFETCHD:"Farfetch'd",SIRFETCHD:"Sirfetch'd",HO_OH:'Ho-Oh',PORYGON_Z:'Porygon-Z',TYPE_NULL:'Type: Null',FLABEBE:'Flabébé',JANGMO_O:'Jangmo-o',HAKAMO_O:'Hakamo-o',KOMMO_O:'Kommo-o',WO_CHIEN:'Wo-Chien',CHIEN_PAO:'Chien-Pao',TING_LU:'Ting-Lu',CHI_YU:'Chi-Yu',BLOODMOON_URSALUNA:'Bloodmoon Ursaluna'};
export function displayName(key){
 if(aliases[key])return aliases[key];
 for(const [code,label] of [['ALOLA_','Alolan '],['GALAR_','Galarian '],['HISUI_','Hisuian '],['PALDEA_','Paldean ']]){
  if(key.startsWith(code))return label+displayName(key.slice(code.length));
 }
 return key.split('_').map(s=>s[0]+s.slice(1).toLowerCase()).join(' ');
}
export function parseStarters(src,ids){
 const heads=[...src.matchAll(/\w+SpeciesData\s*\[\s*SpeciesId\.([A-Z0-9_]+)\s*\]\s*=\s*\{/g)];
 const out=[];
 for(let i=0;i<heads.length;i++){
  const block=src.slice(heads[i].index+heads[i][0].length,heads[i+1]?.index??src.length);
  const price=block.match(/^\s{4}starterCost:\s*(\d+)\s*,/m);
  if(!price)continue;
  const key=heads[i][1],id=ids.get(key),cost=Number(price[1]);
  if(id===undefined||cost<1||cost>10)throw Error('Unexpected starter '+key);
  out.push({id,name:displayName(key),starterCost:cost});
 }
 return out;
}
export async function generate(){
 const paths=['src/enums/species-id.ts',...Array.from({length:9},(_,i)=>'src/data/balance/species/generation-'+String(i+1).padStart(2,'0')+'.ts')];
 const [idText,...generations]=await Promise.all(paths.map(source));
 const ids=parseIds(idText);
 const starters=generations.flatMap(src=>parseStarters(src,ids)).sort((a,b)=>a.id-b.id);
 if(starters.length<500||starters.length>900||new Set(starters.map(s=>s.id)).size!==starters.length)throw Error('Invalid upstream starter dataset: '+starters.length);
 return {schemaVersion:1,referenceVersion:'upstream-'+ref.slice(0,12),count:starters.length,provenance:{repository:lock.game.repository,commit:ref},starters};
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
const data=await generate();
const out=resolve(root,'companion/src/reference/generated/starter-roots.v1.json');
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify(data,null,2)+'\n');
console.log('Generated '+data.count+' offline starter records from '+ref);
await generateDexReferences();
}
