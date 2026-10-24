import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./services/auth";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Profile from "./pages/Profile.jsx";

function Protected({ children }) {
  const [ok, setOk] = useState(null);
  useEffect(() => { getToken().then((t) => setOk(!!t)); }, []);
  if (ok === null) return <p className="muted pad">Checking session…</p>;
  return ok ? <><Navbar />{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
      <Route path="/budgets" element={<Protected><Budgets /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
