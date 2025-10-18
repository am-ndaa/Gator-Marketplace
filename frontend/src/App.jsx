import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/login/login'
import Home from './pages/homepage/homepage'
import Profile from './pages/profile/profile'
import ProtectedRoute from './components/ProtectedRoute'
import useEnsureUserProfile from './hooks/useEnsureUserProfile'

export default function App() {

  useEnsureUserProfile()

  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  )
}