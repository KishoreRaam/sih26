interface TrendBarChartPoint {
  label: string
  value: number
}

interface TrendBarChartProps {
  points: TrendBarChartPoint[]
  maxValue?: number
}

export function TrendBarChart({ points, maxValue = 100 }: TrendBarChartProps) {
  return (
    <div className="flex h-40 items-end gap-3">
      {points.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end">
            <div
              className="w-full rounded-t-sm bg-primary"
              style={{ height: `${Math.max(4, (point.value / maxValue) * 100)}%` }}
              title={`${point.label}: ${point.value}%`}
            />
          </div>
          <span className="text-micro text-text-muted">{point.label}</span>
        </div>
      ))}
    </div>
  )
}
