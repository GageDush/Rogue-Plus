import type { PokeRogueData } from '../../domain/facade';
import { CollectionProgress, EmptyInline, Kpi, SaveMeta, fmt } from '../../ui/components/AppWidgets';

export function TrainerPage({ data }: { data: PokeRogueData | null }) {
  if (!data) return <EmptyInline />;
  const account = data.account;
  const stats = account.stats;
  return (
    <>
      <div className='hero-grid'>
        <Kpi label='Battles' value={fmt(stats.battles)} note={fmt(stats.trainersDefeated)+' TRAINERS'} tone='blue' />
        <Kpi label='Hatched' value={fmt(stats.pokemonHatched)} note={fmt(stats.shinyPokemonHatched)+' SHINY'} tone='green' />
        <Kpi label='Endless High' value={fmt(stats.highestEndlessWave)} note={'LEVEL '+fmt(stats.highestLevel)} tone='purple' />
        <Kpi label='Sessions Won' value={fmt(stats.sessionsWon)} note='CAREER' tone='gold' />
      </div>
      <section className='section'><h2>Collection completion</h2>
        <div className='progress-list'>
          <CollectionProgress label='Starters' value={account.startersUnlocked} total={account.startersTotal} tone='green' />
          <CollectionProgress label='Passives' value={account.passivesUnlocked} total={account.passivesTotal} tone='gold' />
          <CollectionProgress label='Egg moves' value={account.eggMovesUnlocked} total={account.eggMovesTotal} tone='blue' />
          <CollectionProgress label='Perfect IV' value={account.perfectIvStarters} total={account.startersTotal} tone='green' />
          <CollectionProgress label='Shiny' value={account.shinyStarters} total={account.startersTotal} tone='purple' />
          <CollectionProgress label='Classic wins' value={account.classicWinners} total={account.startersTotal} tone='orange' />
        </div>
      </section>
      <section className='section'><h2>Vouchers</h2>
        <div className='voucher-grid'>
          <Kpi label='Regular' value={String(account.vouchers.regular)} note='VOUCHERS' tone='blue' />
          <Kpi label='Plus' value={String(account.vouchers.plus)} note='VOUCHERS' tone='green' />
          <Kpi label='Premium' value={String(account.vouchers.premium)} note='VOUCHERS' tone='purple' />
          <Kpi label='Golden' value={String(account.vouchers.golden)} note='VOUCHERS' tone='gold' />
        </div>
      </section>
      <SaveMeta current={data.snapshot} />
    </>
  );
}
