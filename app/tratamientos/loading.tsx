export default function TratamientosLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: "#1a0510" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--vintage-gold)", borderTopColor: "transparent" }} />
        <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: "var(--vintage-gold)", fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>
          Tratamientos
        </p>
      </div>
    </div>
  )
}
