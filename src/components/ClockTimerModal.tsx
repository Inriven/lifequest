import { Pause, Play, Square, X } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { audio } from '../lib/audio'
import {
  applyHour12Snap,
  applyMinuteSnap,
  clampDurationMinutes,
  formatHm,
  hourAngle,
  isQuarterHour,
  minuteAngle,
  MINUTES_PER_DAY,
  normalizeMod,
  parseHm,
  pointerDegrees,
  snapHour12FromDegrees,
  snapMinuteFromDegrees,
} from '../lib/clockMath'
import { useTimerStore } from '../features/timer/timerStore'
import { useTaskStore } from '../features/tasks/taskStore'

type Mode = 'time' | 'timer'

function hapticSnap(strong = false) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(strong ? [10, 20, 10] : 8)
  }
}

function playSnap(minute: number) {
  audio.play('timer.tick')
  hapticSnap(isQuarterHour(minute))
}

export function ClockTimerModal({
  taskId,
  taskTitle,
  onClose,
}: {
  taskId: string
  taskTitle: string
  onClose: () => void
}) {
  const timer = useTimerStore()
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
  const [durationMin, setDurationMin] = useState(() => Math.max(5, task?.minutes ?? 45))
  const [digitalDraft, setDigitalDraft] = useState('')

  const faceRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<'minute' | 'hour' | null>(null)
  const lastMinuteRef = useRef(0)
  const lastHour12Ref = useRef(0)
  const lastSnapMinuteRef = useRef<number | null>(null)

  const sourceMinutes = mode === 'time' ? totalMinutes : durationMin
  const displayMinute = normalizeMod(sourceMinutes, 60)
  const mAngle = minuteAngle(displayMinute)
  const hAngle = hourAngle(sourceMinutes)
  const digital = mode === 'time'
    ? formatHm(totalMinutes, 24)
    : `${formatHm(durationMin, 12)}:00`

  useEffect(() => {
    setDigitalDraft(mode === 'time' ? formatHm(totalMinutes, 24) : formatHm(durationMin, 12))
  }, [mode, totalMinutes, durationMin])

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

  const beginDrag = (hand: 'minute' | 'hour', event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = hand
    lastMinuteRef.current = displayMinute
    lastHour12Ref.current = Math.floor(sourceMinutes / 60) % 12
    lastSnapMinuteRef.current = displayMinute
    faceRef.current?.setPointerCapture(event.pointerId)
  }

  const updateFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !faceRef.current) return
    const rect = faceRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const deg = pointerDegrees(event.clientX, event.clientY, cx, cy)

    if (dragRef.current === 'minute') {
      const snappedMinute = snapMinuteFromDegrees(deg)
      if (lastSnapMinuteRef.current === snappedMinute) return
      playSnap(snappedMinute)
      lastSnapMinuteRef.current = snappedMinute

      if (mode === 'time') {
        const next = normalizeMod(applyMinuteSnap(totalMinutes, snappedMinute, lastMinuteRef.current), MINUTES_PER_DAY)
        lastMinuteRef.current = snappedMinute
        setTotalMinutes(next)
      } else {
        const next = clampDurationMinutes(applyMinuteSnap(durationMin, snappedMinute, lastMinuteRef.current))
        lastMinuteRef.current = normalizeMod(next, 60)
        setDurationMin(next)
      }
      return
    }

    const snappedHour12 = snapHour12FromDegrees(deg)
    if (snappedHour12 === lastHour12Ref.current) return
    audio.play('timer.tick')
    hapticSnap(false)

    if (mode === 'time') {
      const next = normalizeMod(applyHour12Snap(totalMinutes, snappedHour12, lastHour12Ref.current), MINUTES_PER_DAY)
      lastHour12Ref.current = snappedHour12
      setTotalMinutes(next)
    } else {
      const next = clampDurationMinutes(applyHour12Snap(durationMin, snappedHour12, lastHour12Ref.current))
      lastHour12Ref.current = Math.floor(next / 60) % 12
      setDurationMin(next)
    }
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (faceRef.current?.hasPointerCapture(event.pointerId)) {
      faceRef.current.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    lastSnapMinuteRef.current = null
  }

  const linkedToActive = timer.status !== 'idle' && timer.taskId === taskId
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

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

        <div
          ref={faceRef}
          className="clock-face"
          onPointerMove={updateFromPointer}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="clock-ring" aria-hidden="true" />
          <button
            type="button"
            className="clock-hand hour"
            style={{ transform: `translateX(-50%) rotate(${hAngle}deg)` }}
            onPointerDown={(e) => beginDrag('hour', e)}
            aria-label="Часовая стрелка"
          >
            <i />
          </button>
          <button
            type="button"
            className="clock-hand minute"
            style={{ transform: `translateX(-50%) rotate(${mAngle}deg)` }}
            onPointerDown={(e) => beginDrag('minute', e)}
            aria-label="Минутная стрелка"
          >
            <i />
          </button>
          <div className="clock-pin" aria-hidden="true" />
        </div>

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
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
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
                  onClick={timer.status === 'running' ? timer.pause : timer.resume}
                >
                  {timer.status === 'running' ? <Pause size={18} /> : <Play size={18} />}
                  {timer.status === 'running' ? 'Пауза' : 'Продолжить'}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    timer.stop()
                    onClose()
                  }}
                >
                  <Square size={17} />
                  Стоп
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={() => {
                  timer.start(taskId, taskTitle, durationMin * 60_000)
                  onClose()
                }}
              >
                <Play size={18} />
                Старт
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
