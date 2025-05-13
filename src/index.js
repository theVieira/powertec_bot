const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const cron = require('node-cron')
const { schedules, timezone, ignore, timeout } = require('../config.json')

const TIMEOUT_REPLY_IN_MINUTES = 10

const client = new Client({
	authStrategy: new LocalAuth({ dataPath: 'whatsapp-session' }),
})

client.once('ready', async () => {
	schedules.forEach((schedule) => {
		const activeReply = new Set()

		cron.schedule(
			schedule.interval.start,
			() => {
				client.getChats().then((chats) => {
					chats
						.filter((chat) => schedule.chats.includes(chat.name))
						.map((chat) => {
							activeReply.add(chat.name)
							return chat
						})
						.filter((chat) => !chat.lastMessage.fromMe)
						.forEach((chat) => {
							if (schedule.sendMessage) chat.sendMessage(schedule.message)

							return
						})
				})

				client.on('message', async (msg) => {
					const chat = await msg.getChat()
					const contact = (await msg.getContact()).id.user

					if (
						timeout.allowFrom.includes(contact) &&
						msg.body.startsWith(timeout.script)
					) {
						const disableChat = msg.body.split(timeout.script)[1].trim()

						if (Array.from(activeReply).includes(disableChat)) {
							activeReply.delete(disableChat)

							setTimeout(() => {
								activeReply.add(disableChat)
								msg.reply(`AUTO REPLY HABILITADO PARA ${disableChat}`)
							}, 1000 * 60 * TIMEOUT_REPLY_IN_MINUTES)

							msg.reply(
								`AUTO REPLY DESABILITADO PARA ( ${disableChat} ) POR ${TIMEOUT_REPLY_IN_MINUTES} MINUTOS`
							)
							return
						} else {
							msg.reply('INPUT INVÁLIDO ( CHAT NÃO ENCONTRADO )')
							return
						}
					}

					if (
						activeReply.has(chat.name) &&
						schedule.interval.activeReply &&
						!ignore.includes(contact)
					) {
						msg.reply(schedule.interval.message)
						return
					}
				})
			},
			{
				runOnInit: false,
				scheduled: true,
				timezone,
			}
		)

		cron.schedule(schedule.interval.end, () => {
			activeReply.clear()
		})
	})

	console.log('ok')
})

client.on('qr', (qr) => {
	qrcode.generate(qr, { small: true })
})

client.initialize()
