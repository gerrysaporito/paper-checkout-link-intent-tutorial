// File: /src/pages/api/checkout-link-intent.ts
import { EndpointReturnType } from "@/interface/EndpointReturnType";
import { NextApiRequest, NextApiResponse } from "next";

export interface ICheckoutLinkIntent {
  url: string;
  price: { value: string; currency: string; }
}

/**
 * =======================
 * Endpoint's HTTP Gateway
 * =======================
 * ! No logic should exist here (including AUTH).
 */
export default async (
  req: NextApiRequest,
  res: NextApiResponse<EndpointReturnType<ICheckoutLinkIntent>>,
): Promise<void> => {
  try {
    switch (req.method?.toUpperCase()) {
      case 'POST': {
        const result = await handlePostCheckoutlinkIntent(req);
        return res.status(result.success ? 200 : 400).json(result);
      }
      default: {
        return res.status(405).json({
          success: false,
          data: { error: `Disallowed method. Received '${req.method}'`, }
        });
      }
    }
  } catch (e) {
    return res.status(500).json({ success: false, data: { error: (e as Error).message } });
  }
};

/**
 * Description: Call paper's api to generate a checkout link intent.
 * @method Post
 * 
 * @body title: title of the checkout to render.
 * @body tokenId: the token ID of the NFT you want the checkout to mint.
 * @body price: the cost of a single NFT assocaited with the token ID.
 */
const handlePostCheckoutlinkIntent = async (
  req: NextApiRequest,
): Promise<EndpointReturnType<ICheckoutLinkIntent>> => {
  const { title, tokenId, price } = req.body;

  if (!title || !tokenId || !price) {
    return {
      success: false,
      data: {
        error: 'Bad args in request body',
        info: { title: title ?? '', tokenId: tokenId ?? '', price: price ?? '' }
      }
    }
  }

  // Dynamic One Time Checkout Links Docs: https://docs.withpaper.com/reference/create-dynamic-one-time-checkout-link
  const paperPostRequestBody = {
    // REQUIRED.
    title,
    contractId: process.env.CONTRACT_ID,
    // Mint Method Docs: https://docs.withpaper.com/reference/mintmethod
    mintMethod: {
      name: "claimTo", // This is the name of your minting function on the contract.
      args: { // These are the argument names and associated values you want Paper to send to your contract during the contract call. See docs for details.
        "_to": "$WALLET",
        "_quantity": "$QUANTITY",
        "_tokenId": tokenId
      },
      payment: {
        "value": `${price} * $QUANTITY`, // You have to update the value (ex. 0.001) to be the price of the NFT.
        "currency": "MATIC"
      },
    },
  }

  try {
    const endpoint = `https://withpaper.com/api/2022-08-12/checkout-link-intent`;
    const response = await fetch(endpoint, {
      method: 'post',
      headers: new Headers({
        authorization: `Bearer ${process.env.PAPER_API_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(paperPostRequestBody)
    })

    const result = await response.json()
    if (!response.ok) {
      return {
        success: false, data: {
          error: result?.error ?? 'Paper API returned a bad response', info: result?.info
        }
      };
    }

    return {
      success: true,
      data: {
        url: result.checkoutLinkIntentUrl,
        price: {
          value: result.estimatedPrice?.value ?? '',
          currency: result.estimatedPrice?.currency ?? '',
        }
      }
    }
  } catch (e) {
    return { success: false, data: { error: 'Fetch failed to call the Paper API.' } };
  }
}