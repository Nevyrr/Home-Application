import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.tsx";
import Login from "./pages/users/Login.tsx";
import Register from "./pages/users/Register.tsx";
import ForgotPassword from "./pages/users/ForgotPassword.tsx";
import ResetPassword from "./pages/users/ResetPassword.tsx";
import Dashboard from "./pages/users/Dashboard.tsx";
import AuthRoutes from "./routes/AuthRoutes.tsx";
import GuestRoutes from "./routes/GuestRoutes.tsx";
import ShoppingTab from "./pages/tabs/ShoppingTab.tsx";
import CalendarTab from "./pages/tabs/CalendarTab.tsx";
import ReminderTab from "./pages/tabs/ReminderTab.tsx";
import TacoTab from "./pages/tabs/TacoTab.tsx";
import NonoTab from "./pages/tabs/NonoTab.tsx";

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<AuthRoutes />}>
            <Route index element={<ShoppingTab />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="shopping" element={<ShoppingTab />} />
            <Route path="calendar" element={<CalendarTab />} />
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

        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;

