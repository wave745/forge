import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
export async function statusCommand() {
    console.log('FORGE Status\n');
    // Check Anchor
    try {
        const anchorVersion = execSync('anchor --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Anchor CLI: ${anchorVersion}`);
    }
    catch (error) {
        console.log('❌ Anchor CLI: Not found');
    }
    // Check Solana CLI
    try {
        const solanaVersion = execSync('solana --version', { encoding: 'utf8' }).trim().split('\n')[0];
        console.log(`✅ Solana CLI: ${solanaVersion}`);
    }
    catch (error) {
        console.log('❌ Solana CLI: Not found');
    }
    // Check Rust
    try {
        const rustVersion = execSync('rustc --version', { encoding: 'utf8' }).trim().split(' ')[1];
        console.log(`✅ Rust: ${rustVersion}`);
    }
    catch (error) {
        console.log('❌ Rust: Not found');
    }
    // Check if in project
    const anchorToml = join(process.cwd(), 'Anchor.toml');
    if (existsSync(anchorToml)) {
        console.log('✅ In Anchor project');
        try {
            const config = readFileSync(anchorToml, 'utf8');
            const network = config.includes('devnet') ? 'devnet' : 'localnet';
            console.log(`📡 Network: ${network}`);
        }
        catch (error) {
            console.log('📡 Network: Unknown');
        }
    }
    else {
        console.log('❌ Not in Anchor project');
    }
    console.log('\nReady to build on Solana.');
}
//# sourceMappingURL=status.js.map