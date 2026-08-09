import assert from 'node:assert/strict'
import {
  anglesForHm,
  applyHour12Snap,
  applyMinuteSnap,
  CLOCK_ZERO_DEG_HOUR,
  formatHm,
  hourAngle,
  minuteAngle,
  normalizeMod,
  pointerDegrees,
  shortestDelta,
  snapMinuteFromDegrees,
} from '../src/lib/clockMath.ts'

function almost(actual: number, expected: number, eps = 0.01) {
  assert.ok(Math.abs(actual - expected) <= eps, `expected ${expected}, got ${actual}`)
}

assert.equal(CLOCK_ZERO_DEG_HOUR, 12)

// Visual CSS contract: 0° means 12 o'clock on both hands.
const cases: Array<[number, number, number, number]> = [
  // hours, minutes, expectedMinuteAngle, expectedHourAngle
  [0, 0, 0, 0],
  [3, 0, 0, 90],
  [6, 0, 0, 180],
  [9, 0, 0, 270],
  [10, 55, 330, (10 + 55 / 60) * 30],
  [11, 0, 0, 330],
  [11, 55, 330, (11 + 55 / 60) * 30],
  [12, 0, 0, 0],
  [23, 55, 330, ((23 % 12) + 55 / 60) * 30],
]

for (const [h, m, minuteDeg, hourDeg] of cases) {
  const angles = anglesForHm(h, m)
  almost(angles.minute, minuteDeg)
  almost(angles.hour, hourDeg)
  assert.equal(minuteAngle(m), minuteDeg)
  assert.equal(hourAngle(h * 60 + m), hourDeg)
}

// Pointer math: 12=0, 3=90, 6=180, 9=270
{
  const cx = 100
  const cy = 100
  almost(pointerDegrees(cx, cy - 40, cx, cy), 0)
  almost(pointerDegrees(cx + 40, cy, cx, cy), 90)
  almost(pointerDegrees(cx, cy + 40, cx, cy), 180)
  almost(pointerDegrees(cx - 40, cy, cx, cy), 270)
}

// 10:55 → 11:00 via minute wrap (forward through 12-boundary of minute dial)
{
  const start = 10 * 60 + 55
  const next = applyMinuteSnap(start, 0, 55)
  assert.equal(next, 11 * 60)
  assert.equal(formatHm(next), '11:00')
  almost(hourAngle(next), 330)
}

// 11:00 → 10:55 reverse wrap
{
  const start = 11 * 60
  const next = applyMinuteSnap(start, 55, 0)
  assert.equal(next, 10 * 60 + 55)
  almost(hourAngle(next), (10 + 55 / 60) * 30)
}

// 23:55 → 00:00 day wrap
{
  const start = 23 * 60 + 55
  const next = normalizeMod(applyMinuteSnap(start, 0, 55), 24 * 60)
  assert.equal(next, 0)
  assert.equal(formatHm(next), '00:00')
  almost(hourAngle(next), 0)
  almost(minuteAngle(0), 0)
}

// Forward across 12 with hour hand 11 → 0
{
  const start = 11 * 60 + 20
  const next = applyHour12Snap(start, 0, 11)
  assert.equal(next, 12 * 60 + 20)
  almost(hourAngle(next), (0 + 20 / 60) * 30)
}

// Backward across 12 with hour hand 0 → 11
{
  const start = 12 * 60 + 10
  const next = applyHour12Snap(start, 11, 0)
  assert.equal(next, 11 * 60 + 10)
}

// shortest path across 359↔0 style minute boundary
assert.equal(shortestDelta(55, 0, 60), 5)
assert.equal(shortestDelta(0, 55, 60), -5)
assert.equal(shortestDelta(11, 0, 12), 1)
assert.equal(shortestDelta(0, 11, 12), -1)

assert.equal(snapMinuteFromDegrees(0), 0)
assert.equal(snapMinuteFromDegrees(29), 5)
assert.equal(snapMinuteFromDegrees(31), 5)
assert.equal(snapMinuteFromDegrees(359), 0)

console.log('clockMath acceptance checks passed')
