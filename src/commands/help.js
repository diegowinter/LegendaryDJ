module.exports = function help(message) {
    message.channel.send("Commands:\n" +
        "\`-p (or -play) <song name/link or playlist link>\` play/add to queue a song/playlist\n" +
        "\`-sk (or -skip)\` skip to next song\n" +
        "\`-st (or -stop)\` stop playback\n" +
        "\`-v (or -volume) <value between 0 and 100>\` change volume"
    );
}