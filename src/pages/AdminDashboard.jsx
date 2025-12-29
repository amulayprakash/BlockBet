import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Users, Home, RefreshCw, Lock, Unlock, AlertTriangle, 
  X, Check, DollarSign, Clock, ChevronDown, ChevronUp, 
  Play, Pause, LogOut, Wallet, Copy, ExternalLink, ArrowRightLeft, Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useWallet } from '../contexts/WalletContext';
import { 
  getContractOwner, 
  getAllRooms, 
  getAllUsersWithBalances,
  closeRoom,
  settleRoomRandom,
  settleRoomForced,
  createRoom,
  pauseContract,
  unpauseContract,
  isPaused,
  formatTokenAmount,
  parseTokenAmount,
  transferTokens,
  getTokenBalance
} from '../services/blockchain';
import { CountdownTimer } from '../components/CountdownTimer';
import { getErrorMessage } from '../utils/errorHandling';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { address, isConnected, isCorrectNetwork, disconnect } = useWallet();
  
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractOwner, setContractOwner] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [contractPaused, setContractPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');
  const [expandedRoom, setExpandedRoom] = useState(null);
  
  // Create room modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRoomForm, setCreateRoomForm] = useState({
    minStake: '',
    maxStake: '',
    settlementDate: '',
    settlementTime: '',
    payoutType: 0
  });

  // Transfer tokens state
  const [transferForm, setTransferForm] = useState({
    sender: '',
    receiver: '',
    amount: ''
  });
  const [senderBalance, setSenderBalance] = useState(null);
  const [showSenderDropdown, setShowSenderDropdown] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  // Check if user is owner
  const checkOwnership = useCallback(async () => {
    if (!address) {
      setIsOwner(false);
      setLoading(false);
      return;
    }

    try {
      const owner = await getContractOwner();
      setContractOwner(owner);
      const isOwnerAddress = owner && address.toLowerCase() === owner.toLowerCase();
      setIsOwner(isOwnerAddress);
      
      if (!isOwnerAddress) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Only the contract owner can access this page.',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        }).then(() => {
          navigate('/dashboard/rooms');
        });
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  }, [address, navigate]);

  // Fetch all data
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (!isOwner) return;
    
    if (showRefreshing) setRefreshing(true);
    
    try {
      const [roomsData, usersData, pausedStatus] = await Promise.all([
        getAllRooms(),
        getAllUsersWithBalances(),
        isPaused()
      ]);
      
      setRooms(roomsData);
      setUsers(usersData);
      setContractPaused(pausedStatus);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isOwner]);

  useEffect(() => {
    checkOwnership();
  }, [checkOwnership]);

  useEffect(() => {
    if (isOwner) {
      fetchData();
    }
  }, [isOwner, fetchData]);

  // Handle close room
  const handleCloseRoom = async (roomId) => {
    const result = await Swal.fire({
      title: 'Close Room?',
      text: `Are you sure you want to close Room #${roomId + 1}? This will prevent new players from joining.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, close it',
      background: '#1a1a2e',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Closing Room...',
          text: 'Please confirm the transaction in your wallet',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: '#1a1a2e',
          color: '#fff',
        });

        await closeRoom(roomId);
        
        Swal.fire({
          icon: 'success',
          title: 'Room Closed!',
          text: `Room #${roomId + 1} has been closed.`,
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
        
        fetchData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: getErrorMessage(error, 'Failed to close room'),
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // Handle settle room (random)
  const handleSettleRandom = async (roomId) => {
    const room = rooms.find(r => r.roomId === roomId);
    
    if (!room.closed) {
      Swal.fire({
        icon: 'warning',
        title: 'Room Not Closed',
        text: 'You must close the room before settling.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < room.settlementTimestamp) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Early',
        text: 'Cannot settle before the settlement time.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Settle Room (Random)?',
      text: `Settle Room #${roomId + 1} with a random winner?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, settle it',
      background: '#1a1a2e',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Settling Room...',
          text: 'Please confirm the transaction in your wallet',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: '#1a1a2e',
          color: '#fff',
        });

        await settleRoomRandom(roomId);
        
        Swal.fire({
          icon: 'success',
          title: 'Room Settled!',
          text: `Room #${roomId + 1} has been settled with a random winner.`,
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
        
        fetchData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: getErrorMessage(error, 'Failed to settle room'),
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // Handle settle room (forced)
  const handleSettleForced = async (roomId, players) => {
    const room = rooms.find(r => r.roomId === roomId);
    
    if (!room.closed) {
      Swal.fire({
        icon: 'warning',
        title: 'Room Not Closed',
        text: 'You must close the room before settling.',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    let selectedWinners = [];

    // SINGLE_WINNER: Select 1 winner
    if (room.payoutType === 0) {
      const { value: winnerAddress } = await Swal.fire({
        title: '<span style="color: #fff; font-weight: 700;">🏆 Select Winner</span>',
        html: `
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 16px; margin-top: 8px;">
            Choose the player who will receive the entire pool
          </p>
        `,
        input: 'select',
        inputOptions: players.reduce((acc, addr, idx) => {
          acc[addr] = `#${idx + 1}  •  ${addr.slice(0, 6)}...${addr.slice(-4)}`;
          return acc;
        }, {}),
        inputPlaceholder: '👤 Select a player...',
        showCancelButton: true,
        confirmButtonText: '✓ Confirm Winner',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#374151',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        width: '500px',
        padding: '2rem',
        customClass: {
          popup: 'swal-dark-popup',
          htmlContainer: 'swal-html-container',
          input: 'swal-dark-select',
        },
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            popup.style.borderRadius = '16px';
            popup.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            popup.style.maxWidth = '95vw';
          }

          const htmlContainer = popup.querySelector('.swal2-html-container');
          if (htmlContainer) {
            htmlContainer.style.margin = '0';
            htmlContainer.style.padding = '0 0 1rem 0';
          }

          const select = Swal.getInput();
          if (select) {
            select.style.cssText = `
              width: 100%;
              padding: 12px 40px 12px 16px;
              background: rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              color: #fff;
              font-size: 14px;
              font-family: inherit;
              cursor: pointer;
              appearance: none;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-position: right 12px center;
              background-size: 16px;
              transition: all 0.2s ease;
              margin: 0;
            `;
            
            select.addEventListener('focus', () => {
              select.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              select.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            });
            
            select.addEventListener('blur', () => {
              select.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              select.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            });
            
            Array.from(select.options).forEach(option => {
              option.style.cssText = `
                background: #1f2937;
                color: #fff;
                padding: 10px;
              `;
            });
          }

          const actions = popup.querySelector('.swal2-actions');
          if (actions) {
            actions.style.marginTop = '1.5rem';
            actions.style.gap = '0.75rem';
          }
        },
      });

      if (!winnerAddress) return;
      selectedWinners = [winnerAddress];
    } 
    // TOP_3: Select 3 winners
    else if (room.payoutType === 1) {
      if (players.length < 3) {
        Swal.fire({
          icon: 'warning',
          title: 'Not Enough Players',
          text: 'TOP_3 settlement requires at least 3 players.',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#f59e0b',
        });
        return;
      }

      const { value: formValues } = await Swal.fire({
        title: '<span style="color: #fff; font-weight: 700;">🥇 Select Top 3 Winners</span>',
        html: `
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 12px; margin-top: 8px;">
            Select exactly 3 winners (50% / 30% / 20% split)
          </p>
          <div style="max-height: 300px; overflow-y: auto; margin-top: 16px;">
            ${players.map((addr, idx) => `
              <label style="display: flex; align-items: center; padding: 10px; margin-bottom: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.2s;" class="winner-option" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">
                <input type="checkbox" name="winner" value="${addr}" style="width: 18px; height: 18px; cursor: pointer; margin-right: 12px;" />
                <span style="color: #fff; font-size: 14px; font-family: monospace;">#${idx + 1} • ${addr.slice(0, 6)}...${addr.slice(-4)}</span>
              </label>
            `).join('')}
          </div>
          <p id="selection-count" style="color: #9ca3af; font-size: 12px; margin-top: 12px;">0 / 3 winners selected</p>
        `,
        width: '550px',
        padding: '2rem',
        showCancelButton: true,
        confirmButtonText: '✓ Confirm Winners',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#374151',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        customClass: {
          popup: 'swal-dark-popup',
        },
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            popup.style.borderRadius = '16px';
            popup.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            popup.style.maxWidth = '95vw';
          }

          const checkboxes = popup.querySelectorAll('input[name="winner"]');
          const countDisplay = popup.querySelector('#selection-count');
          
          checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
              const checked = Array.from(checkboxes).filter(cb => cb.checked);
              countDisplay.textContent = `${checked.length} / 3 winners selected`;
              countDisplay.style.color = checked.length === 3 ? '#10b981' : '#9ca3af';
            });
          });
        },
        preConfirm: () => {
          const checkboxes = Swal.getPopup().querySelectorAll('input[name="winner"]:checked');
          if (checkboxes.length !== 3) {
            Swal.showValidationMessage('Please select exactly 3 winners');
            return false;
          }
          return Array.from(checkboxes).map(cb => cb.value);
        }
      });

      if (!formValues) return;
      selectedWinners = formValues;
    }

    // Confirm and settle
    if (selectedWinners.length > 0) {
      try {
        Swal.fire({
          title: 'Settling Room...',
          text: 'Please confirm the transaction in your wallet',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: '#1a1a2e',
          color: '#fff',
        });

        await settleRoomForced(roomId, selectedWinners);
        
        Swal.fire({
          icon: 'success',
          title: 'Room Settled!',
          text: `Room #${roomId + 1} has been settled with the selected winner${selectedWinners.length > 1 ? 's' : ''}.`,
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
        
        fetchData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: getErrorMessage(error, 'Failed to settle room'),
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // Handle pause/unpause
  const handleTogglePause = async () => {
    const action = contractPaused ? 'unpause' : 'pause';
    
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Contract?`,
      text: contractPaused 
        ? 'This will allow users to join rooms and create new activity.'
        : 'This will prevent any new activity on the contract.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: contractPaused ? '#10b981' : '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action} it`,
      background: '#1a1a2e',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: `${action.charAt(0).toUpperCase() + action.slice(1)}ing Contract...`,
          text: 'Please confirm the transaction in your wallet',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: '#1a1a2e',
          color: '#fff',
        });

        if (contractPaused) {
          await unpauseContract();
        } else {
          await pauseContract();
        }
        
        Swal.fire({
          icon: 'success',
          title: `Contract ${action}d!`,
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
        
        fetchData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: getErrorMessage(error, `Failed to ${action} contract`),
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  // Handle create room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    const minStake = parseTokenAmount(createRoomForm.minStake);
    const maxStake = parseTokenAmount(createRoomForm.maxStake);
    
    // Combine date and time to create a timestamp
    const dateTimeString = `${createRoomForm.settlementDate}T${createRoomForm.settlementTime}`;
    const settlementTimestamp = Math.floor(new Date(dateTimeString).getTime() / 1000);
    
    // Validate that the settlement time is in the future
    const now = Math.floor(Date.now() / 1000);
    if (settlementTimestamp <= now) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Settlement Time',
        text: 'Settlement time must be in the future',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#dc2626',
      });
      return;
    }
    
    try {
      Swal.fire({
        title: 'Creating Room...',
        text: 'Please confirm the transaction in your wallet',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: '#1a1a2e',
        color: '#fff',
      });

      await createRoom(minStake, maxStake, settlementTimestamp, createRoomForm.payoutType);
      
      Swal.fire({
        icon: 'success',
        title: 'Room Created!',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#10b981',
      });
      
      setShowCreateModal(false);
      setCreateRoomForm({ minStake: '', maxStake: '', settlementDate: '', settlementTime: '', payoutType: 0 });
      fetchData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: getErrorMessage(error, 'Failed to create room'),
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      timer: 1000,
      showConfirmButton: false,
      background: '#1a1a2e',
      color: '#fff',
    });
  };

  // Handle sender address input for autocomplete
  const handleSenderAddressChange = async (value) => {
    setTransferForm({ ...transferForm, sender: value });
    
    if (value.length > 0) {
      const filtered = users.filter(user => 
        user.address.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAddresses(filtered);
      setShowSenderDropdown(true);
    } else {
      setShowSenderDropdown(false);
      setSenderBalance(null);
    }
  };

  // Handle sender address selection from dropdown
  const handleSelectSenderAddress = async (address) => {
    setTransferForm({ ...transferForm, sender: address });
    setShowSenderDropdown(false);
    
    // Fetch balance for selected address
    try {
      const balance = await getTokenBalance(address);
      setSenderBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setSenderBalance(null);
    }
  };

  // Handle transfer tokens
  const handleTransferTokens = async (e) => {
    e.preventDefault();
    
    if (!transferForm.sender || !transferForm.receiver || !transferForm.amount) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    const amount = parseTokenAmount(transferForm.amount);
    
    const result = await Swal.fire({
      title: 'Confirm Transfer',
      html: `
        <div style="text-align: left; color: #9ca3af; font-size: 14px;">
          <p style="margin-bottom: 8px;"><strong style="color: #fff;">From:</strong> ${truncateAddress(transferForm.sender)}</p>
          <p style="margin-bottom: 8px;"><strong style="color: #fff;">To:</strong> ${truncateAddress(transferForm.receiver)}</p>
          <p><strong style="color: #fff;">Amount:</strong> ${transferForm.amount} USDT</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, transfer',
      background: '#1a1a2e',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Transferring Tokens...',
          text: 'Please confirm the transaction in your wallet',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          background: '#1a1a2e',
          color: '#fff',
        });

        await transferTokens(transferForm.sender, transferForm.receiver, amount);
        
        Swal.fire({
          icon: 'success',
          title: 'Transfer Successful!',
          text: `${transferForm.amount} USDT transferred successfully`,
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#10b981',
        });
        
        // Reset form
        setTransferForm({ sender: '', receiver: '', amount: '' });
        setSenderBalance(null);
        fetchData();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Transfer Failed',
          text: getErrorMessage(error, 'Failed to transfer tokens'),
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#dc2626',
        });
      }
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/dashboard/rooms');
  };

  // Stats calculations
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(r => !r.closed && !r.settled).length;
  const closedRooms = rooms.filter(r => r.closed && !r.settled).length;
  const settledRooms = rooms.filter(r => r.settled).length;
  const totalUsers = users.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying ownership...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">Please connect your wallet to access the admin dashboard.</p>
          <Link
            to="/dashboard/rooms"
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">Only the contract owner can access this page.</p>
          <Link
            to="/dashboard/rooms"
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-b border-red-500/30 shadow-lg shadow-red-500/10"
      >
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Admin<span className="text-red-500">Panel</span>
                </span>
                <span className="text-[10px] text-red-400 uppercase tracking-widest hidden sm:block">
                  Contract Owner
                </span>
              </div>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Contract Status */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                contractPaused 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {contractPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs font-medium">{contractPaused ? 'Paused' : 'Active'}</span>
              </div>

              {/* Wallet */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-300">
                  {truncateAddress(address)}
                </span>
              </div>

              <motion.button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">
                Manage rooms and view user balances
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => fetchData(true)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>

              <motion.button
                onClick={handleTogglePause}
                className={`px-4 py-2.5 border rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                  contractPaused
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {contractPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {contractPaused ? 'Unpause' : 'Pause'}
              </motion.button>

              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all text-sm flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-4 h-4" />
                Create Room
              </motion.button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Home className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Total Rooms</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalRooms}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">Active</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{activeRooms}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Closed</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{closedRooms}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Settled</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{settledRooms}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-red-400" />
                <span className="text-gray-400 text-sm">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'rooms'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4 inline-block mr-2" />
              Rooms ({totalRooms})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Users ({totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'transfers'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 inline-block mr-2" />
              Transfers
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {rooms.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
                    <Home className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No rooms created yet</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <motion.div
                      key={room.roomId}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                      layout
                    >
                      {/* Room Header */}
                      <div
                        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedRoom(expandedRoom === room.roomId ? null : room.roomId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                              <span className="text-white font-bold">#{room.roomId + 1}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-white">Room #{room.roomId + 1}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  room.settled 
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : room.closed
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {room.settled ? 'Settled' : room.closed ? 'Closed' : 'Active'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  {room.payoutType === 0 ? 'Single Winner' : 'Top 3'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {room.currentPlayers} players • Pool: {formatTokenAmount(room.totalPool)} USDT
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 md:gap-4">
                            {/* Quick Action Buttons - Always Visible */}
                            {!room.settled && (
                              <div className="flex items-center gap-2">
                                {!room.closed && (
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseRoom(room.roomId);
                                    }}
                                    className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-yellow-500/20 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    title="Close Room"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Close</span>
                                  </motion.button>
                                )}
                                {room.closed && (
                                  <>
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSettleRandom(room.roomId);
                                      }}
                                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      title="Settle with Random Winner"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Random</span>
                                    </motion.button>
                                    {room.payoutType === 0 && room.players && room.players.length > 0 && (
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSettleForced(room.roomId, room.players);
                                        }}
                                        className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-purple-500/20 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        title="Settle with Chosen Winner"
                                      >
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Forced</span>
                                      </motion.button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            
                            <div className="text-right hidden lg:block">
                              <p className="text-xs text-gray-400">Stake Range</p>
                              <p className="text-sm text-white">
                                {formatTokenAmount(room.minStakeAmount)} - {formatTokenAmount(room.maxStakeAmount)} USDT
                              </p>
                            </div>
                            <div className="text-right hidden lg:block">
                              <p className="text-xs text-gray-400">Settlement</p>
                              <CountdownTimer targetTimestamp={room.settlementTimestamp} compact />
                            </div>
                            {expandedRoom === room.roomId ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedRoom === room.roomId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10"
                          >
                            <div className="p-4 space-y-4">
                              {/* Players List */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Players ({room.currentPlayers})</h4>
                                {room.players && room.players.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {room.players.map((player, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500">#{idx + 1}</span>
                                          <span className="text-sm text-white font-mono">{truncateAddress(player)}</span>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(player);
                                          }}
                                          className="p-1 hover:bg-white/10 rounded"
                                        >
                                          <Copy className="w-3 h-3 text-gray-400" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No players yet</p>
                                )}
                              </div>

                              {/* Actions */}
                              {!room.settled && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                                  {!room.closed && (
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseRoom(room.roomId);
                                      }}
                                      className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-yellow-500/20 transition-colors"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Lock className="w-4 h-4" />
                                      Close Room
                                    </motion.button>
                                  )}
                                  {room.closed && (
                                    <>
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSettleRandom(room.roomId);
                                        }}
                                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-500/20 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Check className="w-4 h-4" />
                                        Settle (Random)
                                      </motion.button>
                                      {room.players && room.players.length > 0 && (
                                        <motion.button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSettleForced(room.roomId, room.players);
                                          }}
                                          className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-purple-500/20 transition-colors"
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <DollarSign className="w-4 h-4" />
                                          Settle (Choose Winner{room.payoutType === 1 ? 's' : ''})
                                        </motion.button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {users.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No users have participated yet</p>
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">#</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Address</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Token Balance</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr key={user.address} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-mono text-sm">{truncateAddress(user.address)}</span>
                                  <button
                                    onClick={() => copyToClipboard(user.address)}
                                    className="p-1 hover:bg-white/10 rounded"
                                  >
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-white font-medium">{formatTokenAmount(user.balance)}</span>
                                <span className="text-gray-400 ml-1">USDT</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a
                                  href={`https://sepolia.etherscan.io/address/${user.address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 hover:bg-white/10 rounded inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'transfers' && (
              <motion.div
                key="transfers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                      <ArrowRightLeft className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Transfer Tokens</h2>
                      <p className="text-sm text-gray-400">Transfer USDT from one address to another</p>
                    </div>
                  </div>

                  <form onSubmit={handleTransferTokens} className="space-y-6">
                    {/* Sender Address with Autocomplete */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <Search className="w-4 h-4 inline-block mr-1" />
                        Sender Address
                      </label>
                      <input
                        type="text"
                        value={transferForm.sender}
                        onChange={(e) => handleSenderAddressChange(e.target.value)}
                        onFocus={() => transferForm.sender && setShowSenderDropdown(true)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 font-mono text-sm"
                        placeholder="0x... or search addresses"
                        required
                      />
                      
                      {/* Autocomplete Dropdown */}
                      {showSenderDropdown && filteredAddresses.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {filteredAddresses.map((user, idx) => (
                            <button
                              key={user.address}
                              type="button"
                              onClick={() => handleSelectSenderAddress(user.address)}
                              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-white font-mono text-sm">{user.address}</span>
                                <span className="text-gray-400 text-xs">{formatTokenAmount(user.balance)} USDT</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Balance Display */}
                      {senderBalance !== null && (
                        <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Available Balance:</span>
                            <span className="text-lg font-bold text-emerald-400">
                              {formatTokenAmount(senderBalance)} USDT
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Receiver Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Receiver Address
                      </label>
                      <input
                        type="text"
                        value={transferForm.receiver}
                        onChange={(e) => setTransferForm({ ...transferForm, receiver: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 font-mono text-sm"
                        placeholder="0x..."
                        required
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Amount (USDT)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={transferForm.amount}
                          onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                          className="w-full px-4 py-3 pr-20 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="0.00"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <span className="text-gray-400 text-sm font-medium">USDT</span>
                        </div>
                      </div>
                      {senderBalance && transferForm.amount && (
                        <p className={`text-xs mt-1.5 ${
                          parseFloat(transferForm.amount) > parseFloat(formatTokenAmount(senderBalance))
                            ? 'text-red-400'
                            : 'text-gray-500'
                        }`}>
                          {parseFloat(transferForm.amount) > parseFloat(formatTokenAmount(senderBalance))
                            ? '⚠️ Amount exceeds sender balance'
                            : `✓ Valid amount`}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowRightLeft className="w-5 h-5" />
                      Transfer Tokens
                    </motion.button>
                  </form>

                  {/* Info Box */}
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 mb-1">Note</h3>
                        <p className="text-xs text-gray-400">
                          This function transfers tokens from the sender's wallet to the receiver's wallet. 
                          The sender must have already approved this contract to spend their tokens.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Room Modal - Enhanced */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Create New Room</h2>
                    <p className="text-sm text-gray-400">Set up a new betting room</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-6">
                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    ⚡ Quick Presets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const dateStr = tomorrow.toISOString().split('T')[0];
                        const timeStr = tomorrow.toTimeString().slice(0, 5);
                        setCreateRoomForm({ minStake: '10', maxStake: '100', settlementDate: dateStr, settlementTime: timeStr, payoutType: 0 });
                      }}
                      className="p-3 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 rounded-lg text-blue-400 text-sm font-medium transition-colors"
                    >
                      🎮 Quick Game<br/>
                      <span className="text-xs text-gray-500">Tomorrow</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        const dateStr = nextWeek.toISOString().split('T')[0];
                        const timeStr = '18:00';
                        setCreateRoomForm({ minStake: '50', maxStake: '500', settlementDate: dateStr, settlementTime: timeStr, payoutType: 1 });
                      }}
                      className="p-3 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 rounded-lg text-purple-400 text-sm font-medium transition-colors"
                    >
                      📅 Weekly<br/>
                      <span className="text-xs text-gray-500">Next Week</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMonth = new Date();
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        const dateStr = nextMonth.toISOString().split('T')[0];
                        const timeStr = '18:00';
                        setCreateRoomForm({ minStake: '100', maxStake: '1000', settlementDate: dateStr, settlementTime: timeStr, payoutType: 1 });
                      }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium transition-colors"
                    >
                      🏆 Monthly<br/>
                      <span className="text-xs text-gray-500">Next Month</span>
                    </button>
                  </div>
                </div>

                {/* Stake Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Minimum Stake (USDT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={createRoomForm.minStake}
                      onChange={(e) => setCreateRoomForm({ ...createRoomForm, minStake: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                      placeholder="10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Maximum Stake (USDT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={createRoomForm.maxStake}
                      onChange={(e) => setCreateRoomForm({ ...createRoomForm, maxStake: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                {/* Validation */}
                {createRoomForm.minStake && createRoomForm.maxStake && (
                  <div className={`p-3 rounded-lg text-sm ${
                    parseFloat(createRoomForm.minStake) <= parseFloat(createRoomForm.maxStake)
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}>
                    {parseFloat(createRoomForm.minStake) <= parseFloat(createRoomForm.maxStake)
                      ? '✓ Valid stake range'
                      : '⚠️ Min stake must be less than or equal to max stake'}
                  </div>
                )}

                {/* Settlement Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      📅 Settlement Date
                    </label>
                    <input
                      type="date"
                      value={createRoomForm.settlementDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCreateRoomForm({ ...createRoomForm, settlementDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 cursor-pointer [color-scheme:dark]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Settlement Time
                    </label>
                    <input
                      type="time"
                      value={createRoomForm.settlementTime}
                      onChange={(e) => setCreateRoomForm({ ...createRoomForm, settlementTime: e.target.value })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 cursor-pointer [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>

                {/* Settlement Preview */}
                {createRoomForm.settlementDate && createRoomForm.settlementTime && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm font-medium text-white mb-1">
                      🕒 Settlement Preview
                    </p>
                    <p className="text-xs text-gray-400">
                      Room will settle on: <span className="text-blue-400 font-medium">
                        {new Date(`${createRoomForm.settlementDate}T${createRoomForm.settlementTime}`).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>
                )}

                {/* Payout Type */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    🏆 Payout Type
                  </label>
                  <div className="relative">
                    <select
                      value={createRoomForm.payoutType}
                      onChange={(e) => setCreateRoomForm({ ...createRoomForm, payoutType: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '20px',
                        paddingRight: '48px'
                      }}
                    >
                      <option value={0} className="bg-gray-900 text-white py-2">🏆 Single Winner (100%)</option>
                      <option value={1} className="bg-gray-900 text-white py-2">🥇 Top 3 (50% / 30% / 20%)</option>
                    </select>
                  </div>
                  <div className={`mt-3 p-3 rounded-lg border ${
                    createRoomForm.payoutType === 0
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-purple-500/10 border-purple-500/30'
                  }`}>
                    <p className="text-sm font-medium text-white mb-1">
                      {createRoomForm.payoutType === 0 ? '👑 Winner Takes All' : '🥇 Top 3 Distribution'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {createRoomForm.payoutType === 0 
                        ? 'The winner receives 100% of the total pool'
                        : '1st: 50%, 2nd: 30%, 3rd: 20% of the total pool'}
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                {createRoomForm.minStake && createRoomForm.maxStake && createRoomForm.settlementDate && createRoomForm.settlementTime && (
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-2">📊 Room Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Stake Range:</span>
                        <p className="text-white font-medium">{createRoomForm.minStake} - {createRoomForm.maxStake} USDT</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Settlement:</span>
                        <p className="text-white font-medium">
                          {new Date(`${createRoomForm.settlementDate}T${createRoomForm.settlementTime}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                          {' '}at{' '}
                          {createRoomForm.settlementTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Payout:</span>
                        <p className="text-white font-medium">{createRoomForm.payoutType === 0 ? 'Single' : 'Top 3'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <p className="text-emerald-400 font-medium">Ready to create</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Home className="w-5 h-5" />
                    Create Room
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
