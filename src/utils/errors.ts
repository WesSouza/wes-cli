/**
 * A typeguarded version of `instanceof Error` for NodeJS.
 * @author Joseph JDBar Barron
 * @link https://dev.to/jdbar/the-problem-with-handling-node-js-errors-in-typescript-and-the-workaround-m64
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instanceOfNodeError<T extends new (...args: any) => Error>(
  value: unknown,
  errorType: T,
): value is InstanceType<T> & NodeJS.ErrnoException {
  return value instanceof errorType && 'code' in value;
}

export function nodeErrorCode(error: unknown): string | undefined {
  if (!instanceOfNodeError(error, Error)) {
    return;
  }

  return error.code;
}
