import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  try {
    return (await updateSession(request, requestHeaders)) ?? NextResponse.next();
  } catch (error) {
    console.error("[middleware] Unhandled middleware failure", {
      pathname: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }
}

export const config = {
  matcher: [
    "/((?!login|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"
  ]
};
