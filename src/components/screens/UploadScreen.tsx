import { useEffect, useRef, useState } from 'react'
import { CheckCircle, CloudArrowUp, FilePdf } from '@phosphor-icons/react'
import { mockUpload } from '../../mockData'

type UploadState = 'idle' | 'dragging' | 'uploading' | 'done'

interface UploadScreenProps {
  onComplete: () => void
}

export function UploadScreen({ onComplete }: UploadScreenProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state !== 'uploading') return

    const stepMs = 40
    const increment = 100 / (mockUpload.uploadDurationMs / stepMs)
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(id)
          setState('done')
          return 100
        }
        return next
      })
    }, stepMs)

    return () => clearInterval(id)
  }, [state])

  function beginUpload() {
    setProgress(0)
    setState('uploading')
  }

  if (state === 'uploading' || state === 'done') {
    return (
      <div className="max-w-xl">
        <p className="mb-2 text-caption font-medium uppercase tracking-wide text-text-muted">
          Reference material
        </p>
        <div className="card-lift rounded-sm border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary-tint text-primary">
              <FilePdf size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-text-primary">
                {mockUpload.fileName}
              </p>
              <p className="text-caption text-text-muted">
                {mockUpload.fileSize} · {state === 'done' ? 'Uploaded' : `${Math.round(progress)}%`}
              </p>
            </div>
            {state === 'done' && (
              <CheckCircle size={22} weight="fill" className="shrink-0 text-strong" />
            )}
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-sm bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {state === 'done' && (
            <button
              type="button"
              onClick={onComplete}
              className="mt-5 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Generate questions
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <p className="mb-2 text-caption font-medium uppercase tracking-wide text-text-muted">
        Reference material
      </p>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setState('dragging')
        }}
        onDragLeave={() => setState('idle')}
        onDrop={(e) => {
          e.preventDefault()
          beginUpload()
        }}
        className={`flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border border-dashed transition-colors ${
          state === 'dragging'
            ? 'border-primary bg-primary-tint'
            : 'border-border-strong bg-surface hover:bg-surface-alt'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) beginUpload()
          }}
        />
        <CloudArrowUp
          size={32}
          weight="light"
          className={state === 'dragging' ? 'text-primary' : 'text-text-muted'}
        />
        <div className="text-center">
          <p className="text-body font-medium text-text-primary">
            Drag and drop a file, or click to browse
          </p>
          <p className="mt-1 text-caption text-text-muted">PDF, DOCX or TXT up to 25 MB</p>
        </div>
      </div>
    </div>
  )
}
