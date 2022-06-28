import Head from 'next/head'
import Web3Modal from 'web3modal'
import {providers, Contract} from 'ethers'
import {useEffect, useRef, useState} from 'react'
import {WHITELIST_CONTRACT_ADDRESS} from '../../constant'
import Whitelist from '../../artifacts/contracts/Whitelist.sol/Whitelist.json'
const abi = Whitelist.abi

export default function Home() {
  // 钱包连接状态
  const [walletConnected, setWalletConnected] = useState(false)
  // 参与状态
  const [joinedWhitelist, setJoinedWhitelist] = useState(false)
  // loading状态
  const [loading, setLoading] = useState(false)
  // 参与数量
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0)
  // 创建对 Web3 Modal 的引用（用于连接到 MetaMask），只要页面打开，它就会一直存在
  const web3ModalRef = useRef()

  // 返回 Provider
  const getProviderOrSigner = async(needSigner = false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)
    const {chainId} = await web3Provider.getNetwork()
    if (chainId !== 4) {
      window.alert('Change the network to Rinkeby')
      throw new Error('Change the network to Rinkeby')
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }
    return web3Provider
  }

  // 参与请求
  const addAddressToWhitelist = async() => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      setLoading(true)
      const tx = await whitelistContract.addAddressToWhitelist()
      await tx.wait()
      setLoading(false)
      await getNumberOfWhitelisted()
      setJoinedWhitelist(true)
    } catch(err) {
      console.log(err)
    }
  }

  // 获取参与数量
  const getNumberOfWhitelisted = async() => {
    try {
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numberOfWhitelisted)
    } catch(err) {
      console.log(err)
    }
  }

  // 检查账户是否参与过
  const checkIfAddressInWhitelist = async() => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )
      const address = await signer.getAddress()
      console.log('address', address)
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address)
      setJoinedWhitelist(_joinedWhitelist)
    } catch(err) {
      console.log(err)
    }
  }

  // 连接 MetaMask 钱包
  const connectWallet = async() => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
      checkIfAddressInWhitelist()
      getNumberOfWhitelisted()
    } catch(err) {
      console.log(err)
    }
  }

  // 根据不同状态显示不同按钮
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className='text-2xl my-8 text-sky-600'>
            Thanks for joining the Whitelist!
          </div>
        )
      } else if (loading) {
        return <button className='button'>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className='button'>
            Join the Whitelist
          </button>
        )
      }
    } else {
      return (
        <button onClick={connectWallet} className='button'>
          Connect your wallet
        </button>
      )
    }
  }

  // 监听 walletConnected 状态的变化
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()
    }
  }, [walletConnected])

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name='description' content='Whitelist-Dapp' />
				<link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex justify-center items-center min-h-[85vh] flex-row lg:flex-col lg:w-full'>
        <div className='basis-1/2'>
          <img className='w-1/2 h-1/2 m-auto' src='./crypto-devs.svg' />
        </div>
        <div className='basis-1/2'>
          <h1 className='text-4xl my-8 text-rose-600'>Welcome to Crypto Devs!</h1>
          <div className='text-xl my-8 text-rose-500'>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className='text-xl my-8 text-fuchsia-400'>
            <span className='text-bold text-4xl text-fuchsia-600 italic'>{numberOfWhitelisted}</span> have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
      </div>

      <footer className='flex justify-center items-center py-8 border-t-2 border-solid border-gray-50'>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}