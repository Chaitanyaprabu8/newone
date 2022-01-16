import '../styles/globals.css'
import Link from 'next/link'
import Fortmatic from "fortmatic"
import Web3Modal from "web3modal"
import { ethers } from 'ethers'

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
    
    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
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