import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  BarChart3, Users, Calendar, FileText, Settings,
  Shield, LogOut, ChevronRight, Search, Bell, Menu, Image as ImageIcon
} from 'lucide-react';
const Overview = React.lazy(() => import('./admin/Overview'));
const UserManagement = React.lazy(() => import('./admin/UserManagement'));
const EventManagement = React.lazy(() => import('./admin/EventManagement'));
const ContentManagement = React.lazy(() => import('./admin/ContentManagement'));
const StaffManagement = React.lazy(() => import('./admin/StaffManagement'));
const GalleryManagement = React.lazy(() => import('./admin/GalleryManagement'));
const BlogManagement = React.lazy(() => import('./admin/BlogManagement'));
const ProjectManagement = React.lazy(() => import('./admin/ProjectManagement'));
const MessageManagement = React.lazy(() => import('./admin/MessageManagement'));
const Security = React.lazy(() => import('./admin/Security'));
const SettingsPage = React.lazy(() => import('./admin/Settings'));
const CourseManagement = React.lazy(() => import('./admin/CourseManagement'));
const PointsManagement = React.lazy(() => import('./admin/PointsManagement'));
const FormManagement = React.lazy(() => import('./admin/forms/FormManagement'));
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({
  children,
  allowedRoles,
  check
}: {
  children: React.ReactNode,
  allowedRoles?: string[],
  check?: boolean
}) => {
  const { profile, loading, isSuperAdmin } = useAuth();

  if (loading) return null;

  // Super Admin always has full unrestricted access
  if (isSuperAdmin) return <>{children}</>;

  if (check === false) return <Navigate to="/dashboard" />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AdminDashboard = () => {
  const auth = useAuth();

  return (
    <div className="p-4 md:p-8">
      <Routes>
        <Route path="/" element={<Overview />} />

        <Route path="/users" element={
          <RoleGuard check={auth.isAdmin || auth.isHR}>
            <UserManagement />
          </RoleGuard>
        } />

        <Route path="/events" element={
          <RoleGuard check={auth.isAdmin || auth.isHR || auth.isEventManager}>
            <EventManagement />
          </RoleGuard>
        } />

        <Route path="/staff" element={
          <RoleGuard check={auth.isAdmin || auth.isHR}>
            <StaffManagement />
          </RoleGuard>
        } />

        <Route path="/gallery" element={
          <RoleGuard check={auth.isManager}>
            <GalleryManagement />
          </RoleGuard>
        } />

        <Route path="/content" element={
          <RoleGuard check={auth.isAdmin || auth.isContentManager}>
            <ContentManagement />
          </RoleGuard>
        } />

        <Route path="/projects" element={
          <RoleGuard check={auth.isAdmin || auth.isContentManager}>
            <ProjectManagement />
          </RoleGuard>
        } />

        <Route path="/blog" element={
          <RoleGuard check={auth.isAdmin || auth.isContentManager}>
            <BlogManagement />
          </RoleGuard>
        } />

        <Route path="/messages" element={
          <RoleGuard check={auth.isManager}>
            <MessageManagement />
          </RoleGuard>
        } />

        <Route path="/courses" element={
          <RoleGuard check={auth.isAdmin || auth.isContentManager}>
            <CourseManagement />
          </RoleGuard>
        } />

        <Route path="/points" element={
          <RoleGuard check={auth.isAdmin || auth.isManager}>
            <PointsManagement />
          </RoleGuard>
        } />

        <Route path="/forms/*" element={
          <RoleGuard check={auth.isAdmin}>
            <FormManagement />
          </RoleGuard>
        } />

        <Route path="/security" element={
          <RoleGuard check={auth.isSuperAdmin}>
            <Security />
          </RoleGuard>
        } />

        <Route path="/settings" element={
          <RoleGuard check={auth.isSuperAdmin}>
            <SettingsPage />
          </RoleGuard>
        } />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
