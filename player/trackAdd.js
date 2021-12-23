const emotes = require ('../configs/emotes.json')

module.exports = (client, message, queue, track) => {
  const embed = new Discord.MessageEmbed()
    .setColor("#36393f")
    .setDescription(`${emotes.music} | ${track.title} has been added to the queue!`)
  message.channel.send(embed);
};