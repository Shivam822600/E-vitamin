const asyncHandler = require("../utils/asyncHandler")
const authService = require("../services/authService")

const registerUser = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result
  })
})

const loginUser = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)

  res.json({
    success: true,
    message: "Login successful",
    data: result
  })
})

const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  })
})

module.exports = {
  registerUser,
  loginUser,
  getProfile
}
