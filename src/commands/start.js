const ytdl = require("ytdl-core-discord");
const { google } = require('googleapis');
const SpotifyWebApi = require("spotify-web-api-node");
const play = require("./play");

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

let tokenDate = Date.now() - 3600000;
let spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

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
            songList = await getYouTubePlaylistTracks(args[1].split('/playlist?list=')[1], message);
        } else {
            const song = await searchYouTubeTrack(args[1], message);
            songList.push(song);
        }
    } else if(args[1].includes('open.spotify.com/')) {
        if(args[1].includes('/playlist/')) {
            songList = await getSpotifyPlaylistTracks(args[1].split('playlist/')[1].split('?si')[0], message);
        } else if (args[1].includes('/album/')) {
            songList = await getSpotifyAlbumTracks(args[1].split('album/')[1].split('?si')[0], message);
        } else if(args[1].includes('/artist/')) {
            songList = await getSpotifyArtistTracks(args[1].split('artist/')[1].split('?si')[0], message);
        } else if (args[1].includes('/track/')) {
            let name = await getSpotifyTrack(args[1].split('track/')[1].split('?si')[0], message);
            const song = await searchYouTubeTrack(name, message);
            songList.push(song);
        }
    } else {
        const song = await searchYouTubeTrack(message.content.replace(message.content.split(" ")[0], ''), message);
        songList.push(song);
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

async function getAllYouTubePlaylistTracks(id) {
    let playlist = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: id,
        maxResults: 50
    });
    let list = [...playlist.data.items];
    while(playlist.data.nextPageToken !== undefined) {
        playlist = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: id,
            maxResults: 50,
            pageToken: playlist.data.nextPageToken
        });

        list = [...list, ...playlist.data.items];
    }
    return list;
}

async function getYouTubePlaylistTracks(id, message) {
    let songList = [];
    try {
        const list = await getAllYouTubePlaylistTracks(id, undefined, []);
        list.forEach(track => {
            songList.push({
                title: track.snippet.title,
                url: track.snippet.resourceId.videoId
            })
        })
        return songList;
    } catch(error) {
        message.channel.send("Something went wrong.");
        return [];
    }
}

async function searchYouTubeTrack(searchQuery, message) {
    try {
        const searchResult = await youtube.search.list({
            part: 'snippet',
            q: searchQuery,
            maxResults: 1,
            type: 'video'
        });
        
        if(searchResult.data.items[0] === undefined) {
            message.channel.send(`No results found for \"${searchQuery}\"`);
            return {};
        } else {
            return {
                title: searchResult.data.items[0].snippet.title,
                url: 'https://youtube.com/watch?v=' + searchResult.data.items[0].id.videoId,
            }
        }
    } catch(error) {
        message.channel.send("Something went wrong.");
        return {};
    }
}

async function verifySpotifyAuth(message) {
    if((Date.now() - tokenDate) > 3600000) {
        try {
            await spotifyApi.clientCredentialsGrant().then(
                function(data) {
                    tokenDate = Date.now();
                    spotifyApi.setAccessToken(data.body['access_token']);
                },
                function(err) { console.log('Something went wrong.', err) }
            );
        } catch (error) {
            message.channel.send('Something went wrong.');
            return;
        }
    }
}

async function getAllPlaylistTracks(playlist) {
    let tracks = [];
    const { body } = await spotifyApi.getPlaylistTracks(playlist);
    tracks = body.items;
    if (body.total > 100) {
        for (let i = 1; i < Math.ceil(body.total / 100); i++) {
            const add = await spotifyApi.getPlaylistTracks(playlist, { offset: 100 * i });
            tracks = [...tracks, ...add.body.items];
        }
    }
    return tracks;
}

async function getSpotifyPlaylistTracks(id, message) {
    await verifySpotifyAuth(message);
    let songList = [];
    let tracks = [];
    try {
        tracks = await getAllPlaylistTracks(id);
    } catch(error) {
        message.channel.send('Something went wrong.');
        return [];
    }
    tracks.forEach(song => {
        songList.push({
            title: song.track.artists[0].name + " - " + song.track.name,
            url: undefined
        });
    });
    return songList;
}

async function getSpotifyAlbumTracks(id, message) {
    await verifySpotifyAuth(message);
    let songList = [];
    let tracks = [];
    try {
        const { body } = await spotifyApi.getAlbumTracks(id);
        tracks = body.items;
    } catch(error) {
        message.channel.send('Something went wrong.');
        return [];
    }
    tracks.forEach(song => {
        songList.push({
            title: song.artists[0].name + " - " + song.name,
            url: undefined
        });
    });
    return songList;
}

async function getSpotifyArtistTracks(id, message) {
    await verifySpotifyAuth(message);
    let songList = [];
    let tracks = [];
    try {
        const { body } = await spotifyApi.getArtistTopTracks(id, 'US');
        tracks = body.tracks;
    } catch(error) {
        message.channel.send('Something went wrong.');
        return [];
    }
    tracks.forEach(song => {
        songList.push({
            title: song.artists[0].name + " - " + song.name,
            url: undefined
        });
    });
    return songList;
}

async function getSpotifyTrack(id, message) {
    await verifySpotifyAuth(message);
    let track = '';
    try {
        const { body } = await spotifyApi.getTrack(id);
        track = body.name;
    } catch(error) {
        message.channel.send('Something went wrong.');
        return [];
    }
    return track;
}