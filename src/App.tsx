import { useDeferredValue, useMemo, useRef, useState } from "react";
import "./app/AppShell.css";
import { ControlsPanel } from "./components/ControlsPanel";
import { PlotPanel } from "./components/PlotPanel";
import { useAppPreferences } from "./hooks/useAppPreferences";
import { usePlotSize } from "./hooks/usePlotSize";
import {
  buildChartData,
  buildLanguageSeries,
  getSelectedLanguageColorById,
  selectVisibleLanguageSeries,
} from "./lib/chartData";

function App() {
  const appShellRef = useRef<HTMLElement | null>(null);
  const plotStageRef = useRef<HTMLDivElement | null>(null);
  const {
    options,
    setPointDisplayMode,
    setSelectedLanguageIds,
    setShowEqualityLine,
    setShowRangeSliders,
    toggleHiddenLanguageId,
    setVisibleRankRangeEnd,
    setVisibleRankRangeStart,
    setVisibleValueRangeEnd,
    setVisibleValueRangeStart,
    updateAvailableRange,
  } = useAppPreferences();
  const { plotRangeRef, plotSize } = usePlotSize(options.showRangeSliders);
  const [controlsMinimized, setControlsMinimized] = useState(false);
  const deferredVisibleValueStart = useDeferredValue(
    options.visibleValueRange.start,
  );
  const deferredVisibleValueEnd = useDeferredValue(
    options.visibleValueRange.end,
  );
  const deferredVisibleRankStart = useDeferredValue(
    options.visibleRankRange.start,
  );
  const deferredVisibleRankEnd = useDeferredValue(options.visibleRankRange.end);

  const chartData = useMemo(
    () => buildChartData(options.availableRange),
    [options.availableRange],
  );
  const languageSeries = useMemo(
    () =>
      buildLanguageSeries(options.availableRange, options.selectedLanguageIds),
    [options.availableRange, options.selectedLanguageIds],
  );
  const hiddenLanguageIdSet = useMemo(
    () => new Set(options.hiddenLanguageIds),
    [options.hiddenLanguageIds],
  );
  const visibleLanguageSeries = useMemo(
    () =>
      selectVisibleLanguageSeries(
        languageSeries.filter(
          (series) => !hiddenLanguageIdSet.has(series.languageId),
        ),
        {
          start: deferredVisibleValueStart,
          end: deferredVisibleValueEnd,
        },
        {
          start: deferredVisibleRankStart,
          end: deferredVisibleRankEnd,
        },
      ),
    [
      deferredVisibleRankEnd,
      deferredVisibleRankStart,
      deferredVisibleValueEnd,
      deferredVisibleValueStart,
      hiddenLanguageIdSet,
      languageSeries,
    ],
  );
  const selectedLanguageColorById = useMemo(
    () => getSelectedLanguageColorById(languageSeries),
    [languageSeries],
  );

  return (
    <main className="app-shell" ref={appShellRef}>
      <div className="app-shell__controls">
        <ControlsPanel
          controlsMinimized={controlsMinimized}
          defaultAnchorRef={plotStageRef}
          dragBoundsRef={appShellRef}
          languageSeries={languageSeries}
          options={options}
          plotSize={plotSize}
          selectedLanguageColorById={selectedLanguageColorById}
          setControlsMinimized={setControlsMinimized}
          setPointDisplayMode={setPointDisplayMode}
          setSelectedLanguageIds={setSelectedLanguageIds}
          setShowEqualityLine={setShowEqualityLine}
          setShowRangeSliders={setShowRangeSliders}
          toggleHiddenLanguageId={toggleHiddenLanguageId}
          updateAvailableRange={updateAvailableRange}
        />
      </div>
      <div className="plot-stage" ref={plotStageRef}>
        <PlotPanel
          chartData={chartData}
          options={options}
          plotRangeRef={plotRangeRef}
          plotSize={plotSize}
          setVisibleRankRangeEnd={setVisibleRankRangeEnd}
          setVisibleRankRangeStart={setVisibleRankRangeStart}
          setVisibleValueRangeEnd={setVisibleValueRangeEnd}
          setVisibleValueRangeStart={setVisibleValueRangeStart}
          visibleLanguageSeries={visibleLanguageSeries}
        />
      </div>
    </main>
  );
}

export default App;
