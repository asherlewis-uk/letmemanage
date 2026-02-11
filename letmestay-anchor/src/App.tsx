import React, { useState, useCallback, useEffect } from "react"
import { Copy, RefreshCw, Wifi, WifiOff, Monitor, Smartphone, Laptop } from "lucide-react"
import { invoke } from "@tauri-apps/api/core"

// Utility function to join class names conditionally
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// INLINE UI COMPONENTS
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20",
      outline: "border border-zinc-700 bg-transparent text-slate-200 hover:bg-zinc-800 hover:border-zinc-600",
      ghost: "bg-transparent text-slate-200 hover:bg-zinc-800",
      destructive: "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30",
    }
    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-7 px-3 text-xs",
      icon: "h-8 w-8",
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-900 text-slate-200 shadow-xl",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

// ============================================
// TOAST HOOK (INLINE)
// ============================================

interface Toast {
  id: string
  message: string
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2000)
  }, [])

  return { toasts, toast }
}

// ============================================
// TYPES
// ============================================

interface ConnectedClient {
  id: string
  name: string
  latency: number
  deviceType: "laptop" | "phone" | "desktop"
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function App() {
  const [connectionKey, setConnectionKey] = useState("Loading...")
  const [isOnline] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [clients, setClients] = useState<ConnectedClient[]>([
    { id: "1", name: "Asher's MacBook Air", latency: 12, deviceType: "laptop" },
    { id: "2", name: "iPhone 15 Pro", latency: 24, deviceType: "phone" },
    { id: "3", name: "Gaming PC", latency: 8, deviceType: "desktop" },
  ])

  const { toasts, toast } = useToast()

  useEffect(() => {
    const generateInitialKey = async () => {
      try {
        const key = await invoke<string>("generate_tether_key")
        setConnectionKey(key)
      } catch (error) {
        console.error("Failed to generate tether key:", error)
        toast("Failed to generate connection key")
        setConnectionKey("Error")
      }
    }
    generateInitialKey()
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(connectionKey)
    toast("Key copied to clipboard")
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const key = await invoke<string>("generate_tether_key")
      setConnectionKey(key)
      toast("New connection key generated")
    } catch (error) {
      console.error("Failed to regenerate tether key:", error)
      toast("Failed to regenerate connection key")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDisconnect = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId))
    toast("Client disconnected")
  }

  const getDeviceIcon = (type: ConnectedClient["deviceType"]) => {
    switch (type) {
      case "laptop":
        return <Laptop className="h-4 w-4 text-violet-400" />
      case "phone":
        return <Smartphone className="h-4 w-4 text-violet-400" />
      case "desktop":
        return <Monitor className="h-4 w-4 text-violet-400" />
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-zinc-800 border border-zinc-700 text-slate-200 px-4 py-2 rounded-md text-sm shadow-lg animate-in slide-in-from-right fade-in duration-200"
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[400px]">
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Wifi className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-white font-semibold text-base tracking-tight">
                  LetMeStay
                </h1>
                <p className="text-xs text-slate-400">The Anchor Host</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "relative flex h-2.5 w-2.5",
                  isOnline && "animate-pulse"
                )}
              >
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-75",
                    isOnline ? "bg-emerald-400 animate-ping" : "bg-red-400"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-2.5 w-2.5",
                    isOnline ? "bg-emerald-500" : "bg-red-500"
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  isOnline ? "text-emerald-400" : "text-red-400"
                )}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Key Card */}
          <div className="p-5">
            <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Connection Key
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-7 w-7"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="h-7 w-7"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        isRegenerating && "animate-spin"
                      )}
                    />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center py-2">
                <span className="font-mono text-4xl font-bold tracking-[0.2em] text-white bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
                  {connectionKey}
                </span>
              </div>
              <p className="text-center text-xs text-slate-500 mt-2">
                Share this key with LetMeStay clients to connect
              </p>
            </div>
          </div>

          {/* Client List */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Connected Clients
              </span>
              <span className="text-xs text-slate-500">
                {clients.length} active
              </span>
            </div>

            <div className="space-y-2">
              {clients.length === 0 ? (
                <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-6 text-center">
                  <WifiOff className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No clients connected</p>
                </div>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-zinc-950 rounded-lg border border-zinc-800 p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                        {getDeviceIcon(client.deviceType)}
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 font-medium">
                          {client.name}
                        </p>
                        <p className="text-xs font-mono text-emerald-400">
                          {client.latency}ms
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(client.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Disconnect
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <p className="text-xs text-slate-500 font-mono text-center">
              Service running on port{" "}
              <span className="text-violet-400">51820</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}