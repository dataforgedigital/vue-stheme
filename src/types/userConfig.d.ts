
interface UserConfig {
  store?: string;
  build?: {
    prefix?: string;
    outdir?: string;
    javascript?: {
      input: string; // TODO: add Record<string, string>
      output?: string;
      useLiquid?: boolean;
      alias?: Record<string, string>;
    };
    styles?: {
      useLiquid?: boolean;
      alias?: Record<string, string>;
      input: string | Record<string, string>;
      output?: string;
    };
  };
}

export default UserConfig;
