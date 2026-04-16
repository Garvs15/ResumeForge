"use server";

import { streamText, tool } from "ai";
import { z } from "zod/v3";

import { AIConfig, Job, Resume } from "@/lib/types";
import { initializeAIClient } from "@/utils/ai-tools";
import { ragResumeTool } from "@/lib/ragResumeTool";

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
  userMessage,
}: {
  resume: Resume;
  job: Job | null;
  config?: AIConfig;
  userMessage?: string;
}) {
  /* --------- Define Tools --------- */
   const start = Date.now();
  const getResumeTool = tool({
    description: "Read selected sections of the resume",
    inputSchema: getResumeSchema,
    // execute: async ({ sections }: GetResumeArgs) => {
    //   console.log("GET RESUME TOOL CALLED", sections);
    //   console.log("RESUME SIZE:", JSON.stringify(resume).length);

    //   const personalInfo = {
    //     first_name: resume.first_name,
    //     last_name: resume.last_name,
    //     email: resume.email,
    //     phone_number: resume.phone_number,
    //     location: resume.location,
    //     website: resume.website,
    //     linkedin_url: resume.linkedin_url,
    //     github_url: resume.github_url,
    //   };

    //   const sectionMap = {
    //     personal_info: personalInfo,
    //     work_experience: resume.work_experience,
    //     education: resume.education,
    //     skills: resume.skills,
    //     projects: resume.projects,
    //   };

    //   // ADD HERE
    //   console.log("RESUME DATA SENT TO MODEL:", sectionMap);

    //   if (sections.includes("all")) {
    //     return { ...sectionMap, target_role: resume.target_role };
    //   }

    //   return Object.fromEntries(
    //     sections.map((s) => [s, sectionMap[s as keyof typeof sectionMap]]),
    //   );
    // },
  execute: async () => {
  console.log("GET RESUME TOOL CALLED");

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

  const fullResume = {
    personal_info: personalInfo,
    work_experience: resume.work_experience,
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
    target_role: resume.target_role,
  };

  console.log("FULL RESUME SENT:", fullResume);

  return fullResume;
}
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
    toolChoice: "auto",
    model: initializeAIClient(config),
    // For Normal Chatbot
    messages: [
      {
        role: "system",
        content: `
        You are a resume assistant.

        STRICT RULES:
        - You already have the resume
        - DO NOT ask for resume
        - DO NOT explain what you will do
        - DIRECTLY give improvements

        OUTPUT FORMAT: 

        If user asks for improvements:

        1. Work Experience Improvements:
        - Show improved bullet points (rewrite, not advice)

        2. Project Improvements:
        - Rewrite bullets with impact + metrics

        3. Skills Improvements:
        - Suggest additions/removals

        4. Keep response SHORT and actionable
        - No long paragraphs
        - No generic explanation

        HIGHLIGHT RULES:
        - Wrap weak/improvable parts using:
          <mark class="weak">...</mark>

        - Wrap strong/impactful parts using:
          <mark class="good">...</mark>

        - Return response in HTML (NOT markdown)
        `,
      },

      //  FOR RAG CHATBOT
//        {
//       role: "system",
//       content: `
//       You are a resume assistant.
//       Use ragResume tool to fetch resume data.

// Return ONLY the answer from tool output.
// Do not use general knowledge.
// Do not guess.
// If tool returns nothing → "Not enough data"
//       `,
//     },

      {
        role: "user",
        content: `USER QUERY:
        ${userMessage} || 

RESUME:
${JSON.stringify(resume, null, 2)}`

// content: userMessage || "",

      },
    ],
    tools: {
      // type: "tool",
      // ragResume: ragResumeTool,
      getResume: getResumeTool,
      modifyWholeResume: modifyResumeTool,
    },
  });

  let output = "";
  for await (const delta of result.textStream) {
    output += delta;
  }

  console.log("⏱️ LLM time:", Date.now() - start, "ms");

  return { output };
}

