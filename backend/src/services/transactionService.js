const AppError = require("../utils/AppError")
const transactionRepository = require("../repositories/transactionRepository")
const categoryService = require("./categoryService")

const validTypes = ["income", "expense"]

const isValidDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const toDateOnly = (value) => String(value).slice(0, 10)

const buildDate = (year, month, day) => {
  const paddedMonth = String(month).padStart(2, "0")
  const paddedDay = String(day).padStart(2, "0")
  return `${year}-${paddedMonth}-${paddedDay}`
}

const parseId = (value, label) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`${label} is invalid`, 400)
  }
  return id
}

const normalizeTransactionInput = async (payload, userId) => {
  const { type, amount, categoryId, category_id, transactionDate, transaction_date, description } = payload
  const selectedCategoryId = parseId(categoryId || category_id, "Category")
  const selectedDate = transactionDate || transaction_date

  if (!validTypes.includes(type)) {
    throw new AppError("Transaction type must be income or expense", 400)
  }

  if (!selectedCategoryId) {
    throw new AppError("Category is required", 400)
  }

  const parsedAmount = Number(amount)
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new AppError("Amount must be greater than zero", 400)
  }

  if (!isValidDate(selectedDate)) {
    throw new AppError("A valid transaction date is required", 400)
  }

  const category = await categoryService.getAccessibleCategory(selectedCategoryId, userId)
  if (category.type !== type) {
    throw new AppError("Category type does not match transaction type", 400)
  }

  return {
    type,
    amount: parsedAmount,
    categoryId: selectedCategoryId,
    transactionDate: toDateOnly(selectedDate),
    description: description ? String(description).trim() : null
  }
}

const createTransaction = async (payload, userId) => {
  const data = await normalizeTransactionInput(payload, userId)
  return transactionRepository.create({ ...data, userId })
}

const listTransactions = async (query, userId) => {
  const page = Math.max(Number(query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100)

  if (query.type && !validTypes.includes(query.type)) {
    throw new AppError("Transaction type must be income or expense", 400)
  }

  if (query.startDate && !isValidDate(query.startDate)) {
    throw new AppError("Start date is invalid", 400)
  }

  if (query.endDate && !isValidDate(query.endDate)) {
    throw new AppError("End date is invalid", 400)
  }

  const { rows, total } = await transactionRepository.findAll({
    userId,
    page,
    limit,
    type: query.type,
    categoryId: query.categoryId ? parseId(query.categoryId, "Category") : null,
    startDate: query.startDate ? toDateOnly(query.startDate) : null,
    endDate: query.endDate ? toDateOnly(query.endDate) : null
  })

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

const getTransaction = async (id, userId) => {
  const transactionId = parseId(id, "Transaction")
  const transaction = await transactionRepository.findById(transactionId, userId)
  if (!transaction) {
    throw new AppError("Transaction not found", 404)
  }
  return transaction
}

const updateTransaction = async (id, payload, userId) => {
  const transactionId = parseId(id, "Transaction")
  const existingTransaction = await transactionRepository.findById(transactionId, userId)
  if (!existingTransaction) {
    throw new AppError("Transaction not found", 404)
  }

  const data = await normalizeTransactionInput(payload, userId)
  return transactionRepository.update(transactionId, userId, data)
}

const deleteTransaction = async (id, userId) => {
  const transactionId = parseId(id, "Transaction")
  const deleted = await transactionRepository.remove(transactionId, userId)
  if (!deleted) {
    throw new AppError("Transaction not found", 404)
  }
}

const currentMonthRange = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate()

  return {
    startDate: buildDate(year, month, 1),
    endDate: buildDate(year, month, lastDay),
    year,
    month
  }
}

const getDashboard = async (userId) => {
  const { startDate, endDate, year, month } = currentMonthRange()
  const [totals, expensesByCategory, recentTransactions] = await Promise.all([
    transactionRepository.getDashboardSummary(userId, startDate, endDate),
    transactionRepository.getMonthlyCategorySummary(userId, startDate, endDate),
    transactionRepository.getRecent(userId, 5)
  ])

  return {
    month: `${year}-${String(month).padStart(2, "0")}`,
    totals,
    expensesByCategory,
    recentTransactions
  }
}

const getMonthlySummaryByCategory = async ({ userId, year, month }) => {
  const selectedYear = Number(year)
  const selectedMonth = Number(month)

  if (!selectedYear || selectedYear < 2000 || selectedYear > 2100) {
    throw new AppError("A valid year is required", 400)
  }

  if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
    throw new AppError("A valid month is required", 400)
  }

  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
  const endDate = buildDate(selectedYear, selectedMonth, lastDay)

  return transactionRepository.getMonthlyCategorySummary(userId, startDate, endDate)
}

module.exports = {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboard,
  getMonthlySummaryByCategory
}
