const millisToDuration = millis => {
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  const minutes = Math.floor((millis / 60000) % 60);
  const hours = Math.floor((millis / 60000) / 60);

  if (hours === 0) {
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  } else {
    return hours + ":" + (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }
}

const durationToMillis = t => {
  return t.split(':').length > 2 ? 
    Number(t.split(':')[0]) * 60 * 60 * 1000
      + Number(t.split(':')[1]) * 60 * 1000
      + Number(t.split(':')[2]) * 1000
    :
    Number(t.split(':')[0]) * 60 * 1000
      + Number(t.split(':')[1]) * 1000;
}

module.exports = {
  millisToDuration,
  durationToMillis
}