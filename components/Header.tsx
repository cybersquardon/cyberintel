
import React from 'react';
import { ShieldIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-surface p-4 border-b border-brand-border shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <ShieldIcon className="w-8 h-8 text-brand-accent" />
        <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">
          Cyber Threat Intel Feed
        </h1>
      </div>
    </header>
  );
};

export default Header;
