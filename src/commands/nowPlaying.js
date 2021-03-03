const Discord = require('discord.js');
const { millisToDuration } = require('../util/time');

module.exports = async function nowPlaying(message, serverQueue) {
  if(!message.member.voice.channel) {
    return message.channel.send("You need to be in a voice channel first!");
  }

  if(!serverQueue) {
    return message.channel.send("The queue is empty!");
  }

  const progressInSecs = serverQueue.connection.dispatcher.streamTime;
  const totalProportion = serverQueue.songs[0].duration / 10;
  const a = progressInSecs / totalProportion;
  let progress = `\`${millisToDuration(serverQueue.connection.dispatcher.streamTime)} `;
  for(i=0; i<a; i++) {
    progress += "▬";
  }
  progress += "🔘";
  for(i=a+1; i<9; i++) {
    progress += "▬";
  }
  progress += ` ${millisToDuration(serverQueue.songs[0].duration)}\``

  const currentVolume = `\`🔊 ${serverQueue.volume}\``;

  const queueEmbed = new Discord.MessageEmbed()
    .setColor('#59378c')
    .setTitle('Now playing')
    .addField(serverQueue.songs[0].title, `${progress} ${currentVolume}`)
    .setURL(serverQueue.songs[0].url);
    
  if(serverQueue.songs[1] !== undefined) {
    queueEmbed.addField('Up next', serverQueue.songs[1].title)
  }
  message.channel.send(queueEmbed);
}