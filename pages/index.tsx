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
  Stack
} from '@chakra-ui/react'
import qs from "qs"


const Home: NextPage = () => {
  const [sellAmount, setSellAmount] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);

  const fetchBuyAmount = async (event: any) => {
    // const params = {
    //   sellToken: 'ETH',    
    //   buyToken: 'DAI',
    //   sellAmount: event.value, // 1 ETH = 10^18 wei
    // }
    // const response = await fetch(
    //   `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
    // );

    console.log(event);
  }

  return (
    <Center h='100vh' w='100vw'>
      <Container centerContent>
        <VStack spacing={8}>
          <Text fontSize='5xl'>
            Welcome to <Link color='#2476FD' href='#'> Mini Swap</Link>!
          </Text>
          <Box></Box>
          <ConnectButton />
          <Box></Box>
          <Box borderWidth='1px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>
            <FormControl>
              <Stack spacing={5}>
                <NumberInput>
                  <NumberInputField id='sellAmount' onChange={fetchBuyAmount} />
                </NumberInput>
                <NumberInput>
                  <NumberInputField id='buyAmount' disabled />
                </NumberInput>
              </Stack>
            </FormControl>
            <Stack spacing={2} align='center'>
              <Button
                mt={4}
                colorScheme='messenger'
                w='100%'
                variant='solid'
              >
                Permit
              </Button>
              <Button
                mt={4}
                colorScheme='messenger'
                w='100%'
                variant='solid'
              >
                Swap
              </Button>
            </Stack>

          </Box>

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
