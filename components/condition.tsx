export default function Condition({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="conditionItem">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </div>
  );
}