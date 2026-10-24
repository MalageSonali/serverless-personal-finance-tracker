import { useEffect, useState, useCallback } from "react";
import { api, inr, CATEGORIES } from "../services/api";

const EXPENSE_CATS = CATEGORIES.filter((c) => !["Salary", "Freelance"].includes(c));

export default function Budgets() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(() => api.dashboard(month).then((d) => setProgress(d.budgetProgress)).catch((e) => setError(e.message)), [month]);
  useEffect(() => { load(); }, [load]);

  async function save(e) {
    e.preventDefault(); setError("");
    try { await api.saveBudget({ month, category, limit: parseFloat(limit) }); setLimit(""); load(); }
    catch (err) { setError(err.message); }
  }
  const label = { normal: "Within budget", approaching: "Approaching limit", exceeded: "Budget exceeded" };

  return (
    <main className="page">
      <h1>Budgets</h1>
      <form className="card form" onSubmit={save}>
        <div className="row">
          <label>Month<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
          <label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}>{EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Monthly limit (₹)<input type="number" min="1" value={limit} onChange={(e) => setLimit(e.target.value)} required /></label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn">Save budget</button>
      </form>
      <div className="card">
        {progress.length ? progress.map((b) => (
          <div key={b.category} className="budget">
            <div className="row between"><strong>{b.category}</strong><span className={`tag ${b.status}`}>{label[b.status]} · {b.utilization}%</span></div>
            <div className="bar"><div className={`fill ${b.status}`} style={{ width: `${Math.min(b.utilization, 100)}%` }} /></div>
            <span className="muted">{inr(b.spent)} spent of {inr(b.limit)}</span>
          </div>)) : <p className="muted">No budgets for this month yet. Set your first one above.</p>}
      </div>
    </main>
  );
}
