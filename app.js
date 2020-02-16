const Discord = require('discord.js');
const { TOKEN, owner_id, mod_ids, dnsStr, guild_id, music_id, command_id, prefix } = require('./assets/config.json');
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
    const channelSent = msg.channel.id;
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    if (channelSent != command_id) return wrongChannel(msg, channelSent);

    const args = msg.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        cmd => cmd.aliases && cmd.aliases.includes(commandName),
      );
    //Check for command
    if (!command) {
      msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
      // return msg.author.send(`\`${prefix}${commandName}\` is not a command. FYI \`${prefix}\` is my command flag.`); THIS IS GOOD BUT NOT HERE
      return;
    }
    //Check if guild
    if (command.guildOnly && msg.channel.type !== 'text') {
      msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
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
      msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
      return msg.author.send(reply);
    }
    // Permission shit
    if (command.permission) {
      if (!mod_ids.includes(msg.member.id)) {
        if (msg.member.id != owner_id) {
          msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
          return msg.author.send("You do not have the permissions for this. How tf do you know this command?");
        }
      }
    }
    //Made it here now execute the command
    try {
      command.execute(msg, args, client, Sentry);
    }
    catch (err) {
      Sentry.captureException(err);
      return msg.author.send('Something went wrong. Try again later');
    }
  });
} catch(err) {
  Sentry.captureException(err);
}

function wrongChannel(msg) {
  const blah = "I will only accept messges sent to #" + client.channels.get(command_id).name;
  msg.channel.fetchMessage(msg.id).then(msg => msg.delete()).catch(err => Sentry.captureException(err));
  msg.author.send(blah).then(console.log(msg.author.username + " is a dumbass")).catch(err => Sentry.captureException(err));
}

client.login(TOKEN);
//( ಠ_ಠ)