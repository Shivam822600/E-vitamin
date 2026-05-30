const asyncHandler = require("../utils/asyncHandler")
const transactionService = require("../services/transactionService")

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body, req.user.id)

  res.status(201).json({
    success: true,
    message: "Transaction created",
    data: transaction
  })
})

const getTransactions = asyncHandler(async (req, res) => {
  const result = await transactionService.listTransactions(req.query, req.user.id)

  res.json({
    success: true,
    ...result
  })
})

const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransaction(Number(req.params.id), req.user.id)

  res.json({
    success: true,
    data: transaction
  })
})

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(
    Number(req.params.id),
    req.body,
    req.user.id
  )

  res.json({
    success: true,
    message: "Transaction updated",
    data: transaction
  })
})

const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(Number(req.params.id), req.user.id)

  res.json({
    success: true,
    message: "Transaction deleted"
  })
})

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
}
