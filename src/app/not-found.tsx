import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="empty-state">
      <Compass size={40} />
      <p className="eyebrow">A SMALL DETOUR / 404</p>
      <h1>There’s another direction.</h1>
      <p>That page isn’t here. Your next good question might be.</p>
      <Button asChild>
        <Link href="/analyze">
          Back to your thinking space
          <ArrowRight size={15} />
        </Link>
      </Button>
    </div>
  );
}
