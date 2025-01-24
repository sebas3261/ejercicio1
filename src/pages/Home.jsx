import React, { useState } from 'react'
import { NavLink } from "react-router";

export default function Home() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
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
        <div onClick={()=>{console.log('sign in, name:', name, 'password:', password)}}>
            sign in
        </div>
        <NavLink to={"/SignUp"}>
            <div>signUp</div>
        </NavLink>
    </div>
  )
}