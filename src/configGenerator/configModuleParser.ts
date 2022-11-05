import { parse as coreParse } from './coreParser.js';

export async function parseModuleConfig(configFilePath: string) {
  return coreParse(configFilePath, { type: 'module' });
}
