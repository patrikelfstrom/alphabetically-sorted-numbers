import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import './App.css'

type NumberPoint = {
  alphabeticalRank: number
  name: string
  value: number
}

type RawNumberEntry = {
  name: string
  value: number
}

type GridCell = {
  alphabeticalRank: number
  value: number
}

type ChartData = {
  data: NumberPoint[]
  gridCells: GridCell[]
  pointsByValue: Map<number, NumberPoint>
  xValues: number[]
  xTicks: number[]
  yValues: number[]
  yTicks: number[]
}

const units: Record<number, string> = {
  0: 'noll',
  1: 'ett',
  2: 'två',
  3: 'tre',
  4: 'fyra',
  5: 'fem',
  6: 'sex',
  7: 'sju',
  8: 'åtta',
  9: 'nio',
}

const teens: Record<number, string> = {
  10: 'tio',
  11: 'elva',
  12: 'tolv',
  13: 'tretton',
  14: 'fjorton',
  15: 'femton',
  16: 'sexton',
  17: 'sjutton',
  18: 'arton',
  19: 'nitton',
}

const tens: Record<number, string> = {
  20: 'tjugo',
  30: 'trettio',
  40: 'fyrtio',
  50: 'femtio',
  60: 'sextio',
  70: 'sjuttio',
  80: 'åttio',
  90: 'nittio',
}

const collator = new Intl.Collator('sv-SE')
const minAvailableStart = 0
const maxAvailableValue = 5000
const defaultAvailableStart = 0
const defaultAvailableEnd = 100

