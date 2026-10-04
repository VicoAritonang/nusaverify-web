export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* breathing halo */}
      <div
        className="absolute -inset-2 rounded-2xl breathe -z-10"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,.35), rgba(139,92,246,.35))",
          filter: "blur(14px)",
        }}
      />
      <div
        className="relative w-full h-full rounded-xl overflow-hidden ring-1 ring-white/15"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)",
          boxShadow: "0 6px 18px rgba(99,102,241,.45), inset 0 1px 0 rgba(255,255,255,.2)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="NusaVerify" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
