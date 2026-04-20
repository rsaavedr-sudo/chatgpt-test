"use client";

import { useEffect, useState } from "react";

type Agent = {
  id: string;
  name: string;
  language: string;
  role: string;
  objective: string;
  tone: string;
  instructions: string;
  limits: string;
  model: string;
  extraPrompt: string;
  knowledgeBase: string;
};

const emptyAgent: Agent = {
  id: "",
  name: "",
  language: "Português do Brasil",
  role: "",
  objective: "",
  tone: "",
  instructions: "",
  limits: "",
  model: "gpt-4.1-mini",
  extraPrompt: "",
  knowledgeBase: "",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<Agent>(emptyAgent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        setAgents(data);

        if (data.length > 0) {
          setSelectedId(data[0].id);
          setForm(data[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar agentes");
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  function handleSelectChange(id: string) {
    setSelectedId(id);
    const found = agents.find((agent) => agent.id === id);
    if (found) {
      setForm(found);
    }
  }

  function handleChange(field: keyof Agent, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function createNewAgent() {
    const timestamp = Date.now();
    const newAgent: Agent = {
      ...emptyAgent,
      id: `agent_${timestamp}`,
      name: "Novo Agente",
    };

    setAgents((prev) => [...prev, newAgent]);
    setSelectedId(newAgent.id);
    setForm(newAgent);
  }

  async function saveAgents() {
    try {
      setSaving(true);

      const exists = agents.some((agent) => agent.id === form.id);

      const updatedAgents = exists
        ? agents.map((agent) => (agent.id === form.id ? form : agent))
        : [...agents, form];

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAgents),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar");
      }

      setAgents(updatedAgents);
      alert("Agente salvo com sucesso");
    } catch (error) {
      alert("Erro ao salvar agente");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 20 }}>Carregando agentes...</main>;
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Gestão de Agentes</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          onClick={createNewAgent}
          style={{
            padding: "12px 18px",
            fontSize: 16,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Criar novo agente
        </button>
      </div>

      <label style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}>
        Selecionar agente
      </label>

      <select
        value={selectedId}
        onChange={(e) => handleSelectChange(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
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

      <div style={{ display: "grid", gap: 14 }}>
        <input
          value={form.id}
          onChange={(e) => handleChange("id", e.target.value)}
          placeholder="ID"
          style={inputStyle}
        />

        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Nome"
          style={inputStyle}
        />

        <input
          value={form.language}
          onChange={(e) => handleChange("language", e.target.value)}
          placeholder="Idioma"
          style={inputStyle}
        />

        <input
          value={form.role}
          onChange={(e) => handleChange("role", e.target.value)}
          placeholder="Papel"
          style={inputStyle}
        />

        <textarea
          value={form.objective}
          onChange={(e) => handleChange("objective", e.target.value)}
          placeholder="Objetivo"
          rows={3}
          style={textareaStyle}
        />

        <input
          value={form.tone}
          onChange={(e) => handleChange("tone", e.target.value)}
          placeholder="Tom"
          style={inputStyle}
        />

        <textarea
          value={form.instructions}
          onChange={(e) => handleChange("instructions", e.target.value)}
          placeholder="Instruções"
          rows={4}
          style={textareaStyle}
        />

        <textarea
          value={form.limits}
          onChange={(e) => handleChange("limits", e.target.value)}
          placeholder="Limites"
          rows={3}
          style={textareaStyle}
        />

        <input
          value={form.model}
          onChange={(e) => handleChange("model", e.target.value)}
          placeholder="Modelo padrão"
          style={inputStyle}
        />

        <textarea
          value={form.extraPrompt}
          onChange={(e) => handleChange("extraPrompt", e.target.value)}
          placeholder="Prompt adicional"
          rows={4}
          style={textareaStyle}
        />

        <textarea
          value={form.knowledgeBase}
          onChange={(e) => handleChange("knowledgeBase", e.target.value)}
          placeholder="Base de informações"
          rows={6}
          style={textareaStyle}
        />
      </div>

      <button
        onClick={saveAgents}
        disabled={saving}
        style={{
          marginTop: 20,
          padding: "12px 18px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        {saving ? "Salvando..." : "Salvar agente"}
      </button>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  fontSize: 16,
  border: "1px solid #ccc",
  borderRadius: 8,
};

const textareaStyle = {
  width: "100%",
  padding: 12,
  fontSize: 16,
  border: "1px solid #ccc",
  borderRadius: 8,
};
