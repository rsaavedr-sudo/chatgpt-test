import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("GET error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("agents")
      .insert([body])
      .select();

    if (error) {
      console.error("POST error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data[0]);
  } catch (err) {
    console.error("POST crash:", err);
    return Response.json(
      { error: err.message || "Erro ao criar agente" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;

    const { data, error } = await supabase
      .from("agents")
      .update(rest)
      .eq("id", id)
      .select();

    if (error) {
      console.error("PUT error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data[0]);
  } catch (err) {
    console.error("PUT crash:", err);
    return Response.json(
      { error: err.message || "Erro ao atualizar agente" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "ID ausente" }, { status: 400 });
    }

    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE crash:", err);
    return Response.json(
      { error: err.message || "Erro ao excluir agente" },
      { status: 500 }
    );
  }
}
