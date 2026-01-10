import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
const CONFIG_FILE = join(homedir(), '.forge', 'config.json');
export function loadConfig() {
    try {
        if (existsSync(CONFIG_FILE)) {
            const data = readFileSync(CONFIG_FILE, 'utf8');
            return { ...getDefaultConfig(), ...JSON.parse(data) };
        }
    }
    catch (error) {
        // Ignore errors and use defaults
    }
    return getDefaultConfig();
}
export function saveConfig(config) {
    const current = loadConfig();
    const updated = { ...current, ...config };
    // Ensure .forge directory exists
    const configDir = join(homedir(), '.forge');
    if (!existsSync(configDir)) {
        require('fs').mkdirSync(configDir, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
}
function getDefaultConfig() {
    return {
        name: 'forge-project',
        version: '0.1.0',
        network: 'devnet'
    };
}
//# sourceMappingURL=config.js.map