import { levelFromScore } from '../../data/thresholds'

interface HeatSparklineCell {
  id: string
  label: string
  score: number | null
}

interface HeatSparklineProps {
  cells: HeatSparklineCell[]
}

const levelClass: Record<'strong' | 'moderate' | 'weak' | 'insufficient', string> = {
  strong: 'bg-strong',
  moderate: 'bg-moderate',
  weak: 'bg-weak',
  insufficient: 'bg-insufficient',
}

export function HeatSparkline({ cells }: HeatSparklineProps) {
  return (
    <div className="flex gap-1">
      {cells.map((cell) => {
        const level = cell.score === null ? 'insufficient' : levelFromScore(cell.score)
        return (
          <span
            key={cell.id}
            title={`${cell.label}: ${cell.score === null ? 'Insufficient data' : `${cell.score}%`}`}
            className={`h-5 flex-1 rounded-sm ${levelClass[level]}`}
          />
        )
      })}
    </div>
  )
}
