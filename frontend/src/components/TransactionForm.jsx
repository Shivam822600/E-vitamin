import { useEffect, useMemo, useState } from "react"

const today = new Date().toISOString().slice(0, 10)

const TransactionForm = ({ categories, onSubmit, saving }) => {
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    categoryId: "",
    transactionDate: today,
    description: ""
  })
  const [error, setError] = useState("")

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  )

  useEffect(() => {
    setForm((current) => ({
      ...current,
      categoryId: availableCategories[0]?.id || ""
    }))
  }, [availableCategories])

  const updateField = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!form.categoryId) {
      setError("Choose a category")
      return
    }

    if (Number(form.amount) <= 0) {
      setError("Amount should be greater than zero")
      return
    }

    const ok = await onSubmit({
      ...form,
      amount: Number(form.amount),
      categoryId: Number(form.categoryId)
    })

    if (ok) {
      setForm((current) => ({
        ...current,
        amount: "",
        description: "",
        transactionDate: today
      }))
    }
  }

  return (
    <form className="panel transaction-form" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <h2>Add transaction</h2>
      </div>

      {error && <p className="form-error">{error}</p>}

      <label>
        Type
        <select name="type" value={form.type} onChange={updateField}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      <label>
        Amount
        <input
          name="amount"
          type="number"
          min="1"
          step="0.01"
          value={form.amount}
          onChange={updateField}
          required
        />
      </label>

      <label>
        Category
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={updateField}
          required
        >
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          name="transactionDate"
          type="date"
          value={form.transactionDate}
          onChange={updateField}
          required
        />
      </label>

      <label className="full-row">
        Description
        <input
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="Optional"
        />
      </label>

      <button className="primary-btn full-row" disabled={saving}>
        {saving ? "Saving..." : "Save transaction"}
      </button>
    </form>
  )
}

export default TransactionForm
