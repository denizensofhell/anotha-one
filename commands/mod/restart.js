const { music_id } = require('../../assets/config.json');
module.exports = {
  name: 'restart',
  description: 'Restarts the bot',
  aliases: ['r'],
  args: false,
  usage: '[]',
  permission: true,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => {
    msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    const musicChan = client.channels.get(music_id);
    try {
      await musicChan.leave();
      musicChan.join();
    } catch(err) {
      Sentry.captureException(err);
    }
  },
};