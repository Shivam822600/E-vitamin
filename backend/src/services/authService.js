const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const AppError = require("../utils/AppError")
const userRepository = require("../repositories/userRepository")

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT secret is not configured", 500)
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  })
}

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400)
  }

  const normalizedEmail = email.toLowerCase().trim()
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new AppError("Name is required", 400)
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400)
  }

  const existingUser = await userRepository.findByEmail(normalizedEmail)
  if (existingUser) {
    throw new AppError("Email is already registered", 409)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await userRepository.create({
    name: trimmedName,
    email: normalizedEmail,
    password: hashedPassword
  })

  return {
    user,
    token: signToken(user.id)
  }
}

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400)
  }

  const user = await userRepository.findByEmail(email.toLowerCase().trim())
  if (!user) {
    throw new AppError("Invalid email or password", 401)
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401)
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token: signToken(user.id)
  }
}

module.exports = {
  register,
  login
}
