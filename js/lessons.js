/* ===== TypeCraft Lesson Content - Dutch ===== */

const LESSON_SETS = [
    /* ===== BIOME 0: PLAINS - Home Row ===== */
    {
        biome: 'plains',
        lessons: [
            {
                title: 'Les 1: De Thuisrij - Links',
                desc: 'Leer de linker thuisrij: A S D F',
                keys: ['a', 's', 'd', 'f'],
                words: ['as', 'af', 'das', 'ff', 'dd', 'aa', 'fd', 'sa', 'df', 'as as', 'af af', 'das das', 'afs', 'daf', 'fas', 'fad'],
                sentences: []
            },
            {
                title: 'Les 2: De Thuisrij - Rechts',
                desc: 'Leer de rechter thuisrij: J K L',
                keys: ['j', 'k', 'l'],
                words: ['ja', 'al', 'jak', 'lak', 'kal', 'jal', 'la', 'aj', 'ak', 'ja ja', 'al al', 'lak lak', 'jak jak'],
                sentences: []
            },
            {
                title: 'Les 3: Thuisrij Samen',
                desc: 'Combineer beide handen op de thuisrij',
                keys: ['a', 's', 'd', 'f', 'j', 'k', 'l'],
                words: ['al', 'dal', 'jas', 'kas', 'laf', 'sla', 'als', 'las', 'lak', 'klas', 'kaas', 'sjaal', 'fa', 'af'],
                sentences: ['dal als kas', 'sla las als', 'kas jas dal', 'laf als kaas']
            },
            {
                title: 'Les 4: Thuisrij - G en H',
                desc: 'Voeg G en H toe aan je repertoire',
                keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['gaf', 'had', 'gas', 'gal', 'hal', 'hak', 'glas', 'half', 'slag', 'haas', 'glad', 'flag', 'gala', 'gaas'],
                sentences: ['half glas had', 'glad als glas', 'haas gaf gas']
            },
            {
                title: 'Les 5: Thuisrij Oefening',
                desc: 'Oefen alle thuisrij letters met Nederlandse woorden',
                keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['jas', 'glas', 'half', 'slag', 'haas', 'glad', 'klas', 'kaas', 'gaas', 'gal', 'hal', 'dal', 'sla', 'flag', 'gas', 'hak', 'lak', 'gala', 'sjaal', 'gaf', 'had'],
                sentences: ['als half glas', 'glad als haas', 'jas slag klas', 'had glas kaas']
            },
            {
                title: 'Les 6: Thuisrij - Snelheid',
                desc: 'Verhoog je snelheid op de thuisrij',
                keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['slag', 'glas', 'half', 'klas', 'glad', 'haas', 'jas', 'kaas', 'gaas', 'gala', 'sjaal', 'gaf', 'gas', 'hak', 'lak', 'hal', 'gal', 'dal'],
                sentences: ['half glas kaas slag', 'glad jas als glas', 'klas had haas gaas', 'sla kaas glas half']
            }
        ]
    },
    /* ===== BIOME 1: FOREST - Top Row ===== */
    {
        biome: 'forest',
        lessons: [
            {
                title: 'Les 7: Bovenste Rij - Links',
                desc: 'Leer Q W E R T',
                keys: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['weg', 'wet', 'red', 'werk', 'twee', 'weer', 'ter', 'trek', 'rest', 'ster', 'west', 'weet', 'ster', 'dreef', 'wer'],
                sentences: ['twee ster werk', 'weer wet rest']
            },
            {
                title: 'Les 8: Bovenste Rij - Rechts',
                desc: 'Leer Y U I O P',
                keys: ['y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['ook', 'jou', 'oud', 'dip', 'hip', 'lip', 'koud', 'goud', 'huid', 'huis', 'klok', 'kuil', 'pijl', 'spook', 'ooi'],
                sentences: ['ook jou oud goud', 'koud huis klok']
            },
            {
                title: 'Les 9: Hele Bovenste Rij',
                desc: 'Combineer alle bovenste rij letters',
                keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['goed', 'huis', 'door', 'water', 'groep', 'super', 'kwart', 'stuur', 'pier', 'fout', 'toets', 'jurk', 'fruit'],
                sentences: ['goed water door huis', 'super groep kwart stuur']
            },
            {
                title: 'Les 10: Twee Rijen Oefening',
                desc: 'Oefen thuisrij en bovenste rij samen',
                keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['water', 'later', 'groep', 'hoger', 'super', 'duidelijk', 'sterk', 'kleur', 'sport', 'hotel', 'kwart', 'filter', 'poster'],
                sentences: ['het water is helder', 'de groep is super sterk', 'dit hotel is goed']
            },
            {
                title: 'Les 11: Woorden Sprint',
                desc: 'Typ zo snel mogelijk met twee rijen',
                keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['wist', 'wolf', 'herfst', 'eerst', 'luister', 'gebruik', 'speelt', 'gister', 'politie', 'duidelijk', 'keurig', 'feest', 'leuk'],
                sentences: ['wist hij het eerst', 'gister was het feest leuk', 'de politie was keurig']
            },
            {
                title: 'Les 12: Forest Boss',
                desc: 'Versla de Creeper met je typsnelheid!',
                keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['spiegel', 'krijger', 'rustiek', 'strijd', 'heilig', 'gebruik', 'toerist', 'ridder', 'gieter', 'sterker'],
                sentences: ['de krijger was sterk', 'gebruik de spiegel', 'strijd is heilig', 'de toerist loopt door'],
                mob: { name: 'Creeper', icon: '💚', hp: 10 }
            }
        ]
    },
    /* ===== BIOME 2: DESERT - Bottom Row ===== */
    {
        biome: 'desert',
        lessons: [
            {
                title: 'Les 13: Onderste Rij - Links',
                desc: 'Leer Z X C V B',
                keys: ['z', 'x', 'c', 'v', 'b', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['van', 'bak', 'cel', 'veel', 'school', 'bos', 'zes', 'cv', 'vak', 'zak', 'club', 'excuus', 'zaak'],
                sentences: ['van zes bak cel', 'veel school club']
            },
            {
                title: 'Les 14: Onderste Rij - Rechts',
                desc: 'Leer N M , . /',
                keys: ['n', 'm', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['man', 'naam', 'dans', 'hand', 'lang', 'mand', 'ding', 'mond', 'land', 'gang', 'bank', 'hang', 'min'],
                sentences: ['man met hand', 'lang land dans']
            },
            {
                title: 'Les 15: Hele Onderste Rij',
                desc: 'Combineer alle onderste rij letters',
                keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                words: ['computer', 'machine', 'vandaag', 'bewegen', 'centrum', 'zonnig', 'complex', 'benzine', 'maximum', 'Mexico'],
                sentences: ['de computer is complex', 'vandaag was zonnig', 'benzine in het centrum']
            },
            {
                title: 'Les 16: Drie Rijen Samen',
                desc: 'Gebruik het hele toetsenbord',
                keys: 'all',
                words: ['maandag', 'school', 'computer', 'voetbal', 'verjaardag', 'probleem', 'gezin', 'nummer', 'vakantie', 'muziek', 'examen', 'vliegtuig'],
                sentences: ['maandag is school', 'de computer doet het', 'voetbal is leuk', 'vakantie en muziek']
            },
            {
                title: 'Les 17: Nederlandse Zinnen',
                desc: 'Typ volledige Nederlandse zinnen',
                keys: 'all',
                words: [],
                sentences: [
                    'de kat zit op de mat',
                    'hij speelt graag buiten',
                    'morgen gaan we naar school',
                    'mijn hond heet max',
                    'het regent vandaag heel erg',
                    'wij spelen samen minecraft',
                    'de zon schijnt door het raam',
                    'ik heb honger en dorst'
                ]
            },
            {
                title: 'Les 18: Desert Boss',
                desc: 'Versla de Husk in de woestijn!',
                keys: 'all',
                words: ['woestijn', 'zandstorm', 'cactus', 'overleven', 'schorpioen', 'verschrikking', 'beschermen', 'extreem'],
                sentences: [
                    'de zandstorm raast door de woestijn',
                    'bescherm jezelf tegen de schorpioen',
                    'overleven in extreme hitte is moeilijk',
                    'de cactus geeft water in de woestijn'
                ],
                mob: { name: 'Husk', icon: '🏜️', hp: 12 }
            }
        ]
    },
    /* ===== BIOME 3: NETHER - Capitals & Punctuation ===== */
    {
        biome: 'nether',
        lessons: [
            {
                title: 'Les 19: Hoofdletters',
                desc: 'Leer de Shift-toets gebruiken',
                keys: 'all',
                words: ['Amsterdam', 'Nederland', 'Sebas', 'Jonathan', 'Benjamin', 'Minecraft', 'Europa', 'Dinsdag', 'Januari', 'School'],
                sentences: [
                    'Sebas woont in Nederland.',
                    'Jonathan speelt Minecraft.',
                    'Benjamin bouwt een huis.',
                    'Amsterdam is de hoofdstad.',
                    'Op Dinsdag hebben we gym.'
                ]
            },
            {
                title: 'Les 20: Punt en Komma',
                desc: 'Leer leestekens: . en ,',
                keys: 'all',
                words: [],
                sentences: [
                    'Hallo, hoe gaat het met jou?',
                    'Goed, dank je. En met jou?',
                    'Ik heb een kat, een hond, en een vis.',
                    'Morgen, overmorgen, en daarna.',
                    'Ja, dat klopt. Ik weet het zeker.'
                ]
            },
            {
                title: 'Les 21: Vraagteken en Uitroepteken',
                desc: 'Leer ? en !',
                keys: 'all',
                words: [],
                sentences: [
                    'Hoe heet jij? Ik heet Sebas!',
                    'Waar ga je heen? Naar school!',
                    'Wat is dat? Dat is een creeper!',
                    'Help! De zombie komt eraan!',
                    'Kun je mij helpen? Ja, natuurlijk!'
                ]
            },
            {
                title: 'Les 22: Lange Zinnen',
                desc: 'Typ langere zinnen met leestekens',
                keys: 'all',
                words: [],
                sentences: [
                    'Als je goed oefent, kun je heel snel typen.',
                    'Minecraft is een spel waar je kunt bouwen, mijnen, en overleven.',
                    'De Nether is gevaarlijk, maar er zijn waardevolle grondstoffen.',
                    'Mijn broer en ik spelen samen op de computer.',
                    'Het is belangrijk om elke dag te oefenen, zelfs als het even niet lukt.'
                ]
            },
            {
                title: 'Les 23: Snelheidstest',
                desc: 'Typ zo snel en nauwkeurig mogelijk',
                keys: 'all',
                words: [],
                sentences: [
                    'De zon gaat onder achter de bergen.',
                    'Alle kinderen rennen naar het schoolplein.',
                    'Na het eten gaan we buiten spelen.',
                    'Het boek ligt op de tafel naast het raam.',
                    'Mijn vriend komt morgen langs om te spelen.',
                    'De trein vertrekt om kwart over drie.',
                    'We hebben een nieuwe computer gekregen!',
                    'In de vakantie gaan we naar het strand.'
                ]
            },
            {
                title: 'Les 24: Nether Boss',
                desc: 'Versla de Blaze in het Nether!',
                keys: 'all',
                words: [],
                sentences: [
                    'De Blaze vliegt door de lava!',
                    'Gebruik je zwaard om je te verdedigen.',
                    'Pas op voor de vuurbal, spring opzij!',
                    'De Nether is heet, donker, en gevaarlijk.',
                    'Als je de Blaze verslaat, krijg je Blaze Rods!'
                ],
                mob: { name: 'Blaze', icon: '🔥', hp: 15 }
            }
        ]
    },
    /* ===== BIOME 4: THE END - Numbers & Symbols ===== */
    {
        biome: 'end',
        lessons: [
            {
                title: 'Les 25: Cijfers 1-5',
                desc: 'Leer de cijfers aan de linkerkant',
                keys: 'all',
                words: ['11', '22', '33', '44', '55', '123', '321', '12345', '54321', '135', '531', '2244', '1155'],
                sentences: [
                    'Ik heb 5 appels en 3 peren.',
                    'Er zijn 12 leerlingen in de klas.',
                    'Het is vandaag 15 graden.',
                    'Ik word 13 jaar op 25 mei.'
                ]
            },
            {
                title: 'Les 26: Cijfers 6-0',
                desc: 'Leer de cijfers aan de rechterkant',
                keys: 'all',
                words: ['66', '77', '88', '99', '100', '678', '987', '67890', '1000', '6789', '90', '80', '70'],
                sentences: [
                    'De snelheid is 100 kilometer per uur.',
                    'Er zijn 7 dagen in een week.',
                    'Het jaar heeft 365 dagen.',
                    'Mijn telefoon nummer heeft 10 cijfers.'
                ]
            },
            {
                title: 'Les 27: Cijfers en Woorden',
                desc: 'Mix van tekst en cijfers',
                keys: 'all',
                words: [],
                sentences: [
                    'In 2024 was ik 12 jaar oud.',
                    'De tafel kost 199 euro en 50 cent.',
                    'Om 8 uur begint school, om 15 uur zijn we vrij.',
                    'Nederland heeft ongeveer 18 miljoen inwoners.',
                    'Minecraft kwam uit in 2011 en is nu 15 jaar oud!'
                ]
            },
            {
                title: 'Les 28: Speciale Tekens',
                desc: 'Leer haakjes en andere tekens',
                keys: 'all',
                words: [],
                sentences: [
                    'Het adres is: Hoofdstraat 42, Amsterdam.',
                    'Mijn e-mail is: naam@voorbeeld.nl',
                    'De score was 3-1 (drie tegen een).',
                    'Gebruik de pijltjestoetsen (links/rechts) om te bewegen.',
                    'Het wachtwoord moet letters + cijfers bevatten.'
                ]
            },
            {
                title: 'Les 29: Ultieme Snelheidstest',
                desc: 'De laatste test voor je The End bereikt',
                keys: 'all',
                words: [],
                sentences: [
                    'Na maanden oefenen kun je nu blind typen. Gefeliciteerd!',
                    'De Ender Dragon wacht op je in The End.',
                    'Gebruik al je vaardigheden: snelheid, nauwkeurigheid, en doorzettingsvermogen.',
                    'Elke dag oefenen heeft je hier gebracht.',
                    'Je hebt bewezen dat je een echte TypeCraft meester bent!',
                    'De reis van Plains naar The End was lang, maar je hebt het gehaald.',
                    'Sebas, Jonathan, en Benjamin: jullie zijn kampioenen!'
                ]
            },
            {
                title: 'Les 30: Ender Dragon',
                desc: 'De ultieme boss fight!',
                keys: 'all',
                words: [],
                sentences: [
                    'De Ender Dragon cirkelt boven het eiland!',
                    'Vernietig de End Crystals op de torens!',
                    'De draak duikt naar beneden, typ sneller!',
                    'Je zwaard raakt de draak voor 10 schade!',
                    'Nog even volhouden, de draak heeft nog maar 20 HP!',
                    'De Ender Dragon is verslagen! Je bent een legende!',
                    'Gefeliciteerd, je hebt TypeCraft uitgespeeld!'
                ],
                mob: { name: 'Ender Dragon', icon: '🐉', hp: 50 }
            }
        ]
    }
];

/* ===== Lesson Helper Functions ===== */

function getLessonContent(biomeIndex, lessonIndex) {
    if (biomeIndex >= LESSON_SETS.length) return null;
    const biome = LESSON_SETS[biomeIndex];
    if (lessonIndex >= biome.lessons.length) return null;
    return biome.lessons[lessonIndex];
}

function getTotalLessons() {
    return LESSON_SETS.reduce((sum, b) => sum + b.lessons.length, 0);
}

function generateLessonText(lesson, playerAge) {
    let texts = [];

    if (lesson.sentences && lesson.sentences.length > 0) {
        // Use sentences for older kids, words for younger
        if (playerAge >= 10) {
            texts = [...lesson.sentences];
        } else {
            // Mix words and short sentences for young kids
            if (lesson.words && lesson.words.length > 0) {
                texts = [...lesson.words];
            }
            // Add only shorter sentences
            lesson.sentences.forEach(s => {
                if (s.length < 30) texts.push(s);
            });
        }
    } else if (lesson.words && lesson.words.length > 0) {
        texts = [...lesson.words];
    }

    // Shuffle
    for (let i = texts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [texts[i], texts[j]] = [texts[j], texts[i]];
    }

    // Limit based on age
    const maxItems = playerAge <= 8 ? 6 : playerAge <= 11 ? 10 : 14;
    texts = texts.slice(0, maxItems);

    return texts.join(' ');
}

function getDailyChallenge(player) {
    const today = getToday();
    // Seed based on date for consistent daily challenge
    const seed = today.split('-').join('');
    const biomeIdx = Math.min(player.currentBiome, LESSON_SETS.length - 1);
    const biome = LESSON_SETS[biomeIdx];

    // Pick semi-random words from current biome
    const allWords = biome.lessons.reduce((acc, l) => {
        if (l.words) acc.push(...l.words);
        return acc;
    }, []);

    const allSentences = biome.lessons.reduce((acc, l) => {
        if (l.sentences) acc.push(...l.sentences);
        return acc;
    }, []);

    // Simple seeded selection
    const seedNum = parseInt(seed) % 1000;
    let challenge = [];

    if (allSentences.length > 0) {
        for (let i = 0; i < 5; i++) {
            const idx = (seedNum + i * 7) % allSentences.length;
            challenge.push(allSentences[idx]);
        }
    } else {
        for (let i = 0; i < 15; i++) {
            const idx = (seedNum + i * 3) % allWords.length;
            challenge.push(allWords[idx]);
        }
    }

    return {
        title: `Dagelijkse Uitdaging - ${BIOMES[biomeIdx].name}`,
        text: challenge.join(' '),
        date: today
    };
}
