// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITaxDistributor {
    function distributeTax(uint256 amount) external;
}
