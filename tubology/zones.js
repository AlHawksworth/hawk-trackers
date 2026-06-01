// Tubology - Station Zone Data
// Zone assignments for all TfL stations (Tube, Elizabeth, Overground)

const STATION_ZONES = {
  // Zone 1
  "Paddington": 1, "Edgware Road": 1, "Baker Street": 1, "Great Portland Street": 1,
  "Euston Square": 1, "King's Cross St. Pancras": 1, "Farringdon": 1, "Barbican": 1,
  "Moorgate": 1, "Liverpool Street": 1, "Aldgate": 1, "Tower Hill": 1, "Monument": 1,
  "Cannon Street": 1, "Mansion House": 1, "Blackfriars": 1, "Temple": 1, "Embankment": 1,
  "Westminster": 1, "St. James's Park": 1, "Victoria": 1, "Sloane Square": 1,
  "South Kensington": 1, "Gloucester Road": 1, "High Street Kensington": 1,
  "Notting Hill Gate": 1, "Bayswater": 1, "Marble Arch": 1, "Bond Street": 1,
  "Oxford Circus": 1, "Regent's Park": 1, "Warren Street": 1, "Goodge Street": 1,
  "Tottenham Court Road": 1, "Holborn": 1, "Chancery Lane": 1, "St. Paul's": 1,
  "Bank": 1, "Leicester Square": 1, "Piccadilly Circus": 1, "Charing Cross": 1,
  "Covent Garden": 1, "Green Park": 1, "Hyde Park Corner": 1, "Knightsbridge": 1,
  "Lancaster Gate": 1, "Queensway": 1, "Pimlico": 1, "Vauxhall": 1, "Lambeth North": 1,
  "Waterloo": 1, "Southwark": 1, "London Bridge": 1, "Borough": 1, "Elephant & Castle": 1,
  "Kennington": 1, "Oval": 1, "Aldgate East": 1, "Angel": 1, "Old Street": 1,
  "Russell Square": 1, "Mornington Crescent": 1, "Euston": 1, "Marylebone": 1,
  "Warwick Avenue": 1, "Maida Vale": 1,

  // Zone 2
  "Kilburn Park": 2, "Queen's Park": 2, "Kensal Green": 2, "Willesden Junction": 2,
  "Westbourne Park": 2, "Royal Oak": 2, "Ladbroke Grove": 2, "Latimer Road": 2,
  "Wood Lane": 2, "Shepherd's Bush Market": 2, "Goldhawk Road": 2, "Hammersmith": 2,
  "Barons Court": 2, "West Kensington": 2, "Earl's Court": 2, "West Brompton": 2,
  "Fulham Broadway": 2, "Parsons Green": 2, "Holland Park": 2, "Shepherd's Bush": 2,
  "White City": 2, "Bethnal Green": 2, "Mile End": 2, "Bow Road": 2,
  "Bromley-by-Bow": 2, "Stepney Green": 2, "Whitechapel": 2,
  "Finchley Road": 2, "Swiss Cottage": 2, "St. John's Wood": 2,
  "Kilburn": 2, "West Hampstead": 2, "Finsbury Park": 2,
  "Highbury & Islington": 2, "Caledonian Road": 2, "Holloway Road": 2,
  "Arsenal": 2, "Tufnell Park": 2, "Kentish Town": 2, "Camden Town": 2,
  "Chalk Farm": 2, "Belsize Park": 2, "Hampstead": 2, "Golders Green": 2,
  "Archway": 2, "Highgate": 2, "Stockwell": 2, "Brixton": 2,
  "Bermondsey": 2, "Canada Water": 2, "Canary Wharf": 2,
  "Shadwell": 2, "Wapping": 2, "Rotherhithe": 2, "Surrey Quays": 2,
  "New Cross": 2, "New Cross Gate": 2,
  "Dalston Kingsland": 2, "Dalston Junction": 2, "Haggerston": 2,
  "Hoxton": 2, "Shoreditch High Street": 2, "Canonbury": 2,
  "Caledonian Road & Barnsbury": 2, "Camden Road": 2, "Kentish Town West": 2,
  "Hackney Central": 2, "Homerton": 2, "Hackney Wick": 2,
  "Cambridge Heath": 2, "London Fields": 2, "Hackney Downs": 2,
  "Rectory Road": 2, "Stoke Newington": 2,
  "Queens Road Peckham": 2, "Peckham Rye": 2, "Denmark Hill": 2,
  "Clapham High Street": 2, "Wandsworth Road": 2, "Battersea Park": 2,
  "Clapham North": 2, "Clapham Common": 2,
  "Nine Elms": 1, "Battersea Power Station": 1,
  "Imperial Wharf": 2, "Kensington (Olympia)": 2,

  // Zone 2/3
  "West Ham": 3, "Stratford": 3, "Canning Town": 3,
  "East Finchley": 3, "Hampstead Heath": 2, "Gospel Oak": 2,
  "Finchley Road & Frognal": 2, "Brondesbury": 2, "Brondesbury Park": 2,
  "Kensal Rise": 2, "South Acton": 3, "Acton Central": 3,

  // Zone 3
  "Harlesden": 3, "Stonebridge Park": 3, "North Acton": 3,
  "East Acton": 2, "Acton Town": 3, "Chiswick Park": 3, "Turnham Green": 2,
  "Gunnersbury": 3, "Kew Gardens": 3, "Richmond": 4,
  "Putney Bridge": 2, "East Putney": 3, "Southfields": 3,
  "Wimbledon Park": 3, "Wimbledon": 3, "Balham": 3, "Tooting Bec": 3,
  "Tooting Broadway": 3, "Colliers Wood": 3, "South Wimbledon": 3, "Morden": 4,
  "Clapham South": 2, "Plaistow": 3, "Upton Park": 3, "East Ham": 3,
  "Barking": 4, "Leyton": 3, "Leytonstone": 3,
  "Wanstead": 3, "Redbridge": 4, "Manor House": 2,
  "Turnpike Lane": 3, "Wood Green": 3, "Bounds Green": 3,
  "North Greenwich": 3, "Dollis Hill": 3, "Willesden Green": 2,
  "Neasden": 3, "Wembley Park": 4, "Brent Cross": 3,
  "Hendon Central": 3, "Colindale": 4, "Burnt Oak": 4,
  "Edgware": 5, "Woodside Park": 4, "West Finchley": 3,
  "Finchley Central": 4, "Totteridge & Whetstone": 4, "High Barnet": 5,
  "Ealing Common": 3, "Ealing Broadway": 3, "West Kensington": 2,
  "Olympia": 2, "Stamford Hill": 3, "Seven Sisters": 3,
  "Tottenham Hale": 3, "Blackhorse Road": 3, "Walthamstow Central": 3,
  "Upper Holloway": 3, "Crouch Hill": 3, "Harringay Green Lanes": 3,
  "South Tottenham": 3, "Walthamstow Queens Road": 3,
  "Leyton Midland Road": 3, "Leytonstone High Road": 3,
  "Wanstead Park": 3, "Woodgrange Park": 3,
  "Brockley": 2, "Honor Oak Park": 3, "Forest Hill": 3,
  "Sydenham": 3, "Crystal Palace": 3, "Penge West": 3,
  "Anerley": 3, "Norwood Junction": 4, "West Croydon": 5,
  "Bruce Grove": 3, "White Hart Lane": 3, "Silver Street": 4,
  "Edmonton Green": 4, "Bush Hill Park": 5, "Enfield Town": 5,
  "Southbury": 4, "Turkey Street": 5, "Theobalds Grove": 5,
  "Clapton": 2, "St James Street": 3,
  "Wood Street": 3, "Highams Park": 4, "Chingford": 5,
  "Clapham Junction": 2,

  // Zone 4
  "Wembley Central": 4, "North Wembley": 4, "South Kenton": 4, "Kenton": 4,
  "Harrow & Wealdstone": 5, "Preston Road": 4, "Northwick Park": 4,
  "Harrow-on-the-Hill": 5, "North Harrow": 5, "West Harrow": 5,
  "Rayners Lane": 5, "Eastcote": 5, "Pinner": 5,
  "Hanger Lane": 3, "Perivale": 4, "Greenford": 4, "Northolt": 5,
  "South Ruislip": 5, "Ruislip Gardens": 5, "West Ruislip": 6,
  "Arnos Grove": 4, "Southgate": 4, "Oakwood": 5, "Cockfosters": 5,
  "South Harrow": 5, "Sudbury Hill": 4, "Sudbury Town": 4,
  "Alperton": 4, "Park Royal": 3, "North Ealing": 3,
  "Snaresbrook": 4, "South Woodford": 4, "Woodford": 4,
  "Buckhurst Hill": 5, "Loughton": 6, "Debden": 6,
  "Theydon Bois": 6, "Epping": 6,
  "Gants Hill": 4, "Newbury Park": 4, "Barkingside": 4,
  "Fairlop": 5, "Hainault": 4, "Grange Hill": 5,
  "Chigwell": 4, "Roding Valley": 4,
  "Upney": 4, "Becontree": 5, "Dagenham Heathway": 5,
  "Dagenham East": 5, "Elm Park": 6, "Hornchurch": 6,
  "Upminster Bridge": 6, "Upminster": 6,
  "Hounslow East": 4, "Hounslow Central": 4, "Hounslow West": 5,
  "Hatton Cross": 5, "Osterley": 4, "Boston Manor": 4, "Northfields": 3,
  "Heathrow Terminals 2 & 3": 6, "Heathrow Terminal 4": 6, "Heathrow Terminal 5": 6,
  "Moor Park": 6, "Northwood": 6, "Northwood Hills": 6,
  "Rickmansworth": 7, "Chorleywood": 7, "Chalfont & Latimer": 8,
  "Chesham": 9, "Amersham": 9, "Croxley": 7, "Watford": 7,
  "Uxbridge": 6, "Hillingdon": 6, "Ickenham": 6,
  "Ruislip": 6, "Ruislip Manor": 6,
  "Barking Riverside": 4,

  // Elizabeth line
  "Acton Main Line": 3, "West Ealing": 3, "Hanwell": 4,
  "Southall": 4, "Hayes & Harlington": 5, "West Drayton": 6,
  "Iver": 6, "Langley": 6, "Slough": 6, "Burnham": 6,
  "Taplow": 6, "Maidenhead": 6, "Twyford": 6, "Reading": 6,
  "Custom House": 3, "Woolwich": 4, "Abbey Wood": 4,
  "Maryland": 3, "Forest Gate": 3, "Manor Park": 3,
  "Ilford": 4, "Seven Kings": 4, "Goodmayes": 4,
  "Chadwell Heath": 5, "Romford": 6, "Gidea Park": 6,
  "Harold Wood": 6, "Brentwood": 6, "Shenfield": 6,

  // Overground - Lioness
  "Watford Junction": 7, "Watford High Street": 7, "Bushey": 7,
  "Carpenders Park": 7, "Hatch End": 6, "Headstone Lane": 5,
  "Kilburn High Road": 2, "South Hampstead": 2,

  // Overground - Liberty
  "Emerson Park": 6,

  // Overground - Weaver (Cheshunt branch)
  "Cheshunt": 7,

  // Overground - Suffragette (already covered above)

  // Overground - Mildmay (Shepherd's Bush Overground)
  "Shepherd's Bush": 2
};

// Helper to get zone for a station (returns zone number or null)
function getStationZone(station) {
  return STATION_ZONES[station] || null;
}

// Get all stations in a specific zone
function getStationsInZone(zone) {
  return ALL_STATIONS.filter(s => STATION_ZONES[s] === zone);
}

// Get unique zones present in the data
function getAllZones() {
  const zones = new Set(Object.values(STATION_ZONES));
  return [...zones].sort((a, b) => a - b);
}
