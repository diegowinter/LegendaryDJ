module.exports = function stop(message, serverQueue, queue) {
  if (!message.member.voice.channel) {
    return message.channel.send("You need to be in a voice channel first!");
  }

  if (!serverQueue) {
    return message.channel.send("The queue is empty!");
  }

  try {
    serverQueue.voiceChannel.leave();
    queue.delete(message.guild.id);
    message.channel.send('Disconnected.');
  } catch(error) {
    console.log("Error (stop). Maybe a user tried to stop the playback when the queue was loading.");
  }
}