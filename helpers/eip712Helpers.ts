import { ethers, Signer } from "ethers";
import { useSignTypedData } from 'wagmi';

const makeMetaTransaction = async (owner: any, verifyingContract: string, nonce: any, functionSignature: any) => {
    const chainId = owner.provider._network.chainId;

    const MetaTransaction = [
        { name: "nonce", type: "uint256" },
        { name: "from", type: "address" },
        { name: "functionSignature", type: "bytes" },
    ];
    // MetaTransaction(uint256 nonce,address from,bytes functionSignature)
    const domain = {
        name: "ERC20Transfer",
        version: "1",
        verifyingContract,
        salt: ethers.utils.hexZeroPad((ethers.BigNumber.from(chainId)).toHexString(), 32)
    };
    const message = {
        nonce,
        from: owner.address,
        functionSignature
    };
    const types = { MetaTransaction };

    let signature = await owner._signTypedData(domain, types, message);
    const { v, r, s } = getSignatureParameters(signature);
    return { v, r, s, message };
}

const makeDaiPermit = async (holder: any, spender: string, nonce: any) => {
    const daiContractAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const expiry = Math.floor(((new Date).getTime() / 1000) + 1000);
    const domain = {
        name: "Dai Stablecoin",
        version: "1",
        chainId: 1,
        verifyingContract: daiContractAddress,
    };
    const Permit = [
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" },
    ];
    const message = {
        holder: holder.address,
        spender,
        nonce,
        expiry,
        allowed: true,
    };
    const types = { Permit };
    let signature = await holder._signTypedData(domain, types, message);
    const { v, r, s } = getSignatureParameters(signature);
    return { v, r, s, message };
}

export const makeUsdcPermit = async (holder: any, spender: string, nonce: any, value: any, usdcAddress: string) => {
    const deadline = Math.floor(((new Date).getTime() / 1000) + 1000);
    const domain = {
        name: "Circle USD Coin",
        version: "1",
        chainId: 31337,
        verifyingContract: usdcAddress,
    };
    const Permit = [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ];
    const message = {
        owner: holder,
        spender,
        value,
        nonce,
        deadline
    };
    const types = { Permit };

    return { domain, types, message };
}


export const getSignatureParameters = (signature: any) => {
    if (!ethers.utils.isHexString(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    let r = signature.slice(0, 66);
    let s = "0x".concat(signature.slice(66, 130));
    let v = "0x".concat(signature.slice(130, 132));
    let q = ethers.BigNumber.from(v).toNumber();
    if (![27, 28].includes(q)) q += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};

export { }
