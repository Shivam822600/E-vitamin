const { pool } = require("../config/db")

const publicFields = "id, name, email, created_at"

const findByEmail = async (email) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email])
  return rows[0]
}

const findById = async (id) => {
  const [rows] = await pool.execute(`SELECT ${publicFields} FROM users WHERE id = ?`, [id])
  return rows[0]
}

const create = async ({ name, email, password }) => {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  )
  return findById(result.insertId)
}

module.exports = {
  findByEmail,
  findById,
  create
}
