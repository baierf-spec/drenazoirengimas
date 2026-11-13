import { isEnabled } from '@/config/business';

export function contentNavigation() {
  return [
    { slug: 'grandiniu-galandimas-pastomatu', label: 'Galandimas paštomatu', shipping: true },
    { slug: 'kainos', label: 'Galandimo kainos', shipping: false },
    { slug: 'kaip-issiusti-grandine', label: 'Pakavimas ir siuntimas', shipping: true },
    { slug: 'kaip-zinoti-kad-grandine-buka', label: 'Kada grandinę reikia galąsti?', shipping: false },
    { slug: 'kiek-kartu-galima-galasti-grandine', label: 'Kada grandinę keisti?', shipping: false },
  ].filter(p => !p.shipping || isEnabled('shipping'));
}
