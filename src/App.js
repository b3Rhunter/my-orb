import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import ABI from './ABI.json';

const contractAddress = "0x8f71c43008C1EB3f79183A2dB46E85Cac6C3517c"

function App() {

  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState(null);
  const [auction, setAuction] = useState([]);
  const [highestBidder, setHighestBidder] = useState("");
  const [highestBid, setHighestBid] = useState("");
  const [endOfAuction, setEndOfAuction] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [duration, setDuration] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const connect = async () => {
    try {
      let provider;
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const desiredChainId = '0xaa36a7';
      if (network.chainId !== parseInt(desiredChainId)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: desiredChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: desiredChainId,
                  chainName: 'Sepolia',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                }],
              });
            } catch (addError) {
              throw addError;
            }
          } else {
            throw switchError;
          }
        }
      }
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const _auction = await contract.currentAuction();
      const getPrice = await contract.declaredValue();
      const getBalance = await contract.balanceOf(userAddress);
      await signer.signMessage("Hello World");
      const { ethereum } = window;
      if (ethereum) {
        const ensProvider = new ethers.providers.InfuraProvider('mainnet');
        const displayAddress = userAddress?.substr(0, 6) + "...";
        const ens = await ensProvider.lookupAddress(userAddress);
        if (ens !== null) {
          setName(ens)
        } else {
          setName(displayAddress)
        }
      }
      setConnected(true);
      setAddress(userAddress)
      setAuction(_auction)
      setHighestBidder(_auction[0].toString())
      setHighestBid(_auction[1].toString())
      setEndOfAuction(_auction[2].toString());
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const remainingTime = _auction[2] - currentTimestamp;
      setTimeLeft(remainingTime > 0 ? remainingTime : 0);
      

      setCurrentPrice(getPrice.toString())
      setBalance(getBalance.toString())
    } catch(error) {
      console.log(error)
    }
  }

  const startAuction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.startAuction(duration);
      await tx.wait()
    } catch(error) {
      console.log(error)
    }
  }

  const bid = async () => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.bid({value: ethers.utils.parseEther(bidPrice)});
      await tx.wait()
    } catch(error) {
      console.log(error)
    }
  }

  const endAuction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.endAuction();
      await tx.wait()
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
}, []);



  return (
    <div className="App">

      {!connected && <button onClick={connect}>connect</button>}
      {connected && <button className='connect'>{name}</button>}
      {connected && (
      <main>
      <section className='auction-details'>
      <p>Highest Bidder: {highestBidder?.substr(0, 6) + "..."}</p>
      <p>Highest Bid: {highestBid && ethers.utils.formatEther(highestBid)} ETH</p>
      <p>Auction Ending in: {timeLeft} seconds</p>
      <p>Price: {ethers.utils.formatEther(currentPrice)}</p>
    </section>

    <section className='card'>
      <div className='ui'>
      <input type='text' value={duration} onChange={(e) => setDuration(e.target.value)} placeholder='set round duration...'/>
      <button onClick={() => startAuction(duration)}>Start Auction</button>

      <input type='text' value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} placeholder='place bid...'/>
      <button onClick={() => bid(bidPrice)}>Bid!</button>
      <button onClick={endAuction}>End Auction</button>
      </div>

      <div className='orb-container'>
      <section className="stage">
        <figure className="orb"><span className="shadow"></span></figure>
      </section>
      </div>
      
    </section>
      </main>
      )}
    </div>
  );
}

export default App;
