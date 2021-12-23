const emotes = require ('../configs/emotes.json')

module.exports = (client, message, query) => {
  // const embed = new Discordjs.MessageEmbed()
    message.channel.send(`:warning: | No matches found, try using a more known name or a youtube/spotify link!`);
};