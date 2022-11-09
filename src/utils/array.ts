export function arrayOfStrings(input: unknown): input is string[] {
  return (
    Array.isArray(input) &&
    input.every((element) => typeof element === 'string')
  );
}

export function arrayOfStringsOfStrings(
  input: unknown,
): input is (string | string[])[] {
  return (
    Array.isArray(input) &&
    input.every(
      (element) => typeof element === 'string' || arrayOfStrings(element),
    )
  );
}
