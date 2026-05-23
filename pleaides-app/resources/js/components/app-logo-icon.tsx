import type { SVGAttributes } from 'react';

// Seven Sisters (Pleiades) — each circle is one named star.
// Positions approximate the real asterism, sizes reflect relative brightness.
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="5 4 13 13" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            {/* Alcyone — brightest, centre */}
            <circle cx="12.5" cy="11" r="2.4" />
            {/* Maia */}
            <circle cx="9"    cy="7.5" r="1.8" />
            {/* Electra */}
            <circle cx="7.5"  cy="12"  r="1.6" />
            {/* Taygeta */}
            <circle cx="11"   cy="6"   r="1.5" />
            {/* Celaeno */}
            <circle cx="15.5" cy="8.5" r="1.4" />
            {/* Merope */}
            <circle cx="13"   cy="15"  r="1.5" />
            {/* Asterope */}
            <circle cx="16.5" cy="12"  r="1.3" />
        </svg>
    );
}
