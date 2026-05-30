const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  })

const TransactionList = ({
  transactions,
  filters,
  categories,
  pagination,
  onFilterChange,
  onPageChange,
  onDelete,
  loading
}) => {
  const updateFilter = (event) => {
    onFilterChange({
      ...filters,
      page: 1,
      [event.target.name]: event.target.value
    })
  }

  return (
    <section className="panel transaction-list">
      <div className="panel-heading">
        <h2>Transactions</h2>
      </div>

      <div className="filters">
        <select name="type" value={filters.type} onChange={updateFilter}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select name="categoryId" value={filters.categoryId} onChange={updateFilter}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={updateFilter}
        />

        <input
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={updateFilter}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{String(transaction.transaction_date).slice(0, 10)}</td>
                <td>
                  <strong>{transaction.category_name}</strong>
                  {transaction.description && <span>{transaction.description}</span>}
                </td>
                <td>
                  <span className={`status ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>
                <td className={transaction.type === "income" ? "income-text" : "expense-text"}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td>
                  <button className="ghost-btn" onClick={() => onDelete(transaction.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="secondary-btn"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>
        <button
          className="secondary-btn"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default TransactionList
