const { owner_id, mod_ids, dnsStr, guild_id, music_id } = require('../../assets/config.json');
module.exports = {
  name: 'join',
  description: 'Joins the music channel',
  aliases: ['j'],
  args: false,
  usage: '[]',
  permission: false,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => {
    msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    const musicChan = client.channels.get(music_id);
    try {
      musicChan.join();
    } catch(err) {
      Sentry.captureException(err)
    }
  },
};