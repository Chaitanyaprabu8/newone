import {useRouter} from 'next/router'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Link from 'next/link'
import Fortmatic from "fortmatic"
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
    const {projectId,setprojectId} = useState(nftId)
    const [nfts, setNfts] = useState([])
    const [provisions, setProvisions] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [formInput, updateFormInput] = useState({ bidprice: '' })
    useEffect(async() => {
      const customNetworkOptions = {
        rpcUrl: 'https://kovan.infura.io/v3/8c661edd6d764e1e95fd0318054d331c',
        chainId: 42
      }

    const providerOptions = {
      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_test_5C2C23DF77F87C60", // required,
          network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: "kovan", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const user = await connection.fm.user.getUser()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    const projectId = window.location.pathname.split("/")[2];
    let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let depemail = await contract.getdepemail(projectId)
    depemail = depemail.toString()
    let contemail = await contract.getcontemail(projectId)
    contemail = contemail.toString()
    if(user.email==depemail||user.email==contemail) {
      loadNFTs(),
      loadProvisions()
    }
    }, [])
    async function loadNFTs() { 
        
        
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const data = await marketContract.fetchMarketItems()
        console.log('data')
        console.log(data)
        const items = await Promise.all(data.map(async i => {
            console.log("nftid "+nftId);
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            projectId: i.projectId.toNumber(),
            seller: i.seller,
            depSign:i.depSign,
            contSign:i.contSign,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            contemail:i.contemail,
            depemail:i.depemail
          }
          return item
          
        }))
        console.log('items-project')
        console.log(items)
        setNfts(items)
       
      }
      async function loadProvisions() { 
        
           
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const projectId = window.location.pathname.split("/")[2];
        console.log(projectId);
        console.log('location');
        console.log(window.location);
        const {nftId} = router.query;
        console.log('nftId')
        console.log(nftId)
        const data = await marketContract.fetchProvisionsbyProject(projectId)
        console.log('data');
        console.log(data);
        const items = await Promise.all(data.map(async i => {
            
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            projectId: i.projectId.toNumber(),
            provisionId:i.provisionId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            depSign:i.depSign,
            contSign:i.contSign,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          }
          return item
          
        }))
        console.log('items')
        console.log(items)
        setProvisions(items)
        setLoadingState('loaded') 
      }
      async function contSign(nft) {
        // Example for kovan:
      const customNetworkOptions = {
        rpcUrl: 'https://kovan.infura.io/v3/8c661edd6d764e1e95fd0318054d331c',
        chainId: 42
      }

    const providerOptions = {
      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_test_5C2C23DF77F87C60", // required,
          network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: "kovan", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const user = await connection.fm.user.getUser()

        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.projectcontSign(nftaddress, nft.projectId, user.email,  {
          value: '0'
        })
        await transaction.wait()
        loadNFTs()
      }
      async function provisiondepSign(nft) {
        // Example for kovan:
      const customNetworkOptions = {
        rpcUrl: 'https://kovan.infura.io/v3/8c661edd6d764e1e95fd0318054d331c',
        chainId: 42
      }

    const providerOptions = {
      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_test_5C2C23DF77F87C60", // required,
          network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: "kovan", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const user = await connection.fm.user.getUser()

        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const projectId = window.location.pathname.split("/")[2];
        const transaction = await contract.provisionDeptSign(nftaddress, nft.provisionId,projectId,user.email, {
          value: '0'
        })
        await transaction.wait()
        loadProvisions()
      }
      async function provisionContSign(nft) {
        // Example for kovan:
      const customNetworkOptions = {
        rpcUrl: 'https://kovan.infura.io/v3/8c661edd6d764e1e95fd0318054d331c',
        chainId: 42
      }

    const providerOptions = {
      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_test_5C2C23DF77F87C60", // required,
          network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: "kovan", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const user = await connection.fm.user.getUser()

        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const projectId = window.location.pathname.split("/")[2];
        const transaction = await contract.provisionContSign(nftaddress, nft.provisionId,projectId,user.email, {
          value: '0'
        })
        await transaction.wait()
        loadProvisions()
      }
      async function depSign(nft) {
        // Example for kovan:
      const customNetworkOptions = {
        rpcUrl: 'https://kovan.infura.io/v3/8c661edd6d764e1e95fd0318054d331c',
        chainId: 42
      }

    const providerOptions = {
      fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_test_5C2C23DF77F87C60", // required,
          network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: "kovan", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const user = await connection.fm.user.getUser()

        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.projectdepSign(nftaddress, nft.projectId, user.email, {
          value: '0'
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
                  nft.projectId==nftId &&
                  <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <iframe src={nft.image} type="application/pdf" width="1100" height="600">
                    
                    </iframe>
                    <div className="p-4">
                      <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                      <div style={{ height: '70px', overflow: 'hidden' }}>
                        <p className="text-gray-400">{nft.description}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-black">
                      <p className="text-2xl mb-4 font-bold text-white hidden">{nft.price} ETH</p>
                      <p className="text-2xl mb-4 font-bold text-white">Signers</p>
                      <p className="text-2xl mb-4 font-bold text-white">{nft.depemail}</p>
                      <p className="text-2xl mb-4 font-bold text-white">{nft.contemail}</p>
                      <p className="text-2xl mb-4 font-bold text-white">
                      {(nft.depSign===true) ? 'Department Signature: Signed':
                      <button className='text-xl mb-4 font-bold text-white bg-pink-500 rounded py-2 px-12'
                       onClick={()=>depSign(nft)}>Add Department Signature</button>}
                      </p>
                      <p className="text-2xl mb-4 font-bold text-white">
                      {(nft.contSign===true) ? 'Contractor Signature: Signed':
                      <button className='text-xl mb-4 font-bold text-white bg-pink-500 rounded py-2 px-12'
                       onClick={()=>contSign(nft)}>Add Contractor Signature</button>}
                      </p>
                      <Link href={"/create-provision?project="+nftId} className="text-2xl mb-4 font-bold text-white">
                        <a className="text-2xl mb-4 font-bold text-white bg-pink-500 rounded py-2 px-12">
                          Create a Provision
                        </a>
                      </Link>

                    </div>
                  </div>
                ))
              }
              {
                provisions.map((provision, i) => (
                  <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <h3>Provision {i+1}</h3>
                    <iframe src={provision.image} type="application/pdf" width="1100" height="600">
                    </iframe>
                    <div className="p-4">
                      <p style={{ height: '64px' }} className="text-2xl font-semibold">{provision.name}</p>
                      <div style={{ height: '70px', overflow: 'hidden' }}>
                        <p className="text-gray-400">{provision.description}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-black">
                      <p className="text-2xl mb-4 font-bold text-white hidden">{provision.price} ETH</p>
                      <p className="text-2xl mb-4 font-bold text-white">
                      {(provision.depSign===true) ? 'Department Signature: Signed':
                      <button className='w-1/6 bg-pink-500 text-white font-bold py-2 px-2 rounded'
                       onClick={()=>provisiondepSign(provision)}>Add Department Signature</button>}
                       </p>
                       <p className='text-2xl mb-4 font-bold text-white'>
                       {(provision.contSign===true) ? 'Contractor Signature: Signed':
                      <button className='w-1/6 bg-pink-500 text-white font-bold py-2 px-2 rounded'
                       onClick={()=>provisionContSign(provision)}>Add Contractor Signature</button>}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )
    }