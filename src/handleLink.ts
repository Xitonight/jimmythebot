import { Dispatcher, filters } from '@mtcute/dispatcher'
import { BotKeyboard } from '@mtcute/node'

const dp = Dispatcher.child()

dp.onNewMessage(
    filters.or(
        filters.regex(/https:\/\/www.deezer.com\/album\/.*/),
        filters.regex(/https:\/\/open.spotify.com\/album\/.*/),
    ),
    async (msg) => {
        await msg.forwardTo({ toChatId: 1437229810 })
    },
)

dp.onNewMessage(
    filters.and(
        filters.media,
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
        console.log('Button text: ', getAllButton.text)
        console.log('Password required: ', getAllButton.requiresPassword)
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
