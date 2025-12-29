import { ethers } from 'ethers';
import CONFIG from '../config/blockchain.js';

const TARGET_CHAIN_ID = 11155111; // Sepolia
const TOKEN_DECIMALS = 6; // MockERC20 uses 6 decimals (matching USDT standard)

// Get provider (for read operations)
export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    // Use Web3Provider for browser wallets (ethers v6)
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to localhost provider
  return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
}

// Get signer (for write operations)
export async function getSigner() {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return signer;
  }
  throw new Error('No wallet connected');
}

// Get BettingRooms contract instance
export function getBettingRoomsContract(signerOrProvider) {
  return new ethers.Contract(
    CONFIG.contracts.BettingRooms.address,
    CONFIG.contracts.BettingRooms.abi,
    signerOrProvider
  );
}

// Get MockERC20 contract instance
export function getTokenContract(signerOrProvider) {
  return new ethers.Contract(
    CONFIG.contracts.MockERC20.address,
    CONFIG.contracts.MockERC20.abi,
    signerOrProvider
  );
}

// Fetch all rooms with complete on-chain data
export async function getAllRooms() {
  try {
    const provider = getProvider();
    if (!provider) {
      console.error('No provider available');
      return [];
    }
    
    const contract = getBettingRoomsContract(provider);
    const nextRoomId = await contract.nextRoomId();
    const roomCount = Number(nextRoomId);
    
    if (roomCount === 0) {
      return [];
    }
    
    const rooms = [];
    for (let i = 0; i < roomCount; i++) {
      try {
        // Fetch room data from contract
        const room = await contract.rooms(i);
        
        // Fetch players for this room
        const players = await contract.getRoomPlayers(i);
        const playerCount = players.length;
        
        // Calculate total pool by summing all player stakes
        let totalPool = BigInt(0);
        for (let j = 0; j < players.length; j++) {
          try {
            const stake = await contract.getPlayerStake(i, players[j]);
            totalPool += BigInt(stake.toString());
          } catch (stakeError) {
            console.error(`Error fetching stake for player ${players[j]} in room ${i}:`, stakeError);
          }
        }
        
        rooms.push({
          roomId: i,
          minStakeAmount: room.minStakeAmount.toString(),
          maxStakeAmount: room.maxStakeAmount.toString(),
          settlementTimestamp: Number(room.settlementTimestamp),
          currentPlayers: playerCount,
          totalPool: totalPool.toString(),
          players: players,
          closed: room.closed,
          settled: room.settled,
          payoutType: Number(room.payoutType), // 0 = SINGLE_WINNER, 1 = TOP_3
        });
      } catch (error) {
        console.error(`Error fetching room ${i}:`, error);
        // Continue to next room instead of breaking
      }
    }
    
    return rooms;
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    return [];
  }
}

// Get room details
export async function getRoomDetails(roomId) {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const room = await contract.rooms(roomId);
    
    // Fetch players for total pool calculation
    const players = await contract.getRoomPlayers(roomId);
    let totalPool = BigInt(0);
    for (let i = 0; i < players.length; i++) {
      try {
        const stake = await contract.getPlayerStake(roomId, players[i]);
        totalPool += BigInt(stake.toString());
      } catch (stakeError) {
        console.error(`Error fetching stake for player ${players[i]}:`, stakeError);
      }
    }
    
    return {
      roomId: Number(roomId),
      minStakeAmount: room.minStakeAmount.toString(),
      maxStakeAmount: room.maxStakeAmount.toString(),
      settlementTimestamp: Number(room.settlementTimestamp),
      currentPlayers: players.length,
      totalPool: totalPool.toString(),
      players: players,
      closed: room.closed,
      settled: room.settled,
      payoutType: Number(room.payoutType),
    };
  } catch (error) {
    console.error(`Error fetching room ${roomId}:`, error);
    return null;
  }
}

// Get players in a room
export async function getRoomPlayers(roomId) {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const players = await contract.getRoomPlayers(roomId);
    return players;
  } catch (error) {
    console.error(`Error fetching players for room ${roomId}:`, error);
    return [];
  }
}

// Get current player count for a room
export async function getRoomPlayerCount(roomId) {
  try {
    const players = await getRoomPlayers(roomId);
    return players.length;
  } catch (error) {
    console.error(`Error fetching player count for room ${roomId}:`, error);
    return 0;
  }
}

// Get user's unsettled rooms (rooms they're in that aren't settled)
export async function getUserUnsettledRooms(userAddress) {
  try {
    const allRooms = await getAllRooms();
    const unsettledRooms = [];
    
    for (const room of allRooms) {
      if (room.settled || room.closed) continue;
      
      const players = await getRoomPlayers(room.roomId);
      const isPlayer = players.some(addr => addr.toLowerCase() === userAddress.toLowerCase());
      
      if (isPlayer) {
        const playerCount = players.length;
        unsettledRooms.push({
          ...room,
          currentPlayers: playerCount,
          players,
        });
      }
    }
    
    return unsettledRooms;
  } catch (error) {
    console.error('Error fetching user unsettled rooms:', error);
    return [];
  }
}

