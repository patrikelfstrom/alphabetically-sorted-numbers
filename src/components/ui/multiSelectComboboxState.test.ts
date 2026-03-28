import { describe, expect, it } from "vitest";
import {
  areAllOptionsSelected,
  getNextValues,
  getToggleAllValues,
} from "./multiSelectComboboxState";

describe("multiSelectComboboxState", () => {
  it("adds and removes individual selections while respecting the minimum", () => {
    expect(getNextValues(["sv"], "en", 1)).toEqual(["sv", "en"]);
    expect(getNextValues(["sv", "en"], "en", 1)).toEqual(["sv"]);
    expect(getNextValues(["sv"], "sv", 1)).toEqual(["sv"]);
  });

  it("detects when every option is selected", () => {
    expect(areAllOptionsSelected(["sv", "en"], ["sv", "en", "fr"])).toBe(
      false,
    );
    expect(
      areAllOptionsSelected(["sv", "en", "fr"], ["sv", "en", "fr"]),
    ).toBe(true);
  });

  it("selects every option when toggled from a partial selection", () => {
    expect(
      getToggleAllValues({
        currentValues: ["sv"],
        minSelected: 1,
        optionValues: ["sv", "en", "fr"],
      }),
    ).toEqual(["sv", "en", "fr"]);
  });

  it("clears every option when toggled off and zero selections are allowed", () => {
    expect(
      getToggleAllValues({
        currentValues: ["sv", "en", "fr"],
        minSelected: 0,
        optionValues: ["sv", "en", "fr"],
      }),
    ).toEqual([]);
  });

  it("falls back to the minimum allowed selection when no prior state exists", () => {
    expect(
      getToggleAllValues({
        currentValues: ["sv", "en", "fr"],
        minSelected: 1,
        optionValues: ["sv", "en", "fr"],
      }),
    ).toEqual(["sv"]);
  });

  it("keeps the minimum selection anchored to available options when clearing all", () => {
    expect(
      getToggleAllValues({
        currentValues: ["missing", "fr", "en", "sv"],
        minSelected: 2,
        optionValues: ["sv", "en", "fr"],
      }),
    ).toEqual(["sv", "en"]);
  });
});
