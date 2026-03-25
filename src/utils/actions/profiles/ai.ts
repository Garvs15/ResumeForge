"use server";

import { generateObject, LanguageModel } from "ai";
import { z } from "zod";

import { AIConfig } from "@/lib/ai-models";
import { RESUME_FORMATTER_SYSTEM_MESSAGE } from "@/lib/prompts";
import { sanitizeUnknownStrings } from "@/lib/utils";

import { getSubscriptionPlan } from "../stripe/actions";
import { initializeAIClient } from "@/utils/ai-tools";

// TEXT RESUME -> STRUCTURED PROFILE
export async function formatProfileWithAI(
    userMessages: string,
    config?: AIConfig
) {
    try {
        // 1️⃣ Check subscription
        const subscriptionPlan = await getSubscriptionPlan();
        const isPro = subscriptionPlan === "pro";

        // 2️⃣ Initialize AI client (free / pro routing)
        const aiClient = initializeAIClient(config, isPro);

        // 3️⃣ Generate structured object
        const { object } = await generateObject({
            model: aiClient as LanguageModel,

            // ✅ FLAT SCHEMA (CRITICAL FIX)
            schema: z.object({
                first_name: z.string().optional(),
                last_name: z.string().optional(),
                email: z.string().optional(),
                phone_number: z.string().optional(),
                location: z.string().optional(),
                website: z.string().optional(),
                linkedin_url: z.string().optional(),
                github_url: z.string().optional(),

                work_experience: z
                    .array(
                        z.object({
                            company: z.string(),
                            position: z.string(),
                            date: z.string(),
                            location: z.string().optional(),
                            description: z.array(z.string()),
                            technologies: z.array(z.string()).optional(),
                        })
                    )
                    .optional(),

                education: z
                    .array(
                        z.object({
                            school: z.string(),
                            degree: z.string(),
                            field: z.string(),
                            date: z.string(),
                            location: z.string().optional(),
                            gpa: z.string().optional(),
                            achievements: z.array(z.string()).optional(),
                        })
                    )
                    .optional(),

                skills: z
                    .array(
                        z.object({
                            category: z.string(),
                            items: z.array(z.string()),
                        })
                    )
                    .optional(),

                projects: z
                    .array(
                        z.object({
                            name: z.string(),
                            description: z.array(z.string()),
                            technologies: z.array(z.string()).optional(),
                            date: z.string().optional(),
                            url: z.string().optional(),
                            github_url: z.string().optional(),
                        })
                    )
                    .optional(),
            }),

            // 4️⃣ Prompt
            prompt: `
Please analyze the following resume text and extract all relevant information
into a structured JSON profile.

Rules:
- Do NOT invent information
- Use arrays where appropriate
- Leave missing fields undefined
- Be concise and accurate

Resume Text:
${userMessages}
      `,

            // 5️⃣ System prompt
            system:
                config?.customPrompts?.resumeFormatter ??
                (RESUME_FORMATTER_SYSTEM_MESSAGE.content as string),
        });

        // 6️⃣ Sanitize + return
        return sanitizeUnknownStrings(object);
    } catch (error) {
        console.error("formatProfileWithAI error:", error);
        throw error;
    }
}
