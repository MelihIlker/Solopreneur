import { NextRequest, NextResponse } from "next/server";

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL;

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return redirectToLogin(req);

  try {
    const res = await fetch(`${AUTH_API}api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `access_token=${token}`,
        "credentials": "include",
      },
    });

    if (!res.ok) {
      return redirectToLogin(req);
    }

    const user = await res.json();
    const pathname = req.nextUrl.pathname;
    const requiresAdmin = pathname.startsWith("/admin/*");

    const isAdmin = Boolean(user?.isAdmin);
    if (requiresAdmin && !isAdmin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-is-admin", String(isAdmin));
    requestHeaders.set("x-user-id", String(user?.id));
    requestHeaders.set("x-user-email", String(user?.email));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    console.error("Auth middleware error:", err);
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
