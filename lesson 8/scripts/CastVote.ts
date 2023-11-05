import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";

import * as dotenv from 'dotenv';
dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

async function main() {
    //receive parameters
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1)
        throw new Error("Parameters not provided");
    // const contractAddress = parameters[0];
    const proposalNumber = parameters[0];
    console.log('parameters', parameters);
    //configure provider
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const lastBlock = await provider.getBlock('latest');
    console.log(`Last block number: ${lastBlock?.number}`);
    const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
    const lastBlockDate = new Date(lastBlockTimestamp * 1000);
    console.log(`Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`);

    //configure wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    console.log(`Using address ${wallet.address}`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${balance} ETH`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    //attach contract
    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(CONTRACT_ADDRESS) as Ballot;

    const tx = await ballotContract.vote(proposalNumber)
    const receipt = await tx.wait();
    console.log(`Transaction completed ${receipt?.hash}`)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});