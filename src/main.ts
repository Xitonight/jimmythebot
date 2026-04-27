import { copyFile, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'

import { Dispatcher, filters } from '@mtcute/dispatcher'
import { md, TelegramClient } from '@mtcute/node'
import { parseFile } from 'music-metadata'
import { env } from './env.js'

// Helper function to sanitize filenames for file system safety
function sanitizeFilename(str: string): string {
  return str.replace(/[/\\?%*:|"<>]/g, '_')
}

const allowedIds = [782516899, 5727498089, 1224798495, 611938392, 720640238]

const tg = new TelegramClient({
    apiId: env.API_ID,
    apiHash: env.API_HASH,
    storage: 'sessions/jimmythebot',
})

const dp = Dispatcher.for(tg)

dp.onNewMessage(
    filters.and(filters.userId(allowedIds), filters.audio),
    async (upd) => {
        const tempFileName = `${sanitizeFilename(upd.media.performer || 'unknown')} - ${sanitizeFilename(upd.media.title || 'unknown')}.mp3`
        const msg = await upd.replyText(md`Downloading \`${tempFileName}\`...`)
        try {
            const tempPath = `temp/${tempFileName}`

            // Download to temporary location first
            await mkdir('temp', { recursive: true })
            await tg.downloadToFile(tempPath, upd.media)

            // Read MP3 metadata
            const metadata = await parseFile(tempPath)
            const artist
                = metadata.common.artist || upd.media.performer || 'Unknown Artist'
            const album = metadata.common.album || 'Unknown Album'

            // Create final directory structure: music/{artist}/{album}
            const finalDir = join('music', artist, album)
            await mkdir(finalDir, { recursive: true })

            // Move file to final location (copy + delete to handle cross-filesystem moves)
            const finalFileName = `${metadata.common.track.no}${metadata.common.track.of ? `:${metadata.common.track.of}` : ''} ${sanitizeFilename(upd.media.title || 'unknown')}.mp3`
            const finalPath = join(finalDir, finalFileName)
            await copyFile(tempPath, finalPath)
            await unlink(tempPath)

            await tg.editMessage({
                message: msg,
                text: md`**${tempFileName}**\n✅ Downloaded successfully to \`${finalPath}\`.`,
            })
        } catch (error) {
            console.error(`Error: ${error}`)
            await tg.editMessage({
                message: msg,
                text: md`**${tempFileName}**\n\n❌ Failed to download the file.\n\n**Error**:\n\`\`\`\n${(error as Error).message}\n\`\`\``,
            })
        }
    },
)

const user = await tg.start({
    phone: env.PHONE_NUMBER,
    password: env.TG_PASSWORD,
})

console.log('Logged in as', user.username)
