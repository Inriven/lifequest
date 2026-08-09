/** Pure clock helpers. Hands are views of totalMinutes, never independent state. */

export const MINUTES_PER_DAY = 24 * 60
export const MINUTES_PER_CLOCK = 12 * 60

export function normalizeMod(value: number, max: number): number {
  return ((value % max) + max) % max
}

export function pointerDegrees(clientX: number, clientY: number, cx: number, cy: number): number {
  const deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90
  return normalizeMod(deg, 360)
}

/** Snap angle to a 5-minute mark (0, 5, …, 55). */
export function snapMinuteFromDegrees(deg: number): number {
  return normalizeMod(Math.round(deg / 30) * 5, 60)
}

export function snapHour12FromDegrees(deg: number): number {
  return normalizeMod(Math.round(deg / 30), 12)
}

export function minuteAngle(minutes: number): number {
  return normalizeMod(minutes, 60) * 6
}

export function hourAngle(totalMinutes: number): number {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = normalizeMod(totalMinutes, 60)
  return ((hours % 12) + minutes / 60) * 30
}

/**
 * Apply a snapped minute while preserving continuous hour motion.
 * Crossing 55→00 advances the hour; 00→55 goes back.
 */
export function applyMinuteSnap(totalMinutes: number, snappedMinute: number, previousMinute: number): number {
  let delta = snappedMinute - previousMinute
  if (delta > 30) delta -= 60
  if (delta < -30) delta += 60
  return totalMinutes + delta
}

/** Apply a 12-hour hand snap with wrap across 11↔0. */
export function applyHour12Snap(totalMinutes: number, snappedHour12: number, previousHour12: number): number {
  let delta = snappedHour12 - previousHour12
  if (delta > 6) delta -= 12
  if (delta < -6) delta += 12
  return totalMinutes + delta * 60
}

export function formatHm(totalMinutes: number, hoursMod = 24): string {
  const normalized = normalizeMod(totalMinutes, hoursMod * 60)
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

export function parseHm(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  if (minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

export function clampDurationMinutes(totalMinutes: number, min = 5, max = MINUTES_PER_CLOCK): number {
  return Math.max(min, Math.min(max, totalMinutes))
}

export function isQuarterHour(minute: number): boolean {
  return minute % 15 === 0
}
