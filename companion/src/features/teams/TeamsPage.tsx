import { Layers3 } from 'lucide-react';
import { STARTER_BY_NAME } from '../../reference';
import type { PokeRogueData } from '../../domain/facade';
import { TeamMemberSprite } from '../../ui/components/TeamMemberSprite';
import { EmptyInline } from '../../ui/components/AppWidgets';
import { memberConfig, memberMeta, memberMoves, memberRunNotes, teamCostText, teamLuckText, teamModeLabel, teamShortName, teamSummary } from '../../ui/view-models';

export function TeamsPage({
  data,
  teamIndex,
  setTeamIndex,
  onPokemon,
}: {
  data: PokeRogueData | null;
  teamIndex: number;
  setTeamIndex: (value: number) => void;
  onPokemon: (id: number) => void;
}) {
  if (!data) return <EmptyInline />;
  const team = data.teams[teamIndex] || data.teams[0];
  const readiness = data.teamReadiness.find(result => result.teamId === team.id);
  const members = team.members || [];

  return (
    <>
      <div className='team-tabs'>
        {data.teams.map((candidate,index) => (
          <button key={candidate.id} className={index === teamIndex ? 'active' : ''} onClick={() => setTeamIndex(index)}>{teamShortName(candidate)}</button>
        ))}
      </div>

      <section className='team-header-card'>
        <div>
          <div className='eyebrow'>{teamModeLabel(team)}</div>
          <h2>{teamShortName(team)}</h2>
          <p>{teamSummary(team)}</p>
        </div>
        <div className='team-kpis'>
          <span><strong>{teamCostText(team)}</strong>{team.cap ? ' / ' + String(team.cap) : ''}<small>POINTS</small></span>
          <span><strong>{teamLuckText(team)}</strong><small>LUCK</small></span>
          <span><strong>{readiness ? readiness.startersAvailable + '/' + readiness.starterCount : '—'}</strong><small>STARTERS</small></span>
        </div>
        {readiness?.verifiableTargetCount ? (
          <div className='tag-row'>
            <span>{readiness.verifiableTargetsMet}/{readiness.verifiableTargetCount} recorded shiny targets met</span>
            <span>In-run requirements tracked separately</span>
          </div>
        ) : null}
      </section>

      {members.length ? (
        <div className='party-grid'>
          {members.map((member,index) => {
            const pokemon = data.pokemonByName.get(member.starter);
            const memberReadiness = readiness?.members[index];
            const label = !memberReadiness?.unlocked
              ? 'MISSING'
              : memberReadiness.shinyTierMet === false
                ? 'TARGET GAP'
                : memberReadiness.unverifiedInRunRequirements.length
                  ? 'ACCOUNT OK'
                  : 'AVAILABLE';
            const missing = label === 'MISSING' || label === 'TARGET GAP';
            const starterId = STARTER_BY_NAME.get(member.starter)?.id;
            return (
              <button
                key={member.slot + '-' + member.starter}
                className='party-card'
                onClick={() => starterId && onPokemon(starterId)}
                disabled={!starterId}
              >
                <div className='party-number'>#{member.slot || index + 1}</div>
                <TeamMemberSprite member={member} pokemon={pokemon} size={78} />
                <div className='party-copy'><h3>{member.starter}</h3><span>{memberMeta(member)}</span><small>{member.role || 'Roster member'}</small></div>
                <div className={missing ? 'ready-badge missing' : 'ready-badge'}>{label}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className='empty-panel'><Layers3 /><div><strong>Strategy blueprint</strong><span>{teamSummary(team)}</span></div></div>
      )}

      {members.length > 0 && (
        <section className='section'>
          <h2>Source-backed build notes</h2>
          <div className='build-list'>
            {members.map((member,index) => {
              const pokemon = data.pokemonByName.get(member.starter);
              const moves = memberMoves(member);
              const notes = memberRunNotes(member);
              const memberReadiness = readiness?.members[index];
              return (
                <div key={member.slot + '-' + member.starter} className='build-row'>
                  <TeamMemberSprite member={member} pokemon={pokemon} size={44} />
                  <div className='build-name'><strong>{member.starter}</strong><span>{memberConfig(member)}</span></div>
                  <div className='build-detail'><strong>MOVES / ROLE</strong><span>{moves.length ? moves.join(' • ') : member.role || 'No move package recorded in source'}</span></div>
                  <div className='build-detail'><strong>RUN / FUSION</strong><span>{notes.length ? notes.join(' • ') : 'No additional in-run note recorded'}</span></div>
                  {memberReadiness && (
                    <div className='build-detail'>
                      <strong>ACCOUNT CHECK</strong>
                      <span>
                        {memberReadiness.accountChecks.length ? memberReadiness.accountChecks.join(' • ') : 'No positive account checks'}
                        {memberReadiness.unverifiedInRunRequirements.length ? ' | In-run: ' + memberReadiness.unverifiedInRunRequirements.join(', ') : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!team.exactRoster && team.architecture?.length ? (
        <section className='section'><h2>Run architecture</h2><div className='steps'>{team.architecture.map((step,index) => <div key={step}><span>{index+1}</span><p>{step}</p></div>)}</div></section>
      ) : null}

      {team.recordedFusionDirections?.length ? (
        <section className='section'><h2>Recorded fusion directions</h2><div className='steps'>{team.recordedFusionDirections.map((step,index) => <div key={step}><span>{index+1}</span><p>{step}</p></div>)}</div></section>
      ) : null}
    </>
  );
}

