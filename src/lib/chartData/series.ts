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

const LANGUAGE_COLOR_LIGHTNESS = 0.8651;
const LANGUAGE_COLOR_CHROMA = 0.16;

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

function getDistributedHue(selectionIndex: number): number {
  let index = selectionIndex;
  let denominator = 2;
  let fraction = 0;

  while (index > 0) {
    fraction += (index % 2) / denominator;
    index = Math.floor(index / 2);
    denominator *= 2;
  }

  return Number((fraction * 360).toFixed(2));
}

function getLanguageColor(selectionIndex: number): string {
  const hue = getDistributedHue(selectionIndex);

  return `oklch(${LANGUAGE_COLOR_LIGHTNESS} ${LANGUAGE_COLOR_CHROMA} ${hue})`;
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
  return selectedLanguageIds.map((languageId, index) => ({
    chartData: buildLanguageChartData(availableRange, languageId),
    color: getLanguageColor(index),
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
