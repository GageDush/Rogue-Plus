import { execFileSync } from 'node:child_process';
const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbidden=paths.filter(path=>/\.(prsv|sav|savestate|env)(\.|$)/i.test(path) || path.startsWith('companion/private/') || path.startsWith('companion/src/user-data/') || path.startsWith('companion/src/reference/generated/') || path==='companion/src/reference/starter-roots.v1.json' || (/account-fixture\./.test(path) && !/\.template\./.test(path)));
if(forbidden.length){console.error('Do not commit private or build-generated data:',forbidden.join(', '));process.exit(1)}
console.log('Tracked source boundary verified across '+paths.length+' files.');
