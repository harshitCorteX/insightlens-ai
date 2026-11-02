import { AnalysisReader } from "@/components/analysis-reader";
export const metadata = { title: "A closer look" };
export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnalysisReader id={id} />;
}
