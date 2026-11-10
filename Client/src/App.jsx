import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import './App.css';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Layout from './Components/Layout/Layout';
import Profile from './Pages/Tourist/Profile';
import EditProfile from './Pages/Tourist/edit';
import TripPlanner from './Pages/Tourist/TripPlanner';
import Explore from './Pages/Tourist/Explore';
import Dashboard from './Pages/Admin/Dashboard.jsx';
import GuidesAdmin from './Pages/Admin/Guides.jsx';
import PlacesAdmin from './Pages/Admin/Places.jsx';
import Users from './Pages/Admin/Users.jsx';
import ProtectedRoute from './Components/Protection/Protectedroute.jsx';
import GuideInbox from './Features/chat/pages/GuideInbox.jsx';
import TripsPage from './Pages/Tourist/TripsPage.jsx';
import GuideDirectory from './Components/Tourist/Guides';
import GuideDashboard from './Pages/TourGuide/GuideDashboard';
import ReviewsPage from './Pages/Admin/Review';
import ReportsPage from './Pages/Admin/Reports';
import Deals from './Pages/Tourist/Deals.jsx';
import Chats from './Pages/Admin/Chats.jsx';
import NotFound from './Pages/NotFound.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public discovery pages. Account-only actions remain protected by the API. */}
      <Route element={<Layout />}>
        <Route path="/places" element={<Explore />} />
        <Route path="/guides" element={<GuideDirectory />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
      </Route>

      {/* Legacy public URLs */}
      <Route path="/explore" element={<Navigate to="/places" replace />} />
      <Route path="/guide" element={<Navigate to="/guides" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedRoute roles={['tourist']} />}>
          <Route element={<Layout />}>
            <Route path="/tourist/profile" element={<Profile />} />
            <Route path="/tourist/profile/edit" element={<EditProfile />} />
            <Route path="/tourist/trips" element={<TripsPage />} />
            <Route path="/tourist/bookings" element={<Deals />} />

            {/* Legacy tourist URLs. URL IDs are ignored; profile pages use the verified user. */}
            <Route path="/profile/:userId" element={<Navigate to="/tourist/profile" replace />} />
            <Route path="/profile/edit/:userId" element={<Navigate to="/tourist/profile/edit" replace />} />
            <Route path="/guide/dashboard/trips" element={<Navigate to="/tourist/trips" replace />} />
            <Route path="/my-deals" element={<Navigate to="/tourist/bookings" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['tourguide']} />}>
          <Route path="/guide/dashboard" element={<GuideDashboard />} />
          <Route path="/guide/inbox" element={<GuideInbox />} />
          <Route path="/guide/dashboard/:id" element={<Navigate to="/guide/dashboard" replace />} />
          <Route path="/guide/dashboard/messages" element={<Navigate to="/guide/inbox" replace />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/guides" element={<GuidesAdmin />} />
          <Route path="/admin/places" element={<PlacesAdmin />} />
          <Route path="/admin/chats" element={<Chats />} />
          <Route path="/admin/reviews" element={<ReviewsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />

          {/* Legacy admin URLs; the new public /places and /guides paths stay public. */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/chats" element={<Navigate to="/admin/chats" replace />} />
          <Route path="/reviews" element={<Navigate to="/admin/reviews" replace />} />
          <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
