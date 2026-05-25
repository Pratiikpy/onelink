// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract OneLinkCollect {
    struct PaymentLink {
        address creator;
        address recipient;
        uint256 amount;
        uint64 expiresAt;
        bool paid;
        bool cancelled;
    }

    error NotOwner();
    error NotCreator();
    error InvalidRecipient();
    error InvalidAmount();
    error LinkAlreadyExists();
    error LinkNotFound();
    error LinkAlreadyPaid();
    error LinkCancelled();
    error LinkExpired();
    error FeeTooHigh();
    error TransferFailed();

    IERC20 public immutable usdc;
    address public owner;
    address public feeRecipient;
    uint16 public feeBps;

    mapping(bytes32 linkId => PaymentLink link) private links;

    event PaymentLinkCreated(
        bytes32 indexed linkId,
        address indexed creator,
        address indexed recipient,
        uint256 amount,
        uint64 expiresAt
    );
    event PaymentCompleted(
        bytes32 indexed linkId,
        address indexed payer,
        address indexed recipient,
        uint256 grossAmount,
        uint256 feeAmount
    );
    event PaymentLinkCancelled(bytes32 indexed linkId, address indexed creator);
    event FeeConfigUpdated(address indexed feeRecipient, uint16 feeBps);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address usdc_, address feeRecipient_, uint16 feeBps_) {
        if (usdc_ == address(0) || feeRecipient_ == address(0)) revert InvalidRecipient();
        if (feeBps_ > 100) revert FeeTooHigh();
        usdc = IERC20(usdc_);
        owner = msg.sender;
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function createLink(bytes32 linkId, address recipient, uint256 amount, uint64 expiresAt) external {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (links[linkId].creator != address(0)) revert LinkAlreadyExists();

        links[linkId] = PaymentLink({
            creator: msg.sender,
            recipient: recipient,
            amount: amount,
            expiresAt: expiresAt,
            paid: false,
            cancelled: false
        });

        emit PaymentLinkCreated(linkId, msg.sender, recipient, amount, expiresAt);
    }

    /// @notice Creator can void an unpaid link so payLink stops working.
    /// @dev Reverts if the link is already paid or already cancelled.
    function cancelLink(bytes32 linkId) external {
        PaymentLink storage link = links[linkId];
        if (link.creator == address(0)) revert LinkNotFound();
        if (link.creator != msg.sender) revert NotCreator();
        if (link.paid) revert LinkAlreadyPaid();
        if (link.cancelled) revert LinkCancelled();

        link.cancelled = true;
        emit PaymentLinkCancelled(linkId, msg.sender);
    }

    function payLink(bytes32 linkId) external {
        PaymentLink storage link = links[linkId];
        if (link.creator == address(0)) revert LinkNotFound();
        if (link.paid) revert LinkAlreadyPaid();
        if (link.cancelled) revert LinkCancelled();
        if (link.expiresAt != 0 && block.timestamp > link.expiresAt) revert LinkExpired();

        link.paid = true;
        uint256 feeAmount = (link.amount * feeBps) / 10_000;
        uint256 recipientAmount = link.amount - feeAmount;

        if (!usdc.transferFrom(msg.sender, link.recipient, recipientAmount)) revert TransferFailed();
        if (feeAmount > 0 && !usdc.transferFrom(msg.sender, feeRecipient, feeAmount)) {
            revert TransferFailed();
        }

        emit PaymentCompleted(linkId, msg.sender, link.recipient, link.amount, feeAmount);
    }

    function getLink(bytes32 linkId) external view returns (PaymentLink memory) {
        return links[linkId];
    }

    function setFeeConfig(address feeRecipient_, uint16 feeBps_) external onlyOwner {
        if (feeRecipient_ == address(0)) revert InvalidRecipient();
        if (feeBps_ > 100) revert FeeTooHigh();
        feeRecipient = feeRecipient_;
        feeBps = feeBps_;
        emit FeeConfigUpdated(feeRecipient_, feeBps_);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidRecipient();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
