const { default: axios } = require('axios');
const Discord = require('discord.js');

/** Commande pour récupérer les informations sur le NFT Etherum.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message, arguments) => {
  const embed = new Discord.MessageEmbed();
  axios.get('https://api.x.immutable.com/v1/collections/0x83f120283c30c796ebe9216ccaf6718c31213681').then((res) => {
    console.log(res);
    embed.setTitle(res.data.name).setDescription(res.data.name).setImage(res.data.collection_image_url);
    message.channel.send({
    embeds: [embed]
  })
  })
  
};

module.exports.name = 'NFT';
