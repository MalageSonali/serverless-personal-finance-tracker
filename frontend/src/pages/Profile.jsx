import { useEffect, useState } from "react";
import { getEmail } from "../services/auth";

export default function Profile() {
  const [email, setEmail] = useState("");
  useEffect(() => { getEmail().then(setEmail); }, []);
  return (
    <main className="page">
      <h1>Profile</h1>
      <div className="card"><span className="muted">Signed in as</span><p><strong>{email || "…"}</strong></p></div>
    </main>
  );
}
