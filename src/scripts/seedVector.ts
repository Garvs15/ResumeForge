import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { getEmbedding } from "@/lib/localEmbedding";

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY!
// });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function run() {
    const project = {
        name: "Airwave",
        content: `
      Airwave is a full stack project built using React, Redux, Node.js,
      Express.js, Redis, Sequelize, Passport Auth, TailwindCSS, GSAP.
    `,
        technologies: [
            "React",
            "Redux",
            "NodeJS",
            "ExpressJS",
            "Redis",
            "Sequelize",
            "Passport Auth",
            "TailwindCSS",
            "GSAP",
        ],
    };

    // const embedding = await openai.embeddings.create({
    //     model: "text-embedding-3-small",
    //     input: project.content,
    // });

    // LOCAL Embedding (FREE)
    const vector = await getEmbedding(project.content);

    const { error } = await supabase.from("resume_embeddings").insert({
        content: project.content,
        embedding: vector,
        metadata: {
            project: project.name,
            technologies: project.technologies,
        },
    });

    if (error) {
        console.log("❌ Insert error:", error);
    } else {
        console.log("✅ Airwave indexed successfully");
    }
}

run();