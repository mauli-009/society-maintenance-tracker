export function ButtonSpinner() {
  return <span className="spinner inline-block" style={{ width: 16, height: 16, borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />;
}

export function PageLoader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="spinner" />
      <p className="text-sm text-muted">{label}...</p>
    </div>
  );
}