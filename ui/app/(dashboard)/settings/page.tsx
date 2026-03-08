"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Mail, Bell, Sparkles, Shield, Palette, Cpu, Key, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    llm_provider: "ollama",
    groq_api_key: "",
    ollama_model: "llama3",
    groq_model: "llama-3.1-8b-instant"
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveAI = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast({
          title: "Settings saved",
          description: "Your AI provider settings have been updated.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" />
      <div className="flex-1 space-y-6 p-8">
        {/* LLM Provider Settings */}
        <Card className="bg-card border-border shadow-sm ring-1 ring-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Cpu className="h-5 w-5 text-primary" />
              AI LLM Provider
            </CardTitle>
            <CardDescription>Choose between local AI (Ollama) or fast Cloud AI (Groq)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="provider">Active Provider</Label>
                <Select 
                  value={settings.llm_provider} 
                  onValueChange={(v) => setSettings({...settings, llm_provider: v})}
                >
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ollama">Ollama (Local AI)</SelectItem>
                    <SelectItem value="groq">Groq (Fast Cloud AI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.llm_provider === "groq" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="groq_key" className="flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      Groq API Key
                    </Label>
                    <Input 
                      id="groq_key" 
                      type="password" 
                      placeholder="gsk_..." 
                      value={settings.groq_api_key}
                      onChange={(e) => setSettings({...settings, groq_api_key: e.target.value})}
                    />
                    <p className="text-[10px] text-muted-foreground">Your key is stored securely on the server.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groq_model">Groq Model</Label>
                    <Select 
                      value={settings.groq_model} 
                      onValueChange={(v) => setSettings({...settings, groq_model: v})}
                    >
                      <SelectTrigger id="groq_model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llama-3.1-8b-instant">llama-3.1-8b-instant (Recommended – fast & free)</SelectItem>
                        <SelectItem value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</SelectItem>
                        <SelectItem value="mixtral-8x7b-32768">mixtral-8x7b-32768</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="ollama_model">Ollama Model</Label>
                  <Input 
                    id="ollama_model" 
                    placeholder="llama3" 
                    value={settings.ollama_model}
                    onChange={(e) => setSettings({...settings, ollama_model: e.target.value})}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Model in use</p>
                <p className="text-xs text-muted-foreground">
                  {settings.llm_provider === "groq" ? settings.groq_model : settings.ollama_model}
                </p>
              </div>
              <Button onClick={handleSaveAI} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save AI Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <User className="h-5 w-5 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@company.com" />
              </div>
            </div>
            <Button variant="outline">Save Profile</Button>
          </CardContent>
        </Card>

        {/* AI Assistant Behavior */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Behavior
            </CardTitle>
            <CardDescription>Configure how the AI processes your emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-extract tasks</Label>
                <p className="text-sm text-muted-foreground">AI will identify actionable tasks</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Priority detection</Label>
                <p className="text-sm text-muted-foreground">AI will analyze urgency levels</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
