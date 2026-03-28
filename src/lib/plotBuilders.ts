import * as Plot from "@observablehq/plot";
import {
  getPointTitle,
  type ChartData,
  type PlotLayout,
  type PointRendering,
  type VisibleLanguageSeries,
} from "./chartData";

type BasePlotParams = {
  chartData: ChartData;
  layout: PlotLayout;
  plotSize: number;
};

type EqualityPlotParams = BasePlotParams & {
  showEqualityLine: boolean;
};

type LanguageSeriesPlotParams = BasePlotParams & {
  pointRendering: PointRendering;
  visibleLanguageSeries: VisibleLanguageSeries[];
};

function createVisiblePointMark(
  visibleLanguageSeries: VisibleLanguageSeries,
  pointRendering: PointRendering,
) {
  if (pointRendering.useCompactSquares) {
    return Plot.dot(visibleLanguageSeries.visiblePoints, {
      x: "value",
      y: "alphabeticalRank",
      fill: visibleLanguageSeries.color,
      fillOpacity: 0.44,
      mixBlendMode: "screen",
      symbol: "square",
      stroke: visibleLanguageSeries.color,
      strokeOpacity: 0.9,
      strokeWidth: 0.45,
      r: pointRendering.radius,
      title: getPointTitle,
    });
  }

  return Plot.cell(visibleLanguageSeries.visiblePoints, {
    x: "value",
    y: "alphabeticalRank",
    fill: visibleLanguageSeries.color,
    fillOpacity: 0.44,
    inset: 0.8,
    mixBlendMode: "screen",
    stroke: visibleLanguageSeries.color,
    strokeOpacity: 0.9,
    strokeWidth: 0.45,
    title: getPointTitle,
  });
}

export function createBasePlot({
  chartData,
  layout,
  plotSize,
}: BasePlotParams) {
  return Plot.plot({
    width: plotSize,
    height: plotSize,
    marginTop: layout.marginPad,
    marginRight: layout.marginPad,
    marginBottom: layout.axisPad,
    marginLeft: layout.axisPad,
    style: {
      background: "transparent",
      color: "#f2f4ff",
      fontFamily: "var(--font-body)",
      fontSize: `${Math.max(10, Math.round(plotSize * 0.011))}px`,
      overflow: "visible",
    },
    x: {
      type: "band",
      label: "Number value",
      domain: chartData.xValues,
      padding: 0,
      round: false,
      tickSize: 0,
      ticks: chartData.xTicks,
    },
    y: {
      type: "band",
      label: "Alphabetical position",
      domain: chartData.yValues,
      padding: 0,
      round: false,
      reverse: true,
      tickSize: 0,
      ticks: chartData.yTicks,
    },
    marks: [
      Plot.frame({
        inset: 0,
        stroke: "rgba(200, 212, 255, 0.22)",
        strokeWidth: 1,
      }),
    ],
  });
}

export function createEqualityPlot({
  chartData,
  layout,
  plotSize,
  showEqualityLine,
}: EqualityPlotParams) {
  return Plot.plot({
    width: plotSize,
    height: plotSize,
    marginTop: layout.marginPad,
    marginRight: layout.marginPad,
    marginBottom: layout.axisPad,
    marginLeft: layout.axisPad,
    style: {
      background: "transparent",
      fontFamily: "var(--font-body)",
      overflow: "visible",
    },
    x: {
      type: "band",
      axis: null,
      domain: chartData.xValues,
      padding: 0,
      round: false,
    },
    y: {
      type: "band",
      axis: null,
      domain: chartData.yValues,
      padding: 0,
      round: false,
      reverse: true,
    },
    marks: [
      ...(showEqualityLine && chartData.equalityPoints.length > 1
        ? [
            Plot.line(chartData.equalityPoints, {
              x: "value",
              y: "alphabeticalRank",
              stroke: "#ffd27a",
              strokeWidth: Math.max(2, plotSize * 0.0032),
              strokeOpacity: 0.92,
              strokeDasharray: "8 6",
            }),
          ]
        : []),
      ...(showEqualityLine && chartData.equalityPoints.length === 1
        ? [
            Plot.dot(chartData.equalityPoints, {
              x: "value",
              y: "alphabeticalRank",
              fill: "#ffd27a",
              r: Math.max(4, plotSize * 0.0075),
            }),
          ]
        : []),
    ],
  });
}

export function createLanguageSeriesPlot({
  chartData,
  layout,
  plotSize,
  pointRendering,
  visibleLanguageSeries,
}: LanguageSeriesPlotParams) {
  return Plot.plot({
    width: plotSize,
    height: plotSize,
    marginTop: layout.marginPad,
    marginRight: layout.marginPad,
    marginBottom: layout.axisPad,
    marginLeft: layout.axisPad,
    style: {
      background: "transparent",
      fontFamily: "var(--font-body)",
      overflow: "visible",
    },
    x: {
      type: "band",
      axis: null,
      domain: chartData.xValues,
      padding: 0,
      round: false,
    },
    y: {
      type: "band",
      axis: null,
      domain: chartData.yValues,
      padding: 0,
      round: false,
      reverse: true,
    },
    marks: visibleLanguageSeries.map((series) =>
      createVisiblePointMark(series, pointRendering),
    ),
  });
}

export function mountPlot(
  container: HTMLDivElement,
  plot: HTMLElement | SVGSVGElement,
): () => void {
  container.replaceChildren(plot);

  return () => {
    plot.remove();
  };
}
