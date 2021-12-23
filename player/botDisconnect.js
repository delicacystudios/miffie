const emotes = require ('../configs/emotes.json')

module.exports = (client, message, queue) => {
  // const embed = new Discordjs.MessageEmbed()
    message.channel.send(`${emotes.music} | Music has been stopped due to bot left the voice channel!`);
};