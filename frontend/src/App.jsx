import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/login/login'
import Home from './pages/homepage/homepage'
import Profile from './pages/profile/profile'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {

  return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={
          // <ProtectedRoute>
            <Home />
          // </ProtectedRoute>
        } />
        <Route path="/profile" element={
          // <ProtectedRoute>
            <Profile />
          // </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}