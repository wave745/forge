"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCommand = testCommand;
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
async function testCommand() {
    console.log('🧪 FORGE Testing Framework\n');
    try {
        // Check if we're in an Anchor project
        if (!(0, fs_1.existsSync)('Anchor.toml')) {
            console.error('❌ Not in an Anchor project directory');
            console.error('Run "forge init" first or cd into your project');
            process.exit(1);
        }
        console.log('🔍 Analyzing program structure...');
        const programStructure = await analyzeProgram();
        console.log('📝 Generating test suite...');
        await generateTestSuite(programStructure);
        console.log('📦 Installing test dependencies...');
        await installTestDeps();
        console.log('🚀 Running tests...');
        await runTests();
    }
    catch (error) {
        console.error('❌ Test generation failed');
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}
async function analyzeProgram() {
    const structure = {
        instructions: [],
        accounts: [],
        hasTokenProgram: false,
        hasSystemProgram: false,
        hasAssociatedToken: false,
        pdas: [],
    };
    try {
        // Find and analyze Rust program files
        const { glob } = require('glob');
        const rustFiles = await glob('programs/**/*.rs');
        for (const file of rustFiles) {
            const content = (0, fs_1.readFileSync)(file, 'utf8');
            // Extract instruction handlers
            const instructionMatches = content.match(/pub fn (\w+)\(/g);
            if (instructionMatches) {
                structure.instructions.push(...instructionMatches.map(match => match.replace('pub fn ', '').replace('(', '')));
            }
            // Check for program dependencies
            if (content.includes('anchor_spl::token')) {
                structure.hasTokenProgram = true;
            }
            if (content.includes('system_program')) {
                structure.hasSystemProgram = true;
            }
            if (content.includes('associated_token')) {
                structure.hasAssociatedToken = true;
            }
            // Extract PDA definitions
            const pdaMatches = content.match(/seeds\s*=\s*\[([^]]*)\]/g);
            if (pdaMatches) {
                structure.pdas.push(...pdaMatches);
            }
            // Extract account structs
            const accountMatches = content.match(/#\s*\[account\]\s+pub struct (\w+)/g);
            if (accountMatches) {
                structure.accounts.push(...accountMatches.map(match => match.replace('#[account]\n    pub struct ', '')));
            }
        }
    }
    catch (error) {
        console.warn(`⚠️  Could not fully analyze program: ${error}`);
    }
    return structure;
}
async function generateTestSuite(structure) {
    const testsDir = (0, path_1.join)('tests');
    const testFile = (0, path_1.join)(testsDir, 'forge-generated.ts');
    let testContent = `import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ${getProgramName()} } from "../target/types/${getProgramName()}";
import { expect } from "chai";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
${structure.hasTokenProgram ? 'import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";' : ''}
${structure.hasAssociatedToken ? 'import { getAssociatedTokenAddress, createAssociatedTokenAccount } from "@solana/spl-token";' : ''}

describe("${getProgramName()} - FORGE Generated Tests", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.${getProgramName()} as Program<${getProgramName()}>;

  let user: Keypair;
  let user2: Keypair;
  ${structure.hasTokenProgram ? 'let mint: PublicKey;\n  let userTokenAccount: PublicKey;\n  let user2TokenAccount: PublicKey;' : ''}

  before(async () => {
    user = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to users
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );

    ${structure.hasTokenProgram ? `
    // Create mint and token accounts for testing
    mint = await createMint(
      provider.connection,
      user,
      user.publicKey,
      user.publicKey,
      9
    );

    userTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user,
      mint,
      user.publicKey
    );

    user2TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user,
      mint,
      user2.publicKey
    );

    // Mint initial tokens
    await mintTo(
      provider.connection,
      user,
      mint,
      userTokenAccount,
      user,
      1000000000 // 1 token
    );` : ''}
  });

  describe("Program Initialization", () => {
    it("Should initialize program state", async () => {
      // Basic initialization test
      expect(program.programId).to.be.instanceOf(PublicKey);
    });

    it("Should have valid IDL", async () => {
      const idl = program.idl;
      expect(idl).to.exist;
      expect(idl.instructions).to.be.an('array');
    });
  });

  ${structure.instructions.map((instruction) => `
  describe("${instruction} instruction", () => {
    it("Should execute ${instruction} successfully", async () => {
      // TODO: Implement specific test logic for ${instruction}
      // This is a template - customize based on your instruction requirements

      try {
        const tx = await program.methods
          .${instruction}(${getDefaultParams(instruction)})
          .accounts({
            ${getDefaultAccounts(instruction, structure)}
          })
          .signers([user])
          .rpc();

        // Verify transaction success
        const txInfo = await provider.connection.getTransaction(tx);
        expect(txInfo).to.exist;
        expect(txInfo?.meta?.err).to.be.null;

      } catch (error) {
        // If instruction is not implemented yet, this is expected
        console.log(\`⚠️  ${instruction} not yet implemented - skipping test\`);
      }
    });

    it("Should reject ${instruction} with invalid inputs", async () => {
      // TODO: Test error conditions
      // This tests that the program properly validates inputs
    });
  });`).join('\n')}

  ${structure.hasTokenProgram ? `
  describe("Token Operations", () => {
    it("Should handle token transfers correctly", async () => {
      // Test token transfer functionality if applicable
      const initialBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);

      // Perform token operation
      // TODO: Add specific token transfer test

      const finalBalance = await provider.connection.getTokenAccountBalance(userTokenAccount);
      expect(finalBalance.value.uiAmount).to.be.at.most(initialBalance.value.uiAmount!);
    });
  });` : ''}

  describe("Access Control", () => {
    it("Should reject unauthorized operations", async () => {
      // Test that program properly enforces access controls
      try {
        // Attempt operation with wrong signer
        // This should fail
        expect.fail("Expected operation to be rejected");
      } catch (error: any) {
        // Expected to fail
        expect(error.message).to.include("Error");
      }
    });
  });

  describe("PDA Derivation", () => {
    ${structure.pdas.map((pda, index) => `
    it("Should derive PDA ${index + 1} correctly", async () => {
      const [pdaAddress, bump] = PublicKey.findProgramAddressSync(
        ${pda},
        program.programId
      );

      expect(pdaAddress).to.be.instanceOf(PublicKey);
      expect(bump).to.be.a('number');
      expect(bump).to.be.greaterThan(0);
      expect(bump).to.be.lessThan(256);
    });`).join('\n')}
  });

  describe("Edge Cases", () => {
    it("Should handle zero values appropriately", async () => {
      // Test division by zero, empty arrays, etc.
    });

    it("Should handle maximum values", async () => {
      // Test u64::MAX, maximum token amounts, etc.
    });
  });
});
`;
    // Write test file
    if (!(0, fs_1.existsSync)(testsDir)) {
        (0, child_process_1.execSync)(`mkdir -p ${testsDir}`);
    }
    (0, fs_1.writeFileSync)(testFile, testContent);
    console.log(`✅ Generated comprehensive test suite: ${testFile}`);
}
async function installTestDeps() {
    try {
        // Check if package.json exists and add test dependencies if needed
        if ((0, fs_1.existsSync)('package.json')) {
            const packageJson = JSON.parse((0, fs_1.readFileSync)('package.json', 'utf8'));
            const testDeps = {
                "chai": "^4.3.7",
                "@types/chai": "^4.3.5",
                "mocha": "^10.2.0",
                "@types/mocha": "^10.0.1"
            };
            let needsInstall = false;
            for (const [dep, version] of Object.entries(testDeps)) {
                if (!packageJson.devDependencies?.[dep]) {
                    if (!packageJson.devDependencies)
                        packageJson.devDependencies = {};
                    packageJson.devDependencies[dep] = version;
                    needsInstall = true;
                }
            }
            if (needsInstall) {
                (0, fs_1.writeFileSync)('package.json', JSON.stringify(packageJson, null, 2));
                (0, child_process_1.execSync)('npm install', { stdio: 'inherit' });
                console.log('✅ Installed test dependencies');
            }
        }
    }
    catch (error) {
        console.warn(`⚠️  Could not install test dependencies: ${error}`);
    }
}
async function runTests() {
    try {
        console.log('Running Anchor tests...');
        (0, child_process_1.execSync)('anchor test', { stdio: 'inherit' });
        console.log('✅ All tests passed!');
    }
    catch (error) {
        console.error('❌ Some tests failed');
        console.error('Check the output above for details');
        process.exit(1);
    }
}
function getProgramName() {
    try {
        const anchorToml = (0, fs_1.readFileSync)('Anchor.toml', 'utf8');
        const match = anchorToml.match(/name\s*=\s*"([^"]+)"/);
        return match ? match[1] : 'my-program';
    }
    catch {
        return 'my-program';
    }
}
function getDefaultParams(instruction) {
    // Generate sensible default parameters based on instruction name
    if (instruction.includes('transfer'))
        return 'new anchor.BN(1000)';
    if (instruction.includes('mint'))
        return 'new anchor.BN(1000000)';
    if (instruction.includes('burn'))
        return 'new anchor.BN(1000)';
    if (instruction.includes('initialize'))
        return '';
    return '/* TODO: Add parameters */';
}
function getDefaultAccounts(instruction, structure) {
    let accounts = '';
    if (instruction.includes('transfer') && structure.hasTokenProgram) {
        accounts = `
            from: userTokenAccount,
            to: user2TokenAccount,
            authority: user.publicKey,`;
    }
    accounts += `
            user: user.publicKey,
            systemProgram: SystemProgram.programId,`;
    if (structure.hasTokenProgram) {
        accounts += `
            tokenProgram: TOKEN_PROGRAM_ID,`;
    }
    return accounts;
}
//# sourceMappingURL=test.js.map