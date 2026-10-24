import { useState } from "react";
import { CATEGORIES } from "../services/api";

const blank = () => ({ type: "expense", amount: "", category: "Food", description: "", date: new Date().toISOString().slice(0, 10) });

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState(initial ? { ...initial } : blank());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    const amount = parseFloat(f.amount);
    if (!(amount > 0)) return setError("Enter an amount greater than zero.");
    setBusy(true);
    try {
      await onSubmit({ type: f.type, amount, category: f.category, description: f.description, date: f.date });
      if (!initial) setF(blank());
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <form className="card form" onSubmit={submit}>
      <div className="row">
        <label>Type<select value={f.type} onChange={set("type")}><option value="expense">Expense</option><option value="income">Income</option></select></label>
        <label>Amount (₹)<input type="number" step="0.01" min="0" value={f.amount} onChange={set("amount")} required /></label>
        <label>Category<select value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Date<input type="date" value={f.date} onChange={set("date")} required /></label>
      </div>
      <label>Description<input maxLength={200} value={f.description} onChange={set("description")} /></label>
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button className="btn" disabled={busy}>{initial ? "Save changes" : "Add transaction"}</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
