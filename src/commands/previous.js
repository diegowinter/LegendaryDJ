const Discord = require("discord.js");

module.exports = function stop(serverQueue) {
  // if (!message.member.voice.channel) {
  //   return 'You must to be in a voice channel first!';
  // }

  if (!serverQueue) {
    return 'The queue is empty!';
  }

  try {
    if (serverQueue.playedSongs.length == 0) {
      serverQueue.songs.unshift(serverQueue.songs[0]);
    } else {
      serverQueue.songs.splice(1, 0, serverQueue.playedSongs[serverQueue.playedSongs.length - 1]);
      serverQueue.songs.splice(2, 0, serverQueue.songs[0]);
      serverQueue.playedSongs.pop();
    }
    serverQueue.skippingMethod = 'command';
    serverQueue.connection.dispatcher.end();
  } catch (error) {
    console.log("Error (stop). Maybe a user tried to stop the playback when the queue was loading.");
  }
}