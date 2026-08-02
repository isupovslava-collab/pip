import type { Option } from '../data/dictionaries'
import { Icon, OptionMarker } from './Icon'

interface WizardStepProps<T extends string> {
  title: string
  description?: string
  options: Option<T>[]
  selected?: T
  onSelect: (id: T) => void
}

export function WizardStep<T extends string>({ title, description, options, selected, onSelect }: WizardStepProps<T>) {
  return (
    <fieldset aria-describedby={description ? 'wizard-step-description' : undefined}>
      <legend className="text-2xl font-bold tracking-tight text-navy sm:text-[2rem]">{title}</legend>
      {description && <p id="wizard-step-description" className="mt-2 mb-6 max-w-3xl text-sm leading-6 text-muted sm:text-base">{description}</p>}
      {!description && <div className="mb-6" />}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {options.map((option, index) => {
          const isSelected = selected === option.id
          return (
            <label key={option.id} className={`group relative flex min-h-28 cursor-pointer items-start gap-4 rounded-2xl border p-4 transition duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue has-[:focus-visible]:ring-offset-2 sm:p-5 ${isSelected ? 'border-blue bg-sky-50 shadow-focus' : 'border-line bg-white hover:-translate-y-0.5 hover:border-bright hover:shadow-card'}`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors ${isSelected ? 'bg-blue text-white' : 'bg-slate-100 text-blue group-hover:bg-sky-50'}`}><OptionMarker index={index} /></span>
              <span className="min-w-0 pr-7">
                <span className="block text-base font-semibold text-ink">{option.label}</span>
                <span className="mt-1.5 block text-sm leading-5 text-muted">{option.description}</span>
              </span>
              <input type="radio" name={title} value={option.id} checked={isSelected} onChange={() => onSelect(option.id)} className="absolute right-4 top-4 h-5 w-5 accent-[#0A78C2]" />
              {isSelected && <span aria-hidden="true" className="absolute bottom-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-blue text-white"><Icon name="check" className="h-4 w-4" /></span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
