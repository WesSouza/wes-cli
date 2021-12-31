import { parse as coreParse } from './coreParser';

export async function parseModuleConfig(configFilePath: string) {
  return coreParse(configFilePath);
}
