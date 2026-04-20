"use client";

import { useEffect, useState } from "react";

type ChatItem = {
  role: "user" | "assistant";
  text: string;
  model?: string;
  agentName?: string;
};

type AgentOption = {
  id: string;
  name: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt-4.1-mini");
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [agentId, setAgentId] = useState("sales");

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        setAgents(data);

        if (data.length > 0) {
          setAgentId(data[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar agentes");
      }
    }

    loadAgents();
  }, []);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, model, agentId }),
      });

      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || data.error || "Sem resposta",
          model,
          agentName: data.agentName,
        },
      ]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Erro ao enviar a mensagem",
          model,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Teste ChatGPT</h1>

      <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
        Agente
      </label>

      <select
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>

      <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
        Modelo
      </label>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <option value="gpt-4.1-mini">gpt-4.1-mini</option>
        <option value="gpt-4.1">gpt-4.1</option>
      </select>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          minHeight: 250,
          marginBottom: 16,
          background: "#fafafa",
        }}
      >
        {history.length === 0 ? (
          <div style={{ color: "#666" }}>Aún no hay mensajes.</div>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: 14,
                padding: 12,
                borderRadius: 8,
                background: item.role === "user" ? "#e8f0fe" : "#f1f3f4",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 6 }}>
                {item.role === "user" ? "Tú" : item.agentName || "ChatGPT"}
                {item.role === "assistant" && item.model ? ` · ${item.model}` : ""}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{item.text}</div>
            </div>
          ))
        )}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escreve tua mensagem"
        rows={5}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          padding: "10px 18px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </main>
  );
}
