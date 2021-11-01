const Discord = require("discord.js");

module.exports = function pauseResume(serverQueue, mode) {
  if (!serverQueue) {
    return 'The queue is empty!';
  }

  if (mode == 'pause-resume') {
    if (serverQueue.isPlaying) {
      serverQueue.connection.dispatcher.pause();
      serverQueue.isPlaying = false;
      return new Discord.MessageEmbed()
        .setColor('#FCD85D')
        .setTitle('Paused');
    } else {
      serverQueue.connection.dispatcher.resume();
      serverQueue.isPlaying = true;
      return new Discord.MessageEmbed()
        .setColor('#FCD85D')
        .setTitle('Resumed');
    }
  } else if (mode == 'pause' && serverQueue.isPlaying) {
    serverQueue.connection.dispatcher.pause();
    serverQueue.isPlaying = false;
    return new Discord.MessageEmbed()
      .setColor('#FCD85D')
      .setTitle('Paused');
  } else if (mode == 'resume' && !serverQueue.isPlaying) {
    serverQueue.connection.dispatcher.resume();
    serverQueue.isPlaying = true;
    return new Discord.MessageEmbed()
      .setColor('#FCD85D')
      .setTitle('Resumed');
  }
}