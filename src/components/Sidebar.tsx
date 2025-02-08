import { FC } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  BookmarkIcon,
  Square2StackIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-72 bg-white font-[var(--font-serif)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-black/5 flex flex-col overflow-hidden z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0h2v20H9V0zm25.134.84l1.732 1-10 17.32-1.732-1 10-17.32zm-20 20l1.732 1-10 17.32-1.732-1 10-17.32zM58.16 4.134l1 1.732-17.32 10-1-1.732 17.32-10zm-40 40l1 1.732-17.32 10-1-1.732 17.32-10zM80 9v2H60V9h20zM20 69v2H0v-2h20zm79.32-55l-1 1.732-17.32-10L82 4l17.32 10zm-80 80l-1 1.732-17.32-10L2 84l17.32 10zm37.32-5l-1 1.732-17.32-10L40 84l17.32 10zm-40-40l-1 1.732-17.32-10L0 44l17.32 10zm129.32-5l-1 1.732-17.32-10 1-1.732 17.32 10zM40 49v2H20v-2h20zm19.32-5l-1 1.732-17.32-10L42 34l17.32 10z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Logo */}
      <div className="relative z-10 p-6 border-b border-black/5 bg-gradient-to-r from-white/80 to-white/40">
        <Link href="/" className="block">
          <h1 className="text-xl font-medium bg-gradient-to-r from-[#1B1B1B] to-[#3B3B3B] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            autosurf.ai
          </h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 flex-1 p-4 bg-gradient-to-b from-white/80 via-white/60 to-white/40">
        <div className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`group flex items-center px-4 py-2.5 rounded-[14px] transition-all ${
              isActiveLink('/dashboard')
                ? 'bg-[#1B1B1B] text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20'
                : 'text-[#1B1B1B]/80 hover:text-[#1B1B1B] hover:bg-black/5 hover:shadow-md hover:shadow-black/5'
            }`}
          >
            <HomeIcon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
              isActiveLink('/dashboard') ? '' : 'group-hover:text-[#1B1B1B]'
            }`} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link 
            href="/saved-automations" 
            className={`group flex items-center px-4 py-2.5 rounded-[14px] transition-all ${
              isActiveLink('/saved-automations')
                ? 'bg-[#1B1B1B] text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20'
                : 'text-[#1B1B1B]/80 hover:text-[#1B1B1B] hover:bg-black/5 hover:shadow-md hover:shadow-black/5'
            }`}
          >
            <BookmarkIcon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
              isActiveLink('/automations') ? '' : 'group-hover:text-[#1B1B1B]'
            }`} />
            <span className="font-medium">Saved Automations</span>
          </Link>
          <div 
            className="group flex items-center px-4 py-2.5 rounded-[14px] text-[#1B1B1B]/40 cursor-not-allowed backdrop-blur-sm bg-white/40"
          >
            <Square2StackIcon className="w-5 h-5 mr-3" />
            <span className="font-medium">Workflows</span>
            <span className="ml-2 text-xs bg-[#1B1B1B]/5 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
        </div>
      </nav>

      {/* Bottom Profile and Logout */}
      <div className="relative z-10 p-4 border-t border-black/5 bg-gradient-to-b from-white/40 to-white/80">
        <Link 
          href="/profile" 
          className={`group flex items-center px-4 py-2.5 rounded-[14px] transition-all mb-2 ${
            isActiveLink('/profile')
              ? 'bg-[#1B1B1B] text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20'
              : 'text-[#1B1B1B]/80 hover:text-[#1B1B1B] hover:bg-black/5 hover:shadow-md hover:shadow-black/5'
          }`}
        >
          <UserCircleIcon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
            isActiveLink('/profile') ? '' : 'group-hover:text-[#1B1B1B]'
          }`} />
          <span className="font-medium">Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full group flex items-center px-4 py-2.5 text-left text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-[14px] transition-all hover:shadow-md hover:shadow-red-500/5"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 