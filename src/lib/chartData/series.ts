import * as d3 from "d3";
import type { NumberRange } from "../../app/types";
import {
  getLanguageCollator,
  getNumberName,
  getSortableNumberName,
  numberLanguages,
  numberLanguageById,
  type LanguageId,
} from "../../numberLanguages";
import { getRangeCount } from "../rangeUtils";
import { formatPointTitleEntries } from "./labels";
import type {
  ChartData,
  LanguageChartData,
  LanguageSeries,
  NumberPoint,
  VisibleLanguageSeries,
} from "./types";

type RawNumberEntry = {
  name: string;
  sortName: string;
  value: number;
};

const languageColorPalette = [
  "#67e8f9",
  "#fbbf24",
  "#fb7185",
  "#86efac",
  "#a78bfa",
  "#fdba74",
  "#7dd3fc",
  "#f9a8d4",
];
const languagePaletteIndexById = new Map(
  numberLanguages.map((language, index) => [language.id, index] as const),
);

function getTickStep(maxValue: number): number {
  const roughStep = Math.max(1, Math.ceil(maxValue / 10));
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));

  if (roughStep <= magnitude) {
    return magnitude;
  }

  if (roughStep <= magnitude * 2) {
    return magnitude * 2;
  }

  if (roughStep <= magnitude * 5) {
    return magnitude * 5;
  }

  return magnitude * 10;
}

function getLanguageColor(languageId: LanguageId): string {
  const paletteIndex = languagePaletteIndexById.get(languageId) ?? 0;

  return languageColorPalette[paletteIndex % languageColorPalette.length];
}

export function buildChartData(availableRange: NumberRange): ChartData {
  const xValues = d3.range(availableRange.start, availableRange.end + 1);
  const count = getRangeCount(availableRange);
  const yValues = d3.range(1, count + 1);
  const tickStep = getTickStep(Math.max(1, availableRange.end - availableRange.start));
  const xTicks = d3.range(availableRange.start, availableRange.end + 1, tickStep);
  const yTicks = d3.range(1, count + 1, tickStep);

  if (xTicks[xTicks.length - 1] !== availableRange.end) {
    xTicks.push(availableRange.end);
  }

  if (yTicks.length === 0 || yTicks[yTicks.length - 1] !== count) {
    yTicks.push(count);
  }

  return {
    equalityPoints: xValues.map((value) => ({
      alphabeticalRank: value - availableRange.start + 1,
      value,
    })),
    xValues,
    xTicks,
    yValues,
    yTicks,
  };
}

export function buildLanguageChartData(
  availableRange: NumberRange,
  languageId: LanguageId,
): LanguageChartData {
  const values = d3.range(availableRange.start, availableRange.end + 1);
  const language = numberLanguageById[languageId];
  const collator = getLanguageCollator(languageId);
  const rawData: RawNumberEntry[] = values.map((value) => ({
    name: getNumberName(value, languageId),
    sortName: getSortableNumberName(value, languageId),
    value,
  }));
  const data = d3
    .sort(rawData, (left, right) => collator.compare(left.sortName, right.sortName))
    .map(
      (entry, index): NumberPoint => ({
        alphabeticalRank: index + 1,
        languageId,
        languageLabel: language.label,
        name: entry.name,
        value: entry.value,
      }),
    );
  const pointsByValue = new Map<number, NumberPoint>();

  for (const point of data) {
    pointsByValue.set(point.value, point);
  }

  return {
    pointsByValue,
  };
}

export function buildLanguageSeries(
  availableRange: NumberRange,
  selectedLanguageIds: LanguageId[],
): LanguageSeries[] {
  return selectedLanguageIds.map((languageId) => ({
    chartData: buildLanguageChartData(availableRange, languageId),
    color: getLanguageColor(languageId),
    languageId,
    languageLabel: numberLanguageById[languageId].label,
  }));
}

export function selectVisibleLanguageSeries(
  languageSeries: LanguageSeries[],
  visibleValueRange: NumberRange,
  visibleRankRange: NumberRange,
): VisibleLanguageSeries[] {
  const visibleLanguageSeries = languageSeries.map((series) => {
    const visiblePoints: NumberPoint[] = [];

    for (let value = visibleValueRange.start; value <= visibleValueRange.end; value += 1) {
      const point = series.chartData.pointsByValue.get(value);

      if (
        point &&
        point.alphabeticalRank >= visibleRankRange.start &&
        point.alphabeticalRank <= visibleRankRange.end
      ) {
        visiblePoints.push(point);
      }
    }

    return {
      ...series,
      visiblePoints,
    };
  });

  const pointsByCoordinate = new Map<string, NumberPoint[]>();

  for (const series of visibleLanguageSeries) {
    for (const point of series.visiblePoints) {
      const coordinateKey = `${point.value}:${point.alphabeticalRank}`;
      const coordinatePoints = pointsByCoordinate.get(coordinateKey);

      if (coordinatePoints) {
        coordinatePoints.push(point);
      } else {
        pointsByCoordinate.set(coordinateKey, [point]);
      }
    }
  }

  return visibleLanguageSeries.map((series) => ({
    ...series,
    visiblePoints: series.visiblePoints.map((point) => ({
      ...point,
      hoverTitle: formatPointTitleEntries(
        pointsByCoordinate.get(`${point.value}:${point.alphabeticalRank}`) ?? [point],
      ),
    })),
  }));
}

export function getSelectedLanguageColorById(
  languageSeries: LanguageSeries[],
): Map<LanguageId, string> {
  return new Map(
    languageSeries.map((series) => [series.languageId, series.color] as const),
  );
}
