const play = require("./play");
const {
    searchYouTubeTrack,
    getYouTubePlaylistTracks
} = require("../services/youtube");
const {
    getSpotifyPlaylistTracks,
    getSpotifyAlbumTracks,
    getSpotifyArtistTracks,
    getSpotifyTrack
} = require("../services/spotify");

module.exports = async function start(message, serverQueue, queue) {
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) {
        return message.channel.send("You need to be in a voice channel first!");
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("I have no permissions to play music. Add me again with my correct URL.");
    }

    if(args.length == 1) {
        return message.channel.send("You need to send a link or name of a song in order to play.");
    }

    let songList = [];
    if((args[1].includes('youtube.com/') || args[1].includes('youtu.be/')) ) {
        if(args[1].includes('/playlist?list=')) {
            try {
                songList = await getYouTubePlaylistTracks(args[1].split('/playlist?list=')[1]);
            } catch (error) {
                message.channel.send("Something went wrong.");
            }
        } else {
            let url = args[1];
            if(args[1].includes('&list=')) {
                url = args[1].split('&list=')[0];
            }
            try {
                const song = await searchYouTubeTrack(url);
                songList.push(song);
            } catch (error) {
                if(error.message === "No results found") {
                    message.channel.send(`No results found for \"${args[1]}\".`);
                } else {
                    message.channel.send("Something went wrong.");
                }
            }
        }
    } else if(args[1].includes('open.spotify.com/')) {
        if(args[1].includes('/playlist/')) {
            try {
                songList = await getSpotifyPlaylistTracks(args[1].split('playlist/')[1].split('?si')[0], message);
            } catch (error) {
                message.channel.send("Something went wrong.");
            }
        } else if (args[1].includes('/album/')) {
            try {
                songList = await getSpotifyAlbumTracks(args[1].split('album/')[1].split('?si')[0], message);
            } catch (error) {
                message.channel.send("Something went wrong.");
            }
        } else if(args[1].includes('/artist/')) {
            try {
                songList = await getSpotifyArtistTracks(args[1].split('artist/')[1].split('?si')[0], message);
            } catch (error) {
                message.channel.send("Something went wrong.");
            }
        } else if (args[1].includes('/track/')) {
            try {
                let name = await getSpotifyTrack(args[1].split('track/')[1].split('?si')[0], message);
                const song = await searchYouTubeTrack(name, message);
                songList.push(song);
            } catch (error) {
                message.channel.send("Something went wrong.");
            }
        }
    } else {
        const query = message.content.replace(message.content.split(" ")[0], '');
        try {
            const song = await searchYouTubeTrack(query);
            songList.push(song);
        } catch (error) {
            if(error.message === "No results found") {
                message.channel.send(`No results found for \"${query}\"`);
            } else {
                message.channel.send("Something went wrong.");
            }
        }
    }

    if(songList.length == 0) {
        return;
    }
    
    if(!serverQueue) {
        const queueServerInstance = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 100,
            playing: true,
        };
        
        queue.set(message.guild.id, queueServerInstance);
        if(songList.length > 1){
            message.channel.send(`Enqueued ${songList.length} songs!`);
        }
        queueServerInstance.songs = queueServerInstance.songs.concat(songList);

        try {
            var connection = await voiceChannel.join();
            queueServerInstance.connection = connection;
            play(message.guild, queueServerInstance.songs[0], queue);
        } catch(err) {
            console.error(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs = serverQueue.songs.concat(songList);
        if(songList.length == 1) {
            return message.channel.send(`${songList[0].title} added to queue!`);
        } else if(songList.length > 1) {
            return message.channel.send(`Enqueued ${songList.length} songs!`);
        } 
    }
}