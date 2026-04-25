type Config = {
    host: string;
    port: number;
    debug: boolean;
    secret: string;
};

type PublicConfig = Omit<Config, "secret">;
type PartialConfig = Partial<Config>;
type ReadonlyConfig = Readonly<Config>;

function applyDefaults(cfg: PartialConfig): Config {
    return {
        host: cfg.host ?? "localhost",
        port: cfg.port ?? 3000,
        debug: cfg.debug ?? false,
        secret: cfg.secret ?? "",
    };
}

const cfg = applyDefaults({ port: 8080, debug: true });
console.log(cfg.host, cfg.port);
