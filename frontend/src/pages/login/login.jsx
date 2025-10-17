import LoginButton from '../../components/LoginButton'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'
import LogoutButton from '../../components/LogoutButton'
import LoginLogo from '../../assets/images/LoginLogo.png'

export default function Login() {
  const navigate = useNavigate()
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
    <div className="login-background">
      <div className="login-page">
        <div>
          <img src={LoginLogo} alt="Gator Marketplace Logo" className="login-logo" />
        </div>

        <div>
          <h1>
          Welcome to<br />
          Gator Marketplace
          </h1>
          {/* <p>Backend says: {msg}</p> */}

          <LoginButton />
          <LogoutButton />
        </div>

      </div>
    </div>
  )
}
