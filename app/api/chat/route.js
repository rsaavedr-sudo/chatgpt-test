import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function loadAgents() {
  const filePath = path.join(process.cwd(), "data", "agents.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}

function buildSystemPrompt(agent) {
  return `
Você é ${agent.name}.

IDIOMA:
${agent.language}

PAPEL:
${agent.role}

OBJETIVO:
${agent.objective}

TOM:
${agent.tone}

INSTRUÇÕES:
${agent.instructions}

LIMITES:
${agent.limits}

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
    const { message, model, agentId } = await req.json();

    const agents = loadAgents();
    const selectedAgent =
      agents.find((agent) => agent.id === agentId) || agents[0];

    const selectedModel =
      model || selectedAgent.model || "gpt-4.1-mini";

    const response = await client.responses.create({
      model: selectedModel,
      input: [
        {
          role: "system",
          content: buildSystemPrompt(selectedAgent),
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return Response.json({
      reply: response.output_text,
      agentName: selectedAgent.name,
      usedModel: selectedModel,
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message || "Erro ao processar a mensagem",
      },
      { status: 500 }
    );
  }
}
