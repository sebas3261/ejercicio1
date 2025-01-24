import React, { useState } from 'react'
import {  useNavigate, NavLink } from "react-router";
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const {login} = useAuth()
    const navigate = useNavigate();

    const handleLogIn = () => {
        login({name, password, type: "user"})
        navigate("/admindashboard")
    }
  return (
    <div>
        <h1>Sign in</h1>
        <div>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Name"
            />
        </div>
        <div>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
            />
        </div>
        <div onClick={()=>{handleLogIn()}}>
            sign in
        </div>
        <NavLink to={"/SignUp"}>
            <div>signUp</div>
        </NavLink>
    </div>
  )
}