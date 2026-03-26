export type LanguageId = 'sv' | 'en' | 'de' | 'fr' | 'es'

export type NumberLanguage = {
  id: LanguageId
  label: string
  locale: string
  toWords: (value: number) => string
}

const swedishUnits: Record<number, string> = {
  0: 'noll',
  1: 'ett',
  2: 'två',
  3: 'tre',
  4: 'fyra',
  5: 'fem',
  6: 'sex',
  7: 'sju',
  8: 'åtta',
  9: 'nio',
}

const swedishTeens: Record<number, string> = {
  10: 'tio',
  11: 'elva',
  12: 'tolv',
  13: 'tretton',
  14: 'fjorton',
  15: 'femton',
  16: 'sexton',
  17: 'sjutton',
  18: 'arton',
  19: 'nitton',
}

const swedishTens: Record<number, string> = {
  20: 'tjugo',
  30: 'trettio',
  40: 'fyrtio',
  50: 'femtio',
  60: 'sextio',
  70: 'sjuttio',
  80: 'åttio',
  90: 'nittio',
}

const englishUnits: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
}

const englishTeens: Record<number, string> = {
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
}

const englishTens: Record<number, string> = {
  20: 'twenty',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
}

const germanUnits: Record<number, string> = {
  0: 'null',
  1: 'eins',
  2: 'zwei',
  3: 'drei',
  4: 'vier',
  5: 'fünf',
  6: 'sechs',
  7: 'sieben',
  8: 'acht',
  9: 'neun',
}

const germanTeens: Record<number, string> = {
  10: 'zehn',
  11: 'elf',
  12: 'zwölf',
  13: 'dreizehn',
  14: 'vierzehn',
  15: 'fünfzehn',
  16: 'sechzehn',
  17: 'siebzehn',
  18: 'achtzehn',
  19: 'neunzehn',
}

const germanTens: Record<number, string> = {
  20: 'zwanzig',
  30: 'dreißig',
  40: 'vierzig',
  50: 'fünfzig',
  60: 'sechzig',
  70: 'siebzig',
  80: 'achtzig',
  90: 'neunzig',
}

const frenchBase: Record<number, string> = {
  0: 'zéro',
  1: 'un',
  2: 'deux',
  3: 'trois',
  4: 'quatre',
  5: 'cinq',
  6: 'six',
  7: 'sept',
  8: 'huit',
  9: 'neuf',
  10: 'dix',
  11: 'onze',
  12: 'douze',
  13: 'treize',
  14: 'quatorze',
  15: 'quinze',
  16: 'seize',
}

const frenchTens: Record<number, string> = {
  20: 'vingt',
  30: 'trente',
  40: 'quarante',
  50: 'cinquante',
  60: 'soixante',
}

const spanishBase: Record<number, string> = {
  0: 'cero',
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve',
}

const spanishTens: Record<number, string> = {
  30: 'treinta',
  40: 'cuarenta',
  50: 'cincuenta',
  60: 'sesenta',
  70: 'setenta',
  80: 'ochenta',
  90: 'noventa',
}

const spanishHundreds: Record<number, string> = {
  1: 'ciento',
  2: 'doscientos',
  3: 'trescientos',
  4: 'cuatrocientos',
  5: 'quinientos',
  6: 'seiscientos',
  7: 'setecientos',
  8: 'ochocientos',
  9: 'novecientos',
}

function toSwedishNumber(value: number): string {
  if (value < 0) {
    return `minus ${toSwedishNumber(Math.abs(value))}`
  }

  if (value in swedishUnits) {
    return swedishUnits[value]
  }

  if (value in swedishTeens) {
    return swedishTeens[value]
  }

  if (value < 100) {
    const tenValue = Math.floor(value / 10) * 10
    const unitValue = value % 10

    if (unitValue === 0) {
      return swedishTens[tenValue]
    }

    return `${swedishTens[tenValue]}${swedishUnits[unitValue]}`
  }

  if (value < 1000) {
    const hundredValue = Math.floor(value / 100)
    const remainder = value % 100
    const hundredWord =
      hundredValue === 1 ? 'hundra' : `${swedishUnits[hundredValue]}hundra`

    if (remainder === 0) {
      return hundredWord
    }

    return `${hundredWord}${toSwedishNumber(remainder)}`
  }

  const thousandValue = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandWord =
    thousandValue === 1 ? 'ettusen' : `${toSwedishNumber(thousandValue)}tusen`

  if (remainder === 0) {
    return thousandWord
  }

  return `${thousandWord}${toSwedishNumber(remainder)}`
}

