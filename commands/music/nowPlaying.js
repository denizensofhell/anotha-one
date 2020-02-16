const { guild_id, music_id } = require('../../assets/config.json');
const Discord = require('discord.js');
const yt = require('ytdl-core');
const getInfoAsync = require('util').promisify(yt.getInfo);
const url = require('url');
const addSong = require('./addSong');
module.exports = {
  name: 'nowplaying',
  description: 'Lets you know what it playing and what is comming up',
  aliases: ['np'],
  args: false,
  usage: '[]',
  permission: false,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => {  
    await msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    const server = client.guilds.get(guild_id);
    const joined = server.voiceConnection;
    const songUrls = addSong.queueObj.songUrls;
    const userNames = addSong.queueObj.userNames;

    getSongInfo(songUrls[0], userNames[0]);

    async function getSongInfo(songUrl, userName) {
      const YTRegExp = new RegExp(/(?:v.|d\/|e\/)([\w-_]{11})/);
      const songID = url.parse(`${songUrl}`).path.split('/')[1];
      const id = songID.match(YTRegExp);
      const info = await getInfoAsync(`https://youtu.be/${id[1]}`);
      console.log(info);
      const songName = info.title;
      const thumbnailUrl = info.player_response.videoDetails.thumbnail.thumbnails[0].url;
      const authorName = info.author.name;
      const authorAvatar = info.author.avatar;
      const authorChannelUrl = info.author.channel_url;
      const measuredTime = new Date(null);
      measuredTime.setSeconds(info.length_seconds);
      const songLength = measuredTime.toISOString().substr(14, 5);
      await createEmbed(userName, songName, thumbnailUrl, authorName, authorAvatar, authorChannelUrl);
    }

    async function createEmbed(userName, songName, thumbnailUrl, authorName, authorAvatar, authorChannelUrl) {
      try {
        const embed = new Discord.RichEmbed()
          .setColor('00FFCD')
          .setAuthor(authorName, authorAvatar, authorChannelUrl)
          .setTitle(`:musical_note: **Playing Now** :musical_note: `)
          .setDescription(`**Title:** ${songName}\n **Added By:** ${userName}`)
          .setThumbnail(thumbnailUrl);
        return msg.channel.send(embed)
      } catch(err) {
        console.log(err);
        Sentry.captureException(err)
      }
    }
  }
}
