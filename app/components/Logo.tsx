export default function Logo({ size = 36 }: { size?: number }) {
  const radius = Math.round(size * 0.3);
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "#0a0a0c",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,.16), 0 1px 1px rgba(0,0,0,.4), 0 6px 18px -6px rgba(0,0,0,.8)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="NusaVerify" className="h-full w-full object-cover" style={{ transform: "scale(1.12)" }} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: radius,
          background: "linear-gradient(160deg, rgba(255,255,255,.22), transparent 40%)",
        }}
      />
    </span>
  );
}
