import type {
  AppOptions,
  NumberRange,
  PointDisplayMode,
} from "../../app/types";
import { type LanguageId } from "../../numberLanguages";
import { clampNumber, getRangeCount } from "../rangeUtils";
import {
  ensureHiddenLanguageIds,
  ensureSelectedLanguageIds,
  normalizeAvailableRange,
} from "./shared";

export type AppOptionsAction =
  | {
      type: "setSelectedLanguageIds";
      selectedLanguageIds: LanguageId[];
    }
  | {
      type: "toggleHiddenLanguageId";
      languageId: LanguageId;
    }
  | {
      type: "setPointDisplayMode";
      pointDisplayMode: PointDisplayMode;
    }
  | {
      type: "setShowEqualityLine";
      showEqualityLine: boolean;
    }
  | {
      type: "setShowRangeSliders";
      showRangeSliders: boolean;
    }
  | {
      type: "updateAvailableRange";
      availableRange: NumberRange;
    }
  | {
      type: "setVisibleValueRangeStart";
      start: number;
    }
  | {
      type: "setVisibleValueRangeEnd";
      end: number;
    }
  | {
      type: "setVisibleRankRangeStart";
      start: number;
    }
  | {
      type: "setVisibleRankRangeEnd";
      end: number;
    };

export function appOptionsReducer(
  state: AppOptions,
  action: AppOptionsAction,
): AppOptions {
  switch (action.type) {
    case "setSelectedLanguageIds": {
      const selectedLanguageIds = ensureSelectedLanguageIds(
        action.selectedLanguageIds,
      );

      return {
        ...state,
        selectedLanguageIds,
        hiddenLanguageIds: ensureHiddenLanguageIds(
          state.hiddenLanguageIds,
          selectedLanguageIds,
        ),
      };
    }

    case "toggleHiddenLanguageId": {
      if (!state.selectedLanguageIds.includes(action.languageId)) {
        return state;
      }

      const hiddenLanguageIds = state.hiddenLanguageIds.includes(action.languageId)
        ? state.hiddenLanguageIds.filter(
            (languageId) => languageId !== action.languageId,
          )
        : [...state.hiddenLanguageIds, action.languageId];

      return {
        ...state,
        hiddenLanguageIds,
      };
    }

    case "setPointDisplayMode":
      return {
        ...state,
        pointDisplayMode: action.pointDisplayMode,
      };

    case "setShowEqualityLine":
      return {
        ...state,
        showEqualityLine: action.showEqualityLine,
      };

    case "setShowRangeSliders":
      return {
        ...state,
        showRangeSliders: action.showRangeSliders,
      };

    case "updateAvailableRange": {
      const availableRange = normalizeAvailableRange(action.availableRange);
      const availableCount = getRangeCount(availableRange);

      return {
        ...state,
        availableRange,
        visibleValueRange: { ...availableRange },
        visibleRankRange: {
          start: 1,
          end: availableCount,
        },
      };
    }

    case "setVisibleValueRangeStart":
      return {
        ...state,
        visibleValueRange: {
          ...state.visibleValueRange,
          start: clampNumber(
            action.start,
            state.availableRange.start,
            state.visibleValueRange.end,
          ),
        },
      };

    case "setVisibleValueRangeEnd":
      return {
        ...state,
        visibleValueRange: {
          ...state.visibleValueRange,
          end: clampNumber(
            action.end,
            state.visibleValueRange.start,
            state.availableRange.end,
          ),
        },
      };

    case "setVisibleRankRangeStart": {
      const availableCount = getRangeCount(state.availableRange);

      return {
        ...state,
        visibleRankRange: {
          ...state.visibleRankRange,
          start: clampNumber(action.start, 1, state.visibleRankRange.end),
          end: clampNumber(state.visibleRankRange.end, 1, availableCount),
        },
      };
    }

    case "setVisibleRankRangeEnd": {
      const availableCount = getRangeCount(state.availableRange);

      return {
        ...state,
        visibleRankRange: {
          ...state.visibleRankRange,
          end: clampNumber(
            action.end,
            state.visibleRankRange.start,
            availableCount,
          ),
        },
      };
    }

    default:
      return state;
  }
}
