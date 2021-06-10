const { durationToMillis, millisToDuration } = require('../util/time');
const play = require("./play");

module.exports = function seek(message, serverQueue, queue) {
  let value = '';
  if (message.content.split(" ").length > 1) {
    value = message.content.split(" ")[1];
  } else {
    return 'You must send a time in order to seek!';
  }

  if (!value.includes(':')) {
    return 'Send a time separated with a colon, like 2:25.';
  }

  if (!message.member.voice.channel) {
    return 'You must to be in a voice channel first!';
  }

  if (!serverQueue) {
    return 'The queue is empty!';
  }

  const millisToSeek = durationToMillis(value);
  if (millisToSeek > serverQueue.songs[0].duration) {
    return `The time is longer than the song (${millisToDuration(serverQueue.songs[0].duration)}).`;
  }

  const secondsToSeek = millisToSeek / 1000;
  serverQueue.connection.dispatcher.end();
  message.react('🕒');
  play(message, serverQueue.songs[0], queue, true, secondsToSeek);
}