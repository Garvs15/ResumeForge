import amqp from "amqplib";
import { chatAction } from "@/utils/actions/api/chat/route";

async function startWorker() {
    const conn = await amqp.connect("amqp.//localhost");
    const channel = await conn.createChannel();

    const QUEUE = "chat_queue";

    
}

