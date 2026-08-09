import assert from 'node:assert/strict'
import {
  applyHour12Snap,
  applyMinuteSnap,
  formatHm,
  hourAngle,
  minuteAngle,
  normalizeMod,
  snapMinuteFromDegrees,
} from '../src/lib/clockMath.ts'

// 10:55 → 11:00 via minute wrap
{
  const start = 10 * 60 + 55
  const next = applyMinuteSnap(start, 0, 55)
  assert.equal(next, 11 * 60)
  assert.equal(formatHm(next), '11:00')
}

// 11:00 → 10:55 reverse wrap
{
  const start = 11 * 60
  const next = applyMinuteSnap(start, 55, 0)
  assert.equal(next, 10 * 60 + 55)
}

// 23:55 → 00:00 day wrap
{
  const start = 23 * 60 + 55
  const next = normalizeMod(applyMinuteSnap(start, 0, 55), 24 * 60)
  assert.equal(next, 0)
  assert.equal(formatHm(next), '00:00')
}

// angles stay 1:1 with total minutes
{
  const total = 10 * 60 + 30
  assert.equal(minuteAngle(30), 180)
  assert.equal(hourAngle(total), (10 + 0.5) * 30)
}

// hour hand wrap 11 → 0 advances
{
  const start = 11 * 60 + 20
  const next = applyHour12Snap(start, 0, 11)
  assert.equal(next, 12 * 60 + 20)
}

assert.equal(snapMinuteFromDegrees(0), 0)
assert.equal(snapMinuteFromDegrees(29), 5)
assert.equal(snapMinuteFromDegrees(31), 5)

console.log('clockMath acceptance checks passed')
