const emotes = require ('../configs/emotes.json')

module.exports = (client, message, queue, playlist) => {
  // const embed = new Discordjs.MessageEmbed()
    message.channel.send(`${emotes.music} | ${playlist.title} has been added to the queue (${playlist.tracks.length} songs)!`);
};