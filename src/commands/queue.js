const Discord = require('discord.js');

module.exports = async function queue(message, serverQueue) {
    let value = "";
    if(message.content.split(" ").length > 1) {
        value = message.content.split(" ")[1];
    } else {
        value = 1;
    }

    if((isNaN(value)) || (value < 0)) {
        return message.channel.send("The page index must to be a positive number!");
    }

    if(!message.member.voice.channel) {
        return message.channel.send("You need to be in a voice channel first!");
    }

    if(!serverQueue) {
        return message.channel.send("The queue is empty!");
    }

    const totalLength = serverQueue.songs.length;
    let pages = Math.trunc((totalLength-1) / 10);
    if(((totalLength-1) % 10) > 0) pages++;

    if(value > pages) {
        if((totalLength === 1) && (value === 1)) {
            return message.channel.send("The queue is empty!");
        }
        return message.channel.send("The page " + value + " does not exist in the current queue.");
    }

    let queueMessage = '';
    serverQueue.songs.forEach(song => {
        queueMessage += song.title + '\n';
    });

    let nowPlaying = serverQueue.songs[0].title;

    const queuePages = splitQueue([...serverQueue.songs]);

    let songList = '';
    queuePages[value-1].forEach(song => {
        songList += '• ' + song.title + '\n'
    });

    const queueEmbed = new Discord.MessageEmbed()
        .setColor('#b5a900')
        .setTitle('Queue')
        .addField('Now playing', nowPlaying)
        .addField('Up next', songList)
        .setFooter(`Total: ${totalLength - 1} • Page: ${value}/${pages} • Navigation: -q <page index>`);
    message.channel.send(queueEmbed);
}

function splitQueue(inputArray) {
    inputArray.shift();
    var perChunk = 10;  
    var result = inputArray.reduce((resultArray, item, index) => { 
        const chunkIndex = Math.floor(index/perChunk);
        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [];
        }
        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

    return result;
}