import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "agents.json");

export async function GET() {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const agents = JSON.parse(fileContent);

    return Response.json(agents);
  } catch (error) {
    return Response.json(
      { error: "Erro ao carregar agentes" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const agents = await req.json();

    fs.writeFileSync(filePath, JSON.stringify(agents, null, 2), "utf-8");

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: "Erro ao salvar agentes" },
      { status: 500 }
    );
  }
}
