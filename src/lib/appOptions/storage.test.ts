import { describe, expect, it } from "vitest";
import { resolveLanguageId } from "../../numberLanguages";
import { userOptionsStorageKey } from "./shared";
import { loadStoredAppOptions } from "./storage";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function createStorage(rawValue: string | null): StorageLike {
  let storedValue = rawValue;

  return {
    getItem(key) {
      return key === userOptionsStorageKey ? storedValue : null;
    },
    setItem(key, value) {
      if (key === userOptionsStorageKey) {
        storedValue = value;
      }
    },
  };
}

describe("loadStoredAppOptions", () => {
  it("clamps invalid stored ranges and falls back to defaults", () => {
    const storage = createStorage(
      JSON.stringify({
        availableStart: -12,
        availableEnd: 99999,
        visibleStart: -8,
        visibleEnd: 99999,
        visibleRankStart: 0,
        visibleRankEnd: 99999,
        pointDisplayMode: "unknown",
        showEqualityLine: true,
      }),
    );

    expect(loadStoredAppOptions(storage)).toEqual({
      selectedLanguageIds: [resolveLanguageId("sv-SE")],
      hiddenLanguageIds: [],
      availableRange: {
        start: 0,
        end: 5000,
      },
      visibleValueRange: {
        start: 0,
        end: 5000,
      },
      visibleRankRange: {
        start: 1,
        end: 5001,
      },
      pointDisplayMode: "auto",
      showEqualityLine: true,
      showRangeSliders: true,
    });
  });

  it("prefers normalized multi-select values and ignores invalid entries", () => {
    const storage = createStorage(
      JSON.stringify({
        selectedLanguageIds: ["en-US", "en", "missing-language"],
      }),
    );

    expect(loadStoredAppOptions(storage).selectedLanguageIds).toEqual([
      resolveLanguageId("en-US"),
    ]);
    expect(loadStoredAppOptions(storage).hiddenLanguageIds).toEqual([]);
  });

  it("preserves an explicit empty language selection", () => {
    const storage = createStorage(
      JSON.stringify({
        selectedLanguageIds: [],
      }),
    );

    expect(loadStoredAppOptions(storage).selectedLanguageIds).toEqual([]);
    expect(loadStoredAppOptions(storage).hiddenLanguageIds).toEqual([]);
  });

  it("falls back to the default selection when stored language ids are invalid", () => {
    const storage = createStorage(
      JSON.stringify({
        selectedLanguageIds: ["missing-language"],
      }),
    );

    expect(loadStoredAppOptions(storage).selectedLanguageIds).toEqual([
      resolveLanguageId("sv-SE"),
    ]);
  });

  it("keeps hidden languages only when they are still selected", () => {
    const storage = createStorage(
      JSON.stringify({
        selectedLanguageIds: ["sv-SE", "en-US"],
        hiddenLanguageIds: ["en-US", "fr-FR"],
      }),
    );

    expect(loadStoredAppOptions(storage).hiddenLanguageIds).toEqual([
      resolveLanguageId("en-US"),
    ]);
  });

  it("respects a stored preference to hide the range sliders", () => {
    const storage = createStorage(
      JSON.stringify({
        showRangeSliders: false,
      }),
    );

    expect(loadStoredAppOptions(storage).showRangeSliders).toBe(false);
  });
});
