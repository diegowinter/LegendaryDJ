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
const controlButtons = require('./util/buttons');

const client = new Discord.Client();
const sQueue = new Map();
client.login(process.env.DISCORD_TOKEN);

require('discord-buttons')(client);

client.on('ready', () => {
  console.log('Connected!');
  client.user.setActivity("-help", { type: "LISTENING" });
});

client.on('message', async message => {
  if(message.author.bot) return;
  if(!message.content.startsWith(prefix)) return;

  const commandContent = message.content.toLowerCase().split(' ')[0];

  let response;

  if (commandContent == `${prefix}h` || commandContent == `${prefix}help`) {
    response = help(message);
    if (response) message.channel.send(response);
    return;
  }

  if (!message.member.voice.channel) {
    return await message.channel.send('You must to be in a voice channel.')
  }

  const serverQueue = sQueue.get(message.guild.id);

  switch (message.content.toLowerCase().split(' ')[0]) {
    case `${prefix}p`:
    case `${prefix}play`:
      start(message, serverQueue, sQueue, controlButtons);
      return;
    case `${prefix}sk`:
    case `${prefix}skip`:
      response = skip(serverQueue, false, message);
      if (response) message.channel.send(response);
      return;
    case `${prefix}st`:
    case `${prefix}stop`:
      response = stop(serverQueue, sQueue);
      if (response) message.channel.send(response);
      return;
    case `${prefix}v`:
    case `${prefix}volume`:
      response = volume(message, serverQueue);
      if (response) message.channel.send(response);
      return;
    case `${prefix}q`:
    case `${prefix}queue`:
      response = await queue(serverQueue, false, message);
      if (response) message.channel.send(response);
      return;
    case `${prefix}l`:
    case `${prefix}lyrics`:
      lyrics(message, serverQueue);
      return;
    case `${prefix}np`:
    case `${prefix}nowplaying`:
      response = await nowPlaying(message, serverQueue);
      if (response) message.channel.send(response);
      return;
    case `${prefix}rm`:
    case `${prefix}remove`:
      response = remove(message, serverQueue);
      if (response) message.channel.send(response);
      return;
    case `${prefix}se`:
    case `${prefix}seek`:
      response = seek(message, serverQueue, sQueue);
      if (response) message.channel.send(response);
      return;
    default:
      message.channel.send("Invalid command! Try again or type \`-help\` to view the available commands");
      return;
  }
});

client.on('clickButton', async button => {
  const serverQueue = sQueue.get(button.guild.id);

  let response;
  switch(button.id) {
    case 'stop-button':
      response = stop(serverQueue, sQueue);
      if (response) await button.reply.send(response);
      else await button.defer();
      return;
    case 'skip-button':
      response = skip(serverQueue, true);
      if (response) await button.reply.send(response, true);
      else await button.defer();
      return;
    case 'queue-button':
      response = await queue(serverQueue, true);
      if (response instanceof Discord.MessageEmbed) {
        await button.reply.send({ embed: response, ephemeral: true });
      } else {
        button.reply.send(response, true)
      }
      return;
    case 'lyrics-button':
      try {
        lyrics(serverQueue.message, serverQueue);
      } catch (e) {}
      await button.defer();
      return;
  }
});