const { owner_id, mod_ids, dnsStr, guild_id, music_id } = require('../../assets/config.json');
module.exports = {
  name: 'leave',
  description: 'Leaves the music channel',
  aliases: ['l'],
  args: false,
  usage: '[]',
  permission: true,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => {
    msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    const musicChan = client.channels.get(music_id);
    try {
      musicChan.leave();
    } catch(err) {
      Sentry.captureException(err)
    }
  },
};