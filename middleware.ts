import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return (await updateSession(request)) ?? NextResponse.next();
  } catch (error) {
    console.error("[middleware] Unhandled middleware failure", {
      pathname: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!login|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"
  ]
};
