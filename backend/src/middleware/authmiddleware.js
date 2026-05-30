const jwt = require("jsonwebtoken")
const AppError = require("../utils/AppError")
const asyncHandler = require("../utils/asyncHandler")
const userRepository = require("../repositories/userRepository")

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401)
  }

  const token = authHeader.split(" ")[1]
  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new AppError("Invalid or expired token", 401)
  }
  const user = await userRepository.findById(decoded.id)

  if (!user) {
    throw new AppError("User no longer exists", 401)
  }

  req.user = user
  next()
})

module.exports = {
  protect
}
