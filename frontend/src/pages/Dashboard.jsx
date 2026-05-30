import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import API from "../api/axios"
import TransactionForm from "../components/TransactionForm"
import TransactionList from "../components/TransactionList"
import { useAuth } from "../context/AuthContext"

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  })

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: "",
    categoryId: "",
    startDate: "",
    endDate: ""
  })
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    return params.toString()
  }, [filters])

  const loadDashboard = useCallback(async () => {
    const response = await API.get("/summary/dashboard")
    setDashboard(response.data.data)
  }, [])

  const loadCategories = useCallback(async () => {
    const response = await API.get("/categories")
    setCategories(response.data.data)
  }, [])

  const loadTransactions = useCallback(async () => {
    const response = await API.get(`/transactions?${queryString}`)
    setTransactions(response.data.data)
    setPagination(response.data.pagination)
  }, [queryString])

  const loadPage = useCallback(async () => {
    setError("")
    setLoading(true)

    try {
      await Promise.all([
        loadDashboard(),
        loadCategories(),
        loadTransactions()
      ])
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [loadDashboard, loadCategories, loadTransactions])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const saveTransaction = async (payload) => {
    setError("")
    setSaving(true)

    try {
      await API.post("/transactions", payload)
      await Promise.all([loadDashboard(), loadTransactions()])
      return true
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save transaction")
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteTransaction = async (id) => {
    setError("")

    try {
      await API.delete(`/transactions/${id}`)
      await Promise.all([loadDashboard(), loadTransactions()])
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete transaction")
    }
  }

  const updateFilters = (nextFilters) => {
    setFilters((current) => ({
      ...current,
      ...nextFilters
    }))
  }

  const changePage = (page) => {
    updateFilters({ page })
  }

  const chartData = dashboard?.expensesByCategory?.map((item) => ({
    name: item.category_name,
    total: Number(item.total)
  })) || []

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Expense Tracker</p>
          <h1>Dashboard</h1>
        </div>

        <div className="topbar-actions">
          <span>{user?.name}</span>
          <button className="secondary-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <p className="form-error">{error}</p>}

      <section className="summary-grid">
        <div className="metric">
          <span>Balance</span>
          <strong>{formatCurrency(dashboard?.totals?.balance)}</strong>
        </div>
        <div className="metric">
          <span>Income this month</span>
          <strong className="income-text">{formatCurrency(dashboard?.totals?.totalIncome)}</strong>
        </div>
        <div className="metric">
          <span>Expenses this month</span>
          <strong className="expense-text">{formatCurrency(dashboard?.totals?.totalExpenses)}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <h2>Expenses by category</h2>
            <span>{dashboard?.month}</span>
          </div>

          <div className="chart-box">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No expense data for this month</div>
            )}
          </div>
        </div>

        <TransactionForm
          categories={categories}
          onSubmit={saveTransaction}
          saving={saving}
        />
      </section>

      <TransactionList
        transactions={transactions}
        categories={categories}
        filters={filters}
        pagination={pagination}
        onFilterChange={updateFilters}
        onPageChange={changePage}
        onDelete={deleteTransaction}
        loading={loading}
      />
    </main>
  )
}

export default Dashboard
