import type { AppOptions, PointDisplayMode } from "../../app/types";
import { type LanguageId, resolveLanguageId } from "../../numberLanguages";
import { clampNumber, getRangeCount } from "../rangeUtils";
import {
  defaultAvailableRange,
  ensureHiddenLanguageIds,
  getDefaultAppOptions,
  normalizeAvailableRange,
  userOptionsStorageKey,
} from "./shared";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

type StoredUserOptions = {
  selectedLanguageIds?: unknown;
  hiddenLanguageIds?: unknown;
  availableStart?: unknown;
  availableEnd?: unknown;
  visibleStart?: unknown;
  visibleEnd?: unknown;
  visibleRankStart?: unknown;
  visibleRankEnd?: unknown;
  pointDisplayMode?: unknown;
  showEqualityLine?: unknown;
};

function normalizeStoredLanguageId(value: unknown): LanguageId | null {
  if (typeof value !== "string") {
    return null;
  }

  return resolveLanguageId(value);
}

function getStoredLanguageIds(value: unknown): LanguageId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => normalizeStoredLanguageId(entry))
        .filter((entry): entry is LanguageId => entry !== null),
    ),
  );
}

function getStoredSelectedLanguageIds(value: unknown): LanguageId[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const selectedLanguageIds = getStoredLanguageIds(value);

  return selectedLanguageIds.length > 0 || value.length === 0
    ? selectedLanguageIds
    : null;
}

function getStoredNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : fallback;
}

function isPointDisplayMode(value: unknown): value is PointDisplayMode {
  return value === "auto" || value === "cells" || value === "squares";
}

function getLocalStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function loadStoredAppOptions(
  storage: StorageLike | null = getLocalStorage(),
): AppOptions {
  if (!storage) {
    return getDefaultAppOptions();
  }

  try {
    const rawValue = storage.getItem(userOptionsStorageKey);

    if (!rawValue) {
      return getDefaultAppOptions();
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== "object") {
      return getDefaultAppOptions();
    }

    const parsedOptions = parsedValue as StoredUserOptions;
    const selectedLanguageIds =
      getStoredSelectedLanguageIds(parsedOptions.selectedLanguageIds) ??
      getDefaultAppOptions().selectedLanguageIds;
    const hiddenLanguageIds = ensureHiddenLanguageIds(
      getStoredLanguageIds(parsedOptions.hiddenLanguageIds),
      selectedLanguageIds,
    );
    const availableRange = normalizeAvailableRange({
      start: getStoredNumber(
        parsedOptions.availableStart,
        defaultAvailableRange.start,
      ),
      end: getStoredNumber(parsedOptions.availableEnd, defaultAvailableRange.end),
    });
    const availableCount = getRangeCount(availableRange);
    const visibleValueRange = {
      start: clampNumber(
        getStoredNumber(parsedOptions.visibleStart, availableRange.start),
        availableRange.start,
        availableRange.end,
      ),
      end: clampNumber(
        getStoredNumber(parsedOptions.visibleEnd, availableRange.end),
        availableRange.start,
        availableRange.end,
      ),
    };
    visibleValueRange.end = Math.max(visibleValueRange.start, visibleValueRange.end);

    const visibleRankRange = {
      start: clampNumber(
        getStoredNumber(parsedOptions.visibleRankStart, 1),
        1,
        availableCount,
      ),
      end: clampNumber(
        getStoredNumber(parsedOptions.visibleRankEnd, availableCount),
        1,
        availableCount,
      ),
    };
    visibleRankRange.end = Math.max(visibleRankRange.start, visibleRankRange.end);

    return {
      selectedLanguageIds,
      hiddenLanguageIds,
      availableRange,
      visibleValueRange,
      visibleRankRange,
      pointDisplayMode: isPointDisplayMode(parsedOptions.pointDisplayMode)
        ? parsedOptions.pointDisplayMode
        : "auto",
      showEqualityLine: parsedOptions.showEqualityLine === true,
    };
  } catch {
    return getDefaultAppOptions();
  }
}

export function serializeAppOptions(options: AppOptions): StoredUserOptions {
  return {
    selectedLanguageIds: options.selectedLanguageIds,
    hiddenLanguageIds: options.hiddenLanguageIds,
    availableStart: options.availableRange.start,
    availableEnd: options.availableRange.end,
    visibleStart: options.visibleValueRange.start,
    visibleEnd: options.visibleValueRange.end,
    visibleRankStart: options.visibleRankRange.start,
    visibleRankEnd: options.visibleRankRange.end,
    pointDisplayMode: options.pointDisplayMode,
    showEqualityLine: options.showEqualityLine,
  };
}

export function saveStoredAppOptions(
  options: AppOptions,
  storage: StorageLike | null = getLocalStorage(),
): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      userOptionsStorageKey,
      JSON.stringify(serializeAppOptions(options)),
    );
  } catch {
    // Ignore storage write failures so the app stays usable in restricted contexts.
  }
}
