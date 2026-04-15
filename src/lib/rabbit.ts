import amqp from "amqplib";

const URL = "amqp://admin:admin@localhost:5672";

export async function getRabbitChannel() {
    const conn = await amqp.connect(URL);
    const channel = await conn.createChannel();

    return { conn, channel };
}
