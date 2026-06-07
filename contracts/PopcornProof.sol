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
