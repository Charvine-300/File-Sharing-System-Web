import { Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/auth/Login";
import ChangePassword from "../pages/auth/ChangePassword";
import Dashboard from "../pages/Dashboard";
import EditProfile from "../pages/EditProfile";
import UsersList from "../pages/users/UsersList";
import AttributesList from "../pages/attributes/AttributesList";
import FilesList from "../pages/files/FilesList";
import UploadFilePage from "../pages/files/upload/UploadFilePage";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import RequireRole from "./RequireRole";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/files" element={<FilesList />} />
        <Route path="/files/upload" element={<UploadFilePage />} />
        <Route
          path="/users"
          element={
            <RequireRole permission="users.view">
              <UsersList />
            </RequireRole>
          }
        />
        <Route
          path="/attributes"
          element={
            <RequireRole permission="attributes.view">
              <AttributesList />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
