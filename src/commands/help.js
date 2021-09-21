const Discord = require('discord.js');

module.exports = function help(message) {   
  return new Discord.MessageEmbed()
    .setColor('#e09719')
    .setTitle('Help')
    .addField('Commands',
      "\`-p (or -play) <song name/link or playlist link>\`: Play/add to queue a song/playlist " +
          "(YouTube and Spotify links are accepted)\n" +
      "\`-np (or -nowplaying)\`: Show information about current song\n" +
      "\`-q (or -queue)\`: Show current queue\n" +
      "\`-sk (or -skip) <position in queue (optional)>\`: Skip to next song or to given index\n" +
      "\`-st (or -stop)\`: Stop playback\n" +
      "\`-v (or -volume) <value between 0 and 100>\`: Change volume\n"+
      "\`-rm (or -remove) <position in queue>\`: Remove a song in queue\n"+
      "\`-se (or -seek) <time in format mm:ss>\`: Seek to a position in the song\n"+
      "\`-l (or -lyrics) <song name (optional)> \`: Get the lyrics of a song"
    )
    .setFooter(`LegendaryDJ v${process.env.npm_package_version}`);
}