function toEnglishNumber(value: number): string {
  if (value < 0) {
    return `minus ${toEnglishNumber(Math.abs(value))}`
  }

  if (value in englishUnits) {
    return englishUnits[value]
  }

  if (value in englishTeens) {
    return englishTeens[value]
  }

  if (value < 100) {
    const tenValue = Math.floor(value / 10) * 10
    const unitValue = value % 10

    if (unitValue === 0) {
      return englishTens[tenValue]
    }

    return `${englishTens[tenValue]}-${englishUnits[unitValue]}`
  }

  if (value < 1000) {
    const hundredValue = Math.floor(value / 100)
    const remainder = value % 100
    const hundredWord = `${englishUnits[hundredValue]} hundred`

    if (remainder === 0) {
      return hundredWord
    }

    return `${hundredWord} ${toEnglishNumber(remainder)}`
  }

  const thousandValue = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandWord = `${toEnglishNumber(thousandValue)} thousand`

  if (remainder === 0) {
    return thousandWord
  }

  return `${thousandWord} ${toEnglishNumber(remainder)}`
}

function toGermanUnit(value: number, inCompound = false): string {
  if (value === 1) {
    return inCompound ? 'ein' : 'eins'
  }

  return germanUnits[value]
}

function toGermanNumber(value: number): string {
  if (value < 0) {
    return `minus ${toGermanNumber(Math.abs(value))}`
  }

  if (value in germanUnits) {
    return germanUnits[value]
  }

  if (value in germanTeens) {
    return germanTeens[value]
  }

  if (value < 100) {
    const tenValue = Math.floor(value / 10) * 10
    const unitValue = value % 10

    if (unitValue === 0) {
      return germanTens[tenValue]
    }

    return `${toGermanUnit(unitValue, true)}und${germanTens[tenValue]}`
  }

  if (value < 1000) {
    const hundredValue = Math.floor(value / 100)
    const remainder = value % 100
    const hundredWord =
      hundredValue === 1 ? 'einhundert' : `${toGermanUnit(hundredValue)}hundert`

    if (remainder === 0) {
      return hundredWord
    }

    return `${hundredWord}${toGermanNumber(remainder)}`
  }

  const thousandValue = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandWord =
    thousandValue === 1 ? 'eintausend' : `${toGermanNumber(thousandValue)}tausend`

  if (remainder === 0) {
    return thousandWord
  }

  return `${thousandWord}${toGermanNumber(remainder)}`
}

function toFrenchUnder100(value: number): string {
  if (value in frenchBase) {
    return frenchBase[value]
  }

  if (value < 20) {
    return `dix-${frenchBase[value - 10]}`
  }

  if (value < 70) {
    const tenValue = Math.floor(value / 10) * 10
    const unitValue = value % 10

    if (unitValue === 0) {
      return frenchTens[tenValue]
    }

    if (unitValue === 1) {
      return `${frenchTens[tenValue]}-et-un`
    }

    return `${frenchTens[tenValue]}-${frenchBase[unitValue]}`
  }

  if (value < 80) {
    if (value === 71) {
      return 'soixante-et-onze'
    }

    return `soixante-${toFrenchUnder100(value - 60)}`
  }

  if (value === 80) {
    return 'quatre-vingts'
  }

  return `quatre-vingt-${toFrenchUnder100(value - 80)}`
}

