export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof AppError)
    return Response.json({ error: error.message }, { status: error.status });
  return Response.json(
    { error: "We couldn't complete that request. Please try again shortly." },
    { status: 500 },
  );
}
export async function readJson(
  request: Request,
  limit = 200000,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError("Send JSON content.", 415);
  if (Number(request.headers.get("content-length")) > limit)
    throw new AppError("That request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("A request body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new AppError("That request is too large.", 413);
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("The request isn't valid JSON.");
  }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const expected = configured
    ? new URL(configured).origin
    : new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new AppError("This request must come from the application.", 403);
}
