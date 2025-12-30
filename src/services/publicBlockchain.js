import { ethers } from 'ethers';
import CONFIG from '../config/blockchain.js';

// Public RPC URLs for Sepolia (no wallet needed)
const PUBLIC_RPC_URLS = [
  'https://eth-sepolia.g.alchemy.com/v2/4UA7f8bHykMEEFhQrzD5ywYgN3y9bxJB',
  'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  'https://rpc.sepolia.org',
  'https://ethereum-sepolia.publicnode.com'
];

const TOKEN_DECIMALS = 6; // MockERC20 uses 6 decimals (matching USDT standard)

/**
 * Get a public provider (read-only, no wallet needed)
 * Uses public RPC endpoints with fallback support
 */
export function getPublicProvider() {
  // Try the primary RPC first
  try {
    return new ethers.JsonRpcProvider(PUBLIC_RPC_URLS[0]);
  } catch (error) {
    console.error('Failed to connect to primary RPC, trying fallback...', error);
    // Fallback to secondary RPC
    try {
      return new ethers.JsonRpcProvider(PUBLIC_RPC_URLS[1]);
    } catch (fallbackError) {
      console.error('Failed to connect to fallback RPC', fallbackError);
      // Last resort: use the third option
      return new ethers.JsonRpcProvider(PUBLIC_RPC_URLS[2]);
    }
  }
}

/**
 * Get BettingRooms contract instance (read-only)
 */
export function getPublicBettingRoomsContract() {
  const provider = getPublicProvider();
  return new ethers.Contract(
    CONFIG.contracts.BettingRooms.address,
    CONFIG.contracts.BettingRooms.abi,
    provider
  );
}

/**
 * Format token amount (uses TOKEN_DECIMALS by default)
 */
export function formatTokenAmount(amount, decimals = TOKEN_DECIMALS) {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}

/**
 * Get all active rooms (non-settled, non-closed)
 * This function can be called without wallet connection
 */
export async function getPublicActiveRooms() {
  try {
    const contract = getPublicBettingRoomsContract();
    const nextRoomId = await contract.nextRoomId();
    const roomCount = Number(nextRoomId);
    
    if (roomCount === 0) {
      return [];
    }
    
    const activeRooms = [];
    
    for (let i = 0; i < roomCount; i++) {
      try {
        // Fetch room data from contract
        const room = await contract.rooms(i);
        
        // Only include active rooms (not closed and not settled)
        if (!room.closed && !room.settled) {
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
          
          activeRooms.push({
            roomId: i,
            displayRoomId: i + 1, // Display as 1-indexed
            minStakeAmount: room.minStakeAmount.toString(),
            maxStakeAmount: room.maxStakeAmount.toString(),
            settlementTimestamp: Number(room.settlementTimestamp),
            currentPlayers: playerCount,
            totalPool: totalPool.toString(),
            players: players,
            closed: room.closed,
            settled: room.settled,
            payoutType: Number(room.payoutType), // 0 = SINGLE_WINNER, 1 = TOP_3
            // Formatted values for display
            minStakeFormatted: formatTokenAmount(room.minStakeAmount.toString()),
            maxStakeFormatted: formatTokenAmount(room.maxStakeAmount.toString()),
            totalPoolFormatted: formatTokenAmount(totalPool.toString()),
          });
        }
      } catch (error) {
        console.error(`Error fetching room ${i}:`, error);
        // Continue to next room instead of breaking
      }
    }
    
    return activeRooms;
  } catch (error) {
    console.error('Error fetching public active rooms:', error);
    return [];
  }
}

/**
 * Get all rooms (including settled and closed)
 * This function can be called without wallet connection
 */
export async function getAllPublicRooms() {
  try {
    const contract = getPublicBettingRoomsContract();
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
          displayRoomId: i + 1, // Display as 1-indexed
          minStakeAmount: room.minStakeAmount.toString(),
          maxStakeAmount: room.maxStakeAmount.toString(),
          settlementTimestamp: Number(room.settlementTimestamp),
          currentPlayers: playerCount,
          totalPool: totalPool.toString(),
          players: players,
          closed: room.closed,
          settled: room.settled,
          payoutType: Number(room.payoutType), // 0 = SINGLE_WINNER, 1 = TOP_3
          // Formatted values for display
          minStakeFormatted: formatTokenAmount(room.minStakeAmount.toString()),
          maxStakeFormatted: formatTokenAmount(room.maxStakeAmount.toString()),
          totalPoolFormatted: formatTokenAmount(totalPool.toString()),
        });
      } catch (error) {
        console.error(`Error fetching room ${i}:`, error);
        // Continue to next room instead of breaking
      }
    }
    
    return rooms;
  } catch (error) {
    console.error('Error fetching all public rooms:', error);
    return [];
  }
}

/**
 * Get detailed information about a specific room
 * This function can be called without wallet connection
 */
export async function getPublicRoomDetails(roomId) {
  try {
    const contract = getPublicBettingRoomsContract();
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
      displayRoomId: Number(roomId) + 1, // Display as 1-indexed
      minStakeAmount: room.minStakeAmount.toString(),
      maxStakeAmount: room.maxStakeAmount.toString(),
      settlementTimestamp: Number(room.settlementTimestamp),
      currentPlayers: players.length,
      totalPool: totalPool.toString(),
      players: players,
      closed: room.closed,
      settled: room.settled,
      payoutType: Number(room.payoutType),
      // Formatted values for display
      minStakeFormatted: formatTokenAmount(room.minStakeAmount.toString()),
      maxStakeFormatted: formatTokenAmount(room.maxStakeAmount.toString()),
      totalPoolFormatted: formatTokenAmount(totalPool.toString()),
    };
  } catch (error) {
    console.error(`Error fetching public room details for room ${roomId}:`, error);
    return null;
  }
}

/**
 * Get the total number of rooms
 * This function can be called without wallet connection
 */
export async function getPublicRoomCount() {
  try {
    const contract = getPublicBettingRoomsContract();
    const nextRoomId = await contract.nextRoomId();
    return Number(nextRoomId);
  } catch (error) {
    console.error('Error fetching public room count:', error);
    return 0;
  }
}
