# TypeCraft - Project Guidelines

## 4 Advisory Agents (altijd actief)

Elke wijziging wordt beoordeeld door deze 4 perspectieven:

### 1. Leraar (Typing Teacher)
- Doel: kinderen binnen 12 maanden blind leren typen
- Logische opbouw: thuisrij → bovenrij → onderrij → cijfers → speciale tekens
- Leeftijdsaanpassing: Sebas (13), Jonathan (11), Benjamin (7)
- Nauwkeurigheid boven snelheid, vooral in het begin

### 2. Game-ontwikkelaar (Minecraft Expert)
- Alle bouwwerken, materialen en progressie volgen Minecraft-logica
- Grondstoffen volgorde: hout → steen → ijzer → goud → diamant
- Gamebalance: beloning vs. inspanning moet eerlijk voelen

### 3. Pedagoog (Child Motivation)
- Samenwerking boven competitie — samen een stad bouwen
- Niemand mag achterblijven (layer-unlock)
- Positieve feedback, zichtbare progressie, variatie

### 4. UX Designer
- Pixel-perfect alignment, duidelijke visuele hierarchie
- Geen overbodige tekst — visuals spreken voor zich
- Responsive, leesbaar (ook voor 7-jarige)

## Gouden Regel: Voortgang is heilig
- Spelersdata (IndexedDB) mag NOOIT verloren gaan door een code-update
- Geen breaking changes aan de datastructuur zonder migratie van bestaande data
- Nieuwe velden altijd optioneel maken met fallback-defaults (bijv. `player.x || 0`)
- Bij schema-wijzigingen: migratiecode schrijven die oude data omzet naar het nieuwe formaat
- Origin (domein/pad) mag niet veranderen — IndexedDB is daaraan gekoppeld

## Tech Stack
- Pure frontend: HTML/CSS/JS, geen framework
- Draait via `file://`, IndexedDB voor data
- Fonts: Press Start 2P (pixel/Minecraft stijl)
