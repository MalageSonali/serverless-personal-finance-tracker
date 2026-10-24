import { Pencil, Trash2 } from "lucide-react";
import { inr } from "../services/api";

export default function TransactionTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return <p className="muted">No transactions yet. Add your first one above.</p>;
  return (
    <div className="scroll">
      <table>
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th className="num">Amount</th>{onEdit && <th />}</tr></thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.transactionId}>
              <td>{t.date}</td><td>{t.category}</td><td>{t.description}</td>
              <td className={`num ${t.type}`}>{t.type === "expense" ? "−" : "+"}{inr(t.amount)}</td>
              {onEdit && (
                <td className="actions">
                  <button className="icon" aria-label="Edit" onClick={() => onEdit(t)}><Pencil size={15} /></button>
                  <button className="icon" aria-label="Delete" onClick={() => onDelete(t)}><Trash2 size={15} /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
