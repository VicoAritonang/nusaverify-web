import AnalysisDetail from "./AnalysisDetail";

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="wrap" style={{ paddingTop: 14, paddingBottom: 80, minHeight: "100vh" }}>
      <AnalysisDetail id={id} />
    </div>
  );
}
