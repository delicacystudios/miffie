const emotes = require ('../configs/emotes.json')

module.exports = (client, message, queue) => {
  // const embed = new Discordjs.MessageEmbed()
    message.channel.send(`${emotes.music} | Music stopped as there is no more members in the voice channel !`);
};