
export type BenchConfig = {
    frappeVersion: string;
    mariadbVersion: string;
    whoDBVersion: string;
    benchPath: string;
    redisCacheVersion: string;
    redisQueueVersion: string;
};

export type BenchInformation = {
    name: string;
    sites: string[];
    apps: string[];
    config: BenchConfig;
};