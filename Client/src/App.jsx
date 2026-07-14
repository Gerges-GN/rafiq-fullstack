import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import './App.css'
import Register from './Pages/Register'
import Login from './Pages/Login'
import Layout from './components/layout/Layout'
import Profile from './Pages/Tourist/Profile'
import EditProfile from './Pages/Tourist/edit'
import TripPlanner from './Pages/Tourist/TripPlanner';
import Explore from './Pages/Tourist/Explore';
import Dashboard from './pages/Admin/Dashboard.jsx'
import Guides from './pages/Admin/Guides.jsx'
import Places from './pages/Admin/Places.jsx'
import Users from './pages/Admin/Users.jsx'
import ComingSoon from './pages/Admin/ComingSoon.jsx'
function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/profile/edit/:userId" element={<EditProfile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/places" element={<Places />} />
      <Route path="/users" element={<Users />} />
      <Route path="/chats" element={<ComingSoon title="Chats" />} />
      <Route path="/reviews" element={<ComingSoon title="Reviews" />} />
      <Route path="/pricing-fraud" element={<ComingSoon title="Pricing / Fraud" />} />
      <Route path="/reports" element={<ComingSoon title="Reports" />} />
      <Route path="/" element={<Layout />} >
        <Route index element={<Home />} />
        <Route path="trip-planner" element={<TripPlanner />} />
        <Route path="explore" element={<Explore />} />
      </Route>
    </Routes>
  )
}

export default App