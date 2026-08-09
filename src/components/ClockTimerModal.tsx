import { Check, Pause, Play, Square, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  clampDurationMinutes,
  formatHm,
  MINUTES_PER_DAY,
  normalizeMod,
  parseHm,
} from '../lib/clockMath'
import { useTimerStore } from '../features/timer/timerStore'
import { useTaskStore } from '../features/tasks/taskStore'
import { finishActiveTimer, startTaskTimer } from '../features/timer/startTaskTimer'
import { AnalogClock } from './AnalogClock'

type Mode = 'time' | 'timer'

export function ClockTimerModal({
  taskId,
  taskTitle,
  onClose,
}: {
  taskId: string
  taskTitle: string
  onClose: () => void
}) {
  const timerStatus = useTimerStore((s) => s.status)
  const timerTaskId = useTimerStore((s) => s.taskId)
  const pause = useTimerStore((s) => s.pause)
  const resume = useTimerStore((s) => s.resume)
  const stop = useTimerStore((s) => s.stop)
  const setTaskTime = useTaskStore((s) => s.setTaskTime)
  const task = useTaskStore((s) => s.tasks.find((item) => item.id === taskId))

  const [mode, setMode] = useState<Mode>('timer')
  const [totalMinutes, setTotalMinutes] = useState(() => {
    if (task?.time) {
      const parsed = parseHm(task.time)
      if (parsed != null) return normalizeMod(parsed, MINUTES_PER_DAY)
    }
    return 10 * 60 + 30
  })
  const [durationMin, setDurationMin] = useState(() => Math.max(5, task?.estimatedMinutes ?? 45))
  const [digitalDraft, setDigitalDraft] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)

  const sourceMinutes = mode === 'time' ? totalMinutes : durationMin
  const digital = mode === 'time'
    ? formatHm(totalMinutes, 24)
    : `${formatHm(durationMin, 12)}:00`

  useEffect(() => {
    setDigitalDraft(mode === 'time' ? formatHm(totalMinutes, 24) : formatHm(durationMin, 12))
  }, [mode, totalMinutes, durationMin])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      if (dialog.open) dialog.close()
    }
  }, [onClose])

  const commitDigital = () => {
    const parsed = parseHm(digitalDraft)
    if (parsed == null) {
      setDigitalDraft(mode === 'time' ? formatHm(totalMinutes, 24) : formatHm(durationMin, 12))
      return
    }
    if (mode === 'time') {
      setTotalMinutes(normalizeMod(parsed, MINUTES_PER_DAY))
    } else {
      setDurationMin(clampDurationMinutes(Math.max(5, parsed)))
    }
  }

  const linkedToActive = timerStatus !== 'idle' && timerTaskId === taskId

  return (
    <dialog
      ref={dialogRef}
      className="modal-backdrop"
      aria-label="Часы и таймер"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section className="clock-modal">
        <header>
          <div>
            <small>РЕЖИМ МИССИИ</small>
            <h2>{taskTitle}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть">
            <X />
          </button>
        </header>

        <div className="segmented" role="tablist" aria-label="Режим">
          <button type="button" role="tab" aria-selected={mode === 'timer'} className={mode === 'timer' ? 'active' : ''} onClick={() => setMode('timer')}>
            Таймер
          </button>
          <button type="button" role="tab" aria-selected={mode === 'time'} className={mode === 'time' ? 'active' : ''} onClick={() => setMode('time')}>
            Время
          </button>
        </div>

        <p className="mode-caption">
          {mode === 'timer'
            ? 'Сколько работать над задачей.'
            : 'Когда выполнить задачу в течение дня.'}
        </p>

        <AnalogClock
          totalMinutes={sourceMinutes}
          variant={mode === 'time' ? 'time' : 'duration'}
          onChange={mode === 'time' ? setTotalMinutes : setDurationMin}
        />

        <div className="clock-value" aria-live="polite">{digital}</div>

        <label className="digital-field">
          <span>{mode === 'time' ? 'Точное время' : 'Длительность'}</span>
          <input
            value={digitalDraft}
            inputMode="numeric"
            placeholder="HH:MM"
            onChange={(e) => setDigitalDraft(e.target.value)}
            onBlur={commitDigital}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            aria-label={mode === 'time' ? 'Ввести время' : 'Ввести длительность'}
          />
        </label>

        {mode === 'timer' ? (
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={() => setDurationMin(45)}>
              45 минут
            </button>
            {linkedToActive ? (
              <>
                <button
                  type="button"
                  className="secondary"
                  onClick={timerStatus === 'running' ? pause : resume}
                >
                  {timerStatus === 'running' ? <Pause size={18} /> : <Play size={18} />}
                  {timerStatus === 'running' ? 'Пауза' : 'Продолжить'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    finishActiveTimer()
                    onClose()
                  }}
                >
                  <Check size={17} />
                  Finish
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    stop()
                    onClose()
                  }}
                >
                  <Square size={17} />
                  Stop
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={() => {
                  if (startTaskTimer(taskId, taskTitle, durationMin * 60_000, { openClock: false })) {
                    onClose()
                  }
                }}
              >
                <Play size={18} />
                Start
              </button>
            )}
          </div>
        ) : (
          <div className="modal-actions">
            <button
              type="button"
              className="primary"
              onClick={() => {
                setTaskTime(taskId, formatHm(totalMinutes, 24))
                onClose()
              }}
            >
              Сохранить время
            </button>
          </div>
        )}
      </section>
    </dialog>
  )
}
