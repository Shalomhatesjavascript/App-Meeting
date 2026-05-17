export type ExtractFirstFunctionParamter<TFunction extends (...args: never[]) => unknown> =
  Parameters<TFunction>[0]
