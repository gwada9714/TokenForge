// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITokenForgeToken is IERC20 {
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
    function renounceOwnership() external;
    function getPoolInfo() external view returns (uint256, uint256, uint256);
    function getUserStake(address _user) external view returns (uint256);
    function calculateRewards(address _user) external view returns (uint256);
}
