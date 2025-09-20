// Custom tooltip for security level
type SecurityTooltipProps = {
  desc?: string;
  children: React.ReactNode;
};

function SecurityTooltip({ desc, children }: SecurityTooltipProps) {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ position: 'relative', cursor: desc ? 'pointer' : 'default' }}
      onMouseEnter={() => desc && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {desc && show && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '120%',
          transform: 'translateX(-50%)',
          background: '#222',
          color: '#fff',
          padding: '7px 12px',
          borderRadius: 7,
          fontSize: 13,
          whiteSpace: 'pre-line',
          zIndex: 9999,
          minWidth: 180,
          maxWidth: 260,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
        }}>
          {desc}
        </div>
      )}
    </span>
  );
}
import React from "react";
import { Card } from "react-bootstrap";
import { useMapDataStore } from "./store/mapDataStore.js";

interface PopupInfo {
  name: string;
  lng: number;
  lat: number;
  isoCode?: string; // Add isoCode for better matching if available
}

interface WorldMapTooltipProps {
  popupInfo: PopupInfo | null;
}

const WorldMapTooltip: React.FC<WorldMapTooltipProps> = ({ popupInfo }) => {
  const mapData = useMapDataStore((state) => state.mapData);
  let countryData = null;

  if (popupInfo && Array.isArray(mapData)) {
    const searchName = popupInfo.name.toLowerCase();
    
    // Simple country name to ISO mapping
    const nameToIsoMap: { [key: string]: string } = {
      'turkey': 'TR',
      'andorra': 'AD',
      'united arab emirates': 'AE',
      'afghanistan': 'AF',
      'antigua and barbuda': 'AG',
      'albania': 'AL',
      'armenia': 'AM',
      'angola': 'AO',
      'argentina': 'AR',
      'austria': 'AT',
      'australia': 'AU',
      'azerbaijan': 'AZ',
      'bosnia and herzegovina': 'BA',
      'barbados': 'BB',
      'bangladesh': 'BD',
      'belgium': 'BE',
      'burkina faso': 'BF',
      'bulgaria': 'BG',
      'bahrain': 'BH',
      'burundi': 'BI',
      'benin': 'BJ',
      'brunei': 'BN',
      'bolivia': 'BO',
      'brazil': 'BR',
      'bahamas': 'BS',
      'bhutan': 'BT',
      'botswana': 'BW',
      'belarus': 'BY',
      'belize': 'BZ',
      'canada': 'CA',
      'democratic republic of the congo': 'CD',
      'central african republic': 'CF',
      'congo': 'CG',
      'switzerland': 'CH',
      'ivory coast': 'CI',
      'chile': 'CL',
      'cameroon': 'CM',
      'china': 'CN',
      'colombia': 'CO',
      'costa rica': 'CR',
      'cuba': 'CU',
      'cape verde': 'CV',
      'cyprus': 'CY',
      'czech republic': 'CZ',
      'germany': 'DE',
      'djibouti': 'DJ',
      'denmark': 'DK',
      'dominica': 'DM',
      'dominican republic': 'DO',
      'algeria': 'DZ',
      'ecuador': 'EC',
      'estonia': 'EE',
      'egypt': 'EG',
      'eritrea': 'ER',
      'spain': 'ES',
      'ethiopia': 'ET',
      'finland': 'FI',
      'fiji': 'FJ',
      'france': 'FR',
      'gabon': 'GA',
      'united kingdom': 'GB',
      'grenada': 'GD',
      'georgia': 'GE',
      'ghana': 'GH',
      'gambia': 'GM',
      'guinea': 'GN',
      'equatorial guinea': 'GQ',
      'greece': 'GR',
      'guatemala': 'GT',
      'guinea-bissau': 'GW',
      'guyana': 'GY',
      'honduras': 'HN',
      'croatia': 'HR',
      'haiti': 'HT',
      'hungary': 'HU',
      'indonesia': 'ID',
      'ireland': 'IE',
      'israel': 'IL',
      'india': 'IN',
      'iraq': 'IQ',
      'iran': 'IR',
      'iceland': 'IS',
      'italy': 'IT',
      'jamaica': 'JM',
      'jordan': 'JO',
      'japan': 'JP',
      'kenya': 'KE',
      'kyrgyzstan': 'KG',
      'cambodia': 'KH',
      'kiribati': 'KI',
      'comoros': 'KM',
      'saint kitts and nevis': 'KN',
      'north korea': 'KP',
      'south korea': 'KR',
      'kuwait': 'KW',
      'kazakhstan': 'KZ',
      'laos': 'LA',
      'lebanon': 'LB',
      'saint lucia': 'LC',
      'liechtenstein': 'LI',
      'sri lanka': 'LK',
      'liberia': 'LR',
      'lesotho': 'LS',
      'lithuania': 'LT',
      'luxembourg': 'LU',
      'latvia': 'LV',
      'libya': 'LY',
      'morocco': 'MA',
      'monaco': 'MC',
      'moldova': 'MD',
      'montenegro': 'ME',
      'madagascar': 'MG',
      'marshall islands': 'MH',
      'north macedonia': 'MK',
      'mali': 'ML',
      'myanmar': 'MM',
      'mongolia': 'MN',
      'mauritania': 'MR',
      'malta': 'MT',
      'mauritius': 'MU',
      'maldives': 'MV',
      'malawi': 'MW',
      'mexico': 'MX',
      'malaysia': 'MY',
      'mozambique': 'MZ',
      'namibia': 'NA',
      'niger': 'NE',
      'nigeria': 'NG',
      'nicaragua': 'NI',
      'netherlands': 'NL',
      'norway': 'NO',
      'nepal': 'NP',
      'nauru': 'NR',
      'new zealand': 'NZ',
      'oman': 'OM',
      'panama': 'PA',
      'peru': 'PE',
      'papua new guinea': 'PG',
      'philippines': 'PH',
      'pakistan': 'PK',
      'poland': 'PL',
      'saint pierre and miquelon': 'PM',
      'portugal': 'PT',
      'palau': 'PW',
      'paraguay': 'PY',
      'qatar': 'QA',
      'romania': 'RO',
      'serbia': 'RS',
      'russia': 'RU',
      'rwanda': 'RW',
      'saudi arabia': 'SA',
      'solomon islands': 'SB',
      'seychelles': 'SC',
      'sudan': 'SD',
      'sweden': 'SE',
      'singapore': 'SG',
      'slovenia': 'SI',
      'slovakia': 'SK',
      'sierra leone': 'SL',
      'san marino': 'SM',
      'senegal': 'SN',
      'somalia': 'SO',
      'suriname': 'SR',
      'south sudan': 'SS',
      'são tomé and príncipe': 'ST',
      'el salvador': 'SV',
      'syria': 'SY',
      'eswatini': 'SZ',
      'chad': 'TD',
      'togo': 'TG',
      'thailand': 'TH',
      'tajikistan': 'TJ',
      'east timor': 'TL',
      'turkmenistan': 'TM',
      'tunisia': 'TN',
      'tonga': 'TO',
      'trinidad and tobago': 'TT',
      'tuvalu': 'TV',
      'taiwan': 'TW',
      'tanzania': 'TZ',
      'ukraine': 'UA',
      'uganda': 'UG',
      'united states': 'US',
      'uruguay': 'UY',
      'uzbekistan': 'UZ',
      'vatican city': 'VA',
      'saint vincent and the grenadines': 'VC',
      'venezuela': 'VE',
      'vietnam': 'VN',
      'vanuatu': 'VU',
      'samoa': 'WS',
      'yemen': 'YE',
      'south africa': 'ZA',
      'zambia': 'ZM',
      'zimbabwe': 'ZW'
    };

    // 1. Try to match by ISO code (if available)
    if (popupInfo.isoCode) {
      countryData = mapData.find((c: any) =>
        c.target_country?.toLowerCase() === popupInfo.isoCode?.toLowerCase()
      );
    }
    
    // 2. Try to map country name to ISO and then find
    if (!countryData && nameToIsoMap[searchName]) {
      const isoCode = nameToIsoMap[searchName];
      countryData = mapData.find((c: any) =>
        c.target_country?.toLowerCase() === isoCode.toLowerCase()
      );
    }
    
    // 3. Try exact match with Turkish name
    if (!countryData) {
      countryData = mapData.find((c: any) =>
        c.target_country_name?.toLowerCase() === searchName
      );
    }
    
    // 4. Try exact match with English name (if exists)
    if (!countryData) {
      countryData = mapData.find((c: any) =>
        c.name_en?.toLowerCase() === searchName
      );
    }
    if (!countryData) {
      console.log('❌ Country not found! Searching for:', popupInfo.name);
      
      // Try to find Turkey specifically for debugging
      const turkeyInData = mapData.find((c: any) => 
        c.target_country?.toLowerCase().includes('tr') || 
        c.target_country_name?.toLowerCase().includes('turkey') ||
        c.target_country_name?.toLowerCase().includes('türkiye') ||
        c.name_en?.toLowerCase().includes('turkey')
      );
    }
  }

  if (!popupInfo) return null;

  // Calculate position to fit popup to screen
  const popupWidth = 260;
  const popupHeight = 260;
  const margin = 12;
  let left = popupInfo.lng;
  let top = popupInfo.lat;
  if (typeof window !== 'undefined') {
    if (left + popupWidth > window.innerWidth - margin) left = window.innerWidth - popupWidth - margin;
    if (left < margin) left = margin;
    if (top + popupHeight > window.innerHeight - margin) top = window.innerHeight - popupHeight - margin;
    if (top < margin) top = margin;
  }

  // Helper for flag emoji from ISO code (fallback)
  function getFlagEmoji(isoCode?: string) {
    if (!isoCode || isoCode.length !== 2) return '🏳️';
    return isoCode
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
  }

  // Render ISO-based SVG/PNG flag for Windows support; fallback to emoji
  const FlagIcon: React.FC<{ iso?: string; name?: string }> = ({ iso, name }) => {
    const [err, setErr] = React.useState(false);
    if (!iso || err) {
      return <span style={{ fontSize: 32, marginRight: 8 }}>{getFlagEmoji(iso)}</span>;
    }
    const src = `https://flagcdn.com/h24/${iso.toLowerCase()}.png`;
    return (
      <img
        src={src}
        alt={`${name || iso} flag`}
        width={32}
        height={24}
        style={{ marginRight: 8, borderRadius: 4, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}
        loading="lazy"
        onError={() => setErr(true)}
      />
    );
  };

  // Helper for security color
  function getSecurityColor(level: string) {
    if (!level) return '#bbb';
    const l = level.toLowerCase();
    
    // Very safe / High security (Green)
    if (l.includes('high') || l.includes('safe') || l.includes('çok güvenli') || l.includes('güvenli')) return '#4caf50';
    
    // Medium security (Orange/Yellow)
    if (l.includes('medium') || l.includes('moderate') || l.includes('normal') || l.includes('orta')) return '#ff9800';
    
    // Low/Dangerous security (Red)
    if (
      l.includes('low') ||
      l.includes('danger') ||
      l.includes('risk') ||
      l.includes('insecure') ||
      l.includes('unsafe') ||
      l.includes('güvensiz') ||
      l.includes('guvensiz') ||
      l.includes('çok güvensiz') ||
      l.includes('tehlikeli')
    ) return '#f44336';
    
    // Should not go (Dark Red)
    if (l.includes('gidilmemeli')) return '#d32f2f';
    
    // Default gray
    return '#9e9e9e';
  }

  const isoForFlag = (countryData as any)?.target_country as string | undefined;
  const secLevel = (countryData as any)?.security_level_name || '';
  const secColor = getSecurityColor(secLevel);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        zIndex: 1000,
        maxWidth: popupWidth,
        minWidth: 240,
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        background: "#fff",
        border: "1.5px solid #e0e0e0",
        padding: 0,
        overflow: 'visible', // allow inner tooltips to overflow
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '18px 18px 8px 18px',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(90deg, #f8fafc 60%, #f0f4f8 100%)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}>
        <FlagIcon iso={isoForFlag} name={popupInfo.name} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#222', lineHeight: 1.2 }}>{popupInfo.name}</div>
          {countryData && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <span style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: secColor,
                marginRight: 7,
                border: '1.5px solid #ddd',
              }} />
              <span style={{ fontWeight: 500, fontSize: 14, color: secColor }}>
                <SecurityTooltip desc={(countryData as any).security_level_desc}>{secLevel || 'N/A'}</SecurityTooltip>
              </span>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '12px 18px 16px 18px', fontSize: 15, color: '#333' }}>
        {countryData ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Capital:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>{(countryData as any).capital || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Biggest City:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>{(countryData as any).biggest_city || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Night Life:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>{(countryData as any).night_life_name || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Visit Type:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}><FirstValueSingleLine text={(countryData as any).visit_type_name} limit={20} /></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Avg Daily Spend:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>
                ${(countryData as any).spent_amount_daily_avg || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Avg Weekly Spend:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>
                ${(countryData as any).spent_amount_avg || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <b style={{ color: '#555', fontWeight: 600 }}>Best Season:</b>
              <span style={{ flex: 1, textAlign: 'right', marginLeft: 12 }}>{(countryData as any).season_name || 'N/A'}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 6, textAlign: 'right' }}>🌍 Country Information:</div>
            <div style={{ marginBottom: 6, textAlign: 'right' }}>Longitude: {popupInfo.lng}</div>
            <div style={{ marginBottom: 6, textAlign: 'right' }}>Latitude: {popupInfo.lat}</div>
          </>
        )}
      </div>
    </div>
  );
};

