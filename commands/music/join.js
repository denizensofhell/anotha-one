const { owner_id, mod_ids, dnsStr, guild_id, music_id } = require('../../assets/config.json');
module.exports = {
  name: 'join',
  description: 'Joins the music channel',
  aliases: ['j'],
  args: false,
  usage: '[]',
  permission: false,
  roles: [],
  guildOnly: true,
  execute: async (msg, args) => {
    console.log(msg);
  },
};