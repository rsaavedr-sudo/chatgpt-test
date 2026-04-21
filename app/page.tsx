"use client";

import { useEffect, useState } from "react";

type Agent = {
  id: string;
  name: string;
};

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();

        if (Array.isArray(data)) {
          setAgents(data);

          if (data.length > 0) {
            setSelectedAgentId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar agentes");
      }
    }

    loadAgents();
  }, []);

  async function sendMessage() {
    if (!message.trim() || !selectedAgentId) return;

    try {
      setLoading(true);
      setResponse("");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          model,
          agentId: selectedAgentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse(data.error || "Erro ao enviar mensagem");
        return;
      }

      setResponse(data.reply || "Sem resposta");
    } catch (error) {
      setResponse("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 48, marginBottom: 12 }}>Flow360 AI</h1>

      <p style={{ color: "#666", marginBottom: 24, fontSize: 20 }}>
        Plataforma de agentes inteligentes e automação de conversas
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Agente</label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          style={inputStyle}
        >
          <option value="">Selecione um agente</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Modelo</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={inputStyle}
        >
          <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          <option value="gpt-4.1">gpt-4.1</option>
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Mensagem</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={textareaStyle}
        />
      </div>

      <button onClick={sendMessage} style={buttonStyle} disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>

      <div style={{ marginTop: 30 }}>
        <strong style={{ display: "block", marginBottom: 10 }}>Resposta:</strong>
        <div style={responseBoxStyle}>{response}</div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 16,
  background: "#fff",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 140,
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
  resize: "vertical",
  background: "#fff",
};

const buttonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

const responseBoxStyle: React.CSSProperties = {
  minHeight: 80,
  padding: "16px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  whiteSpace: "pre-wrap",
};