function TruncateWithTooltip({ text = '', limit = 28 }: { text?: string; limit?: number }) {
  const [open, setOpen] = React.useState(false);
  if (!text) return <span>N/A</span>;
  if (text.length <= limit) return <span>{text}</span>;
  const short = text.slice(0, limit).trim() + '…';
  return (
    <span style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      <span>{short}</span>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          marginLeft: 6,
          background: '#eef2f6',
          border: '1px solid #d0d7de',
          borderRadius: 10,
          padding: '0 6px',
          fontSize: 11,
          lineHeight: '16px',
          cursor: 'pointer',
          color: '#555'
        }}
      >more</button>
      {open && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '115%',
            transform: 'translateX(-50%)',
            background: '#1f2328',
            color: '#fff',
            padding: '8px 11px',
            borderRadius: 8,
            fontSize: 12,
            maxWidth: 240,
            minWidth: 160,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            zIndex: 10000,
            whiteSpace: 'pre-wrap'
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >{text}</div>
      )}
    </span>
  );
}

function FirstValueSingleLine({ text = '', limit = 20 }: { text?: string; limit?: number }) {
  if (!text) return <span>N/A</span>;
  const parts = text.split(/[,؛;]|\n/).map(p => p.trim()).filter(Boolean);
  const first = parts[0] || '';
  const hasMore = parts.length > 1;
  const clippedFirst = first.length > limit ? first.slice(0, limit - (hasMore ? 3 : 1)) + '…' : first;
  const [open, setOpen] = React.useState(false);
  const full = parts.join(', ');
  // decide direction (basic): if window height small below element, show upward
  const [dirUp, setDirUp] = React.useState(false);
  const spanRef = React.useRef<HTMLSpanElement | null>(null);
  React.useEffect(() => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      if (rect.bottom + 150 > window.innerHeight) setDirUp(true); else setDirUp(false);
    }
  }, [open]);
  return (
    <span
      ref={spanRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => hasMore && setOpen(o => !o)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: 150,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'bottom',
        fontWeight: 500,
        cursor: hasMore ? 'pointer' : 'default'
      }}
      title={hasMore ? full : undefined}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{clippedFirst}</span>
      {hasMore && (
        <span
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          style={{
            marginLeft: 6,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 15,
            height: 15,
            borderRadius: '50%',
            background: '#fff',
            color: '#1e6bb8',
            border: '1px solid #1e6bb8',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: '12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)'
          }}
        >+</span>
      )}
      {open && hasMore && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            [dirUp ? 'bottom' : 'top']: dirUp ? '120%' : '115%',
            transform: 'translateX(-50%)',
            background: '#1f2328',
            color: '#fff',
            padding: '6px 8px',
            borderRadius: 8,
            fontSize: 11,
            maxWidth: 80,
            minWidth: 80,
            boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
            zIndex: 2147483647,
            lineHeight: 1.3,
            whiteSpace: 'normal',
            textAlign: 'left',
            wordBreak: 'break-word'
          } as React.CSSProperties}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {parts.map((p,i)=>(
              <div key={i} style={{ background: '#2d333b', padding: '2px 4px', borderRadius: 5, fontSize: 11, lineHeight: 1.2 }}>{p}</div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}

export default WorldMapTooltip;
