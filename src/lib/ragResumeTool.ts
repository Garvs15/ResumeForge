import { createClient } from "@supabase/supabase-js";
import { tool } from "ai";
import OpenAI from "openai";
import z from "zod";
import redis from "./redis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const ragResumeTool = tool({
  description: "Retrieve resume context using semantic search",
  inputSchema: z.object({
    query: z.string(),
  }),

  execute: async ({ query }) => {
    console.log("✅ RAG TOOL HIT");
    console.log("Question:", query);

    const start = Date.now();
    const cacheKey = `embed:${query}`;

    let embedding: number[];

    // -----------------------------
    // 1. Embedding (cached)
    // -----------------------------
    const cached = await redis.get<string>(cacheKey);

    if (cached) {
      embedding = JSON.parse(cached);
    } else {
      const t1 = Date.now();

      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });

      embedding = result.data[0].embedding;

      await redis.set(cacheKey, JSON.stringify(embedding));
      await redis.expire(cacheKey, 3600);

      console.log("⏱️ Embedding time:", Date.now() - t1, "ms");
    }

    // -----------------------------
    // 2. Vector search
    // -----------------------------
    const t2 = Date.now();

    const { data, error } = await supabase.rpc("match_resume", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 3,
      filter_project: "Airwave",
    });

    if (error) {
      console.log("❌ Supabase error:", error);
    }

    console.log("RAG RAW DATA:", JSON.stringify(data, null, 2));
    console.log("⏱️ DB time:", Date.now() - t2, "ms");

    if (!data || data.length === 0) {
      return {
        context: "No resume data found in vector DB. Please index data first.",
        technologies: [],
      };
    }

    const context = data
      .map((d: any) => d.content)
      .join("\n");

    const technologies = [
      ...new Set(
        data.flatMap((d: any) => d.metadata?.technologies || [])
      ),
    ];

    console.log("⏱️ Total RAG time:", Date.now() - start, "ms");

    return {
      project: "Airwave",
      context,
      technologies,
    };
  },
});