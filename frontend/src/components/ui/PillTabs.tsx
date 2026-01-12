import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface PillTabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  activeKey,
  onChange,
  className = '',
}) => {
  // Check if animations should be reduced (mobile or OS preference)
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside as EventListener);
      document.addEventListener('touchstart', handleClickOutside as EventListener);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [isOpen]);

  const activeTab = tabs.find((tab) => tab.key === activeKey);

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {/* Mobile Custom Dropdown (screens < 1024px) */}
      <div className="lg:hidden w-full" ref={dropdownRef}>
        <div className="relative w-full">
          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span>{activeTab?.label}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 ${!prefersReducedMotion ? 'transition-transform duration-200' : ''} ${
                isOpen && !prefersReducedMotion ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              {tabs.map((tab) => (
                <button
                  key={`mobile-${tab.key}`}
                  type="button"
                  onClick={() => handleSelect(tab.key)}
                  className={`w-full px-6 py-3.5 text-left text-base font-semibold ${!prefersReducedMotion ? 'transition-colors' : ''} ${
                    tab.key === activeKey
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Pills (screens ≥ 1024px) */}
      <div className="hidden lg:block p-1.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-full">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={`desktop-${tab.key}`}
              onClick={() => onChange(tab.key)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap ${!prefersReducedMotion ? 'transition-all duration-300' : ''} ${
                tab.key === activeKey
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PillTabs;
