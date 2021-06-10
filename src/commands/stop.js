module.exports = function stop(serverQueue, queue) {
  // if (!message.member.voice.channel) {
  //   return 'You must to be in a voice channel first!';
  // }

  if (!serverQueue) {
    return 'The queue is empty!';
  }

  try {
    serverQueue.voiceChannel.leave();
    queue.delete(serverQueue.message.guild.id);
    return 'Disconnected.';
  } catch(error) {
    console.log("Error (stop). Maybe a user tried to stop the playback when the queue was loading.");
  }
}