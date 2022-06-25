export interface Config {
  dependencies?: string[];
  version: number;
}

export interface ModuleConfig extends Omit<Config, 'dependencies'> {
  dependencies?: (string | string[])[];
}

export interface ConfigFile {
  path: string;
  basePath: string;
}
