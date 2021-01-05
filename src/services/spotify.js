const SpotifyWebApi = require("spotify-web-api-node");

let tokenDate = Date.now() - 3600000;
let spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function verifySpotifyAuth() {
    if((Date.now() - tokenDate) > 3600000) {
        await spotifyApi.clientCredentialsGrant().then(
            function(data) {
                tokenDate = Date.now();
                spotifyApi.setAccessToken(data.body['access_token']);
            },
            function(err) { console.log('Something went wrong.', err) }
        );
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

const getSpotifyPlaylistTracks = async (id) => {
    await verifySpotifyAuth();
    let songList = [];
    const tracks = await getAllPlaylistTracks(id);
    tracks.forEach(song => {
        songList.push({
            title: song.track.artists[0].name + " - " + song.track.name,
            url: undefined
        });
    });
    return songList;
}

const getSpotifyAlbumTracks = async (id) => {
    await verifySpotifyAuth();
    let songList = [];
    const { body } = await spotifyApi.getAlbumTracks(id);
    const tracks = body.items;
    tracks.forEach(song => {
        songList.push({
            title: song.artists[0].name + " - " + song.name,
            url: undefined
        });
    });
    return songList;
}

const getSpotifyArtistTracks = async (id) => {
    await verifySpotifyAuth();
    let songList = [];
    const { body } = await spotifyApi.getArtistTopTracks(id, 'US');
    const tracks = body.tracks;
    tracks.forEach(song => {
        songList.push({
            title: song.artists[0].name + " - " + song.name,
            url: undefined
        });
    });
    return songList;
}

const getSpotifyTrack = async (id) => {
    await verifySpotifyAuth();
    const { body } = await spotifyApi.getTrack(id);
    const track = body.name;
    return track;
}

module.exports = {
    getSpotifyPlaylistTracks,
    getSpotifyAlbumTracks,
    getSpotifyArtistTracks,
    getSpotifyTrack
}