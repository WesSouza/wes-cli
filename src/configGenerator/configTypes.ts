export interface Config {
  dependencies?: string[];
  version: number;
}

export interface ConfigFile {
  path: string;
  basePath: string;
}
