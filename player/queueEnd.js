const emotes = require ('../configs/emotes.json')

module.exports = (client, message, queue) => {
  // const embed = new Discordjs.MessageEmbed()
    message.channel.send(`${emotes.music} | No more tracks in queue!`);
};