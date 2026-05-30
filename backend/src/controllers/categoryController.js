const asyncHandler = require("../utils/asyncHandler")
const categoryService = require("../services/categoryService")

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.user.id, req.query.type)

  res.json({
    success: true,
    data: categories
  })
})

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory({
    userId: req.user.id,
    ...req.body
  })

  res.status(201).json({
    success: true,
    message: "Category created",
    data: category
  })
})

module.exports = {
  getCategories,
  createCategory
}
