import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
    const publicRoutes = ["/", "/login", "/signup"];

    const path = request.nextUrl.pathname;

    if (publicRoutes.includes(path)) {
        console.log("⚡ Skipping auth for public route:", path);
        return NextResponse.next();
    }

    console.log('🧩 Root middleware invoked for:', request.nextUrl.pathname)
    return await updateSession(request);
}

export const config = {
    matcher: [
         '/((?!_next/static|_next/image|favicon.ico|api|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
    ],
}