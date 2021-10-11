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
    const spotifyLoadingMessage = new Discord.MessageEmbed()
        .setColor('#1ABC54')
        .setTitle('Searching song')
        .setDescription(`Searching for ${song.title} on YouTube. Please wait...`);
    loadingMessage = await serverQueue.textChannel.send({ embed: spotifyLoadingMessage });

    let searchResult;
    try {
      searchResult = await searchYouTubeTrack(song.title);
    } catch (error) {
      console.log('Error (searching Spotify song)', error);
      const errorMessage = new Discord.MessageEmbed()
        .setColor('#E61405')
        .setTitle('Something went wrong')
        .setDescription(`${song.title} may be unavailable. Skipped.`);
      serverQueue.textChannel.send({ embed: errorMessage });
      loadingMessage.delete();
      serverQueue.songs.shift();
      play(message, serverQueue.songs[0], queue, false, controlButtons, 0);
      return;
    }
    song.url = searchResult.url;
    song.duration = searchResult.duration;
  }

  try {
    serverQueue.stream = ytdl(song.url, {
      requestOptions: {
        headers: {
          cookie: process.env.COOKIE,
        }
      },
      filter: 'audioonly',
      opusEncoded: true,
      seek,
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
          const errorMessage = new Discord.MessageEmbed()
            .setColor('#E61405')
            .setTitle('Something went wrong')
            .setDescription(`Dispatcher error. Try again later.`);
          serverQueue.textChannel.send({ embed: errorMessage });
          // serverQueue.textChannel.send("Something went wrong (dispatcher error).");
          serverQueue.voiceChannel.leave();
          queue.delete(serverQueue.message.guild.id);
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
    const errorMessage = new Discord.MessageEmbed()
      .setColor('#E61405')
      .setTitle('Something went wrong')
      .setDescription(`${song.title} may be unavailable. Skipped.`);
    serverQueue.textChannel.send({ embed: errorMessage });
    serverQueue.songs.shift();
    play(message, serverQueue.songs[0], queue, false, controlButtons, 0);
  }
}