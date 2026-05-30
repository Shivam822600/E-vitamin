import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        const loadUser = async ()=>{
            const token = localStorage.getItem("token")

            if(!token){
                setLoading(false)
                return
            }

            try{
                const response = await API.get("/auth/me")
                setUser(response.data.data)
            }catch(error){
                localStorage.removeItem("token")
                setUser(null)
            }finally{
                setLoading(false)
            }
        }

        loadUser()
    },[])

    const login = (payload)=>{
        localStorage.setItem("token",payload.token)
        setUser(payload.user)
    }

    const logout = ()=>{
        localStorage.removeItem("token")
        setUser(null)
    }

    const value = useMemo(()=>({
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user)
    }),[user,loading])

    return(
        <AuthContext.Provider
        value={value}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext)

export default AuthProvider
