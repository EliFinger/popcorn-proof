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
