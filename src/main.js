require('dotenv').config()
const Discord = require("discord.js");
const { prefix } = require("./config/config.json");
const start = require("./commands/start");
const skip = require("./commands/skip");
const stop = require("./commands/stop");
const volume = require("./commands/volume");
const queue = require("./commands/queue");
const help = require("./commands/help");
const lyrics = require("./commands/lyrics");
const nowPlaying = require("./commands/nowPlaying");
const remove = require("./commands/remove");
const seek = require("./commands/seek");

const client = new Discord.Client();
const sQueue = new Map();
client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
  console.log('Connected!');
  client.user.setActivity("-help", { type: "LISTENING" });
});

client.on('message', async message => {
  if(message.author.bot) return;
  if(!message.content.startsWith(prefix)) return;

  const serverQueue = sQueue.get(message.guild.id);

  switch (message.content.toLowerCase().split(' ')[0]) {
    case `${prefix}p`:
    case `${prefix}play`:
      start(message, serverQueue, sQueue);
      return;
    case `${prefix}sk`:
    case `${prefix}skip`:
      skip(message, serverQueue);
      return;
    case `${prefix}st`:
    case `${prefix}stop`:
      stop(message, serverQueue, sQueue);
      return;
    case `${prefix}h`:
    case `${prefix}help`:
      help(message);
      return;
    case `${prefix}v`:
    case `${prefix}volume`:
      volume(message, serverQueue);
      return;
    case `${prefix}q`:
    case `${prefix}queue`:
      queue(message, serverQueue);
      return;
    case `${prefix}l`:
    case `${prefix}lyrics`:
      lyrics(message, serverQueue);
      return;
    case `${prefix}np`:
    case `${prefix}nowplaying`:
      nowPlaying(message, serverQueue);
      return;
    case `${prefix}rm`:
    case `${prefix}remove`:
      remove(message, serverQueue);
      return;
    case `${prefix}se`:
    case `${prefix}seek`:
      seek(message, serverQueue, sQueue);
      return;
    default:
      message.channel.send("Invalid command! Try again or type \`-help\` to view the available commands");
      return;
  }
});