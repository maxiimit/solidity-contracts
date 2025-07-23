// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract AucEngine {
  address public owner;
  uint constant DURATION = 2 days;
  uint constant FEE = 10; // 10% fee

  struct Auction {
    address payable seller;
    uint startPrice;
    uint finalPrice;
    uint startAt;
    uint endsAt;
    uint discountRate;
    string item;
    bool stopped;
  }

  Auction[] public auctions;

  event AuctionCreated(uint indexed auctionId, string item, uint startPrice, uint duration);
  event AuctionEnded(uint indexed auctionId, uint finalPrice, address winnder);

  constructor() {
    owner = msg.sender;
  }

  function createAuction(uint _startPrice, uint _discountRate, string memory _item, uint _duration) external {
    uint duration = _duration != 0 ? _duration : DURATION;

    require(_startPrice >= _discountRate * duration, "Start price must be greater than or equal to discount rate times duration");

    Auction memory newAuction = Auction({
      seller: payable(msg.sender),
      startPrice: _startPrice,
      finalPrice: _startPrice,
      discountRate: _discountRate,
      startAt: block.timestamp,
      endsAt: block.timestamp + duration,
      item: _item,
      stopped: false
    });

    auctions.push(newAuction);

    emit AuctionCreated(auctions.length - 1, _item, _startPrice, duration);
  }

  function getPriceFor(uint index) public view returns (uint) {
    Auction memory cAuction = auctions[index];

    require(!cAuction.stopped, 'Auction were stopped!');

    uint elapsed = block.timestamp - cAuction.startAt;
    uint discount = cAuction.discountRate * elapsed; 


    return cAuction.startPrice - discount;
  }

  function buy(uint index) external payable {
    Auction storage cAuction = auctions[index];

    require(!cAuction.stopped, 'Auction were stopped!');
    require(block.timestamp < cAuction.endsAt, 'Auction were ended!');

    uint cPrice = getPriceFor(index);

    require(msg.value >= cPrice, 'Not enough funds!');

    cAuction.stopped = true;
    cAuction.finalPrice = cPrice;

    uint refund = msg.value - cPrice;

    if (refund > 0) {
      payable(msg.sender).transfer(refund);
    }

    cAuction.seller.transfer(
      cPrice - ((cPrice * FEE) / 100)
    );

    emit AuctionEnded(index, cPrice, msg.sender);
  }
} 