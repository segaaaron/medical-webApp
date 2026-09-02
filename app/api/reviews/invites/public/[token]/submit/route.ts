import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";
import {
  proxyError,
  checkCsrfOrigin,
  checkWriteRateLimit,
  INVITE_TOKEN_RE,
} from "@/lib/api-helpers";
import { MIN_REVIEW_BODY, MAX_REVIEW_BODY } from "@/lib/review-limits";

// POST /api/reviews/invites/public/[token]/submit — public (patient submits review)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const csrfErr = checkCsrfOrigin(req);
  if (csrfErr) return csrfErr;
  const rateLimit = checkWriteRateLimit(req);
  if (rateLimit) return rateLimit;

  const { token } = await params;
  if (!INVITE_TOKEN_RE.test(token)) {
    return NextResponse.json(
      { error: "INVITE_INVALID", reason: "not_found" },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 },
    );
  }

  const {
    rating,
    body: reviewBody,
    treatment,
  } = body as Record<string, unknown>;

  if (
    typeof rating !== "number" ||
    !Number.isFinite(rating) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Calificación inválida." },
      { status: 400 },
    );
  }
  if (
    !reviewBody ||
    typeof reviewBody !== "string" ||
    reviewBody.trim().length < MIN_REVIEW_BODY ||
    reviewBody.trim().length > MAX_REVIEW_BODY
  ) {
    return NextResponse.json(
      {
        error: `La reseña debe tener entre ${MIN_REVIEW_BODY} y ${MAX_REVIEW_BODY} caracteres.`,
      },
      { status: 400 },
    );
  }
  if (
    treatment !== undefined &&
    treatment !== null &&
    treatment !== "" &&
    typeof treatment !== "string"
  ) {
    return NextResponse.json(
      { error: "Tratamiento inválido." },
      { status: 400 },
    );
  }
  if (typeof treatment === "string" && treatment.trim().length > 150) {
    return NextResponse.json(
      { error: "Tratamiento demasiado largo." },
      { status: 400 },
    );
  }

  const payload = {
    rating,
    body: reviewBody.trim().slice(0, MAX_REVIEW_BODY),
    treatment:
      typeof treatment === "string" && treatment.trim()
        ? treatment.trim().slice(0, 150)
        : null,
  };

  const { data, error, status } = await backendFetch<unknown>(
    `/reviews/invites/${token}/submit`,
    { method: "POST", body: payload },
  );
  if (error) return proxyError(error, status);

  return NextResponse.json(data, { status: status === 200 ? 201 : status });
}
