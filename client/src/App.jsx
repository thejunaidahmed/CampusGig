import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GigDetail from './pages/GigDetail';
import CreateGig from './pages/CreateGig';
import MyGigs from './pages/MyGigs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="text-center py-20 text-[#8b949e] text-xs">Authenticating...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route path="/create" element={<RequireAuth><CreateGig /></RequireAuth>} />
        <Route path="/my-gigs" element={<RequireAuth><MyGigs /></RequireAuth>} />
        <Route path="/my-applications" element={<RequireAuth><MyApplications /></RequireAuth>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
