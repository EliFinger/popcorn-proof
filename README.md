# Popcorn Proof

Popcorn Proof is a mobile-first Base mini app for a simple onchain cinema ritual.

Users connect a wallet, choose one of three actions, and view both personal and total counters from the `PopcornProof` smart contract.

## Overview

The app presents three ritual actions:

- `Pop Kernel`
- `Salt Bucket`
- `Cheer Show`

Each action writes to the contract and increments a matching counter.

The interface also reads the current values for the connected wallet and the global totals.

## Repository

GitHub: https://github.com/EliFinger/popcorn-proof.git

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Wagmi
- Viem

## Contract

The frontend ABI matches the following minimal contract:

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

Create a local environment file from the example file:
