const { guild_id, music_id } = require('../../assets/config.json');
const Discord = require('discord.js');
const yt = require('ytdl-core');
const getInfoAsync = require('util').promisify(yt.getInfo);
const url = require('url');
const addSong = require('./addSong');
module.exports = {
  name: 'play',
  description: 'Plays the muse',
  aliases: ['p'],
  args: false,
  usage: '[]',
  permission: false,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => { 
    await msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    const musicChan = client.channels.get(music_id);
    const server = client.guilds.get(guild_id);
    const joined = server.voiceConnection;
    const songUrls = addSong.queueObj.songUrls;
    const userNames = addSong.queueObj.userNames;

    musicChan.join().then(connection => {play(connection);}).catch(err => Sentry.captureException(err));

    function play(connection) {
      if (songUrls.length === 0) return msg.channel.send(`The queue is empty, ${msg.author}\n Add some songs to the queue with \`${prefix}addsong [Youtube URL].\``);
      getSongInfo(songUrls[0], userNames[0]);
      try {
        server.dispatcher = connection.playStream(
          yt(songUrls[0], { filter: 'audioonly' }).on('end', () => {
            songUrls.shift();
            userNames.shift();
            if (songUrls[0]) {
              play(connection);
            } else {
              msg.channel.send('Queue is empty. Call me back when you got more music to play.');
              voiceChannel.leave();
              return;
            }
          }),
        ); 
      } catch (err) {
        Sentry.captureException(err)
      }
    }

    async function getSongInfo(songUrl, userName) {
      const YTRegExp = new RegExp(/(?:v.|d\/|e\/)([\w-_]{11})/);
      const songID = url.parse(`${songUrl}`).path.split('/')[1];
      const id = songID.match(YTRegExp);
      const info = await getInfoAsync(`https://youtu.be/${id[1]}`);
      const songName = info.title;
      const thumbnailUrl = info.player_response.videoDetails.thumbnail.thumbnails[0].url;
      const authorName = info.author.name;
      const authorAvatar = info.author.avatar;
      const authorChannelUrl = info.author.channel_url;
      const measuredTime = new Date(null);
      measuredTime.setSeconds(info.length_seconds);
      const songLength = measuredTime.toISOString().substr(14, 5);
      await createEmbed(userName, songName, thumbnailUrl, authorName, authorAvatar, authorChannelUrl, songLength);
    }

    async function createEmbed(userName, songName, thumbnailUrl, authorName, authorAvatar, authorChannelUrl, songLength) {
      try {
        const embed = new Discord.RichEmbed()
          .setColor('FF00F7')
          .setAuthor(authorName, authorAvatar, authorChannelUrl)
          .setTitle(`:musical_note: **Now Playing** :musical_note: `)
          .setDescription(`**Title:** ${songName}\n **Added By:** ${userName}`)
          .setThumbnail(thumbnailUrl)
          .addField('Length', songLength, true);
        return msg.channel.send(embed)
      } catch(err) {
        console.log(err);
        Sentry.captureException(err)
      }
    }
  }
}
