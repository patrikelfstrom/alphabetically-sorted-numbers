import { describe, expect, it } from "vitest";
import { numberLanguages, resolveLanguageId } from "../../numberLanguages";
import type { LanguageSeries } from "./types";
import {
  buildChartData,
  buildLanguageSeries,
  selectVisibleLanguageSeries,
} from "./series";

describe("buildChartData", () => {
  it("keeps the final tick and equality point for a single-value range", () => {
    expect(
      buildChartData({
        start: 5,
        end: 5,
      }),
    ).toEqual({
      equalityPoints: [
        {
          alphabeticalRank: 1,
          value: 5,
        },
      ],
      xValues: [5],
      xTicks: [5],
      yValues: [1],
      yTicks: [1],
    });
  });

  it("includes the final boundary in both axes for larger ranges", () => {
    const chartData = buildChartData({
      start: 0,
      end: 100,
    });

    expect(chartData.xTicks.at(-1)).toBe(100);
    expect(chartData.yTicks.at(-1)).toBe(101);
    expect(chartData.equalityPoints).toHaveLength(101);
  });
});

describe("selectVisibleLanguageSeries", () => {
  it("filters visible points by both value and alphabetical rank", () => {
    const languageId = resolveLanguageId("en-US");
    const languageSeries = buildLanguageSeries(
      {
        start: 0,
        end: 20,
      },
      [languageId ?? "en-US"],
    );
    const visibleLanguageSeries = selectVisibleLanguageSeries(
      languageSeries,
      {
        start: 0,
        end: 10,
      },
      {
        start: 1,
        end: 5,
      },
    );

    expect(visibleLanguageSeries).toHaveLength(1);
    expect(visibleLanguageSeries[0].visiblePoints.length).toBeGreaterThan(0);
    expect(
      visibleLanguageSeries[0].visiblePoints.every(
        (point) =>
          point.value >= 0 &&
          point.value <= 10 &&
          point.alphabeticalRank >= 1 &&
          point.alphabeticalRank <= 5,
      ),
    ).toBe(true);
  });

  it("shares one hover label across languages that occupy the same coordinate", () => {
    const englishId = resolveLanguageId("en-US") ?? "en-US";
    const swedishId = resolveLanguageId("sv-SE") ?? "sv-SE";
    const languageSeries: LanguageSeries[] = [
      {
        chartData: {
          pointsByValue: new Map([
            [
              2,
              {
                alphabeticalRank: 3,
                languageId: englishId,
                languageLabel: "English",
                name: "two",
                value: 2,
              },
            ],
          ]),
        },
        color: "#67e8f9",
        languageId: englishId,
        languageLabel: "English",
      },
      {
        chartData: {
          pointsByValue: new Map([
            [
              2,
              {
                alphabeticalRank: 3,
                languageId: swedishId,
                languageLabel: "Swedish",
                name: "tva",
                value: 2,
              },
            ],
          ]),
        },
        color: "#fbbf24",
        languageId: swedishId,
        languageLabel: "Swedish",
      },
    ];

    const visibleLanguageSeries = selectVisibleLanguageSeries(
      languageSeries,
      {
        start: 2,
        end: 2,
      },
      {
        start: 3,
        end: 3,
      },
    );

    expect(visibleLanguageSeries[0].visiblePoints[0].hoverTitle).toBe(
      "English: two\nSwedish: tva\nValue: 2\nPosition: 3",
    );
    expect(visibleLanguageSeries[1].visiblePoints[0].hoverTitle).toBe(
      "English: two\nSwedish: tva\nValue: 2\nPosition: 3",
    );
  });
});

describe("buildLanguageSeries", () => {
  it("preserves the selected language order", () => {
    const afrikaansId = resolveLanguageId("af-ZA") ?? "af-ZA";
    const albanianId = resolveLanguageId("sq-AL") ?? "sq-AL";
    const amharicId = resolveLanguageId("am-ET") ?? "am-ET";

    const languageSeries = buildLanguageSeries(
      {
        start: 0,
        end: 5,
      },
      [afrikaansId, amharicId, albanianId],
    );

    expect(languageSeries.map((series) => series.languageLabel)).toEqual([
      "Afrikaans",
      "Amharic",
      "Albanian",
    ]);
  });

  it("spreads hues across the color wheel by selection order", () => {
    const selectedLanguageIds = numberLanguages
      .slice(0, 8)
      .map((language) => language.id);

    const languageSeries = buildLanguageSeries(
      {
        start: 0,
        end: 5,
      },
      selectedLanguageIds,
    );

    expect(languageSeries.map((series) => series.color)).toEqual([
      "oklch(0.8651 0.1153 0)",
      "oklch(0.8651 0.1153 180)",
      "oklch(0.8651 0.1153 90)",
      "oklch(0.8651 0.1153 270)",
      "oklch(0.8651 0.1153 45)",
      "oklch(0.8651 0.1153 225)",
      "oklch(0.8651 0.1153 135)",
      "oklch(0.8651 0.1153 315)",
    ]);
  });

  it("avoids repeating colors across the first dozen languages", () => {
    const selectedLanguageIds = numberLanguages
      .slice(0, 12)
      .map((language) => language.id);

    const languageSeries = buildLanguageSeries(
      {
        start: 0,
        end: 5,
      },
      selectedLanguageIds,
    );
    const colors = languageSeries.map((series) => series.color);

    expect(new Set(colors).size).toBe(colors.length);
  });
});
