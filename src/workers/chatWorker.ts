import dotenv from "dotenv";
dotenv.config();

import amqp from "amqplib";
import { chatAction } from "@/utils/actions/api/chat/route";

async function startWorker() {
    const conn = await amqp.connect(process.env.RABBITMQ_URL!);
    const channel = await conn.createChannel();

    const QUEUE = "chat_queue";

    await channel.assertQueue(QUEUE, { durable: true });

    console.log("🟢 Worker started...");

    channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());

        console.log("📩 Received:", data.userMessage);

        const result = await chatAction(data);

        // Send response back
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)),
        {
            correlationId: msg.properties.correlationId
        }
    );

        console.log("✅ Output:", result.output);

        channel.ack(msg);
    });
}

startWorker();

