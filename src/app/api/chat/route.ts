// NEXTJS API Route
import { Job, Resume } from "@/lib/types";
import { chatAction } from "@/utils/actions/api/chat/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resume, job, userMessage, config } = body as {
            resume: Resume;
            job?: Job | null;
            userMessage?: string;
            config?: any
        };

        const { output } = await chatAction({ resume, job: job || null, config, userMessage });
        return NextResponse.json({ output });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || "Something went wrong!" }, { status: 500 });
    }
}