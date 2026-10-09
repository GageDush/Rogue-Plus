import { createRequire } from 'node:module';
const require = createRequire(new URL('../companion/package.json', import.meta.url));
const ts = require('typescript');
export const known = value => ({ status: 'known', value });
export const unavailable = reason => ({ status: 'unavailable', reason });
export function syntax(text, path = 'source.ts') {
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  if (file.parseDiagnostics.length) throw Error('Invalid TypeScript source: ' + path);
  return file;
}
export function visit(node, predicate) {
  const found = [];
  function walk(n) { if (predicate(n)) found.push(n); ts.forEachChild(n, walk); }
  walk(node); return found;
}
export function fields(node) {
  if (!ts.isObjectLiteralExpression(node)) throw Error('Expected explicit object literal');
  const out = new Map();
  for (const p of node.properties) {
    if (!ts.isPropertyAssignment(p)) throw Error('Unsupported object property: ' + p.getText().slice(0,80));
    const key = p.name.getText().replace(/^['"]|['"]$/g, '');
    if (out.has(key)) throw Error('Duplicate field: ' + key);
    out.set(key, p.initializer);
  }
  return out;
}
export function literal(node, enums = {}, constants = {}) {
  if (!node) throw Error('Missing required source value');
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isStringLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const value = literal(node.operand, enums, constants);
    if (typeof value !== 'number') throw Error('Invalid unary source value');
    return -value;
  }
  if (ts.isPropertyAccessExpression(node)) {
    const table = enums[node.expression.getText()], key = node.name.text;
    if (table?.has(key)) return table.get(key);
  }
  if (ts.isIdentifier(node) && Object.hasOwn(constants, node.text)) return constants[node.text];
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(n => literal(n, enums, constants));
  throw Error('Unsupported source expression: ' + node.getText().slice(0,100));
}
export function enumValues(text, name) {
  const declarations = visit(syntax(text), n => ts.isEnumDeclaration(n) && n.name.text === name);
  if (declarations.length !== 1) throw Error('Missing/duplicate enum: ' + name);
  const out = new Map(); let previous = -1;
  for (const member of declarations[0].members) {
    const key = member.name.getText();
    const value = member.initializer ? literal(member.initializer) : previous + 1;
    if (out.has(key) || (!member.initializer && typeof previous !== 'number')) throw Error('Unsupported enum: ' + name);
    out.set(key, value); previous = value;
  }
  return out;
}
export const camel = key => key.toLowerCase().replace(/_+([a-z0-9])/g, (_, c) => c.toUpperCase());
export function named(key, id, names) {
  const entry = names[camel(key)], name = typeof entry === 'string' ? entry : entry?.name;
  if (typeof name !== 'string' || !name) throw Error('Missing official name: ' + key);
  return { id, key, name };
}
export function speciesEntries(text) {
  return visit(syntax(text), n => ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken
    && ts.isElementAccessExpression(n.left) && ts.isPropertyAccessExpression(n.left.argumentExpression)
    && n.left.argumentExpression.expression.getText() === 'SpeciesId').map(n => {
      const key = n.left.argumentExpression.name.text, config = fields(n.right), expression = config.get('species');
      if (!expression || !ts.isNewExpression(expression) || expression.expression.getText() !== 'PokemonSpecies'
        || expression.arguments?.length !== 1) throw Error('Unsupported species constructor: ' + key);
      return { key, config, data: fields(expression.arguments[0]) };
    });
}
export function extractSpecies(entries, enums, names) {
  const records = [], seen = new Set();
  const get = (map, key) => literal(map.get(key), enums);
  for (const { key, config, data } of entries) {
    const id = get(data, 'id');
    if (id !== enums.SpeciesId.get(key) || seen.has(id)) throw Error('Invalid species identity: ' + key);
    seen.add(id);
    const generation = get(data, 'generation');
    if (!Number.isInteger(generation) || generation < 1 || generation > 9) throw Error('Invalid generation');
    let constructors = [data];
    if (data.has('forms')) {
      const forms = data.get('forms');
      if (!ts.isArrayLiteralExpression(forms)) throw Error('Expected explicit forms');
      if (forms.elements.length) constructors = forms.elements.map(n => {
        if (!ts.isNewExpression(n) || n.expression.getText() !== 'PokemonForm' || n.arguments?.length !== 1) throw Error('Unsupported form constructor');
        return fields(n.arguments[0]);
      });
    }
    const forms = constructors.map((form, index) => {
      const baseStats = Object.fromEntries(['hp','attack','defense','specialAttack','specialDefense','speed']
        .map((stat, i) => [stat, get(form, ['baseHp','baseAtk','baseDef','baseSpatk','baseSpdef','baseSpd'][i])]));
      if (Object.values(baseStats).some(n => !Number.isInteger(n) || n < 1)) throw Error('Invalid base stats: ' + key);
      const total = Object.values(baseStats).reduce((a,b) => a+b,0);
      if (get(form,'baseTotal') !== total) throw Error('Base total mismatch: ' + key);
      const types = [get(form,'type1'), get(form,'type2')].filter(n => n !== null);
      if (!types.length || types.some(n => !Number.isInteger(n) || n < 0 || n > 17)) throw Error('Invalid species types');
      return { index, key: form.has('formKey') ? get(form,'formKey') : '',
        name: form.has('formName') ? get(form,'formName') : 'Normal', types: known(types),
        baseStats: known(baseStats), baseStatTotal: known(total),
        abilities: unavailable('Ability reference packet pending.'),
        passiveAbilityId: unavailable('Ability reference packet pending.'),
        starterSelectable: unavailable('Selection compatibility packet pending.'),
        obtainable: unavailable('Selection compatibility packet pending.'),
        levelMoves: unavailable('Move reference packet pending.') };
    });
    if (forms.some(f => typeof f.key !== 'string' || typeof f.name !== 'string')
      || new Set(forms.map(f => f.key)).size !== forms.length) throw Error('Invalid form identity: ' + key);
    const cost = config.has('starterCost') ? get(config,'starterCost') : null;
    if (cost !== null && (!Number.isInteger(cost) || cost < 1 || cost > 10)) throw Error('Invalid starter cost');
    records.push({ ...named(key,id,names), generation: known(generation), originalStarterCost: known(cost), forms: known(forms),
      starterRootIds: unavailable('Root reference packet pending.'), evolutionIds: unavailable('Root reference packet pending.'),
      evolutionLinks: unavailable('Root reference packet pending.'), formChangeLinks: unavailable('Root reference packet pending.'),
      passiveAbilityId: unavailable('Ability reference packet pending.'), eggMoveIds: unavailable('Move reference packet pending.'),
      eggMoveSourceId: unavailable('Move reference packet pending.') });
  }
  return records.sort((a,b) => a.id-b.id);
}

/** Relationships only: conditions/items/levels are not a rules-legality engine. */
export function applyRoots(species, entries, enums) {
  const byId = new Map(species.map(s => [s.id,s]));
  for (const entry of entries) {
    const record = byId.get(enums.SpeciesId.get(entry.key));
    const rootId = literal(entry.config.get('starter'),enums);
    if (!byId.has(rootId) || byId.get(rootId).originalStarterCost.value === null) throw Error('Missing/unpriced starter root: ' + entry.key);
    record.starterRootIds = known([rootId]);
    function links(field, allowed) {
      if (!entry.config.has(field)) return [];
      const list = entry.config.get(field);
      if (!ts.isArrayLiteralExpression(list)) throw Error('Expected explicit relationship array');
      return list.elements.map(node => {
        if (!ts.isNewExpression(node) || !allowed.includes(node.expression.getText()) || node.arguments?.length !== 1) throw Error('Unsupported relationship constructor');
        const values = fields(node.arguments[0]);
        const targetSpeciesId = literal(values.get('speciesId'),enums);
        if (!byId.has(targetSpeciesId)) throw Error('Missing relationship target: ' + targetSpeciesId);
        const readKey = key => values.has(key) ? literal(values.get(key),enums) : null;
        const link = {targetSpeciesId,fromFormKey:readKey('preFormKey'),toFormKey:readKey('evoFormKey')};
        for (const [id,key] of [[record.id,link.fromFormKey],[targetSpeciesId,link.toFormKey]]) {
          // Preserve the official empty target key even when a gendered first form has a named key.
          // This graph records source declarations; selection/evolution execution is separate.
          if (key !== null && !(id === targetSpeciesId && key === '')
            && !byId.get(id).forms.value.some(form => form.key === key)) throw Error('Missing relationship form: ' + entry.key + ' / ' + key);
        }
        return link;
      });
    }
    const evolutions = links('evolutions',['SpeciesEvolution','SpeciesFormEvolution']);
    record.evolutionIds = known([...new Set(evolutions.map(link => link.targetSpeciesId))]);
    record.evolutionLinks = known(evolutions);
    record.formChangeLinks = known(links('formChanges',['SpeciesFormChange']));
  }
}

export function formConstructors(data) {
  if (!data.has('forms')) return [data];
  const list=data.get('forms');
  if (!ts.isArrayLiteralExpression(list)) throw Error('Expected explicit forms');
  return list.elements.length ? list.elements.map(node => fields(node.arguments[0])) : [data];
}
export function applyAbilities(species, entries, enums, names) {
  // Official unknown ZA placeholders have no English identity; never invent a name.
  const abilities = [...enums.AbilityId].filter(([key,id]) => id !== 0 && !/^ABILITY_\d+$/.test(key)).map(([key,id]) => named(key,id,names));
  const valid = new Set(abilities.map(a => a.id));
  const byId=new Map(species.map(s=>[s.id,s]));
  const check=id=>{if(id===0)return null;if(!valid.has(id))throw Error('Missing named ability: '+id);return id;};
  for (const {key,config,data} of entries) {
    const record=byId.get(enums.SpeciesId.get(key));
    const passives=config.get('passives');
    const passiveTable=ts.isObjectLiteralExpression(passives) ? fields(passives) : null;
    const passiveAt=index=>{
      // Pinned SpeciesDataRegistry.getPassive falls back to form index zero.
      const node=passiveTable ? (passiveTable.get(String(index)) ?? passiveTable.get('0')) : passives;
      return node ? known(check(literal(node,enums))) : unavailable('No explicit passive for this form index.');
    };
    record.passiveAbilityId=passiveAt(0);
    formConstructors(data).forEach((form,index)=>{
      const first=check(literal(form.get('ability1'),enums));
      if(first===null)throw Error('Missing first ability: '+key);
      record.forms.value[index].abilities=known({first,second:check(literal(form.get('ability2'),enums)),hidden:check(literal(form.get('abilityHidden'),enums))});
      record.forms.value[index].passiveAbilityId=passiveAt(index);
    });
  }
  return abilities.sort((a,b)=>a.id-b.id);
}

export function resolvedFields(node,enums) {
  if (!ts.isObjectLiteralExpression(node)) throw Error('Expected explicit keyed table');
  const result=new Map();
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) throw Error('Unsupported keyed-table entry');
    const key=ts.isComputedPropertyName(property.name) ? literal(property.name.expression,enums)
      : ts.isStringLiteral(property.name) ? property.name.text : property.name.getText();
    if(result.has(key))throw Error('Duplicate keyed-table identity');
    result.set(key,property.initializer);
  }
  return result;
}
function variableObject(text,name) {
  const declarations=visit(syntax(text),n=>ts.isVariableDeclaration(n)&&n.name.getText()===name);
  if(declarations.length!==1)throw Error('Missing/duplicate table: '+name);
  let expression=declarations[0].initializer;
  while(expression && (ts.isSatisfiesExpression(expression)||ts.isAsExpression(expression)||ts.isParenthesizedExpression(expression)))expression=expression.expression;
  return expression;
}
export function extractMoves(text,enums,names) {
  const init=visit(syntax(text),n=>ts.isFunctionDeclaration(n)&&n.name?.text==='initMoves');
  if(init.length!==1)throw Error('Missing/duplicate initMoves');
  const pushes=visit(init[0],n=>ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)
    &&n.expression.name.text==='push'&&/\ballMoves\b/.test(n.expression.expression.getText()));
  if(pushes.length!==1)throw Error('Unexpected move registration shape');
  const constructors=pushes[0].arguments.map(argument=>{
    let node=argument;
    while(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression))node=node.expression.expression;
    if(!ts.isNewExpression(node)||!node.arguments?.length)throw Error('Unsupported move registration');
    return node;
  });
  const records=[],seen=new Set();
  for(const node of constructors) {
    const key=node.arguments[0].name.text,id=literal(node.arguments[0],enums);
    if(id===0)continue; // NONE sentinel is not a selectable move identity.
    if(seen.has(id))throw Error('Duplicate move identity');seen.add(id);
    const kind=node.expression.getText(), attack=['AttackMove','ChargingAttackMove'].includes(kind),status=['StatusMove','SelfStatusMove','ChargingSelfStatusMove'].includes(kind);
    if(!attack&&!status)throw Error('Unsupported move constructor: '+kind);
    const typeId=literal(node.arguments[1],enums);
    if(!Number.isInteger(typeId)||typeId < -1||typeId > 18)throw Error('Invalid move type');
    const category=attack ? node.arguments[2].getText().match(/^MoveCategory\.(PHYSICAL|SPECIAL)$/)?.[1] : 'STATUS';
    if(!category)throw Error('Unsupported move category');
    const basePower=attack ? literal(node.arguments[3],enums) : -1;
    if(!Number.isInteger(basePower)||basePower < -1)throw Error('Invalid move base power');
    records.push({...named(key,id,names),typeId:known(typeId),category:known(category),basePower:known(basePower)});
  }
  const expected=[...enums.MoveId.values()].filter(id=>id>0);
  if(expected.length!==records.length||expected.some(id=>!seen.has(id)))throw Error('Incomplete move declaration coverage');
  return records.sort((a,b)=>a.id-b.id);
}
export function applyLearnsets(species,entries,enums,moves,eggText,constants) {
  const moveIds=new Set(moves.map(m=>m.id)),byId=new Map(species.map(s=>[s.id,s]));
  const eggTable=resolvedFields(variableObject(eggText,'speciesEggMoves'),enums);
  for(const [id,node] of eggTable) {
    if(!byId.has(id)||byId.get(id).originalStarterCost.value===null)throw Error('Unknown/unpriced egg-move owner');
    const ids=literal(node,enums);
    if(ids.length!==4||ids.some(id=>!moveIds.has(id)))throw Error('Invalid egg slot count/identity');
  }
  const levels=node=>{
    const rows=literal(node,enums,constants);
    if(!Array.isArray(rows)||rows.some(row=>!Array.isArray(row)||row.length!==2||!Number.isInteger(row[0])||row[0]<-1||!moveIds.has(row[1])))throw Error('Invalid level move row');
    return rows.map(([level,moveId])=>({level,moveId}));
  };
  for(const {key,config} of entries) {
    const record=byId.get(enums.SpeciesId.get(key));
    const base=levels(config.get('levelMoves'));
    const table=config.has('formLevelMoves') ? resolvedFields(config.get('formLevelMoves'),enums) : new Map();
    for(const formKey of table.keys())if(!record.forms.value.some(f=>f.key===formKey))throw Error('Unknown learnset form: '+key+' / '+formKey);
    for(const form of record.forms.value)form.levelMoves=known([...base,...(table.has(form.key)?levels(table.get(form.key)):[])]);
    // Keep the slot owner explicit: Pikachu's source intentionally excludes its own table.
    const owner=eggTable.has(record.id) ? record.id : record.starterRootIds.value?.[0];
    if(!eggTable.has(owner))throw Error('Missing starter-root egg slots: '+key);
    record.eggMoveSourceId=known(owner);
    record.eggMoveIds=known(literal(eggTable.get(owner),enums));
  }
}
