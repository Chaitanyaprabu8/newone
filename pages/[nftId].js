import {useRouter} from 'next/router'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Link from 'next/link'
import {
  nftaddress, nftmarketaddress
} from '../../config'

import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/Market.sol/NFTMarket.json'

let rpcEndpoint = 'https://kovan.infura.io/v3/8c661edd6d764e1e95fd0318054d331c'

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL
}

export default function Home() {
    const router = useRouter();
    const {nftId} = router.query;
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [formInput, updateFormInput] = useState({ bidprice: '' })
    useEffect(() => {
      loadNFTs()
    }, [])
    async function loadNFTs() { 
        
           
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const data = await marketContract.fetchMarketItems()
        //console.log(data);
        const items = await Promise.all(data.map(async i => {
            console.log(nftId);
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let bidprice = ethers.utils.formatUnits(i.bidprice.toString(), "ether")
          let item = {
            price,
            itemId: i.itemId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            bidprice,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          }
          return item
          
        }))
        console.log(items)
        setNfts(items)
        setLoadingState('loaded') 
      }
      async function buyNft(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const bidprice = ethers.utils.parseUnits(formInput.bidprice, 'ether')
        console.log(bidprice);
        const transaction = await contract.createMarketSale(nftaddress, nft.itemId, bidprice, {
          value: price
        })
        await transaction.wait()
        loadNFTs()
      }
      if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No Projects in the marketplace</h1>)
      return (
        <div className="flex justify-center">
          <div className="px-4" style={{ maxWidth: '1600px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 pt-4">
              {
                nfts.map((nft, i) => (
                  nft.itemId==nftId &&
                  <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <object data={nft.image} type="application/pdf" width="1100" height="600">
            alt : <a href={nft.image}>only pdf files allowed</a>
                </object>
                    <div className="p-4">
                      <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                      <div style={{ height: '70px', overflow: 'hidden' }}>
                        <p className="text-gray-400">{nft.description}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-black">
                      <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                      <input
                          placeholder="Your bid Price in Eth"
                          className="mt-2 border rounded p-4"
                          onChange={e => updateFormInput({ ...formInput, bidprice: e.target.value })}
                      />
                      <button className="w-1/6 bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Bid</button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )
    }