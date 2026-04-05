"use client";

import { useState, useRef, useCallback } from "react";

type AgentKey = "ceo" | "research" | "developer" | "designer" | "marketing";
type AgentStatus = "idle" | "thinking" | "done" | "error";

interface Agent {
  key: AgentKey;
  name: string;
  role: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
}

const AGENTS: Agent[] = [
  {
    key: "ceo",
    name: "CEO Agent",
    role: "Vision & Strategy",
    emoji: "👔",
    color: "text-violet-300",
    bgGradient: "from-violet-900/40 to-purple-900/20",
    borderColor: "border-violet-500/30",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    key: "research",
    name: "Research Agent",
    role: "Market Intelligence",
    emoji: "🔬",
    color: "text-blue-300",
    bgGradient: "from-blue-900/40 to-cyan-900/20",
    borderColor: "border-blue-500/30",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    key: "developer",
    name: "Dev Agent",
    role: "Tech Architecture",
    emoji: "💻",
    color: "text-emerald-300",
    bgGradient: "from-emerald-900/40 to-teal-900/20",
    borderColor: "border-emerald-500/30",
    glowColor: "rgba(52, 211, 153, 0.4)",
  },
  {
    key: "designer",
    name: "Designer Agent",
    role: "Brand & UX",
    emoji: "🎨",
    color: "text-pink-300",
    bgGradient: "from-pink-900/40 to-rose-900/20",
    borderColor: "border-pink-500/30",
    glowColor: "rgba(244, 114, 182, 0.4)",
  },
  {
    key: "marketing",
    name: "Marketing Agent",
    role: "Growth & Pitch",
    emoji: "📢",
    color: "text-orange-300",
    bgGradient: "from-orange-900/40 to-amber-900/20",
    borderColor: "border-orange-500/30",
    glowColor: "rgba(251, 146, 60, 0.4)",
  },
];

const EXAMPLE_IDEAS = [
  "AI-powered travel planner that creates personalized itineraries",
  "Mental health app for remote workers using AI therapy",
  "Web3 marketplace for digital art with AI curation",
  "Food delivery startup focused on healthy meal preps",
  "EdTech platform for learning coding with AI tutors",
];

