// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IMyToken {
    
}

interface IMyNFT {

}

contract TokenSale {
    uint256 public ratio;
    uint256 public price;
    address paymentToken;
    address nftContract;

    constructor(uint256 _ratio, uint256 _price, address _paymentToken, address _nftContract) {
        ratio = _ratio;
        price = _price;
        paymentToken = _paymentToken;
        nftContract = _nftContract;
    }

        function buyTokens() external payable {
         paymentToken.mint(msg.sender, msg.value * ratio);
    }
}