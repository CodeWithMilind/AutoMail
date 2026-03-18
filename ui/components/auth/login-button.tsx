"use client"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function LoginButton() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (error: any) {
      toast.error(`Login failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Mail className="size-4" />
      )}
      Sign in with Google
    </Button>
  )
}
