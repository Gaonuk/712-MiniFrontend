import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { useState } from 'react';
import Head from 'next/head';
// import styles from '../styles/Home.module.css';
import {
  FormControl,
  NumberInput,
  NumberInputField,
  Container,
  Text,
  Link,
  Center,
  VStack,
  Box,
  Button,
  Stack,
  HStack,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputRightAddon
} from '@chakra-ui/react'
import qs from "qs"
import { makeUsdcPermitMainnet, makeUsdcPermitPolygon, getSignatureParameters } from "../helpers/eip712Helpers";
import { useAccount, useContractRead, useSignTypedData, useContractWrite, useSendTransaction, useProvider, useNetwork, chainId } from 'wagmi';
import { usdcABI } from '../helpers/usdcABI';
import { depositABI } from '../helpers/depositABI'
import { ethers, providers } from 'ethers';
import { web3Abi } from '../helpers/web3Abi';
import { RelayProvider } from '@opengsn/provider';
import { getPermitSignature } from '../helpers/permitHelpers';
import { sign } from 'crypto';
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';
import { positionABI } from '../helpers/nonFungiblePositionAbi';

const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const web3Address = "0xBcD2C5C78000504EFBC1cE6489dfcaC71835406A"
const contractAddress = "0x2b15063a6f8a11d18404c801f295b1d19dcc8574"

const Home: NextPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount()
  
  const makeMulticall = async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)

    // you can use any ethers provider context here this example is
    // just shows passing in a default provider, ethers hold providers in
    // other context like wallet, signer etc all can be passed in as well.
    const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

    const contractCallContext: ContractCallContext[] = [
      {
        reference: 'NonfungiblePositionManager',
        contractAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        abi: positionABI,
        calls: [{
          reference: 'decreaseLiquidityCall', methodName: 'decreaseLiquidity', methodParameters: [{
            tokenId: "271577",
            liquidity: "",
            amount0Min: "",
            amount1Min: "",
            deadline: "",
          }]
        }, {
          reference: 'increaseLiquidityCall', methodName: 'increaseLiquidity', methodParameters: [{
            tokenId: "271577",
            amount0Desired: "",
            amount1Desired: "",
            amount0Min: "",
            amount1Min: "",
            deadline: "",
          }]
        }]
      }
    ];

    const results: ContractCallResults = await multicall.call(contractCallContext);
    console.log(results)
  }



  return (
    <Center h='100vh' w='100vw'>
      <Container maxWidth='100vw'>
        <VStack spacing={8}>
          <Text fontSize='5xl'>
            Welcome to <Link color='#2476FD' href='https://www.archfinance.io/'>Experimental Arch</Link>!
          </Text>
          <Box></Box>
          <ConnectButton />
          <HStack spacing={12}>
 
            <Box borderWidth='3px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>

                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  onClick={() => makeMulticall()}
                >
                  make a multicall
                </Button>
            </Box>
            {/* <Box borderWidth='3px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>
              <FormControl>
                <FormLabel>Swap with Permit Gasless</FormLabel>
                <Stack spacing={5}>
                  <InputGroup>
                    <NumberInput onBlur={fetchBuyAmount} value={usdcAmount} onChange={(v) => setUsdcAmount(+v)}>
                      <NumberInputField id='sellAmount' />
                    </NumberInput>
                    <InputRightAddon children='USDC' />
                  </InputGroup>

                  <InputGroup>
                    <NumberInput value={web3Amount / 10 ** 18} >
                      <NumberInputField id='buyAmount' disabled />
                    </NumberInput>
                    <InputRightAddon children='WEB3' />
                  </InputGroup>
                </Stack>
              </FormControl>
              <Stack spacing={2} align='center'>
                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  onClick={() => makePermitForGasless()}
                >
                  Permit USDC
                </Button>
                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  disabled={!permitStatus}
                  onClick={() => depositGasless()}
                >
                  Swap
                </Button>
              </Stack>

            </Box> */}

          </HStack>
          <Box>
            <Link href="https://twitter.com/GaonukRodrigo" target="_blank" rel="noopener noreferrer">
              Made with ❤️ by your 🦆
            </Link>
          </Box>
        </VStack>

      </Container>
    </Center>
  );
};

export default Home;
