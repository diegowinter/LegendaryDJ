module.exports = function skip(message, serverQueue) {
    if(!message.member.voice.channel) {
        return message.channel.send("You need to be in a voice channel first!");
    }

    if(!serverQueue) {
        return message.channel.send("The queue is empty!");
    }
    
    try {
        serverQueue.connection.dispatcher.end();
    } catch(error) {
        console.log("Error (skip). Maybe an user tried to skip a song without waiting the previous skip to complete.");
    }
}