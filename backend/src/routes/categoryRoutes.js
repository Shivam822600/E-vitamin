const express = require("express")
const {
  getCategories,
  createCategory
} = require("../controllers/categoryController")
const { protect } = require("../middleware/authmiddleware")

const router = express.Router()

router.use(protect)

router
  .route("/")
  .get(getCategories)
  .post(createCategory)

module.exports = router
