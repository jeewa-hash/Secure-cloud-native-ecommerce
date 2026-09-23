// order-service/config/rabbitmqConfig.js
import amqp from "amqplib";

let channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Step 1: Assert the exchange so it exists before we send anything
    // 'fanout' sends the message to EVERY queue bound to it (User & Shop)
    await channel.assertExchange("order_events", "fanout", { durable: true });
    
    console.log("RabbitMQ Connected & Exchange Asserted");
    return channel;
  } catch (error) {
    console.error("RabbitMQ Connection Error:", error);
  }
};

export const getChannel = () => channel;

// Step 2: Add this helper function to send the data
export const publishOrderMessage = (data) => {
  console.log("Attempting to publish message to RabbitMQ...", data);
  if (!channel) {
    console.error("Channel not initialized!");
    return;
  }
  const exchange = "order_events";
  channel.publish(exchange, "", Buffer.from(JSON.stringify(data)));
  console.log(" [x] Event published to RabbitMQ:", data.type);
};