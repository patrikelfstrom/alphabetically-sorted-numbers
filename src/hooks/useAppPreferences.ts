import { useEffect, useReducer } from "react";
import type { NumberRange, PointDisplayMode } from "../app/types";
import {
  appOptionsReducer,
  loadStoredAppOptions,
  saveStoredAppOptions,
} from "../lib/appOptions";
import type { LanguageId } from "../numberLanguages";

export function useAppPreferences() {
  const [options, dispatch] = useReducer(
    appOptionsReducer,
    undefined,
    loadStoredAppOptions,
  );

  useEffect(() => {
    saveStoredAppOptions(options);
  }, [options]);

  return {
    options,
    setSelectedLanguageIds(selectedLanguageIds: LanguageId[]) {
      dispatch({
        type: "setSelectedLanguageIds",
        selectedLanguageIds,
      });
    },
    toggleHiddenLanguageId(languageId: LanguageId) {
      dispatch({
        type: "toggleHiddenLanguageId",
        languageId,
      });
    },
    setPointDisplayMode(pointDisplayMode: PointDisplayMode) {
      dispatch({
        type: "setPointDisplayMode",
        pointDisplayMode,
      });
    },
    setShowEqualityLine(showEqualityLine: boolean) {
      dispatch({
        type: "setShowEqualityLine",
        showEqualityLine,
      });
    },
    setShowRangeSliders(showRangeSliders: boolean) {
      dispatch({
        type: "setShowRangeSliders",
        showRangeSliders,
      });
    },
    updateAvailableRange(availableRange: NumberRange) {
      dispatch({
        type: "updateAvailableRange",
        availableRange,
      });
    },
    setVisibleValueRangeStart(start: number) {
      dispatch({
        type: "setVisibleValueRangeStart",
        start,
      });
    },
    setVisibleValueRangeEnd(end: number) {
      dispatch({
        type: "setVisibleValueRangeEnd",
        end,
      });
    },
    setVisibleRankRangeStart(start: number) {
      dispatch({
        type: "setVisibleRankRangeStart",
        start,
      });
    },
    setVisibleRankRangeEnd(end: number) {
      dispatch({
        type: "setVisibleRankRangeEnd",
        end,
      });
    },
  };
}
