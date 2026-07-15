import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import './App.css'
import Register from './Pages/Register'
import Login from './Pages/Login'
import Layout from './Components/Layout/Layout'
import Profile from './Pages/Tourist/Profile'
import EditProfile from './Pages/Tourist/edit'
import TripPlanner from './Pages/Tourist/TripPlanner';
import Explore from './Pages/Tourist/Explore';
import Dashboard from './Pages/Admin/Dashboard.jsx'
import Guides from './Pages/Admin/Guides.jsx'
import Places from './Pages/Admin/Places.jsx'
import Users from './Pages/Admin/Users.jsx'
import ComingSoon from './Pages/Admin/ComingSoon.jsx'
import ProtectedRoute from './Components/Protection/Protectedroute.jsx'
import GuideInbox from './Features/chat/pages/GuideInbox.jsx'
import TripsPage from './Pages/Tourist/TripsPage.jsx'
import Guide from './Components/Tourist/Guides'
import GuideDashboard from './Pages/TourGuide/GuideDashboard'
import ReviewsPage from './Pages/Admin/Review'
import ReportsPage from './Pages/Admin/Reports'
import Deals from './Pages/Tourist/Deals.jsx'
import Chats from './Pages/Admin/Chats.jsx'
function App() {
  return (
    <Routes>
      {/* Public routes — accessible without being logged in */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      {/* Everything below requires a logged-in user (checked via ProtectedRoute).
          If there's no user in storage, it redirects to /login. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/places" element={<Places />} />
        <Route path="/users" element={<Users />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/reviews" element={<ComingSoon title="Reviews" />} />
        <Route
          path="/pricing-fraud"
          element={<ComingSoon title="Pricing / Fraud" />}
        />
        <Route path="/reports" element={<ComingSoon title="Reports" />} />
        <Route path="/guide/dashboard/messages" element={<GuideInbox />} />
        <Route path="/guide/dashboard/:id" element={<GuideDashboard />} />
        <Route path="/admin/reviews" element={<ReviewsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/" element={<Layout />}>
          <Route path="trip-planner" element={<TripPlanner />} />
          <Route path="explore" element={<Explore />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="profile/edit/:userId" element={<EditProfile />} />
          <Route path="guide/dashboard/trips" element={<TripsPage />} />
          <Route path="guide" element={<Guide />} />
          <Route path="/my-deals" element={<Deals />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App