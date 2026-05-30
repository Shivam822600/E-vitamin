const AppError = require("../utils/AppError")
const categoryRepository = require("../repositories/categoryRepository")

const validTypes = ["income", "expense"]

const listCategories = async (userId, type) => {
  if (type && !validTypes.includes(type)) {
    throw new AppError("Category type must be income or expense", 400)
  }

  return categoryRepository.findAllForUser(userId, type)
}

const createCategory = async ({ userId, name, type }) => {
  if (!name || !type) {
    throw new AppError("Category name and type are required", 400)
  }

  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new AppError("Category name is required", 400)
  }

  if (!validTypes.includes(type)) {
    throw new AppError("Category type must be income or expense", 400)
  }

  try {
    return await categoryRepository.createForUser({
      userId,
      name: trimmedName,
      type
    })
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new AppError("Category already exists", 409)
    }
    throw error
  }
}

const getAccessibleCategory = async (categoryId, userId) => {
  const category = await categoryRepository.findAccessibleById(categoryId, userId)
  if (!category) {
    throw new AppError("Category not found", 404)
  }
  return category
}

module.exports = {
  listCategories,
  createCategory,
  getAccessibleCategory
}
