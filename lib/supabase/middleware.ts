import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv, getSupabaseEnvStatus } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest, requestHeaders?: Headers) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({
    request: {
      headers: requestHeaders ?? request.headers
    }
  });

  const env = getSupabaseEnv();
  const envStatus = getSupabaseEnvStatus();
  console.info("[middleware] processing request", {
    pathname,
    hasSupabaseUrl: envStatus.hasUrl,
    hasSupabaseAnonKey: envStatus.hasAnonKey
  });

  if (!env) {
    console.error("[middleware] Supabase environment variables are missing. Skipping auth middleware.", {
      pathname,
      hasSupabaseUrl: envStatus.hasUrl,
      hasSupabaseAnonKey: envStatus.hasAnonKey
    });
    return response;
  }

  const supabase = createServerClient<Database, "public", Database["public"]>(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: requestHeaders ?? request.headers
            }
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  let user = null;
  try {
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("[middleware] Failed to resolve Supabase user", {
      pathname,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return response;
  }

  const isPublicRoute = pathname === "/login" || pathname.startsWith("/auth/callback");

  if (!user && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    console.info("[middleware] Redirecting unauthenticated request", {
      pathname,
      redirectTo: loginUrl.toString()
    });
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
