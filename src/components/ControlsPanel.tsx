import { motion } from "motion/react";
import { type RefObject, useEffect, useId, useRef } from "react";
import type { AppOptions, NumberRange, PointDisplayMode } from "../app/types";
import type { LanguageSeries } from "../lib/chartData";
import "./ControlsPanel.css";
import { useFloatingControls } from "../hooks/useFloatingControls";
import { type LanguageId } from "../numberLanguages";
import { ControlsPanelContent } from "./ControlsPanelContent";

const floatingButtonDragTransition = {
  bounceDamping: 15,
  bounceStiffness: 440,
  power: 0.3,
  timeConstant: 150,
} as const;

type ControlsPanelProps = {
  controlsMinimized: boolean;
  defaultAnchorRef: RefObject<HTMLElement | null>;
  dragBoundsRef: RefObject<HTMLElement | null>;
  languageSeries: LanguageSeries[];
  options: AppOptions;
  plotSize: number;
  selectedLanguageColorById: Map<LanguageId, string>;
  setControlsMinimized: (controlsMinimized: boolean) => void;
  setPointDisplayMode: (pointDisplayMode: PointDisplayMode) => void;
  setSelectedLanguageIds: (selectedLanguageIds: LanguageId[]) => void;
  setShowEqualityLine: (showEqualityLine: boolean) => void;
  setShowRangeSliders: (showRangeSliders: boolean) => void;
  toggleHiddenLanguageId: (languageId: LanguageId) => void;
  updateAvailableRange: (availableRange: NumberRange) => void;
};

export function ControlsPanel({
  controlsMinimized,
  defaultAnchorRef,
  dragBoundsRef,
  languageSeries,
  options,
  plotSize,
  selectedLanguageColorById,
  setControlsMinimized,
  setPointDisplayMode,
  setSelectedLanguageIds,
  setShowEqualityLine,
  setShowRangeSliders,
  toggleHiddenLanguageId,
  updateAvailableRange,
}: ControlsPanelProps) {
  const controlsBodyId = useId();
  const floatingPanelRef = useRef<HTMLElement | null>(null);
  const floatingToggleRef = useRef<HTMLButtonElement | null>(null);
  const {
    dragControls,
    floatingStyles,
    handleButtonPointerDown,
    handleDrag,
    handleDragEnd,
    handleDragStart,
    panelAlignment,
    setFloating,
    setReference,
    shellStyle,
    shouldSuppressToggle,
  } = useFloatingControls({
    controlsMinimized,
    defaultAnchorRef,
    dragBoundsRef,
    plotSize,
  });

  useEffect(() => {
    if (controlsMinimized) {
      return;
    }

    function handleDocumentPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const eventPath = event.composedPath();
      const clickedInsidePanel =
        (floatingPanelRef.current !== null &&
          eventPath.includes(floatingPanelRef.current)) ||
        floatingPanelRef.current?.contains(target);
      const clickedToggle =
        (floatingToggleRef.current !== null &&
          eventPath.includes(floatingToggleRef.current)) ||
        floatingToggleRef.current?.contains(target);

      if (clickedInsidePanel || clickedToggle) {
        return;
      }

      if (
        target instanceof Element &&
        target.closest("[data-controls-panel-interactive-root='true']")
      ) {
        return;
      }

      setControlsMinimized(true);
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [controlsMinimized, setControlsMinimized]);

  return (
    <>
      <motion.div
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="controls-floating-shell"
        drag
        dragControls={dragControls}
        dragConstraints={dragBoundsRef}
        dragElastic={0.16}
        dragListener={false}
        dragTransition={floatingButtonDragTransition}
        initial={{
          opacity: 0,
          scale: 0.94,
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        style={shellStyle}
        whileDrag={{
          scale: 1.05,
          boxShadow: "0 22px 54px rgba(0, 0, 0, 0.34)",
        }}
      >
        <button
          aria-controls={controlsBodyId}
          aria-expanded={!controlsMinimized}
          className="controls-shell__floating-toggle"
          onClick={() => {
            if (shouldSuppressToggle()) {
              return;
            }

            setControlsMinimized(!controlsMinimized);
          }}
          onPointerDown={handleButtonPointerDown}
          ref={(node) => {
            floatingToggleRef.current = node;
            setReference(node);
          }}
          type="button"
        >
          {controlsMinimized ? "Show controls" : "Hide controls"}
        </button>
      </motion.div>

      {controlsMinimized ? null : (
        <ControlsPanelContent
          controlsBodyId={controlsBodyId}
          floatingRef={(node) => {
            floatingPanelRef.current = node;
            setFloating(node);
          }}
          floatingStyle={floatingStyles}
          languageSeries={languageSeries}
          options={options}
          panelAlignment={panelAlignment}
          selectedLanguageColorById={selectedLanguageColorById}
          setPointDisplayMode={setPointDisplayMode}
          setSelectedLanguageIds={setSelectedLanguageIds}
          setShowEqualityLine={setShowEqualityLine}
          setShowRangeSliders={setShowRangeSliders}
          toggleHiddenLanguageId={toggleHiddenLanguageId}
          updateAvailableRange={updateAvailableRange}
        />
      )}
    </>
  );
}
