import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PricingExamples } from '@/components/ServiceContentPage';

describe('published price examples', () => {
  it('shows 1, 3 and 5 chains with return shipping but excludes customer outbound shipping', () => {
    const html = renderToStaticMarkup(<PricingExamples />);
    expect(html).toMatch(/1 vnt\.<\/th>.*?7,00 €.*?3,50 €.*?10,50 €/);
    expect(html).toMatch(/3 vnt\.<\/th>.*?21,00 €.*?3,50 €.*?24,50 €/);
    expect(html).toMatch(/5 vnt\.<\/th>.*?31,00 €.*?0,00 €.*?31,00 €/);
    expect(html).toContain('Siunta mums mokama atskirai.');
  });
});
