import { Section } from "../ui/Section"
import { money } from "../lib/utils"

export function SettingsSection({ goal }: { goal: number }) {
  return (
    <Section title="Finance Settings" description="Reference target settings for monthly performance.">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">Monthly net-profit target</p>
        <p className="mt-1 text-xl font-semibold text-slate-950">{money(goal)}</p>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        This tab is currently read-only. Connect it to persisted settings when backend finance storage is available.
      </p>
    </Section>
  )
}
