# LegendaryDJ
Discord music bot ready to deploy and use. Deploy your own to use in your server and enjoy all features!

## Testing locally
You can test locally LegendaryDJ before deploying.

### Requirements
* [Node.js](https://nodejs.org/en/)
* [Discord bot token](https://discord.com/developers/applications)
* [Spotify ID and Secret credentials](https://developer.spotify.com/)
* [Genius Lyrics token](https://genius.com/developers)

### Setting up LegendaryDJ
After cloning this repository into your machine, rename the **.env.example** file to **.env**. Edit it, setting the credentials obtained in [Requirements](#requirements).
```
DISCORD_TOKEN=your_discord_token_here
GENIUS_TOKEN=your_genius_token_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

### Installing dependencies
With a clone of this repository, open a terminal and run
```
npm install
```
and wait. Once the installation is done, you must run
```
npm start
```
to start the application. If everything is correct, it will show `Connected!` on console, and your bot must be online now.

## Deploying to Heroku
If you just want to skip or just finished your tests, it's time to deploy LegendaryDJ and keep it online!

### Requirements
* The same requirements for testing
* A fork of this repository (recommended)
* [Heroku account](https://www.heroku.com/)

### Setting up Heroku app
* Create a new application;
* Go to **Settings** tab and in **Config vars** section, click **Reveal Config Vars**;
* Set every variable contained in the **.env.example** file;
* In **Buildpacks** section, add **Node.js** buildpack and the **FFmpeg** one, inserting this URL https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git (FFmpeg is necessary to play music);
* Go to **Deploy** tab and in **Deployment method** section, select GitHub. Connect your account if you haven't already, search for the fork of LegendaryDJ you've created and in **Manual deploy** section, click **Deploy branch**.

If all of the above steps worked, the bot will be online on Discord and ready.