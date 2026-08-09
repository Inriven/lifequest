type Difficulty = 1 | 2 | 3 | 4 | 5

export function DifficultyDots({ value }: { value: Difficulty }) {
  return (
    <span className="difficulty" aria-label={`Сложность ${value} из 5`} title={`Сложность ${value}/5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={index < value ? 'on' : ''} />
      ))}
    </span>
  )
}
