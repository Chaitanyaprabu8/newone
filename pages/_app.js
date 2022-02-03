import '../styles/globals.css'
import Link from 'next/link'
import Fortmatic from "fortmatic"
import Web3Modal from "web3modal"
import { ethers } from 'ethers'
import sgMail from '@sendgrid/mail'

function Marketplace({ Component, pageProps }) {
  async function connect() {
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
    
    const instance = await web3Modal.connect();
    const user = await instance.fm.user.getUser();
    
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: user.email, // Change to your recipient
      from: 'mastibaloch979@gmail.com', // Change to your verified sender
      subject: 'Login message',
      text: 'Hi this is to remind you that you have successfully logged in fortmatic with email '+user.email
            +' and your wallet address is '+address,
      html: '<strong>Hi this is to remind you that you have successfully logged in fortmatic with email '+user.email
            +' and your wallet address is '+address+ '</strong>',
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
    document.getElementById('connect_lib').innerText = 'connected';
  }
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Decentralized Governmental Contracts Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">
              Home
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink-500">
              Create a Project
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">
              My Contracts
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">
              Projects Dashboard
            </a>
          </Link>
        </div>
        <button className='float-right' id="connect_lib" onClick={connect}>connect</button>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default Marketplace