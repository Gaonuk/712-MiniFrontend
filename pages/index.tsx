import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
// import styles from '../styles/Home.module.css';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
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

const Home: NextPage = () => {
  return (
    <Center h='100vh' w='100vw'>
      <Container centerContent>
        <VStack spacing={5}>
          <ConnectButton />
          <Text>
            Welcome to <Link color='#2476FD' href='#'> Mini Frontend</Link>!
          </Text>
          <Box borderWidth='1px' borderRadius='lg' maxW='sm' overflow='hidden' p='9'>
            <FormControl>
              <FormLabel htmlFor='amount' alignContent={'center'}>Swap With Permit</FormLabel>
              <Stack spacing={5}>
              <NumberInput>
                <NumberInputField id='amount' />
              </NumberInput>
              <NumberInput>
                <NumberInputField id='amount' />
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
