import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError("");
    try { await login(email, password); nav("/"); }
    catch (err) { setError(err.message || "Could not sign in."); }
  }
  return (
    <main className="auth">
      <form className="card form" onSubmit={submit}>
        <h1>Sign in to Ledgerly</h1>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn">Sign in</button>
        <p className="muted">No account? <Link to="/register">Create one</Link></p>
      </form>
    </main>
  );
}
