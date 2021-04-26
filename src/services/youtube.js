const ytfps = require('ytfps');
const ytsr = require('ytsr');
const { durationToMillis } = require('../util/time');

const getYouTubePlaylistTracks = async (id) => {
  const list = await ytfps(id);
  let songList = [];
  list.videos.forEach(item => {
    songList.push({
      title: item.title,
      url: item.url,
      duration: item.milis_length
    });
  });

  return songList;
}

const searchYouTubeTrack = async (searchQuery) => {
  const searchResult = await ytsr(searchQuery, { limit: 1 });

  return {
    title: searchResult.items[0].title,
    url: searchResult.items[0].url,
    duration: durationToMillis(searchResult.items[0].duration)
  }
}

module.exports = {
  getYouTubePlaylistTracks,
  searchYouTubeTrack
}