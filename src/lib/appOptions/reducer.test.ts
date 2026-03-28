import { describe, expect, it } from "vitest";
import { appOptionsReducer } from "./reducer";
import { defaultAppOptions } from "./shared";

describe("appOptionsReducer", () => {
  it("resets visible ranges when the available range changes", () => {
    const nextState = appOptionsReducer(
      {
        ...defaultAppOptions,
        visibleValueRange: {
          start: 20,
          end: 30,
        },
        visibleRankRange: {
          start: 3,
          end: 10,
        },
      },
      {
        type: "updateAvailableRange",
        availableRange: {
          start: 12,
          end: 32,
        },
      },
    );

    expect(nextState.availableRange).toEqual({
      start: 12,
      end: 32,
    });
    expect(nextState.visibleValueRange).toEqual({
      start: 12,
      end: 32,
    });
    expect(nextState.visibleRankRange).toEqual({
      start: 1,
      end: 21,
    });
  });

  it("clamps value and rank slider updates against the active domain", () => {
    const baseState = appOptionsReducer(defaultAppOptions, {
      type: "updateAvailableRange",
      availableRange: {
        start: 10,
        end: 20,
      },
    });

    const clampedValueStart = appOptionsReducer(baseState, {
      type: "setVisibleValueRangeStart",
      start: 22,
    });
    const clampedRankEnd = appOptionsReducer(baseState, {
      type: "setVisibleRankRangeEnd",
      end: 99,
    });

    expect(clampedValueStart.visibleValueRange.start).toBe(20);
    expect(clampedRankEnd.visibleRankRange.end).toBe(11);
  });

  it("allows clearing all selected languages", () => {
    const nextState = appOptionsReducer(defaultAppOptions, {
      type: "setSelectedLanguageIds",
      selectedLanguageIds: [],
    });

    expect(nextState.selectedLanguageIds).toEqual([]);
    expect(nextState.hiddenLanguageIds).toEqual([]);
  });

  it("toggles language visibility without removing the selection", () => {
    const hiddenState = appOptionsReducer(defaultAppOptions, {
      type: "toggleHiddenLanguageId",
      languageId: defaultAppOptions.selectedLanguageIds[0],
    });
    const visibleState = appOptionsReducer(hiddenState, {
      type: "toggleHiddenLanguageId",
      languageId: defaultAppOptions.selectedLanguageIds[0],
    });

    expect(hiddenState.selectedLanguageIds).toEqual(
      defaultAppOptions.selectedLanguageIds,
    );
    expect(hiddenState.hiddenLanguageIds).toEqual(
      defaultAppOptions.selectedLanguageIds,
    );
    expect(visibleState.hiddenLanguageIds).toEqual([]);
  });

  it("drops hidden languages when they are removed from the selection", () => {
    const hiddenState = appOptionsReducer(defaultAppOptions, {
      type: "toggleHiddenLanguageId",
      languageId: defaultAppOptions.selectedLanguageIds[0],
    });
    const nextState = appOptionsReducer(hiddenState, {
      type: "setSelectedLanguageIds",
      selectedLanguageIds: [],
    });

    expect(nextState.hiddenLanguageIds).toEqual([]);
  });

  it("updates the range slider visibility preference", () => {
    const nextState = appOptionsReducer(defaultAppOptions, {
      type: "setShowRangeSliders",
      showRangeSliders: false,
    });

    expect(nextState.showRangeSliders).toBe(false);
  });
});
