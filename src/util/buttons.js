const discordButtons = require('discord-buttons');

let stopButton = new discordButtons.MessageButton()
    .setLabel('Stop')
    .setStyle('green')
    .setEmoji('⏹')
    .setID('stop-button');
    
let skipButton = new discordButtons.MessageButton()
    .setLabel('Skip')
    .setStyle('green')
    .setEmoji('⏭')
    .setID('skip-button');

let queueButton = new discordButtons.MessageButton()
    .setLabel('Queue')
    .setStyle('green')
    .setEmoji('📑')
    .setID('queue-button');

let lyricsButton = new discordButtons.MessageButton()
    .setLabel('Lyrics')
    .setStyle('green')
    .setEmoji('📝')
    .setID('lyrics-button');

module.exports = controlButtons = new discordButtons.MessageActionRow()
    .addComponent(stopButton)
    .addComponent(skipButton)
    .addComponent(queueButton)
    .addComponent(lyricsButton);