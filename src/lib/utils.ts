import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function normalizeContent(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim();
}
export function ownsRecord(userId: string | undefined, ownerId: string) {
  return Boolean(userId && userId === ownerId);
}
export const verificationLabel = "Not independently verified";
export function safeNext(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/library";
}
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    signal: options?.signal ?? AbortSignal.timeout(75000),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error || "Something went wrong. Please try again.");
  return body as T;
}
export function downloadMarkdown(
  text: string,
  filename = "insightlens-notes.md",
) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
