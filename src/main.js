const Discord = require("discord.js");
const { prefix } = require("./config/config.json");
const start = require("./commands/start");
const skip = require("./commands/skip");
const stop = require("./commands/stop");
const volume = require("./commands/volume");
const help = require("./commands/help");

const client = new Discord.Client();
const queue = new Map();
client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    console.log('Connected!');
    client.user.setActivity("-p <song link or name>", { type: "LISTENING" });
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {
        start(message, serverQueue, queue);
        return;
    } else if(message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}sk`)) {
        skip(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}stop`) || message.content.startsWith(`${prefix}st`)) {
        stop(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}help`) || message.content.startsWith(`${prefix}h`)) {
        help(message);
        return;
    } else if(message.content.startsWith(`${prefix}volume`) || message.content.startsWith(`${prefix}v`)) {
        volume(message, serverQueue);
        return;
    } else {
        message.channel.send("Invalid command! Try again or type \`-h\` to view the available commands");
    }
});