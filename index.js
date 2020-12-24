const Discord = require("discord.js");
const { prefix } = require("./config.json");
const ytdl = require("ytdl-core");
const ytsearch = require("yt-search");

const client = new Discord.Client();
const queue = new Map();
client.login(process.env.TOKEN);

client.once('ready', () => {
    console.log('Connected to server!');
});


client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if(message.content.startsWith(`${prefix}play`)) {
        start(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else {
        message.channel.send("Invalid command! Try again or type \`ldj-help\` to view the available commands");
    }

    async function start(message, serverQueue) {
        const args = message.content.split(" ");

        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            return message.channel.send("You need to be in a voice channel first!");
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send("I have no permissions to play music. Add me again with my correct URL.");
        }

        let url = '';
        let songList = [];
        if((args[1].includes('youtube.com/') || args[1].includes('youtu.be/')) ) {
            if(args[1].includes('/playlist?list=')) {
                const list = await ytsearch({listId: args[1].split('/playlist?list=')[1]});
                list.videos.forEach( function (video) {
                    songList.push({
                        title: video.title,
                        url: `https://www.youtube.com/watch?v=${video.videoId}`
                    })
                });
            } else {
                url = args[1];
            }
        } else {
            const searchQuery = message.content.replace(message.content.split(" ")[0], '');
            const searchResult = await ytsearch(searchQuery);
            url = searchResult.videos[1].url;
        }

        if(url !== '') {
            const songInfo = await ytdl.getInfo(url);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };
            songList.push(song);
        }
        
        if(!serverQueue) {
            const queueServerInstance = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
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
                play(message.guild, queueServerInstance.songs[0]);
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

    function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        if(!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume  / 5);
        serverQueue.textChannel.send(`Now playing: ${song.title}`);
    }

    function skip(message, serverQueue) {
        if(!message.member.voice.channel) {
            return message.channel.send("You need to be in a voice channel first!");
        }

        if(!serverQueue) {
            return message.channel.send("The queue is empty!");
        }
        
        serverQueue.connection.dispatcher.end();
    }

    function stop(message, serverQueue) {
        if(!message.member.voice.channel) {
            return message.channel.send("You need to be in a voice channel first!");
        }

        if(!serverQueue) {
            return message.channel.send("The queue is empty!");
        }

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
});