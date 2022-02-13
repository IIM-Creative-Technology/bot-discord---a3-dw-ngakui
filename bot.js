const connection = require('./database');
const clientLoader = require('./src/clientLoader');
const commandLoader = require('./src/commandLoader');
const Discord = require('discord.js');
require('./database');
require('colors');

const COMMAND_PREFIX = '!';

var bannedWord = false;
const embed = new Discord.MessageEmbed();
const embed2 = new Discord.MessageEmbed();

// Liste des mots interdits.
const liste = [
  "fuck",
  "chit",
  "merde",
  "putain"
];

// Fonction permettant de changer le rôle en fonction du niveau d'expérience
function addRoleByLevel(message,embed,level){
  const roles = [
                  "941722713507106816", // "Role Débutant- EXP" pour le niveau 1
                  "941722858030256178", // "Role Confirmé - EXP" pour le niveau 2
                  "941722961939939389", // "Role Expert - EXP" pour le niveau 3
                  "941723073902686288" // "Role Légende" pour le niveau 4
                ];
  // Assignation de rôle pour chaque niveau.
  let assignedRole = level <= 1 ? message.guild.roles.cache.find(r => r.id === roles[0]) : 
                ((level === 9 ? message.guild.roles.cache.find(r => r.id === roles[1]) :
                (level === 25 ? message.guild.roles.cache.find(r => r.id === roles[2]) :  
                message.guild.roles.cache.find(r => r.id === roles[3]))));

  // Ajout du nouveau role au membre.
  message.member._roles.forEach(role =>{
    if(role !== assignedRole.id){
      message.member.roles.add(assignedRole);
    }
  });

    // Messasge personnalisé pour informer du changement de rôle.
    embed.setTitle("Super!!!!! Nouveau role pour vous!")
    .setDescription("Etant au niveau "+level+", vous êtes un(e): "+assignedRole.name)
    .setColor(assignedRole.color);
    message.channel.send({
        embeds: [embed]
    })  
    
    // Retirer l'ancien role
  roles.forEach(x => {
    if(x != assignedRole.id)
      message.member.roles.remove(x);
  })
}



// Initialisation du client pour l'envoi des messages.
clientLoader.createClient(['GUILD_MESSAGES', 'GUILDS', 'GUILD_MEMBERS'])
  .then(async (client) => {
    await commandLoader.load(client);

    // Ajout des id des rôles bots du serveurs.
    client.on('guildMemberAdd', async (member) => {
      const guild = member.guild;
      await member.roles.add('941695395002728560');
      await member.roles.add('940609445367529545');
    })

    // Evènement s'exécutant à l'ajout d'un message.
    client.on('messageCreate', async (message) => {

      // Vérification si le mesage envoyé contient un mot interdit.
      liste.forEach(word => {
        if(message.content.toLowerCase().includes(word)) {
          bannedWord = true;
          console.log('Mot interdit!');
        }
      });
      console.log('The Server:', message.channel.name)


      if(bannedWord === false) {
        if(!message.author.bot) {

          // Requête de sélection des utilisateurs.
         connection.query("SELECT * FROM xp", function (error, results, fields) {
           if (error) throw error;

           // Requête d'insertion des utilisateurs s'il n'existe pas.
           if(results.length === 0 || !results.some((el)=>{return el.user_id === message.author.id})) {
             connection.query("INSERT INTO xp (user_id, xp_count) VALUES ('"+message.author.id+"', 1)", (err, results, fields) => {
               console.log('Insert new:', results);

                // Vérification et diffusion des message dans le canal share.
               if(message.channel.name != "général") {
                client.channels.cache.forEach(channel => {
                  if (channel.name === "shared") {
                   embed2.setTitle(message.author.username+" a envoyé un message.").setDescription('Depuis le serveur: '+message.guild.name+' \n Son nivau d\'XP est: 1');
                   channel.send({embeds: [embed2]})
                  }
                })
               }
             });
           } else {
             results.forEach(user => {
               if(message.author.id === user.user_id) {
                 user.xp_count = user.xp_count + 1

                 // Mise à jour des informations de l'utilisateur si ce dernier existe déjà.
                 connection.query("UPDATE xp SET xp_count = "+ user.xp_count+" WHERE id = "+user.id+"", (error, results, fields) => {
                   if (error) throw error;
                   console.log("Update count successfully: ");
                   embed.setTitle(message.author.username).setDescription('Votre xp est: '+user.xp_count);
                   message.channel.send({embeds: [embed]})


                   if(message.channel.name != "général") {
                    client.channels.cache.forEach(channel => {
                      if (channel.name === "shared") {
                       embed2.setTitle(message.author.username+" a envoyé un message.").setDescription('Depuis le serveur: '+message.guild.name+' \n Son nivau d\'XP est: '+user.xp_count);
                       channel.send({embeds: [embed2]})
                      }
                    })
                   }
                 })

                 // Mise à jour des informations utilisateur en fonction de son niveau.
                 if((user.xp_count % 4) === 0) {
                   user.xp_level = user.xp_level + 1
                   connection.query("UPDATE xp SET xp_level = "+ user.xp_level+" WHERE id = "+user.id+"", (error, results, fields) => {
                     if (error) throw error;
                     embed.setTitle(message.author.username).setDescription('Votre level vient d\'augmenter : '+user.xp_level);
                     message.channel.send({embeds: [embed]});
                     addRoleByLevel(message, embed, user.xp_level);
                   })
                 }
               }
             });
           }
         });
       }
  
        // Ne pas tenir compte des messages envoyés par les bots, ou qui ne commencent pas par le préfix
        if (message.author.bot || !message.content.startsWith(COMMAND_PREFIX)) return;
  
        // On découpe le message pour récupérer tous les mots
        const words = message.content.split(' ');
  
        const commandName = words[0].slice(1); // Le premier mot du message, auquel on retire le préfix
        const arguments = words.slice(1); // Tous les mots suivants sauf le premier
  
        if (client.commands.has(commandName)) {
          // La commande existe, on la lance
          client.commands.get(commandName).run(client, message, arguments);
        } else {
          // La commande n'existe pas, on prévient l'utilisateur
          await message.delete();
          await message.channel.send(`The ${commandName} does not exist.`);
        }
      } else {
        // Suppression du messsage si t'utilisateur saisie un mot interdit
        // et envoi d'un message privé pour avertir l'utilisateur.
        await message.delete();
        message.author.send('Vous devez utiliser un langage approprié');
      }
    })
  });
