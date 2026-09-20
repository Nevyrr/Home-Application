import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthRoutes from "./routes/AuthRoutes.tsx";
import GuestRoutes from "./routes/GuestRoutes.tsx";

const Login = lazy(() => import("./pages/users/Login.tsx"));
const Register = lazy(() => import("./pages/users/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/users/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/users/ResetPassword.tsx"));
const Dashboard = lazy(() => import("./pages/users/Dashboard.tsx"));
const ShoppingTab = lazy(() => import("./pages/tabs/ShoppingTab.tsx"));
const ReminderTab = lazy(() => import("./pages/tabs/ReminderTab.tsx"));
const TacoTab = lazy(() => import("./pages/tabs/TacoTab.tsx"));
const NonoTab = lazy(() => import("./pages/tabs/NonoTab.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<AuthRoutes />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="shopping" element={<ShoppingTab />} />
            <Route path="reminders" element={<ReminderTab />} />
            <Route path="taco" element={<TacoTab />} />
            <Route path="nono" element={<NonoTab />} />
          </Route>

          <Route element={<GuestRoutes />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;

