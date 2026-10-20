export interface Article {
  slug: string;
  title: string;
  description: string;
  intro: string;
  image?: string;
  sections: { title: string; text: string[]; list?: string[]; id?: string }[];
  imageAlt?: string;
  sources?: { label: string; url: string }[];
  service?: boolean;
}
export const articles: Article[] = [
  {
    slug: "pamatu-drenazas",
    title: "Pamatų drenažas ir vandens valdymas aplink namą",
    description:
      "Kada verta įvertinti pamatų drenažą, kuo jis skiriasi nuo lietaus vandens nuvedimo ir kas lemia darbų apimtį bei kainą.",
    intro:
      "Vanduo prie namo, drėgnas rūsys ar nauja statyba – pirmiausia reikia nustatyti vandens priežastį. Vamzdžio paklojimas savaime neišsprendžia visų drėgmės problemų.",
    image: "foundations",
    imageAlt: "Iliustracija: vanduo prie drėgnos namo pamatų sienos",
    service: true,
    sections: [
      {
        title: "Kada verta tikrinti pamatų zoną?",
        text: [
          "Vertinimas naudingas, kai problema kartojasi, vanduo telkšo prie namo arba drėgmė pastebima požeminėse patalpose. ",
        ],
        list: [
          "Vanduo prie pamatų po liūčių ar polaidžio",
          "Drėgmės pėdsakai ar pelėsis rūsyje",
          "Vandens problemos atsirado pakeitus gerbūvį",
          "Planuojamas esamo namo remontas ar nauja statyba",
        ],
      },
      {
        title: "Ką svarbu įvertinti prieš kasant?",
        text: [
          "Reikia suprasti grunto, reljefo ir vandens sąlygas, pamatų konstrukciją, hidroizoliacijos būklę, esamus požeminius tinklus ir galimą vandens priėmimo vietą.",
          "Kasimas šalia esamų konstrukcijų turi būti planuojamas atsakingai. Kasimo gylis, nuolydis ir atstumai nustatomi planuojant darbus.",
        ],
      },
      {
        title: "Drenažas ir hidroizoliacija atlieka skirtingas užduotis",
        text: [
          "Drenažu siekiama surinkti ir nuvesti vandenį grunte, o hidroizoliacija riboja jo patekimą į konstrukcijas. Jei drėgmę lemia pažeista izoliacija, vamzdyno įrengimas nebūtinai išspręs problemą. Vertinami abu klausimai.",
        ],
      },
      {
        title: "Darbai prie jau gyvenamo namo",
        text: [
          "Prieš sąmatą aptarkite technikos privažiavimą, terasos, trinkelių ir vejos apsaugą. Atskirai susitarkite dėl iškasto grunto, jo išvežimo ir dangų atkūrimo.",
        ],
        list: [
          "Pažymėta darbų zona ir esami tinklai",
          "Aiškiai numatyti įtraukti bei neįtraukti darbai",
          "Suderintas vandens surinkimo ir priėmimo principas",
          "Aptartas darbų fotografavimas prieš užpilant tranšėjas",
        ],
      },
    ],
  },
  {
    slug: "sklypo-drenazas",
    title: "Sklypo drenažas užmirkstančiam kiemui",
    description:
      "Ilgai stovintis vanduo, klampi veja ar molingas sklypas? Sužinokite, kaip vertinamas sklypo drenažo poreikis ir vandens nuvedimo galimybės.",
    intro:
      "Po lietaus neišnykstančios balos, klampus molis ir nuolat šlapios kiemo zonos – signalai įvertinti, kaip vanduo juda sklype. Sprendimas parenkamas pagal konkretaus sklypo sąlygas.",
    image: "yard",
    imageAlt: "Iliustracija: balos ir šlapia veja gyvenamojo namo sklype",
    sources: [
      {
        label: "Wavin: drenažo vamzdžių ir filtrų paskirtis",
        url: "https://wavin.com/lt/s/C02_F006_S079/Drenazo-vamzdziai",
      },
      {
        label: "Wavin: grunto ir vandens sąlygų vertinimas",
        url: "https://wavin.com/lt/solutions/spotlight/vandens-kaupimo-ir-infiltravimo-rezervuaru-susidedanciu-is-moduliniu-deziu-skaiciavimo-gaires",
      },
    ],
    service: true,
    sections: [
      {
        title: "Pirmiausia – iš kur atsiranda vanduo?",
        text: [
          "Vanduo gali atitekėti paviršiumi, susilaikyti dėl grunto ar reljefo sąlygų, būti susijęs su gruntiniu vandeniu. Vien drėgna veja neleidžia nustatyti priežasties.",
          "Naudinga užfiksuoti, kada atsiranda balos, kiek laiko jos laikosi ir kur jos susidaro. Palyginkite bendrą sklypo vaizdą po lietaus ir sausesniu metu.",
        ],
      },
      {
        title: "Drenažas ar reljefo koregavimas?",
        text: [
          "Sprendinys priklauso nuo vandens šaltinio. Vienais atvejais svarbus paviršinio vandens nukreipimas ir reljefas, kitais – grunto vandens surinkimas. Kartais reikalingas kelių priemonių derinys.",
          "Prieš pasirenkant sistemą būtina įvertinti, kur surinktas vanduo pateks toliau. Vien surinkti vandenį sklype nepakanka.",
        ],
      },
      {
        id: "molingas-gruntas",
        title: "Ar drenažas tinka molingam gruntui?",
        text: [
          "Molingas gruntas gali lėtai praleisti vandenį, tačiau tai savaime nepasako, kokios sistemos reikia. Svarbu atskirti paviršiuje susilaikantį vandenį nuo vandens grunte ir patikrinti, kur jis galėtų būti nuvestas.",
          "Vamzdžio filtras ir drenuojantis sluoksnis parenkami pagal grunto savybes. Vien storesnis skaldos sluoksnis ar vienoda filtro medžiaga nėra universalus sprendimas. Infiltracijos tinkamumas vertinamas atskirai – molingame sklype negalima iš anksto žadėti, kad vanduo tiesiog susigers.",
        ],
      },
      {
        title: "Ką pasiruošti objekto įvertinimui?",
        text: [
          "Pradėti galima ir neturint projekto ar geologinių tyrimų. Vis dėlto turimi planai ir informacija apie tinklus padeda geriau pasirengti.",
        ],
        list: [
          "Objekto vieta ir bendras sklypo vaizdas",
          "Nuotraukos, kur vanduo laikosi ilgiausiai",
          "Informacija apie dangas, augalus ir technikos privažiavimą",
          "Turimi komunikacijų ir sklypo planai",
          "Žinoma ar numanoma vandens priėmimo vieta",
        ],
      },
      {
        title: "Sutvarkytas kiemas – atskira sąmatos dalis",
        text: [
          "Aptarkite, kaip bus atskiriamas augalinis gruntas, kur stovės technika ir kas atkurs paveiktas vietas. Šiuos darbus verta įvardyti raštu, kad pasiūlymus galėtumėte palyginti pagal vienodą apimtį.",
        ],
      },
    ],
  },
  {
    slug: "lietaus-vandens-nuvedimas",
    title: "Lietaus vandens surinkimas ir nuvedimas",
    description:
      "Lietaus vanduo nuo stogo ir dangų: surinkimo, nuvedimo bei priėmimo principai. Kodėl lietaus sistema nėra tas pats, kas drenažas?",
    intro:
      "Nuo stogo ar kietųjų dangų atitekantį vandenį svarbu valdyti ten, kur jis atsiranda. Tinkamas sprendimas prasideda nuo viso vandens kelio įvertinimo.",
    image: "groundwater",
    imageAlt: "Iliustracija: vanduo grunto tranšėjoje",
    service: true,
    sections: [
      {
        title: "Trys klausimai prieš renkantis sistemą",
        text: [
          "Iš kur vanduo atiteka? Kaip jis bus surenkamas? Kur jis galės patekti? Atsakymai turi derėti tarpusavyje ir atitikti konkretaus objekto sąlygas.",
        ],
        list: [
          "Stogo latakai ir lietvamzdžiai",
          "Vanduo nuo įvažiavimo ir trinkelių",
          "Teritorijos reljefas ir paviršinis nuotėkis",
          "Priėmimo vietos galimybės bei taikomi reikalavimai",
        ],
      },
      {
        title: "Kur gali būti nuvedamas lietaus vanduo?",
        text: [
          "Gali būti svarstomas vandens kaupimas, tinkamas nuvedimas, infiltracija ar prisijungimas prie leidžiamų tinklų. Galimybės priklauso nuo grunto, reljefo, vandens kiekio ir teritorijos reikalavimų.",
          "Infiltracija nėra tinkamas pasirinkimas kiekvienam gruntui. Prisijungimas prie tinklų taip pat nėra savaime leidžiamas – sąlygas reikia tikslinti su jų valdytoju.",
        ],
      },
      {
        title: "Kodėl nereikia visko vadinti drenažu?",
        text: [
          "Drenažas paprastai skirtas vandeniui grunte, o lietaus sistema – nuo paviršių surinktam vandeniui. Šias funkcijas būtina aiškiai atskirti vertinant bendrą objekto vandens valdymą.",
        ],
      },
      {
        title: "Ką turi apimti darbų sąmata?",
        text: [
          "Svarbu palyginti ne tik vamzdyno kainą, bet ir surinkimo taškus, šulinius, priėmimo sprendimą, žemės darbus bei dangų atkūrimą. Su rangovu aptarkite, kas tiksliai įeina į pasiūlymą.",
        ],
      },
    ],
  },
  {
    slug: "vanduo-sklype",
    title: "Vanduo sklype: nuo ko pradėti?",
    description:
      "Ką stebėti, kai kieme laikosi balos, šlampa veja ar rūsys? Praktiškas pasiruošimas vandens problemos įvertinimui.",
    intro:
      "Svarbiausias pirmas žingsnis – užfiksuoti, kada ir kur atsiranda vanduo. Ne kiekvienai balai reikia tokios pačios sistemos.",
    image: "yard",
    imageAlt: "Iliustracija: balos ir šlapia veja gyvenamojo namo sklype",
    sections: [
      {
        title: "Stebėkite, kada kaupiasi vanduo",
        text: [
          "Pasižymėkite, ar problema pasireiškia tik po liūties, pavasarį, ar laikosi nuolat. Užfiksuokite vietas ir apytikslį laiką, per kurį vanduo dingsta.",
          "Nuotraukose parodykite ne tik pačią balą, bet ir aplinkinius aukščius, pastatus, dangas bei lietvamzdžius. Tai padeda suprasti kontekstą, tačiau nėra galutinė diagnozė.",
        ],
      },
      {
        title: "Paviršinis ar grunto vanduo?",
        text: [
          "Paviršiumi atitekantis vanduo ir drėgmė grunte gali reikalauti skirtingų sprendimų. Iš vienos nuotraukos patikimai atskirti priežasties ne visuomet įmanoma.",
          "Pokalbiui su specialistu padės trumpas diagnostikos klausimynas. Jo rezultatas išskiria klausimus pokalbiui.",
        ],
      },
      {
        title: "Ko nesiimti vien pagal bendrą patarimą?",
        text: [
          "Nepradėkite kasimo šalia pamatų, nežinomų komunikacijų ar kaimyninio sklypo ribos vien pagal interneto schemą. Nekreipkite vandens į kitą sklypą neįvertinę sąlygų ir reikalavimų.",
          "Jei vanduo kelia tiesioginį pavojų žmonėms, elektros įrangai ar konstrukcijoms, pirmiausia rūpinkitės saugumu. Ši užklausų forma nėra avarinė tarnyba.",
        ],
      },
      {
        title: "Ką nusiųsti prieš pirmą pokalbį?",
        text: [
          "Nurodykite miestą ar gyvenvietę, pagrindinį simptomą, jo pasikartojimą ir pridėkite kelias nuotraukas. Tikslių vamzdyno metrų ar sprendinio žinoti nereikia.",
        ],
      },
    ],
  },
  {
    slug: "drenazas-ar-lietaus-nuotekos",
    title: "Drenažas ar lietaus vandens sistema?",
    description:
      "Aiškus palyginimas: vanduo grunte ir nuo stogo bei dangų surinktas lietaus vanduo. Kaip pasirinkti tinkamą sprendimą?",
    intro:
      "Abi sistemos gali būti bendro vandens valdymo dalis, tačiau jų paskirtis skiriasi. Sprendimą lemia vandens šaltinis, o ne pasirinktas vamzdžio pavadinimas.",
    sections: [
      {
        title: "Drenažas – vandens grunte valdymui",
        text: [
          "Drenažo tikslas – surinkti perteklinį vandenį iš grunto ir nuvesti jį į tam tinkamą vietą. Sistemos poreikis ir parametrai parenkami įvertinus gruntą, reljefą, konstrukcijas bei priėmimo sąlygas.",
        ],
      },
      {
        title: "Lietaus sistema – nuo stogo ir dangų surinktam vandeniui",
        text: [
          "Lietaus vandens sistema valdo nuo stogo, įvažiavimo ar kitų paviršių surinktą vandenį. Svarbūs surinkimo taškai, trasos ir priėmimo vieta.",
        ],
      },
      {
        title: "Kada reikia kompleksinio vertinimo?",
        text: [
          "Kai kartu šlampa pamatai, kieme laikosi balos ir lietvamzdžiai išleidžia vandenį prie namo, atskiras vamzdis gali būti tik dalis sprendimo. Reikalingas bendras vandens kelio planas.",
        ],
        list: [
          "Įvardykite, iš kur vanduo atiteka",
          "Atskirkite surinkimo ir nuvedimo užduotis",
          "Patikrinkite priėmimo galimybes",
          "Sutarkite, kaip sprendimas veiks kartu su esamu gerbūviu",
        ],
      },
      {
        title: "Ką palyginti rangovų pasiūlymuose?",
        text: [
          "Palyginkite paskirtį, įtrauktas medžiagas, šulinius, žemės darbus, priėmimo vietą, derinimus ir atstatymą. Mažesnė metro kaina gali reikšti siauresnę darbų apimtį.",
        ],
      },
    ],
  },
];
