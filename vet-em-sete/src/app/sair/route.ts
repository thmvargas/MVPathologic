import { NextResponse, type NextRequest } from "next/server";
import { supabaseSessao } from "@/lib/supabase/servidor";

export async function POST(req: NextRequest) {
  const supabase = await supabaseSessao();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.nextUrl.origin), { status: 303 });
}
