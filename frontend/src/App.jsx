import { useState, useEffect } from 'react'
import './App.css'
import LoginButton from './components/LoginButton'   // ✅ import here

export default function App() {
  const [msg, setMsg] = useState('loading...')

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data)
        setMsg(data.message)
      })
      .catch((err) => {
        console.error("Error:", err)
        setMsg("Error fetching backend")
      })
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>React + Vite Frontend</h1>
      <p>Backend says: {msg}</p>

      {/* ✅ Add your Auth0 login button here */}
      <LoginButton />
    </div>
  )
}