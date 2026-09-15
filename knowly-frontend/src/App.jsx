import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddSkillPage from './pages/AddSkillPage';
import EditSkillPage from './pages/EditSkillPage';
import SkillDetailsPage from './pages/SkillDetailsPage';
import SkillDemandPage from './pages/SkillDemandPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MySkillsPage from './pages/MySkillsPage';
import MyInterestsPage from './pages/MyInterestsPage';
import SkillsPage from './pages/SkillsPage';
import WorkshopsPage from './pages/WorkshopsPage';
import WorkshopDetailsPage from './pages/WorkshopDetailsPage';
import CreateWorkshopPage from './pages/CreateWorkshopPage';
import MyWorkshopsPage from './pages/MyWorkshopsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ManageApplicationsPage from './pages/ManageApplicationsPage';
import WorkshopResourcesPage from './pages/WorkshopResourcesPage';
import { isLoggedIn } from './services/authService';
import WorkshopHistoryPage from './pages/WorkshopHistoryPage';
import RateWorkshopPage from './pages/RateWorkshopPage';
import RoomPage from './pages/RoomPage';
import MyRoomsPage from './pages/MyRoomsPage';

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
        <Route path="/skills/:id" element={<ProtectedRoute><SkillDetailsPage /></ProtectedRoute>} />
        <Route path="/skills/:id/demand" element={<ProtectedRoute><SkillDemandPage /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddSkillPage /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditSkillPage /></ProtectedRoute>} />
        <Route path="/my-skills" element={<ProtectedRoute><MySkillsPage /></ProtectedRoute>} />
        <Route path="/my-interests" element={<ProtectedRoute><MyInterestsPage /></ProtectedRoute>} />
        <Route path="/users/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
        <Route path="/workshops" element={<ProtectedRoute><WorkshopsPage /></ProtectedRoute>} />
        <Route path="/workshops/:workshopId" element={<ProtectedRoute><WorkshopDetailsPage /></ProtectedRoute>} />
        <Route path="/workshops/create" element={<ProtectedRoute><CreateWorkshopPage /></ProtectedRoute>} />
        <Route path="/my-workshops" element={<ProtectedRoute><MyWorkshopsPage /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="/workshops/:workshopId/applications" element={<ProtectedRoute><ManageApplicationsPage /></ProtectedRoute>} />
        <Route path="/workshops/:workshopId/resources" element={<WorkshopResourcesPage />} />
        <Route path="/my-applications/:applicationId" element={<MyApplicationsPage />} />
        <Route path="/workshop-history" element={<WorkshopHistoryPage />} />
        <Route path="/workshops/:workshopId/rate" element={<RateWorkshopPage />} />
        <Route path="/my-rooms" element={<ProtectedRoute><MyRoomsPage /></ProtectedRoute>} />
        <Route path="/room" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
