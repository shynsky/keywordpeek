"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const hasFetched = useRef(false);

  const fetchUserSettings = useCallback(async () => {
    const supabase = createClient();

    // Dev mode: use mock user ID
    const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
    if (devUserId) {
      setEmail("dev@localhost");
      setIsLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email || "");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching on mount is a standard pattern
      fetchUserSettings();
    }
  }, [fetchUserSettings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-display font-semibold">Profile</h2>
        </div>

        <div className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
