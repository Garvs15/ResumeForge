import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    const { text, userId } = await req.json();

    // Split into chunks
    const chunks = text.match(/.{1,500}/g) || [];

    for (const chunk of chunks) {
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk,
        });
        
        await supabase.from("resume_embeddings").insert({
            user_id: userId,
            content: chunk,
            embedding: embedding.data[0].embedding,
        });
    };

    return Response.json({ success: true });
}