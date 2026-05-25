// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/OneLinkCollect.sol";

contract MockUSDC {
    string public constant name = "Mock USDC";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "balance");
        require(allowance[from][msg.sender] >= amount, "allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract OneLinkCollectTest is Test {
    MockUSDC internal usdc;
    OneLinkCollect internal collect;

    address internal owner = address(0xA11CE);
    address internal creator = address(0xC0FFEE);
    address internal payer = address(0xB0B);
    address internal recipient = address(0xCAFE);
    address internal feeRecipient = address(0xFEE);
    bytes32 internal linkId = keccak256("link");
    uint256 internal amount = 100e6;

    function setUp() public {
        usdc = new MockUSDC();
        vm.prank(owner);
        collect = new OneLinkCollect(address(usdc), feeRecipient, 50);
        usdc.mint(payer, amount);
    }

    function testCreateLink() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        OneLinkCollect.PaymentLink memory link = collect.getLink(linkId);
        assertEq(link.creator, creator);
        assertEq(link.recipient, recipient);
        assertEq(link.amount, amount);
        assertFalse(link.paid);
    }

    function testPayLinkSplitsFee() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount);
        collect.payLink(linkId);
        vm.stopPrank();

        assertEq(usdc.balanceOf(recipient), 99_500_000);
        assertEq(usdc.balanceOf(feeRecipient), 500_000);
        assertTrue(collect.getLink(linkId).paid);
    }

    function testCannotDoublePay() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount);
        collect.payLink(linkId);
        vm.expectRevert(OneLinkCollect.LinkAlreadyPaid.selector);
        collect.payLink(linkId);
        vm.stopPrank();
    }

    function testExpiredLinkCannotBePaid() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, uint64(block.timestamp + 1));
        vm.warp(block.timestamp + 2);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount);
        vm.expectRevert(OneLinkCollect.LinkExpired.selector);
        collect.payLink(linkId);
        vm.stopPrank();
    }

    function testFeeCannotExceedOnePercent() public {
        vm.prank(owner);
        vm.expectRevert(OneLinkCollect.FeeTooHigh.selector);
        collect.setFeeConfig(feeRecipient, 101);
    }
}
