import { useState } from 'react';
import { Swords } from 'lucide-react';
import type { PokeRogueData } from '../../domain/facade';
import { referenceValue, type DexEntry } from '../../domain/dex-catalog';
import type { StarterOption } from '../../domain/starter-selection';
import { DEX_REFERENCE } from '../../reference';
import { PokemonSprite } from '../../ui/components/PokemonSprite';
import { CollectionProgress, DataLine, EmptyInline, SectionHeading } from '../../ui/components/AppWidgets';
import { shinyLabel, teamShortName } from '../../ui/view-models';

export function DetailPage({ entry, data, onTeam, onPokemon }: { entry: DexEntry | null; data: PokeRogueData | null; onTeam: () => void; onPokemon: (id:number) => void }) {
  const [selectedForm, setSelectedForm] = useState({id:entry?.id,index:0});
  if (!entry) return <EmptyInline />;
  const pokemon = entry.account;
  const forms = referenceValue(entry.reference?.forms) ?? [];
  const form = forms.find(form=>form.index===(selectedForm.id===entry.id?selectedForm.index:0)) ?? forms[0];
  const options = entry.selection?.forms.find(option=>option.index===form?.index);
  const stats = referenceValue(form?.baseStats);
  const used = pokemon ? (data?.teams ?? []).filter(team => (team.members || []).some(member => member.starter === pokemon.name)) : [];
  const ivs = pokemon ? [['HP',pokemon.ivHp],['Atk',pokemon.ivAtk],['Def',pokemon.ivDef],['SpA',pokemon.ivSpa],['SpD',pokemon.ivSpd],['Spe',pokemon.ivSpe]] as const : [];

  return (
    <>
      <section className='pokemon-hero'>
        <div className='hero-sprite'>
          <PokemonSprite request={{id:entry.id,name:entry.name,formKey:form?.key,shinyTier:pokemon?.visual?.shinyTier ?? 0}} size={106} />
          {pokemon?.t3 && <span className='big-shiny red-shiny-star'>★ Red shiny • Luck 3</span>}
        </div>
        <div className='hero-copy'>
          <div className='eyebrow'>{entry.selection ? 'STARTER' : 'SPECIES'} #{entry.id}</div><h2>{entry.name}</h2>
          <div className='tag-row'>{pokemon ? <><span>Cost {pokemon.currentCost}</span><span>{pokemon.candy} Candy</span><span>{pokemon.classicWins} Classic wins</span></> : <span>Reference only · no imported ownership</span>}</div>
        </div>
      </section>
      <section className='section dex-reference-detail' aria-label='Game reference'>
        <h2>Game reference</h2>
        {forms.length>0 && <label className='dex-form-label'>Form<select aria-label='Reference form' value={form?.index ?? 0} onChange={event=>setSelectedForm({id:entry.id,index:Number(event.target.value)})}>{forms.map(form=><option key={form.index} value={form.index}>{form.name || 'Base'}{form.key ? ` (${form.key})` : ''}</option>)}</select></label>}
        <div className='tag-row'><span>{(referenceValue(form?.types) ?? []).map(id=>DEX_REFERENCE.types.get(id)?.name ?? 'Unknown').join(' / ') || 'Types unavailable'}</span><span>{entry.generation ? `Generation ${entry.generation}` : 'Generation unavailable'}</span><span>Base stat total: {referenceValue(form?.baseStatTotal) ?? 'Unavailable'}</span></div>
        {stats && <div className='iv-grid'>{Object.entries(stats).map(([label,value])=><div key={label}><span>{({hp:'HP',attack:'Atk',defense:'Def',specialAttack:'SpA',specialDefense:'SpD',speed:'Spe'} as Record<string,string>)[label]}</span><strong>{value}</strong></div>)}</div>}
        <p className='dex-note'>Public base stats are distinct from imported IVs. Reference {DEX_REFERENCE.referenceVersion}. Form facts describe the game; starter availability appears below.</p>
        {!entry.selection && <><p>Reference species. Open an associated starter to see standard starter options:</p><div className='dex-related'>{entry.starterIds.map((id,index)=><button key={id} onClick={()=>onPokemon(id)}>{entry.starterNames[index]}</button>)}</div></>}
      </section>
      {entry.selection && <section className='section dex-reference-detail' aria-label='Standard starter options'>
        <h2>Standard starter options</h2><p className='dex-note'>{entry.selection.boundary} {entry.selection.limitation} Active challenges and saved selection preferences are not modeled.</p>
        <p>Form: <strong>{options?.availability ?? 'unknown'}</strong></p>
        {options?.availability==='ineligible' ? <p>This form is not selectable as a standard starter.</p> : options && <><OptionGroup title='Moves' options={options.moves}/><OptionGroup title='Abilities' options={options.abilities}/><OptionGroup title='Passive' options={options.passive?[options.passive]:[]}/></>}
      </section>}
      {pokemon && <>
      <section className='section'><h2>Account completion</h2>
        <div className='readiness-grid'>
          <CollectionProgress label='Perfect IVs' value={pokemon.perfectIvs} total={6} tone='green' />
          <CollectionProgress label='Egg moves' value={pokemon.eggCount} total={4} tone='green' />
          <CollectionProgress label='Natures' value={pokemon.natureCount} total={25} tone='green' />
          <CollectionProgress label='Cost reductions' value={pokemon.costReductions} total={2} tone='green' />
          <Readiness label='Passive' value={pokemon.passiveUnlocked ? 'Unlocked' : 'Missing'} complete={pokemon.passiveUnlocked} />
          <Readiness label='Hidden ability' value={pokemon.haUnlocked ? 'Unlocked' : 'Missing'} complete={pokemon.haUnlocked} />
        </div>
      </section>

      <section className='section'><h2>IVs</h2>
        <div className='iv-grid'>{ivs.map(([label,value]) => <div key={label}><span>{label}</span><strong className={value === 31 ? 'perfect' : ''}>{value}</strong></div>)}</div>
      </section>

      <section className='section'><h2>Collection</h2>
        <div className='collection-grid'>
          <DataLine label='Starter unlocked' value={pokemon.unlocked ? 'Yes' : 'No'} />
          <DataLine label='Shiny tiers' value={[pokemon.t1?'Yellow':'',pokemon.t2?'Blue':'',pokemon.t3?'Red':''].filter(Boolean).join(' • ') || 'None'} />
          <DataLine label='Seen / caught / hatched' value={pokemon.seen + ' / ' + pokemon.caught + ' / ' + pokemon.hatched} />
          <DataLine label='Progress gaps' value={pokemon.progressGaps} />
          <DataLine label='Collection gaps' value={shinyLabel(pokemon.collectionGaps)} />
          <DataLine label='Priority' value={pokemon.priorityScore + ' • ' + pokemon.nextAction} />
        </div>
      </section>

      </>}
      {used.length > 0 && (
        <section className='section'>
          <SectionHeading title='Saved strategies' action='Open Build' onClick={onTeam} />
          <div className='team-usage'>
            {used.map(team => {
              const member = (team.members || []).find(candidate => candidate.starter === pokemon?.name);
              return <div key={team.id}><Swords /><span><strong>{teamShortName(team)}</strong><small>{member?.role || 'Roster member'}</small></span></div>;
            })}
          </div>
        </section>
      )}
    </>
  );
}

function Readiness({ label, value, complete }: { label: string; value: string; complete: boolean }) {
  return <div className='readiness-card'><span>{label}</span><strong className={complete ? 'good' : 'warn'}>{value}</strong></div>;
}



function OptionGroup({title,options}:{title:string;options:StarterOption[]}) {
  return <div className='dex-option-group'><h3>{title}</h3>{options.length ? <ul>{options.map(option=><li key={option.id}>
    <strong>{option.name}</strong><span className={`dex-availability dex-availability-${option.availability}`}>{option.availability==='unknown'?'Ownership unknown':option.availability}</span>
    <small>{option.source==='level'?'Level 1–5 move':option.source==='egg'?`Egg slot ${(option.eggSlot ?? 0)+1}`:option.source==='passive'?`Enabled: ${option.enabled===null?'unknown':option.enabled?'yes':'no'}`:Object.entries(option.slotAvailability ?? {}).map(([slot,state])=>`${slot}: ${state}`).join(' · ')}</small>
  </li>)}</ul> : <p className='dex-note'>No named options in this reference.</p>}</div>;
}
