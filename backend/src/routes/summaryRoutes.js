const express = require("express")
const {
  getDashboard,
  getMonthlyCategorySummary
} = require("../controllers/summaryController")
const { protect } = require("../middleware/authmiddleware")

const router = express.Router()

router.use(protect)

router.get("/dashboard", getDashboard)
router.get("/monthly-by-category", getMonthlyCategorySummary)

module.exports = router
