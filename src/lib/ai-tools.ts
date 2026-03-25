import type { Tool } from "ai";

export type ResumeTools = 
| Tool<{
    name: "getResume";
    input: { sections?: string[] };
    output: unknown;
}>
| Tool<{
    name: "modifyWholeResume";
    input: {};
    output: unknown;
}>
| Tool<{
    name: "suggest_work_experience_improvement";
    input: { index: number };
    output: { improved_experience: any };
}>
| Tool<{
    name: "suggest_project_improvement",
    input: { index: number };
    output: { improved_project: any };
}>