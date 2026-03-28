import { useCallback, useLayoutEffect, useState } from "react";

const minimumPlotSize = 280;
const maximumPlotSize = 1480;

function getResponsivePlotSize(
  plotRangeHeight: number,
  showRangeSliders: boolean,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const outerPadding = viewportWidth <= 720 ? 18 : 28;
  const plotShellChrome = viewportWidth <= 720 ? 26 : 34;
  const yRangeWidth = viewportWidth <= 720 ? 66 : 82;
  const plotMatrixGap = viewportWidth <= 720 ? 8 : 12;
  const availableWidth =
    viewportWidth -
    outerPadding * 2 -
    (showRangeSliders ? yRangeWidth + plotMatrixGap : 0);
  const availableHeight =
    viewportHeight -
    (showRangeSliders ? plotRangeHeight : 0) -
    plotShellChrome -
    outerPadding * 2;

  return Math.max(
    minimumPlotSize,
    Math.floor(Math.min(availableWidth, availableHeight, maximumPlotSize)),
  );
}

export function usePlotSize(showRangeSliders: boolean) {
  const [plotRangeElement, setPlotRangeElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [plotSize, setPlotSize] = useState(720);

  const plotRangeRef = useCallback((node: HTMLDivElement | null) => {
    setPlotRangeElement(node);
  }, []);

  useLayoutEffect(() => {
    const updatePlotSize = () => {
      const plotRangeHeight =
        plotRangeElement?.getBoundingClientRect().height ?? 0;
      const nextPlotSize = getResponsivePlotSize(
        plotRangeHeight,
        showRangeSliders,
        window.innerWidth,
        window.innerHeight,
      );

      if (nextPlotSize > 0) {
        setPlotSize((currentPlotSize) =>
          currentPlotSize === nextPlotSize ? currentPlotSize : nextPlotSize,
        );
      }
    };

    updatePlotSize();

    const observer = new ResizeObserver(() => {
      updatePlotSize();
    });

    if (plotRangeElement) {
      observer.observe(plotRangeElement);
    }

    window.addEventListener("resize", updatePlotSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePlotSize);
    };
  }, [plotRangeElement, showRangeSliders]);

  return {
    plotRangeRef,
    plotSize,
  };
}
