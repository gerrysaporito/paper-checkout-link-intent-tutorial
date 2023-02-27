import { EndpointReturnType } from "@/interface/EndpointReturnType";
import { ICheckoutLinkIntent } from "@/pages/api/checkout-link-intent"
import { useEffect, useState } from "react"
import { renderPaperCheckoutLink } from "@paperxyz/js-client-sdk"
import {
  Button,
  Flex,
  Image,
  Text,
  Spacer,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

interface IPaperCheckoutButton {
  title: string;
  tokenId: string;
  price: string;
  isExternal?: boolean
}

export const PaperCheckoutButton: React.FC<IPaperCheckoutButton> = ({
  title,
  tokenId,
  price,
  isExternal
}) => {
  const router = useRouter();
  const [paperCheckoutIntent, setPaperCheckoutIntent] = useState<ICheckoutLinkIntent | null>(null)

  // Fetch the Paper checkout intent on component load.
  useEffect(() => {
    (async () => {
      if (!router.isReady) return;

      let error = ''
      try {
        const endpoint = `/api/checkout-link-intent`;
        const response = await fetch(endpoint, {
          method: 'post',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ title, tokenId, price, })
        })
        const result = await response.json() as EndpointReturnType<ICheckoutLinkIntent>

        if (!response.ok) {
          setPaperCheckoutIntent(null)
          error = `Failed to make request to the api.`;
          alert(error);
        } else if (!result.success) {
          setPaperCheckoutIntent(null)
          error = `Something went wrong when generating the checkout link. ${result.data.error}`;
          alert(error);
        } else {
          setPaperCheckoutIntent(result.data);
        }
      } catch (e) {
        setPaperCheckoutIntent(null)
        error = 'Something went wrong'
        console.log(e)
        alert(error)
      }

      if (error) console.error(error)
    })()
  }, [price, router.isReady, title, tokenId]);

  // Wait until the component has been loaded.
  if (!router.isReady) {
    return null;
  }

  // The contents of the button shown.
  const Display = (
    <Flex
      alignItems='center'
      w='full'
    >
      <Image
        h='5'
        src='/icons/paper-logo-icon.svg'
        alt='Paper Wallet'
        mr='5'
      />
      <Text>Checkout</Text>
      <Spacer />
      <Text pl='24'>
        ${paperCheckoutIntent?.price?.value} {paperCheckoutIntent?.price?.currency}
      </Text>
    </Flex>
  )

  // Uniform styling between buttons.
  const styleProps = {
    backgroundColor: 'gray',
    paddingX: '5',
    paddingY: '7',
  }

  // Returns a button that opens up the checkout in a new tab.
  if (isExternal) {
    return (
      <Button as="a"
        target="_blank"
        href={paperCheckoutIntent?.url}
        rel="noopener noreferrer"
        {...styleProps}
      >
        {Display}
      </Button>
    )
  }

  // Returns a button that opens up the checkout in drawer on the screen.
  return (
    <Button
      onClick={() => renderPaperCheckoutLink({ checkoutLinkUrl: paperCheckoutIntent?.url ?? '' })}
      {...styleProps}
    >
      {Display}
    </Button >
  )
}