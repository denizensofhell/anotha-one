module.exports = {
  name: 'test',
  description: 'For testing',
  aliases: ['t'],
  args: false,
  usage: '[]',
  permission: true,
  guildOnly: true,
  execute: async (msg, args, client, Sentry) => {
    msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
    console.log(client);
  },
};