import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";
import API from "../api/axios"
import { useAuth } from "../context/AuthContext";

const Login=()=>{
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email,setEmail] =  useState("")
    const [password, setPassword] = useState("")
    const [error,setError] = useState("")
    const [loading,setLoading] = useState(false)

    const handleLogin = async (event)=>{
        event.preventDefault()
        setError("")
        setLoading(true)

        try{
            const response  = await API.post("/auth/login",{
                email,password
            })
            login(response.data.data)
            navigate("/dashboard")
        }catch(error){
            setError(error.response?.data?.message || "Unable to login")
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="auth-page">
            <form className="auth-box" onSubmit={handleLogin}>
                <div>
                    <p className="eyebrow">Expense Tracker</p>
                    <h1>Login</h1>
                </div>

                {error && <p className="form-error">{error}</p>}

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        required
                    />
                </label>

                <button className="primary-btn" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>

                <p className="muted">
                    New here? <Link to="/register">Create account</Link>
                </p>
            </form>
        </div>
    )
}

export default Login
