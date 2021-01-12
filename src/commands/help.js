const Discord = require('discord.js');

module.exports = function help(message) {

    "Commands:\n" +
        
    message.channel.send(new Discord.MessageEmbed()
        .setColor('#e09719')
        .setTitle('Help')
        .addField('Commands',
            "\`-p (or -play) <song name/link or playlist link>\`: Play/add to queue a song/playlist " +
                "(YouTube and Spotify links are accepted)\n" +
            "\`-q (or -queue)\`: Show current queue\n" +
            "\`-sk (or -skip) <position in queue (optional)>\`: Skip to next song or to given index\n" +
            "\`-st (or -stop)\`: Stop playback\n" +
            "\`-v (or -volume) <value between 0 and 100>\`: Change volume\n"
        )
        .setFooter(`LegendaryDJ v${process.env.npm_package_version}`)
    );
}