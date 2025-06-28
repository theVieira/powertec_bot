var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("config/config.model", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("config/config", [], function (exports_2, context_2) {
    "use strict";
    var config;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            exports_2("config", config = {
                target_groups: ["TESTE"],
                allowed_contacts: [],
                auto_reply_message: "",
                notice_message: "",
                schedules: {
                    0: { start: "", end: "" },
                },
                command: {
                    pause: "#pause",
                    resume: "#resume",
                },
            });
        }
    };
});
System.register("its-on-schedule", ["config/config", "dayjs"], function (exports_3, context_3) {
    "use strict";
    var config_1, dayjs_1, schedules;
    var __moduleName = context_3 && context_3.id;
    function ItsOnSchedule() {
        const now = dayjs_1.default();
        const weekDay = now.day();
        const schedule = schedules[weekDay];
        if (!schedule)
            return false;
        const [hStart, mStart] = schedule.start.split(":").map(Number);
        const [hEnd, mEnd] = schedule.end.split(":").map(Number);
        const startTime = now
            .set("hour", hStart)
            .set("minute", mStart)
            .set("second", 0);
        const endTime = now.set("hour", hEnd).set("minute", mEnd).set("second", 0);
        return now.isAfter(startTime) && now.isBefore(endTime);
    }
    exports_3("ItsOnSchedule", ItsOnSchedule);
    return {
        setters: [
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (dayjs_1_1) {
                dayjs_1 = dayjs_1_1;
            }
        ],
        execute: function () {
            schedules = config_1.config.schedules;
        }
    };
});
System.register("index", ["whatsapp-web.js", "qrcode-terminal", "config/config", "node-schedule", "its-on-schedule"], function (exports_4, context_4) {
    "use strict";
    var whatsapp_web_js_1, qrcode_terminal_1, config_2, node_schedule_1, its_on_schedule_1, target_groups, schedules, allowed_contacts, auto_reply_message, notice_message, _a, pause, resume, client, activeAutoReply;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (whatsapp_web_js_1_1) {
                whatsapp_web_js_1 = whatsapp_web_js_1_1;
            },
            function (qrcode_terminal_1_1) {
                qrcode_terminal_1 = qrcode_terminal_1_1;
            },
            function (config_2_1) {
                config_2 = config_2_1;
            },
            function (node_schedule_1_1) {
                node_schedule_1 = node_schedule_1_1;
            },
            function (its_on_schedule_1_1) {
                its_on_schedule_1 = its_on_schedule_1_1;
            }
        ],
        execute: function () {
            target_groups = config_2.config.target_groups, schedules = config_2.config.schedules, allowed_contacts = config_2.config.allowed_contacts, auto_reply_message = config_2.config.auto_reply_message, notice_message = config_2.config.notice_message, _a = config_2.config.command, pause = _a.pause, resume = _a.resume;
            client = new whatsapp_web_js_1.Client({});
            // True is paused
            // False is resumed
            activeAutoReply = new Map();
            client.on("qr", (qr) => {
                qrcode_terminal_1.default.generate(qr, { small: true });
            });
            client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
                const chats = yield client.getChats();
                const targets = chats.filter((chat) => target_groups.includes(chat.name));
                targets.forEach((chat) => activeAutoReply.set(chat.name, false));
                // Schedule send message
                for (let day = 0; day <= 6; day++) {
                    const schedule = schedules[day];
                    if (!schedule)
                        continue;
                    const [hour, minute] = schedule.start.split(":").map(Number);
                    node_schedule_1.default.scheduleJob({ hour, minute, dayOfWeek: day }, () => __awaiter(void 0, void 0, void 0, function* () {
                        const chats = yield client.getChats();
                        const targets = chats.filter((chat) => target_groups.includes(chat.name));
                        for (const chat of targets) {
                            yield chat.sendMessage(notice_message);
                        }
                    }));
                }
            }));
            client.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
                const chat = yield message.getChat();
                const isTargetGroup = target_groups.includes(chat.name);
                if (!isTargetGroup)
                    return;
                const isAllowedContact = allowed_contacts.includes(message.from);
                if (message.body === pause && isAllowedContact) {
                    activeAutoReply.set(chat.name, true);
                    message.reply("Auto reply desabilitado");
                    return;
                }
                if (message.body === resume && isAllowedContact) {
                    activeAutoReply.set(chat.name, false);
                    message.reply("Auto reply habilitado");
                    return;
                }
                if (isAllowedContact)
                    return;
                if (its_on_schedule_1.ItsOnSchedule() &&
                    activeAutoReply.has(chat.name) &&
                    activeAutoReply.get(chat.name) === false) {
                    message.reply(auto_reply_message);
                    return;
                }
            }));
            client.initialize();
        }
    };
});
