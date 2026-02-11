import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link, Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [connectionKey, setConnectionKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (connectionKey.length !== 6) {
      setError("Connection key must be 6 characters");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await invoke("attempt_connection", { key: connectionKey });
      setIsConnected(true);
    } catch (err) {
      console.error("Connection failed:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to LetMeStay host");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionKey("");
    setError(null);
  };

  const handleKeyChange = (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitized.length <= 6) {
      setConnectionKey(sanitized);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Link className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">LetMeGo Satellite</h1>
                <p className="text-xs text-slate-400">Remote Client</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("relative flex h-3 w-3", isConnecting && "animate-pulse")}>
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-75",
                    isConnected ? "bg-emerald-400 animate-ping" : isConnecting ? "bg-yellow-400 animate-ping" : "bg-red-400"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-3 w-3",
                    isConnected ? "bg-emerald-500" : isConnecting ? "bg-yellow-500" : "bg-red-500"
                  )}
                />
              </span>
              <span className={cn("text-xs font-medium", isConnected ? "text-emerald-400" : isConnecting ? "text-yellow-400" : "text-red-400")}>
                {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {!isConnected ? (
              <form onSubmit={handleConnect} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/50">
                    <WifiOff className="h-10 w-10 text-zinc-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Connect to LetMeStay</h2>
                  <p className="text-sm text-slate-400">Enter the 6-character key from your LetMeStay host</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">
                    Connection Key
                  </label>
                  <input
                    type="text"
                    placeholder="XXXXXX"
                    value={connectionKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    className="flex h-14 w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 text-center font-mono text-3xl tracking-[0.5em] text-slate-200 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
                    maxLength={6}
                    disabled={isConnecting}
                    autoComplete="off"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={connectionKey.length !== 6 || isConnecting}
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md text-base font-medium bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-5 w-5" />
                      Connect to Anchor
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                    <Wifi className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Connected</h2>
                  <p className="text-sm text-slate-400">Session is active</p>
                </div>

                <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Connection Key
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-center py-2">
                    <span className="font-mono text-3xl font-bold tracking-[0.3em] text-white">
                      {connectionKey}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md text-base font-medium border border-zinc-700 bg-transparent text-slate-200 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <p className="text-xs text-slate-500 font-mono text-center">
              {isConnected ? "Session active" : "Waiting for connection..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}