import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import API from "../api/axios"
import { useAuth } from "../context/AuthContext"

const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await API.post("/auth/register", formData)
      login(response.data.data)
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Expense Tracker</p>
          <h1>Create account</h1>
        </div>

        {error && <p className="form-error">{error}</p>}

        <label>
          Name
          <input
            name="name"
            value={formData.name}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={updateField}
            required
          />
        </label>

        <button className="primary-btn" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
