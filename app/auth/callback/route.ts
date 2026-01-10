import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile, create one if not
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        // Create profile if it doesn't exist (new user)
        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            credits: 10, // 10 free credits (10 searches) for new users
          });

          // Log the free credits as a transaction
          await supabase.from("transactions").insert({
            user_id: user.id,
            amount: 10,
            type: "bonus",
            description: "Welcome bonus - 10 free searches",
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
