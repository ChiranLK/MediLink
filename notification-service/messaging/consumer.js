import { connectRabbitMQ } from "./rabbitmq.js";
import { processNotification } from "../services/notificationService.js";

const QUEUE_NAME = "notification_queue";

/**
 * Starts consuming messages from the notification queue.
 * Each message is expected to be a JSON payload matching the
 * processNotification() contract:
 *   { email, phone, name, type, patientName?, appointmentDate? }
 *
 * Messages are only acknowledged after successful processing.
 * On failure the message is negatively acknowledged and requeued once.
 */
export async function startConsumer() {
  try {
    const channel = await connectRabbitMQ();

    // Ensure the queue exists (durable = survives broker restart)
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`[RabbitMQ] Waiting for messages on queue "${QUEUE_NAME}"...`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch (parseErr) {
        console.error(
          "[RabbitMQ] Invalid JSON in message, discarding:",
          parseErr.message,
        );
        // Reject without requeue — malformed messages will never succeed
        channel.nack(msg, false, false);
        return;
      }

      try {
        console.log(
          "[RabbitMQ] Processing notification:",
          payload.type,
          payload.email,
        );

        const result = await processNotification(payload);

        if (result.finalStatus === "FAILED") {
          console.warn(
            "[RabbitMQ] Notification processing completed but both channels failed:",
            result.error,
          );
        }

        // Acknowledge — processing completed (even partial success is acceptable)
        channel.ack(msg);
        console.log(
          "[RabbitMQ] Message acknowledged:",
          payload.type,
          "→",
          result.finalStatus,
        );
      } catch (err) {
        console.error("[RabbitMQ] Error processing message:", err.message);

        // Requeue once so transient errors get a retry
        const alreadyRequeued = msg.fields.redelivered;
        if (alreadyRequeued) {
          console.error("[RabbitMQ] Message already redelivered, discarding.");
          channel.nack(msg, false, false);
        } else {
          console.warn("[RabbitMQ] Requeueing message for retry.");
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (err) {
    console.error("[RabbitMQ] Consumer startup failed:", err.message);
    throw err;
  }
}
