const Discord = require("discord.js");
const { prefix } = require("./config.json");
const ytdl = require("ytdl-core-discord");
const ytsearch = require("yt-search");
const ytps = require("youtube-playlist-summary");

const client = new Discord.Client();
const queue = new Map();
const config = {
    GOOGLE_API_KEY: process.env.YOUTUBE_API_KEY,
    PLAYLIST_ITEM_KEY: ['title', 'videoUrl']
}
const ps = new ytps(config);

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log('Connected!');
    client.user.setActivity("-p <song link or name>", { type: "LISTENING"})
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    if(message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {
        start(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}skip`) || message.content.startsWith(`${prefix}sk`)) {
        skip(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}stop`) || message.content.startsWith(`${prefix}st`)) {
        stop(message, serverQueue);
        return;
    } else if(message.content.startsWith(`${prefix}help`) || message.content.startsWith(`${prefix}h`)) {
        message.channel.send("Commands:\n" +
            "\`-p (or -play) <song name/link or playlist link>\` play/add to queue a song/playlist\n" +
            "\`-sk (or -skip)\` skip to next song\n" +
            "\`-st (or -stop)\` stop playback\n" +
            "\`-v (or -volume) <value between 0 and 100>\` change volume");
        return;
    } else if(message.content.startsWith(`${prefix}volume`) || message.content.startsWith(`${prefix}v`)) {
        volume(message, serverQueue);
        return;
    } else {
        message.channel.send("Invalid command! Try again or type \`-h\` to view the available commands");
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

        if(args.length == 1) {
            return message.channel.send("You need to send a link or name of a song in order to play.");
        }

        let url = '';
        let songList = [];
        if((args[1].includes('youtube.com/') || args[1].includes('youtu.be/')) ) {
            if(args[1].includes('/playlist?list=')) {
                try {
                    await ps.getPlaylistItems(args[1].split('/playlist?list=')[1])
                        .then((result) => {
                            result.items.forEach(video => {
                                songList.push({
                                    title: video.title,
                                    url: video.videoUrl
                                });
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } catch(error) {
                    console.log(error);
                    return message.channel.send("Something went wrong.");
                }     
            } else {
                url = args[1];
            }
        } else {
            const searchQuery = message.content.replace(message.content.split(" ")[0], '');
            const searchResult = await ytsearch(searchQuery);
            if(searchResult.videos.length == 0) {
                return message.channel.send(`No results found for \"${searchQuery}\"`);
            } else {
                url = searchResult.videos[0].url;
            }
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

    async function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        if(!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        try {
            const dispatcher = serverQueue.connection
            .play(await ytdl(song.url), { type: 'opus' })
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => {
                console.error(error);
                serverQueue.textChannel.send("Something went wrong (dispatcher error).")
            });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
        serverQueue.textChannel.send(`Now playing: ${song.title}`);
        } catch(error) {
            serverQueue.textChannel.send(`Something went wrong. ${song.title} may be unavailable.`);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        }
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

    function volume(message, serverQueue) {
        let value = "";
        if(message.content.split(" ").length > 1) {
            value = message.content.split(" ")[1];
        } else {
            return message.channel.send("Usage: \`-v <value between 0 and 100>\`");
        }

        if((isNaN(value)) || (value < 0) || (value > 100)) {
            return message.channel.send("The value must be a number between 0 and 100!");
        }

        if(!message.member.voice.channel) {
            return message.channel.send("You need to be in a voice channel first!");
        }

        if(!serverQueue) {
            return message.channel.send("The queue is empty!");
        }

        serverQueue.volume = value;
        serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    }
});