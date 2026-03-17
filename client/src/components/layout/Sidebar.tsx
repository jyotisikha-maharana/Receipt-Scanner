import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Upload, Settings, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/expenses', label: 'Expenses', icon: <Receipt size={18} /> },
  { to: '/upload', label: 'Upload', icon: <Upload size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-[#2CA01C] flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 text-[15px]">SmartReceipt</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#e8f5e9] text-[#2CA01C]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">SmartReceipt v1.0</p>
      </div>
    </aside>
  );
}
