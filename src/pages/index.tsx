import { PaperCheckoutButton } from "@/components/PaperCheckoutButton";
import { Flex, Heading, SimpleGrid } from "@chakra-ui/react"

const Home: React.FC = () => {
  return (
    <SimpleGrid gap='12' w='400px'>
      {/* Drawer Component */}
      <SimpleGrid gap='6'>
        <Heading size='lg'>Drawer Button</Heading>
        <PaperCheckoutButton tokenId="0" price="0.001" title="Checkout Demo" />
      </SimpleGrid>

      {/* New Tab Component */}
      <SimpleGrid gap='6'>
        <Heading size='lg'>External Tab</Heading>
        <PaperCheckoutButton tokenId="0" price="0.001" title="Checkout Demo" isExternal />
      </SimpleGrid>
    </SimpleGrid>
  )
}
export default Home;