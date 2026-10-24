import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, confirmRegistration } from "../services/auth";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("signup");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      if (step === "signup") { await register(email, password); setStep("confirm"); }
      else { await confirmRegistration(email, code); nav("/login"); }
    } catch (err) { setError(err.message); }
  }
  return (
    <main className="auth">
      <form className="card form" onSubmit={submit}>
        <h1>{step === "signup" ? "Create your account" : "Verify your email"}</h1>
        {step === "signup" ? (<>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        </>) : (
          <label>Code sent to {email}<input value={code} onChange={(e) => setCode(e.target.value)} required /></label>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn">{step === "signup" ? "Create account" : "Verify and continue"}</button>
        <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </main>
  );
}
