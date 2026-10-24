import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import TransactionForm from "../components/TransactionForm.jsx";
import TransactionTable from "../components/TransactionTable.jsx";

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => api.listTransactions().then((r) => setRows(r.transactions)).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  return (
    <main className="page">
      <h1>Transactions</h1>
      <TransactionForm
        key={editing?.transactionId || "new"}
        initial={editing}
        onCancel={editing ? () => setEditing(null) : undefined}
        onSubmit={async (data) => {
          if (editing) await api.updateTransaction(editing.transactionId, data); else await api.createTransaction(data);
          setEditing(null); await load();
        }}
      />
      {error && <p className="error">{error}</p>}
      <div className="card">
        <TransactionTable rows={rows} onEdit={setEditing}
          onDelete={async (t) => { if (confirm("Delete this transaction?")) { await api.deleteTransaction(t.transactionId); load(); } }} />
      </div>
    </main>
  );
}
