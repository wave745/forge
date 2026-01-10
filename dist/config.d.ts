export interface ForgeConfig {
    name: string;
    version: string;
    network: 'devnet' | 'mainnet-beta' | 'localnet';
    programId?: string;
    treasuryPubkey?: string;
}
export declare function loadConfig(): ForgeConfig;
export declare function saveConfig(config: Partial<ForgeConfig>): void;
//# sourceMappingURL=config.d.ts.map