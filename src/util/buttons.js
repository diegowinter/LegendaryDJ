const discordButtons = require('discord-buttons');

let previousButton = new discordButtons.MessageButton()
    // .setLabel('Previous')
    .setStyle('grey')
    .setEmoji('⏮️')
    .setID('previous-button');

let pauseResumeButton = new discordButtons.MessageButton()
    // .setLabel('Pause/resume')
    .setStyle('grey')
    .setEmoji('⏯️')
    .setID('pause-resume-button');

let stopButton = new discordButtons.MessageButton()
    // .setLabel('Stop')
    .setStyle('grey')
    .setEmoji('⏹')
    .setID('stop-button');

let skipButton = new discordButtons.MessageButton()
    // .setLabel('Next')
    .setStyle('grey')
    .setEmoji('⏭')
    .setID('skip-button');

let queueButton = new discordButtons.MessageButton()
    .setLabel('Show Queue')
    .setStyle('grey')
    // .setEmoji('📑')
    .setID('queue-button');

let lyricsButton = new discordButtons.MessageButton()
    .setLabel('Show Lyrics')
    .setStyle('grey')
    // .setEmoji('📝')
    .setID('lyrics-button');

module.exports = controlButtons = new discordButtons.MessageActionRow()
    .addComponent(previousButton)
    .addComponent(pauseResumeButton)
    .addComponent(skipButton)
    .addComponent(stopButton)
    // .addComponent(queueButton)
    .addComponent(lyricsButton);