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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);

      const res = await fetch("/api/agents");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar agentes");
      }

      setAgents(data);
      setSelectedId("");
      setForm(emptyAgent);
    } catch (error) {
      console.error("Erro ao carregar agentes", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectChange(id: string) {
    setSelectedId(id);

    if (!id) {
      setForm(emptyAgent);
      return;
    }

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
    setSelectedId("");
    setForm(emptyAgent);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveAgent() {
    try {
      setSaving(true);

      const payload = {
        name: form.name,
        language: form.language,
        role: form.role,
        objective: form.objective,
        tone: form.tone,
        instructions: form.instructions,
        limits: form.limits,
        model: form.model,
        extraPrompt: form.extraPrompt,
        knowledgeBase: form.knowledgeBase,
      };

      let res: Response;

      if (selectedId) {
        res = await fetch("/api/agents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedId,
            ...payload,
          }),
        });
      } else {
        res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar agente");
      }

      await loadAgents();
      alert("Agente salvo com sucesso");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar agente");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAgent() {
    if (!selectedId) {
      alert("Selecione um agente para excluir");
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este agente?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const res = await fetch("/api/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir agente");
      }

      await loadAgents();
      alert("Agente excluído com sucesso");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir agente");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Carregando...</main>;
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={heroCard}>
        <div>
          <div style={eyebrow}>AGENT BUILDER</div>
          <h1 style={heroTitle}>Configuração de agentes</h1>
          <p style={heroText}>
            Crie, edite e organize a personalidade, o prompt e a base de
            conhecimento de cada agente.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={createNewAgent} style={primaryButton}>
            + Criar novo agente
          </button>
        </div>
      </div>

      <div style={card}>
        <label style={labelStyle}>Selecionar agente</label>
        <select
          value={selectedId}
          onChange={(e) => handleSelectChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">-- Novo agente --</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      <Section
        title="Configuração básica"
        subtitle="Defina os dados principais do agente."
      >
        <Field label="Nome">
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: Agente Comercial"
          />
        </Field>

        <Field label="Idioma">
          <input
            value={form.language}
            onChange={(e) => handleChange("language", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: Português do Brasil"
          />
        </Field>

        <Field label="Modelo padrão">
          <input
            value={form.model}
            onChange={(e) => handleChange("model", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: gpt-4.1-mini"
          />
        </Field>
      </Section>

      <Section
        title="Personalidade do agente"
        subtitle="Defina o perfil, o objetivo, o tom e os limites do agente."
      >
        <Field label="Papel">
          <input
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: Comercial"
          />
        </Field>

        <Field label="Objetivo">
          <textarea
            value={form.objective}
            onChange={(e) => handleChange("objective", e.target.value)}
            style={textareaStyle}
            placeholder="Explique o objetivo principal do agente"
            rows={4}
          />
        </Field>

        <Field label="Tom">
          <input
            value={form.tone}
            onChange={(e) => handleChange("tone", e.target.value)}
            style={inputStyle}
            placeholder="Ex.: Direto, consultivo, cordial"
          />
        </Field>

        <Field label="Instruções">
          <textarea
            value={form.instructions}
            onChange={(e) => handleChange("instructions", e.target.value)}
            style={textareaStyle}
            placeholder="Como o agente deve responder"
            rows={5}
          />
        </Field>

        <Field label="Limites">
          <textarea
            value={form.limits}
            onChange={(e) => handleChange("limits", e.target.value)}
            style={textareaStyle}
            placeholder="O que o agente não deve fazer"
            rows={4}
          />
        </Field>
      </Section>

      <Section
        title="Prompt adicional"
        subtitle="Instruções complementares para reforçar o comportamento do agente."
      >
        <Field label="Prompt adicional">
          <textarea
            value={form.extraPrompt}
            onChange={(e) => handleChange("extraPrompt", e.target.value)}
            style={textareaStyle}
            placeholder="Adicione instruções extras"
            rows={6}
          />
        </Field>
      </Section>

      <Section
        title="Base de conhecimento"
        subtitle="Informações que o agente deve usar como referência."
      >
        <Field label="Base de conhecimento">
          <textarea
            value={form.knowledgeBase}
            onChange={(e) => handleChange("knowledgeBase", e.target.value)}
            style={textareaStyle}
            placeholder="Produtos, regras, contexto, informações úteis..."
            rows={8}
          />
        </Field>
      </Section>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 20,
        }}
      >
        <button
          onClick={deleteAgent}
          style={dangerButton}
          disabled={!selectedId || deleting}
        >
          {deleting ? "Excluindo..." : "Excluir agente"}
        </button>

        <button onClick={saveAgent} style={primaryButton} disabled={saving}>
          {saving ? "Salvando..." : "Salvar agente"}
        </button>
      </div>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section style={card}>
      <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 28 }}>{title}</h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: 20,
          color: "#666",
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const heroCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
};

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
};

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#666",
  marginBottom: 8,
};

const heroTitle: React.CSSProperties = {
  fontSize: 36,
  margin: 0,
  marginBottom: 10,
};

const heroText: React.CSSProperties = {
  margin: 0,
  color: "#666",
  lineHeight: 1.6,
  maxWidth: 720,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  marginBottom: 8,
  fontSize: 15,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 16,
  border: "1px solid #d1d5db",
  borderRadius: 12,
  background: "#fff",
  color: "#111",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 16,
  border: "1px solid #d1d5db",
  borderRadius: 12,
  background: "#fff",
  color: "#111",
  boxSizing: "border-box",
  resize: "vertical",
};

const primaryButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButton: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid #ef4444",
  background: "#fff",
  color: "#b91c1c",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
