interface SegmentedBarSegment {
  id: string
  label: string
  value: number
  colorClass: string
}

interface SegmentedBarProps {
  segments: SegmentedBarSegment[]
}

export function SegmentedBar({ segments }: SegmentedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-sm bg-surface-alt">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={segment.colorClass}
            style={{ width: total > 0 ? `${(segment.value / total) * 100}%` : '0%' }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span key={segment.id} className="flex items-center gap-1.5 text-caption text-text-secondary">
            <span className={`size-2 rounded-full ${segment.colorClass}`} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}
