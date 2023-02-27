import { ChakraProvider, Flex } from "@chakra-ui/react";
import { AppProps } from "next/app";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Flex w='100vw' h='100vh' justifyContent='center' alignItems='center'>
        <Component {...pageProps} />
      </Flex>
    </ChakraProvider>
  )
}

export default App;
