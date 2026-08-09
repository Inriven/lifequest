/** Pure clock helpers. Hands are views of totalMinutes, never independent state.
 *
 * Angle contract (must match CSS):
 * - 0° points to 12 o'clock
 * - angles increase clockwise
 * - minuteAngle = minutes * 6
 * - hourAngle = ((hours % 12) + minutes / 60) * 30
 *
 * CSS hands must pivot at the dial center and extend upward at rotate(0).
 */

export const MINUTES_PER_DAY = 24 * 60
export const MINUTES_PER_CLOCK = 12 * 60
/** Documented visual contract for AnalogClock CSS. */
export const CLOCK_ZERO_DEG_HOUR = 12 as const

export function normalizeMod(value: number, max: number): number {
  return ((value % max) + max) % max
}

/** Shortest signed delta on a circle, in (-half, half]. */
export function shortestDelta(from: number, to: number, period: number): number {
  let delta = to - from
  const half = period / 2
  if (delta > half) delta -= period
  if (delta <= -half) delta += period
  return delta
}

/**
 * Pointer angle relative to dial center.
 * 12 o'clock = 0°, clockwise positive (3 = 90°, 6 = 180°, 9 = 270°).
 */
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
 * Uses shortest-path across the 359°↔0° / 55↔00 boundary.
 */
export function applyMinuteSnap(totalMinutes: number, snappedMinute: number, previousMinute: number): number {
  const delta = shortestDelta(previousMinute, snappedMinute, 60)
  return totalMinutes + delta
}

/** Apply a 12-hour hand snap with wrap across 11↔0. */
export function applyHour12Snap(totalMinutes: number, snappedHour12: number, previousHour12: number): number {
  const delta = shortestDelta(previousHour12, snappedHour12, 12)
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

/** Angles for a wall-clock reading; used by visual QA asserts. */
export function anglesForHm(hours: number, minutes: number): { minute: number; hour: number } {
  const total = hours * 60 + minutes
  return {
    minute: minuteAngle(minutes),
    hour: hourAngle(total),
  }
}
