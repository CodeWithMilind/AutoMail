"use client"

import { useAuth } from "@/hooks/useAuth"
import { LoginButton } from "@/components/auth/login-button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Auto Email AI Assistant
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your emails and automate your workflow.
          </p>
        </div>
        <div className="flex justify-center pt-4">
          <LoginButton />
        </div>
      </div>
    </div>
  )
}
