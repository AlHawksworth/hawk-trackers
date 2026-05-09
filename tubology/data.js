// Tubology - Complete TfL Tube Network Data
// All lines and stations as per the current TfL network

const TUBE_LINES = {
  bakerloo: {
    name: "Bakerloo",
    color: "#B36305",
    stations: [
      "Harrow & Wealdstone", "Kenton", "South Kenton", "North Wembley",
      "Wembley Central", "Stonebridge Park", "Harlesden", "Willesden Junction",
      "Kensal Green", "Queen's Park", "Kilburn Park", "Maida Vale",
      "Warwick Avenue", "Paddington", "Edgware Road", "Marylebone",
      "Baker Street", "Regent's Park", "Oxford Circus", "Piccadilly Circus",
      "Charing Cross", "Embankment", "Waterloo", "Lambeth North", "Elephant & Castle"
    ]
  },
  central: {
    name: "Central",
    color: "#E32017",
    stations: [
      "West Ruislip", "Ruislip Gardens", "South Ruislip", "Northolt",
      "Greenford", "Perivale", "Hanger Lane", "North Acton",
      "East Acton", "White City", "Shepherd's Bush", "Holland Park",
      "Notting Hill Gate", "Queensway", "Lancaster Gate", "Marble Arch",
      "Bond Street", "Oxford Circus", "Tottenham Court Road", "Holborn",
      "Chancery Lane", "St. Paul's", "Bank", "Liverpool Street",
      "Bethnal Green", "Mile End", "Stratford", "Leyton", "Leytonstone",
      "Snaresbrook", "South Woodford", "Woodford",
      "Buckhurst Hill", "Loughton", "Debden", "Theydon Bois", "Epping",
      "Wanstead", "Redbridge", "Gants Hill", "Newbury Park",
      "Barkingside", "Fairlop", "Hainault", "Grange Hill", "Chigwell", "Roding Valley"
    ]
  },
  circle: {
    name: "Circle",
    color: "#FFD300",
    stations: [
      "Hammersmith", "Goldhawk Road", "Shepherd's Bush Market",
      "Wood Lane", "Latimer Road", "Ladbroke Grove",
      "Westbourne Park", "Royal Oak", "Paddington",
      "Edgware Road", "Baker Street", "Great Portland Street",
      "Euston Square", "King's Cross St. Pancras", "Farringdon",
      "Barbican", "Moorgate", "Liverpool Street", "Aldgate",
      "Tower Hill", "Monument", "Cannon Street", "Mansion House",
      "Blackfriars", "Temple", "Embankment", "Westminster",
      "St. James's Park", "Victoria", "Sloane Square", "South Kensington",
      "Gloucester Road", "High Street Kensington", "Notting Hill Gate",
      "Bayswater", "Paddington"
    ]
  },
  district: {
    name: "District",
    color: "#00782A",
    stations: [
      "Richmond", "Kew Gardens", "Gunnersbury", "Turnham Green",
      "Chiswick Park", "Acton Town", "Ealing Common", "Ealing Broadway",
      "Hammersmith", "Barons Court", "West Kensington",
      "Earl's Court", "Gloucester Road", "South Kensington",
      "Sloane Square", "Victoria", "St. James's Park", "Westminster",
      "Embankment", "Temple", "Blackfriars", "Mansion House",
      "Cannon Street", "Monument", "Tower Hill", "Aldgate East",
      "Whitechapel", "Stepney Green", "Mile End", "Bow Road",
      "Bromley-by-Bow", "West Ham", "Plaistow", "Upton Park",
      "East Ham", "Barking", "Upney", "Becontree",
      "Dagenham Heathway", "Dagenham East", "Elm Park", "Hornchurch",
      "Upminster Bridge", "Upminster",
      "West Brompton", "Fulham Broadway", "Parsons Green",
      "Putney Bridge", "East Putney", "Southfields", "Wimbledon Park", "Wimbledon",
      "Olympia"
    ]
  },
  hammersmithCity: {
    name: "Hammersmith & City",
    color: "#F3A9BB",
    stations: [
      "Hammersmith", "Goldhawk Road", "Shepherd's Bush Market",
      "Wood Lane", "Latimer Road", "Ladbroke Grove",
      "Westbourne Park", "Royal Oak", "Paddington",
      "Edgware Road", "Baker Street", "Great Portland Street",
      "Euston Square", "King's Cross St. Pancras", "Farringdon",
      "Barbican", "Moorgate", "Liverpool Street", "Aldgate East",
      "Whitechapel", "Stepney Green", "Mile End", "Bow Road",
      "Bromley-by-Bow", "West Ham", "Plaistow", "Upton Park",
      "East Ham", "Barking"
    ]
  },
  jubilee: {
    name: "Jubilee",
    color: "#A0A5A9",
    stations: [
      "Stanmore", "Canons Park", "Queensbury", "Kingsbury",
      "Wembley Park", "Neasden", "Dollis Hill", "Willesden Green",
      "Kilburn", "West Hampstead", "Finchley Road", "Swiss Cottage",
      "St. John's Wood", "Baker Street", "Bond Street", "Green Park",
      "Westminster", "Waterloo", "Southwark", "London Bridge",
      "Bermondsey", "Canada Water", "Canary Wharf", "North Greenwich",
      "Canning Town", "West Ham", "Stratford"
    ]
  },
  metropolitan: {
    name: "Metropolitan",
    color: "#9B0056",
    stations: [
      "Aldgate", "Liverpool Street", "Moorgate", "Barbican",
      "Farringdon", "King's Cross St. Pancras", "Euston Square",
      "Great Portland Street", "Baker Street", "Finchley Road",
      "Wembley Park", "Preston Road", "Northwick Park",
      "Harrow-on-the-Hill", "Moor Park", "Northwood", "Northwood Hills",
      "Pinner", "North Harrow", "West Harrow",
      "Rickmansworth", "Chorleywood", "Chalfont & Latimer",
      "Chesham", "Amersham",
      "Croxley", "Watford",
      "Uxbridge", "Hillingdon", "Ickenham", "Ruislip", "Ruislip Manor",
      "Eastcote"
    ]
  },
  northern: {
    name: "Northern",
    color: "#000000",
    stations: [
      "High Barnet", "Totteridge & Whetstone", "Woodside Park",
      "West Finchley", "Finchley Central", "East Finchley",
      "Highgate", "Archway", "Tufnell Park", "Kentish Town",
      "Camden Town", "Mornington Crescent", "Euston",
      "King's Cross St. Pancras", "Angel", "Old Street", "Moorgate",
      "Bank", "London Bridge", "Borough", "Elephant & Castle",
      "Kennington", "Oval", "Stockwell", "Clapham North",
      "Clapham Common", "Clapham South", "Balham", "Tooting Bec",
      "Tooting Broadway", "Colliers Wood", "South Wimbledon", "Morden",
      "Edgware", "Burnt Oak", "Colindale", "Hendon Central",
      "Brent Cross", "Golders Green", "Hampstead", "Belsize Park",
      "Chalk Farm", "Camden Town",
      "Warren Street", "Goodge Street", "Tottenham Court Road",
      "Leicester Square", "Charing Cross", "Embankment", "Waterloo",
      "Kennington",
      "Nine Elms", "Battersea Power Station"
    ]
  },
  piccadilly: {
    name: "Piccadilly",
    color: "#003688",
    stations: [
      "Uxbridge", "Hillingdon", "Ickenham", "Ruislip", "Ruislip Manor",
      "Eastcote", "Rayners Lane", "South Harrow", "Sudbury Hill",
      "Sudbury Town", "Alperton", "Park Royal", "North Ealing",
      "Ealing Common", "Acton Town", "Turnham Green",
      "Hammersmith", "Barons Court", "Earl's Court",
      "Gloucester Road", "South Kensington", "Knightsbridge",
      "Hyde Park Corner", "Green Park", "Piccadilly Circus",
      "Leicester Square", "Covent Garden", "Holborn",
      "Russell Square", "King's Cross St. Pancras",
      "Caledonian Road", "Holloway Road", "Arsenal", "Finsbury Park",
      "Manor House", "Turnpike Lane", "Wood Green", "Bounds Green",
      "Arnos Grove", "Southgate", "Oakwood", "Cockfosters",
      "Heathrow Terminals 2 & 3", "Heathrow Terminal 4", "Heathrow Terminal 5",
      "Hatton Cross", "Hounslow West", "Hounslow Central", "Hounslow East",
      "Osterley", "Boston Manor", "Northfields"
    ]
  },
  victoria: {
    name: "Victoria",
    color: "#0098D4",
    stations: [
      "Walthamstow Central", "Blackhorse Road", "Tottenham Hale",
      "Seven Sisters", "Finsbury Park", "Highbury & Islington",
      "King's Cross St. Pancras", "Euston", "Warren Street",
      "Oxford Circus", "Green Park", "Victoria", "Pimlico",
      "Vauxhall", "Stockwell", "Brixton"
    ]
  },
  waterloo: {
    name: "Waterloo & City",
    color: "#95CDBA",
    stations: [
      "Waterloo", "Bank"
    ]
  },
  elizabeth: {
    name: "Elizabeth",
    color: "#6950A1",
    stations: [
      "Reading", "Twyford", "Maidenhead", "Taplow", "Burnham",
      "Slough", "Langley", "Iver", "West Drayton", "Hayes & Harlington",
      "Southall", "Hanwell", "West Ealing", "Ealing Broadway",
      "Acton Main Line", "Paddington", "Bond Street",
      "Tottenham Court Road", "Farringdon", "Liverpool Street",
      "Whitechapel", "Canary Wharf", "Custom House", "Woolwich",
      "Abbey Wood", "Stratford", "Maryland", "Forest Gate",
      "Manor Park", "Ilford", "Seven Kings", "Goodmayes",
      "Chadwell Heath", "Romford", "Gidea Park", "Harold Wood",
      "Brentwood", "Shenfield",
      "Heathrow Terminal 4", "Heathrow Terminals 2 & 3", "Heathrow Terminal 5"
    ]
  }
};

// Build a unique station list with line associations
function buildStationIndex() {
  const stationMap = {};
  Object.entries(TUBE_LINES).forEach(([lineId, line]) => {
    line.stations.forEach(station => {
      if (!stationMap[station]) {
        stationMap[station] = { name: station, lines: [] };
      }
      if (!stationMap[station].lines.includes(lineId)) {
        stationMap[station].lines.push(lineId);
      }
    });
  });
  return stationMap;
}

const STATION_INDEX = buildStationIndex();
const ALL_STATIONS = Object.keys(STATION_INDEX).sort();
const TOTAL_STATIONS = ALL_STATIONS.length;
