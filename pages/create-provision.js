import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Fortmatic from "fortmatic"
import axios from 'axios'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function createSale(url) {
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
    const projectId = window.location.search.split("=")[1];
    let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let depemail = await contract.getdepemail(projectId)
    depemail = depemail.toString()
    let contemail = await contract.getcontemail(projectId)
    contemail = contemail.toString()
    if(!user.email==depemail||user.email==contemail) return;
    let tokenId = await contract.getprojectTokenId(projectId);
    tokenId = tokenId.toNumber()
    
    /* next, create the item */
    contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    
    const tokenUri = await contract.tokenURI(tokenId)
    const meta = await axios.get(tokenUri)
    const projectName = meta.data.name;
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    console.log(tx)
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId1 = value.toNumber()
    // VanillaJS
    
    console.log(projectId); //101
    const price = ethers.utils.parseUnits('1', 'ether')
  
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const { name } = formInput
    //let nextProjectId = await contract.getCurrentProjectId();
    transaction = await contract.createProvisionItem(nftaddress, tokenId1,projectId, price, user.email, { value: '0' })
    await transaction.wait()
    
    const data = {
      toemail: depemail, // Change to your recipient
      name: 'True Contracts',
      email: 'Info@iserveinc.in', // Change to your verInfo@iserveinc.inified sender
      subject: 'Provision Upload',
      message: 'Hi this is to inform you that a provision have been successfully uploaded on the website with your email,please add your signatures by logging into the website',
      html: '<p>Hi this is to inform you that a provision have been successfully uploaded on the website with your email,please add your signatures by logging into the website</p>'
      +'<p>Project Name: '+projectName+'</p>'+'<p>Provision Name: '+name+'</p>'+'<p><a href="https://3000-chaitanyaprabu8-newone-yj5vs1wvovq.ws-eu32.gitpod.io/nft/'+projectId+'" target="_blank">click here to open the project</a></p>'
    }
    try {
      await fetch("/api/contact", {
        "method": "POST",
        "headers": { "content-type": "application/json" },
        "body": JSON.stringify(data)
      })

            //if sucess do whatever you like, i.e toast notification
    
    } catch (error) {
        // toast error message. whatever you wish 
        console.log('toast error');
    }
    const data1 = {
      toemail: contemail, // Change to your recipient
      name: 'True Contracts',
      email: 'Info@iserveinc.in', // Change to your verified sender
      subject: 'Provision Upload',
      message: 'Hi this is to inform you that a provision have been successfully uploaded on the website with your email,please add your signatures by logging into the website',
      html: '<strong>Hi this is to inform you that a provision have been successfully uploaded on the website with your email,please add your signatures by logging into the website</strong>'
      +'<p>Project Name: '+projectName+'</p>'+'<p>Provision Name: '+name+'</p>'+'<p><a href="https://3000-chaitanyaprabu8-newone-yj5vs1wvovq.ws-eu32.gitpod.io/nft/'+projectId+'" target="_blank">click here to open the project</a></p>'
    }
    try {
      await fetch("/api/contact", {
        "method": "POST",
        "headers": { "content-type": "application/json" },
        "body": JSON.stringify(data1)
      })

            //if sucess do whatever you like, i.e toast notification
    
    } catch (error) {
        // toast error message. whatever you wish 
        console.log('toast error');
    }
    //router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4 hidden"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <object data={fileUrl} type="application/pdf" width="300" height="200">
             alt : <a href={fileUrl}>only pdf files allowed</a>
            </object>
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create a Provision
        </button>
      </div>
    </div>
  )
}