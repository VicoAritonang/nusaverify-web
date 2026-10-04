import AnalysisDetail from "./AnalysisDetail";

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen relative">
      {/* Layered background */}
      <div className="fixed inset-0 bg-grid bg-grid-fade pointer-events-none z-0" />
      <div className="fixed inset-0 bg-radial-top pointer-events-none z-0" />
      <div className="fixed top-32 -left-32 w-[420px] h-[420px] rounded-full blur-[140px] breathe pointer-events-none z-0" style={{ background: "rgba(99,102,241,.1)" }} />
      <div className="fixed bottom-10 -right-32 w-[420px] h-[420px] rounded-full blur-[140px] breathe pointer-events-none z-0" style={{ background: "rgba(34,211,238,.07)", animationDelay: "1.5s" }} />

      <div className="relative z-10 wrap" style={{ paddingTop: 0, paddingBottom: 60, minHeight: "100vh" }}>
        <AnalysisDetail id={id} />
      </div>
    </div>
  );
}
