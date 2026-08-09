import { Pause, Play, RotateCcw, X } from 'lucide-react'
import { PointerEvent, useMemo, useRef, useState } from 'react'
import { audio } from '../lib/audio'
import { useTimerStore } from '../features/timer/timerStore'

type Mode = 'time' | 'timer'

const normalize = (value: number, max: number) => ((value % max) + max) % max

export function ClockTimerModal({ taskId, taskTitle, onClose }: { taskId: string; taskTitle: string; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('timer')
  const [minutesOfDay, setMinutesOfDay] = useState(10 * 60 + 30)
  const [durationMin, setDurationMin] = useState(45)
  const dragRef = useRef<'minute' | 'hour' | null>(null)
  const lastSnapRef = useRef<number | null>(null)
  const timer = useTimerStore()

  const clockMinutes = mode === 'time' ? minutesOfDay : durationMin
  const hour = mode === 'time' ? Math.floor(clockMinutes / 60) % 24 : Math.floor(clockMinutes / 60) % 12
  const minute = clockMinutes % 60
  const minuteAngle = minute * 6
  const hourAngle = ((hour % 12) + minute / 60) * 30

  const label = useMemo(() => mode === 'time'
    ? `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`
    : `${Math.floor(durationMin/60).toString().padStart(2,'0')}:${(durationMin%60).toString().padStart(2,'0')}:00`, [mode, hour, minute, durationMin])

  const updateFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let deg = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90
    deg = normalize(deg, 360)

    if (dragRef.current === 'minute') {
      const snappedMinute = normalize(Math.round(deg / 30) * 5, 60)
      if (lastSnapRef.current !== snappedMinute) {
        audio.play('timer.tick')
        lastSnapRef.current = snappedMinute
      }
      if (mode === 'time') {
        setMinutesOfDay((current) => {
          const currentMinute = current % 60
          const currentHour = Math.floor(current / 60)
          let hourDelta = 0
          if (currentMinute >= 45 && snappedMinute <= 15) hourDelta = 1
          if (currentMinute <= 15 && snappedMinute >= 45) hourDelta = -1
          return normalize((currentHour + hourDelta) * 60 + snappedMinute, 24 * 60)
        })
      } else {
        setDurationMin((current) => {
          const currentMinute = current % 60
          const currentHour = Math.floor(current / 60)
          let hourDelta = 0
          if (currentMinute >= 45 && snappedMinute <= 15) hourDelta = 1
          if (currentMinute <= 15 && snappedMinute >= 45) hourDelta = -1
          return Math.max(5, Math.min(12 * 60, (currentHour + hourDelta) * 60 + snappedMinute))
        })
      }
    } else {
      const snappedHour = Math.round(deg / 30) % 12
      if (mode === 'time') {
        setMinutesOfDay((current) => {
          const currentHour = Math.floor(current / 60)
          const cycle = currentHour >= 12 ? 12 : 0
          return normalize((cycle + snappedHour) * 60 + (current % 60), 24 * 60)
        })
      } else {
        setDurationMin((current) => Math.max(5, snappedHour * 60 + (current % 60)))
      }
      audio.play('timer.tick')
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="clock-modal" role="dialog" aria-modal="true">
        <header><div><small>РЕЖИМ МИССИИ</small><h2>{taskTitle}</h2></div><button className="icon-button" onClick={onClose}><X/></button></header>
        <div className="segmented"><button className={mode==='timer'?'active':''} onClick={()=>setMode('timer')}>Таймер</button><button className={mode==='time'?'active':''} onClick={()=>setMode('time')}>Время</button></div>
        <div className="clock-face" onPointerMove={updateFromPointer} onPointerUp={() => { dragRef.current = null; lastSnapRef.current = null }} onPointerLeave={() => { dragRef.current = null; lastSnapRef.current = null }}>
          <div className="clock-ring"/>
          <button className="clock-hand hour" style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }} onPointerDown={(e)=>{e.currentTarget.setPointerCapture(e.pointerId); dragRef.current='hour'}} aria-label="Часовая стрелка"><i/></button>
          <button className="clock-hand minute" style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }} onPointerDown={(e)=>{e.currentTarget.setPointerCapture(e.pointerId); dragRef.current='minute'}} aria-label="Минутная стрелка"><i/></button>
          <div className="clock-pin"/>
        </div>
        <div className="clock-value">{label}</div>
        {mode === 'timer' ? (
          <div className="modal-actions">
            <button className="secondary" onClick={() => setDurationMin(45)}><RotateCcw size={17}/> 45 минут</button>
            {timer.status === 'idle' ? <button className="primary" onClick={() => { timer.start(taskId, taskTitle, durationMin*60_000); onClose() }}><Play size={18}/> Запустить</button> : <button className="primary" onClick={timer.status === 'running' ? timer.pause : timer.resume}>{timer.status === 'running' ? <Pause size={18}/> : <Play size={18}/>} {timer.status === 'running' ? 'Пауза' : 'Продолжить'}</button>}
          </div>
        ) : <div className="hint">Вращай минутную стрелку: часовая следует за временем автоматически.</div>}
      </section>
    </div>
  )
}
