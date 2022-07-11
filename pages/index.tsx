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

const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const web3Address = "0xBcD2C5C78000504EFBC1cE6489dfcaC71835406A"
const contractAddress = "0x0e075cB6f980203F8e930a0B527CDbE07F303eAD"

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
  const [quoteData, setQuoteData] = useState({
    spender: "",
    swapTarget: "",
    swapCallData: ""
  })
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

  const swapWithPermit = useContractWrite({
    addressOrName: contractAddress,
    contractInterface: depositABI,
    functionName: 'swapWithPermit',
  })

  const swapWithApproval = useContractWrite({
    addressOrName: contractAddress,
    contractInterface: depositABI,
    functionName: 'swapNormal',
  })

  const usdcApprove = useContractWrite({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'approve'
  })

  const usdcPermit = useContractWrite({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'permit'
  })

  const usdcAllowance = useContractRead({
    addressOrName: usdcAddress,
    contractInterface: usdcABI,
    functionName: 'allowance',
    args: [address, contractAddress]
  })

  const { signTypedDataAsync } = useSignTypedData()
  const { sendTransactionAsync } =
    useSendTransaction()
  const fetchBuyAmount = async () => {
    if (usdcAmount === 0) return
    const params = {
      sellToken: 'USDC',
      buyToken: web3Address,
      sellAmount: usdcAmount * 10 ** 6, // 1 ETH = 10^18 wei
    }
    const response = await fetch(
      `https://polygon.api.0x.org/swap/v1/quote?${qs.stringify(params)}`
    );
    const quote = await response.json()
    setWeb3Amount(quote.buyAmount);
    setQuoteData(quoteData => ({
      spender: quote.allowanceTarget,
      swapTarget: quote.to,
      swapCallData: quote.data,
    }))
  }

  const makePermit = async () => {
    let { domain, types, message } = await makeUsdcPermit(address, contractAddress, +data, usdcAmount * 10 ** 6, usdcAddress)
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
  }

  const approveUSDC = async () => {
    await usdcApprove.write({
      args: [contractAddress, usdcAmount * 10 ** 6]
    })

  }

  const permitUsdc = async () => {
    let web3 = new ethers.providers.Web3Provider(window.ethereum)
    let signer = web3.getSigner()
    let contract = new ethers.Contract(usdcAddress, usdcABI, signer)
    console.log(permit)
    let result = await contract.permit(address, contractAddress, usdcAmount * 10 ** 6, permit.message.deadline, permit.v, permit.r, permit.s, {
      gasLimit: 21000
    });
  }

  const checkAllowance = async () => {
    let web3 = new ethers.providers.Web3Provider(window.ethereum)
    let signer = web3.getSigner()
    let contract = new ethers.Contract(usdcAddress, usdcABI, signer)
    let result = await contract.allowance(address, contractAddress);
    console.log(+result)
  }


  const approvalSwap = async () => {
    await swapWithApproval.writeAsync({
      args: [usdcAddress, usdcAmount * 10 ** 6, {
        sellToken: usdcAddress,
        buyToken: web3Address,
        spender: quoteData.spender,
        swapTarget: quoteData.swapTarget,
        swapCallData: quoteData.swapCallData,
      }]
    })
  }

  const permitSwap = async () => {
    await swapWithPermit.writeAsync({
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
      }, {
        sellToken: usdcAddress,
        buyToken: web3Address,
        spender: quoteData.spender,
        swapTarget: quoteData.swapTarget,
        swapCallData: quoteData.swapCallData,
      }],
      overrides: {
        gasLimit: 21000
      }
    })
  }

  // const depositGasless = async () => {
  //   const gsnProvider = await RelayProvider.newProvider({
  //     provider: window.ethereum as any,
  //     config: {
  //       paymasterAddress,
  //       loggerConfiguration: {
  //         logLevel: 'debug'
  //     }
  //     }
  //   }).init()

  //   let prov = new ethers.providers.Web3Provider(gsnProvider as any as providers.ExternalProvider)
  //   let signer = prov.getSigner()
  //   let contract = await new ethers.Contract(gaslessAddress, gaslessABI, signer)
  //   let transaction = await contract.swapWithPermit({
  //     _tokenContract: usdcAddress,
  //     _amount: usdcAmount * 10**6,
  //     _owner: address,
  //     _spender: contractAddress,
  //     _value: permit.message.value,
  //     _deadline: permit.message.deadline,
  //     _v: permit.v,
  //     _r: permit.r,
  //     _s: permit.s,
  //   }, web3Amount, {
  //     gasLimit: 10000
  //   })
  // }


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
                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  onClick={() => checkAllowance()}
                >
                  Check Allowance
                </Button>
              </Box>
              <Box borderWidth='2px' borderRadius='lg' p='9'>
                <Container centerContent>
                  <Stat>
                    <StatLabel>WEB3 Balance</StatLabel>
                    <StatNumber>{(web3Balance).toFixed(3)}</StatNumber>
                  </Stat>
                </Container>
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
                  onClick={() => approvalSwap()}
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
                <HStack marginTop={4} width="100%">
                  <Button
                    colorScheme='messenger'
                    variant='solid'
                    w="100%"
                    onClick={() => makePermit()}
                  >
                    Sign Permit
                  </Button>
                  <Button
                    colorScheme='messenger'
                    variant='solid'
                    w="100%"
                    onClick={() => permitUsdc()}
                  >
                    Send Permit
                  </Button>
                </HStack>

                <Button
                  mt={4}
                  colorScheme='messenger'
                  w='100%'
                  variant='solid'
                  disabled={!permitStatus}
                  onClick={() => permitSwap()}
                >
                  Swap
                </Button>
              </Stack>

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
