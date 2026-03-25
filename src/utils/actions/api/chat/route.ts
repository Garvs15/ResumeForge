"use server";

import { streamText, tool } from "ai";
import { z } from "zod/v3";

import { AIConfig, Job, Resume } from "@/lib/types";
import { initializeAIClient } from "@/utils/ai-tools";

/* -----------------------------
   ZOD SCHEMAS
-------------------------------- */

// Tool 1: Read resume sections
const getResumeSchema = z.object({
  sections: z.array(z.string()),
});

// Tool 2: Modify resume
const modifyResumeSchema = z.object({
  basic_info: z.any().optional(),
  work_experience: z.any().optional(),
  education: z.any().optional(),
  skills: z.any().optional(),
  projects: z.any().optional(),
});

/* -----------------------------
   TYPES FROM ZOD
-------------------------------- */
type GetResumeArgs = z.infer<typeof getResumeSchema>;
type ModifyResumeArgs = z.infer<typeof modifyResumeSchema>;

/* -----------------------------
   SERVER ACTION
-------------------------------- */
export async function chatAction({
  resume,
  job,
  config,
}: {
  resume: Resume;
  job: Job | null;
  config?: AIConfig;
  userMessage?: string;
}) {
  /* --------- Define Tools --------- */

  const getResumeTool = tool({
    description: "Read selected sections of the resume",
    inputSchema: getResumeSchema,
    execute: async ({ sections }: GetResumeArgs) => {
      const personalInfo = {
        first_name: resume.first_name,
        last_name: resume.last_name,
        email: resume.email,
        phone_number: resume.phone_number,
        location: resume.location,
        website: resume.website,
        linkedin_url: resume.linkedin_url,
        github_url: resume.github_url,
      };

      const sectionMap = {
        personal_info: personalInfo,
        work_experience: resume.work_experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
      };

      if (sections.includes("all")) {
        return { ...sectionMap, target_role: resume.target_role };
      }

      return Object.fromEntries(
        sections.map((s) => [s, sectionMap[s as keyof typeof sectionMap]])
      );
    },
  });

  const modifyResumeTool = tool({
    description: "Modify resume sections with improved content",
    inputSchema: modifyResumeSchema,
    execute: async (updates: ModifyResumeArgs) => {
      // You can store these updates in your DB later
      return updates;
    },
  });

  /* --------- Stream AI Response --------- */
  const result = await streamText({
    model: initializeAIClient(config),
    messages: [
      { role: "system", content: "You are a professional resume assistant." },
      { role: "user", content: "Improve my resume based on best practices." },
    ],
    tools: {
      getResume: getResumeTool,
      modifyWholeResume: modifyResumeTool,
    },
  });

  let output = "";
  for await (const delta of result.textStream) {
    output += delta;
  }

  return { output };
}
