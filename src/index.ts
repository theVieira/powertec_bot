import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { config } from "../config/config";
import node_schedule from "node-schedule";
import { activeAutoReply } from "./consts/active-chats";
import { ItsOnReplySchedule } from "./utils/its-on-schedule";

const {
  target_groups,
  notice_schedule,
  notice_message,
  auto_reply_message,
  command: { pause, resume },
  allowed_contacts,
} = config;

export const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".",
  }),
  puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.once("ready", () => {
  client.getChats().then((chats) => {
    const targets = chats.filter((chat) => target_groups.includes(chat.name));
    targets.forEach((chat) => activeAutoReply.set(chat.name, false));
  });

  for (let day = 0; day <= 6; day++) {
    const schedule = notice_schedule[day];
    if (!schedule) continue;

    console.log("SCHEDULE", schedule);

    const [hour, minute] = schedule.start.split(":").map(Number);

    console.log("HOUR", hour);
    console.log("MINUTE", minute);

    node_schedule.scheduleJob({ hour, minute, dayOfWeek: day }, () => {
      client.getChats().then(async (chats) => {
        const targets = chats.filter((chat) =>
          target_groups.includes(chat.name)
        );

        console.log("TARGETS", targets);

        for (const chat of targets) {
          await chat.sendMessage(notice_message);
        }
      });
    });
  }

  console.log("🚀 Client connected");
});

client.on("message", (message) => {
  message.getChat().then((chat) => {
    console.log("MESSAGE", chat.name);
    message.getContact().then((contact) => {
      console.log("CONTACT", contact);

      const itsOnSchedule = ItsOnReplySchedule();
      console.log("ITS_ON_SCHEDULE", itsOnSchedule);

      const isTargetGroup = target_groups.includes(chat.name);
      console.log("IS_TARGET_GROUP", isTargetGroup);
      if (!isTargetGroup) return;

      const isAllowedContact = allowed_contacts.includes(contact.number);
      console.log("IS_ALLOWED_CONTACT", isAllowedContact);

      if (message.body === pause && isAllowedContact) {
        console.log("PRIMEIRO_IF");
        activeAutoReply.set(chat.name, true);
        message.reply("Auto reply desabilitado");
        return;
      }

      if (message.body === resume && isAllowedContact) {
        console.log("SEGUNDO_IF");
        activeAutoReply.set(chat.name, false);
        message.reply("Auto reply habilitado");
        return;
      }

      if (isAllowedContact) return;

      if (itsOnSchedule && activeAutoReply.get(chat.name) === false) {
        console.log("TERCEIRO_IF");
        message.reply(auto_reply_message);
        return;
      }
    });
  });
});

client.initialize();
