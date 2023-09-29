# Soul Gem

Soul Gem is a sophisticated blockchain project which leverages the power of Ethereum blockchain through its smart contract, `SoulGem.sol`, and a user-friendly interface powered by `App.js`. This repository contains all the necessary files and documentation to understand, interact with, and extend the capabilities of the Soul Gem project.

## Table of Contents

- [Smart Contract - SoulGem.sol](#smart-contract---soulgemsol)
- [Frontend - App.js](#frontend---appjs)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Contribution](#contribution)
- [License](#license)

## Smart Contract - SoulGem.sol

`SoulGem.sol` is an Ethereum smart contract that embodies the core logic of the Soul Gem project, utilizing the ERC-721 token standard for non-fungible tokens (NFTs). This contract extends the `ERC721Enumerable` and `Ownable` contracts from the OpenZeppelin library, which provide enumerable NFT functionality and access control mechanisms respectively.

Here are the key features and functionalities embedded within `SoulGem.sol`:

- **Token Standards**: Implements ERC-721 token standard utilizing OpenZeppelin's `ERC721Enumerable` contract which enables enumeration of NFTs.
- **Access Control**: Inherits from OpenZeppelin's `Ownable` contract to ensure proper access control for administrative functionalities.
- **Token Information**: Provides a method `tokenURI` to retrieve the URI of a given token, adhering to the ERC-721 standard.
- **Auction Mechanism**: 
  - Initiation of an auction with a predefined end time.
  - Acceptance of bids during the auction period.
  - Finalization of the auction and transfer of ownership based on the leading bid.
  - Calculation and transfer of royalties based on the bid amount.
- **Chat Interaction**:
  - Ability for the current keeper of the token to ask a question.
  - Beneficiary's ability to answer the question.
  - Storing the chat history within the blockchain, allowing for retrieval of chat messages and length of chat history.
- **Royalty Distribution**: 
  - Calculation and distribution of royalties upon finalization of the auction.
  - Method to split proceeds between the beneficiary and the receiver based on a specified royalty percentage.
- **Auction State Query**: Functionality to check whether an auction is ongoing or has ended.

### Data Structures and State Variables:
- **Beneficiary and Keeper**: Addresses of the beneficiary and the keeper are stored, where the beneficiary receives the proceeds from the auction, and the keeper is the current holder of the token.
- **Auction Details**: 
  - Variables to store auction end time, leading bidder, leading bid amount, and the price of the token.
  - A boolean variable to track if the auction is ongoing.
- **Chat History**: 
  - An array to store chat messages, where each message has a sender and text.
  - Functionality to get the length of the chat history and retrieve individual chat messages.

### Events and Auction Dynamics:
The contract defines a clear auction mechanism where bids can be placed until the auction end time. Once the auction ends, the leading bidder has the right to finalize the auction, which triggers the transfer of the token and distribution of the auction proceeds. Additionally, the contract facilitates a chat interaction between the keeper and the beneficiary, where questions can be asked, and answers can be provided. This chat history is stored on-chain and can be retrieved through function calls.

This smart contract forms the backbone of the Soul Gem project by encapsulating the necessary logic for NFT auctions, chat interactions, and royalty distributions, providing a robust foundation for a decentralized, interactive, and monetizable platform.

## Frontend - App.js

`App.js` is the main file driving the frontend of the Soul Gem project. It provides an interactive user interface (UI) to connect with the blockchain and interact with the `SoulGem.sol` smart contract. Here's a high-level overview of its functionalities:

- **Blockchain Connection**:
  - Facilitates connection to the Ethereum blockchain via the MetaMask browser extension.
  - Switches or adds the Ethereum network if not already connected to the desired network.
  - Fetches and displays relevant contract data and user information upon connection.

- **Auction Interaction**:
  - Displays auction details like the current holder, highest bidder, highest bid, and time left for the auction to end.
  - Provides a bidding interface when the auction is live.
  - Enables the user to claim the Soul Gem when the auction ends and they are the highest bidder.

- **Chat Interaction**:
  - Displays the chat history between the keeper and the beneficiary.
  - Provides interfaces for both the keeper and the beneficiary to ask and answer questions respectively.
  - Reflects the chat interactions on the UI in real-time.

- **Soul Gem Visualization**:
  - Displays a visual representation of the Soul Gem, with its appearance changing based on the state of the auction (e.g., changing colors when the auction is live or ended).

- **Loading and Error Handling**:
  - Handles loading states and displays a loading spinner to indicate processing.
  - Provides error handling and logging to ensure a smooth user experience.

- **Responsive UI**:
  - Provides a clean and intuitive user interface that updates in real-time to reflect the state of the blockchain and the Soul Gem contract.

`App.js` has been structured in a way to keep the UI responsive and the user informed about the state of the auction, their interactions, and any changes happening on the blockchain relating to the Soul Gem contract. The frontend facilitates user interaction with the blockchain, making the auctioning, bidding, and chat functionalities accessible and user-friendly.

## Setup and Installation

Follow these steps to setup and run the Soul Gem project locally:

1. Clone the repository: 
```bash
git clone https://github.com/b3Rhunter/soul-gem.git

2. Navigate to the project directory:
```bash
cd soul-gem

