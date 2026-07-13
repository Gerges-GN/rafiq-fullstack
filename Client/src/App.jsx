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
function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/profile/edit/:userId" element={<EditProfile />} />
      <Route path="/" element={<Layout />} >
        <Route index element={<Home />} />
        <Route path="trip-planner" element={<TripPlanner />} />
        <Route path="explore" element={<Explore />} />
      </Route>
    </Routes>
  )
}

export default App