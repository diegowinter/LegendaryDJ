module.exports = function remove(message, serverQueue) {
  let value = '';
  if (message.content.split(" ").length > 1) {
    value = message.content.split(" ")[1];
  } else {
    return message.channel.send('You must send an index in order to remove!');
  }

  if ((isNaN(value)) || (value <= 0)) {
    return message.channel.send('The song index must to be a positive number!');
  }

  if (value >= serverQueue.songs.length) {
    return message.channel.send('The given index does not exist in the current queue.');
  }

  if (!message.member.voice.channel) {
    return message.channel.send('You must to be in a voice channel first!');
  }

  if (!serverQueue) {
    return message.channel.send('The queue is empty!');
  }

  try {
    serverQueue.songs.splice(value, 1);
    message.react('👍');
  } catch (error) {
    console.log('Error: remove command');
  }
}