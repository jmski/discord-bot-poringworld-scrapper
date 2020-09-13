var request = require('request');
const Discord = require('discord.js');

var del = 60 * 1000;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
};

module.exports = function getItems(message, option, query) {
    // get the db
    request('https://poring.world/api/search?order=popularity&rarity=&inStock=1&modified=&category=&endCategory=', function (error, response, body) {
        db = JSON.parse(body);

        if (option == '-s') {
            message.channel.send(`Search for "${query}":`);
            for (var c = 0; c < db.length; c++) {
                const itemEmbed = new Discord.RichEmbed()
                    .setColor('#c41b57')
                    .setTitle(`${db[c].name}`)
                    //.setDescription(db[c].description)
                    .setThumbnail(`https://poring.world/sprites/${db[c].icon}.png`);

                // if (Object.keys(db[c]).includes('equipUniqueEffect')) {
                //     db[c]['equipUniqueEffect'].forEach(effect => {
                //         itemEmbed.addField('Effects:', effect, true);
                //     });
                // }

                // if (Object.keys(db[c]).includes('equipEffect')) {
                //     Object.keys(db[c]['equipEffect']).forEach(effect => {
                //         itemEmbed.addField('Equip Effects:', `${effect}: ${db[c]['equipEffect'][effect]}`);
                //     });
                // }

                if (db[c].inStock) {
                    itemEmbed.addField('Item data:', `Buyers: ${(db[c].lastRecord.snapBuyers)}\nPrice: ${numberWithCommas(db[c].lastRecord.price)}`, true);
                }
                else {
                    itemEmbed.addField('Item data:', `Buyers: ${(db[c].lastRecord.snapBuyers)}\nPrice: ${numberWithCommas(db[c].lastRecord.price)}`, true);
                }

                itemEmbed.addField('Remaining time:', String(Math.floor(Math.round(Math.abs((new Date(db[c].lastRecord.snapEnd * 1000) - new Date()) / del)) / 60)) + ' h. ' + String(Math.round(Math.abs((new Date(db[c].lastRecord.snapEnd * 1000) - new Date()) / del)) % 60) + ' min.', true); // format: M/d/y hh:mm

                itemEmbed.setTimestamp()
                    .setFooter('PoringWorld', 'https://poring.world/icons/logo.png');

                if(db[c].name.toLowerCase().includes(query.toLowerCase())) {
                    message.channel.send(itemEmbed);
                }
            }
        }
        else {
            for (var c = 0; c < db.length; c++) {
                const itemEmbed = new Discord.RichEmbed()
                    .setColor('#c41b57')
                    .setTitle(`${db[c].name}`)
                    //.setDescription(db[c].description)
                    .setThumbnail(`https://poring.world/sprites/${db[c].icon}.png`);

                // if (Object.keys(db[c]).includes('equipUniqueEffect')) {
                //     db[c]['equipUniqueEffect'].forEach(effect => {
                //         itemEmbed.addField('Effects:', effect, true);
                //     });
                // }

                // if (Object.keys(db[c]).includes('equipEffect')) {
                //     Object.keys(db[c]['equipEffect']).forEach(effect => {
                //         itemEmbed.addField('Equip Effects:', `${effect}: ${db[c]['equipEffect'][effect]}`);
                //     });
                // }

                if (db[c].inStock) {
                    itemEmbed.addField('Item data:', /*`Rarity: ${db[c]['rarity']}\n`*/`Buyers: ${(db[c].lastRecord.snapBuyers)}\nPrice: ${numberWithCommas(db[c].lastRecord.price)} `, true);
                }
                else {
                    itemEmbed.addField('Item data:', `Buyers: ${(db[c].lastRecord.snapBuyers)}\nPrice: ${numberWithCommas(db[c].lastRecord.price)}`, true);
                }

                itemEmbed.addField('Remaining time:', String(Math.floor(Math.round(Math.abs((new Date(db[c].lastRecord.snapEnd * 1000) - new Date()) / del)) / 60)) + ' h. ' + String(Math.round(Math.abs((new Date(db[c].lastRecord.snapEnd * 1000) - new Date()) / del)) % 60) + ' min.', true); // format: M/d/y hh:mm

                itemEmbed.setTimestamp()
                    .setFooter('PoringWorld', 'https://poring.world/icons/logo.png');
                if(db[c].name.includes('<')) {
                    message.channel.send(itemEmbed);
                }
            }
        }
    });
}