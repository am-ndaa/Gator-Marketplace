import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

//example app that fetches /api/hello and show the json response, it hits django at 127.0.0.1:8000

export default function App() {
  const [msg, setMsg] = useState('loading...')

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data)
        setMsg(data.message)  // update state to show in UI
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
    </div>
  )
}