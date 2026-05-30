const asyncHandler = require("../utils/asyncHandler")
const transactionService = require("../services/transactionService")

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await transactionService.getDashboard(req.user.id)

  res.json({
    success: true,
    data: dashboard
  })
})

const getMonthlyCategorySummary = asyncHandler(async (req, res) => {
  const summary = await transactionService.getMonthlySummaryByCategory({
    userId: req.user.id,
    year: req.query.year,
    month: req.query.month
  })

  res.json({
    success: true,
    data: summary
  })
})

module.exports = {
  getDashboard,
  getMonthlyCategorySummary
}
