const { connect } = require('amqplib');

const ProducerService = {
    sendMessage: async (queue, message) => {
        const connection = await connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();
        try {
            await channel.assertQueue(queue, { durable: true });
            await channel.sendToQueue(queue, Buffer.from(message));
        } finally {
            await channel.close();
            await connection.close();
        }
    },
};

module.exports = ProducerService;
