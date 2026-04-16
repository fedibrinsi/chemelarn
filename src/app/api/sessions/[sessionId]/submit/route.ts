import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { submitSessionAction } from "@/lib/actions/participant";

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== Role.PARTICIPANT) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = (await request.json()) as {
    answers: Record<string, unknown>;
    autoSubmitted?: boolean;
  };

  const result = await submitSessionAction(sessionId, body.answers, body.autoSubmitted);
  return NextResponse.json({ success: true, ...result });
}
