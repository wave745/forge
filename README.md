# FORGE

![npm](https://img.shields.io/npm/v/forge-solana-sdk)
![npm](https://img.shields.io/npm/dm/forge-solana-sdk)
![License](https://img.shields.io/npm/l/forge-solana-sdk)

**Intent-driven Solana program assembly.** Generate production-ready Anchor programs from natural language. Modern CPI helpers included.

> ⚡ **FORGE generates code, not excuses.**

## ⚡ Install

```bash
npm install -g forge-solana-sdk
```

## 🚀 Usage

### Initialize a project
```bash
# Basic project
forge init my-project

# With intent-driven CPI generation
forge init my-project --intent "transfer 100 tokens safely"

# With specific Anchor version
forge init my-project --anchor-version 0.31.0

cd my-project
```

### Check status
```bash
forge status
```

Enhanced status checks include:
- ✅ Version compatibility warnings
- ✅ Rust edition 2024 requirements
- ✅ Anchor CLI vs project version matching
- ✅ Network configuration

### Deploy to Solana
```bash
forge deploy
```

### Update FORGE
```bash
forge update
```

**Smart Update System:**
- ✅ Checks current vs latest version
- ✅ Auto-updates via npm when needed
- ✅ Shows clear progress feedback
- ✅ No manual version management required

## 📋 Prerequisites

- **Node.js** 18+
- **Rust** 1.85.0+ (required for edition 2024 compatibility)
- **Solana CLI** (latest)
- **Anchor CLI** 0.29.0+

⚠️ **Important**: Rust 1.85.0+ is required for modern Anchor dependencies. Update with: `rustup update stable`

## 🎯 What FORGE Does

FORGE transforms natural language intents into production-ready Solana programs. Modern, safe, and future-proof code generation.

### Core Features
- ✅ **Intent-Driven Generation**: `"transfer 100 tokens safely"` → Modern CPI code
- ✅ **Complete Anchor Workspace**: Ready-to-build projects with proper structure
- ✅ **Modern CPI Helpers**: `transfer_checked`, `mint_to`, PDA signers with `ctx.bumps`
- ✅ **Version Compatibility**: Auto-aligns Anchor versions (CLI vs project)
- ✅ **Production Ready**: IDL features, proper dependencies, deployment configs

### Generated Code Quality
- 🔒 **Safe Operations**: Uses `anchor_spl::token_interface` for Token & Token-2022
- 🎯 **Modern Patterns**: `InterfaceAccount`, `Interface` types (Anchor 0.31+ compatible)
- ⚡ **Optimized**: Minimal boilerplate, maximum functionality
- 🚀 **Future-Proof**: Edition 2024 compatible, latest Anchor best practices

### Supported CPI Intents
- 💸 **Token Transfers**: `"transfer 100 tokens safely"` → `transfer_checked`
- 🪙 **Token Minting**: `"mint 500 tokens to user"` → `mint_to` with PDA authority
- 🎫 **ATA Creation**: `"create associated token account"` → `create_associated_token_account`
- 📊 **Token Metadata**: `"create metadata for token"` → MPL Token Metadata CPIs

**Example Generated Code:**
```rust
// From: forge init --intent "transfer 100 tokens safely"
token_interface::transfer_checked(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    ),
    100, // amount
    decimals, // automatic decimals lookup
)?;
```

## 🛠️ Troubleshooting

### Version Compatibility Issues
If you encounter build errors:

1. **Update Rust**: `rustup update stable` (requires 1.85.0+)
2. **Check versions**: `forge status` (shows mismatches)
3. **Specify version**: `forge init --anchor-version 0.32.1`

### Common Errors
- `edition2024` errors → Update Rust to 1.85.0+
- Version mismatches → Use `forge status` to check alignment
- Build failures → Ensure Anchor CLI matches project versions

## 🚫 What FORGE Does NOT Do

FORGE does not:
- Host your code
- Manage your keys
- Abstract blockchain risks
- Hold your hand

If you want magic, look elsewhere.

## 📚 Requirements

You must have:
- Basic Rust knowledge
- Understanding of Solana concepts
- Your own wallet and keys
- Test SOL for deployment

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `forge init <name>` | Create new Anchor project with optional intent |
| `forge init <name> --intent "transfer tokens"` | Generate CPI code from natural language |
| `forge init <name> --anchor-version 0.31.0` | Specify Anchor version for project |
| `forge status` | Check environment, versions, and compatibility |
| `forge update` | Update FORGE to latest version |
| `forge deploy` | Deploy program to Solana network |

## 📖 Examples

### Basic Project Creation
```bash
# Simple Anchor project
forge init my-project
cd my-project
forge status
```

### Intent-Driven CPI Generation
```bash
# Generate token transfer program
forge init token-transfer --intent "transfer 100 tokens safely"
cd token-transfer

# Modern CPI code is automatically generated:
# - transfer_checked with decimals validation
# - InterfaceAccount<TokenAccount> types
# - Proper error handling

anchor build  # ✅ Works immediately
anchor test   # ✅ Ready for testing
```

### Advanced Usage
```bash
# Mint tokens with PDA authority
forge init token-minter --intent "mint 500 tokens to user"

# Custom Anchor version
forge init legacy-project --anchor-version 0.30.1

# Stay updated
forge update
```

## 🏗️ Architecture

```
FORGE Ecosystem
├── forge-solana-sdk (npm) - Node.js CLI tool
│   ├── Intent parsing & code generation
│   ├── Version compatibility management
│   ├── Project scaffolding
│   └── Deployment orchestration
│
└── forge-runtime (crates.io) - Rust runtime library
    └── Future: Enhanced runtime capabilities
```

**Current Focus**: CLI-first approach with intent-driven generation. Runtime library for future enhancements.

## 🐛 Support

**FORGE is infrastructure, not a tutorial.** If you need help:

### Getting Help
1. **Run diagnostics first**: `forge status` (includes version compatibility checks)
2. **Check prerequisites**: Ensure Rust 1.85.0+, Node 18+, Anchor CLI installed
3. **File an issue**: Include `forge status` output and error details
4. **Describe expected vs actual**: What did you expect? What happened instead?

### Before Asking
- ✅ Have you run `forge status`?
- ✅ Is your Rust version 1.85.0+?
- ✅ Are you in an Anchor project directory?
- ✅ Have you tried `forge update`?

**If you don't understand Solana concepts, learn Solana first.** FORGE assumes basic blockchain knowledge.

## 📄 License

MIT - [https://github.com/forge-protocol/forge/blob/main/LICENSE](https://github.com/forge-protocol/forge/blob/main/LICENSE)

## 🔗 Links

- **Homepage**: [https://github.com/forge-protocol/forge](https://github.com/forge-protocol/forge)
- **NPM Package**: [https://www.npmjs.com/package/forge-solana-sdk](https://www.npmjs.com/package/forge-solana-sdk)
- **Issues**: [https://github.com/forge-protocol/forge/issues](https://github.com/forge-protocol/forge/issues)

---

**FORGE: Intent → Code. No magic, just infrastructure.** ⚡