export default function HomePage() {
  const [startupIdea, setStartupIdea] = useState("");
  const [agentOutputs, setAgentOutputs] = useState<
    Record<AgentKey, string>
  >({} as Record<AgentKey, string>);
  const [agentStatuses, setAgentStatuses] = useState<
    Record<AgentKey, AgentStatus>
  >({} as Record<AgentKey, AgentStatus>);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentKey | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runAgent = useCallback(
    async (agent: Agent, idea: string): Promise<void> => {
      setCurrentAgent(agent.name);
      setAgentStatuses((prev) => ({ ...prev, [agent.key]: "thinking" }));
      setAgentOutputs((prev) => ({ ...prev, [agent.key]: "" }));

      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupIdea: idea, agentKey: agent.key }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("API error");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No reader");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          setAgentOutputs((prev) => ({
            ...prev,
            [agent.key]: (prev[agent.key] || "") + text,
          }));
        }

        setAgentStatuses((prev) => ({ ...prev, [agent.key]: "done" }));
        setCompletedCount((c) => c + 1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setAgentStatuses((prev) => ({ ...prev, [agent.key]: "error" }));
        }
      }
    },
    []
  );

  const handleRun = async () => {
    if (!startupIdea.trim() || isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setCompletedCount(0);
    setAgentOutputs({} as Record<AgentKey, string>);
    setAgentStatuses({} as Record<AgentKey, AgentStatus>);
    setSelectedAgent(null);

    for (let i = 0; i < AGENTS.length; i++) {
      await runAgent(AGENTS[i], startupIdea);
      setProgress(((i + 1) / AGENTS.length) * 100);
    }

    setCurrentAgent(null);
    setIsRunning(false);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsRunning(false);
    setCurrentAgent(null);
  };

  const hasResults = Object.keys(agentOutputs).length > 0;

  return (
    <div className="min-h-screen bg-[#050510] grid-overlay relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="orb1 absolute w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #7c3aed 0%, #4f46e5 50%, transparent 70%)",
            top: "-10%",
            left: "-5%",
          }}
        />
        <div
          className="orb2 absolute w-[500px] h-[500px] rounded-full opacity-8 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #0891b2 0%, #1d4ed8 50%, transparent 70%)",
            bottom: "-10%",
            right: "-5%",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 text-xs font-medium text-violet-300 border border-violet-500/20">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            <span className="text-white">AI </span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Company
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Give your startup idea to a full AI executive team. Watch 5 agents
            build your company plan in real-time.
          </p>

          {/* Agent badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {AGENTS.map((a) => (
              <span
                key={a.key}
                className="glass px-3 py-1 rounded-full text-sm font-medium"
                style={{ color: a.glowColor.replace("0.4", "0.9") }}
              >
                {a.emoji} {a.name}
              </span>
            ))}
          </div>
        </header>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="glass-strong rounded-2xl p-6 border border-violet-500/10">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Your Startup Idea
            </label>
            <div className="relative">
              <textarea
                value={startupIdea}
                onChange={(e) => setStartupIdea(e.target.value)}
                placeholder="e.g., AI-powered travel startup that creates personalized itineraries..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-base leading-relaxed"
                rows={3}
                disabled={isRunning}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    handleRun();
                }}
              />
            </div>

            {/* Example ideas */}
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLE_IDEAS.map((idea, i) => (
                <button
                  key={i}
                  onClick={() => setStartupIdea(idea)}
                  disabled={isRunning}
                  className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400 hover:border-violet-500/40 hover:text-violet-300 transition-all bg-white/3 disabled:opacity-50"
                >
                  {idea.length > 40 ? idea.slice(0, 40) + "…" : idea}
                </button>
              ))}
            </div>

            {/* Run button */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleRun}
                disabled={!startupIdea.trim() || isRunning}
                className="flex-1 relative overflow-hidden rounded-xl py-4 font-bold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: !startupIdea.trim() || isRunning
                    ? "rgba(79, 70, 229, 0.3)"
                    : "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)",
                  boxShadow: !startupIdea.trim() || isRunning
                    ? "none"
                    : "0 0 30px rgba(139, 92, 246, 0.4)",
                }}
              >
                {isRunning ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Agents Working... {completedCount}/{AGENTS.length}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span> Launch AI Team
                  </span>
                )}
              </button>

              {isRunning && (
                <button
                  onClick={handleStop}
                  className="px-5 py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium"
                >
                  Stop
                </button>
              )}
            </div>

            {/* Progress bar */}
            {isRunning && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>
                    {currentAgent
                      ? `${currentAgent} is analyzing...`
                      : "Initializing..."}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full shimmer rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {AGENTS.map((agent) => {
            const status = agentStatuses[agent.key] || "idle";
            const output = agentOutputs[agent.key] || "";
            const isActive = status === "thinking";
            const isDone = status === "done";
            const isSelected = selectedAgent === agent.key;

            return (
              <div
                key={agent.key}
                onClick={() => isDone && setSelectedAgent(isSelected ? null : agent.key)}
                className={`
                  glass rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden
                  ${isActive ? "agent-active" : ""}
                  ${isDone ? "cursor-pointer hover:border-opacity-60" : ""}
                  ${isSelected ? "border-opacity-80 scale-[1.02]" : ""}
                  bg-gradient-to-br ${agent.bgGradient}
                `}
                style={{
                  borderColor: isActive || isSelected
                    ? agent.glowColor.replace("0.4", "0.6")
                    : "rgba(255,255,255,0.08)",
                  boxShadow: isActive
                    ? `0 0 30px ${agent.glowColor}`
                    : isSelected
                    ? `0 0 20px ${agent.glowColor.replace("0.4", "0.3")}`
                    : "none",
                }}
              >
                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  {isActive && (
                    <span className="flex h-3 w-3">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: agent.glowColor.replace("0.4", "0.8") }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-3 w-3"
                        style={{ backgroundColor: agent.glowColor.replace("0.4", "1") }}
                      />
                    </span>
                  )}
                  {isDone && (
                    <span className="text-emerald-400 text-base">✓</span>
                  )}
                  {status === "error" && (
                    <span className="text-red-400 text-base">✗</span>
                  )}
                </div>

                {/* Agent info */}
                <div className="text-4xl mb-3">{agent.emoji}</div>
                <h3 className={`font-bold text-sm ${agent.color}`}>
                  {agent.name}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">{agent.role}</p>

                {/* Status text */}
                <div className="mt-3 text-xs">
                  {status === "idle" && (
                    <span className="text-slate-600">Waiting...</span>
                  )}
                  {isActive && (
                    <span className={`${agent.color} opacity-80 flex items-center gap-1`}>
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Analyzing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-emerald-400">
                      {output.length} chars · Click to view
                    </span>
                  )}
                  {status === "error" && (
                    <span className="text-red-400">Error occurred</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Output */}
        {selectedAgent && agentOutputs[selectedAgent] && (
          <div className="mb-8 animate-in fade-in duration-300">
            {(() => {
              const agent = AGENTS.find((a) => a.key === selectedAgent)!;
              return (
                <div
                  className="glass-strong rounded-2xl border overflow-hidden"
                  style={{
                    borderColor: agent.glowColor.replace("0.4", "0.3"),
                  }}
                >
                  <div
                    className={`flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r ${agent.bgGradient}`}
                    style={{ borderColor: agent.glowColor.replace("0.4", "0.2") }}
                  >
                    <span className="text-2xl">{agent.emoji}</span>
                    <div>
                      <h3 className={`font-bold ${agent.color}`}>
                        {agent.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{agent.role}</p>
                    </div>
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="ml-auto text-slate-400 hover:text-white transition-colors text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 max-h-[500px] overflow-y-auto">
                    <pre
                      className={`agent-output ${agent.color} opacity-90`}
                      style={{ fontFamily: "inherit" }}
                    >
                      {agentOutputs[selectedAgent]}
                      {agentStatuses[selectedAgent] === "thinking" && (
                        <span className="typing-cursor" />
                      )}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* All Results - when all done */}
        {completedCount === AGENTS.length && !isRunning && (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #059669, #0891b2, #4f46e5)",
                }}
              >
                <span>✅</span>
                Your AI Company is Ready! All 5 Agents Completed.
              </div>
            </div>

            {AGENTS.map((agent) => (
              <div
                key={agent.key}
                className="glass rounded-2xl border overflow-hidden"
                style={{ borderColor: agent.glowColor.replace("0.4", "0.2") }}
              >
                <button
                  className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all hover:bg-white/3 bg-gradient-to-r ${agent.bgGradient}`}
                  onClick={() =>
                    setSelectedAgent(
                      selectedAgent === agent.key ? null : agent.key
                    )
                  }
                >
                  <span className="text-2xl">{agent.emoji}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold ${agent.color}`}>{agent.name}</h3>
                    <p className="text-slate-400 text-sm">{agent.role}</p>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium mr-2">
                    Completed
                  </span>
                  <span
                    className={`text-slate-400 transition-transform duration-200 ${selectedAgent === agent.key ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>

                {selectedAgent === agent.key && agentOutputs[agent.key] && (
                  <div className="px-6 py-4 border-t border-white/5 max-h-96 overflow-y-auto">
                    <pre
                      className={`agent-output ${agent.color} opacity-90`}
                      style={{ fontFamily: "inherit" }}
                    >
                      {agentOutputs[agent.key]}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasResults && !isRunning && (
          <div className="text-center py-16 text-slate-600">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-xl font-medium text-slate-500">
              Your AI Executive Team is Ready
            </p>
            <p className="text-sm mt-2">
              Enter your startup idea above and launch the team
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-slate-600 text-sm border-t border-white/5">
        <p>
          AI Company — Multi-Agent Startup Builder ·{" "}
          <span className="text-violet-400">Powered by Claude AI</span>
        </p>
      </footer>
    </div>
  );
}
