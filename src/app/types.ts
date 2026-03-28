import type { LanguageId } from "../numberLanguages";

export type NumberRange = {
  start: number;
  end: number;
};

export type PointDisplayMode = "auto" | "cells" | "squares";

export type AppOptions = {
  selectedLanguageIds: LanguageId[];
  hiddenLanguageIds: LanguageId[];
  availableRange: NumberRange;
  visibleValueRange: NumberRange;
  visibleRankRange: NumberRange;
  pointDisplayMode: PointDisplayMode;
  showEqualityLine: boolean;
  showRangeSliders: boolean;
};
