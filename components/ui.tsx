import React from 'react';
import { Star, CheckCircle, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import { ModType } from '../types';

export const Badge: React.FC<{ type: 'success' | 'warning' | 'info' | 'error' | 'featured', children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    featured: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-lg transform skew-x-[-10deg]'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${styles[type]} uppercase tracking-wider`}>
      {children}
    </span>
  );
};

export const ModBadge: React.FC<{ type: ModType }> = ({ type }) => {
  if (type === ModType.ORIGINAL) {
    return <Badge type="info">Original</Badge>;
  }
  return <Badge type="success">MOD</Badge>;
};

export const StarRating: React.FC<{ rating: number, count?: number, size?: number }> = ({ rating, count, size = 16 }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.5)]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={size} 
            fill={star <= Math.round(rating) ? "currentColor" : "none"} 
            className={star <= Math.round(rating) ? "" : "text-slate-600"}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-200">{rating}</span>
      {count && <span className="text-xs text-slate-400">({(count / 1000).toFixed(1)}K)</span>}
    </div>
  );
};

export const VirusScanBadge: React.FC<{ status: 'clean' | 'flagged' | 'pending' }> = ({ status }) => {
  if (status === 'clean') {
    return (
      <div className="flex items-center gap-1 text-white text-xs font-bold bg-green-600 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(22,163,74,0.4)]">
        <CheckCircle size={14} />
        <span>Clean</span>
      </div>
    );
  }
  if (status === 'flagged') {
    return (
       <div className="flex items-center gap-1 text-white text-xs font-bold bg-red-600 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(220,38,38,0.4)]">
        <AlertTriangle size={14} />
        <span>Flagged</span>
      </div>
    );
  }
  return <span className="text-slate-500 text-xs">Scan Pending...</span>;
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'glow' }> = ({ className = '', variant = 'primary', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide";
  
  const variants = {
    // Orange/Red Gradient (Login/Download)
    primary: "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-500/20",
    
    // Green Gradient (Read More/Clean)
    success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/20",
    
    // Glass/Outline
    secondary: "bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-400",
    
    // Danger
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/20",
    
    // Ghost
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",

    // Neon Glow (Cyan)
    glow: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
  };
  
  const sizes = "px-6 py-2.5 text-sm"; 

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes} ${className}`} {...props} />
  );
};
