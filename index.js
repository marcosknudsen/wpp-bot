import wpp from "whatsapp-web.js";
import QRCode from "qrcode";
import * as dotenv from "dotenv";
import storage from "node-persist";
import getLiveStreams from "./getStreamInfo.js";
import { isOn, turnOff, turnOn } from "./hueApi.js";
import { getMatches } from "./getMatches.js";
import getImage from "../ia-image-generator/getImage.js";
import getCommands from "./getCommands.js";

dotenv.config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const client = new wpp.Client();
let admins;
let streamers;
await storage.init();

client.on("qr", (qr) => {
  QRCode.toString(qr, { type: "terminal", small: true }, function (err, url) {
    console.log(url);
  });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  admins = await storage.getItem("admins");
  streamers = await storage.getItem("streamers");
});

client.on("message", async (msg) => {
  if (msg.body[0] == "!") {
    let [command, arg] = getCommands(msg.body);
    switch (command) {
      case "streams":
        client.sendMessage(msg.from, await getLiveStreams(streamers));
        break;
      case "isOn":
        if (admins.includes(msg.from)) {
          let light = parseInt(arg);
          if (!isNaN(light))
            client.sendMessage(
              msg.from,
              (await isOn(light)) ? "Encendidas" : "Apagadas"
            );
        }
        break;
      case "turnOn":
        if (admins.includes(msg.from)) {
          let light = parseInt(arg);
          if (!isNaN(light)) turnOn(light);
        }
        break;
      case "turnOff":
        if (admins.includes(msg.from)) {
          let light = parseInt(arg);
          if (!isNaN(light)) turnOff(light);
        }
        break;
      case "aldosivi":
        client.sendMessage(msg.from, await getMatches(22));
        break;
      case "matches":
        let team = parseInt(arg);
        if (isNaN(team))
          client.sendMessage(
            msg.from,
            "Error: Compruebe haber insertado el team id correctamente (!matches {id})"
          );
        else client.sendMessage(msg.from, await getMatches(team));
        break;
      case "login":
        if (arg == process.env.PASSWORD && !admins.includes(msg.from)) {
          client.sendMessage(msg.from, "Sucessfully loged");
          admins.push(msg.from);
          await storage.set("admins", admins);
        }
        break;
      case "image":
        const mMedia = await wpp.MessageMedia.fromUrl(await getImage(arg));
        client.sendMessage(msg.from, mMedia);
        break;
      case "help":
        client.sendMessage(
          msg.from,
          "🤖 Comandos:\n-!streams\n-!aldosivi\n-!matches {team id} (ex:!matches 5)\n-!image {description}(ex:!image messi)\n-!login password"
        );
        break;
      case "addStreamer":
        if (
          !streamers.map((x) => x.toUpperCase()).includes(arg.toUpperCase())
        ) {
          streamers.push(arg);
          storage.set("streamers", streamers);
        }
        break;
      case "removeStreamer":
        var index = streamers
          .map((x) => x.toUpperCase())
          .indexOf(arg.toUpperCase());
        if (index !== -1) {
          streamers.splice(index, 1);
        }
        storage.set("streamers", streamers);
        break;
    }
  }
});

client.initialize();
