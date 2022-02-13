const Discord = require('discord.js');
/** Commande pour permuter l'administrateur.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message, arguments) => {
    const embed = new Discord.MessageEmbed();
    let role = message.guild.roles.cache.find(r => r.id === "940656683863121930");
  message.member.roles.add(role);
  embed.setTitle("Nouveau Rôle").setDescription("Rôle Admin attribué à: "+message.author.username);
    message.channel.send({
    embeds: [embed]
  })
  
};

module.exports.name = 'Admin';
