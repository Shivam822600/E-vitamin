const express = require("express");
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTransactions)
  .post(createTransaction);

router
  .route("/:id")
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
