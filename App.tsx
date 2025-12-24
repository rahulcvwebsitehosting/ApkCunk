import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { 
  Search, Menu, X, Download, Shield, LayoutGrid, 
  Upload, Smartphone, BarChart3, Settings, LogOut,
  ChevronRight, RefreshCw, FileCode, Check, AlertTriangle,
  Wand2, Gamepad2, Layers, Cpu, User, ShieldCheck, Play, Lock, Eye, EyeOff, Link as LinkIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from './services/mockApi';
import { AppData, ModType, AppVersion, AppCategory, AppSubCategory } from './types';
import { Badge, StarRating, VirusScanBadge, Button } from './components/ui';
import { GoogleGenAI } from "@google/genai";

// --- Custom Icons for exact replica feel ---
const HexIcon = ({ children }: { children?: React.ReactNode }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-blue-500/20 fill-current stroke-blue-400 stroke-2">
      <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" />
    </svg>
    <div className="relative z-10 text-cyan-100">
      {children}
    </div>
  </div>
);

// --- Auth Context ---
// Simple state management for demo purposes
interface AuthContextType {
  isAuthenticated: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>(null!);

const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (u: string, p: string) => {
    if (u === 'adminup@apkcunk.com' && p === 'ApkCunk0000') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// --- Components ---

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-[#1e2847] to-[#2a3454] rounded-[28px] px-6 py-3 mb-6 border border-[#3a4a6a]/40 shadow-lg mx-4 mt-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <svg className="w-8 h-8 text-[#0a0e27]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
            </svg>
            <div className="absolute -right-1 -top-1 w-3 h-3">
              <div className="w-full h-full bg-cyan-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          <span className="text-3xl font-black tracking-tight text-white hidden sm:block">ApkCunk</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 sm:mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 group-hover:text-cyan-300 transition-colors" />
            <input 
              type="text"
              placeholder="Find your next adventure..."
              className="w-full bg-[#0f1629] border-2 border-cyan-400/30 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] placeholder-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Login Button */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden md:block">
            <button className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-7 py-2 rounded-full font-bold text-sm text-white hover:from-orange-400 hover:to-red-500 transition-all shadow-lg hover:shadow-orange-500/20">
              LOGIN
            </button>
          </Link>
          <button className="bg-[#3a4563] p-2.5 rounded-full hover:bg-[#4a5573] transition-all text-white">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- Views ---

const HomeView: React.FC = () => {
  const [featured, setFeatured] = useState<AppData[]>([]);
  const [latest, setLatest] = useState<AppData[]>([]);
  const [activeTab, setActiveTab] = useState('Games');

  useEffect(() => {
    // Re-fetch when mounting to ensure newly added apps appear
    api.getFeaturedApps().then(setFeatured);
    api.getLatestApps().then(setLatest);
  }, []);

  const featuredApp = featured[0];

  return (
    <div className="min-h-screen bg-[#0a0e27] text-slate-200 pb-12 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <Navbar />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Featured App Section */}
            {featuredApp ? (
              <div className="bg-gradient-to-br from-[#1a2342] via-[#1e2847] to-[#1a2342] rounded-[32px] p-6 sm:p-8 border border-cyan-500/20 relative overflow-hidden group">
                {/* Geometric Background Elements */}
                <div className="absolute top-8 right-16 w-28 h-28 border-2 border-cyan-400/20 rotate-45 rounded-lg transition-transform duration-1000 group-hover:rotate-90"></div>
                <div className="absolute top-20 right-24 w-16 h-16 border-2 border-cyan-400/15 rotate-12 rounded-md"></div>
                <div className="absolute top-12 right-8 opacity-50">
                  <div className="w-2 h-12 bg-cyan-400/30 rotate-45"></div>
                  <div className="w-2 h-12 bg-cyan-400/30 rotate-45 ml-1 mt-1"></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                  {/* App Icon */}
                  <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-purple-500/30 border-4 border-cyan-400/30 overflow-hidden">
                       <img src={featuredApp.iconUrl} alt={featuredApp.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* App Details */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-1 text-white">{featuredApp.name}</h1>
                        <p className="text-slate-400 text-sm">{featuredApp.developer}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2 rounded-lg font-black text-xs uppercase shadow-lg transform rotate-2 text-white border border-blue-400/50">
                        Featured
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-6">
                      <StarRating rating={featuredApp.rating} size={20} />
                    </div>

                    <Link to={`/app/${featuredApp.id}`}>
                      <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 px-8 py-3 rounded-lg font-bold text-sm text-white transition-all shadow-lg hover:shadow-green-500/30 uppercase tracking-wide">
                        Read More
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
               <div className="h-64 bg-[#1a2342] rounded-[32px] animate-pulse"></div>
            )}

            {/* Latest Updates Section */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-[28px] p-6 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Latest Updates</h2>
                <button className="text-cyan-400 text-2xl leading-none hover:text-cyan-300">−<span className="sr-only">Collapse</span></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description Column */}
                <div className="bg-[#0f1629] rounded-2xl p-5 border border-[#2a3454]">
                  <h3 className="font-bold mb-4 text-sm text-white">Description</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">SHORT DESCRIPTION</p>
                      <p className="text-xs text-slate-500 font-mono">{featuredApp?.shortDescription || "Loading description..."}</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">FULL DESCRIPTION</p>
                      <p className="text-xs text-slate-500 line-clamp-3 font-mono" dangerouslySetInnerHTML={{ __html: featuredApp?.fullDescription || "" }}></p>
                    </div>
                  </div>
                </div>

                {/* Version Info Column */}
                <div className="space-y-3">
                  <div className="bg-[#0f1629] rounded-2xl p-5 border border-[#2a3454] h-full relative">
                     {/* Decorative Icon */}
                     <div className="absolute top-4 right-4 text-cyan-500/20">
                         <RefreshCw size={24} />
                     </div>

                    <div className="grid grid-cols-2 gap-y-3 mb-4">
                        <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Version</span>
                            <span className="text-xs font-mono text-white">{featuredApp?.currentVersion}</span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Updated</span>
                            <span className="text-xs font-mono text-white">{featuredApp?.updatedDate}</span>
                        </div>
                         <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Size</span>
                            <span className="text-xs font-mono text-white">Varies</span>
                        </div>
                         <div>
                            <span className="text-xs text-slate-400 block mb-0.5">Last Updated</span>
                            <span className="text-xs font-mono text-white">Yesterday</span>
                        </div>
                    </div>

                    <div className="bg-[#1a2342] rounded-lg p-3 text-[10px] text-slate-500 font-mono leading-relaxed h-20 overflow-y-auto border border-[#2a3454]">
                      <div className="text-cyan-400 mb-1">PATCH NOTES:</div>
                      - Performance improvements<br/>
                      - Bug fixes in multiplayer<br/>
                      - Added new secure login<br/>
                      - Optimized for Android 14
                    </div>
                    
                    <button className="w-8 h-8 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center justify-center ml-auto mt-3 border border-cyan-500/30 transition-colors">
                      <span className="text-cyan-400 text-lg leading-none mb-0.5">↓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* App Information Section */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-[28px] p-6 border border-cyan-500/20">
              <h2 className="text-xl font-bold mb-4 text-white">App Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {[
                    { icon: '📱', label: 'App Management' },
                    { icon: '➕', label: 'Add New Apps' },
                    { icon: '⬇', label: 'Uploads' },
                    { icon: '⭐', label: 'Google Play URL', arrow: true },
                    { icon: '🎮', label: 'Manual Entry', arrow: true },
                    { icon: '⚙', label: 'Featured Content' },
                    { icon: '🔍', label: 'Manual Entry', arrow: true },
                    { icon: '⊞', label: 'Opus Obstiles', arrow: true },
                    { icon: '⚔', label: 'Mod Manager', arrow: true }
                ].map((item, idx) => (
                    <button key={idx} className="bg-[#0f1629] hover:bg-[#1a2342] border border-[#2a3454] hover:border-cyan-500/30 rounded-xl px-4 py-3 text-left text-sm transition-all flex items-center justify-between group">
                        <span className="flex items-center gap-3 font-medium text-slate-300 group-hover:text-white">
                            <span className="text-lg opacity-80">{item.icon}</span> {item.label}
                        </span>
                        {item.arrow && <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />}
                    </button>
                ))}
              </div>

              {/* Critical Notice */}
              <div className="border-2 border-red-500/40 bg-red-950/20 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex gap-4 items-center flex-1">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30 text-2xl">
                    ⚠
                  </div>
                  <div>
                    <p className="font-bold text-red-400 text-sm mb-1 uppercase tracking-wide">CRITICAL LEGAL NOTICE</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Automated scraping of metadata may violate Terms of Service. Ensure you have rights to distribute content.</p>
                  </div>
                </div>
                <button className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 py-2.5 px-8 rounded-lg font-bold text-sm text-white transition-all shadow-lg shadow-red-900/20">
                  CONTINUE
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-4 space-y-4">
            {/* App Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {latest.slice(0, 6).map((app, idx) => (
                <Link to={`/app/${app.id}`} key={idx} className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-2xl p-3 border border-cyan-500/10 hover:border-cyan-500/40 transition-all group">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={app.iconUrl} alt="" className="w-10 h-10 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs text-white truncate group-hover:text-cyan-400">{app.name}</h3>
                      <p className="text-[10px] text-slate-400 truncate">{app.developer}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-500">{app.category}</span>
                    <span className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold">MOD</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                       <StarRating rating={app.rating} size={10} />
                    </div>
                    <div className="w-6 h-6 bg-slate-700/50 hover:bg-cyan-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                      <Download className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Category Tabs */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-2xl p-2 border border-cyan-500/20 flex items-center gap-2">
              {['Games', 'Apps', 'Tools'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                        activeTab === tab 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-[#2a3454] hover:text-white'
                    }`}
                >
                    {tab}
                </button>
              ))}
              <button className="p-2 text-slate-400 hover:text-white hover:bg-[#2a3454] rounded-xl transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* What's New */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="font-bold mb-4 text-sm text-white">What's New</h3>
              <div className="space-y-3">
                {[
                  { label: 'Updated', value: '0.7.13.22', icon: <RefreshCw size={12}/> },
                  { label: 'Size', value: '145 MB', icon: <FileCode size={12}/> },
                  { label: 'MD5', value: 'a1b...2c3', icon: <Settings size={12}/> },
                  { label: 'Scan', value: 'Clean', icon: <ShieldCheck size={12}/> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="flex items-center gap-2 text-slate-400">
                      <span className="text-cyan-500">{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Grid (Hexagons) */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-2xl p-5 border border-cyan-500/20">
               <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: <Gamepad2 size={20} />, color: 'text-cyan-400' },
                        { icon: <Cpu size={20} />, color: 'text-purple-400' },
                        { icon: <Layers size={20} />, color: 'text-orange-400' },
                        { icon: <Settings size={20} />, color: 'text-green-400' },
                        { icon: <Smartphone size={20} />, color: 'text-blue-400' },
                        { icon: <Wand2 size={20} />, color: 'text-pink-400' }
                    ].map((item, i) => (
                        <button key={i} className="aspect-square relative group">
                            <HexIcon>
                                <div className={`${item.color} transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}>
                                    {item.icon}
                                </div>
                            </HexIcon>
                        </button>
                    ))}
               </div>
            </div>

            {/* Downloads Available */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="font-bold mb-4 text-sm text-white">Downloads Available</h3>

              <div className="space-y-3">
                {featuredApp?.versions.map((ver, idx) => (
                     <div key={idx} className="bg-[#0f1629] rounded-xl p-3 border border-[#2a3454] flex items-center gap-3 group hover:border-cyan-500/30 transition-colors">
                        <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-lg flex-shrink-0 text-purple-300">
                            {ver.modType === ModType.ORIGINAL ? <Smartphone size={18} /> : <Wand2 size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-white truncate">{ver.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ver.size}</p>
                        </div>
                        <Link to={`/download/${featuredApp.id}/${ver.id}`}>
                            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 px-4 py-1.5 rounded-lg font-bold text-[10px] text-white transition-all shadow-lg shadow-orange-900/20">
                            GET APK
                            </button>
                        </Link>
                    </div>
                ))}
              </div>
            </div>

            {/* Disclaimers */}
            <div className="bg-gradient-to-br from-[#1a2342] to-[#1e2847] rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="font-bold mb-3 text-sm text-white">Disclaimers</h3>
              
              <div className="border border-red-500/30 bg-red-950/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-red-400 text-xs mb-1 uppercase">Play Store Warning</p>
                    <p className="text-[10px] text-slate-300 leading-relaxed opacity-80">
                       Content is user-uploaded and scraped. APX holds no responsibility for the files hosted here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Floating Search Button (Bottom Right) */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all shadow-2xl border-2 border-slate-600 z-50">
        <Search className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

const AppDetailView: React.FC = () => {
  const { id } = useParams();
  const [app, setApp] = useState<AppData | null>(null);

  useEffect(() => {
    if (id) {
        api.getAppById(id).then(data => setApp(data || null));
    }
  }, [id]);

  if (!app) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
            <ChevronRight className="rotate-180" size={16}/> Back to Dashboard
        </Link>
        
        <div className="glass-panel rounded-[32px] p-8 border border-cyan-500/20">
            <div className="flex flex-col md:flex-row gap-8">
                <img src={app.iconUrl} alt={app.name} className="w-32 h-32 rounded-[24px] shadow-2xl border-2 border-white/10" />
                <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{app.name}</h1>
                    <p className="text-cyan-400 font-mono mb-4">{app.developer}</p>
                    <StarRating rating={app.rating} size={20} />
                    <div className="mt-6 flex flex-wrap gap-3">
                        {app.versions.map(v => (
                             <Link key={v.id} to={`/download/${app.id}/${v.id}`}>
                                <Button variant="primary" className="text-xs uppercase tracking-wider">
                                    Download {v.label}
                                </Button>
                             </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><FileCode className="text-purple-400"/> Description</h3>
                    <div className="prose prose-invert text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: app.fullDescription }} />
                </div>
                <div>
                     <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Layers className="text-cyan-400"/> Screenshots</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {app.screenshots.map((s, i) => (
                            <img key={i} src={s} className="rounded-xl border border-white/5 shadow-lg hover:scale-105 transition-transform duration-300" />
                        ))}
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const DownloadView: React.FC = () => {
    const { appId, versionId } = useParams();
    const [countdown, setCountdown] = useState(5);
    const [ready, setReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the specific version link
        if (appId && versionId) {
            api.getAppById(appId).then(app => {
                if (app) {
                    const ver = app.versions.find(v => v.id === versionId);
                    if (ver) {
                        setDownloadUrl(ver.fileUrl);
                    }
                }
            });
        }
    }, [appId, versionId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setReady(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleDownload = () => {
        if (downloadUrl) {
            // In a real app, this would be a direct download or a filtered signed URL
            window.location.href = downloadUrl;
        } else {
            alert("Download link is missing or expired.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] flex flex-col items-center justify-center p-4">
             <div className="glass-panel max-w-md w-full rounded-3xl p-12 text-center border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-gradient-x"></div>
                 
                 <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(6,182,212,0.4)] relative">
                     <Download size={48} className="text-white z-10" />
                     <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white mb-4">Securing Link...</h2>
                 
                 {!ready ? (
                     <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 font-mono mb-8">
                         {countdown}
                     </div>
                 ) : (
                     <Button 
                        onClick={handleDownload}
                        variant="primary" 
                        className="w-full h-16 text-xl shadow-[0_0_25px_rgba(249,115,22,0.4)] animate-bounce-slight"
                     >
                         START DOWNLOAD
                     </Button>
                 )}
                 
                 <p className="text-slate-500 text-xs mt-8">
                     Encrypted via 256-bit SSL • VirusTotal Checked
                 </p>
             </div>
        </div>
    );
};

// --- Admin Views ---

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
             <Lock className="w-8 h-8 text-[#0a0e27]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Console</h2>
          <p className="text-slate-400 text-sm mt-2">Secure access for ApkCunk administrators only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f1629] border-2 border-slate-700 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder-slate-600"
                placeholder="admin@apkcunk.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f1629] border-2 border-slate-700 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder-slate-600"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <Button variant="primary" type="submit" className="w-full py-4 text-base shadow-lg hover:shadow-orange-500/30">
            Authenticate
          </Button>
        </form>

        <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                &larr; Return to Website
            </Link>
        </div>
      </div>
    </div>
  );
};

// Fix: Make children optional to resolve "Property 'children' is missing" error
const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] flex">
            {/* Sidebar (Desktop) */}
            <aside className="w-72 bg-[#1e293b] border-r border-white/5 flex-shrink-0 hidden md:flex flex-col">
                <div className="h-24 flex items-center px-8 border-b border-white/5">
                    <span className="font-black text-2xl text-white tracking-tight">ApkCunk<span className="text-cyan-400">.</span></span>
                </div>
                <div className="p-6 space-y-2 overflow-y-auto flex-1">
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                        <LayoutGrid size={20} /> Dashboard
                    </Link>
                    <Link to="/admin/add" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-medium">
                        <Upload size={20} /> Add Application
                    </Link>
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-medium mt-8">
                        <LogOut size={20} /> Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-[#1e293b] h-20 border-b border-white/5 flex items-center justify-between px-8">
                     <h1 className="text-lg font-bold text-white">Admin Console</h1>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            A
                        </div>
                     </div>
                </header>
                <main className="flex-1 p-8 overflow-y-auto bg-[#0f172a]">
                    {children}
                </main>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const data = [
      { name: 'Games', value: 400 },
      { name: 'Apps', value: 300 },
      { name: 'Tools', value: 300 },
    ];
    const COLORS = ['#06b6d4', '#8b5cf6', '#f97316'];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#1e293b]/50">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Downloads</div>
                    <div className="text-4xl font-black text-white mt-2">2.4M</div>
                    <div className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                        <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded">↑ 12%</span> this week
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#1e293b]/50">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Active Mods</div>
                    <div className="text-4xl font-black text-purple-400 mt-2">1,240</div>
                </div>
                 <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#1e293b]/50">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Server Load</div>
                    <div className="text-4xl font-black text-cyan-400 mt-2">24%</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#1e293b]/50">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Pending Scans</div>
                    <div className="text-4xl font-black text-orange-400 mt-2">5</div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#1e293b]/50">
                    <h3 className="font-bold text-white text-xl mb-6">Content Distribution</h3>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '12px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex justify-center gap-6 mt-4">
                        {data.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                                <span className="text-slate-300 text-sm font-medium">{d.name}</span>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#1e293b]/50">
                    <h3 className="font-bold text-white text-xl mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                                    <RefreshCw size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium text-sm">Metadata Refresh</div>
                                    <div className="text-slate-500 text-xs">com.example.app{i} • 2 mins ago</div>
                                </div>
                                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">SUCCESS</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminAddApp: React.FC = () => {
    const navigate = useNavigate();
    const [packageId, setPackageId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchedData, setFetchedData] = useState<Partial<AppData> | null>(null);
    const [description, setDescription] = useState('');
    
    // Admin specific inputs for Mods
    const [modDetails, setModDetails] = useState('');
    const [downloadLink, setDownloadLink] = useState('');

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.fetchMetadataFromPlay(packageId);
            setFetchedData(data);
            setDescription(data.fullDescription || '');
            setModDetails('Unlimited Money, Premium Unlocked'); // Default suggestions
            setDownloadLink('https://example.com/download.apk');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!fetchedData) return;

        // Construct the new App object
        const newApp: AppData = {
            id: Math.random().toString(36).substr(2, 9),
            packageId: fetchedData.packageId || packageId,
            name: fetchedData.name || 'New App',
            developer: fetchedData.developer || 'Unknown',
            iconUrl: fetchedData.iconUrl || '',
            shortDescription: fetchedData.shortDescription || '',
            fullDescription: description,
            category: (fetchedData.category as AppCategory) || AppCategory.GAMES,
            subCategory: AppSubCategory.ACTION, // Default
            rating: fetchedData.rating || 0,
            ratingCount: fetchedData.ratingCount || 0,
            installs: fetchedData.installs || '0+',
            currentVersion: fetchedData.currentVersion || '1.0.0',
            updatedDate: new Date().toISOString().split('T')[0],
            requiresAndroid: fetchedData.requiresAndroid || '5.0+',
            screenshots: fetchedData.screenshots || [],
            tags: ['New', 'Mod'],
            versions: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    versionName: fetchedData.currentVersion || '1.0.0',
                    versionCode: 1,
                    label: `v${fetchedData.currentVersion} - ${modDetails}`,
                    modType: ModType.UNLIMITED_MONEY,
                    size: 'Varies',
                    uploadDate: new Date().toISOString().split('T')[0],
                    md5: 'generated-md5-hash',
                    downloads: 0,
                    virusScanStatus: 'clean',
                    fileUrl: downloadLink
                }
            ]
        };

        setLoading(true);
        await api.addApp(newApp);
        setLoading(false);
        navigate('/'); // Redirect to home to see the new app
    };

    const handleAIEnhance = async () => {
        if (!process?.env?.API_KEY) {
           setDescription((prev) => prev + "\n\n<p><i>Enhanced by Gemini AI: Enjoy this amazing app with premium features unlocked!</i></p>");
           return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                 model: "gemini-3-flash-preview",
                 contents: `Rewrite this Android app description to be more engaging for a modded app store, highlighting features: ${fetchedData?.shortDescription}`
            });
            if (response.text) {
                setDescription(response.text);
            }
        } catch (e) {
            console.error("AI Error", e);
             setDescription((prev) => prev + "\n\n(AI Enhancement Failed)");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Add New Application</h2>
            
            {!fetchedData ? (
                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#1e293b]/50">
                    <form onSubmit={handleFetch} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Play Store Link / Package ID</label>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                                    className="flex-1 rounded-xl bg-[#0a0e27] border-2 border-slate-700 text-white shadow-inner focus:border-cyan-500 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] px-4 py-3 transition-all placeholder-slate-600"
                                    value={packageId}
                                    onChange={(e) => setPackageId(e.target.value)}
                                    required
                                />
                                <Button type="submit" disabled={loading} variant="primary" className="h-auto px-8">
                                    {loading ? <RefreshCw className="animate-spin" /> : 'FETCH METADATA'}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span>System will auto-extract images, description and version info.</span>
                            </p>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden bg-[#1e293b]/50">
                    <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <Check className="text-emerald-400" />
                            <h3 className="font-bold text-white text-lg">Review & Publish</h3>
                         </div>
                         <button onClick={() => setFetchedData(null)} className="text-sm font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-wide">Discard</button>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        {/* Fetched Preview */}
                        <div className="flex gap-8 items-start">
                            <img src={fetchedData.iconUrl} alt="Icon" className="w-24 h-24 rounded-2xl shadow-xl border border-white/10" />
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-white mb-1">{fetchedData.name}</h4>
                                <p className="text-cyan-400 mb-2">{fetchedData.developer}</p>
                                <div className="flex gap-2">
                                    <Badge type="info">{fetchedData.currentVersion}</Badge>
                                    <Badge type="success">{fetchedData.rating} ★</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Mod Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#0a0e27]/50 rounded-2xl border border-white/5">
                            <div className="md:col-span-2">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Wand2 className="text-purple-400" size={18} /> Mod Configuration
                                </h4>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mod Details / Features</label>
                                <input 
                                    type="text" 
                                    value={modDetails}
                                    onChange={(e) => setModDetails(e.target.value)}
                                    placeholder="e.g. Unlimited Money, No Ads"
                                    className="block w-full rounded-xl bg-[#0a0e27] border border-slate-700 text-white px-4 py-3 focus:border-cyan-500 focus:outline-none" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Download Link</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={downloadLink}
                                        onChange={(e) => setDownloadLink(e.target.value)}
                                        placeholder="https://..."
                                        className="block w-full rounded-xl bg-[#0a0e27] border border-slate-700 text-white pl-4 pr-10 py-3 focus:border-cyan-500 focus:outline-none" 
                                    />
                                    <LinkIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* Description Editor */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Description (HTML)</label>
                                <button onClick={handleAIEnhance} className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 transition-all hover:bg-purple-500/20">
                                    <Wand2 size={14} /> ENHANCE WITH AI
                                </button>
                            </div>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6} 
                                className="block w-full rounded-xl bg-[#0a0e27] border border-slate-700 text-slate-300 px-4 py-3 focus:border-cyan-500 focus:outline-none font-mono text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end gap-4">
                         <Button variant="secondary" onClick={() => setFetchedData(null)} className="border-slate-600 hover:border-slate-500">Cancel</Button>
                         <Button 
                            variant="success" 
                            onClick={handlePublish}
                            disabled={loading}
                            className="shadow-[0_0_20px_rgba(16,185,129,0.3)] px-8"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : 'PUBLISH MOD'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---

const App = () => {
  return (
    <AuthProvider>
        <Router>
        <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/category/:category" element={<HomeView />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/app/:id" element={<AppDetailView />} />
            <Route path="/download/:appId/:versionId" element={<DownloadView />} />
            
            {/* Protected Routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/add" element={<AdminLayout><AdminAddApp /></AdminLayout>} />
        </Routes>
        </Router>
    </AuthProvider>
  );
};

export default App;