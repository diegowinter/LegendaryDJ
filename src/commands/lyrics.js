const Discord = require('discord.js');
const geniusApi = require('genius-lyrics-api');

module.exports = async function lyrics(message, serverQueue) {
    if(!message.member.voice.channel) {
        return message.channel.send("You need to be in a voice channel first!");
    }

    if(!serverQueue) {
        return message.channel.send("The queue is empty!");
    }

    try {
        const result = await geniusApi.searchSong({
            title: serverQueue.songs[0].title
                .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''),
            artist: '',
            apiKey: process.env.GENIUS_TOKEN,
            optimizeQuery: true
        })
        if(result == null) {
            return message.channel.send(`No lyrics found for ${serverQueue.songs[0].title}.`);
        }

        let selectedIndex = 0;
        let occurrences = 0;
        result.forEach((item, index) => {
            let currentOccurrences = 0;
            const queryItems = serverQueue.songs[0].title.toLowerCase().split(" ");
            queryItems.forEach(word => {
                if(item.title.toLowerCase().includes(word)) {
                    currentOccurrences++;
                }
            })
            if(currentOccurrences > occurrences) {
                selectedIndex = index;
                occurrences = currentOccurrences;
            }
        });

        const lyrics = await geniusApi.getLyrics(result[selectedIndex].url);
        const verses = lyrics.split('\n');
        let part = '';
        let parts = [];
        verses.forEach(verse => {
            if(part.length < 1800) {
                part += `${verse}\n` ;
            } else {
                parts.push(part);
                part = '';
                part += `${verse}\n`;
            }
        });
        parts.push(part);

        for(i=0; i<parts.length; i++) {
            if(parts[i].length > 2048) {
                return message.channel.send('Something went wrong.');
            }
        }
        
        parts.forEach((part, index) => {
            let embed = new Discord.MessageEmbed()
                .setColor('#3d1775')
                .setDescription(part);
            if(index == 0) {
                embed.setTitle(result[selectedIndex].title.split('by')[0])
                    .setThumbnail(result[selectedIndex].albumArt);
            }
            if(index == parts.length - 1) {
                embed.setFooter('Lyrics powered by Genius');
            }
            message.channel.send(embed);
        });
    } catch(error) {
        console.log(error);
    }
}