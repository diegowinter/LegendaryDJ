module.exports = function skip(serverQueue, simpleSkip, message) {
  let value = "";
  if (!simpleSkip) {
    if (message.content.split(" ").length > 1) {
      value = message.content.split(" ")[1];
    } else {
      value = 1;
    }
  } else {
    value = 1;
  }

  if (!serverQueue) {
    return 'The queue is empty!';
  }

  if ((isNaN(value)) || (value <= 0)) {
    return 'The song index must to be a positive number!';
  }

  if (value >= serverQueue.songs.length) {
    return 'The given index does not exist in the current queue.';
  }
  
  try {
    serverQueue.playedSongs.push(...serverQueue.songs.slice(0, value));
    serverQueue.songs = [...serverQueue.songs.slice(value-1)];
    serverQueue.skippingMethod = 'command';
    serverQueue.connection.dispatcher.end();
  } catch (error) {
    console.log("Error (skip). Maybe an user tried to skip a song without waiting the previous skip to complete.");
  }
}