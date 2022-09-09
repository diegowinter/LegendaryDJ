const Discord = require('discord.js')
const { DisTube } = require('distube')
require('dotenv').config()

const client = new Discord.Client({
  intents: [
    'Guilds',
    'GuildMessages',
    'GuildVoiceStates',
    'MessageContent'
  ]
})


client.DisTube = new DisTube(client, {
  leaveOnStop: false,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  // customFilters: {
  //   "bassboost": "bass=g=20,dynaudnorm=f=200",
  //   "8d": "apulsator=hz=0.08",
  //   "vaporwave": "aresample=48000,asetrate=48000*0.8",
  //   "nightcore": "aresample=48000,asetrate=48000*1.25",
  //   "phaser": "aphaser=in_gain=0.4",
  //   "subboost": "asubboost",
  //   "bassboost": "bass=g=20,dynaudnorm=f=200",
  // }
})

client.on('ready', client => {
  console.log('Legendary DJ v2.0.0\n'
    + 'Connected. Ready to receive commands from Discord servers.')
})

client.on('messageCreate', message => {
  const prefix = "-"

  if (message.author.bot || !message.guild) return

  const args = message.content.slice(prefix.length).trim().split(/ +/g)

  if (!message.content.toLowerCase().startsWith(prefix)) return


  if (args.shift().toLowerCase() === 'play') {
    client.DisTube.play(message.member.voice.channel, args.join(' '), {
      member: message.member,
      textChannel: message.channel,
      message
    })
  }
})

client.DisTube.on('playSong', (queue, song) => {
  queue.textChannel.send('Now playing ' + song.name)
})

client.login(process.env.DISCORD_TOKEN)