import { type CSSProperties, useMemo } from "react";
import type { AppOptions, NumberRange, PointDisplayMode } from "../app/types";
import { maxAvailableValue, minAvailableStart } from "../lib/appOptions";
import { getGuideFormulaLabel, type LanguageSeries } from "../lib/chartData";
import {
  getAvailableRangeFromEndInput,
  getAvailableRangeFromStartInput,
  getLanguageOptions,
  getLanguageRemovalLabel,
  getLanguageVisibilityLabel,
  removeSelectedLanguage,
} from "../lib/controlsPanel";
import { type LanguageId } from "../numberLanguages";
import { MultiSelectCombobox } from "./ui/MultiSelectCombobox";

const pointDisplayModeOptions: Array<{
  label: string;
  value: PointDisplayMode;
}> = [
  { label: "Auto", value: "auto" },
  { label: "Cells", value: "cells" },
  { label: "Squares", value: "squares" },
];

type ControlsPanelContentProps = {
  controlsBodyId: string;
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyle: CSSProperties;
  languageSeries: LanguageSeries[];
  options: AppOptions;
  panelAlignment: "left" | "right";
  selectedLanguageColorById: Map<LanguageId, string>;
  setPointDisplayMode: (pointDisplayMode: PointDisplayMode) => void;
  setSelectedLanguageIds: (selectedLanguageIds: LanguageId[]) => void;
  setShowEqualityLine: (showEqualityLine: boolean) => void;
  setShowRangeSliders: (showRangeSliders: boolean) => void;
  toggleHiddenLanguageId: (languageId: LanguageId) => void;
  updateAvailableRange: (availableRange: NumberRange) => void;
};

export function ControlsPanelContent({
  controlsBodyId,
  floatingRef,
  floatingStyle,
  languageSeries,
  options,
  panelAlignment,
  selectedLanguageColorById,
  setPointDisplayMode,
  setSelectedLanguageIds,
  setShowEqualityLine,
  setShowRangeSliders,
  toggleHiddenLanguageId,
  updateAvailableRange,
}: ControlsPanelContentProps) {
  const languageOptions = useMemo(
    () => getLanguageOptions(selectedLanguageColorById),
    [selectedLanguageColorById],
  );
  const displayLabelId = `${controlsBodyId}-display`;
  const hiddenLanguageIdSet = useMemo(
    () => new Set(options.hiddenLanguageIds),
    [options.hiddenLanguageIds],
  );
  const guideFormulaLabel = getGuideFormulaLabel(options.availableRange.start);

  return (
    <section
      className={
        panelAlignment === "right"
          ? "controls-shell controls-shell--floating controls-shell--align-right"
          : "controls-shell controls-shell--floating controls-shell--align-left"
      }
      id={controlsBodyId}
      ref={floatingRef}
      style={floatingStyle}
    >
      <span className="controls-shell__eyebrow">Controls</span>

      <div className="controls-shell__body">
        <div className="controls-shell__top">
          <section className="controls-card" aria-labelledby={`${controlsBodyId}-range`}>
            <span className="controls-card__title" id={`${controlsBodyId}-range`}>
              Range
            </span>
            <div className="controls-card__grid controls-card__grid--range">
              <label className="number-group number-group--from">
                <span>From</span>
                <input
                  className="number-input"
                  max={maxAvailableValue}
                  min={minAvailableStart}
                  onChange={(event) => {
                    updateAvailableRange(
                      getAvailableRangeFromStartInput(
                        event.target.value,
                        options.availableRange.end,
                      ),
                    );
                  }}
                  type="number"
                  value={options.availableRange.start}
                />
              </label>

              <label className="number-group number-group--to">
                <span>To</span>
                <input
                  className="number-input"
                  max={maxAvailableValue}
                  min={minAvailableStart}
                  onChange={(event) => {
                    updateAvailableRange(
                      getAvailableRangeFromEndInput(
                        event.target.value,
                        options.availableRange.start,
                      ),
                    );
                  }}
                  type="number"
                  value={options.availableRange.end}
                />
              </label>

              <label className="number-group number-group--toggle-row">
                <span>Range sliders</span>
                <span className="toggle-switch">
                  <input
                    checked={options.showRangeSliders}
                    className="toggle-switch__input"
                    onChange={(event) => {
                      setShowRangeSliders(event.target.checked);
                    }}
                    type="checkbox"
                  />
                  <span className="toggle-switch__control" aria-hidden="true">
                    <span className="toggle-switch__thumb" />
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="controls-card" aria-labelledby={`${controlsBodyId}-view`}>
            <span className="controls-card__title" id={`${controlsBodyId}-view`}>
              View
            </span>
            <div className="controls-card__grid controls-card__grid--view">
              <div className="number-group number-group--display">
                <span id={displayLabelId}>Display</span>
                <div
                  aria-labelledby={displayLabelId}
                  className="segmented-control"
                  role="radiogroup"
                >
                  {pointDisplayModeOptions.map((option) => {
                    const isActive = option.value === options.pointDisplayMode;

                    return (
                      <button
                        aria-checked={isActive}
                        className={
                          isActive
                            ? "segmented-control__button segmented-control__button--active"
                            : "segmented-control__button"
                        }
                        key={option.value}
                        onClick={() => {
                          setPointDisplayMode(option.value);
                        }}
                        role="radio"
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="number-group number-group--toggle-row">
                <span>{guideFormulaLabel}</span>
                <span className="toggle-switch">
                  <input
                    checked={options.showEqualityLine}
                    className="toggle-switch__input"
                    onChange={(event) => {
                      setShowEqualityLine(event.target.checked);
                    }}
                    type="checkbox"
                  />
                  <span className="toggle-switch__control" aria-hidden="true">
                    <span className="toggle-switch__thumb" />
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <section className="controls-card" aria-labelledby={`${controlsBodyId}-language`}>
          <div className="controls-card__header">
            <span className="controls-card__title" id={`${controlsBodyId}-language`}>
              Language
            </span>
          </div>
          <div className="number-group number-group--language">
            <MultiSelectCombobox
              emptyText="No languages match your search."
              onValueChange={(nextValues) => {
                setSelectedLanguageIds(nextValues as LanguageId[]);
              }}
              options={languageOptions}
              placeholder="Choose one or more languages"
              searchPlaceholder="Search languages..."
              selectAllLabel="Select all languages"
              value={options.selectedLanguageIds}
            />
          </div>
          <div className="language-legend" aria-label="Selected language overlays">
            {languageSeries.map((series) => {
              const isHidden = hiddenLanguageIdSet.has(series.languageId);

              return (
                <div
                  className={
                    isHidden
                      ? "language-legend__item language-legend__item--hidden"
                      : "language-legend__item"
                  }
                  key={series.languageId}
                  style={{ "--language-color": series.color } as CSSProperties}
                >
                  <button
                    aria-label={getLanguageVisibilityLabel(
                      isHidden,
                      series.languageLabel,
                    )}
                    aria-pressed={!isHidden}
                    className="language-legend__toggle"
                    onClick={() => {
                      toggleHiddenLanguageId(series.languageId);
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className="language-legend__swatch" />
                    <span className="language-legend__label">
                      {series.languageLabel}
                    </span>
                  </button>
                  <button
                    aria-label={getLanguageRemovalLabel(series.languageLabel)}
                    className="language-legend__remove"
                    onClick={() => {
                      setSelectedLanguageIds(
                        removeSelectedLanguage(
                          options.selectedLanguageIds,
                          series.languageId,
                        ),
                      );
                    }}
                    type="button"
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}
