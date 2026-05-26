import { Dispatcher, filters } from '@mtcute/dispatcher'
import { BotKeyboard, html } from '@mtcute/node'

const dp = Dispatcher.child()

dp.onNewMessage(
    filters.or(
        filters.regex(/https:\/\/www\.deezer\.com\/album\/.*/),
        filters.regex(/https:\/\/open\.spotify\.com\/album\/.*/),
    ),
    async (msg) => {
        await msg.forwardTo({ toChatId: 1437229810 })
    },
)

dp.onNewMessage(
    filters.and(
        filters.media,
        filters.replyTo(),
        filters.userId(1437229810),
    ),
    async (msg) => {
        if (!msg.text.startsWith('💽')) return
        const markup = msg.markup
        if (!markup) return
        if (!('type' in markup)) return
        if (markup.type !== 'inline') return
        const buttons = markup.buttons

        const getAllButton = BotKeyboard.findButton(buttons, 'GET ALL ⬇️')
        if (!getAllButton) return
        if (getAllButton._ !== 'keyboardButtonCallback') return

        const replyTo = await msg.getReplyTo()
        if (replyTo.forward?.sender.type === 'user') {
            const tracksList = html(`<blockquote expandable>${buttons
                .flat()
                .map(btn => btn.text)
                .filter(text => !['GET ALL ⬇️', 'Download ZIP 🗃️', 'BACK 🔙'].includes(text))
                .map((text, index) => {
                    const match = text.match(/^(\d+:\d{2}:\d{2})\s*\|\s*(\S.*)$/)
                    if (match) {
                        const [, duration, authorTitle] = match
                        const title = authorTitle.split(' - ')[1]
                        const formattedDuration = duration.startsWith('0:') ? duration.slice(2) : duration
                        return `${index + 1} | ${title} (${formattedDuration})`
                    }
                    return `${index + 1} | ${text}`
                })
                .join('<br>')}
                                    </blockquote>`)
            await msg.client.sendMedia(replyTo.forward.sender, msg.media.inputMedia, {
                caption: html`${msg.text}<br><br>${tracksList}`,
            })
        }

        await msg.client.getCallbackAnswer({
            fireAndForget: true,
            message: msg.id,
            game: false,
            data: getAllButton.data,
            chatId: msg.sender,
        })
    },
)

export default dp
