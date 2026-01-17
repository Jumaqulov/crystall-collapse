# Crystal Puzzle / Crystal Collapse

Vanilla Phaser 3 (3.60) 1010!-uslubidagi blok-puzzle o‘yini. “Crystal Collapse” rejimi bosim mexanikasini qo‘shadi: pastdan “junk” qatorlar ko‘tarilib turadi, o‘yinchi liniyalarni tozalab omon qoladi.

## O‘yinchiga qisqacha
- 8x8 maydonga shakllarni drag-drop orqali qo‘ying; to‘liq qator/ustunni tozalang.
- “Junk” qatorlar har bir intervalda pastdan chiqadi, maydonni yuqoriga suradi; bloklar yuqori chegaradan oshsa o‘yin tugaydi.
- Liniya tozalash bosimni sekinlashtiradi: 1–2 liniya +2s, 3+ liniya +5s keyingi ko‘tarilishga qo‘shiladi.
- Davom ettirish: Game Over modalidagi “Continue” bosilganda rewarded videoni tomosha qiling – eng yuqori band qatordan tozalanadi, bosim 6s ga muzlaydi.
- Power-up’lar (AD bilan): Hammer (3x3 ni o‘chiradi), Shuffle (dockni yangilaydi), Freeze (bosimni 5s to‘xtatadi).

## Bosim balansi
`game.js` dagi `PRESSURE_CONFIG`:
- `initialRiseInterval` (s): birinchi junk ko‘tarilish oralig‘i.
- `minRiseInterval` (s): tezlashishning eng past chegarasi.
- `speedupEverySeconds`: shu muddatda interval `speedupFactor` ga ko‘payadi (tezlashadi).
- `lineClearDelay1`: 1–2 liniya tozalansa keyingi ko‘tarilish kechikishi (s).
- `lineClearDelay3`: 3+ liniya tozalansa kechikish (s).
- `postContinueFreezeSeconds`: Continue’dan keyin muzlash oynasi (s).
- `freezePowerDuration`: Freeze power-up davomiyligi (s).
- `debugDisablePressure`: true bo‘lsa bosim o‘chadi (QA uchun).

## Davom ettirish oqimi
- Game Over da “Continue” tugmasi ko‘rinadi (bir marta ishlaydi).
- Rewarded video muvaffaqiyatli: eng yuqori band qator tozalanadi, bosim qayta yoqilib 6s muzlaydi, o‘yin davom etadi.
- Video bekor/hatolik: Game Over holati saqlanadi.

## UI qo‘shimchalari
- HUD chapida “Pressure Meter”: “Next rise in Xs” va vertikal bar ko‘rsatkichi.
- O‘ng panelda Freeze power-up tugmasi.
- Modalda “Continue” tugmasi (accent gradient).

## Fayllar
- `index.html`: bosim metri markup’i, Freeze va Continue tugmalari.
- `styles.css`: pressure meter, Freeze rangi, accent button stili.
- `game.js`: PRESSURE_CONFIG, PressureManager (junk ko‘tarilish), Continue/Freeze ad oqimlari, i18n kalitlari.

## SDK va i18n
- Yandex Games SDK v2: rewarded/interstitial ad’lar `YandexGamesSDK` orqali (isAdShowing guardlar bilan).
- Til: en/ru/uz; yangi kalitlar: `pressure_label`, `pressure_next_in`, `continue_button`, `freeze_tool`.
