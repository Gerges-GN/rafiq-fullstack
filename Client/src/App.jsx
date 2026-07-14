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
import ProtectedRoute from './components/Protection/Protectedroute.jsx'
import GuideInbox from './Features/chat/pages/GuideInbox'
import TripsPage from './Components/Tourist/Trips'
import Guide from './Components/Tourist/Guides'
import GuideDashboard from './pages/TourGuide/GuideDashboard'
function App() {
  return (
    <Routes>
      {/* Public routes — accessible without being logged in */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Everything below requires a logged-in user (checked via ProtectedRoute).
          If there's no user in storage, it redirects to /login. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/places" element={<Places />} />
        <Route path="/users" element={<Users />} />
        <Route path="/chats" element={<ComingSoon title="Chats" />} />
        <Route path="/reviews" element={<ComingSoon title="Reviews" />} />
        <Route path="/pricing-fraud" element={<ComingSoon title="Pricing / Fraud" />} />
        <Route path="/reports" element={<ComingSoon title="Reports" />} />
        <Route path="/guide/dashboard/messages" element={<GuideInbox />} />
        <Route path="/guide/dashboard/:id" element={<GuideDashboard />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="trip-planner" element={<TripPlanner />} />
          <Route path="explore" element={<Explore />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="profile/edit/:userId" element={<EditProfile />} />
          <Route path="guide/dashboard/trips" element={<TripsPage />} />
          <Route path="guide" element={<Guide />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App