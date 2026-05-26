# OneLink Live QA — Base Sepolia to Arc Bridge

Generated: 2026-05-26T12:01:42.732Z
Status: green
Wallet: `0xf6F0888C3FBF62aFeb4c1cC929fE1C782D09B00a`
Route: `Base_Sepolia -> Arc_Testnet`
Amount requested: `0.50 USDC`

## Balance Truth

- Base USDC: `20` -> `19.5`
- Arc USDC: `19.557924` -> `20.054067`

## App Kit Steps

| Step | State | Tx |
| --- | --- | --- |
| approve | success | [0xad1975f1...](https://sepolia.basescan.org/tx/0xad1975f1b71140c4f5414ce64fbcddbe892cd37e061ddc9946c784eb318a610f) |
| burn | success | [0xbffcd615...](https://sepolia.basescan.org/tx/0xbffcd6157ac78aa11d38dc834bcd995ae55d606ad278dac99fd345999b379b7a) |
| fetchAttestation | success | - |
| mint | success | [0x89bbfa9a...](https://testnet.arcscan.app/tx/0x89bbfa9a46d7e0cebe04648a37d963f8f48a2ff8d69291b11d29ccde1c723512) |

## Truth Notes

- This proves Circle App Kit can bridge funded Base Sepolia USDC into Arc Testnet for the QA payer wallet.
- This is a programmatic App Kit proof. Browser-wallet route selection still needs Rabby/AppKit popup automation for full human-like UI proof.
