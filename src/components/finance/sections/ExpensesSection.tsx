import type { Expense } from "../model/types"
import { Section } from "../ui/Section"
import { money } from "../lib/utils"

type ExpensesSectionProps = {
  expenses: Expense[]
}

export function ExpensesSection({ expenses }: ExpensesSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Section
        title="Expense List"
        description="Track ads, packaging, delivery, platform fees, transaction fees, refunds, and other costs."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4">Expense</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Description</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-950">{expense.name}</td>
                  <td className="py-3 pr-4 text-slate-600">{expense.category}</td>
                  <td className="py-3 pr-4 font-medium text-slate-950">{money(expense.amount)}</td>
                  <td className="py-3 pr-4 text-slate-600">{expense.date}</td>
                  <td className="py-3 pr-4 text-slate-600">{expense.paymentMethod}</td>
                  <td className="py-3 pr-4 text-slate-600">{expense.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Add Expense">
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Expense Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
              placeholder="Example: Packaging"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950">
              <option>Ads</option>
              <option>Packaging</option>
              <option>Delivery</option>
              <option>Platform fee</option>
              <option>Transaction fee</option>
              <option>Staff</option>
              <option>Storage</option>
              <option>Refund</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Save Expense
          </button>
        </form>
      </Section>
    </div>
  )
}