// Get user's settled rooms (rooms they joined that are settled)
export async function getUserSettledRooms(userAddress) {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    
    // Get all RoomSettled events
    const filter = contract.filters.RoomSettled();
    const events = await contract.queryFilter(filter);
    
    const settledRooms = [];
    
    for (const event of events) {
      const roomId = Number(event.args.roomId);
      const winners = event.args.winners;
      const isWinner = winners.some(addr => addr.toLowerCase() === userAddress.toLowerCase());
      
      // Check if user was in this room
      const players = await getRoomPlayers(roomId);
      const wasPlayer = players.some(addr => addr.toLowerCase() === userAddress.toLowerCase());
      
      if (wasPlayer) {
        const room = await getRoomDetails(roomId);
        if (room && room.settled) {
          // Calculate total pool by summing all player stakes
          let totalPool = BigInt(0);
          for (let i = 0; i < players.length; i++) {
            const stake = await getPlayerStake(roomId, players[i]);
            totalPool += BigInt(stake);
          }
          
          settledRooms.push({
            ...room,
            winners,
            isWinner,
            playerCount: players.length,
            totalPrize: totalPool.toString(),
          });
        }
      }
    }
    
    return settledRooms;
  } catch (error) {
    console.error('Error fetching user settled rooms:', error);
    return [];
  }
}

// Calculate user's total winnings
export async function calculateUserWinnings(userAddress) {
  try {
    const settledRooms = await getUserSettledRooms(userAddress);
    let totalWinnings = BigInt(0);
    
    for (const room of settledRooms) {
      if (room.isWinner) {
        // Calculate winnings based on payout type
        const totalPrize = BigInt(room.totalPrize);
        if (room.payoutType === 0) {
          // SINGLE_WINNER - winner takes all
          totalWinnings += totalPrize;
        } else if (room.payoutType === 1) {
          // TOP_3 - winner gets 1/3 (simplified, actual contract logic may differ)
          totalWinnings += totalPrize / BigInt(3);
        }
      }
    }
    
    return totalWinnings.toString();
  } catch (error) {
    console.error('Error calculating user winnings:', error);
    return '0';
  }
}

// Get user's withdrawable balance
export async function getWithdrawableBalance(userAddress) {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const balance = await contract.withdrawableBalances(userAddress);
    return balance.toString();
  } catch (error) {
    console.error('Error fetching withdrawable balance:', error);
    return '0';
  }
}

// Join a room
export async function joinRoom(roomId, stakeAmount) {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.joinRoom(roomId, stakeAmount);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

// Get player stake in a room
export async function getPlayerStake(roomId, playerAddress) {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const stake = await contract.getPlayerStake(roomId, playerAddress);
    return stake.toString();
  } catch (error) {
    console.error('Error fetching player stake:', error);
    return '0';
  }
}

// Withdraw winnings
export async function withdraw() {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.withdraw();
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error withdrawing:', error);
    throw error;
  }
}

// Check if network is correct
export function isCorrectNetwork(chainId) {
  return Number(chainId) === TARGET_CHAIN_ID;
}

