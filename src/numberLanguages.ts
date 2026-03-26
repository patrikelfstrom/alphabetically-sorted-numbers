import { LOCALES, toWords as convertToWords } from "to-words";

export type LanguageId = string;

export type NumberLanguage = {
  id: LanguageId;
  label: string;
  locale: string;
  toWords: (value: number) => string;
};

const languageDisplayNames = new Intl.DisplayNames(["en"], { type: "language" });
const regionDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const labelCollator = new Intl.Collator("en", { sensitivity: "base" });
const languageNameOverrides: Record<string, string> = {
  ee: "Estonian",
  hbo: "Biblical Hebrew",
  np: "Nepali",
};
const preferredRepresentativeLocaleIds = [
  "ar-SA",
  "de-DE",
  "en-US",
  "es-ES",
  "fr-FR",
  "ja-JP",
  "ko-KR",
  "nl-NL",
  "pt-BR",
  "ru-RU",
  "sv-SE",
  "sw-KE",
  "zh-CN",
  "zh-TW",
];

function getLocaleParts(localeId: string): {
  languageCode: string;
  regionCode: string | null;
} {
  const [languageCode, regionCode] = localeId.split("-");
  return {
    languageCode,
    regionCode: regionCode ?? null,
  };
}

function getDisplayName(
  displayNames: Intl.DisplayNames,
  code: string,
  fallback: string,
): string {
  const label = displayNames.of(code);
  return !label || label === code ? fallback : label;
}

const localeIds = Object.keys(LOCALES);
const preferredLocaleScores = new Map(
  preferredRepresentativeLocaleIds.map((localeId, index) => [localeId, index]),
);

function stableSerialize(value: unknown): string {
  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableSerialize(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function getLocaleSignature(localeId: string): string {
  const Locale = LOCALES[localeId];
  const localeConfig = new Locale().config;
  const {
    currency: _currency,
    ordinalExactWordsMapping: _ordinalExactWordsMapping,
    ordinalWordsMapping: _ordinalWordsMapping,
    ...spelloutConfig
  } = localeConfig;

  return stableSerialize(spelloutConfig);
}

function getRepresentativeLocaleId(groupedLocaleIds: string[]): string {
  return [...groupedLocaleIds].sort((left, right) => {
    const leftScore = preferredLocaleScores.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightScore = preferredLocaleScores.get(right) ?? Number.MAX_SAFE_INTEGER;

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return left.localeCompare(right);
  })[0];
}

const localeIdsBySignature = localeIds.reduce<Map<string, string[]>>((groups, localeId) => {
  const signature = getLocaleSignature(localeId);
  const matchingLocales = groups.get(signature);

  if (matchingLocales) {
    matchingLocales.push(localeId);
    return groups;
  }

  groups.set(signature, [localeId]);
  return groups;
}, new Map<string, string[]>());

const canonicalLanguageIdByLocaleId = Array.from(localeIdsBySignature.values()).reduce<
  Record<string, string>
>((canonicalByLocaleId, groupedLocaleIds) => {
  const representativeLocaleId = getRepresentativeLocaleId(groupedLocaleIds);

  for (const localeId of groupedLocaleIds) {
    canonicalByLocaleId[localeId] = representativeLocaleId;
  }

  return canonicalByLocaleId;
}, {});

const representativeLocaleIds = Array.from(
  new Set(Object.values(canonicalLanguageIdByLocaleId)),
);
const representativeLanguageCounts = representativeLocaleIds.reduce<Map<string, number>>(
  (counts, localeId) => {
    const { languageCode } = getLocaleParts(localeId);
    counts.set(languageCode, (counts.get(languageCode) ?? 0) + 1);
    return counts;
  },
  new Map<string, number>(),
);

function getLanguageLabel(localeId: string): string {
  const { languageCode, regionCode } = getLocaleParts(localeId);
  const fallbackLanguageLabel = languageNameOverrides[languageCode] ?? languageCode;
  const languageLabel = getDisplayName(
    languageDisplayNames,
    languageCode,
    fallbackLanguageLabel,
  );
  const regionLabel = regionCode
    ? getDisplayName(regionDisplayNames, regionCode, regionCode)
    : null;
  const shouldIncludeRegion =
    Boolean(regionLabel) && (representativeLanguageCounts.get(languageCode) ?? 0) > 1;

  return shouldIncludeRegion ? `${languageLabel} (${regionLabel})` : languageLabel;
}

function createLocalizedConverter(localeId: LanguageId): (value: number) => string {
  return (value: number) =>
    convertToWords(value, { localeCode: localeId }).toLocaleLowerCase(localeId);
}

export const numberLanguages: NumberLanguage[] = representativeLocaleIds
  .map(
    (localeId): NumberLanguage => ({
      id: localeId,
      label: getLanguageLabel(localeId),
      locale: localeId,
      toWords: createLocalizedConverter(localeId),
    }),
  )
  .sort((left, right) => {
    const labelComparison = labelCollator.compare(left.label, right.label);
    return labelComparison !== 0
      ? labelComparison
      : labelCollator.compare(left.locale, right.locale);
  });

export function resolveLanguageId(localeId: string): LanguageId | null {
  return canonicalLanguageIdByLocaleId[localeId] ?? null;
}

export const numberLanguageById: Record<LanguageId, NumberLanguage> = Object.fromEntries(
  numberLanguages.map((language) => [language.id, language]),
) as Record<LanguageId, NumberLanguage>;

const collators: Record<LanguageId, Intl.Collator> = Object.fromEntries(
  numberLanguages.map((language) => [
    language.id,
    new Intl.Collator(language.locale, {
      ignorePunctuation: true,
      sensitivity: "base",
    }),
  ]),
) as Record<LanguageId, Intl.Collator>;

const numberNameCaches: Record<LanguageId, Map<number, string>> = Object.fromEntries(
  numberLanguages.map((language) => [language.id, new Map<number, string>()]),
) as Record<LanguageId, Map<number, string>>;

function normalizeSortName(name: string): string {
  return name.replace(/[\p{White_Space}\p{Punctuation}]/gu, "");
}

export function getLanguageCollator(languageId: LanguageId): Intl.Collator {
  return collators[languageId];
}

export function getNumberName(value: number, languageId: LanguageId): string {
  const cache = numberNameCaches[languageId];
  const cachedName = cache.get(value);

  if (cachedName) {
    return cachedName;
  }

  const name = numberLanguageById[languageId].toWords(value);
  cache.set(value, name);
  return name;
}

export function getSortableNumberName(value: number, languageId: LanguageId): string {
  return normalizeSortName(getNumberName(value, languageId));
}
