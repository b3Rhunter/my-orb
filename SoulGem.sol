// SPDX-License-Identifier: MIT

/*
 _____             _ _____                
/  ___|           | |  __ \               
\ `--.  ___  _   _| | |  \/ ___ _ __ ___  
 `--. \/ _ \| | | | | | __ / _ \ '_ ` _ \ 
/\__/ / (_) | |_| | | |_\ \  __/ | | | | |
\____/ \___/ \__,_|_|\____/\___|_| |_| |_|
                                          
                                          
*/

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract SoulGem is ERC721Enumerable, Ownable {

    uint256 public constant FEE_DENOMINATOR = 100_00;
    uint256 public constant ORB_ID = 1;

    address public beneficiary;

    address public keeper;

    uint256 public auctionEndTime;
    address public leadingBidder;
    uint256 public leadingBid;
    uint256 public price;
    uint256 public taxStartTimestamp;

    bool private hasKeeperAsked = false;
    bool public auctionOngoing;

    struct ChatMessage {
        address sender;
        string text;
    }

    ChatMessage[] public chatHistory;

    constructor() ERC721("Soul Gem", "SOUL") {
        beneficiary = msg.sender;
        _mint(msg.sender, ORB_ID);
        keeper = msg.sender;
        startAuction();
    }

function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
{
    require(_exists(tokenId), "URI query for nonexistent token");
    
    string memory fillColor = isAuctionOngoing() ? "#37C6F4" : "#f43770";

    string memory svg = string(
        abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" ',
            'preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            '<style type="text/css">',
            '.st0{opacity:0.34;fill:url(#SVGID_1);}',
            '.st1{fill:', fillColor, ';}', 
            '.st2{fill:url(#SVGID);}',
            '</style>',
            '<rect width="350" height="350"/>',
            '<radialGradient id="SVGID_1" cx="175" cy="315.95" r="128.5099" gradientTransform="matrix(1 0 0 0.2223 0 245.7022)" gradientUnits="userSpaceOnUse">',
            '<stop  offset="0" style="stop-color:', fillColor, '"/>',
            '<stop  offset="1" style="stop-color:#000000"/>',
            '</radialGradient>',
            '<ellipse class="st0" cx="175" cy="315.95" rx="132.95" ry="33.75"/>',
            '<circle class="st1" cx="176.17" cy="145.32" r="114.91"/>',
            '<radialGradient id="SVGID" cx="155.987" cy="123.6719" r="95.662" fx="97.6318" fy="106.8382" gradientUnits="userSpaceOnUse">',
            '<stop  offset="0" style="stop-color:#FFFFFF;stop-opacity:0.5"/>',
            '<stop  offset="1" style="stop-color:#000000;stop-opacity:0"/>',
            '</radialGradient>',
            '<circle style="fill:url(#SVGID);" cx="168.6" cy="151" r="145.8"/>',
            '</svg>'
        )
    );

    string memory svgBase64 = Base64.encode(bytes(svg));
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "Soul Gem',
                    '", "description": "A mysterious soul gem", "image": "data:image/svg+xml;base64,',
                    svgBase64, '"}'
                )
            )
        )
    );

    return string(abi.encodePacked("data:application/json;base64,", json));
}

    function startAuction() private {
        auctionEndTime = block.timestamp + 3 hours;
        leadingBidder = address(0);
        leadingBid = 0;
        taxStartTimestamp = block.timestamp;
    }

    function bid() external payable {
        require(block.timestamp < auctionEndTime, "Auction is over");
        require(msg.value > leadingBid, "Bid is too low");

        if (leadingBidder != address(0)) {
            payable(leadingBidder).transfer(leadingBid);
        }

        leadingBidder = msg.sender;
        leadingBid = msg.value;
    }

    function finalizeAuction() external {
        require(block.timestamp > auctionEndTime, "Auction is still ongoing");

        if (leadingBidder == address(0)) {
            _transfer(keeper, beneficiary, ORB_ID);
            keeper = beneficiary;
        } else {
            require(
                msg.sender == leadingBidder,
                "Only the leading bidder can finalize"
            );

            uint256 timeHeld = block.timestamp - taxStartTimestamp;
            uint256 maxTaxDuration = 7 days;
            uint256 effectiveTaxPercentage;

            if (timeHeld >= maxTaxDuration) {
                effectiveTaxPercentage = FEE_DENOMINATOR;
            } else {
                effectiveTaxPercentage =
                    (timeHeld * (FEE_DENOMINATOR - 100)) /
                    maxTaxDuration +
                    100;
            }

            uint256 auctionBeneficiaryRoyalty = (leadingBid *
                effectiveTaxPercentage) / FEE_DENOMINATOR;
            uint256 keeperShare = leadingBid - auctionBeneficiaryRoyalty;

            require(
                address(this).balance >= auctionBeneficiaryRoyalty,
                "Insufficient contract balance"
            );

            payable(beneficiary).transfer(auctionBeneficiaryRoyalty);
            payable(keeper).transfer(keeperShare);

            _transfer(keeper, leadingBidder, ORB_ID);
            keeper = leadingBidder;

            price = leadingBid;
        }

        auctionEndTime = 0;
        hasKeeperAsked = false;
    }

    function _splitProceeds(
        uint256 proceeds,
        address receiver,
        uint256 royalty
    ) internal {
        uint256 beneficiaryRoyalty = (proceeds * royalty) / FEE_DENOMINATOR;
        uint256 receiverShare = proceeds - beneficiaryRoyalty;

        payable(beneficiary).transfer(beneficiaryRoyalty);
        payable(receiver).transfer(receiverShare);
    }

    function question(string memory questionText) external {
        require(msg.sender == keeper, "Only Keeper can ask a question");

        uint256 timeHeld = block.timestamp - taxStartTimestamp;
        if (timeHeld < 7 days) {
            taxStartTimestamp = block.timestamp - 7 days + timeHeld;
        }

        chatHistory.push(ChatMessage({sender: msg.sender, text: questionText}));
        hasKeeperAsked = true;
    }

    function answer(string memory answerText) external {
        require(msg.sender == beneficiary, "Only the beneficiary can answer");
        require(hasKeeperAsked, "Answer can only be given after a question");

        chatHistory.push(ChatMessage({sender: msg.sender, text: answerText}));

        startAuction();
    }

    function getChatHistoryLength() external view returns (uint256) {
        return chatHistory.length;
    }

    function getChatMessage(uint256 index)
        external
        view
        returns (address, string memory)
    {
        require(index < chatHistory.length, "Index out of bounds");
        return (chatHistory[index].sender, chatHistory[index].text);
    }

    function isAuctionOngoing() public view returns (bool) {
        return block.timestamp < auctionEndTime;
    }
}
