import { useState } from 'react'
import { CaretDown, CaretUp, CheckCircle, XCircle } from '@phosphor-icons/react'
import { mockQuiz, type QuizQuestion } from '../../mockData'

interface QuizScreenProps {
  onComplete: () => void
}

interface QuestionCardProps {
  question: QuizQuestion
  selected: string | undefined
  onSelect: (optionId: string) => void
  onNext: () => void
  isLast: boolean
}

function QuestionCard({ question, selected, onSelect, onNext, isLast }: QuestionCardProps) {
  const [sourceOpen, setSourceOpen] = useState(false)

  return (
    <div className="card-lift rounded-sm border border-border bg-surface p-6">
      <p className="text-caption text-text-secondary">{question.topic}</p>
      <h2 className="mt-1 text-h2 font-semibold text-text-primary">{question.prompt}</h2>

      <div className="mt-4 space-y-2">
        {question.options.map((option) => {
          const isCorrect = option.id === question.correctOptionId
          const isSelected = option.id === selected

          let containerClasses = 'border-border bg-surface hover:bg-surface-alt text-text-primary'
          let badge: { label: string; toneClass: string } | null = null

          if (selected) {
            if (isCorrect) {
              containerClasses = 'border-strong bg-strong-tint text-text-primary'
              badge = { label: isSelected ? 'Correct' : 'Correct answer', toneClass: 'text-strong' }
            } else if (isSelected) {
              containerClasses = 'border-weak bg-weak-tint text-text-primary'
              badge = { label: 'Incorrect', toneClass: 'text-weak' }
            } else {
              containerClasses = 'border-border bg-surface text-text-muted'
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={!!selected}
              onClick={() => onSelect(option.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left text-body tabular-nums transition-colors ${containerClasses} ${
                selected ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span>{option.text}</span>
              {badge && (
                <span className={`flex shrink-0 items-center gap-1 text-caption font-medium ${badge.toneClass}`}>
                  {badge.toneClass === 'text-strong' ? (
                    <CheckCircle size={15} weight="fill" />
                  ) : (
                    <XCircle size={15} weight="fill" />
                  )}
                  {badge.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setSourceOpen((v) => !v)}
          className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
        >
          {sourceOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
          {question.source.citation}
        </button>

        {sourceOpen && (
          <div className="mt-2 rounded-sm border border-border bg-surface-alt px-4 py-3">
            <p className="text-caption text-text-secondary">{question.source.snippet}</p>
          </div>
        )}
      </div>

      {selected && (
        <button
          type="button"
          onClick={onNext}
          className="mt-5 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {isLast ? 'View competency report' : 'Next question'}
        </button>
      )}
    </div>
  )
}

export function QuizScreen({ onComplete }: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const question = mockQuiz[currentIndex]
  const isLast = currentIndex === mockQuiz.length - 1
  const answeredCount = Object.keys(answers).length
  const percentComplete = Math.round((answeredCount / mockQuiz.length) * 100)

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-caption text-text-muted">
          <span>
            Question {currentIndex + 1} of {mockQuiz.length}
          </span>
          <span className="tabular-nums">{percentComplete}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-sm bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        selected={answers[question.id]}
        onSelect={(optionId) => setAnswers((prev) => ({ ...prev, [question.id]: optionId }))}
        onNext={() => {
          if (isLast) {
            onComplete()
          } else {
            setCurrentIndex((i) => i + 1)
          }
        }}
        isLast={isLast}
      />
    </div>
  )
}
