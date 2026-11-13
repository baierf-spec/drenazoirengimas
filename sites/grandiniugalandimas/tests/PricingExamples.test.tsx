import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PricingExamples } from '@/components/ServiceContentPage';

describe('published price examples', () => {
  it('shows 1, 3 and 5 chains with return shipping but excludes customer outbound shipping', () => {
    const html = renderToStaticMarkup(<PricingExamples />);
    expect(html).toMatch(/1 vnt\.<\/th>.*?4,50 €.*?3,50 €.*?8,00 €/);
    expect(html).toMatch(/3 vnt\.<\/th>.*?13,50 €.*?3,50 €.*?17,00 €/);
    expect(html).toMatch(/5 vnt\.<\/th>.*?20,00 €.*?0,00 €.*?20,00 €/);
    expect(html).toContain('Siunta mums mokama atskirai.');
  });
});
