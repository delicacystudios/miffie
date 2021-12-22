const Discord = require ('discord.js') // Defining Discord as the discord.js module
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] }); // Defining the discord client aswell as the partials needed
const fs = require ('fs') // Defining FS needed for the file management
const mongoose = require ('mongoose') // Defining mongoose
let ascii = require ('ascii-table') // Defining ascii for the file management events
const { Player } = require ('discord-player') // Defining Player as the discord-player
client.player = new Player(client) // Defining client.player as a new player
const schema = require ('./mongoose/prefix') // Defining the prefix schema
const MessageDelete = require ('./events/MessageDelete') // Defining the MessageDelete event
const guildMemberAdd = require ('./events/GuildMemberAdd') // Defining the memberadd event
const guildMemberRemove = require ('./events/GuildMemberRemove') // Defining the member remove event
const messageReactionAdd = require ('./events/ReactionAdd') // Defining the reaction add event
const ModLogs = require ('./events/Server-Logs') // Defining the modlogs events
const config = require ('./configs/config.json') // Defining the config.json file
const token = process.env['TOKEN']

client.on("ready", () => {

    console.log(`Logged in as ${client.user.tag}. Bot Invite: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`)

    MessageDelete(client)
    guildMemberAdd(client)
    guildMemberRemove(client)
    ModLogs(client)
    messageReactionAdd(client)
})

///
const activities = [
  "m/help | /help",
  "❄ Marry Christmas ❄",
  "❄ Marry Christmas ❄",
  "m/help | /help"
];
  
client.on("ready", () => {
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * (activities.length - 1) + 1);
    const newActivity = activities[randomIndex];
    client.user.setActivity(newActivity);
  }, 5000);
});
///
client.on("guildCreate", guild => {
  let channelID;
  let channels = guild.channels.cache;

  channelLoop:
  for (let key in channels) {
    let c = channels[key];
    if (c[1].type === "text") {
      channelID = c[0];
      break channelLoop;
    }
  }
  let channel = guild.channels.cache.get(guild.systemChannelID || channelID);
  const miffie = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle('💜 | Thank You for choosing **Miffie**!')
    .setDescription('⭐ Miffie is best tool to customize your music to suit your mood. Use all the features of the bot to cheer yourself up 🌺')
    .addField('To list all available bot commands use `m/help` or `/help`', `[Support Server](${client.botconfig.SupportServer}) • [VK Page](https://vk.com/delicacystudios) • [Website](https://miffie.tk) • [GitHub](https://github.com/Delicacy-Sound/miffie)`)
    .setThumbnail('https://media.discordapp.net/attachments/914242243659968545/919733958550388756/PicsArt_12-12-02.29.02.png')

  channel.send(miffie);
});

client.on("message", message => {
    if (message.author.bot) return false;

    if (message.content.includes("@here") || message.content.includes("@everyone")) return false;

    if (message.mentions.has(client.user.id)) {
        const mention = new Discord.MessageEmbed()
          .setTitle('My default prefix is `m/`')
          .setDescription('You can change the default prefix to whatever You want with the command `m/config` (Prefix on your server could be changed)')
          .setColor('RANDOM')
        message.channel.send(mention);
    };
});

