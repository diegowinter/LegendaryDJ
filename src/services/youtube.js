const { google } = require('googleapis');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

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

const getYouTubePlaylistTracks = async (id) => {
    let songList = [];
    const list = await getAllYouTubePlaylistTracks(id, undefined, []);
    list.forEach(track => {
        songList.push({
            title: track.snippet.title,
            url: track.snippet.resourceId.videoId
        })
    })
    return songList;
}

const searchYouTubeTrack = async (searchQuery) => {
    const searchResult = await youtube.search.list({
        part: 'snippet',
        q: searchQuery,
        maxResults: 1,
        type: 'video'
    });
    
    if(searchResult.data.items[0] === undefined) {
        throw new Error("No results found");
    } else {
        return {
            title: searchResult.data.items[0].snippet.title,
            url: 'https://youtube.com/watch?v=' + searchResult.data.items[0].id.videoId,
        }
    }
}

module.exports = {
    getYouTubePlaylistTracks,
    searchYouTubeTrack
}