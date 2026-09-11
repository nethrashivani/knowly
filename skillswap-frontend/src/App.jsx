import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddSkillPage from './pages/AddSkillPage';
import EditSkillPage from './pages/EditSkillPage';
import SkillDetailsPage from './pages/SkillDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MySkillsPage from './pages/MySkillsPage';
import { isLoggedIn } from './services/authService';
import PublicProfilePage from './pages/PublicProfilePage';
import WorkshopsPage from './pages/WorkshopsPage';
import CreateWorkshopPage from './pages/CreateWorkshopPage';
import MyWorkshopsPage from './pages/MyWorkshopsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ManageApplicationsPage from './pages/ManageApplicationsPage';


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
        <Route path="/add" element={<ProtectedRoute><AddSkillPage /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditSkillPage /></ProtectedRoute>} />
        <Route path="/skills/:id" element={<ProtectedRoute><SkillDetailsPage /></ProtectedRoute>} />
        <Route path="/my-skills" element={<ProtectedRoute><MySkillsPage /></ProtectedRoute>} />
        <Route
          path="/users/:userId"
          element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>}
        />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route
          path="/workshops/create"
          element={
            <ProtectedRoute>
              <CreateWorkshopPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-workshops"
          element={
            <ProtectedRoute>
              <MyWorkshopsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workshops/:workshopId/applications"
          element={
            <ProtectedRoute>
              <ManageApplicationsPage />
            </ProtectedRoute>
          }
        />


      </Routes>

    </BrowserRouter>
  );
}

export default App;