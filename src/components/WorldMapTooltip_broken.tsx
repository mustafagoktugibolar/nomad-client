import React from "react";
import { Card } from "react-bootstrap";

interface PopupInfo {
  name: string;
  lng: number;
  lat: number;
}

interface WorldMapTooltipProps {
  popupInfo: PopupInfo | null;
}

const WorldMapTooltip: React.FC<WorldMapTooltipProps> = ({ popupInfo }) => {
  if (!popupInfo) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${popupInfo.lng}px`,
        top: `${popupInfo.lat}px`,
        transform: "translate(-50%, -100%)",
        zIndex: 1000,
      }}
    >
      <Card style={{ width: "200px", boxShadow: "0px 2px 5px rgba(0,0,0,0.3)" }}>
        <Card.Body>
          <Card.Title style={{ fontSize: "16px", fontWeight: "bold" }}>
            {popupInfo.name}
          </Card.Title>
          <Card.Text>
            🌍 Country Information:
            <br />
            Longitude: {popupInfo.lng}
            <br />
            Latitude: {popupInfo.lat}
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorldMapTooltip;
  popupInfo: PopupInfo | null;
}

// First value with vertical tooltip
type FirstValueSingleLineProps = {
  values: string[];
  maxLength?: number;
};

function FirstValueSingleLine({ values, maxLength = 15 }: FirstValueSingleLineProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  if (!values || values.length === 0) return <span>-</span>;
  
  const firstValue = values[0];
  const hasMore = values.length > 1;
  const truncated = firstValue.length > maxLength ? firstValue.substring(0, maxLength) + '...' : firstValue;
  
  return (
    <span style={{ position: 'relative', overflow: 'visible' }}>
      <span>{truncated}</span>
      {hasMore && (
        <span
          style={{
            marginLeft: '6px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            position: 'relative'
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          +
          {showTooltip && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '120%',
              transform: 'translateX(-50%)',
              background: '#333',
              color: '#fff',
              padding: '8px 10px',
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: 'nowrap',
              zIndex: 9999,
              minWidth: '80px',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {values.map((value, index) => (
                <div key={index} style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {value}
                </div>
              ))}
            </div>
          )}
        </span>
      )}
    </span>
  );
}

const WorldMapTooltip: React.FC<WorldMapTooltipProps> = ({ popupInfo }) => {
  const { mapData } = useMapDataStore();

  // Comprehensive country name to ISO code mapping
  const nameToIsoMap: { [key: string]: string } = {
    'turkey': 'TR',
    'türkiye': 'TR',
    'united states': 'US',
    'usa': 'US',
    'united states of america': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'great britain': 'GB',
    'germany': 'DE',
    'deutschland': 'DE',
    'france': 'FR',
    'italy': 'IT',
    'spain': 'ES',
    'portugal': 'PT',
    'netherlands': 'NL',
    'holland': 'NL',
    'belgium': 'BE',
    'austria': 'AT',
    'switzerland': 'CH',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'poland': 'PL',
    'czech republic': 'CZ',
    'slovakia': 'SK',
    'hungary': 'HU',
    'romania': 'RO',
    'bulgaria': 'BG',
    'greece': 'GR',
    'croatia': 'HR',
    'slovenia': 'SI',
    'serbia': 'RS',
    'bosnia and herzegovina': 'BA',
    'montenegro': 'ME',
    'albania': 'AL',
    'north macedonia': 'MK',
    'macedonia': 'MK',
    'latvia': 'LV',
    'lithuania': 'LT',
    'estonia': 'EE',
    'russia': 'RU',
    'russian federation': 'RU',
    'belarus': 'BY',
    'ukraine': 'UA',
    'moldova': 'MD',
    'canada': 'CA',
    'mexico': 'MX',
    'brazil': 'BR',
    'argentina': 'AR',
    'chile': 'CL',
    'peru': 'PE',
    'colombia': 'CO',
    'venezuela': 'VE',
    'ecuador': 'EC',
    'bolivia': 'BO',
    'paraguay': 'PY',
    'uruguay': 'UY',
    'guyana': 'GY',
    'suriname': 'SR',
    'french guiana': 'GF',
    'china': 'CN',
    'japan': 'JP',
    'south korea': 'KR',
    'korea': 'KR',
    'north korea': 'KP',
    'india': 'IN',
    'pakistan': 'PK',
    'bangladesh': 'BD',
    'sri lanka': 'LK',
    'nepal': 'NP',
    'bhutan': 'BT',
    'maldives': 'MV',
    'myanmar': 'MM',
    'burma': 'MM',
    'thailand': 'TH',
    'vietnam': 'VN',
    'laos': 'LA',
    'cambodia': 'KH',
    'malaysia': 'MY',
    'singapore': 'SG',
    'indonesia': 'ID',
    'philippines': 'PH',
    'brunei': 'BN',
    'mongolia': 'MN',
    'iran': 'IR',
    'iraq': 'IQ',
    'saudi arabia': 'SA',
    'united arab emirates': 'AE',
    'uae': 'AE',
    'kuwait': 'KW',
    'qatar': 'QA',
    'bahrain': 'BH',
    'oman': 'OM',
    'yemen': 'YE',
    'jordan': 'JO',
    'lebanon': 'LB',
    'syria': 'SY',
    'israel': 'IL',
    'palestine': 'PS',
    'cyprus': 'CY',
    'egypt': 'EG',
    'libya': 'LY',
    'tunisia': 'TN',
    'algeria': 'DZ',
    'morocco': 'MA',
    'sudan': 'SD',
    'south sudan': 'SS',
    'ethiopia': 'ET',
    'eritrea': 'ER',
    'djibouti': 'DJ',
    'somalia': 'SO',
    'kenya': 'KE',
    'uganda': 'UG',
    'rwanda': 'RW',
    'burundi': 'BI',
    'tanzania': 'TZ',
    'mozambique': 'MZ',
    'zambia': 'ZM',
    'malawi': 'MW',
    'zimbabwe': 'ZW',
    'botswana': 'BW',
    'namibia': 'NA',
    'south africa': 'ZA',
    'lesotho': 'LS',
    'eswatini': 'SZ',
    'swaziland': 'SZ',
    'madagascar': 'MG',
    'mauritius': 'MU',
    'seychelles': 'SC',
    'comoros': 'KM',
    'angola': 'AO',
    'democratic republic of the congo': 'CD',
    'congo': 'CG',
    'central african republic': 'CF',
    'chad': 'TD',
    'cameroon': 'CM',
    'equatorial guinea': 'GQ',
    'gabon': 'GA',
    'sao tome and principe': 'ST',
    'nigeria': 'NG',
    'niger': 'NE',
    'benin': 'BJ',
    'burkina faso': 'BF',
    'mali': 'ML',
    'senegal': 'SN',
    'mauritania': 'MR',
    'gambia': 'GM',
    'guinea-bissau': 'GW',
    'guinea': 'GN',
    'sierra leone': 'SL',
    'liberia': 'LR',
    'ivory coast': 'CI',
    'ghana': 'GH',
    'togo': 'TG',
    'australia': 'AU',
    'new zealand': 'NZ',
    'papua new guinea': 'PG',
    'fiji': 'FJ',
    'vanuatu': 'VU',
    'samoa': 'WS',
    'tonga': 'TO',
    'kiribati': 'KI',
    'tuvalu': 'TV',
    'nauru': 'NR',
    'palau': 'PW',
    'micronesia': 'FM',
    'marshall islands': 'MH',
    'solomon islands': 'SB',
    'afghanistan': 'AF',
    'kazakhstan': 'KZ',
    'uzbekistan': 'UZ',
    'turkmenistan': 'TM',
    'tajikistan': 'TJ',
    'kyrgyzstan': 'KG',
    'armenia': 'AM',
    'azerbaijan': 'AZ',
    'georgia': 'GE',
    'iceland': 'IS',
    'ireland': 'IE',
    'malta': 'MT',
    'luxembourg': 'LU',
    'liechtenstein': 'LI',
    'monaco': 'MC',
    'san marino': 'SM',
    'vatican': 'VA',
    'andorra': 'AD'
  };

  // Find country data by matching names to ISO codes
  let countryData = null;
  if (popupInfo && mapData.length > 0) {
    const searchName = popupInfo.name.toLowerCase();
    const isoCode = nameToIsoMap[searchName];
    
    if (isoCode) {
      countryData = mapData.find((c: any) => 
        c.target_country?.toUpperCase() === isoCode
      );
    }
    
    // Fallback: try direct name matching
    if (!countryData) {
      countryData = mapData.find((c: any) =>
        c.target_country_name?.toLowerCase() === searchName ||
        c.name_en?.toLowerCase() === searchName
      );
    }
    // Country data lookup completed
  }

  if (!popupInfo) return null;

  // Calculate position to fit popup to screen
  const popupWidth = 320;
  const popupHeight = 400;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  let left = popupInfo.lng;
  let top = popupInfo.lat;
  
  // Adjust horizontal position
  if (left + popupWidth > screenWidth) {
    left = screenWidth - popupWidth - 20;
  }
  if (left < 20) {
    left = 20;
  }
  
  // Adjust vertical position
  if (top + popupHeight > screenHeight) {
    top = popupInfo.lat - popupHeight - 20;
  }
  if (top < 20) {
    top = 20;
  }

  // Security level color mapping
  const getSecurityColor = (securityLevel?: string) => {
    if (!securityLevel) return '#666';
    
    const level = securityLevel.toLowerCase();
    if (level.includes('güvenli') || level.includes('safe') || level.includes('low')) {
      return '#28a745'; // Green
    } else if (level.includes('orta') || level.includes('medium') || level.includes('moderate')) {
      return '#ffc107'; // Orange
    } else if (level.includes('tehlikeli') || level.includes('dangerous') || level.includes('high')) {
      return '#dc3545'; // Red
    }
    return '#666'; // Default gray
  };

  // Security level descriptions
  const getSecurityDescription = (securityLevel?: string) => {
    if (!securityLevel) return '';
    
    const level = securityLevel.toLowerCase();
    if (level.includes('güvenli') || level.includes('safe')) {
      return 'This country is generally considered safe for travelers with low security risks.';
    } else if (level.includes('orta') || level.includes('medium') || level.includes('moderate')) {
      return 'This country has moderate security risks. Exercise normal precautions when traveling.';
    } else if (level.includes('tehlikeli') || level.includes('dangerous') || level.includes('high')) {
      return 'This country has high security risks. Exercise increased caution and consider travel advisories.';
    }
    return '';
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 1000,
        overflow: 'visible'
      }}
    >
      <Card style={{ 
        width: `${popupWidth}px`, 
        boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'visible'
      }}>
        <Card.Body style={{ padding: '20px', overflow: 'visible' }}>
          <Card.Title style={{ 
            fontSize: "18px", 
            fontWeight: "bold",
            marginBottom: '16px',
            color: '#333'
          }}>
            🌍 {popupInfo.name}
          </Card.Title>
          
          {countryData ? (
            <div style={{ overflow: 'visible' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px', 
                fontSize: '14px',
                overflow: 'visible'
              }}>
                <div style={{ overflow: 'visible' }}>
                  <strong>💰 Visa Fee:</strong><br />
                  <span>{countryData.visa_fee || 'N/A'}</span>
                </div>
                
                <div style={{ overflow: 'visible' }}>
                  <strong>⏱️ Max Stay:</strong><br />
                  <span>{countryData.max_stay || 'N/A'}</span>
                </div>
                
                <div style={{ overflow: 'visible' }}>
                  <strong>🎯 Visit Type:</strong><br />
                  <FirstValueSingleLine 
                    values={countryData.visit_type ? [countryData.visit_type] : []} 
                    maxLength={15}
                  />
                </div>
                
                <div style={{ overflow: 'visible' }}>
                  <strong>🛂 Entry:</strong><br />
                  <span>{countryData.entry_type || 'N/A'}</span>
                </div>
                
                <div style={{ gridColumn: 'span 2', overflow: 'visible' }}>
                  <strong>🛡️ Security:</strong><br />
                  <SecurityTooltip desc={getSecurityDescription(countryData.security_level)}>
                    <span style={{ 
                      color: getSecurityColor(countryData.security_level),
                      fontWeight: '600'
                    }}>
                      ● {countryData.security_level || 'N/A'}
                    </span>
                  </SecurityTooltip>
                </div>
                
                <div style={{ gridColumn: 'span 2', overflow: 'visible' }}>
                  <strong>📋 Requirements:</strong><br />
                  <span style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    {countryData.requirements || 'No specific requirements listed'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Card.Text style={{ fontSize: '14px', color: '#666' }}>
              🌍 Country Information:
              <br />
              Longitude: {popupInfo.lng.toFixed(4)}
              <br />
              Latitude: {popupInfo.lat.toFixed(4)}
              <br /><br />
              <em>Detailed visa and travel information not available for this country.</em>
            </Card.Text>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorldMapTooltip;
