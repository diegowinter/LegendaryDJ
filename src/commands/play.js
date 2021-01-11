const ytdl = require("ytdl-core-discord");
const { searchYouTubeTrack } = require("../services/youtube");

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
        try {
            const searchResult = await searchYouTubeTrack(song.title);
            song.url = searchResult.url;
        } catch (error) {
            console.log('Error (searching Spotify song)', error);
            serverQueue.textChannel.send(`Something went wrong. ${song.title} may be unavailable.`);
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
                console.error('Error (dispatcher error)', error);
                serverQueue.textChannel.send("Something went wrong (dispatcher error).")
            });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
        if(loadingMessage !== undefined) {
            loadingMessage.edit(`Now playing: ${song.title}`);
        } else {
            serverQueue.textChannel.send(`Now playing: ${song.title}`);
        }
    } catch(error) {
        console.log('erro (2)', error);
        serverQueue.textChannel.send(`Something went wrong. ${song.title} may be unavailable.`);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0], queue);
    }
}