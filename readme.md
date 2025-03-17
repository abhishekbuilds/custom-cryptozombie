# CryptoZombies

This is a front-end application for interacting with the **CryptoZombies** smart contract on the Ethereum blockchain. It allows you to create, manage, and battle your own zombie army in a fun and gamified way.

## Features

1. **MetaMask Connectivity**
   - Detects and connects to your MetaMask wallet automatically.
   - Requests Ethereum accounts from the user for direct interaction with the contract.
   - Displays the connected account address in the application.

2. **Create a New Zombie**
   - Users can enter a custom name for a new zombie.
   - Displays a status message and the newly minted zombie details (ID, DNA, Level, Wins, Losses).

3. **Show / Hide Zombies**
   - “Show My Zombies” fetches all zombies owned by the connected address.
   - Displays each zombie in a card-like layout, including:
     - ID, DNA
     - Level, Wins, Losses
     - A visual “fire badge” highlighting the zombie’s level
     - A button to level up the zombie
   - “Hide Zombies” clears the display and hides the zombie list.

4. **Level Up a Zombie**
   - Calls the `levelUp` method on the contract.

5. **Zombie Battles**
   - Users can specify an attacker zombie ID (owned by the user) and a target zombie ID (which can be owned by anyone).
   - Displays an on-screen battle view, showing the attacker and defender.
   - Updates the zombie stats after the battle to reflect the winner (and loser).

## Technologies Used
1. HTML/CSS/JavaScript for the UI/UX.
2. Web3.js for interaction with the Ethereum smart contract.
3. MetaMask for handling account management and transaction signing.

## Developed By: 
Abhishek Singh [885199042]
abhishek.singh@csu.fullerton.edu