import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { type CSSProperties, useEffect, useMemo, useRef } from "react";
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

const panelTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

const panelExitTransition = {
  duration: 0.16,
  ease: [0.4, 0, 1, 1],
} as const;

const sectionTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

const segmentedControlTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;

const legendItemTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const;

const floatingPositionTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;

type FloatingPosition = {
  left: number;
  position: CSSProperties["position"];
  top: number;
};

type ControlsPanelContentProps = {
  controlsBodyId: string;
  controlsPinned: boolean;
  floatingRef: (node: HTMLElement | null) => void;
  floatingPlacement: string;
  floatingPosition: FloatingPosition | null;
  languageSeries: LanguageSeries[];
  options: AppOptions;
  panelAlignment: "left" | "right";
  selectedLanguageColorById: Map<LanguageId, string>;
  setControlsPinned: (controlsPinned: boolean) => void;
  setPointDisplayMode: (pointDisplayMode: PointDisplayMode) => void;
  setSelectedLanguageIds: (selectedLanguageIds: LanguageId[]) => void;
  setShowEqualityLine: (showEqualityLine: boolean) => void;
  setShowRangeSliders: (showRangeSliders: boolean) => void;
  toggleHiddenLanguageId: (languageId: LanguageId) => void;
  updateAvailableRange: (availableRange: NumberRange) => void;
};

