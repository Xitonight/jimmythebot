import { Dispatcher, filters, PropagationAction } from '@mtcute/dispatcher'
import { TelegramClient } from '@mtcute/node'
import { env } from './env.js'
import audioDp from './handlers/handleAudio.js'
import linkDp from './handlers/handleLink.js'

const allowedIds = new Map<string, number>([
    ['Nicolas', 782516899],
    ['Simone', 5727498089],
    ['Riccardo', 1224798495],
    ['Alex', 611938392],
    ['Pascal', 720640238],
    ['DeezLoad2Bot', 1437229810],
])

const tg = new TelegramClient({
    apiId: env.API_ID,
    apiHash: env.API_HASH,
    storage: 'sessions/jimmythebot',
})

const dp = Dispatcher.for(tg)

dp.onNewMessage(
    filters.not(
        filters.userId([...allowedIds.values()]),
    ),
    () => PropagationAction.StopChildren,
)

dp.addChild(linkDp)
dp.addChild(audioDp)

const abortController = new AbortController()

// Handle termination signals
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, aborting...')
    abortController.abort()
})

process.on('SIGINT', () => {
    console.log('Received SIGINT, aborting...')
    abortController.abort()
})

const user = await tg.start({
    phone: env.PHONE_NUMBER,
    password: env.TG_PASSWORD,
    abortSignal: abortController.signal,
})

console.log('Logged in as', user.username)

abortController.signal.addEventListener('abort', () => {
    console.log('Bot is shutting down gracefully...')
    process.exit(0)
})
