'use client';

import dynamic from 'next/dynamic';

// Leaflet accesses `window` at import time — must be loaded client-side only
const ParkMap = dynamic(() => import('./ParkMap'), { ssr: false });
export default ParkMap;
