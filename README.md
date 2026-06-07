# Popcorn Proof

Popcorn Proof is a mobile-first Base mini app for a simple onchain cinema ritual.
Users connect a wallet, choose `Pop Kernel`, `Salt Bucket`, or `Cheer Show`, and
the app reads personal and total counters from the `PopcornProof` contract.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Wagmi
- Viem

## Contract

The frontend ABI matches this minimal contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PopcornProof {
    mapping(address => uint256) public userPops;
    mapping(address => uint256) public userSalts;
    mapping(address => uint256) public userCheers;

    uint256 public totalPops;
    uint256 public totalSalts;
    uint256 public totalCheers;

    event KernelPopped(address indexed user, uint256 userPops, uint256 totalPops);
    event BucketSalted(address indexed user, uint256 userSalts, uint256 totalSalts);
    event ShowCheered(address indexed user, uint256 userCheers, uint256 totalCheers);

    function popKernel() external {
        unchecked {
            userPops[msg.sender] += 1;
            totalPops += 1;
        }

        emit KernelPopped(msg.sender, userPops[msg.sender], totalPops);
    }

    function saltBucket() external {
        unchecked {
            userSalts[msg.sender] += 1;
            totalSalts += 1;
        }

        emit BucketSalted(msg.sender, userSalts[msg.sender], totalSalts);
    }

    function cheerShow() external {
        unchecked {
            userCheers[msg.sender] += 1;
            totalCheers += 1;
        }

        emit ShowCheered(msg.sender, userCheers[msg.sender], totalCheers);
    }
}
```

## Configuration

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_POPCORN_PROOF_ADDRESS=0x3e51E2aF65e1802565BcA6f3715072Aa3ca8216B
NEXT_PUBLIC_BASE_APP_ID=6a252f3a95cfa95c11629bb3
NEXT_PUBLIC_BASE_BUILDER_CODE=bc_x452k0jv
NEXT_PUBLIC_BASE_BUILDER_ENCODED_STRING=0x62635f783435326b306a760b0080218021802180218021802180218021
```

The Base and Talent verification tags are hard-coded in `src/app/layout.tsx`.
The request requires these tags to be written directly in the head rather than
generated through the Next.js metadata API.

`NEXT_PUBLIC_BASE_BUILDER_ENCODED_STRING` is passed as `dataSuffix` on every
`writeContract` call.

## Local Development

```bash
npm install
npm run dev
```

## Deploy

Deployment is configured for GitHub and Vercel.

Recommended Vercel settings:

- Disable Deployment Protection.
- Set all environment variables listed above.
- Confirm the page source contains `<meta name="base:app_id" ...>`.
- Confirm Base App iframe access works with the headers in `vercel.json`.