export function ControlsPanelContent({
  controlsBodyId,
  controlsPinned,
  floatingRef,
  floatingPlacement,
  floatingPosition,
  languageSeries,
  options,
  panelAlignment,
  selectedLanguageColorById,
  setControlsPinned,
  setPointDisplayMode,
  setSelectedLanguageIds,
  setShowEqualityLine,
  setShowRangeSliders,
  toggleHiddenLanguageId,
  updateAvailableRange,
}: ControlsPanelContentProps) {
  const prefersReducedMotion = useReducedMotion();
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
  const activePointDisplayModeIndex = pointDisplayModeOptions.findIndex(
    (option) => option.value === options.pointDisplayMode,
  );
  const previousFloatingPlacementRef = useRef(floatingPlacement);
  const previousFloatingPositionRef = useRef<FloatingPosition | null>(null);
  const floatingFlipOffsetX = useMotionValue(0);
  const floatingFlipOffsetY = useMotionValue(0);
  const floatingFlipAnimationXRef = useRef<ReturnType<typeof animate> | null>(null);
  const floatingFlipAnimationYRef = useRef<ReturnType<typeof animate> | null>(null);
  const panelMotion = prefersReducedMotion
    ? {
        animate: { opacity: 1 },
        exit: {
          opacity: 0,
          transition: panelExitTransition,
        },
        initial: { opacity: 0 },
      }
    : {
        animate: {
          filter: "blur(0px)",
          opacity: 1,
          scale: 1,
          y: 0,
        },
        exit: {
          filter: "blur(8px)",
          opacity: 0,
          scale: 0.98,
          transition: panelExitTransition,
          y: -10,
        },
        initial: {
          filter: "blur(10px)",
          opacity: 0,
          scale: 0.965,
          y: -14,
        },
      };
  const sectionMotion = prefersReducedMotion
    ? {
        animate: { opacity: 1 },
        initial: { opacity: 1 },
      }
    : {
        animate: { opacity: 1, y: 0 },
        initial: { opacity: 0, y: 8 },
      };
  useEffect(() => {
    if (floatingPosition === null) {
      previousFloatingPlacementRef.current = floatingPlacement;
      previousFloatingPositionRef.current = null;
      floatingFlipAnimationXRef.current?.stop();
      floatingFlipAnimationYRef.current?.stop();
      floatingFlipOffsetX.set(0);
      floatingFlipOffsetY.set(0);
      return;
    }

    const previousFloatingPosition = previousFloatingPositionRef.current;
    const placementChanged =
      previousFloatingPlacementRef.current !== floatingPlacement;

    if (placementChanged && previousFloatingPosition !== null) {
      floatingFlipAnimationXRef.current?.stop();
      floatingFlipAnimationYRef.current?.stop();

      floatingFlipOffsetX.set(
        previousFloatingPosition.left - floatingPosition.left,
      );
      floatingFlipOffsetY.set(
        previousFloatingPosition.top - floatingPosition.top,
      );

      if (prefersReducedMotion) {
        floatingFlipOffsetX.set(0);
        floatingFlipOffsetY.set(0);
      } else {
        floatingFlipAnimationXRef.current = animate(
          floatingFlipOffsetX,
          0,
          floatingPositionTransition,
        );
        floatingFlipAnimationYRef.current = animate(
          floatingFlipOffsetY,
          0,
          floatingPositionTransition,
        );
      }
    }

    previousFloatingPlacementRef.current = floatingPlacement;
    previousFloatingPositionRef.current = floatingPosition;
  }, [
    floatingFlipOffsetX,
    floatingFlipOffsetY,
    floatingPlacement,
    floatingPosition,
    prefersReducedMotion,
  ]);

  return (
    <div
      className="controls-shell__floating-layer"
      ref={floatingRef}
      style={{
        left: floatingPosition?.left ?? 0,
        position: floatingPosition?.position ?? "fixed",
        top: floatingPosition?.top ?? 0,
        visibility: floatingPosition === null ? "hidden" : "visible",
      }}
    >
      <motion.div style={{ x: floatingFlipOffsetX, y: floatingFlipOffsetY }}>
        <motion.section
        animate={panelMotion.animate}
        className={
          panelAlignment === "right"
            ? "controls-shell controls-shell--floating controls-shell--align-right"
            : "controls-shell controls-shell--floating controls-shell--align-left"
        }
        exit={panelMotion.exit}
        id={controlsBodyId}
        initial={panelMotion.initial}
        transition={panelTransition}
      >
        <motion.div
          animate={sectionMotion.animate}
          className="controls-shell__eyebrow-row"
          initial={sectionMotion.initial}
          transition={sectionTransition}
        >
          <span className="controls-shell__eyebrow">Controls</span>
          <button
            aria-label={controlsPinned ? "Unpin controls panel" : "Pin controls panel"}
            aria-pressed={controlsPinned}
            className={
              controlsPinned
                ? "controls-shell__pin-toggle controls-shell__pin-toggle--active"
                : "controls-shell__pin-toggle"
            }
            onClick={() => {
              setControlsPinned(!controlsPinned);
            }}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="controls-shell__pin-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M10.95 1.75a.75.75 0 0 1 .53 1.28L10.3 4.22l1.48 3.05a.75.75 0 0 1-.7 1.08H8.74L8.2 13.9a.75.75 0 0 1-1.48 0l-.54-5.55H3.83a.75.75 0 0 1-.7-1.08L4.6 4.22 3.42 3.03a.75.75 0 0 1 .53-1.28z"
                fill="currentColor"
              />
            </svg>
          </button>
        </motion.div>

        <div className="controls-shell__body">
          <motion.div
            animate={sectionMotion.animate}
            className="controls-shell__top"
            initial={sectionMotion.initial}
            transition={sectionTransition}
          >
            <section
              aria-labelledby={`${controlsBodyId}-range`}
              className="controls-card"
            >
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

            <section
              aria-labelledby={`${controlsBodyId}-view`}
              className="controls-card"
            >
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
                    <motion.span
                      animate={{
                        left: `calc(var(--segmented-control-padding) + ${Math.max(
                          0,
                          activePointDisplayModeIndex,
                        )} * (var(--segmented-control-pill-width) + var(--segmented-control-gap)))`,
                      }}
                      aria-hidden="true"
                      className="segmented-control__active-pill"
                      initial={false}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : segmentedControlTransition
                      }
                    />
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
                          <span className="segmented-control__label">
                            {option.label}
                          </span>
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
          </motion.div>

          <motion.section
            animate={sectionMotion.animate}
            aria-labelledby={`${controlsBodyId}-language`}
            className="controls-card"
            initial={sectionMotion.initial}
            transition={{
              ...sectionTransition,
              delay: prefersReducedMotion ? 0 : 0.03,
            }}
          >
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
              <AnimatePresence initial={false}>
                {languageSeries.map((series) => {
                  const isHidden = hiddenLanguageIdSet.has(series.languageId);

                  return (
                    <motion.div
                      animate={
                        isHidden
                          ? {
                              filter: "saturate(0.55)",
                              opacity: 0.5,
                              scale: 0.97,
                            }
                          : {
                              filter: "saturate(1)",
                              opacity: 1,
                              scale: 1,
                            }
                      }
                      className={
                        isHidden
                          ? "language-legend__item language-legend__item--hidden"
                          : "language-legend__item"
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.92,
                            }
                      }
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : {
                              opacity: 0,
                              scale: 0.92,
                            }
                      }
                      key={series.languageId}
                      style={{ "--language-color": series.color } as CSSProperties}
                      transition={
                        prefersReducedMotion ? { duration: 0 } : legendItemTransition
                      }
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
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
