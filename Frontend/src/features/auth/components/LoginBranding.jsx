import React from 'react';
import { Activity } from 'lucide-react';

const LoginBranding = () => (
  <div className="hidden lg:flex flex-col space-y-6 text-white">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30 w-fit backdrop-blur-md">
      <Activity className="text-blue-400" size={20} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Industrial Reliability System</span>
    </div>
    <div className="space-y-2">
      <h1 className="text-8xl font-black tracking-tighter italic">AVATAR</h1>
      <div className="h-2 w-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
      <p className="text-2xl font-light text-blue-100 leading-relaxed pt-4">
        <span className="font-bold">Accenture Virtual Assistant</span> for <br/>
        Technical Analysis and Reliability
      </p>
    </div>
  </div>
);

export default LoginBranding;