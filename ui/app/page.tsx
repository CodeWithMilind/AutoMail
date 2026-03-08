import { LoginButton } from "@/components/auth/login-button";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
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
  );
}
