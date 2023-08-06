const wpp = require("whatsapp-web.js");
const QRCode = require("qrcode");
require("dotenv").config();
const storage = require("node-persist");
const getLiveStreams = require("./getStreamInfo.js");
const hue = require("../HUE/hue.js");
const matches = require("./getMatchesString.js");
const event = require("../events/index.js");
const { getMessage } = require("./getMessage.js");
const { getCommands } = require("./getCommands.js");

const client = new wpp.Client({
  authStrategy: new wpp.LocalAuth({ clientId: process.env.WPP_CLIENT_ID }),
});
let admins;
let streamers;
let eventsReady;
async function start() {
  await storage.init();
}
start().then(() => client.initialize());

client.on("qr", (qr) => {
  QRCode.toString(qr, { type: "terminal", small: true }, function (err, url) {
    console.log(url);
  });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  eventsReady = [];
  admins = await storage.getItem("admins");
  streamers = await storage.getItem("streamers");
  await triggerEvents();
});

client.on("message", async (msg) => {
  if (msg.body[0] == "!") {
    let command, arg;
    if (!msg.body.startsWith("!setevent"))
      [command, ...arg] = getCommands(msg.body);
    else [command, ...arg] = getMessage(msg.body);
    try {
      switch (command.toLowerCase()) {
        case "streams":
          client.sendMessage(msg.from, await getLiveStreams(streamers));
          break;
        case "ison":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light))
              client.sendMessage(
                msg.from,
                "Luces " + ((await hue.isOn(light)) ? "encendidas" : "apagadas")
              );
          }
          break;
        case "turnon":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light)) await hue.turnOn(light);
          }
          break;
        case "turnoff":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light)) await hue.turnOff(light);
          }
          break;
        case "aldosivi":
          client.sendMessage(
            msg.from,
            "🦈 " + (await matches.getMatchesByIdString(22))
          );
          break;
        case "matches":
          let team = parseInt(arg);
          if (isNaN(team))
            client.sendMessage(
              msg.from,
              "Error: Compruebe haber insertado el team id correctamente (!matches {id})"
            );
          else
            client.sendMessage(
              msg.from,
              await matches.getMatchesByIdString(team)
            );
          break;
        case "login":
          if (arg == process.env.PASSWORD && !isAdmin(msg.from)) {
            client.sendMessage(msg.from, "Sucessfully loged");
            admins.push(msg.from);
            await storage.updateItem("admins", admins);
          }
          break;
        case "help":
          client.sendMessage(
            msg.from,
            "🤖 Comandos:\n-!streams\n-!aldosivi\n-!matches {team id} (ex: !matches 5)\n-!todaymatches\n-!tomorrowmatches\n-!todayresults\n-!yesterdayresults\n-!login password"
          );
          break;
        case "addstreamer":
          if (
            !streamers
              .map((x) => x.toUpperCase())
              .includes(arg.toUpperCase()) &&
            isAdmin(msg.from)
          ) {
            streamers.push(arg);
            await storage.updateItem("streamers", streamers);
          }
          break;
        case "removestreamer":
          if (isAdmin(msg.from)) {
            var index = streamers
              .map((x) => x.toUpperCase())
              .indexOf(arg.toUpperCase());
            if (index !== -1) {
              streamers.splice(index, 1);
            }
            await storage.updateItem("streamers", streamers);
          }
          break;
        case "todaymatches":
          client.sendMessage(msg.from, await matches.getMatchesString(true));
          break;
        case "tomorrowmatches":
          client.sendMessage(msg.from, await matches.getMatchesString(false));
          break;
        case "chelsea":
          client.sendMessage(
            msg.from,
            "🔵 " + (await matches.getMatchesByIdString(531))
          );
          break;
        case "livematches":
          client.sendMessage(msg.from, await matches.getLiveMatchesString());
          break;
        case "todayresults":
          client.sendMessage(msg.from, await matches.getResultsString(true));
          break;
        case "yesterdayresults":
          client.sendMessage(msg.from, await matches.getResultsString(false));
          break;
        case "setevent":
          let a = await storage.getItem("events");
          let events = a !== undefined ? a : [];
          let message = arg[0];
          let eventTime = event.createDate(
            arg[1],
            arg[2],
            arg[3],
            arg[4],
            arg[5]
          );
          events.push({
            from: msg.from,
            message: message,
            date: eventTime,
          });
          await storage.updateItem("events", events);
          client.sendMessage(
            msg.from,
            `🤖 El evento ha sido creado exitosamente, recibira el mensaje a la hora indicada`
          );
          await triggerEvents();
          break;
        case "helpdate":
          client.sendMessage(
            msg.from,
            "🤖 !setEvent {mensaje entre parentesis} {hora} {minuto} {dia} {mes} {año}"
          );
          break;
        case "getevents":
          string = "";
          let aevents = await storage.getItem("events");
          let d;
          aevents.map((e) => {
            d = new Date(e.date);
            if (e.from == msg.from) {
              let minutes;
              let hours;
              if (d.getMinutes() < 10) {
                minutes = "0" + d.getMinutes().toString();
              } else {
                minutes = d.getMinutes();
                hours = d.getHours();
              }
              if (d.getHours() <= 9) hours = "0" + d.getHours().toString();
              else hours = d.getHours();
              string += `${hours}:${minutes} - ${d.getDate()}/${d.getMonth()}: ${
                e.message
              }\n`;
            }
          });
          client.sendMessage(msg.from, string);
          break;
        default:
          console.log(`ERROR: comando !${command} no encontrado`);
          client.sendMessage(
            msg.from,
            `Error: No se ha encontrado el comando "!${command}"`
          );
          break;
      }
    } catch (err) {
      console.log(err);
    }
  }
});

async function triggerEvents() {
  let timeToEvent;
  let events = await storage.getItem("events");
  events.map((e) => {
    if (!IntoArray(e)) {
      timeToEvent = event.getRemainingTime(e.date);
      eventsReady.push(e);
      setTimeout(
        async () => {
          events = await storage.getItem("events");
          client.sendMessage(e.from, e.message);
          removeFromArray(events, e);
          removeFromArray(eventsReady, e);
          await storage.setItem("events", events);
        },
        timeToEvent >= 0 ? timeToEvent : 0
      );
    }
  });
}

function isAdmin(user) {
  return admins.includes(user);
}

function removeFromArray(array, item) {
  let i, index;
  while (i < array.length && !equalObjects(array[i], item)) {
    i++;
  }
  index = i != array.length ? i : -1;
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function IntoArray(event) {
  let a = 0;
  eventsReady.map((e) => {
    if (equalObjects(e, event)) a++;
  });
  return a == 1;
}

function equalObjects(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}
