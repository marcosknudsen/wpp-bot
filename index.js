import wpp from "whatsapp-web.js";
import QRCode from "qrcode";
import * as dotenv from "dotenv";
import storage from "node-persist";
import getLiveStreams from "./getStreamInfo.js";
import { isOn, turnOff, turnOn } from "../HUE/hue.js";
import {
  getLiveMatchesString,
  getMatchesByIdString,
  getMatchesString,
  getResultsString,
} from "./getMatchesString.js";
import getImage from "../ia-image-generator/getImage.js";
import getCommands from "./getCommands.js";
import { getRemainingTime, createDate } from "../events/index.js";

dotenv.config();

const client = new wpp.Client();
let admins;
let streamers;
let eventsReady;
await storage.init();

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
  RemoveArray = [];
  await triggerEvents();
});

client.on("message", async (msg) => {
  if (msg.body[0] == "!") {
    let [command, ...arg] = getCommands(msg.body);
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
                (await isOn(light)) ? "Encendidas" : "Apagadas"
              );
          }
          break;
        case "turnon":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light)) turnOn(light);
          }
          break;
        case "turnoff":
          if (isAdmin(msg.from)) {
            let light = parseInt(arg);
            if (!isNaN(light)) turnOff(light);
          }
          break;
        case "aldosivi":
          client.sendMessage(
            msg.from,
            "🦈 " + (await getMatchesByIdString(22))
          );
          break;
        case "matches":
          let team = parseInt(arg);
          if (isNaN(team))
            client.sendMessage(
              msg.from,
              "Error: Compruebe haber insertado el team id correctamente (!matches {id})"
            );
          else client.sendMessage(msg.from, await getMatchesByIdString(team));
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
          client.sendMessage(msg.from, await getMatchesString(true));
          break;
        case "tomorrowmatches":
          client.sendMessage(msg.from, await getMatchesString(false));
          break;
        case "chelsea":
          client.sendMessage(
            msg.from,
            "🔵 " + (await getMatchesByIdString(531))
          );
          break;
        case "livematches":
          client.sendMessage(msg.from, await getLiveMatchesString());
          break;
        case "todayresults":
          client.sendMessage(msg.from, await getResultsString(true));
          break;
        case "yesterdayresults":
          client.sendMessage(msg.from, await getResultsString(false));
          break;
        case "setevent":
          let a = await storage.getItem("events");
          let events = a !== undefined ? a : [];
          let eventTime=createDate(arg[1],arg[2],arg[3],arg[4],arg[5])
          events.push({
            from: msg.from,
            message: arg[0],
            date:eventTime
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
            "🤖 !setEvent {mensaje usando _ sin espacios} {hora} {minuto} {dia} {mes} {año}"
          );
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

client.initialize();

function isAdmin(user) {
  return admins.includes(user);
}

async function triggerEvents() {
  let timeToEvent;
  let events = await storage.getItem("events");
  events.map((e) => {
    if (!IntoArray(e)) {
      timeToEvent = getRemainingTime(e.date);
      eventsReady.push(e);
      setTimeout(
        async () => {
          events = await storage.getItem("events");
          client.sendMessage(e.from, e.message.replaceAll("_", " "));
          removeFromArray(events, e);
          removeFromArray(eventsReady, e);
          await storage.setItem("events", events);
        },
        timeToEvent >= 0 ? timeToEvent : 0
      );
    }
  });
}

function removeFromArray(array, item) {
  let i,index
  while (i<array.length&&!equalObjects(array[i], item)) {
    i++;
  }
  if (i==array.length)
    index=-1
  else
    index=i  
  if (index !== -1) {
    array.splice(index, 1);
  }
}

function IntoArray(event){
  let a=0
  eventsReady.map((e) => {
    if (equalObjects(e,event)) 
      a++
  });
  return a==1
}

function equalObjects(a,b){
  return a.from==b.from&&a.message==b.message&&a.date==b.date
}