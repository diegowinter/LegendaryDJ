module.exports = function volume(message, serverQueue) {
    let value = "";
    if(message.content.split(" ").length > 1) {
        value = message.content.split(" ")[1];
    } else {
        return message.channel.send("Usage: \`-v <value between 0 and 100>\`");
    }

    if((isNaN(value)) || (value < 0) || (value > 100)) {
        return message.channel.send("The value must be a number between 0 and 100!");
    }

    if(!message.member.voice.channel) {
        return message.channel.send("You need to be in a voice channel first!");
    }

    if(!serverQueue) {
        return message.channel.send("The queue is empty!");
    }

    serverQueue.volume = value;
    serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
}