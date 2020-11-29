function getKBroker(node) {
  return process.env.KAFKA_BROKER || 'localhost:9092';
}

async function sendMessage(topic, data) {
  const producer = global.producer;
  await producer.connect();
  await producer.send({
    topic: topic,
    messages: [
      { value: JSON.stringify(data) },
    ],
  });
  console.log('send done');
}

module.exports = {
  sendMessage,
  getKBroker
};