client.login(token)
mongoose.connect(config.MongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const player = fs.readdirSync('./player').filter(file => file.endsWith('.js'));

for (const file of player) {
    const event = require(`./player/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
};


//Command Handler
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection(); // Defining the client aliases for the commands folder
cooldowns = new Discord.Collection()

let table = new ascii("Bot Commands") // Defining a new table with the title "Bot Commands"
table.setHeading("Command", "Load Status") // Adding headers to the table for the bot commands

fs.readdirSync("./commands/").forEach(dir => { // Reading all files in the commands folder
    const commands = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js")); // Defining commands and filtering the files to only get the names 
    for (let file of commands) {  // looping through the files
        let pull = require(`./commands/${dir}/${file}`); 
        if (pull.config.name) { 
            client.commands.set(pull.config.name, pull); // setting the client commands as the command name 
            table.addRow(file, 'Ready!');  // adding a row to the table to say the file name and the load status
        } else {
            table.addRow(file, `error -> missing a help.name, or help.name is not a string.`); // Adding another row to the table stating the name of the file and the error
            return; 
        }
        pull.config.aliases.forEach(alias => { 
            client.aliases.set(alias, pull.config.name) // setting the command aliases as the command aliases
          })
        }
})
console.log(table.toString()); //showing the table

client.on("message", async message => {

    if (message.author.bot) return

    const data = await schema.findOne({
        GuildID: message.guild.id
    })

    if (!data) {

    if(message.author.bot || !message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).split(/ +/g);
    if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);
    const commandName = args.shift().toLowerCase();

    const cmd = client.commands.get(commandName)

    || client.commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));

    if (!cmd) return

        try{

            //+ cooldown 1, //seconds(s)
            if (!cooldowns.has(cmd.config.name)) {
                cooldowns.set(cmd.config.name, new Discord.Collection());
            }
            
            const now = Date.now();
            const timestamps = cooldowns.get(cmd.config.name);
            const cooldownAmount = (cmd.config.cooldown || 3) * 1000;
            
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.config.name}\` command.`);
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        //+ args: true/false,
        if (cmd.config.args && !args.length) {
            		let reply = `You didn't provide any arguments, ${message.author}!`;

                    //+ usage: '<> <>',
            		if (cmd.config.usage) {
            			reply += `\nThe proper usage would be: \`${config.prefix}${cmd.config.name} ${cmd.config.usage}\``;
            		}
            
            		return message.channel.send(reply);
                }
                 
                 //+ permissions: [""],
                 if (cmd.config.permissions) {
                     	const authorPerms = message.channel.permissionsFor(message.author);
                     	if (!authorPerms || !authorPerms.has(cmd.config.permissions)) {
                     		return message.reply('You can not do this!');
                    	}
                     }

                //+ guildOnly: true/false,
                if (cmd.config.guildOnly && message.channel.type === 'dm') {
                    return message.reply('I can\'t execute that command inside DMs!');
                }

                //+ dmOnly: true/false,
                if (cmd.config.dmOnly && message.channel.type === 'text') {
                    return message.reply('I can\'t execute that command inside the server!');
                }

                if(cmd.config.guarded && message.author.id !== config.DevID) {
                    return message.reply('You can not do this!')
                }

        cmd.run(client, message, args);
    }catch(err){
        message.reply(`there was an error in the console.`);
        console.log(err);
    }

/*

███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗  ███████╗██╗░░░██╗███████╗███╗░░██╗████████╗
████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝  ██╔════╝██║░░░██║██╔════╝████╗░██║╚══██╔══╝
██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░  █████╗░░╚██╗░██╔╝█████╗░░██╔██╗██║░░░██║░░░
██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░  ██╔══╝░░░╚████╔╝░██╔══╝░░██║╚████║░░░██║░░░
██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗  ███████╗░░╚██╔╝░░███████╗██║░╚███║░░░██║░░░
╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝  ╚══════╝░░░╚═╝░░░╚══════╝╚═╝░░╚══╝░░░╚═╝░░░

░  ░██████╗███████╗████████╗  ██████╗░██████╗░███████╗███████╗██╗██╗░░██╗
╗ ██╔════╝██╔════╝╚══██╔══╝  ██╔══██╗██╔══██╗██╔════╝██╔════╝██║╚██╗██╔╝
  ╚█████╗░█████╗░░░░░██║░░░  ██████╔╝██████╔╝█████╗░░█████╗░░██║░╚███╔╝░
  ░╚═══██╗██╔══╝░░░░░██║░░░  ██╔═══╝░██╔══██╗██╔══╝░░██╔══╝░░██║░██╔██╗░
  ██████╔╝███████╗░░░██║░░░  ██║░░░░░██║░░██║███████╗██║░░░░░██║██╔╝╚██╗
  ╚═════╝░╚══════╝░░░╚═╝░░░  ╚═╝░░░░░╚═╝░░╚═╝╚══════╝╚═╝░░░░░╚═╝╚═╝░░╚═╝
*/



 } else if (data) {

    const prefix = data.Prefix

    if(message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(/ +/g);
    if (!args.length) return message.channel.send(`You didn't pass any command to reload, ${message.author}!`);
    const commandName = args.shift().toLowerCase();

    const cmd = client.commands.get(commandName)
        //+ aliases: [""],
        || client.commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));

        if (!cmd) return 
        try{

            //+ cooldown 1, //seconds(s)
            if (!cooldowns.has(cmd.config.name)) {
                cooldowns.set(cmd.config.name, new Discord.Collection());
            }
            
            const now = Date.now();
            const timestamps = cooldowns.get(cmd.config.name);
            const cooldownAmount = (cmd.config.cooldown || 3) * 1000;
            
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.config.name}\` command.`);
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        //+ args: true/false,
        if (cmd.config.args && !args.length) {
            		let reply = `You didn't provide any arguments, ${message.author}!`;

                    //+ usage: '<> <>',
            		if (cmd.config.usage) {
            			reply += `\nThe proper usage would be: \`${prefix}${cmd.config.name} ${cmd.config.usage}\``;
            		}
            
            		return message.channel.send(reply);
                }
                 
                 //+ permissions: [""],
                 if (cmd.config.permissions) {
                     	const authorPerms = message.channel.permissionsFor(message.author);
                     	if (!authorPerms || !authorPerms.has(cmd.config.permissions)) {
                     		return message.reply('You can not do this!');
                    	}
                     }

                //+ guildOnly: true/false,
                if (cmd.config.guildOnly && message.channel.type === 'dm') {
                    return message.reply('I can\'t execute that command inside DMs!');
                }

                //+ dmOnly: true/false,
                if (cmd.config.dmOnly && message.channel.type === 'text') {
                    return message.reply('I can\'t execute that command inside the server!');
                }

                if(cmd.config.guarded && message.author.id !== config.DevID) {
                    return message.reply('You can not do this!')
                }


        cmd.run(client, message, args);
    }catch(err){
        message.reply(`there was an error in the console.`);
        console.log(err);
    }

}

})