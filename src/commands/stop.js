module.exports = function stop(message, serverQueue) {
    if(!message.member.voice.channel) {
        return message.channel.send("You need to be in a voice channel first!");
    }

    if(!serverQueue) {
        return message.channel.send("The queue is empty!");
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}