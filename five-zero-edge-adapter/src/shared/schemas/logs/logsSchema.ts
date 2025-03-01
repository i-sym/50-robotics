import { z } from 'zod'

export const logsSchema = z.object({
    id: z.number().optional(),
    timestamp: z.coerce.date(),
    subsystem: z.string(),
    message: z.string(),
    level: z.enum(['info', 'warning', 'error']),
})

export const recentLogsSchema = z.object({
    lastUpdate: z.coerce.date(),
    logs: z.array(logsSchema)
})

export type LogsData = z.infer<typeof logsSchema>
export type RecentLogsData = z.infer<typeof recentLogsSchema>