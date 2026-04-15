import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import redis from "@/lib/redis";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    const { question } = await req.json();

    // 1. Embed Query
    const cacheKey = `embed:${question}`;
    let embedding: number[] | null = await redis.get(cacheKey);

    if (!embedding) {
        const res = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question
        });

        embedding = res.data[0].embedding;
        await redis.set(cacheKey, embedding);
    }

    // 2. Retrieve
    const { data } = await supabase.rpc("match_resume", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
    });

    if (!data || data.length === 0) {
        return Response.json({
            answer: "No relevant resume context found."
        });
    }

    const context = data.map((d: { content: string }) => d.content).join("\n");

    // 3. Generate answer:- LLM
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "Answer based only on resume context",
            },
            {
                role: "user",
                content: `Content:\n${context}\n\nQuestion: ${question}`,
            },
        ],
    });

    return Response.json({
        answer: completion.choices[0].message.content,
    });
}