import { Pause, Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTimerStore } from '../features/timer/timerStore'

function format(ms: number) {
  const total = Math.ceil(ms / 1000)
  const mm = Math.floor(total / 60).toString().padStart(2, '0')
  const ss = (total % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export function TimerTopbar() {
  const timer = useTimerStore()
  const [, setTick] = useState(0)
  useEffect(() => {
    if (timer.status === 'idle') return
    const id = window.setInterval(() => setTick((v) => v + 1), 250)
    return () => window.clearInterval(id)
  }, [timer.status])

  if (timer.status === 'idle') return null
  const remaining = timer.remainingMs()

  return (
    <div className="top-timer" title={timer.taskTitle}>
      <div className="top-timer-copy">
        <strong>{format(remaining)}</strong>
        <span>{timer.taskTitle}</span>
      </div>
      <button className="icon-button" onClick={timer.status === 'running' ? timer.pause : timer.resume} aria-label={timer.status === 'running' ? 'Пауза' : 'Продолжить'}>
        {timer.status === 'running' ? <Pause size={18}/> : <Play size={18}/>} 
      </button>
      <button className="icon-button" onClick={timer.stop} aria-label="Завершить таймер"><Square size={17}/></button>
    </div>
  )
}
