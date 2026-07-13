import React from 'react';
import { useSettings } from '@core/context/SettingsContext';

const MobileFooterMessage = () => {
    const { settings } = useSettings();
    const appName = settings?.appName || 'SuperfastMart';
    return (
        <div className="md:hidden w-full flex flex-col items-center -mt-8 pt-0 pb-28 px-6 bg-transparent">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
                .funky-neon-text {
                    font-family: 'Pacifico', cursive;
                    color: #f2fff6;
                    -webkit-text-stroke: 1.5px #0c831f;
                    text-shadow: 2px 2px 6px rgba(12, 131, 31, 0.25);
                    line-height: 1.3;
                }
            `}</style>
            <div className="w-full flex flex-col items-center">
                <h2 className="text-[34px] text-center funky-neon-text mt-4 mb-3">
                    Need it in a flash?<br />Superfast is on the way!
                </h2>

                <img src="/superfast_mart_delivery_bag.png" alt="Delivery 3D Icon" className="w-48 h-48 object-contain mb-6" style={{ mixBlendMode: 'multiply' }} />

                <div className="w-full h-[1px] bg-slate-200 mt-2 mb-4"></div>

                <div className="text-slate-300 font-black text-2xl tracking-tighter text-left">
                    Superfast
                </div>
            </div>
        </div>
    );
};

export default MobileFooterMessage;
