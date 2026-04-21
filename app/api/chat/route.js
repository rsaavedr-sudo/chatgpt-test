import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function normalizeUuid(value) {
  return String(value || "")
    .replace(/[^a-f0-9-]/gi, "")
    .trim()
    .toLowerCase();
}

function buildSystemPrompt(agent) {
  return `
Você é ${agent.name}.

IDIOMA:
${agent.language || "Português do Brasil"}

PAPEL:
${agent.role || "Assistente"}

OBJETIVO:
${agent.objective || "Ajudar o usuário"}

TOM:
${agent.tone || "Claro e direto"}

INSTRUÇÕES:
${agent.instructions || "Responda com clareza"}

LIMITES:
${agent.limits || "Não invente informações"}

PROMPT ADICIONAL:
${agent.extraPrompt || "Nenhum"}

BASE DE INFORMAÇÕES:
${agent.knowledgeBase || "Nenhuma"}

REGRAS:
- Responda sempre no idioma configurado
- Seja claro e direto
- Não invente informações
`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, model, agentId, history = [] } = body;

    if (!message) {
      return Response.json(
        { error: "Mensagem ausente" },
        { status: 400 }
      );
    }

    if (!agentId) {
      return Response.json(
        { error: "agentId ausente" },
        { status: 400 }
      );
    }

    const cleanAgentId = normalizeUuid(agentId);

    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("*");

    if (agentsError) {
      return Response.json(
        { error: agentsError.message },
        { status: 500 }
      );
    }

    const normalizedAgents = (agents || []).map((item) => ({
      ...item,
      normalizedId: normalizeUuid(item.id),
    }));

    const agent = normalizedAgents.find(
      (item) => item.normalizedId === cleanAgentId
    );

    if (!agent) {
      return Response.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    const selectedModel = model || agent.model || "gpt-4.1-mini";

    const previousMessages = history.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.text,
    }));

    const input = [
      {
        role: "system",
        content: buildSystemPrompt(agent) + "\n\n" + (agent.extraPrompt || ""),
      },
      ...previousMessages,
      {
        role: "user",
        content: message,
      },
    ];

    const response = await openai.responses.create({
      model: selectedModel,
      input,
    });

    return Response.json({
      reply: response.output_text,
      agentName: agent.name,
      usedModel: selectedModel,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    return Response.json(
      { error: error?.message || "Erro ao processar a mensagem" },
      { status: 500 }
    );
  }
}
