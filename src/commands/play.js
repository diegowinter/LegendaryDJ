const ytdl = require("discord-ytdl-core");
// const ytdl = require("ytdl-core");
const { searchYouTubeTrack } = require("../services/youtube");
const Discord = require("discord.js");
const { millisToDuration } = require("../util/time");

module.exports = async function play(message, song, queue, isSeeking, controlButtons, seek = 0) {
  const guild = message.guild;
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    serverQueue.textChannel.send("End of the queue. Disconnected.");
    return;
  }
  
  let loadingMessage = undefined;
  if (song.url === undefined) {
    loadingMessage = await serverQueue.textChannel.send("Loading song...");
    try {
      const searchResult = await searchYouTubeTrack(song.title);
      song.url = searchResult.url;
      song.duration = searchResult.duration;
    } catch (error) {
      console.log('Error (searching Spotify song)', error);
      serverQueue.textChannel.send(`Something went wrong. ${song.title} may be unavailable.`);
    }
  }

  try {
    serverQueue.stream = ytdl(song.url, {
      filter: 'audioonly',
      opusEncoded: true,
      seek
    });
    const dispatcher = serverQueue.connection
      .play(serverQueue.stream, { 
        type: 'opus'
      })
      .on("finish", () => {
          serverQueue.songs.shift();
          play(message, serverQueue.songs[0], queue, false, controlButtons);
      })
      .on("error", error => {
          console.error('Error (dispatcher error)', error);
          serverQueue.textChannel.send("Something went wrong (dispatcher error).")
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    if (!isSeeking) {
      serverQueue.currentSeekValue = 0;
      const duration = millisToDuration(song.duration)
      const queueEmbed = new Discord.MessageEmbed()
        .setColor('#4f8a48')
        .setTitle('Now playing')
        .setDescription(`${song.title} (${duration})`)
        .setURL(song.url)
      if (serverQueue.songs[1] !== undefined) {
        queueEmbed.setFooter(`Up next: ${serverQueue.songs[1].title}`);
      }
      if (loadingMessage !== undefined) {
        loadingMessage.delete();
      }
      if (serverQueue.npMessage != null) {
        serverQueue.npMessage.delete();
      }
      serverQueue.npMessage = await serverQueue.textChannel.send({ embed: queueEmbed, component: controlButtons });
    } else {
      serverQueue.currentSeekValue = seek;
      message.reactions.removeAll().catch(error => console.error('Failed to remove reactions: ', error));
      message.react('👍');
    }
  } catch (error) {
    console.log('Error:', error);
    serverQueue.textChannel.send(`Something went wrong. ${song.title} may be unavailable.`);
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0], queue, controlButtons);
  }
}