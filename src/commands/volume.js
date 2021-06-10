module.exports = function volume(message, serverQueue) {
  let value = "";
  if (message.content.split(" ").length > 1) {
    value = message.content.split(" ")[1];
  } else {
    return 'Usage: \`-v <value between 0 and 100>\`';
  }

  if ((isNaN(value)) || (value < 0) || (value > 100)) {
    return 'The value must be a number between 0 and 100!';
  }

  if (!message.member.voice.channel) {
    return 'You need to be in a voice channel first!';
  }

  if (!serverQueue) {
    return 'The queue is empty!';
  }

  serverQueue.volume = value;
  serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  message.react('👍');
}