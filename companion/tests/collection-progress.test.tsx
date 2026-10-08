import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CollectionProgress } from '../src/ui/components/AppWidgets';

it('keeps counts accessible and never claims completion from rounding', () => {
  const html = renderToStaticMarkup(<CollectionProgress label='Egg moves' value={2287} total={2288} tone='blue' />);
  expect(html).toContain('99%');
  expect(html).toContain('aria-valuenow="2287"');
  expect(html).toContain('aria-valuemax="2288"');
  expect(html).toContain('2,287 / 2,288');
});
it('reports unavailable totals instead of inventing a zero denominator', () => {
  const html = renderToStaticMarkup(<CollectionProgress label='Starters' value={0} total={0} tone='green' />);
  expect(html).toContain('Total unavailable');
  expect(html).not.toContain('role="progressbar"');
  expect(html).not.toContain('NaN');
});
