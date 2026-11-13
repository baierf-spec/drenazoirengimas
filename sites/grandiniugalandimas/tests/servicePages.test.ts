import { describe, expect, it } from 'vitest';
import { BUSINESS } from '@/config/business';
import { getServicePages } from '@/data/servicePages';
import { contentNavigation } from '@/lib/content-navigation';
import { schemaBusiness } from '@/lib/site';

describe('transferable content and search identity', () => {
  it('does not invent a local workshop address when only a service brand is configured', () => {
    expect(schemaBusiness()['@type']).toBe('Organization');
    expect(schemaBusiness()).not.toHaveProperty('address');
  });
  it('removes parcel service pages and their navigation when shipping is disabled', () => {
    const original = BUSINESS.shipping.enabled;
    Object.defineProperty(BUSINESS.shipping, 'enabled', { value: false, writable: true });
    try {
      expect(getServicePages().map(p => p.slug)).not.toContain('grandiniu-galandimas-pastomatu');
      expect(contentNavigation().map(p => p.slug)).not.toContain('kaip-issiusti-grandine');
    } finally { Object.defineProperty(BUSINESS.shipping, 'enabled', { value: original, writable: true }); }
  });
  it('keeps every navigation destination backed by an actual page with unique section anchors', () => {
    const pages = getServicePages();
    expect(contentNavigation().every(link => pages.some(p => p.slug === link.slug))).toBe(true);
    for (const page of pages) expect(new Set(page.sections.map(s => s.id)).size).toBe(page.sections.length);
  });
});
