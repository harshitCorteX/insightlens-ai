"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state">
      <h1>Let’s take another look.</h1>
      <p>
        This page couldn’t load. Try again; your current tab’s saved session may
        still be available.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
