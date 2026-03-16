import Link from "next/link";
import AnalysisDetail from "./AnalysisDetail";

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8 group animate-fade-in-down"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
          Kembali ke Beranda
        </Link>

        {/* Dynamic Analysis View */}
        <AnalysisDetail id={id} />

      </div>
    </div>
  );
}
