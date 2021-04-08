
const p = require('./events/message')
const { Collection, Client, MessageEmbed } = require('discord.js');
const { readdir } = require('fs');
const fs = require('fs');
const { prefix, token, config } = require('./config.json');
const express = require('express');


const app = express();
app.get('/', (request, response) => {
  const ping = new Date();
  ping.setHours(ping.getHours() - 3);
  console.log(
    `Ping recebido às ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`
  );
  response.sendStatus(200);
});
app.listen(process.env.PORT);

//CLIENT E DATABASE

const client = new Client({
  disableEveryone: true
});
client.queue = new Map()

client.p = {
  prefix: prefix,
  
}

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dbbot:40028922ryan@cluster0.3zat4.mongodb.net/Data?retryWrites=true&w=majority', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(console.log('mongodb ativo'))


client.commands = new Collection();
client.events = new Collection(); 

const commandFolders = fs.readdirSync('./commands')

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`)

	client.commands.set(command.name, command);
  }

}
/*
readdirSync("./events/").forEach((file) => {
    const events = readdirSync("./events/").filter((file) =>
      file.endsWith(".js")
    );

    for (let file of events) {
      let pull = require(`../events/${file}`);

      if (pull.name) {
        client.events.set(pull.name, pull);
      } else {
        continue;
      }
    }
  });
*/

//Schema
const prefixSchema = require('./models/prefix')

client.prefix = async function(message) {
  let custom;

  const data = await prefixSchema.findOne({ Guild: message.guild.id })
    .catch(err => console.log(err))

  if (data) {
    custom = data.Prefix;
  } else {
    custom = prefix;
  }
  return custom;
}

//HANDLERS


readdir('./events/', (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    const event = require(`./events/${file}`);
    let eventName = file.split('.')[0];
    client.on(eventName, event.bind(null, client));

    //ACTIVITY

    client.on('ready', () => {
      let activities = [
        `Prefix ,, | use ,,help`,
        `Created by SaveiroRebaixada#8196`
      ],
        i = 0;
      setInterval(
        () =>
          client.user.setActivity(`${activities[i++ % activities.length]}`, {
            type: 'PLAYING'
          }),
        10000
      );
      client.user.setStatus('online').catch(console.error);
    });
  });
});

//Write 


//LOGIN

client.login(token);


