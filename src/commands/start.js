const Discord = require("discord.js");
const play = require("./play");
const {
  searchYouTubeTrack,
  getYouTubePlaylistTracks
} = require("../services/youtube");
const {
  getSpotifyPlaylistTracks,
  getSpotifyAlbumTracks,
  getSpotifyArtistTracks,
  getSpotifyTrack
} = require("../services/spotify");
const { millisToDuration } = require("../util/time");

module.exports = async function start(message, serverQueue, queue, controlButtons, isNext) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send("You need to be in a voice channel first!");
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send("I have no permissions to play music. Add me again with my correct URL.");
  }

  if (args.length == 1) {
    return message.channel.send("You need to send a link or name of a song in order to play.");
  }

  let songList = [];
  if ((args[1].includes('youtube.com/') || args[1].includes('youtu.be/')) ) {
    if (args[1].includes('/playlist?list=')) {
      try {
        songList = await getYouTubePlaylistTracks(args[1].split('/playlist?list=')[1]);
      } catch (error) {
        message.channel.send("Something went wrong.");
      }
    } else {
      let url = args[1];
      if (args[1].includes('&')) {
        url = args[1].split('&')[0];
      }
      try {
        const song = await searchYouTubeTrack(url);
        songList.push(song);
      } catch (error) {
        if (error.message === "No results found") {
          message.channel.send(`No results found for \"${args[1]}\".`);
        } else {
          message.channel.send("Something went wrong.");
        }
      }
    }
  } else if (args[1].includes('open.spotify.com/')) {
    if (args[1].includes('/playlist/')) {
      try {
        songList = await getSpotifyPlaylistTracks(args[1].split('playlist/')[1].split('?si')[0], message);
      } catch (error) {
        message.channel.send("Something went wrong.");
      }
    } else if (args[1].includes('/album/')) {
      try {
        songList = await getSpotifyAlbumTracks(args[1].split('album/')[1].split('?si')[0], message);
      } catch (error) {
        message.channel.send("Something went wrong.");
      }
    } else if (args[1].includes('/artist/')) {
      try {
        songList = await getSpotifyArtistTracks(args[1].split('artist/')[1].split('?si')[0], message);
      } catch (error) {
        message.channel.send("Something went wrong.");
      }
    } else if (args[1].includes('/track/')) {
      try {
        let name = await getSpotifyTrack(args[1].split('track/')[1].split('?si')[0], message);
        const song = await searchYouTubeTrack(name, message);
        songList.push(song);
      } catch (error) {
        message.channel.send("Something went wrong.");
      }
    }
  } else {
    const query = message.content.replace(message.content.split(" ")[0], '');
    try {
      const song = await searchYouTubeTrack(query);
      songList.push(song);
    } catch (error) {
      if (error.message === "No results found") {
        message.channel.send(`No results found for \"${query}\"`);
      } else {
        message.channel.send("Something went wrong.");
      }
    }
  }

  let queuePreview = '';
  if (songList.length == 0) {
    return;
  } else {
    queuePreview += `${songList[0].title} (${millisToDuration(songList[0].duration)})\n`;
    if (songList[1] != undefined) {
      queuePreview += `${songList[1].title} (${millisToDuration(songList[1].duration)})\n`;
    }
    if (songList[2] != undefined) {
      queuePreview += `${songList[2].title} (${millisToDuration(songList[2].duration)})\n`;
      if ((songList.length - 3) > 0) {
        queuePreview += `... and ${songList.length - 3} more`;
      }
    }
  }
  
  if (!serverQueue) {
    const queueServerInstance = {
      message: message,
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      isPlaying: true, 
      stream: null,
      playing: true,
      npMessage: null,
      currentSeekValue: 0
    };
    
    queue.set(message.guild.id, queueServerInstance);
    if (songList.length > 1){
      message.channel.send(new Discord.MessageEmbed()
        .setColor('#345b99')
        .setTitle('Queued')
        .setDescription(queuePreview)
      );
    }

    queueServerInstance.songs = queueServerInstance.songs.concat(songList);

    try {
      var connection = await voiceChannel.join();
      queueServerInstance.connection = connection;
      play(message, queueServerInstance.songs[0], queue, false, controlButtons);
    } catch (err) {
      console.error(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    let title;

    if (isNext) {
      serverQueue.songs = [serverQueue.songs[0], ...songList, ...serverQueue.songs.slice(1)];
      title = 'Up next';
    } else {
      serverQueue.songs = serverQueue.songs.concat(songList);
      title = 'Queued';
    }

    if (songList.length == 1) {
      return message.channel.send(new Discord.MessageEmbed()
        .setColor('#345b99')
        .setTitle(title)
        .setDescription(queuePreview)
      );
    } else if (songList.length > 1) {
      message.channel.send(new Discord.MessageEmbed()
        .setColor('#345b99')
        .setTitle(title)
        .setDescription(queuePreview)
      );
    } 
  }
}