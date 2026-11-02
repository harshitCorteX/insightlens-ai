import { Suspense } from "react";
import { AnalyzeWorkspace } from "@/components/analyze-workspace";
export const metadata = { title: "Analyze content" };
export default function AnalyzePage() {
  return (
    <Suspense
      fallback={<p className="page-loading">Opening your thinking space…</p>}
    >
      <AnalyzeWorkspace />
    </Suspense>
  );
}
