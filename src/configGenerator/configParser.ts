import { parse as coreParse } from './coreParser';

export async function parseConfig(configFilePath: string) {
  return coreParse(configFilePath, { type: 'local' });
}
