const Discord = require('discord.js');
const yt = require('ytdl-core');
const getInfoAsync = require('util').promisify(yt.getInfo);
const url = require('url');
const { music_id } = require('../../assets/config.json');
module.exports = {
  name: 'addsong',
  description: 'add a song to the queue',
  aliases: ['as'],
  args: true,
  usage: '[YOUTUBE_URL]',
  permission: false,
  guildOnly: true,
  queueObj: {
    songUrls: [],
    userNames: []
  },
  execute (msg, args, client, Sentry) { 
    msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    const songUrl = args[0];
    const userName = msg.author.username;
    this.queueObj.songUrls.push(songUrl);
    this.queueObj.userNames.push(userName);

    let that = this;

    const YTRegExp = new RegExp(/(?:v.|d\/|e\/)([\w-_]{11})/);
    const songID = url.parse(`${songUrl}`).path.split('/')[1];
    const id = songID.match(YTRegExp);

    async function getSongInfo(asyncId, userName, that) {
      const info = await getInfoAsync(`https://youtu.be/${asyncId[1]}`);
      const songName = info.title;
      const thumbnailUrl = info.player_response.videoDetails.thumbnail.thumbnails[0].url;
      const authorName = info.author.name;
      const authorAvatar = info.author.avatar;
      const authorChannelUrl = info.author.channel_url;
      const queueNumber = that.queueObj.songUrls.length;
      const measuredTime = new Date(null);
      measuredTime.setSeconds(info.length_seconds);
      const songLength = measuredTime.toISOString().substr(14, 5);
      await createEmbed(userName, songName, thumbnailUrl, authorName, authorAvatar, authorChannelUrl, songLength, queueNumber);
    }

    getSongInfo(id, userName, that);

    async function createEmbed(userName, songName, thumbnailUrl, authorName, authorAvatar, authorChannelUrl, songLength, queueNumber) {
      try {
        const embed = new Discord.RichEmbed()
          .setColor('#5DADEC')
          .setAuthor(authorName, authorAvatar, authorChannelUrl)
          .setTitle(`:musical_note: **Song Added** :musical_note: `)
          .setDescription(`**Title:** ${songName}\n **Added By:** ${userName}`)
          .setThumbnail(thumbnailUrl)
          .addField('Length', songLength, true)
          .addField('Queue', `Your song is up in ${queueNumber - 1} song(s)`, true);
        return msg.channel.send(embed)
      } catch(err) {
        Sentry.captureException(err)
      }
    }
  },
}