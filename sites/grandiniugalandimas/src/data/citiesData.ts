/** Aptarnavimo vietovės, o ne fizinių dirbtuvių adresai. */
export interface CityInfo { slug: string; name: string; genitive: string; locative: string; region: string; }
export const CITIES_DATA: Record<string, CityInfo> = {
  vilnius: { slug: 'vilnius', name: 'Vilnius', genitive: 'Vilniaus', locative: 'Vilniuje', region: 'Vilniaus m. ir rajonas' },
  kaunas: { slug: 'kaunas', name: 'Kaunas', genitive: 'Kauno', locative: 'Kaune', region: 'Kauno m. ir rajonas' },
  klaipeda: { slug: 'klaipeda', name: 'Klaipėda', genitive: 'Klaipėdos', locative: 'Klaipėdoje', region: 'Klaipėdos m., Palanga, Gargždai, Šilutė' },
  siauliai: { slug: 'siauliai', name: 'Šiauliai', genitive: 'Šiaulių', locative: 'Šiauliuose', region: 'Šiaulių m. ir rajonas, Radviliškis' },
  panevezys: { slug: 'panevezys', name: 'Panevėžys', genitive: 'Panevėžio', locative: 'Panevėžyje', region: 'Panevėžio m. ir Aukštaitijos regionas' },
  alytus: { slug: 'alytus', name: 'Alytus', genitive: 'Alytaus', locative: 'Alytuje', region: 'Dzūkijos regionas (Alytus, Varėna, Druskininkai)' },
  marijampole: { slug: 'marijampole', name: 'Marijampolė', genitive: 'Marijampolės', locative: 'Marijampolėje', region: 'Suvalkijos regionas (Marijampolė, Vilkaviškis, Kalvarija)' },
  utena: { slug: 'utena', name: 'Utena', genitive: 'Utenos', locative: 'Utenoje', region: 'Aukštaitijos regionas (Utena, Anykščiai, Molėtai)' },
  telsiai: { slug: 'telsiai', name: 'Telšiai', genitive: 'Telšių', locative: 'Telšiuose', region: 'Žemaitijos regionas (Telšiai, Plungė, Rietavas)' },
  taurage: { slug: 'taurage', name: 'Tauragė', genitive: 'Tauragės', locative: 'Tauragėje', region: 'Tauragės apskritis (Tauragė, Šilalė, Jurbarkas)' },
  mazeikiai: { slug: 'mazeikiai', name: 'Mažeikiai', genitive: 'Mažeikių', locative: 'Mažeikiuose', region: 'Šiaurės Žemaitija (Mažeikiai, Akmenė, Skuodas)' },
  jonava: { slug: 'jonava', name: 'Jonava', genitive: 'Jonavos', locative: 'Jonavoje', region: 'Kauno apskritis (Jonava, Kėdainiai, Ukmergė)' },
};
export const CITY_SLUGS = Object.keys(CITIES_DATA);
