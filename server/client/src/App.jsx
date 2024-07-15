import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/users/Login";
import Register from "./pages/users/Register";
import Dashboard from "./pages/users/Dashboard";
import Create from "./pages/posts/shopping/Create";
import Update from "./pages/posts/shopping/Update";
import AuthRoutes from "./routes/AuthRoutes";
import GuestRoutes from "./routes/GuestRoutes";
import ShoppingTab from "./pages/tabs/ShoppingTab";
import CalendarTab from "./pages/tabs/CalendarTab";
import ReminderTab from "./pages/tabs/ReminderTab";
import TacoTab from "./pages/tabs/TacoTab";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ShoppingTab />} />

          <Route element={<AuthRoutes />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create" element={<Create />} />
            <Route path="update" element={<Update />} />
            <Route path="shopping" element={<ShoppingTab />} />
            <Route path="calendar" element={<CalendarTab />} />
            <Route path="reminder" element={<ReminderTab />} />
            <Route path="taco" element={<TacoTab />} />
          </Route>

          <Route element={<GuestRoutes />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