// Switch to correct network
export async function switchToCorrectNetwork() {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${TARGET_CHAIN_ID.toString(16)}` }],
      });
    }
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18, // ETH uses 18 decimals
              },
              rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/4UA7f8bHykMEEFhQrzD5ywYgN3y9bxJB'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
}

// Format token amount (uses TOKEN_DECIMALS by default)
export function formatTokenAmount(amount, decimals = TOKEN_DECIMALS) {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch (error) {
    return '0';
  }
}

// Parse token amount (uses TOKEN_DECIMALS by default)
export function parseTokenAmount(amount, decimals = TOKEN_DECIMALS) {
  try {
    return ethers.parseUnits(amount, decimals);
  } catch (error) {
    return BigInt(0);
  }
}

// Get user's token balance
export async function getTokenBalance(userAddress) {
  try {
    const provider = getProvider();
    const contract = getTokenContract(provider);
    const balance = await contract.balanceOf(userAddress);
    return balance.toString();
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
}

// Check token allowance
export async function getTokenAllowance(userAddress, spenderAddress) {
  try {
    const provider = getProvider();
    const contract = getTokenContract(provider);
    const allowance = await contract.allowance(userAddress, spenderAddress);
    return allowance.toString();
  } catch (error) {
    console.error('Error fetching token allowance:', error);
    return '0';
  }
}

// Approve token spending (supports infinite approval with MAX_UINT256)
export async function approveToken(spenderAddress, amount) {
  try {
    const signer = await getSigner();
    const contract = getTokenContract(signer);
    const tx = await contract.approve(spenderAddress, amount);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
}

// Max uint256 for infinite approval
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

// Approve infinite tokens to a spender
export async function approveInfiniteTokens(spenderAddress) {
  try {
    const signer = await getSigner();
    const contract = getTokenContract(signer);
    const tx = await contract.approve(spenderAddress, MAX_UINT256);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error approving infinite tokens:', error);
    throw error;
  }
}

// Check if user has sufficient allowance (for infinite approval check)
export async function hasInfiniteAllowance(userAddress, spenderAddress) {
  try {
    const allowance = await getTokenAllowance(userAddress, spenderAddress);
    // Consider infinite if allowance is greater than 1 trillion tokens (1e18 with 6 decimals)
    return BigInt(allowance) > BigInt('1000000000000000000');
  } catch (error) {
    console.error('Error checking infinite allowance:', error);
    return false;
  }
}

// Sign disclaimer message using EIP-712 typed data for better UX and security
export async function signDisclaimerMessage(roomId, stakeAmount) {
  try {
    const signer = await getSigner();
    const signerAddress = await signer.getAddress();
    const chainId = (await signer.provider.getNetwork()).chainId;

    // EIP-712 Domain
    const domain = {
      name: 'BlockBet',
      version: '1',
      chainId: Number(chainId),
      verifyingContract: CONFIG.contracts.BettingRooms.address
    };

    // Type definitions for the structured data
    const types = {
      Disclaimer: [
        { name: 'participant', type: 'address' },
        { name: 'roomId', type: 'uint256' },
        { name: 'stakeAmount', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'terms', type: 'string' }
      ]
    };

    // The disclaimer message with terms
    const disclaimerTerms = `By signing this message, I acknowledge and agree to the following terms:

1. RISK ACKNOWLEDGMENT: I understand that participating in BlockBet betting rooms involves financial risk, and I may lose my entire stake.

2. NO GUARANTEES: I acknowledge that winning is based on chance and there are no guaranteed returns on my stake.

3. VOLUNTARY PARTICIPATION: I am participating voluntarily and am not under any coercion or undue influence.

4. FUNDS OWNERSHIP: I confirm that the funds I am staking belong to me and are not proceeds of illegal activities.

5. AGE & JURISDICTION: I confirm that I am of legal age and betting is legal in my jurisdiction.

6. IRREVERSIBLE: I understand that once I join the room, my stake cannot be withdrawn until room settlement.

7. SMART CONTRACT RISK: I understand the risks associated with blockchain technology and smart contracts.`;

    // Message value
    const message = {
      participant: signerAddress,
      roomId: parseInt(roomId),
      stakeAmount: stakeAmount,
      timestamp: Math.floor(Date.now() / 1000),
      terms: disclaimerTerms
    };

    // Sign the typed data using EIP-712
    const signature = await signer.signTypedData(domain, types, message);
    
    return {
      signature,
      message,
      domain,
      signerAddress
    };
  } catch (error) {
    console.error('Error signing disclaimer:', error);
    throw error;
  }
}

// =====================================================
// ADMIN-ONLY FUNCTIONS (Contract Owner Only)
// =====================================================

// Get contract owner address
export async function getContractOwner() {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const owner = await contract.owner();
    return owner;
  } catch (error) {
    console.error('Error fetching contract owner:', error);
    return null;
  }
}

// Get all users with their token balances (from contract)
export async function getAllUsersWithBalances() {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const result = await contract.getAllUsersWithBalances();
    
    const addresses = result[0] || result.addresses || [];
    const balances = result[1] || result.balances || [];
    
    return addresses.map((address, index) => ({
      address,
      balance: balances[index]?.toString() || '0'
    }));
  } catch (error) {
    console.error('Error fetching all users with balances:', error);
    return [];
  }
}

// Close a room (owner only)
export async function closeRoom(roomId) {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.closeRoom(roomId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error closing room:', error);
    throw error;
  }
}

// Settle room with random winner (owner only)
export async function settleRoomRandom(roomId) {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.settleRoomRandom(roomId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error settling room (random):', error);
    throw error;
  }
}

// Settle room with forced winner(s) (owner only)
export async function settleRoomForced(roomId, winners) {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.settleRoomForced(roomId, winners);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error settling room (forced):', error);
    throw error;
  }
}

// Create a new room (owner only)
export async function createRoom(minStakeAmount, maxStakeAmount, settlementTimestamp, payoutType) {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.createRoom(minStakeAmount, maxStakeAmount, settlementTimestamp, payoutType);
    const receipt = await tx.wait();
    return { hash: tx.hash, receipt };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Pause contract (owner only)
export async function pauseContract() {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.pause();
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error pausing contract:', error);
    throw error;
  }
}

// Unpause contract (owner only)
export async function unpauseContract() {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.unpause();
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error unpausing contract:', error);
    throw error;
  }
}

// Check if contract is paused
export async function isPaused() {
  try {
    const provider = getProvider();
    const contract = getBettingRoomsContract(provider);
    const paused = await contract.paused();
    return paused;
  } catch (error) {
    console.error('Error checking pause status:', error);
    return false;
  }
}

// Transfer tokens from one address to another (owner only)
export async function transferTokens(senderAddress, receiverAddress, amount) {
  try {
    const signer = await getSigner();
    const contract = getBettingRoomsContract(signer);
    const tx = await contract.transferTokens(senderAddress, receiverAddress, amount);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
}
