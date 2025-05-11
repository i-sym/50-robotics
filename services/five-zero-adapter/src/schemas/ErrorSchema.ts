import { z } from 'zod';

export const ErrorResponseSchema = z.object({
    message: z.string().describe('Error message'),
    status: z.number().describe('HTTP status code')
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;