import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleLayout } from './components/layout/RoleLayout';

// Public & Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Onboarding Pages
import { StudentOnboardingPage } from './pages/onboarding/StudentOnboardingPage';
import { RecruiterOnboardingPage } from './pages/onboarding/RecruiterOnboardingPage';
import { InstitutionOnboardingPage } from './pages/onboarding/InstitutionOnboardingPage';
import { AcademicianOnboardingPage } from './pages/onboarding/AcademicianOnboardingPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SkillPassportPage } from './pages/student/SkillPassportPage';
import { AssessmentsPage } from './pages/student/AssessmentsPage';
import { AssessmentRunnerPage } from './pages/student/AssessmentRunnerPage';
import { DreamJobRoadmapPage } from './pages/student/DreamJobRoadmapPage';
import { MyApplicationsPage } from './pages/student/MyApplicationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Opportunities & Search
import { ExploreOpportunitiesPage } from './pages/opportunities/ExploreOpportunitiesPage';
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { PostOpportunityPage } from './pages/recruiter/PostOpportunityPage';
import { ManageOpportunitiesPage } from './pages/recruiter/ManageOpportunitiesPage';
import { OpportunityApplicationsPage } from './pages/recruiter/OpportunityApplicationsPage';
import { CandidateSearchPage } from './pages/recruiter/CandidateSearchPage';

// Institution Pages
import { InstitutionDashboard } from './pages/institution/InstitutionDashboard';
import { StudentsDirectoryPage } from './pages/institution/StudentsDirectoryPage';

// Academician Pages
import { AcademicianDashboard } from './pages/academician/AcademicianDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';

// Settings Page
import { SettingsPage } from './pages/settings/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Layout Routes */}
              <Route element={<RoleLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/opportunities" element={<ExploreOpportunitiesPage />} />
                <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

                {/* Onboarding Routes */}
                <Route element={<ProtectedRoute requireOnboarding={false} />}>
                  <Route path="/onboarding/student" element={<StudentOnboardingPage />} />
                  <Route path="/onboarding/recruiter" element={<RecruiterOnboardingPage />} />
                  <Route path="/onboarding/institution" element={<InstitutionOnboardingPage />} />
                  <Route path="/onboarding/academician" element={<AcademicianOnboardingPage />} />
                </Route>

                {/* Student Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/skill-passport" element={<SkillPassportPage />} />
                  <Route path="/student/assessments" element={<AssessmentsPage />} />
                  <Route path="/student/assessments/test/:category" element={<AssessmentRunnerPage />} />
                  <Route path="/student/roadmap" element={<DreamJobRoadmapPage />} />
                  <Route path="/student/applications" element={<MyApplicationsPage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                </Route>

                {/* Recruiter Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/post-opportunity" element={<PostOpportunityPage />} />
                  <Route path="/recruiter/manage-opportunities" element={<ManageOpportunitiesPage />} />
                  <Route path="/recruiter/opportunities/:oppId/applications" element={<OpportunityApplicationsPage />} />
                  <Route path="/recruiter/candidates" element={<CandidateSearchPage />} />
                </Route>

                {/* Institution Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['institution', 'admin']} />}>
                  <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
                  <Route path="/institution/students" element={<StudentsDirectoryPage />} />
                </Route>

                {/* Academician Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['academician', 'admin']} />}>
                  <Route path="/academician/dashboard" element={<AcademicianDashboard />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagementPage />} />
                </Route>

                {/* General Settings */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
