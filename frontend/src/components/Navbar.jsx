import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, User, LogOut } from "lucide-react";
import { logout } from "../services/auth";

export default function Navbar() {
  const nav = useNavigate();
  const link = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");
  return (
    <header className="navbar">
      <span className="brand">Ledgerly</span>
      <nav>
        <NavLink to="/" end className={link}><LayoutDashboard size={16} /> Dashboard</NavLink>
        <NavLink to="/transactions" className={link}><ArrowLeftRight size={16} /> Transactions</NavLink>
        <NavLink to="/budgets" className={link}><PiggyBank size={16} /> Budgets</NavLink>
        <NavLink to="/profile" className={link}><User size={16} /> Profile</NavLink>
      </nav>
      <button className="btn ghost" onClick={() => { logout(); nav("/login"); }}><LogOut size={16} /> Sign out</button>
    </header>
  );
}