function toSwedishNumber(value: number): string {
  if (value < 0) {
    return `minus${toSwedishNumber(Math.abs(value))}`
  }

  if (value in units) {
    return units[value]
  }

  if (value in teens) {
    return teens[value]
  }

  if (value < 100) {
    const tenValue = Math.floor(value / 10) * 10
    const unitValue = value % 10

    if (unitValue === 0) {
      return tens[tenValue]
    }

    return `${tens[tenValue]}${units[unitValue]}`
  }

  if (value < 1000) {
    const hundredValue = Math.floor(value / 100)
    const remainder = value % 100
    const hundredWord = hundredValue === 1 ? 'hundra' : `${units[hundredValue]}hundra`

    if (remainder === 0) {
      return hundredWord
    }

    return `${hundredWord}${toSwedishNumber(remainder)}`
  }

  const thousandValue = Math.floor(value / 1000)
  const remainder = value % 1000
  const thousandWord =
    thousandValue === 1 ? 'ettusen' : `${toSwedishNumber(thousandValue)}tusen`

  if (remainder === 0) {
    return thousandWord
  }

  return `${thousandWord}${toSwedishNumber(remainder)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getTickStep(maxValue: number): number {
  const roughStep = Math.max(1, Math.ceil(maxValue / 10))
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))

  if (roughStep <= magnitude) {
    return magnitude
  }

  if (roughStep <= magnitude * 2) {
    return magnitude * 2
  }

  if (roughStep <= magnitude * 5) {
    return magnitude * 5
  }

  return magnitude * 10
}

function buildChartData(rangeStart: number, rangeEnd: number): ChartData {
  const xValues = d3.range(rangeStart, rangeEnd + 1)
  const count = xValues.length
  const yValues = d3.range(0, count)
  const rawData: RawNumberEntry[] = xValues.map(
    (value: number): RawNumberEntry => ({
      name: toSwedishNumber(value),
      value,
    }),
  )

  const data: NumberPoint[] = d3
    .sort(rawData, (a: RawNumberEntry, b: RawNumberEntry) =>
      collator.compare(a.name, b.name),
    )
    .map((entry: RawNumberEntry, index: number) => ({
      alphabeticalRank: index,
      name: entry.name,
      value: entry.value,
    }))

  const pointsByValue = new Map<number, NumberPoint>()

  for (const point of data) {
    pointsByValue.set(point.value, point)
  }

  const gridCells: GridCell[] = d3.cross(
    xValues,
    yValues,
    (value: number, alphabeticalRank: number): GridCell => ({
      alphabeticalRank,
      value,
    }),
  )

  const tickStep = getTickStep(Math.max(1, rangeEnd - rangeStart))
  const xTicks = d3.range(rangeStart, rangeEnd + 1, tickStep)
  const yTicks = d3.range(0, count, tickStep)

  if (xTicks[xTicks.length - 1] !== rangeEnd) {
    xTicks.push(rangeEnd)
  }

  if (yTicks.length === 0 || yTicks[yTicks.length - 1] !== count - 1) {
    yTicks.push(count - 1)
  }

  return { data, gridCells, pointsByValue, xTicks, xValues, yTicks, yValues }
}

function App() {
  const controlsRef = useRef<HTMLElement | null>(null)
  const basePlotRef = useRef<HTMLDivElement | null>(null)
  const overlayPlotRef = useRef<HTMLDivElement | null>(null)
  const [availableStart, setAvailableStart] = useState(defaultAvailableStart)
  const [availableEnd, setAvailableEnd] = useState(defaultAvailableEnd)
  const [visibleStart, setVisibleStart] = useState(defaultAvailableStart)
  const [visibleEnd, setVisibleEnd] = useState(defaultAvailableEnd)
  const [plotSize, setPlotSize] = useState(720)

  const chartData = useMemo(
    () => buildChartData(availableStart, availableEnd),
    [availableEnd, availableStart],
  )
  const deferredVisibleStart = useDeferredValue(visibleStart)
  const deferredVisibleEnd = useDeferredValue(visibleEnd)

  const visiblePoints = useMemo(() => {
    const points: NumberPoint[] = []

    for (
      let value = deferredVisibleStart;
      value <= deferredVisibleEnd;
      value += 1
    ) {
      const point = chartData.pointsByValue.get(value)

      if (point) {
        points.push(point)
      }
    }

    return points
  }, [chartData.pointsByValue, deferredVisibleEnd, deferredVisibleStart])

  useEffect(() => {
    setVisibleStart(availableStart)
    setVisibleEnd(availableEnd)
  }, [availableEnd, availableStart])

  useEffect(() => {
    const updatePlotSize = () => {
      const controlsHeight = controlsRef.current?.getBoundingClientRect().height ?? 0
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const outerPadding = viewportWidth <= 720 ? 18 : 28
      const controlsGap = viewportWidth <= 720 ? 8 : 10
      const availableWidth = viewportWidth - outerPadding * 2
      const availableHeight = viewportHeight - controlsHeight - controlsGap - outerPadding * 2
      const nextSize = Math.max(
        280,
        Math.floor(Math.min(availableWidth, availableHeight, 1480)),
      )

      if (nextSize > 0) {
        setPlotSize((currentSize) => (currentSize === nextSize ? currentSize : nextSize))
      }
    }

    updatePlotSize()

    const observer = new ResizeObserver(() => {
      updatePlotSize()
    })

    if (controlsRef.current) {
      observer.observe(controlsRef.current)
    }

    window.addEventListener('resize', updatePlotSize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePlotSize)
    }
  }, [])

  useEffect(() => {
    if (!basePlotRef.current) {
      return
    }

    const marginPad = Math.max(12, Math.round(plotSize * 0.018))
    const axisPad = Math.max(38, Math.round(plotSize * 0.055))

    const basePlot = Plot.plot({
      width: plotSize,
      height: plotSize,
      marginTop: marginPad,
      marginRight: marginPad,
      marginBottom: axisPad,
      marginLeft: axisPad,
      style: {
        background: 'transparent',
        color: '#f2f4ff',
        fontFamily: 'var(--font-body)',
        fontSize: `${Math.max(10, Math.round(plotSize * 0.011))}px`,
        overflow: 'visible',
      },
      x: {
        type: 'band',
        label: 'Vilket nummer',
        domain: chartData.xValues,
        padding: 0,
        tickSize: 0,
        ticks: chartData.xTicks,
      },
      y: {
        type: 'band',
        label: 'Alfabetisk position',
        domain: chartData.yValues,
        padding: 0,
        reverse: true,
        tickSize: 0,
        ticks: chartData.yTicks,
      },
      marks: [
        Plot.cell(chartData.gridCells, {
          x: 'value',
          y: 'alphabeticalRank',
          fill: 'rgba(22, 24, 37, 0.94)',
          inset: 0.7,
        }),
        Plot.frame({
          inset: 0,
          stroke: 'rgba(200, 212, 255, 0.22)',
          strokeWidth: 1,
        }),
      ],
    })

    basePlotRef.current.replaceChildren(basePlot)

    return () => {
      basePlot.remove()
    }
  }, [chartData.gridCells, chartData.xTicks, chartData.xValues, chartData.yTicks, chartData.yValues, plotSize])

  useEffect(() => {
    if (!overlayPlotRef.current) {
      return
    }

    const marginPad = Math.max(12, Math.round(plotSize * 0.018))
    const axisPad = Math.max(38, Math.round(plotSize * 0.055))

    const overlayPlot = Plot.plot({
      width: plotSize,
      height: plotSize,
      marginTop: marginPad,
      marginRight: marginPad,
      marginBottom: axisPad,
      marginLeft: axisPad,
      style: {
        background: 'transparent',
        fontFamily: 'var(--font-body)',
        overflow: 'visible',
      },
      x: {
        type: 'band',
        axis: null,
        domain: chartData.xValues,
        padding: 0,
      },
      y: {
        type: 'band',
        axis: null,
        domain: chartData.yValues,
        padding: 0,
        reverse: true,
      },
      marks: [
        Plot.cell(visiblePoints, {
          x: 'value',
          y: 'alphabeticalRank',
          fill: '#9c8dff',
          inset: 0.7,
          title: (entry: NumberPoint) => `${entry.name} (${entry.value})`,
        }),
      ],
    })

    overlayPlotRef.current.replaceChildren(overlayPlot)

    return () => {
      overlayPlot.remove()
    }
  }, [chartData.xValues, chartData.yValues, plotSize, visiblePoints])

  const availableSpan = Math.max(1, availableEnd - availableStart)
  const visibleCount = Math.max(0, visibleEnd - visibleStart + 1)
  const availableCount = Math.max(0, availableEnd - availableStart + 1)

  return (
    <main className="app-shell">
      <section className="controls-shell" ref={controlsRef}>
        <div className="control-row">
          <label className="number-group">
            <span>From</span>
            <input
              className="number-input"
              type="number"
              min={minAvailableStart}
              max={maxAvailableValue}
              value={availableStart}
              onChange={(event) => {
                const nextStart = clamp(
                  Number(event.target.value || 0),
                  minAvailableStart,
                  maxAvailableValue,
                )
                setAvailableStart(nextStart)
                if (nextStart > availableEnd) {
                  setAvailableEnd(nextStart)
                }
              }}
            />
          </label>

          <div className="slider-group">
            <span>Visible range</span>
            <div className="range-slider" aria-label="Visible range">
              <div
                className="range-slider__track"
                style={{
                  left: `${((visibleStart - availableStart) / availableSpan) * 100}%`,
                  right: `${100 - ((visibleEnd - availableStart) / availableSpan) * 100}%`,
                }}
              />
              <input
                className="range-slider__input"
                type="range"
                min={availableStart}
                max={availableEnd}
                value={visibleStart}
                onChange={(event) => {
                  const nextStart = Math.min(Number(event.target.value), visibleEnd)
                  setVisibleStart(nextStart)
                }}
              />
              <input
                className="range-slider__input"
                type="range"
                min={availableStart}
                max={availableEnd}
                value={visibleEnd}
                onChange={(event) => {
                  const nextEnd = Math.max(Number(event.target.value), visibleStart)
                  setVisibleEnd(nextEnd)
                }}
              />
            </div>
          </div>

          <label className="number-group">
            <span>To</span>
            <input
              className="number-input"
              type="number"
              min={minAvailableStart}
              max={maxAvailableValue}
              value={availableEnd}
              onChange={(event) => {
                const nextEnd = clamp(
                  Number(event.target.value || 0),
                  minAvailableStart,
                  maxAvailableValue,
                )
                setAvailableEnd(nextEnd)
                if (nextEnd < availableStart) {
                  setAvailableStart(nextEnd)
                }
              }}
            />
          </label>
        </div>

        <p className="control-note">
          {visibleCount} point{visibleCount === 1 ? '' : 's'} visible from {availableCount}{' '}
          available. Supported range: {minAvailableStart} to {maxAvailableValue}.
        </p>
      </section>

      <div
        className="plot-shell"
        style={{ height: `${plotSize}px`, width: `${plotSize}px` }}
      >
        <div className="plot-canvas">
          <div className="plot-layer plot-layer--base" ref={basePlotRef} />
          <div className="plot-layer plot-layer--overlay" ref={overlayPlotRef} />
        </div>
      </div>
    </main>
  )
}

export default App
