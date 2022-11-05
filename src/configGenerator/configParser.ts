import { parse as coreParse } from './coreParser.js';

export async function parseConfig(configFilePath: string) {
  return coreParse(configFilePath, { type: 'local' });
}