function toFrenchNumber(value: number): string {
  if (value < 0) {
    return `moins ${toFrenchNumber(Math.abs(value))}`
  }

  if (value < 100) {
    return toFrenchUnder100(value)
  }

  if (value < 1000) {
    const hundredValue = Math.floor(value / 100)
    const remainder = value % 100
    let hundredWord = hundredValue === 1 ? 'cent' : `${frenchBase[hundredValue]} cent`

    if (remainder === 0 && hundredValue > 1) {
      hundredWord = `${hundredWord}s`
    }

    if (remainder === 0) {
      return hundredWord
    }

    return `${hundredWord} ${toFrenchUnder100(remainder)}`
  }

  const thousandValue = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandWord =
    thousandValue === 1 ? 'mille' : `${toFrenchNumber(thousandValue)} mille`

  if (remainder === 0) {
    return thousandWord
  }

  return `${thousandWord} ${toFrenchNumber(remainder)}`
}

function toSpanishUnder100(value: number): string {
  if (value in spanishBase) {
    return spanishBase[value]
  }

  const tenValue = Math.floor(value / 10) * 10
  const unitValue = value % 10

  if (unitValue === 0) {
    return spanishTens[tenValue]
  }

  return `${spanishTens[tenValue]} y ${spanishBase[unitValue]}`
}

function toSpanishNumber(value: number): string {
  if (value < 0) {
    return `menos ${toSpanishNumber(Math.abs(value))}`
  }

  if (value < 100) {
    return toSpanishUnder100(value)
  }

  if (value === 100) {
    return 'cien'
  }

  if (value < 1000) {
    const hundredValue = Math.floor(value / 100)
    const remainder = value % 100
    const hundredWord = spanishHundreds[hundredValue]

    if (remainder === 0) {
      return hundredWord
    }

    return `${hundredWord} ${toSpanishUnder100(remainder)}`
  }

  const thousandValue = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandWord =
    thousandValue === 1 ? 'mil' : `${toSpanishNumber(thousandValue)} mil`

  if (remainder === 0) {
    return thousandWord
  }

  return `${thousandWord} ${toSpanishNumber(remainder)}`
}

export const numberLanguages: NumberLanguage[] = [
  { id: 'sv', label: 'Swedish', locale: 'sv-SE', toWords: toSwedishNumber },
  { id: 'en', label: 'English', locale: 'en-US', toWords: toEnglishNumber },
  { id: 'de', label: 'German', locale: 'de-DE', toWords: toGermanNumber },
  { id: 'fr', label: 'French', locale: 'fr-FR', toWords: toFrenchNumber },
  { id: 'es', label: 'Spanish', locale: 'es-ES', toWords: toSpanishNumber },
]

export const numberLanguageById: Record<LanguageId, NumberLanguage> = {
  sv: numberLanguages[0],
  en: numberLanguages[1],
  de: numberLanguages[2],
  fr: numberLanguages[3],
  es: numberLanguages[4],
}

const collators: Record<LanguageId, Intl.Collator> = {
  sv: new Intl.Collator('sv-SE', { ignorePunctuation: true, sensitivity: 'base' }),
  en: new Intl.Collator('en-US', { ignorePunctuation: true, sensitivity: 'base' }),
  de: new Intl.Collator('de-DE', { ignorePunctuation: true, sensitivity: 'base' }),
  fr: new Intl.Collator('fr-FR', { ignorePunctuation: true, sensitivity: 'base' }),
  es: new Intl.Collator('es-ES', { ignorePunctuation: true, sensitivity: 'base' }),
}

const numberNameCaches: Record<LanguageId, Map<number, string>> = {
  sv: new Map<number, string>(),
  en: new Map<number, string>(),
  de: new Map<number, string>(),
  fr: new Map<number, string>(),
  es: new Map<number, string>(),
}

function normalizeSortName(name: string): string {
  return name.replace(/[\s'’-]/g, '')
}

export function getLanguageCollator(languageId: LanguageId): Intl.Collator {
  return collators[languageId]
}

export function getNumberName(value: number, languageId: LanguageId): string {
  const cache = numberNameCaches[languageId]
  const cachedName = cache.get(value)

  if (cachedName) {
    return cachedName
  }

  const name = numberLanguageById[languageId].toWords(value)
  cache.set(value, name)
  return name
}

export function getSortableNumberName(value: number, languageId: LanguageId): string {
  return normalizeSortName(getNumberName(value, languageId))
}
