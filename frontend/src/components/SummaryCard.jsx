export default function SummaryCard({ label, value, tone = "" }) {
  return (
    <div className={`card summary ${tone}`}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
