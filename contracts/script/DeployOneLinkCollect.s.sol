// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/OneLinkCollect.sol";

contract DeployOneLinkCollect is Script {
    address internal constant ARC_TESTNET_USDC = 0x3600000000000000000000000000000000000000;

    function run() external returns (OneLinkCollect collect) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address feeRecipient = vm.envOr("FEE_RECIPIENT", vm.addr(deployerKey));
        uint16 feeBps = uint16(vm.envOr("PLATFORM_FEE_BPS", uint256(0)));

        vm.startBroadcast(deployerKey);
        collect = new OneLinkCollect(ARC_TESTNET_USDC, feeRecipient, feeBps);
        vm.stopBroadcast();
    }
}
