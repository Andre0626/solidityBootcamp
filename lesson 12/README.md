# Lesson 12 - Tokenized Votes

## The ERC20Votes ERC20 extension

* ERC20Votes properties
* Snapshots
* Creating snapshots when supply changes
* Using snapshots
* Self delegation
* Contract overall operation

### References

<https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Votes>

<https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Snapshot>

<https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit>

<https://docs.openzeppelin.com/contracts/5.x/backwards-compatibility>

### Installation for V4 (review)

```bash
npm install --save-dev @openzeppelin/contracts@4 
```

or

```bash
bun add -d @openzeppelin/contracts@4 
```

or

```bash
yarn add --dev @openzeppelin/contracts@4 
```

* ERC20Votes using OpenZeppelin V4

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyToken is ERC20, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
```

## ERC20Votes and Ballot.sol

* (Review) Testing features with scripts
* Mapping scenarios
* Contracts structure
* Using snapshots to account for vote power in ballot

### Code References for ERC20Votes

* Deploying contracts to HRE using Ethers

```typescript
const [deployer, acc1, acc2] = await ethers.getSigners();
const contractFactory = new MyToken__factory(deployer);
const contract = await contractFactory.deploy();
await contract.waitForDeployment();
const contractAddress = await contract.getAddress();
console.log(`Token contract deployed at ${contractAddress}\n`);
```

* Minting some tokens

```typescript
const mintTx = await contract.mint(acc1.address, MINT_VALUE);
await mintTx.wait();
console.log(
  `Minted ${MINT_VALUE.toString()} decimal units to account ${acc1.address}\n`
);
const balanceBN = await contract.balanceOf(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${balanceBN.toString()} decimal units of MyToken\n`
);
```

* Checking vote power

```typescript
const votes = await contract.getVotes(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${votes.toString()} units of voting power before self delegating\n`
);

```

* Self delegation transaction

```typescript
const delegateTx = await contract.connect(acc1).delegate(acc1.address);
await delegateTx.wait();
const votesAfter = await contract.getVotes(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${votesAfter.toString()} units of voting power after self delegating\n`
);
```

* Experimenting a token transfer

```typescript
const transferTx = await contract
  .connect(acc1)
  .transfer(acc2.address, MINT_VALUE / 2n);
await transferTx.wait();
const votes1AfterTransfer = await contract.getVotes(acc1.address);
console.log(
  `Account ${
    acc1.address
  } has ${votes1AfterTransfer.toString()} units of voting power after transferring\n`
);
const votes2AfterTransfer = await contract.getVotes(acc2.address);
console.log(
  `Account ${
    acc2.address
  } has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`
);
```

* Checking past votes

```typescript
const lastBlock = await ethers.provider.getBlock("latest");
const lastBlockNumber = lastBlock?.number ?? 0;
for (let index = lastBlockNumber - 1; index > 0; index--) {
  const pastVotes = await contract.getPastVotes(
    acc1.address,
    index
  );
  console.log(
    `Account ${
      acc1.address
    } had ${pastVotes.toString()} units of voting power at block ${index}\n`
  );
}
```

* Example deployment script

```typescript
import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import 'dotenv/config';
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider)
  const contractFactory = new MyToken__factory(wallet);
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Token contract deployed at ${contractAddress}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Code References for Tokenized Ballot

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IMyToken {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    IMyToken public tokenContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

    constructor(
        bytes32[] memory _proposalNames,
        address _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IMyToken(_tokenContract);
        targetBlockNumber = _targetBlockNumber;
        // TODO: Validate if targetBlockNumber is in the past
        for (uint i = 0; i < _proposalNames.length; i++) {
            proposals.push(Proposal({name: _proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint256 proposal, uint256 amount) external {
        // TODO: Implement vote function
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
```

---

## Homework

* Create Github Issues with your questions about this lesson
* Read the references

---

## Weekend Project

This is a group activity for at least 3 students:

* Complete the contracts together
* Develop and run scripts for “TokenizedBallot.sol” within your group to give voting tokens, delegating voting power, casting votes, checking vote power and querying results
* Write a report with each function execution and the transaction hash, if successful, or the revert reason, if failed
* Share your code in a github repo in the submission form
