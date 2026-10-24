import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { AlertTriangle } from "lucide-react";
import { api, inr } from "../services/api";
import SummaryCard from "../components/SummaryCard.jsx";
import TransactionTable from "../components/TransactionTable.jsx";

const COLORS = ["#0F4C5C", "#E09F3E", "#C8553D", "#5B8E7D", "#7A6C9D", "#3A7CA5", "#9A8C73", "#B5465F", "#667"];

export default function Dashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    api.dashboard(month).then(setData).catch((e) => setError(e.message));
    api.listTransactions().then((r) => setRecent(r.transactions.slice(0, 5))).catch(() => {});
  }, [month]);

  if (error) return <main className="page"><p className="error">{error}</p></main>;
  if (!data) return <main className="page"><p className="muted">Loading your numbers…</p></main>;

  return (
    <main className="page">
      <div className="row between">
        <h1>Dashboard</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {data.alerts.map((a) => <div key={a} className="alert"><AlertTriangle size={16} /> {a}</div>)}

      <section className="grid4">
        <SummaryCard label="Total income" value={inr(data.totalIncome)} tone="pos" />
        <SummaryCard label="Total expenses" value={inr(data.totalExpenses)} tone="neg" />
        <SummaryCard label="Remaining balance" value={inr(data.balance)} />
        <SummaryCard label="Savings rate" value={data.savingsRate === null ? "n/a" : `${data.savingsRate}%`} />
      </section>

      <section className="grid2">
        <div className="card"><h2>Income vs expenses</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="income" fill="#0F4C5C" /><Bar dataKey="expenses" fill="#C8553D" /></BarChart>
          </ResponsiveContainer></div>
        <div className="card"><h2>Spending by category</h2>
          {data.categoryBreakdown.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart><Pie data={data.categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>) : <p className="muted">No expenses this month.</p>}</div>
      </section>

      <section className="card"><h2>Monthly spending trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.monthlyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="expenses" stroke="#C8553D" strokeWidth={2} /></LineChart>
        </ResponsiveContainer></section>

      <section className="grid2">
        <div className="card"><h2>Budget progress</h2>
          {data.budgetProgress.length ? data.budgetProgress.map((b) => (
            <div key={b.category} className="budget">
              <div className="row between"><span>{b.category}</span><span className="muted">{inr(b.spent)} / {inr(b.limit)}</span></div>
              <div className="bar"><div className={`fill ${b.status}`} style={{ width: `${Math.min(b.utilization, 100)}%` }} /></div>
            </div>)) : <p className="muted">No budgets set for this month.</p>}</div>
        <div className="card"><h2>Recent transactions</h2><TransactionTable rows={recent} /></div>
      </section>
    </main>
  );
}
