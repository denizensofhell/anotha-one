const { guild_id, music_id } = require('../../assets/config.json');
module.exports = {
  name: 'pause',
  description: 'Joins the music channel',
  aliases: ['pa'],
  args: false,
  usage: '[]',
  permission: false,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => { 
    msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    try {
      if(msg.guild.voiceConnection.dispatcher.paused) {
        msg.guild.voiceConnection.dispatcher.resume();
      } else {
        msg.guild.voiceConnection.dispatcher.pause();
      }
    } catch(err) {
      Sentry.captureException(err);
    }
  }
}