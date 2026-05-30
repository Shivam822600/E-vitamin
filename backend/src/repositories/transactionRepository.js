const { pool } = require("../config/db")

const baseSelect = `
  SELECT
    t.id,
    t.type,
    t.amount,
    t.transaction_date,
    t.description,
    t.created_at,
    c.id AS category_id,
    c.name AS category_name
  FROM transactions t
  INNER JOIN categories c ON c.id = t.category_id
`

const create = async ({ userId, categoryId, type, amount, transactionDate, description }) => {
  const [result] = await pool.execute(
    `
      INSERT INTO transactions
        (user_id, category_id, type, amount, transaction_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, categoryId, type, amount, transactionDate, description || null]
  )
  return findById(result.insertId, userId)
}

const findById = async (id, userId) => {
  const [rows] = await pool.execute(
    `${baseSelect} WHERE t.id = ? AND t.user_id = ?`,
    [id, userId]
  )
  return rows[0]
}

const findAll = async ({ userId, page, limit, type, categoryId, startDate, endDate }) => {
  const filters = ["t.user_id = ?"]
  const params = [userId]

  if (type) {
    filters.push("t.type = ?")
    params.push(type)
  }

  if (categoryId) {
    filters.push("t.category_id = ?")
    params.push(categoryId)
  }

  if (startDate) {
    filters.push("t.transaction_date >= ?")
    params.push(startDate)
  }

  if (endDate) {
    filters.push("t.transaction_date <= ?")
    params.push(endDate)
  }

  const where = `WHERE ${filters.join(" AND ")}`
  const offset = (page - 1) * limit

  const [rows] = await pool.query(
    `${baseSelect} ${where} ORDER BY t.transaction_date DESC, t.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM transactions t ${where}`,
    params
  )

  return {
    rows,
    total: countRows[0].total
  }
}

const update = async (id, userId, data) => {
  await pool.execute(
    `
      UPDATE transactions
      SET category_id = ?, type = ?, amount = ?, transaction_date = ?, description = ?
      WHERE id = ? AND user_id = ?
    `,
    [
      data.categoryId,
      data.type,
      data.amount,
      data.transactionDate,
      data.description || null,
      id,
      userId
    ]
  )
  return findById(id, userId)
}

const remove = async (id, userId) => {
  const [result] = await pool.execute(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
    [id, userId]
  )
  return result.affectedRows > 0
}

const getDashboardSummary = async (userId, startDate, endDate) => {
  const [rows] = await pool.execute(
    `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
      FROM transactions
      WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
    `,
    [userId, startDate, endDate]
  )
  return rows[0]
}

const getMonthlyCategorySummary = async (userId, startDate, endDate) => {
  const [rows] = await pool.execute(
    `
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
        COUNT(t.id) AS transaction_count,
        SUM(t.amount) AS total
      FROM transactions t
      INNER JOIN categories c ON c.id = t.category_id
      WHERE
        t.user_id = ?
        AND t.type = 'expense'
        AND t.transaction_date BETWEEN ? AND ?
      GROUP BY c.id, c.name, DATE_FORMAT(t.transaction_date, '%Y-%m')
      ORDER BY total DESC
    `,
    [userId, startDate, endDate]
  )
  return rows
}

const getRecent = async (userId, limit = 5) => {
  const [rows] = await pool.query(
    `${baseSelect} WHERE t.user_id = ? ORDER BY t.transaction_date DESC, t.id DESC LIMIT ?`,
    [userId, limit]
  )
  return rows
}

module.exports = {
  create,
  findById,
  findAll,
  update,
  remove,
  getDashboardSummary,
  getMonthlyCategorySummary,
  getRecent
}
