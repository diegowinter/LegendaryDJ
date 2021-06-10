const Discord = require('discord.js');
const { millisToDuration } = require("../util/time");

module.exports = async function queue(serverQueue, simpleQueue, message) {
  let value = "";

  if (!simpleQueue) {
    if (message.content.split(" ").length > 1) {
      value = message.content.split(" ")[1];
    } else {
      value = 1;
    }
  } else {
    value = 1;
  }

  if ((isNaN(value)) || (value < 0)) {
    return 'The page index must to be a positive number!';
  }

  if (!serverQueue) {
    return 'The queue is empty!';
  }

  const totalLength = serverQueue.songs.length;
  let pages = Math.trunc((totalLength-1) / 10);
  if (((totalLength-1) % 10) > 0) pages++;

  if (value > pages) {
    if ((totalLength === 1) && (value === 1)) {
      return 'The queue is empty!';
    }
    else return 'The page ' + value + ' does not exist in the current queue.';
  }

  let totalDuration = 0;
  serverQueue.songs.forEach(song => {
    totalDuration += song.duration;
  });

  let nowPlaying = `${serverQueue.songs[0].title} (${millisToDuration(serverQueue.songs[0].duration)})`;

  const queuePages = splitQueue([...serverQueue.songs]);

  let songList = '';
  queuePages[value-1].forEach((song, index) => {
    songList += `${((value-1) * 10) + (index + 1)} - ${song.title} (${millisToDuration(song.duration)})\n`;
  });

  const queueEmbed = new Discord.MessageEmbed()
    .setColor('#b5a900')
    .setTitle('Queue')
    .addField('Now playing', nowPlaying)
    .addField('Up next', songList)
    .setFooter(`Total: ${totalLength - 1} (${millisToDuration(totalDuration)}) • Page: ${value}/${pages}`);

  return queueEmbed;
}

function splitQueue(inputArray) {
  inputArray.shift();
  var perChunk = 10;  
  var result = inputArray.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/perChunk);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return result;
}