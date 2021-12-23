const Discord = require ('discord.js')

module.exports.config = {
    name: "botlist",
    aliases: [],
    description: 'This command will list all the users in your guild that are a bot',
    category: "misc",
    dmOnly: false, // Boolean
    guildOnly: true, // Boolean
    args: false, // Boolean
    usage: '',
    cooldown: 5, //seconds(s)
    guarded: false, // Boolean
    permissions: ["ADMINISTRATOR"],
}

module.exports.run = async (client, message, args) => {
  await message.guild.members.fetch()
  let arr = []

  message.guild.members.cache.forEach(async member => {
    if (member.user.bot) {
      arr.push(`<@${member.id}>`)
    }
  })

  const embed = new Discord.MessageEmbed()
    .setTitle(`${message.guild.name} Bot List [${arr.length}]`)
    .setColor('#36393f')
    .setDescription(`${arr.join("\n")}`)
  message.reply(embed)
}
