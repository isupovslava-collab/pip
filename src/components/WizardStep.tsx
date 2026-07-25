import type { Option } from '../data/dictionaries'

interface WizardStepProps<T extends string> {
  title: string
  options: Option<T>[]
  selected?: T
  onSelect: (id: T) => void
}

export function WizardStep<T extends string>({ title, options, selected, onSelect }: WizardStepProps<T>) {
  return (
    <fieldset>
      <legend className="mb-6 text-2xl font-bold text-navy sm:text-3xl">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected === option.id
          return (
            <label key={option.id} className={`group flex min-h-28 cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${isSelected ? 'border-blue bg-sky-50' : 'border-line bg-white hover:border-sky-300'}`}>
              <input type="radio" name={title} value={option.id} checked={isSelected} onChange={() => onSelect(option.id)} className="mt-1 h-5 w-5 accent-[#0A78C2]" />
              <span>
                <span className="block font-bold text-ink">{option.label}</span>
                <span className="mt-1 block text-sm leading-6 text-muted">{option.description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
