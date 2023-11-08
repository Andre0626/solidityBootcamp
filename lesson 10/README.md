# Lesson 9 - MyToken.sol and MyNFT.sol

## Quickstart with OpenZeppelin wizard

* Overview about Ethereum Improvement Proposals (EIPs)
* Overview about Application-level standards and conventions (ERCs)
* Explain about OpenZeppelin Contracts library
* (Review) Objects in smart contracts
* Inheritance overview
* Overview about ERC20
* Overview about ERC721
* Using OpenZeppelin wizard

### References

<https://eips.ethereum.org/>

<https://eips.ethereum.org/erc>

<https://docs.openzeppelin.com/contracts/4.x/>

<https://docs.openzeppelin.com/contracts/4.x/erc20>

<https://docs.openzeppelin.com/contracts/4.x/erc721>

<https://docs.soliditylang.org/en/latest/contracts.html#inheritance>

<https://solidity-by-example.org/inheritance/>

<https://docs.openzeppelin.com/contracts/5.x/wizard> (caution with version differences)

<https://docs.openzeppelin.com/contracts/5.x/backwards-compatibility>

### Installation for V4

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

### Plain ERC20 Code reference

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {}
}
```

### Plain ERC721 Code reference

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    constructor() ERC721("MyNFT", "MNF") {}
}
```

## Contract structure

* Syntax about inheritance
* Overview about OpenZeppelin features for ERC20 and ERC721
* Overview about OpenZeppelin features for Access Control
* Overview about OpenZeppelin utilities and components
* Adding minting feature
* Adding RBAC feature

### References

<https://www.npmjs.com/package/@openzeppelin/contracts>

<https://docs.openzeppelin.com/contracts/4.x/extending-contracts>

<https://docs.openzeppelin.com/contracts/4.x/access-control>

## Operating the contracts with scripts

* (Review) Script operation
* (Review) Accounts and funding
* (Review) Providers
* (Review) Async operations
* (Review) Running scripts on test environment
* (Review) Contract factory and json imports
* (Review) Transaction receipts and async complexities when running onchain

### Code reference

* Script structure

```typescript
import { ethers } from "hardhat";

async function main() {
    // TODO
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

* Deploying with hardhat helper functions

```typescript
const accounts = await ethers.getSigners();
const tokenContractFactory = await ethers.getContractFactory("MyToken");
const tokenContract = await tokenContractFactory.deploy();
await tokenContract.waitForDeployment();
const tokenContractAddress = await tokenContract.getAddress();
console.log(`Contract deployed at ${tokenContractAddress}`);
```

or

* Deploying with typechain

```typescript
const accounts = await ethers.getSigners();
const tokenContractFactory = new MyToken__factory(accounts[0]);
const tokenContract = await tokenContractFactory.deploy();
await tokenContract.waitForDeployment();
const tokenContractAddress = await tokenContract.getAddress();
console.log(`Contract deployed at ${tokenContractAddress}`);
```

* Fetching total supply

```typescript
const initialSupply = await tokenContract.totalSupply();
console.log(`The initial supply of this token is ${initialSupply.toString()} decimals units`);
```

* Implementing initial supply

```solidity
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 10 * 10 ** decimals());
    }
```

* Implementing RBAC for supply control

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("MyToken", "MTK") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
```

* Handling roles

```typescript
const code = await tokenContract.MINTER_ROLE();
const roleTx = await tokenContract.grantRole(code, accounts[2].address);
await roleTx.wait();
```

* Minting tokens without role fails

```typescript
const mintTx = await tokenContract.connect(accounts[1]).mint(accounts[0].address, 2);
await mintTx.wait();
```

* Minting tokens with the proper Minter Role

```typescript
const mintTx = await tokenContract.connect(accounts[2]).mint(accounts[0].address, 2);
await mintTx.wait();
```

* Fetching token data with `Promise.all()`

```typescript
const [name, symbol, decimals, totalSupply] = await Promise.all([
  tokenContract.name(),
  tokenContract.symbol(),
  tokenContract.decimals(),
  tokenContract.totalSupply(),
]);
console.log({ name, symbol, decimals, totalSupply });
```

* Sending a transaction

```typescript
const tx = await tokenContract.transfer(accounts[1].address, 1);
await tx.wait();
```

* Viewing balances

```typescript
const myBalance = await tokenContract.balanceOf(accounts[0].address);
console.log(`My Balance is ${myBalance.toString()} decimals units`);
const otherBalance = await tokenContract.balanceOf(accounts[1].address);
console.log(
  `The Balance of Acc1 is ${otherBalance.toString()} decimals units`
);
```

* Viewing converted balances

```typescript
const myBalance = await tokenContract.balanceOf(accounts[0].address);
console.log(`My Balance is ${ethers.formatUnits(myBalance)} ${symbol} units`);
const otherBalance = await tokenContract.balanceOf(accounts[1].address);
console.log(
  `The Balance of Acc1 is ${ethers.formatUnits(otherBalance)} ${symbol} units`
);
```

* Viewing converted balances with decimals conversion

```solidity
function decimals() public pure override returns (uint8) {
    return 8;
}
```

```typescript
const myBalance = await tokenContract.balanceOf(accounts[0].address);
console.log(`My Balance is ${ethers.formatUnits(myBalance, decimals)} ${symbol} units`);
const otherBalance = await tokenContract.balanceOf(accounts[1].address);
console.log(
  `The Balance of Acc1 is ${ethers.formatUnits(otherBalance, decimals)} ${symbol} units`
);
```

## Events with solidity

* Event syntax
* Event storage
* Event indexing
* Topics and filters
* Transaction structure
* State changes with events

### References

<https://docs.soliditylang.org/en/latest/contracts.html#events>

<https://docs.ethers.org/v6/api/contract/#ContractEventName>

<https://docs.ethers.org/v6/api/contract/#BaseContract-on>

<https://docs.ethers.org/v6/api/contract/#BaseContract-queryFilter>

### Code Reference

* Writing a test to trigger the `Transfer` event

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Basic tests for understanding ERC20", async () => {
  async function deployContracts() {
    const accounts = await ethers.getSigners();
    const MyERC20ContractFactory = await ethers.getContractFactory(
      "MyERC20Token"
    );
    const MyERC20Contract = await MyERC20ContractFactory.deploy();
    await MyERC20Contract.waitForDeployment();
    return { accounts, MyERC20Contract };
  }

  it("should have zero total supply at deployment", async () => {
    const { MyERC20Contract } = await loadFixture(deployContracts);
    const totalSupplyBN = await MyERC20Contract.totalSupply();
    const decimals = await MyERC20Contract.decimals();
    const totalSupply = parseFloat(ethers.formatUnits(totalSupplyBN, decimals));
    expect(totalSupply).to.eq(0);
  });

  it("triggers the Transfer event with the address of the sender when sending transactions", async function () {
    const { MyERC20Contract, accounts } = await loadFixture(deployContracts);
    const mintTx = await MyERC20Contract.mint(accounts[0].address, 2);
    await mintTx.wait();
    const senderAddress = accounts[0].address;
    const receiverAddress = accounts[1].address;
    await expect(MyERC20Contract.transfer(receiverAddress, 1))
      .to.emit(MyERC20Contract, "Transfer")
      .withArgs(senderAddress, receiverAddress, 1);
  });
});
```

---

## Homework

* Create Github Issues with your questions about this lesson
* Read the references
