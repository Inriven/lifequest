import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { audio } from '../lib/audio'
import {
  applyHour12Snap,
  applyMinuteSnap,
  clampDurationMinutes,
  hourAngle,
  isQuarterHour,
  minuteAngle,
  MINUTES_PER_DAY,
  normalizeMod,
  pointerDegrees,
  snapHour12FromDegrees,
  snapMinuteFromDegrees,
} from '../lib/clockMath'

type Hand = 'minute' | 'hour'

type Props = {
  totalMinutes: number
  onChange: (next: number) => void
  /** wall-clock wraps 24h; duration clamps 5..12h */
  variant: 'time' | 'duration'
}

export function AnalogClock({ totalMinutes, onChange, variant }: Props) {
  const faceRef = useRef<HTMLDivElement>(null)
  const dragHandRef = useRef<Hand | null>(null)
  const lastMinuteRef = useRef(normalizeMod(totalMinutes, 60))
  const lastHour12Ref = useRef(Math.floor(totalMinutes / 60) % 12)
  const lastSnapMinuteRef = useRef<number | null>(null)
  const totalRef = useRef(totalMinutes)
  const rafRef = useRef<number | null>(null)
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null)
  const [activeHand, setActiveHand] = useState<Hand | null>(null)

  useEffect(() => {
    totalRef.current = totalMinutes
    if (!dragHandRef.current) {
      lastMinuteRef.current = normalizeMod(totalMinutes, 60)
      lastHour12Ref.current = Math.floor(totalMinutes / 60) % 12
    }
  }, [totalMinutes])

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
  }, [])

  const commit = (next: number) => {
    const value = variant === 'time'
      ? normalizeMod(next, MINUTES_PER_DAY)
      : clampDurationMinutes(next)
    totalRef.current = value
    onChange(value)
  }

  const playMinuteTick = (minute: number) => {
    audio.play('timer.tick', { strong: isQuarterHour(minute) })
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(isQuarterHour(minute) ? [8, 16, 8] : 6)
    }
  }

  const processPointer = (clientX: number, clientY: number) => {
    const hand = dragHandRef.current
    const face = faceRef.current
    if (!hand || !face) return

    const rect = face.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const deg = pointerDegrees(clientX, clientY, cx, cy)

    if (hand === 'minute') {
      const snappedMinute = snapMinuteFromDegrees(deg)
      if (lastSnapMinuteRef.current === snappedMinute) return
      lastSnapMinuteRef.current = snappedMinute
      playMinuteTick(snappedMinute)
      const next = applyMinuteSnap(totalRef.current, snappedMinute, lastMinuteRef.current)
      lastMinuteRef.current = snappedMinute
      commit(next)
      return
    }

    const snappedHour12 = snapHour12FromDegrees(deg)
    if (snappedHour12 === lastHour12Ref.current) return
    audio.play('timer.tick', { strong: false })
    const next = applyHour12Snap(totalRef.current, snappedHour12, lastHour12Ref.current)
    lastHour12Ref.current = snappedHour12
    lastMinuteRef.current = normalizeMod(next, 60)
    commit(next)
  }

  const schedulePointer = (clientX: number, clientY: number) => {
    pendingPointerRef.current = { x: clientX, y: clientY }
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const point = pendingPointerRef.current
      pendingPointerRef.current = null
      if (point) processPointer(point.x, point.y)
    })
  }

  const endDrag = (pointerId?: number) => {
    const face = faceRef.current
    if (face && pointerId != null && face.hasPointerCapture(pointerId)) {
      face.releasePointerCapture(pointerId)
    }
    dragHandRef.current = null
    lastSnapMinuteRef.current = null
    setActiveHand(null)
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    pendingPointerRef.current = null
  }

  const beginDrag = (hand: Hand, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const face = faceRef.current
    if (!face) return

    dragHandRef.current = hand
    setActiveHand(hand)
    lastMinuteRef.current = normalizeMod(totalRef.current, 60)
    lastHour12Ref.current = Math.floor(totalRef.current / 60) % 12
    lastSnapMinuteRef.current = lastMinuteRef.current
    face.setPointerCapture(event.pointerId)
  }

  const displayMinute = normalizeMod(totalMinutes, 60)
  const mAngle = minuteAngle(displayMinute)
  const hAngle = hourAngle(totalMinutes)

  return (
    <div
      ref={faceRef}
      className={`clock-face ${activeHand ? `dragging-${activeHand}` : ''}`}
      onPointerMove={(event) => {
        if (!dragHandRef.current) return
        schedulePointer(event.clientX, event.clientY)
      }}
      onPointerUp={(event) => endDrag(event.pointerId)}
      onPointerCancel={(event) => endDrag(event.pointerId)}
    >
      <div className="clock-ring" aria-hidden="true" />
      <button
        type="button"
        className={`clock-hand hour ${activeHand === 'hour' ? 'is-active' : ''} ${activeHand && activeHand !== 'hour' ? 'is-dim' : ''}`}
        style={{ transform: `translateX(-50%) rotate(${hAngle}deg)` }}
        onPointerDown={(e) => beginDrag('hour', e)}
        aria-label="Часовая стрелка"
      >
        <i />
      </button>
      <button
        type="button"
        className={`clock-hand minute ${activeHand === 'minute' ? 'is-active' : ''} ${activeHand && activeHand !== 'minute' ? 'is-dim' : ''}`}
        style={{ transform: `translateX(-50%) rotate(${mAngle}deg)` }}
        onPointerDown={(e) => beginDrag('minute', e)}
        aria-label="Минутная стрелка"
      >
        <i />
      </button>
      <div className="clock-pin" aria-hidden="true" />
    </div>
  )
}
