const discordButtons = require('discord-buttons');

let pauseResumeButton = new discordButtons.MessageButton()
    .setLabel('Pause/resume')
    .setStyle('green')
    .setEmoji('⏯️')
    .setID('pause-resume-button');
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
    .addComponent(pauseResumeButton)
    .addComponent(skipButton)
    .addComponent(stopButton)
    .addComponent(queueButton)
    .addComponent(lyricsButton);