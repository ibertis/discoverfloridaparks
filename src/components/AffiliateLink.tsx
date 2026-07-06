'use client';

import { sendGAEvent } from '@next/third-parties/google';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

// Drop-in replacement for <a> on affiliate links: renders identically (all props
// pass through), but fires a GA4 `affiliate_click` event so we can see which
// networks/placements/parks actually earn. Purely additive — no visual change.
interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  network: string;    // e.g. 'hotels.com', 'expedia', 'viator', 'backcountry', 'amazon'
  placement: string;  // e.g. 'park-hotel-card', 'park-hotel-fallback', 'park-experience'
  park?: string;      // park slug, for attribution
  children: ReactNode;
}

export default function AffiliateLink({ network, placement, park, children, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        sendGAEvent('event', 'affiliate_click', { network, placement, ...(park ? { park } : {}) });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
