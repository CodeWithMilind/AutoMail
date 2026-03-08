"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function LoginButton() {
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      <Mail className="size-4" />
      Sign in with Google
    </Button>
  );
}
