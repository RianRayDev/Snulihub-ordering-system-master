import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Menu, Transition } from '@headlessui/react'
import { 
  UserCircleIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import StatusIndicator from '../components/StatusIndicator'
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const db = getFirestore();

export default function Navbar() {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const { currentUser, logout, isCustomer, isFranchise } = useAuth();
  const navigate = useNavigate();
  const isTestAdmin = localStorage.getItem('testAdmin') === 'true';
  const isAdmin = currentUser?.category === 'webmaster';

  const handleLogout = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          isOnline: false,
          lastActiveAt: serverTimestamp()
        });
      }
      
      logout();
      localStorage.removeItem('testAdmin');
      localStorage.removeItem('browserSessionId');
      localStorage.removeItem('sessionEmail');
      navigate('/');
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const ProfileIcon = () => (
    <svg
      className="h-10 w-10"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        cx="20" 
        cy="20" 
        r="20" 
        className="fill-[url(#gradient-bg)]"
      />
      
      <g filter="url(#shadow)">
        <circle 
          cx="20" 
          cy="15" 
          r="6.5" 
          className="fill-[url(#gradient-profile)]"
        />
        <path
          d="M32 31.5C32 27.4 26.6274 24.5 20 24.5C13.3726 24.5 8 27.4 8 31.5"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-[#82a6f4]"
          style={{ opacity: 0.9 }}
        />
      </g>

      <defs>
        <linearGradient
          id="gradient-bg"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#82a6f4" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#82a6f4" stopOpacity="0.12" />
        </linearGradient>
        
        <linearGradient
          id="gradient-profile"
          x1="15"
          y1="10"
          x2="25"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#82a6f4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#82a6f4" stopOpacity="0.8" />
        </linearGradient>

        <filter
          id="shadow"
          x="-2"
          y="-2"
          width="44"
          height="44"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.509804 0 0 0 0 0.65098 0 0 0 0 0.956863 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_0_1"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_0_1"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );

  return (
    <nav className="bg-white shadow-sm w-full sticky top-0 z-[999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-[#8cd0ff]">
            SnuliHub Store
          </Link>
          
          <div className="flex items-center gap-4">
            {(currentUser || isTestAdmin) && (
              <Menu as="div" className="relative">
                <Menu.Button className="group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200 focus:outline-none">
                  <div className="relative transform transition-transform duration-200 group-hover:scale-105">
                    <ProfileIcon />
                    <StatusIndicator 
                      isOnline={currentUser?.isOnline}
                      lastActiveAt={currentUser?.lastActiveAt}
                      userId={sessionStorage.getItem('userId')}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      {currentUser?.username || 'User'}
                    </span>
                    <span className="text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                      {currentUser?.userId || sessionStorage.getItem('userId')}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </Menu.Button>

                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/"
                          className={`flex items-center px-4 py-2.5 text-sm text-gray-700 ${
                            active ? 'bg-gray-50' : ''
                          }`}
                        >
                          <HomeIcon className="h-4 w-4 mr-2 text-[#8cd0ff]" />
                          Visit Store
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`flex items-center w-full px-4 py-2.5 text-sm text-gray-700 ${
                            active ? 'bg-gray-50' : ''
                          }`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 text-[#8cd0ff]" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                    <div className="px-4 py-2.5 text-xs text-gray-400 border-t border-gray-100">
                      More options coming soon...
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {(!currentUser && !isTestAdmin) && (
              <Link to="/checkout" className="relative text-gray-600 hover:text-[#8cd0ff] transition-colors">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8cd0ff] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
