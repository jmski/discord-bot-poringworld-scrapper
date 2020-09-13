const Map = require('collections/map');
const Discord = require('discord.js');
const DateTime = require('date-and-time');

const config = require('./config.js');
const client = new Discord.Client();
const parties = new Map();

var schedule = require('node-schedule');
var getItems = require('./scrape.js');

DateTime.setLocales('en', {
    A: ['AM', 'PM']
});



function handleMessage(message) {

    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    return handleCommand(message, command, args);
}

function handleCommand(message, command, args) {
    switch (command) {
        case 'p':
            handlePoring(message, args);
            break;
		case 'autoporing':
            repeatPoring(message, args);
        default:
            break;
    }
}

var poringIntervalPause = true;
var poringRepeatInterval;
function repeatPoring(message, args) {
    var option = undefined;
    var query = undefined;
    if (!poringRepeatInterval) {
        poringRepeatInterval = setInterval(() => {
            console.log('paused:', poringIntervalPause);
            if (!poringIntervalPause) {
                getItems(message, option, query);
            }
        }, 1000 * 60 * 15);
    }

    if (poringIntervalPause) {
        poringIntervalPause = false;
		getItems(message, option, query);
		return message.channel.send(`Auto poring mode: ON - Next update in 15 minutes`);
    }
    else {
        poringIntervalPause = true;
		return message.channel.send(`Auto poring mode: OFF`);
    }

    console.log(poringRepeatInterval, poringIntervalPause);
}

function handlePoring(message, args) {
    let [option, query] = args;
    //console.log(option, query);

    if (option == '-s' && query == undefined) {
        return message.channel.send('Usage:\n> for search -> !!p [-s] for [search qurey]\n> full list -> poringlist');
    }

    getItems(message, option, query);
}

client.on('message', handleMessage);
client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));
client.on('error', console.error);

console.log('Initiating the login process...');
client.login(config.token).catch(console.error);