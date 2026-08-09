import assert from 'node:assert/strict'
import {
  buildTask,
  compareByTime,
  isInboxTask,
  selectInboxTasks,
  selectMainQuest,
  selectNearestTimed,
  selectTimelineTasks,
  selectTodayTasks,
  todayISO,
  type Task,
} from '../src/features/tasks/taskModel.ts'

const day = '2026-08-09'

const sample: Task[] = [
  {
    id: '1',
    title: 'Main',
    description: '',
    group: 'main',
    status: 'open',
    date: day,
    time: '10:00',
    estimatedMinutes: 45,
    xpReward: 90,
    difficulty: 4,
    goalId: null,
    goalTitle: 'Goal',
    skillId: null,
    skillName: 'Craft',
    completedAt: null,
    isMainQuest: true,
  },
  {
    id: '2',
    title: 'Later',
    description: '',
    group: 'daily',
    status: 'open',
    date: day,
    time: '18:00',
    estimatedMinutes: 20,
    xpReward: 20,
    difficulty: 2,
    goalId: null,
    goalTitle: null,
    skillId: null,
    skillName: null,
    completedAt: null,
    isMainQuest: false,
  },
  {
    id: '3',
    title: 'Inbox note',
    description: '',
    group: 'side',
    status: 'open',
    date: null,
    time: null,
    estimatedMinutes: 15,
    xpReward: 10,
    difficulty: 1,
    goalId: null,
    goalTitle: null,
    skillId: null,
    skillName: null,
    completedAt: null,
    isMainQuest: false,
  },
  {
    id: '4',
    title: 'Done morning',
    description: '',
    group: 'daily',
    status: 'done',
    date: day,
    time: '08:00',
    estimatedMinutes: 10,
    xpReward: 10,
    difficulty: 1,
    goalId: null,
    goalTitle: null,
    skillId: null,
    skillName: null,
    completedAt: '2026-08-09T08:30:00.000Z',
    isMainQuest: false,
  },
]

assert.equal(todayISO(new Date(2026, 7, 9, 12, 0, 0)), '2026-08-09')
assert.equal(selectTodayTasks(sample, day).length, 3)
assert.equal(selectTodayTasks(sample, day)[0]?.id, '1')
assert.equal(selectTodayTasks(sample, day).at(-1)?.id, '4')
assert.equal(selectMainQuest(sample, day)?.id, '1')
assert.equal(selectInboxTasks(sample).length, 1)
assert.ok(isInboxTask(sample[2]!))
assert.equal(selectTimelineTasks(sample, day).map((t) => t.id).join(','), '4,1,2')

const nearest = selectNearestTimed(sample, day, new Date('2026-08-09T11:00:00'))
assert.equal(nearest?.id, '2')

assert.ok(compareByTime(sample[0]!, sample[1]!) < 0)

const created = buildTask({ title: '  New quest  ', date: day })
assert.equal(created.title, 'New quest')
assert.equal(created.date, day)
assert.equal(created.status, 'open')
assert.equal(created.estimatedMinutes, 25)

console.log('taskModel acceptance checks passed')
