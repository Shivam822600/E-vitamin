const { pool } = require("../config/db")

const findAllForUser = async (userId, type) => {
  const params = [userId]
  let query = `
    SELECT id, name, type, user_id
    FROM categories
    WHERE (user_id IS NULL OR user_id = ?)
  `

  if (type) {
    query += " AND type = ?"
    params.push(type)
  }

  query += " ORDER BY type, name"

  const [rows] = await pool.execute(query, params)
  return rows
}

const findAccessibleById = async (id, userId) => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, type, user_id
      FROM categories
      WHERE id = ? AND (user_id IS NULL OR user_id = ?)
    `,
    [id, userId]
  )
  return rows[0]
}

const createForUser = async ({ name, type, userId }) => {
  const [result] = await pool.execute(
    "INSERT INTO categories (name, type, user_id) VALUES (?, ?, ?)",
    [name, type, userId]
  )
  return findAccessibleById(result.insertId, userId)
}

module.exports = {
  findAllForUser,
  findAccessibleById,
  createForUser
}
