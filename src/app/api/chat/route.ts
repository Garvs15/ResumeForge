import amqp from "amqplib";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, job, userMessage, config } = body;

    const conn = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await conn.createChannel();

    const QUEUE = "chat_queue";

    await channel.assertQueue(QUEUE, { durable: true });

    // Create temporary response queue
    const { queue: replyQueue } = await channel.assertQueue("", {
      exclusive: true,
    });

    const correlationId = uuidv4();

    // Send request
    channel.sendToQueue(
      QUEUE,
      Buffer.from(
        JSON.stringify({ resume, job: job || null, userMessage, config })
      ),
      {
        correlationId,
        replyTo: replyQueue,
        persistent: true,
      }
    );

    console.log("📤 Job sent to queue");

    // Wait for response
    const response = await new Promise((resolve) => {
      channel.consume(
        replyQueue,
        (msg) => {
          if (msg?.properties.correlationId === correlationId) {
            const data = JSON.parse(msg.content.toString());
            resolve(data);
          }
        },
        { noAck: true }
      );
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong!" },
      { status: 500 }
    );
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