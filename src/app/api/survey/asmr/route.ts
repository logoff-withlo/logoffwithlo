import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Flatten checkbox arrays to comma-separated strings
    const row: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      row[key] = Array.isArray(value) ? value.join(", ") : (value as string);
    }

    row.submitted_at = new Date().toISOString();

    const { error } = await supabase.from("asmr_responses").insert([row]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Survey API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET: return all responses for the data viz page
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("asmr_responses")
      .select("*")
      .order("submitted_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
