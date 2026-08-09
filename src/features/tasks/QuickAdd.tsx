import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTaskStore } from './taskStore'
import { useUiStore } from '../ui/uiStore'
import { todayISO } from './taskModel'

export function QuickAdd({
  mode = 'today',
  autoFocus = false,
}: {
  mode?: 'today' | 'inbox'
  autoFocus?: boolean
}) {
  const addTask = useTaskStore((s) => s.addTask)
  const undoLastAdd = useTaskStore((s) => s.undoLastAdd)
  const lastAddedId = useTaskStore((s) => s.lastAddedId)
  const focusToken = useUiStore((s) => s.quickAddFocusToken)
  const [value, setValue] = useState('')
  const [showUndo, setShowUndo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus || focusToken > 0) inputRef.current?.focus()
  }, [autoFocus, focusToken])

  useEffect(() => {
    if (!showUndo) return
    const id = window.setTimeout(() => setShowUndo(false), 5000)
    return () => window.clearTimeout(id)
  }, [showUndo, lastAddedId])

  const submit = () => {
    const title = value.trim()
    if (!title) return
    addTask({
      title,
      date: mode === 'inbox' ? null : todayISO(),
      group: mode === 'inbox' ? 'side' : 'daily',
    })
    setValue('')
    setShowUndo(true)
  }

  return (
    <div className="quick-add">
      <div className="quick-add-row">
        <Plus size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={mode === 'inbox' ? 'В inbox без даты…' : 'Быстрое задание на сегодня…'}
          aria-label="Быстрое добавление задачи"
        />
        <button type="button" className="secondary quick-add-submit" onClick={submit} disabled={!value.trim()}>
          Добавить
        </button>
      </div>
      {showUndo && lastAddedId && (
        <div className="quick-add-undo">
          <span>Задача добавлена.</span>
          <button type="button" onClick={() => { undoLastAdd(); setShowUndo(false) }}>Отменить</button>
        </div>
      )}
    </div>
  )
}
