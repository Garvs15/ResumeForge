// NEXTJS API Route
import { Job, Resume } from "@/lib/types";
import { chatAction } from "@/utils/actions/api/chat/route";
import { NextRequest, NextResponse } from "next/server";
import amqp from "amqplib";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { resume, job, userMessage, config } = body as {
            resume: Resume;
            job?: Job | null;
            userMessage?: string;
            config?: any;
        };

        // 🐇 Connect to the RabbitMQ
        const conn = await amqp.connect("amqp://localhost");
        const channel = await conn.createChannel();

        const QUEUE = "chat_queue";

        await channel.assertQueue(QUEUE, { durable: true });

        // Send the job to the queue
        channel.sendToQueue(
            QUEUE, 
            Buffer.from(
                JSON.stringify({
                    resume,
                    job: job || null,
                    userMessage,
                    config,
                })
            ),
            { persistent: true }
        );

        console.log("📤 Job sent to queue");

        // const { output } = await chatAction({ resume, job: job || null, config, userMessage });
        return NextResponse.json({ status: "queued", message: "Processing started" });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || "Something went wrong!" }, { status: 500 });
    }
}

// import { Job, Resume } from "@/lib/types";
// import { NextRequest } from "next/server";
// import { streamText } from "ai";
// import { initializeAIClient } from "@/utils/ai-tools";
// import { tools } from "@/lib/tools";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const { messages, resume, config } = body as {
//       messages: any[];
//       resume: Resume;
//       config?: any;
//     };

//     const result = streamText({
//       model: initializeAIClient(config),
//       messages,
//       tools,
//     });

//     return result.toTextStreamResponse(); // ✅ correct
//   } catch (error: any) {
//     console.error(error);

//     return new Response(
//       JSON.stringify({ error: error.message || "Something went wrong!" }),
//       { status: 500 }
//     );
//   }
// }