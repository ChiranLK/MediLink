import amqplib from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let connection = null;
let channel = null;

/**
 * Establishes a persistent connection and channel to RabbitMQ.
 * Re-uses existing connection/channel if already open.
 */
export async function connectRabbitMQ() {
  if (connection && channel) return channel;

  try {
    connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Limit unacked messages to 1 for fair dispatch
    await channel.prefetch(1);

    console.log("[RabbitMQ] Connected to", RABBITMQ_URL);

    connection.on("error", (err) => {
      console.error("[RabbitMQ] Connection error:", err.message);
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      console.warn("[RabbitMQ] Connection closed. Will reconnect on next use.");
      connection = null;
      channel = null;
    });

    return channel;
  } catch (err) {
    console.error("[RabbitMQ] Failed to connect:", err.message);
    connection = null;
    channel = null;
    throw err;
  }
}

/**
 * Returns the current channel, connecting first if needed.
 */
export async function getChannel() {
  if (!channel) return connectRabbitMQ();
  return channel;
}

/**
 * Gracefully closes the RabbitMQ connection.
 */
export async function closeRabbitMQ() {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (err) {
    console.error("[RabbitMQ] Error during close:", err.message);
  } finally {
    channel = null;
    connection = null;
  }
}
