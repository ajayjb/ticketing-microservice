import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const cookie = request.cookies.getAll();

  const isPublicRoute = PUBLIC_ROUTES.some((publicRoute) =>
    path.startsWith(publicRoute)
  );

  if (!isPublicRoute) {
    const headers = new Headers();
    if (request.headers.get("cookie")) {
      headers.set("cookie", request.headers.get("cookie") as string);
    }
    try {
      const user = await fetch(
        "http://tickets.com/api/auth/v1/user/currentUser",
        {
          method: "GET",
          headers,
        }
      );
      console.log(user.json());
    } catch (err) {
      console.log(err);
    }
  }

  if (path.startsWith("/signin")) {
    if (cookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/signup")) {
    if (cookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Protect all routes except /_next, /api, and static files
export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|robots.txt).*)"],
};
