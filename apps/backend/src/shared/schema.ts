import * as v from 'valibot'

export const NumberIdParamsSchema = v.object({ id: v.pipe(v.unknown(), v.toNumber()) })
export const StringIdParamsSchema = v.object({ id: v.pipe(v.unknown(), v.toString()) })

export const UrlSchema = v.pipe(v.string(), v.url())

export const EmailSchema = v.pipe(v.string(), v.email(), v.brand('email'))
export type EmailOutput = v.InferOutput<typeof EmailSchema>
