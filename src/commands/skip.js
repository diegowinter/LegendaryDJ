module.exports = function skip(message, serverQueue) {
    let value = "";
    if (message.content.split(" ").length > 1) {
      value = message.content.split(" ")[1];
    } else {
      value = 1;
    }

    if ((isNaN(value)) || (value <= 0)) {
      return message.channel.send("The song index must to be a positive number!");
    }

    if (value >= serverQueue.songs.length) {
      return message.channel.send("The given index does not exist in the current queue.");
    }

    if (!message.member.voice.channel) {
      return message.channel.send("You need to be in a voice channel first!");
    }

    if (!serverQueue) {
      return message.channel.send("The queue is empty!");
    }
    
    try {
      serverQueue.songs = [...serverQueue.songs.slice(value-1)];
      serverQueue.connection.dispatcher.end();
    } catch (error) {
      console.log("Error (skip). Maybe an user tried to skip a song without waiting the previous skip to complete.");
    }
}