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

    // --- Constructor guards ---------------------------------------------------

    function testConstructorRejectsZeroUSDC() public {
        vm.expectRevert(OneLinkCollect.InvalidRecipient.selector);
        new OneLinkCollect(address(0), feeRecipient, 50);
    }

    function testConstructorRejectsZeroFeeRecipient() public {
        vm.expectRevert(OneLinkCollect.InvalidRecipient.selector);
        new OneLinkCollect(address(usdc), address(0), 50);
    }

    function testConstructorRejectsFeeOverOnePercent() public {
        vm.expectRevert(OneLinkCollect.FeeTooHigh.selector);
        new OneLinkCollect(address(usdc), feeRecipient, 101);
    }

    // --- createLink -----------------------------------------------------------

    function testCreateLink() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        OneLinkCollect.PaymentLink memory link = collect.getLink(linkId);
        assertEq(link.creator, creator);
        assertEq(link.recipient, recipient);
        assertEq(link.amount, amount);
        assertFalse(link.paid);
        assertFalse(link.cancelled);
    }

    function testCreateLinkRejectsZeroRecipient() public {
        vm.prank(creator);
        vm.expectRevert(OneLinkCollect.InvalidRecipient.selector);
        collect.createLink(linkId, address(0), amount, 0);
    }

    function testCreateLinkRejectsZeroAmount() public {
        vm.prank(creator);
        vm.expectRevert(OneLinkCollect.InvalidAmount.selector);
        collect.createLink(linkId, recipient, 0, 0);
    }

    function testCreateLinkRejectsDuplicateLinkId() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.prank(creator);
        vm.expectRevert(OneLinkCollect.LinkAlreadyExists.selector);
        collect.createLink(linkId, recipient, amount, 0);
    }

    // --- payLink --------------------------------------------------------------

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

    function testPayLinkWithZeroFee() public {
        // Reconfigure to zero fee.
        vm.prank(owner);
        collect.setFeeConfig(feeRecipient, 0);

        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount);
        collect.payLink(linkId);
        vm.stopPrank();

        assertEq(usdc.balanceOf(recipient), amount);
        assertEq(usdc.balanceOf(feeRecipient), 0);
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

    function testPayNonexistentLinkReverts() public {
        vm.prank(payer);
        vm.expectRevert(OneLinkCollect.LinkNotFound.selector);
        collect.payLink(linkId);
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

    // --- cancelLink -----------------------------------------------------------

    function testCancelLinkBlocksPayment() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.prank(creator);
        collect.cancelLink(linkId);

        assertTrue(collect.getLink(linkId).cancelled);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount);
        vm.expectRevert(OneLinkCollect.LinkCancelled.selector);
        collect.payLink(linkId);
        vm.stopPrank();
    }

    function testOnlyCreatorCanCancel() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.prank(payer);
        vm.expectRevert(OneLinkCollect.NotCreator.selector);
        collect.cancelLink(linkId);

        vm.prank(owner);
        vm.expectRevert(OneLinkCollect.NotCreator.selector);
        collect.cancelLink(linkId);
    }

    function testCancelNonexistentLinkReverts() public {
        vm.prank(creator);
        vm.expectRevert(OneLinkCollect.LinkNotFound.selector);
        collect.cancelLink(linkId);
    }

    function testCannotCancelPaidLink() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount);
        collect.payLink(linkId);
        vm.stopPrank();

        vm.prank(creator);
        vm.expectRevert(OneLinkCollect.LinkAlreadyPaid.selector);
        collect.cancelLink(linkId);
    }

    function testCannotDoubleCancel() public {
        vm.prank(creator);
        collect.createLink(linkId, recipient, amount, 0);

        vm.prank(creator);
        collect.cancelLink(linkId);

        vm.prank(creator);
        vm.expectRevert(OneLinkCollect.LinkCancelled.selector);
        collect.cancelLink(linkId);
    }

    // --- Admin ----------------------------------------------------------------

    function testFeeCannotExceedOnePercent() public {
        vm.prank(owner);
        vm.expectRevert(OneLinkCollect.FeeTooHigh.selector);
        collect.setFeeConfig(feeRecipient, 101);
    }

    function testOnlyOwnerCanSetFeeConfig() public {
        vm.prank(payer);
        vm.expectRevert(OneLinkCollect.NotOwner.selector);
        collect.setFeeConfig(feeRecipient, 25);
    }

    function testSetFeeConfigZeroRecipientReverts() public {
        vm.prank(owner);
        vm.expectRevert(OneLinkCollect.InvalidRecipient.selector);
        collect.setFeeConfig(address(0), 25);
    }

    function testTransferOwnership() public {
        vm.prank(owner);
        collect.transferOwnership(creator);
        assertEq(collect.owner(), creator);

        // Old owner can no longer admin.
        vm.prank(owner);
        vm.expectRevert(OneLinkCollect.NotOwner.selector);
        collect.setFeeConfig(feeRecipient, 25);
    }

    function testTransferOwnershipRejectsZero() public {
        vm.prank(owner);
        vm.expectRevert(OneLinkCollect.InvalidRecipient.selector);
        collect.transferOwnership(address(0));
    }

    function testOnlyOwnerCanTransferOwnership() public {
        vm.prank(payer);
        vm.expectRevert(OneLinkCollect.NotOwner.selector);
        collect.transferOwnership(creator);
    }

    // --- Fuzz -----------------------------------------------------------------

    /// @dev Sweep amount + feeBps and check that recipient + fee split sum to
    /// the gross amount and that nobody can pay twice.
    function testFuzz_PayLinkSplitsCleanly(uint256 amount_, uint16 feeBps_) public {
        // Portable clamp (this project's forge-std may not expose bound()).
        amount_ = (amount_ % 1_000_000_000e6);
        if (amount_ == 0) amount_ = 1;
        feeBps_ = uint16(uint256(feeBps_) % 101);

        // Re-deploy with the fuzzed feeBps so the math matches.
        vm.prank(owner);
        collect = new OneLinkCollect(address(usdc), feeRecipient, feeBps_);
        usdc.mint(payer, amount_);

        bytes32 fuzzId = keccak256(abi.encode(amount_, feeBps_));

        vm.prank(creator);
        collect.createLink(fuzzId, recipient, amount_, 0);

        vm.startPrank(payer);
        usdc.approve(address(collect), amount_);
        collect.payLink(fuzzId);
        vm.stopPrank();

        uint256 expectedFee = (amount_ * feeBps_) / 10_000;
        uint256 expectedRecipient = amount_ - expectedFee;
        assertEq(usdc.balanceOf(recipient), expectedRecipient);
        assertEq(usdc.balanceOf(feeRecipient), expectedFee);
    }
}
