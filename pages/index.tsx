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
import { makeUsdcPermit, getSignatureParameters } from "../helpers/eip712Helpers";
import { useAccount, useContractRead, useSignTypedData, useContractWrite, useSendTransaction, useProvider, useNetwork } from 'wagmi';
import { usdcABI } from '../helpers/usdcABI';
import { depositABI } from '../helpers/depositABI'
import { ethers, providers } from 'ethers';
import { web3Abi } from '../helpers/web3Abi';
import { RelayProvider } from '@opengsn/provider';
import { gaslessABI } from '../helpers/gaslessABI';

const usdcAddress = "0x98eddadcfde04dc22a0e62119617e74a6bc77313"
const web3Address = "0x95bd8d42f30351685e96c62eddc0d0613bf9a87a"
const contractAddress = "0xca8b49076d1a8039599e24979abf819af784c27a"
const gaslessAddress = "0xdd8cb59289bf7e324a37f74f8abb16d9f133cb2e"
const paymasterAddress = "0x09635F643e140090A9A8Dcd712eD6285858ceBef"

const Home: NextPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount()
  const [usdcAmount, setUsdcAmount] = useState(0);
  const [web3Amount, setWeb3Amount] = useState(0);
  const [usdcBalance, setBalance] = useState(0);
  const [web3Balance, setWeb3Balance] = useState(0);
  const [permit, setPermit] = useState({
    v: "",
    r: "",
    s: "",
    message: {
      owner: "",
      spender: "",
      value: 0,
      nonce: 0,
      deadline: 0
    }
  });
  const [permitStatus, setPermitStatus] = useState(false);
  const [approveStatus, setApproveStatus] = useState(false);
  const { data } = useContractRead({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'nonces',
    args: address
  })

  const usdcBalanceRead = useContractRead({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'balanceOf',
    args: address,
    onSuccess(data) {
      setBalance(usdcBalance => +data / 1000000)
    },
    watch: true,
  })
  const web3BalanceRead = useContractRead({
    addressOrName: web3Address,
    contractInterface: web3Abi,
    functionName: 'balanceOf',
    args: address,
    onSuccess(data) {
      setWeb3Balance(web3Balance => +data / 1000000000000000000)
    },
    watch: true,
  })
  const depositWrite = useContractWrite({
    addressOrName: contractAddress,
    contractInterface: depositABI,
    functionName: 'depositWithPermit',
  })
  const depositApproval = useContractWrite({
    addressOrName: gaslessAddress,
    contractInterface: gaslessABI,
    functionName: 'deposit',
  })
  const usdcMint = useContractWrite({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'mint',
    args: [address, 1000* 10 ** 6]
  })
  const usdcApprove = useContractWrite({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'approve'
  })
  const web3Mint = useContractWrite({
    addressOrName: web3Address,
    contractInterface: web3Abi,
    functionName: 'mint',
    args: [address, 1000* 10 ** 18]
  })
  const { signTypedDataAsync } = useSignTypedData()
  const { sendTransactionAsync } =
    useSendTransaction()
  const fetchBuyAmount = async () => {
    if (usdcAmount === 0) return
    const params = {
      sellToken: 'USDC',
      buyToken: '0xe8e8486228753E01Dbc222dA262Aa706Bd67e601',
      sellAmount: usdcAmount * 10 ** 6, // 1 ETH = 10^18 wei
    }
    const response = await fetch(
      `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
    );
    const quote = await response.json()
    setWeb3Amount(quote.buyAmount);
  }

  const makePermit = async () => {
    let { domain, types, message } = await makeUsdcPermit(address, contractAddress, +data, 10000000, usdcAddress)
    let signature = await signTypedDataAsync({
      domain,
      types,
      value: message
    });
    const { v, r, s } = getSignatureParameters(signature);
    setPermit(permit => ({
      v,
      r,
      s,
      message
    }));
    setPermitStatus(permitStatus => true)
    console.log(permit);
  }

  const makePermitForGasless = async () => {
    let { domain, types, message } = await makeUsdcPermit(address, gaslessAddress, +data, usdcAmount * 10**6, usdcAddress)
    let signature = await signTypedDataAsync({
      domain,
      types,
      value: message
    });
    const { v, r, s } = getSignatureParameters(signature);
    setPermit(permit => ({
      v,
      r,
      s,
      message
    }));
    setPermitStatus(permitStatus => true)
    console.log(permit);
  }

  const getUSDC = async () => {
    const params = {
      sellToken: 'ETH',
      buyToken: 'USDC',
      sellAmount: 1 * 10 ** 18, // 1 ETH = 10^18 wei
    }
    const response = await fetch(
      `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
    );

    console.log(`https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`)

    const quote = await response.json()

    await sendTransactionAsync({
      request: {
        from: quote.from,
        to: quote.to,
        data: quote.data,
        value: ethers.BigNumber.from(quote.value || 0),
        gasPrice: ethers.BigNumber.from(quote.gasPrice),
        gasLimit: ethers.BigNumber.from(quote.gas)
      }
    })
  }

  const approveUSDC = async () => {
    await usdcApprove.write({
      args: [address, usdcAmount]
    })

  }

  const depositWithApproval = async () => {
    await depositApproval.writeAsync({
      args: [address, usdcAmount, web3Amount],
      overrides: {
        gasLimit: 3000
      }
    })
  }

  const depositContract = async () => {
    await depositWrite.writeAsync({
      args: [{
        _tokenContract: usdcAddress,
        _amount: usdcAmount * 10 ** 6,
        _owner: address,
        _spender: contractAddress,
        _value: permit.message.value,
        _deadline: permit.message.deadline,
        _v: permit.v,
        _r: permit.r,
        _s: permit.s,
      }, web3Amount],
    })
  }

  const depositGasless = async () => {
    const gsnProvider = await RelayProvider.newProvider({
      provider: window.ethereum as any,
      config: {
        paymasterAddress,
        loggerConfiguration: {
          logLevel: 'debug'
      }
      }
    }).init()

    let prov = new ethers.providers.Web3Provider(gsnProvider as any as providers.ExternalProvider)
    let signer = prov.getSigner()
    let contract = await new ethers.Contract(gaslessAddress, gaslessABI, signer)
    let transaction = await contract.depositWithPermit({
      _tokenContract: usdcAddress,
      _amount: usdcAmount * 10**6,
      _owner: address,
      _spender: contractAddress,
      _value: permit.message.value,
      _deadline: permit.message.deadline,
      _v: permit.v,
      _r: permit.r,
      _s: permit.s,
    }, web3Amount, {
      gasLimit: 10000
    })
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
          <Box>
            <HStack spacing={12}>
              <Box borderWidth='2px' borderRadius='lg' p='9'> 
              <Container centerContent>
              <Stat>
                <StatLabel>USDC Balance</StatLabel>
                <StatNumber>{usdcBalance}</StatNumber>
              </Stat>
              </Container>
              <Button onClick={() => usdcMint.write()}>Mint USDC</Button>
              </Box>
              <Box borderWidth='2px' borderRadius='lg' p='9'> 
              <Container centerContent>
              <Stat>
                <StatLabel>WEB3 Balance</StatLabel>
                <StatNumber>{(web3Balance).toFixed(3)}</StatNumber>
              </Stat>
              </Container>
              <Button onClick={() => web3Mint.write()}>Mint WEB3</Button>
              </Box>
            </HStack>
          </Box>
          <HStack spacing={12}>
            <Box borderWidth='3px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>
              <FormControl>
                <FormLabel>Swap with Approve</FormLabel>
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
                  onClick={() => approveUSDC()}
                >
                  Approve USDC
                </Button>
                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  onClick={() => depositWithApproval()}
                >
                  Swap
                </Button>
              </Stack>

            </Box>
            <Box borderWidth='3px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>
              <FormControl>
                <FormLabel>Swap with Permit</FormLabel>
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
                  onClick={() => makePermit()}
                >
                  Permit USDC
                </Button>
                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  disabled={!permitStatus}
                  onClick={() => depositContract()}
                >
                  Swap
                </Button>
              </Stack>

            </Box>
            <Box borderWidth='3px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>
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

            </Box>

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
