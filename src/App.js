import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ABI from './ABI.json';

const contractAddress = "0x500651D498e4e7E25C793855BA0b65015c8df1dA";

function formatTime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
  const remainingSeconds = ((seconds % 86400) % 3600) % 60;

  const timeString = `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  return timeString;
}

function App() {

  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState(null);
  const [beneficiary, setBeneficiary] = useState(false);
  const [keeper, setKeeper] = useState(false);
  const [keeperAddress, setKeeperAddress] = useState("")
  const [highestBidder, setHighestBidder] = useState("");
  const [highestBid, setHighestBid] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [bidPrice, setBidPrice] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [finalize, setFinalize] = useState(false);
  const [chat, setChat] = useState([]);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const [loading, setLoading] = useState(false)

  const connect = async () => {
    setLoading(true)
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
      const getPrice = await contract.price();
      const getBalance = await contract.balanceOf(userAddress);
      const _highestBidder = await contract.leadingBidder();
      const _highestBid = await contract.leadingBid();
      const _endOfAuction = await contract.auctionEndTime();
      const _keeper = await contract.keeper();
      const _beneficiary = await contract.beneficiary();
      const chatLength = await contract.getChatHistoryLength();
      const chatMessages = [];
      for (let i = 0; i < chatLength; i++) {
        const message = await contract.getChatMessage(i);
        chatMessages.push({
          sender: message[0],
          text: message[1]
        });
      }
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
      if (_keeper === userAddress) {
        setKeeper(true)
      }
      if (_beneficiary === userAddress) {
        setBeneficiary(true)
      }
      setHighestBidder(_highestBidder.toString())
      setHighestBid(_highestBid.toString())
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const remainingTime = _endOfAuction - currentTimestamp;
      if (remainingTime < 0 && userAddress === highestBidder) {
        setFinalize(true)
      }
      setTimeLeft(remainingTime > 0 ? remainingTime : 0);
      setCurrentPrice(getPrice.toString())
      setBalance(getBalance.toString())
      setChat(chatMessages);
      setKeeperAddress(_keeper)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const bid = async () => {
    setLoading(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.bid({ value: ethers.utils.parseEther(bidPrice) });
      await tx.wait()

      const _highestBidder = await contract.leadingBidder();
      const _highestBid = await contract.leadingBid();
      setHighestBidder(_highestBidder.toString())
      setHighestBid(_highestBid.toString())
      setBidPrice("")
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const answerQuestion = async () => {
    setLoading(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.answer(answer);
      await tx.wait()

      const chatLength = await contract.getChatHistoryLength();
      const chatMessages = [];
      for (let i = 0; i < chatLength; i++) {
        const message = await contract.getChatMessage(i);
        chatMessages.push({
          sender: message[0],
          text: message[1]
        });
      }
      setChat(chatMessages);
      setCooldown(false)
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const askQuestion = async () => {
    setLoading(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.question(question);
      await tx.wait()

      const chatLength = await contract.getChatHistoryLength();
      const chatMessages = [];
      for (let i = 0; i < chatLength; i++) {
        const message = await contract.getChatMessage(i);
        chatMessages.push({
          sender: message[0],
          text: message[1]
        });
      }
      setChat(chatMessages);
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const claimOrb = async () => {
    setLoading(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      const tx = await contract.finalizeAuction();
      await tx.wait()

      const _keeper = await contract.keeper();
      setKeeperAddress(_keeper)
      setFinalize(false)
      setCooldown(true)
    } catch(error) {
      console.log(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      {loading && <div className='loading'><div className='spinner'></div></div>}
      {!connected && <button onClick={connect}>connect</button>}
      {connected && <button className='connect'>{name}</button>}
      {connected && (
        <main>
          <section className='auction-details'>
            <p>Keeper: {keeperAddress?.substr(0, 6) + "..."}</p>
            <p>Highest Bidder: {highestBidder?.substr(0, 6) + "..."}</p>
            <p>Highest Bid: {highestBid && ethers.utils.formatEther(highestBid)} ETH</p>
            <p>Auction Ends: {formatTime(timeLeft)}</p>
          </section>

          <section className='card'>
            <div className='ui'>

              {!finalize && (
              <>
              <input type='text' value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} placeholder='place bid...' />
              <button onClick={() => bid(bidPrice)}>Bid!</button>
              </>
              )}
              {finalize && <button onClick={claimOrb}>Claim Soul Gem</button>}
              <div className='chat'>
              <p>chat...</p>
              {chat && chat.map((message, index) => (
                <p key={index}>{message.sender.substr(0, 6) + "..."}: {message.text}</p>
              ))}
              </div>

              {keeper && (
                <>
                {cooldown && (
                  <>
                  <input
                      type='text'
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question..." />
                      <button onClick={askQuestion}>Ask</button>
                      </>
                )}
                </>
              )}
              {beneficiary && (
                <>
                {cooldown && (
                  <>
                  <input
                      type='text'
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Answer the question..." />
                      <button onClick={answerQuestion}>Answer</button>
                      </>
                  )}
                </>
              )}
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
