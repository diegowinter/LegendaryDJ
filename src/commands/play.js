const ytdl = require("ytdl-core-discord");
const ytsr = require("ytsr");

module.exports = async function play(guild, song, queue) {
    const serverQueue = queue.get(guild.id);
    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    
    let loadingMessage = undefined;
    if(song.url === undefined) {
        loadingMessage = await serverQueue.textChannel.send("Loading song...");
        const searchResult = await ytsr(song.title, { limit: 1 });
        if(searchResult.items.length > 0) {
            song.url = searchResult.items[0].url;
        }
    }

    try {
        const dispatcher = serverQueue.connection
        .play(await ytdl(song.url), { type: 'opus' })
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0], queue);
        })
        .on("error", error => {
            console.error(error);
            serverQueue.textChannel.send("Something went wrong (dispatcher error).")
        });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
        if(loadingMessage !== undefined) {
            loadingMessage.edit(`Now playing: ${song.title}`);
        } else {
            serverQueue.textChannel.send(`Now playing: ${song.title}`);
        }
    } catch(error) {
        serverQueue.textChannel.send(`Something went wrong. ${song.title} may be unavailable.`);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0], queue);
    }
}