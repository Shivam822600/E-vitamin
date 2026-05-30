const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const authRoutes = require("./routes/authRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const transactionRoutes = require("./routes/transactionRoutes")
const summaryRoutes = require("./routes/summaryRoutes")
const { errorHandler, notFound } = require("./middleware/errorMiddleware")

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
)

app.get("/", (req, res) => {
  res.json({ message: "API Running" })
})

app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/summary", summaryRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
