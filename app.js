const Discord = require('discord.js');
const { TOKEN, owner_id, mod_ids, dnsStr, guild_id, music_id, prefix } = require('./assets/config.json');
const yt = require('ytdl-core');
const fs = require('fs');
const junk = require('junk');

const Sentry = require('@sentry/node');
Sentry.init({ dsn: dnsStr });

const client = new Discord.Client();
client.commands = new Discord.Collection();

// FS BS
try {
  fs.readdir('./commands', (err, data) => {
    if (err) {
      Sentry.captureException(err);
    }
    const commandFolders = data.filter(junk.not);
    for (const files of commandFolders) {
      const file = fs.readdirSync(`./commands/${files}`);
      for (const single of file) {
        const command = require(`./commands/${files}/${single}`);
        client.commands.set(command.name, command);
      }
    }
  });
} catch(err) {
  Sentry.captureException(err);
}

// READY
try {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
} catch(err) {
  Sentry.captureException(err);
}

try {
  client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        cmd => cmd.aliases && cmd.aliases.includes(commandName),
      );
    //Check for command
    if (!command) return;
    //Check if guild
    if (command.guildOnly && msg.channel.type !== 'text') {
      return msg.author.send('Global command only');
    }
    //Check for args
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${msg.author}!`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${prefix}${command.name} ${
          command.usage
        }\``;
      }
      return msg.author.send(reply);
    }
    //Made it here now execute the command
    try {
      command.execute(msg, args, connection);
    }
    catch (err) {
      Sentry.captureException(err);
      msg.author.send('Something went wrong. Try again later');
    }
  });
} catch(err) {
  Sentry.captureException(err);
}

client.login(TOKEN);