import { z } from 'zod'

const r = z.object({
    API_ID: z.coerce.number(),
    API_HASH: z.string(),
    PHONE_NUMBER: z.string(),
    TG_PASSWORD: z.string()
}).safeParse(process.env)

if (!r.success) {
    throw new Error(`Invalid env:\n${z.prettifyError(r.error)}`)
}

export const env = r.data
