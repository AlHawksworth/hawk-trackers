
// England Brewery Tracker — app.js

const DEFAULT_BREWERIES = [
  // ── BERMONDSEY BEER MILE ──
  { id: 1,  name: "The Kernel Brewery",        area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Porter","Table Beer"],        website: "https://www.thekernelbrewery.com" },
  { id: 2,  name: "Anspach & Hobday",          area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Porter","IPA","Lager","Sour","Bitter"],        website: "https://www.anspachandhobday.com" },
  { id: 3,  name: "Fourpure Brewing Co",       area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Session IPA","Pils","Stout","Pale Ale"],       website: "https://www.fourpure.com" },
  { id: 4,  name: "Brew By Numbers",           area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Saison","IPA","Stout","Sour"],                  website: "https://www.brewbynumbers.com" },
  { id: 5,  name: "Hiver Beers",               area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Honey Ale","Blonde","Amber"],                   website: "https://www.hiverbeers.com" },
  { id: 6,  name: "Southwark Brewing Co",      area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["London Pale","Cask Bitter","IPA"],              website: "https://www.southwarkbrewing.co.uk" },
  { id: 7,  name: "The Barrel Project",        area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Barrel-Aged","Sour","Wild Ale","Porter"],       website: "https://www.londonbeerfactory.com" },
  { id: 8,  name: "Cloudwater (London)",       area: "Bermondsey Beer Mile", type: "Taproom Only",         styles: ["NEIPA","Pale Ale","Stout","Lager"],             website: "https://cloudwaterbrew.co" },
  { id: 9,  name: "Small Beer Brew Co",        area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Lager","Steam","Pale","Dark"],                  website: "https://www.smallbeer.co" },
  { id: 10, name: "Moor Beer (London)",        area: "Bermondsey Beer Mile", type: "Taproom Only",         styles: ["Smoked Lager","IPA","Stout","Sour"],            website: "https://www.moorbeer.co.uk" },
  { id: 11, name: "EeBria Tap",                area: "Bermondsey Beer Mile", type: "Taproom Only",         styles: ["Rotating Guest Taps","Craft Cider","Wine"],     website: "https://www.eebria.com" },

  // ── HACKNEY WICK & STRATFORD ──
  { id: 20, name: "Howling Hops",              area: "Hackney Wick",         type: "Craft / Microbrewery", styles: ["Tank IPA","Pils","Pale Ale","Stout"],           website: "https://www.howlinghops.co.uk" },
  { id: 21, name: "Crate Brewery",             area: "Hackney Wick",         type: "Brewpub",              styles: ["Pale Ale","IPA","Stout","Sour"],                website: "https://www.cratebrewery.com" },
  { id: 22, name: "Beavertown Brewery",        area: "Hackney Wick",         type: "Craft / Microbrewery", styles: ["Gamma Ray APA","Neck Oil","Lupuloid IPA"],      website: "https://beavertownbrewery.co.uk" },
  { id: 23, name: "Five Points Brewing Co",    area: "Hackney",              type: "Craft / Microbrewery", styles: ["Railway Porter","XPA","Pils","IPA"],            website: "https://fivepointsbrewing.co.uk" },
  { id: 24, name: "Forest Road Brewery",       area: "Hackney",              type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager","Sour"],                website: "https://www.forestroad.co.uk" },
  { id: 25, name: "Hackney Church Brew Co",    area: "Hackney",              type: "Craft / Microbrewery", styles: ["Pale Ale","Stout","IPA","Sour"],                website: "https://hackneychurchbrewco.com" },
  { id: 26, name: "People's Park Tavern",      area: "Hackney",              type: "Brewpub",              styles: ["Stout","Sour","Cask Ale","Craft Keg"],          website: "https://www.peoplesparktavern.pub" },
  { id: 27, name: "Exale Brewing",             area: "Walthamstow",          type: "Craft / Microbrewery", styles: ["Sour","IPA","Pale Ale","Barrel-Aged"],          website: "https://www.exale.co.uk" },
  { id: 28, name: "Signature Brew",            area: "Walthamstow",          type: "Craft / Microbrewery", styles: ["Studio Lager","Roadie IPA","Backstage IPA"],    website: "https://www.signaturebrew.co.uk" },
  { id: 29, name: "Pretty Decent Beer Co",     area: "Walthamstow",          type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager","Low-ABV"],             website: "https://prettydecentbeer.co" },
  { id: 30, name: "Hackney Brewery",           area: "Walthamstow",          type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Bitter"],              website: "https://www.hackneybrewery.co.uk" },
  { id: 31, name: "Pressure Drop Brewing",     area: "Tottenham",            type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Sour"],                website: "https://pressuredropbrewing.co.uk" },
  { id: 32, name: "Gravity Well Brewing",      area: "Leyton",               type: "Craft / Microbrewery", styles: ["NEIPA","Pale Ale","Stout","Sour"],              website: "https://www.gravitywellbrewing.co.uk" },
  { id: 33, name: "Neckstamper Brewery",       area: "Leyton",               type: "Craft / Microbrewery", styles: ["IPA","Pale Ale","Lager","Sour"],                website: "https://www.neckstamper.com" },
  { id: 34, name: "Blondies Brewery",          area: "Leyton",               type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager"],                       website: "" },
  { id: 35, name: "Long Arm Brewing",          area: "Shoreditch",           type: "Brewpub",              styles: ["Tank Beer","Pale Ale","IPA","Lager"],           website: "https://www.longarmbrewery.com" },

  // ── NORTH LONDON ──
  { id: 40, name: "Hammerton Brewery",         area: "Islington",            type: "Craft / Microbrewery", styles: ["N1 Lager","Pentonville Pale","Crunch Peanut Butter Stout"], website: "https://www.hammertonbrewery.co.uk" },
  { id: 41, name: "Two Tribes Brewery",        area: "King's Cross",         type: "Craft / Microbrewery", styles: ["Metroland IPA","Dream Factory Pale","Lager"],  website: "https://www.twotribesbrewing.com" },
  { id: 42, name: "Camden Town Brewery",       area: "Camden",               type: "Craft / Microbrewery", styles: ["Hells Lager","Pale Ale","IPA","Stout"],         website: "https://www.camdentownbrewery.com" },
  { id: 43, name: "Werewolf Beer",             area: "Camden",               type: "Craft / Microbrewery", styles: ["APA","Pale Ale","Pumpkin Pale","Psychobilly"],  website: "https://www.werewolfbeer.co.uk" },
  { id: 44, name: "3 Locks Brewing Co",        area: "Camden",               type: "Craft / Microbrewery", styles: ["West Coast IPA","Pale Ale","Lager"],            website: "https://www.3locksbrewing.com" },
  { id: 45, name: "Muswell Hillbilly Brewers", area: "Muswell Hill",         type: "Craft / Microbrewery", styles: ["IPA","Stout","Pale Ale","Coffee Stout"],        website: "https://muswellhillbillybrewers.co.uk" },
  { id: 46, name: "Goodness Brewing Co",       area: "Haringey",             type: "Craft / Microbrewery", styles: ["Gluten-Reduced","Vegan Pale","IPA"],            website: "https://www.goodnessbrewing.co" },
  { id: 47, name: "Redemption Brewing Co",     area: "Tottenham",            type: "Craft / Microbrewery", styles: ["Trinity","Pale Ale","Hopspur IPA","Big Chief"], website: "https://www.redemptionbrewing.co.uk" },
  { id: 48, name: "Truman's Beer",             area: "Hackney",              type: "Craft / Microbrewery", styles: ["Swift Pale","Runner IPA","Zephyr Lager"],       website: "https://www.trumansbeer.co.uk" },

  // ── SOUTH LONDON ──
  { id: 60, name: "Brixton Brewery",           area: "Brixton",              type: "Craft / Microbrewery", styles: ["Reliance Pale","Electric IPA","Atlantic APA"],  website: "https://www.brixtonbrewery.com" },
  { id: 61, name: "Gipsy Hill Brewing Co",     area: "Gipsy Hill",           type: "Craft / Microbrewery", styles: ["Beatnik Pale","Hepcat IPA","Lager"],            website: "https://www.gipsyhillbrew.com" },
  { id: 62, name: "Brick Brewery",             area: "Peckham",              type: "Craft / Microbrewery", styles: ["Peckham Pils","Pale Ale","Gluten-Free Lager"],  website: "https://www.brickbrewery.co.uk" },
  { id: 63, name: "Villages Brewery",          area: "Deptford",             type: "Craft / Microbrewery", styles: ["Lager","IPA","Pale Ale","Dark Beer"],           website: "https://www.villagesbrewery.com" },
  { id: 64, name: "Orbit Beers",               area: "Walworth",             type: "Craft / Microbrewery", styles: ["Nico Kolsch","Peel Pale","Ivo Stout","Sour"],   website: "https://www.orbitbeers.com" },
  { id: 65, name: "Sambrook's Brewery",        area: "Wandsworth",           type: "Craft / Microbrewery", styles: ["Junction Ale","Wandle Ale","Powerhouse Porter"],website: "https://www.sambrooksbrewery.co.uk" },
  { id: 66, name: "Battersea Brewery",         area: "Battersea",            type: "Craft / Microbrewery", styles: ["Best Bitter","Scotch Ale","Pale Ale","Lager"],  website: "https://www.batterseabrewery.co.uk" },
  { id: 67, name: "Friendship Adventure",      area: "Brixton",              type: "Craft / Microbrewery", styles: ["Headliner IPA","Pale Ale","Sour"],              website: "https://www.friendshipadventure.co.uk" },
  { id: 68, name: "Signal Brewery",            area: "Croydon",              type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager","Sour"],                website: "https://www.signalbrewery.co.uk" },
  { id: 69, name: "Bird House Brewery",        area: "Herne Hill",           type: "Craft / Microbrewery", styles: ["Lager","Pale Ale","Stout"],                     website: "" },
  { id: 70, name: "Dogs Grandad Brewery",      area: "Brixton",              type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Sour","Wheat Beer"],           website: "" },
  { id: 71, name: "Brew By Numbers (Morden)",  area: "Greenwich",            type: "Craft / Microbrewery", styles: ["Porter","Saison","IPA","Sour"],                 website: "https://www.brewbynumbers.com" },
  { id: 72, name: "Little Faith Taproom",      area: "Deptford",             type: "Taproom Only",         styles: ["Rotating Guest Taps","Local Craft"],            website: "" },

  // ── WEST LONDON ──
  { id: 80, name: "Fuller's Brewery",          area: "Chiswick",             type: "Regional",             styles: ["London Pride","ESB","Frontier Lager","Porter"], website: "https://www.fullers.co.uk" },
  { id: 81, name: "Meantime Brewing Co",       area: "Greenwich",            type: "Craft / Microbrewery", styles: ["London Lager","Pale Ale","IPA","Wheat Beer"],   website: "https://www.meantimebrewing.com" },

  // ── EAST LONDON ──
  { id: 90, name: "Boxcar Brewery",            area: "Bethnal Green",        type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Sour"],                website: "", nowClosed: true },
  { id: 91, name: "Mother Kelly's",            area: "Bethnal Green",        type: "Taproom Only",         styles: ["Rotating Guest Taps","Craft Keg","Cider"],     website: "https://www.motherkellys.co.uk" },
  { id: 106, name: "Tap East",                 area: "Stratford",            type: "Brewpub",              styles: ["Pale Ale","IPA","Stout","Lager"],               website: "https://www.tapeast.co.uk",             lat: 51.5421, lng: -0.0041 },

  // ── NOTABLE CLOSED ──
  { id: 100, name: "Partizan Brewing",         area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Saison","IPA","Pale Ale","Sour"],               website: "", nowClosed: true },
  { id: 101, name: "Canopy Beer Co",           area: "Herne Hill",           type: "Craft / Microbrewery", styles: ["Brockwell IPA","Forge Stout","Picnic Wit"],     website: "", nowClosed: true },
  { id: 102, name: "Lowline Taproom",          area: "Elephant & Castle",    type: "Taproom Only",         styles: ["Sour","IPA","Stout"],                           website: "", nowClosed: true },
  { id: 111, name: "Ubrew",                    area: "Bermondsey Beer Mile", type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout"],                       website: "", nowClosed: true,                       lat: 51.4981, lng: -0.0698 },

  // ── ADDITIONAL BREWERIES ──
  { id: 103, name: "Wildcard Brewery",         area: "Walthamstow",          type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager","Stout"],               website: "https://www.wildcardbrewery.co.uk",    lat: 51.5872, lng: -0.0401 },
  { id: 104, name: "Beerblefish Brewing",      area: "Walthamstow",          type: "Craft / Microbrewery", styles: ["IPA","Pale Ale","Sour"],                        website: "https://www.beerblefish.com",           lat: 51.5869, lng: -0.0415 },
  { id: 105, name: "Solvay Society",           area: "Leyton",               type: "Craft / Microbrewery", styles: ["Lager","Pale Ale","IPA"],                       website: "https://www.solvaysociety.com",         lat: 51.5695, lng: -0.0118 },
  { id: 107, name: "Mondo Brewing Co",         area: "Battersea",            type: "Craft / Microbrewery", styles: ["Lager","IPA","Pale Ale","Stout"],               website: "https://www.mondobrewing.com",          lat: 51.4798, lng: -0.1521 },
  { id: 108, name: "Clarkshaws Brewing",       area: "Brixton",              type: "Craft / Microbrewery", styles: ["Gorgon's Alive IPA","Hellhound","Pale Ale"],    website: "https://www.clarkshaws.co.uk",          lat: 51.4631, lng: -0.1121 },
  { id: 109, name: "Hops & Glory",             area: "Islington",            type: "Brewpub",              styles: ["Cask Ale","IPA","Bitter","Stout"],              website: "https://www.hopsandglory.co.uk",        lat: 51.5461, lng: -0.1041 },
  { id: 110, name: "Brew York (London)",       area: "Bermondsey Beer Mile", type: "Taproom Only",         styles: ["IPA","Stout","Pale Ale","Sour"],                website: "https://www.brewyork.co.uk",            lat: 51.4985, lng: -0.0712 },

  // ── MANCHESTER ──
  { id: 200, name: "Cloudwater Brew Co",        area: "Manchester",           type: "Craft / Microbrewery", styles: ["NEIPA","Pale Ale","Stout","Lager","Sour"],      website: "https://cloudwaterbrew.co",            lat: 53.4808, lng: -2.2426 },
  { id: 201, name: "Marble Brewery",            area: "Manchester",           type: "Brewpub",              styles: ["Pint","Lagonda IPA","Dobber","Organic Ginger"], website: "https://www.marblebeers.com",           lat: 53.4831, lng: -2.2253 },
  { id: 202, name: "Seven Bro7hers Brewery",    area: "Salford",              type: "Craft / Microbrewery", styles: ["Session IPA","Pale Ale","Stout","Lager"],       website: "https://www.sevenbro7hers.com",         lat: 53.4875, lng: -2.2901 },
  { id: 203, name: "Sureshot Brewing",          area: "Manchester",           type: "Craft / Microbrewery", styles: ["NEIPA","Pale Ale","Sour","Lager"],              website: "https://www.sureshotbrew.com",          lat: 53.4772, lng: -2.2309 },
  { id: 204, name: "Track Brewing Co",          area: "Manchester",           type: "Craft / Microbrewery", styles: ["Sonoma Pale","Mancunian Lager","IPA","Stout"],  website: "https://www.trackbrewing.co",           lat: 53.4762, lng: -2.2198 },
  { id: 205, name: "Balance Brewing",           area: "Manchester",           type: "Craft / Microbrewery", styles: ["Mixed Fermentation","Barrel-Aged","Sour","Wild Ale"], website: "https://www.balancebrewing.co.uk",  lat: 53.4771, lng: -2.2301 },
  { id: 206, name: "Beatnikz Republic",         area: "Manchester",           type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager","Stout"],               website: "https://www.beatnikzrepublic.com",      lat: 53.4780, lng: -2.2350 },
  { id: 207, name: "Pomona Island Brew Co",     area: "Salford",              type: "Craft / Microbrewery", styles: ["NEIPA","Pale Ale","Sour","Stout"],              website: "https://www.pomonaisland.com",          lat: 53.4820, lng: -2.2780 },

  // ── LIVERPOOL ──
  { id: 210, name: "Mad Hatter Brewing Co",     area: "Liverpool",            type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Sour"],                website: "https://www.madhatterbrewing.co.uk",    lat: 53.4084, lng: -2.9916 },
  { id: 211, name: "Love Lane Brewery",         area: "Liverpool",            type: "Brewpub",              styles: ["Pale Ale","IPA","Stout","Lager"],               website: "https://www.lovelanebeer.com",          lat: 53.4093, lng: -2.9901 },
  { id: 212, name: "Neptune Brewery",           area: "Liverpool",            type: "Craft / Microbrewery", styles: ["Mosaic Pale","IPA","Stout","Wheat Beer"],       website: "https://www.neptunebrewery.com",        lat: 53.4050, lng: -2.9780 },

  // ── YORKSHIRE ──
  { id: 220, name: "Northern Monk Brew Co",     area: "Leeds",                type: "Craft / Microbrewery", styles: ["Faith Pale","Eternal IPA","Heathen","Patrons Project"], website: "https://www.northernmonk.com",    lat: 53.7938, lng: -1.5456 },
  { id: 221, name: "Magic Rock Brewing",        area: "Huddersfield",         type: "Craft / Microbrewery", styles: ["Cannonball IPA","High Wire","Fantasma","Salty Kiss"], website: "https://www.magicrockbrewing.com", lat: 53.6450, lng: -1.7798 },
  { id: 222, name: "Vocation Brewery",          area: "Hebden Bridge",        type: "Craft / Microbrewery", styles: ["Life & Death IPA","Bread & Butter","Heart & Soul","Naughty & Nice"], website: "https://www.vocationbrewery.com", lat: 53.7440, lng: -2.0120 },
  { id: 223, name: "Brew York",                 area: "York",                 type: "Brewpub",              styles: ["Tonkoko Stout","Calmer Chameleon","Viking DNA","IPA"], website: "https://www.brewyork.co.uk",      lat: 53.9591, lng: -1.0815 },
  { id: 224, name: "North Brewing Co",          area: "Leeds",                type: "Craft / Microbrewery", styles: ["Transmission IPA","Sputnik","Citra","Stout"],   website: "https://www.northbrewing.com",          lat: 53.8008, lng: -1.5491 },
  { id: 225, name: "Kirkstall Brewery",         area: "Leeds",                type: "Craft / Microbrewery", styles: ["Dissolution IPA","Pale Ale","Three Swords","Virtuous"], website: "https://www.kirkstallbrewery.com", lat: 53.8100, lng: -1.5890 },
  { id: 226, name: "Thornbridge Brewery",       area: "Sheffield",            type: "Craft / Microbrewery", styles: ["Jaipur IPA","Kipling","Lord Marples","Wild Swan"], website: "https://www.thornbridgebrewery.co.uk", lat: 53.3811, lng: -1.4701 },
  { id: 227, name: "True North Brew Co",        area: "Sheffield",            type: "Brewpub",              styles: ["Pale Ale","IPA","Stout","Lager"],               website: "https://www.truenorthbrewco.uk",        lat: 53.3800, lng: -1.4700 },
  { id: 228, name: "Chantry Brewery",           area: "Sheffield",            type: "Craft / Microbrewery", styles: ["New York Pale","Iron & Steel Stout","Steelos Lager"], website: "https://www.chantrybrewery.co.uk", lat: 53.3850, lng: -1.4650 },
  { id: 229, name: "Rooster's Brewing Co",      area: "York",                 type: "Craft / Microbrewery", styles: ["Yankee","Baby-Faced Assassin","Buckeye","Fort Smith"], website: "https://www.roosters.co.uk",      lat: 53.9900, lng: -1.5400 },
  { id: 230, name: "Buxton Brewery",            area: "Buxton",               type: "Craft / Microbrewery", styles: ["Axe Edge IPA","Moor Top","Rain Shadow","Imperial Black"], website: "https://www.buxtonbrewery.co.uk", lat: 53.2590, lng: -1.9100 },

  // ── NORTH EAST ──
  { id: 240, name: "Wylam Brewery",             area: "Newcastle",            type: "Craft / Microbrewery", styles: ["Jakehead IPA","Collingwood","Galaxy Brain","Hickey the Rake"], website: "https://www.wylambrewery.co.uk", lat: 54.9783, lng: -1.6178 },
  { id: 241, name: "Almasty Brewing Co",        area: "Newcastle",            type: "Craft / Microbrewery", styles: ["Believe NEIPA","Session IPA","Pale Ale","Stout"], website: "https://www.almasty.co.uk",        lat: 54.9750, lng: -1.6100 },
  { id: 242, name: "Anarchy Brew Co",           area: "Newcastle",            type: "Craft / Microbrewery", styles: ["Sublime Chaos","Smoke Bomb","Urban Assault","Quiet Riot"], website: "https://www.anarchybrewco.com",  lat: 54.9700, lng: -1.6050 },
  { id: 243, name: "Mordue Brewery",            area: "Newcastle",            type: "Craft / Microbrewery", styles: ["Workie Ticket","Radgie Gadgie","Five Bridges","IPA"], website: "https://www.morduebrewery.com",   lat: 54.9800, lng: -1.6200 },
  { id: 244, name: "Maxim Brewery",             area: "Sunderland",           type: "Regional",             styles: ["Double Maxim","Samson","Ward's Best Bitter","Lambton's"], website: "https://www.maximbrewery.co.uk", lat: 54.9069, lng: -1.3838 },

  // ── EAST MIDLANDS ──
  { id: 250, name: "Thornbridge (Bakewell)",    area: "Derby",                type: "Craft / Microbrewery", styles: ["Jaipur IPA","Kipling","Lord Marples","Halcyon"], website: "https://www.thornbridgebrewery.co.uk", lat: 53.2140, lng: -1.6760 },
  { id: 251, name: "Totally Brewed",            area: "Nottingham",           type: "Craft / Microbrewery", styles: ["Prince of Darkness","Fear the Reaper","Ninja Squirrel","Pale Ale"], website: "https://www.totallybrewed.com", lat: 52.9548, lng: -1.1581 },
  { id: 252, name: "Neon Raptor Brewing Co",    area: "Nottingham",           type: "Craft / Microbrewery", styles: ["NEIPA","Pale Ale","Stout","Sour"],              website: "https://www.neonraptorbrewingco.com",   lat: 52.9600, lng: -1.1500 },
  { id: 253, name: "Magpie Brewery",            area: "Nottingham",           type: "Craft / Microbrewery", styles: ["Hoppily Ever After","Jay IPA","Stout","Pale Ale"], website: "https://www.magpiebrewery.com",    lat: 52.9520, lng: -1.1600 },
  { id: 254, name: "Dancing Duck Brewery",      area: "Derby",                type: "Craft / Microbrewery", styles: ["Nice Weather","Ay Up","Dark Drake","22","Abduction"], website: "https://www.dancingduckbrewery.com", lat: 52.9225, lng: -1.4746 },
  { id: 255, name: "Everards Brewery",          area: "Leicester",            type: "Regional",             styles: ["Tiger Best Bitter","Beacon Bitter","Old Original","Sunchaser"], website: "https://www.everards.co.uk", lat: 52.6369, lng: -1.1398 },

  // ── WEST MIDLANDS ──
  { id: 260, name: "Burning Soul Brewing",      area: "Birmingham",           type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Sour"],                website: "https://www.burningsoulbrewing.com",    lat: 52.4862, lng: -1.8904 },
  { id: 261, name: "Dig Brew Co",               area: "Birmingham",           type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Lager","Stout"],               website: "https://www.digbrew.co.uk",             lat: 52.4800, lng: -1.8800 },
  { id: 262, name: "Twisted Barrel Ale",        area: "Coventry",             type: "Craft / Microbrewery", styles: ["Beast of the East","Pale Ale","IPA","Stout"],   website: "https://www.twistedbarrelale.co.uk",    lat: 52.4068, lng: -1.5197 },
  { id: 263, name: "Sadler's Ales",             area: "Wolverhampton",        type: "Regional",             styles: ["Mud City Stout","Peaky Blinder","IPA","Pale Ale"], website: "https://www.sadlersales.co.uk",      lat: 52.5870, lng: -2.1290 },

  // ── BRISTOL & SOUTH WEST ──
  { id: 270, name: "Left Handed Giant",         area: "Bristol",              type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Sour","Lager"],        website: "https://www.lefthandedgiant.com",       lat: 51.4545, lng: -2.5879 },
  { id: 271, name: "Moor Beer Co",              area: "Bristol",              type: "Craft / Microbrewery", styles: ["Nor'Hop","Raw","Confidence","Stout","Sour"],    website: "https://www.moorbeer.co.uk",            lat: 51.4490, lng: -2.5820 },
  { id: 272, name: "Good Chemistry Brewing",    area: "Bristol",              type: "Craft / Microbrewery", styles: ["Pale Ale","IPA","Stout","Sour"],                website: "https://www.goodchemistrybrewing.co.uk", lat: 51.4510, lng: -2.5760 },
  { id: 273, name: "Arbour Ales",               area: "Bristol",              type: "Craft / Microbrewery", styles: ["Brigstow Bitter","Yakima Valley","Single Hop","Oyster Stout"], website: "https://www.arbourales.co.uk", lat: 51.4700, lng: -2.5900 },
  { id: 274, name: "Lost & Grounded Brewers",   area: "Bristol",              type: "Craft / Microbrewery", styles: ["Keller Pils","Running with Sceptres","Hop-Go-Lucky","Apophenia"], website: "https://www.lostandgrounded.co.uk", lat: 51.4480, lng: -2.5840 },
  { id: 275, name: "Wiper and True",            area: "Bristol",              type: "Craft / Microbrewery", styles: ["Kaleidoscope","Milkshake Stout","Pale Ale","Saison"], website: "https://www.wiperandtrue.com",     lat: 51.4600, lng: -2.5700 },
  { id: 276, name: "Deya Brewing Company",      area: "Cheltenham",           type: "Craft / Microbrewery", styles: ["Steady Rolling Man","Into the Haze","Saturate","Pilsner"], website: "https://www.deyabrewing.com",     lat: 51.8994, lng: -2.0783 },
  { id: 277, name: "Verdant Brewing Co",        area: "Penryn",               type: "Craft / Microbrewery", styles: ["Lightbulb","Headband","Even Sharks Need Water","Pulp"], website: "https://www.verdantbrewing.co",   lat: 50.1640, lng: -5.1090 },
  { id: 278, name: "Harbour Brewing Co",        area: "Bodmin",               type: "Craft / Microbrewery", styles: ["Antipodean IPA","Amber","Pale Ale","Lager"],    website: "https://www.harbourbrewing.com",        lat: 50.4700, lng: -4.7200 },
  { id: 279, name: "Wild Beer Co",              area: "Westcombe",            type: "Craft / Microbrewery", styles: ["Bibble","Millionaire","Ninkasi","Sourdough"],   website: "https://www.wildbeerco.com",            lat: 51.1500, lng: -2.5800 },
  { id: 280, name: "Bath Ales",                 area: "Bath",                 type: "Regional",             styles: ["Gem","Barnstormer","Sulis Lager","Wild Hare"],  website: "https://www.bathales.com",              lat: 51.3781, lng: -2.3597 },
  { id: 281, name: "Dawkins Ales",              area: "Bristol",              type: "Craft / Microbrewery", styles: ["Easton IPA","Foresters","Midland Mild","Red"],  website: "https://www.dawkinsales.com",           lat: 51.4550, lng: -2.5950 },

  // ── SOUTH EAST ──
  { id: 290, name: "Burning Sky Brewery",       area: "Firle",                type: "Craft / Microbrewery", styles: ["Plateau","Arise","Aurora","Saison à la Provision"], website: "https://www.burningskybeer.com",   lat: 50.8200, lng: 0.0700 },
  { id: 291, name: "Siren Craft Brew",          area: "Finchampstead",        type: "Craft / Microbrewery", styles: ["Broken Dream","Undercurrent","Soundwave","Suspended in Haze"], website: "https://www.sirencraftbrew.com", lat: 51.3700, lng: -0.8700 },
  { id: 292, name: "Harvey's Brewery",          area: "Lewes",                type: "Regional",             styles: ["Sussex Best Bitter","Olympia","Armada Ale","Christmas Ale"], website: "https://www.harveys.org.uk",    lat: 50.8740, lng: 0.0110 },
  { id: 293, name: "Hepworth & Co",             area: "Guildford",            type: "Craft / Microbrewery", styles: ["Classic English Ale","Pullman","Iron Horse","Prospect Organic"], website: "https://www.hepworthbrewery.co.uk", lat: 51.0700, lng: -0.4600 },
  { id: 294, name: "Shepherd Neame",            area: "Canterbury",           type: "Regional",             styles: ["Spitfire","Master Brew","Bishops Finger","Whitstable Bay"], website: "https://www.shepherdneame.co.uk", lat: 51.2720, lng: 0.8890 },
  { id: 295, name: "Gadds' The Ramsgate Brewery", area: "Margate",            type: "Craft / Microbrewery", styles: ["No.3","No.7","Seasider","Faithful Dogbolter"],  website: "https://www.ramsgatebrewery.co.uk",    lat: 51.3813, lng: 1.3862 },
  { id: 296, name: "Beak Brewery",              area: "Lewes",                type: "Craft / Microbrewery", styles: ["Lager","Pale Ale","IPA","Stout"],               website: "https://www.beakbrewery.com",           lat: 50.8750, lng: 0.0120 },
  { id: 297, name: "Pressure Drop (Oxford)",    area: "Oxford",               type: "Taproom Only",         styles: ["Pale Ale","IPA","Stout","Sour"],                website: "https://pressuredropbrewing.co.uk",     lat: 51.7520, lng: -1.2577 },

  // ── EAST OF ENGLAND ──
  { id: 300, name: "Grain Brewery",             area: "Norwich",              type: "Craft / Microbrewery", styles: ["Lignum Vitae","Best Bitter","Redwood","Slate"], website: "https://www.grainbrewery.co.uk",        lat: 52.6309, lng: 1.2974 },
  { id: 301, name: "Lacons Brewery",            area: "Norwich",              type: "Regional",             styles: ["Encore","Affinity","Legacy","Audit Ale"],       website: "https://www.lacons.co.uk",              lat: 52.6200, lng: 1.7300 },
  { id: 302, name: "Adnams Brewery",            area: "Ipswich",              type: "Regional",             styles: ["Southwold Bitter","Ghost Ship","Broadside","Dry Hop Lager"], website: "https://www.adnams.co.uk",      lat: 52.3290, lng: 1.7150 },
  { id: 303, name: "Milton Brewery",            area: "Cambridge",            type: "Craft / Microbrewery", styles: ["Justinian","Pegasus","Minotaur","Cyclops"],     website: "https://www.miltonbrewery.co.uk",       lat: 52.2053, lng: 0.1218 },
];

// Grouped areas for the area filter bar
const AREA_GROUPS = {
  "London – Bermondsey":  ["Bermondsey Beer Mile"],
  "London – East":        ["Hackney Wick", "Hackney", "Shoreditch", "Bethnal Green", "Stratford"],
  "London – NE":          ["Walthamstow", "Tottenham", "Leyton"],
  "London – North":       ["Islington", "King's Cross", "Camden", "Muswell Hill", "Haringey"],
  "London – South":       ["Brixton", "Gipsy Hill", "Peckham", "Deptford", "Walworth", "Wandsworth", "Battersea", "Croydon", "Herne Hill", "Elephant & Castle"],
  "London – West":        ["Greenwich", "Chiswick"],
  "North West":           ["Manchester", "Salford", "Liverpool", "Chester", "Lancaster"],
  "Yorkshire":            ["Leeds", "Sheffield", "Huddersfield", "York", "Hebden Bridge", "Hull"],
  "North East":           ["Newcastle", "Gateshead", "Sunderland", "Durham"],
  "East Midlands":        ["Nottingham", "Derby", "Leicester", "Lincoln", "Buxton"],
  "West Midlands":        ["Birmingham", "Coventry", "Wolverhampton"],
  "East of England":      ["Norwich", "Cambridge", "Ipswich", "Colchester"],
  "South West":           ["Bristol", "Bath", "Cheltenham", "Gloucester", "Exeter", "Plymouth", "Falmouth", "Penryn", "Bodmin", "Westcombe"],
  "South East":           ["Brighton", "Lewes", "Firle", "Guildford", "Oxford", "Reading", "Finchampstead", "Canterbury", "Margate"],
};

const AREA_GROUP_COLORS = {
  "London – Bermondsey":  "#e67e22",
  "London – East":        "#2980b9",
  "London – NE":          "#8e44ad",
  "London – North":       "#27ae60",
  "London – South":       "#c0392b",
  "London – West":        "#16a085",
  "North West":           "#0891b2",
  "Yorkshire":            "#7c3aed",
  "North East":           "#059669",
  "East Midlands":        "#d97706",
  "West Midlands":        "#dc2626",
  "East of England":      "#0284c7",
  "South West":           "#65a30d",
  "South East":           "#db2777",
};

function getAreaGroup(area) {
  for (const [group, areas] of Object.entries(AREA_GROUPS)) {
    if (areas.includes(area)) return group;
  }
  return "Other";
}

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
  breweries: [],
  visits: {},
  closed: {},
  wishlist: {},
  darkMode: false,
};
let activeFilter    = "all";
let activeAreaGroup = "all";
let activeStyleFilter = "";
let searchQuery     = "";
let sortOrder       = "area";
let viewMode        = "grid";
let pendingId       = null;
let pendingRating   = 0;
let pendingPhoto    = null;
let undoStack       = [];
let crawlList       = []; // breweryIds in crawl planner

// ─── Persistence ──────────────────────────────────────────────────────────────
function save() {
  if (typeof FireSync !== "undefined") {
    FireSync.save("england-brewery-tracker", state);
  } else {
    localStorage.setItem("england-brewery-tracker", JSON.stringify(state));
  }
}

function load() {
  const raw = localStorage.getItem("england-brewery-tracker") || localStorage.getItem("london-brewery-tracker");
  if (raw) {
    try {
      const p = JSON.parse(raw);
      state.breweries = p.breweries || DEFAULT_BREWERIES.map(b => ({ ...b }));
      // Migrate old single-visit format
      const visits = p.visits || {};
      const migrated = {};
      for (const [id, v] of Object.entries(visits)) {
        migrated[id] = Array.isArray(v) ? v : [{ ...v, id: Date.now() + Math.random() }];
      }
      state.visits  = migrated;
      state.closed  = p.closed  || {};
      state.wishlist = p.wishlist || {};
      state.darkMode = p.darkMode || false;
    } catch { resetState(); }
  } else {
    resetState();
  }
  applyTheme();
  // Cloud sync
  if (typeof FireSync !== "undefined") {
    FireSync.load("england-brewery-tracker", (cloudData) => {
      if (cloudData && cloudData.breweries) {
        state.breweries = cloudData.breweries || state.breweries;
        const visits = cloudData.visits || {};
        const migrated = {};
        for (const [id, v] of Object.entries(visits)) {
          migrated[id] = Array.isArray(v) ? v : [{ ...v, id: Date.now() + Math.random() }];
        }
        state.visits   = migrated;
        state.closed   = cloudData.closed   || state.closed;
        state.wishlist = cloudData.wishlist || state.wishlist;
        if (typeof render === "function") render();
      }
    });
  }
}

function resetState() {
  state.breweries = DEFAULT_BREWERIES.map(b => ({ ...b }));
  state.visits    = {};
  state.closed    = {};
  state.wishlist  = {};
  state.darkMode  = false;
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.darkMode ? "dark" : "light");
  document.getElementById("btn-dark-toggle").textContent = state.darkMode ? "☀️" : "🌙";
}

// ─── Undo ─────────────────────────────────────────────────────────────────────
function pushUndo(action, data) {
  undoStack.push({ action, data });
  if (undoStack.length > 20) undoStack.shift();
}

function showUndoToast(msg) {
  document.getElementById("undo-msg").textContent = msg;
  const t = document.getElementById("undo-toast");
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), 5000);
}

function performUndo() {
  if (!undoStack.length) return;
  const { action, data } = undoStack.pop();
  if (action === "add-visit") {
    const visits = state.visits[data.breweryId] || [];
    state.visits[data.breweryId] = visits.filter(v => v.id !== data.visitId);
    if (!state.visits[data.breweryId].length) delete state.visits[data.breweryId];
  } else if (action === "wishlist-add") {
    delete state.wishlist[data.breweryId];
  } else if (action === "wishlist-remove") {
    state.wishlist[data.breweryId] = true;
  } else if (action === "mark-closed") {
    delete state.closed[data.breweryId];
  }
  save(); render();
  document.getElementById("undo-toast").classList.add("hidden");
  if (!document.getElementById("drawer-overlay").classList.contains("hidden")) {
    openDetailDrawer(data.breweryId);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function starsHtml(n) {
  if (!n) return "";
  return `<span class="stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
}

function getVisits(id) { return state.visits[id] || []; }

function getLatestVisit(id) {
  const vs = getVisits(id);
  if (!vs.length) return null;
  return [...vs].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
}

function getAvgRating(id) {
  const rated = getVisits(id).filter(v => v.rating);
  if (!rated.length) return null;
  return rated.reduce((s, v) => s + v.rating, 0) / rated.length;
}

function isClosed(b) { return b.nowClosed || !!state.closed[b.id]; }
function isVisited(b) { return getVisits(b.id).length > 0; }
function isWishlisted(b) { return !!state.wishlist[b.id]; }

// ─── Photo resize ─────────────────────────────────────────────────────────────
function resizePhoto(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        const ratio = Math.min(max / img.width, max / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Recent Strip ─────────────────────────────────────────────────────────────
function renderRecentStrip() {
  const strip = document.getElementById("recent-strip");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);

  const recent = [];
  for (const [breweryId, visits] of Object.entries(state.visits)) {
    for (const v of visits) {
      if (v.date && new Date(v.date) >= cutoff) {
        const b = state.breweries.find(x => x.id == breweryId);
        if (b) recent.push({ b, v });
      }
    }
  }
  recent.sort((a, b) => b.v.date.localeCompare(a.v.date));

  if (!recent.length) { strip.classList.add("hidden"); return; }
  strip.classList.remove("hidden");
  strip.innerHTML = `<span class="recent-label">🕒 Recent:</span>` +
    recent.slice(0, 6).map(({ b, v }) => `
      <div class="recent-chip" data-id="${b.id}">
        <strong>${b.name}</strong>
        <span>${formatDate(v.date)}</span>
        ${v.rating ? starsHtml(v.rating) : ""}
      </div>
    `).join("");
  strip.querySelectorAll(".recent-chip").forEach(el =>
    el.addEventListener("click", () => openDetailDrawer(parseInt(el.dataset.id)))
  );
}

// ─── Area Filter Bar ──────────────────────────────────────────────────────────
function buildAreaFilterBar() {
  const bar = document.getElementById("area-filter-group");
  bar.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = "region-btn" + (activeAreaGroup === "all" ? " active" : "");
  allBtn.textContent = "All Areas";
  allBtn.dataset.group = "all";
  bar.appendChild(allBtn);

  for (const group of Object.keys(AREA_GROUPS)) {
    const btn = document.createElement("button");
    btn.className = "region-btn" + (activeAreaGroup === group ? " active" : "");
    btn.textContent = group;
    btn.dataset.group = group;
    btn.style.setProperty("--group-color", AREA_GROUP_COLORS[group] || "#555");
    bar.appendChild(btn);
  }

  bar.querySelectorAll(".region-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      bar.querySelectorAll(".region-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeAreaGroup = btn.dataset.group;
      render();
    });
  });
}

// ─── Type colour accent ───────────────────────────────────────────────────────
const TYPE_COLORS = {
  "Craft / Microbrewery": "#3b82f6",
  "Brewpub":              "#8b5cf6",
  "Regional":             "#f59e0b",
  "Taproom Only":         "#14b8a6",
};
function typeColor(type) { return TYPE_COLORS[type] || "#6b7280"; }

// ─── Style Filter ─────────────────────────────────────────────────────────────
function buildStyleFilter() {
  const sel = document.getElementById("style-filter-select");
  const allStyles = new Set();
  state.breweries.forEach(b => b.styles?.forEach(s => allStyles.add(s)));
  const sorted = [...allStyles].sort();
  sel.innerHTML = `<option value="">All Styles</option>` +
    sorted.map(s => `<option value="${s}"${activeStyleFilter === s ? " selected" : ""}>${s}</option>`).join("");
}

// ─── Visit Streak ─────────────────────────────────────────────────────────────
function calcStreak() {
  const visitDates = [...new Set(
    Object.values(state.visits).flat()
      .filter(v => v.date)
      .map(v => v.date.slice(0, 7)) // YYYY-MM
  )].sort().reverse();

  if (!visitDates.length) return 0;
  let streak = 1;
  for (let i = 1; i < visitDates.length; i++) {
    const [y1, m1] = visitDates[i-1].split("-").map(Number);
    const [y2, m2] = visitDates[i].split("-").map(Number);
    const diff = (y1 * 12 + m1) - (y2 * 12 + m2);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ─── Main Render ──────────────────────────────────────────────────────────────
function render() {
  const query = searchQuery.toLowerCase();
  const grid  = document.getElementById("main-grid");
  grid.innerHTML = "";

  const active     = state.breweries.filter(b => !isClosed(b));
  const visited    = state.breweries.filter(b => isVisited(b) && !isClosed(b));
  const wishlisted = Object.keys(state.wishlist).length;

  document.getElementById("stat-visited").textContent   = `${visited.length} Visited`;
  document.getElementById("stat-wishlist").textContent  = `${wishlisted} Wishlist`;
  document.getElementById("stat-remaining").textContent = `${active.length - visited.length} Remaining`;

  const pct = active.length ? Math.round((visited.length / active.length) * 100) : 0;
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-pct").textContent = pct + "%";

  renderRecentStrip();

  // Apply view mode class
  grid.className = viewMode === "list" ? "main-list" : "";

  // Filter — hide closed by default unless explicitly requested
  let filtered = state.breweries.filter(b => {
    const closed_     = isClosed(b);
    const visited_    = isVisited(b);
    const wishlisted_ = isWishlisted(b);

    if (activeFilter !== "closed" && closed_) return false;
    if (activeFilter === "visited"   && !visited_)    return false;
    if (activeFilter === "unvisited" && visited_)     return false;
    if (activeFilter === "wishlist"  && !wishlisted_) return false;
    if (activeFilter === "closed"    && !closed_)     return false;

    if (activeAreaGroup !== "all") {
      const groupAreas = AREA_GROUPS[activeAreaGroup] || [];
      if (!groupAreas.includes(b.area)) return false;
    }

    if (activeStyleFilter && !b.styles?.some(s => s === activeStyleFilter)) return false;

    if (query && !b.name.toLowerCase().includes(query) && !b.area.toLowerCase().includes(query)) return false;
    return true;
  });

  // Sort
  if (sortOrder === "alpha") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === "visited-first") {
    filtered.sort((a, b) => (isVisited(b) ? 1 : 0) - (isVisited(a) ? 1 : 0));
  } else if (sortOrder === "rating") {
    filtered.sort((a, b) => (getAvgRating(b.id) || 0) - (getAvgRating(a.id) || 0));
  } else {
    const groupOrder = Object.keys(AREA_GROUPS);
    filtered.sort((a, b) => {
      const ga = groupOrder.indexOf(getAreaGroup(a.area));
      const gb = groupOrder.indexOf(getAreaGroup(b.area));
      if (ga !== gb) return ga - gb;
      return a.area.localeCompare(b.area) || a.name.localeCompare(b.name);
    });
  }

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🍺</div>
      <div>No breweries match your filters.</div>
      ${activeFilter !== "all" ? `<button class="empty-reset" onclick="resetFilters()">Clear filters</button>` : ""}
    </div>`;
    return;
  }

  if (viewMode === "list") {
    renderListView(grid, filtered);
  } else {
    renderGridView(grid, filtered);
  }
}

function resetFilters() {
  activeFilter = "all";
  activeAreaGroup = "all";
  searchQuery = "";
  document.getElementById("search").value = "";
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.filter === "all"));
  buildAreaFilterBar();
  render();
}

function renderGridView(grid, filtered) {
  const byArea = {};
  filtered.forEach(b => { if (!byArea[b.area]) byArea[b.area] = []; byArea[b.area].push(b); });

  for (const [area, breweries] of Object.entries(byArea)) {
    const group = getAreaGroup(area);
    const color = AREA_GROUP_COLORS[group] || "#555";
    const visitedInArea = breweries.filter(b => isVisited(b)).length;
    const pct = breweries.length ? Math.round((visitedInArea / breweries.length) * 100) : 0;

    const section = document.createElement("div");
    section.className = "area-section";
    section.innerHTML = `
      <div class="area-header" style="border-color:${color};color:${color}">
        <h2>${area}</h2>
        <div class="area-count" style="background:${color}">${visitedInArea}/${breweries.length}</div>
        <div class="area-progress-wrap"><div class="area-progress-bar" style="width:${pct}%;background:${color}"></div></div>
        <span class="area-pct">${pct}%</span>
        <span class="area-group-tag">${group}</span>
      </div>
      <div class="breweries-grid"></div>
    `;
    grid.appendChild(section);

    const bGrid = section.querySelector(".breweries-grid");
    breweries.forEach(b => buildCard(b, bGrid));
  }
}

function renderListView(grid, filtered) {
  const table = document.createElement("div");
  table.className = "list-view";
  filtered.forEach(b => {
    const closed_    = isClosed(b);
    const visited_   = isVisited(b);
    const wishlisted_ = isWishlisted(b);
    const latest     = getLatestVisit(b.id);
    const avgRating  = getAvgRating(b.id);
    const visitCount = getVisits(b.id).length;
    const tc         = typeColor(b.type);

    const row = document.createElement("div");
    row.className = `list-row ${visited_ ? "visited" : ""} ${closed_ ? "closed-card" : ""} ${wishlisted_ ? "wishlisted" : ""}`;
    row.innerHTML = `
      <div class="list-type-bar" style="background:${tc}"></div>
      <div class="list-main">
        <div class="list-name">${b.name}${closed_ ? ' <span class="card-closed-tag">Closed</span>' : ""}</div>
        <div class="list-sub">${b.area} · <span style="color:${tc}">${b.type}</span></div>
      </div>
      <div class="list-styles">${b.styles?.slice(0,3).join(", ") || ""}</div>
      <div class="list-status">
        ${visited_ ? `<span class="list-visited-badge">✓ ${visitCount > 1 ? visitCount + "×" : "Visited"}</span>${avgRating ? " " + starsHtml(Math.round(avgRating)) : ""}` : wishlisted_ ? `<span class="list-wishlist-badge">⭐ Wishlist</span>` : ""}
      </div>
      <div class="list-date">${latest?.date ? formatDate(latest.date) : ""}</div>
    `;
    row.addEventListener("click", () => openDetailDrawer(b.id));
    table.appendChild(row);
  });
  grid.appendChild(table);
}

function buildCard(b, container) {
  const closed_    = isClosed(b);
  const visited_   = isVisited(b);
  const wishlisted_ = isWishlisted(b);
  const latest     = getLatestVisit(b.id);
  const avgRating  = getAvgRating(b.id);
  const visitCount = getVisits(b.id).length;
  const tc         = typeColor(b.type);

  const card = document.createElement("div");
  card.className = ["brewery-card",
    visited_ && closed_ ? "visited closed-card" :
    visited_ ? "visited" : closed_ ? "closed-card" : wishlisted_ ? "wishlisted" : ""
  ].join(" ").trim();
  card.dataset.id = b.id;

  let badge = "";
  if (visited_ && closed_) badge = `<div class="dual-badge"><span class="badge-v">✓</span><span class="badge-c">✕</span></div>`;
  else if (visited_)    badge = `<div class="card-badge badge-visited">✓${visitCount > 1 ? `<sup>${visitCount}</sup>` : ""}</div>`;
  else if (closed_)     badge = `<div class="card-badge badge-closed">✕</div>`;
  else if (wishlisted_) badge = `<div class="card-badge badge-wishlist">⭐</div>`;

  card.innerHTML = `
    <div class="card-type-bar" style="background:${tc}"></div>
    ${badge}
    <div class="card-type" style="color:${tc}">${b.type}</div>
    <div class="card-name">${b.name}</div>
    ${b.styles?.length ? `<div class="card-styles">${b.styles.slice(0,3).join(" · ")}</div>` : ""}
    ${visited_ && latest?.date ? `<div class="card-meta">📅 ${formatDate(latest.date)}</div>` : ""}
    ${visited_ && avgRating ? `<div class="card-meta">${starsHtml(Math.round(avgRating))} ${avgRating.toFixed(1)}</div>` : ""}
    ${visited_ && latest?.notes ? `<div class="card-notes">${latest.notes}</div>` : ""}
  `;
  card.addEventListener("click", () => openDetailDrawer(b.id));
  container.appendChild(card);
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function openDetailDrawer(breweryId) {
  const b = state.breweries.find(x => x.id === breweryId);
  if (!b) return;

  const closed_    = isClosed(b);
  const visited_   = isVisited(b);
  const wishlisted_ = isWishlisted(b);
  const visits     = getVisits(breweryId);
  const avgRating  = getAvgRating(breweryId);
  const group      = getAreaGroup(b.area);
  const color      = AREA_GROUP_COLORS[group] || "#555";

  document.getElementById("drawer-content").innerHTML = `
    <div class="drawer-hero" style="border-color:${color}">
      <div class="drawer-type">${b.type}</div>
      <h2>${b.name}</h2>
      <div class="drawer-meta">
        📍 ${b.area}${b.address ? ` · <span style="font-size:.82rem">${b.address}</span>` : ""}
        ${b.website ? ` · <a href="${b.website}" target="_blank" rel="noopener">Website ↗</a>` : ""}
      </div>
      ${b.styles?.length ? `<div class="drawer-styles">${b.styles.map(s => `<span class="style-chip">${s}</span>`).join("")}</div>` : ""}
      ${avgRating ? `<div class="drawer-avg-rating">${starsHtml(Math.round(avgRating))} avg ${avgRating.toFixed(1)}</div>` : ""}
      ${closed_ ? `<div class="drawer-closed-banner">🚫 Now Closed${state.closed[breweryId]?.date ? " · " + formatDate(state.closed[breweryId].date) : ""}</div>` : ""}
    </div>

    <div class="drawer-actions">
      <button class="drawer-btn primary" onclick="openVisitModal(${breweryId})">
        ${visited_ ? "+ Add Another Visit" : "✓ Log a Visit"}
      </button>
      <button class="drawer-btn ${wishlisted_ ? "active-wishlist" : ""}" onclick="toggleWishlist(${breweryId})">
        ${wishlisted_ ? "⭐ Remove from Wishlist" : "⭐ Add to Wishlist"}
      </button>
      ${!closed_ ? `<button class="drawer-btn danger" onclick="openClosedModal(${breweryId})">🚫 Mark as Closed</button>` : `<button class="drawer-btn" onclick="reopenBrewery(${breweryId})">↩ Reopen</button>`}
    </div>

    ${visits.length ? `
      <div class="visit-history">
        <div class="vh-header">
          <h3>Visits</h3>
          <span class="visit-count-badge">${visits.length}</span>
        </div>
        <div class="vh-list">
          ${[...visits].sort((a,b) => (b.date||"").localeCompare(a.date||"")).map((v, i) => `
            <div class="vh-entry">
              <div class="vh-dot"></div>
              <div class="vh-card">
                <div class="vh-card-top">
                  <span class="vh-date">${v.date ? formatDate(v.date) : "No date"}</span>
                  ${v.rating ? `<span class="vh-stars">${starsHtml(v.rating)}</span>` : ""}
                  <button class="vh-del-btn" onclick="deleteVisit(${breweryId},'${v.id}')" aria-label="Delete visit">🗑</button>
                </div>
                ${v.beer ? `<div class="vh-beer">🍺 ${v.beer}</div>` : ""}
                ${v.notes ? `<div class="vh-notes">${v.notes}</div>` : ""}
                ${v.photo ? `<img src="${v.photo}" class="vh-photo" onclick="this.classList.toggle('expanded')" alt="Visit photo" />` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ""}
  `;

  document.getElementById("drawer-overlay").classList.remove("hidden");
}

function closeDetailDrawer() {
  document.getElementById("drawer-overlay").classList.add("hidden");
}

function toggleWishlist(breweryId) {
  if (state.wishlist[breweryId]) {
    delete state.wishlist[breweryId];
    pushUndo("wishlist-remove", { breweryId });
    showUndoToast("Removed from wishlist");
  } else {
    state.wishlist[breweryId] = true;
    pushUndo("wishlist-add", { breweryId });
    showUndoToast("Added to wishlist");
  }
  save(); render();
  openDetailDrawer(breweryId);
}

function reopenBrewery(breweryId) {
  const b = state.breweries.find(x => x.id === breweryId);
  if (b) { b.nowClosed = false; delete state.closed[breweryId]; }
  save(); render(); openDetailDrawer(breweryId);
}

function deleteVisit(breweryId, visitId) {
  if (!confirm("Delete this visit?")) return;
  state.visits[breweryId] = (state.visits[breweryId] || []).filter(v => String(v.id) !== String(visitId));
  if (!state.visits[breweryId].length) delete state.visits[breweryId];
  save(); render(); openDetailDrawer(breweryId);
}

// ─── Visit Modal ──────────────────────────────────────────────────────────────
const RATING_LABELS = ["", "Poor", "OK", "Good", "Great", "Excellent"];

function openVisitModal(id) {
  pendingId     = id;
  pendingRating = 0;
  pendingPhoto  = null;
  const b = state.breweries.find(x => x.id === id);
  document.getElementById("visit-modal-brewery").textContent = b.name;
  document.getElementById("visit-date-input").value  = new Date().toISOString().slice(0, 10);
  document.getElementById("visit-beer-input").value  = "";
  document.getElementById("visit-notes-input").value = "";
  document.getElementById("visit-photo-input").value = "";
  document.getElementById("vm-photo-preview-img").classList.add("hidden");
  document.getElementById("vm-photo-placeholder").classList.remove("hidden");
  document.getElementById("vm-photo-remove").classList.add("hidden");
  document.getElementById("vm-rating-hint").textContent = "";
  updateStars(0);
  document.getElementById("visit-modal-overlay").classList.remove("hidden");
  // Focus first input after animation
  setTimeout(() => document.getElementById("visit-beer-input").focus(), 120);
}

function updateStars(val) {
  document.querySelectorAll(".vm-star").forEach(s => {
    const v = parseInt(s.dataset.val);
    s.classList.toggle("active", v <= val);
    s.classList.toggle("hover", false);
  });
  document.getElementById("vm-rating-hint").textContent = val ? RATING_LABELS[val] : "";
}

document.querySelectorAll(".vm-star").forEach(star => {
  star.addEventListener("mouseenter", () => {
    const hoverVal = parseInt(star.dataset.val);
    document.querySelectorAll(".vm-star").forEach(s => {
      s.classList.toggle("hover", parseInt(s.dataset.val) <= hoverVal);
    });
    document.getElementById("vm-rating-hint").textContent = RATING_LABELS[hoverVal];
  });
  star.addEventListener("mouseleave", () => {
    document.querySelectorAll(".vm-star").forEach(s => s.classList.remove("hover"));
    document.getElementById("vm-rating-hint").textContent = pendingRating ? RATING_LABELS[pendingRating] : "";
  });
  star.addEventListener("click", () => {
    // clicking same star again clears rating
    const val = parseInt(star.dataset.val);
    pendingRating = pendingRating === val ? 0 : val;
    updateStars(pendingRating);
  });
});

// Photo zone — click or drag
document.getElementById("vm-photo-zone").addEventListener("click", () => {
  document.getElementById("visit-photo-input").click();
});
document.getElementById("vm-photo-zone").addEventListener("dragover", e => {
  e.preventDefault();
  document.getElementById("vm-photo-zone").classList.add("drag-over");
});
document.getElementById("vm-photo-zone").addEventListener("dragleave", () => {
  document.getElementById("vm-photo-zone").classList.remove("drag-over");
});
document.getElementById("vm-photo-zone").addEventListener("drop", async e => {
  e.preventDefault();
  document.getElementById("vm-photo-zone").classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) await setVisitPhoto(file);
});

document.getElementById("visit-photo-input").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (file) await setVisitPhoto(file);
});

document.getElementById("vm-photo-remove").addEventListener("click", e => {
  e.stopPropagation();
  pendingPhoto = null;
  document.getElementById("vm-photo-preview-img").classList.add("hidden");
  document.getElementById("vm-photo-placeholder").classList.remove("hidden");
  document.getElementById("vm-photo-remove").classList.add("hidden");
  document.getElementById("visit-photo-input").value = "";
});

async function setVisitPhoto(file) {
  pendingPhoto = await resizePhoto(file);
  const img = document.getElementById("vm-photo-preview-img");
  img.src = pendingPhoto;
  img.classList.remove("hidden");
  document.getElementById("vm-photo-placeholder").classList.add("hidden");
  document.getElementById("vm-photo-remove").classList.remove("hidden");
}

document.getElementById("btn-confirm-visit").addEventListener("click", () => {
  if (pendingId === null) return;
  const visitId = Date.now() + Math.random();
  const visit = {
    id:     visitId,
    date:   document.getElementById("visit-date-input").value,
    beer:   document.getElementById("visit-beer-input").value.trim(),
    notes:  document.getElementById("visit-notes-input").value.trim(),
    rating: pendingRating || null,
    photo:  pendingPhoto  || null,
  };
  if (!state.visits[pendingId]) state.visits[pendingId] = [];
  state.visits[pendingId].push(visit);
  pushUndo("add-visit", { breweryId: pendingId, visitId });
  showUndoToast("Visit logged");
  save(); render();
  document.getElementById("visit-modal-overlay").classList.add("hidden");
  openDetailDrawer(pendingId);
  pendingId = null; pendingPhoto = null;
});

document.getElementById("btn-cancel-visit").addEventListener("click", () => {
  document.getElementById("visit-modal-overlay").classList.add("hidden");
  pendingId = null; pendingPhoto = null;
});

// ─── Closed Modal ─────────────────────────────────────────────────────────────
function openClosedModal(id) {
  pendingId = id;
  const b = state.breweries.find(x => x.id === id);
  document.getElementById("closed-modal-title").textContent = `Mark as closed · ${b.name}`;
  document.getElementById("closed-date-input").value  = "";
  document.getElementById("closed-notes-input").value = "";
  document.getElementById("closed-modal-overlay").classList.remove("hidden");
}

document.getElementById("btn-confirm-closed").addEventListener("click", () => {
  if (pendingId === null) return;
  state.closed[pendingId] = {
    date:  document.getElementById("closed-date-input").value,
    notes: document.getElementById("closed-notes-input").value.trim(),
  };
  pushUndo("mark-closed", { breweryId: pendingId });
  showUndoToast("Marked as closed");
  save(); render();
  document.getElementById("closed-modal-overlay").classList.add("hidden");
  openDetailDrawer(pendingId);
  pendingId = null;
});

document.getElementById("btn-cancel-closed").addEventListener("click", () => {
  document.getElementById("closed-modal-overlay").classList.add("hidden");
  pendingId = null;
});

// ─── Stats Page ───────────────────────────────────────────────────────────────
function renderStats() {
  const el = document.getElementById("stats-content");
  const total       = state.breweries.length;
  const active      = state.breweries.filter(b => !isClosed(b));
  const visited     = active.filter(b => isVisited(b));
  const totalVisits = Object.values(state.visits).flat().length;
  const wishlisted  = Object.keys(state.wishlist).length;
  const closed      = state.breweries.filter(b => isClosed(b)).length;
  const thisYear    = new Date().getFullYear().toString();
  const thisYearCount = Object.values(state.visits).flat().filter(v => v?.date?.startsWith(thisYear)).length;
  const allRated    = Object.values(state.visits).flat().filter(v => v.rating);
  const avgRating   = allRated.length ? (allRated.reduce((s,v) => s+v.rating,0)/allRated.length).toFixed(1) : null;

  // Most visited area
  const areaVisitCounts = {};
  Object.entries(state.visits).forEach(([id, visits]) => {
    const b = state.breweries.find(x => x.id == id);
    if (b) areaVisitCounts[b.area] = (areaVisitCounts[b.area] || 0) + visits.length;
  });
  const topArea = Object.entries(areaVisitCounts).sort((a,b) => b[1]-a[1])[0];

  // Monthly visits
  const monthly = {};
  Object.values(state.visits).flat().forEach(v => {
    if (v.date) { const m = v.date.slice(0,7); monthly[m] = (monthly[m]||0)+1; }
  });
  const months = Object.keys(monthly).sort().slice(-12);
  const maxM = Math.max(...Object.values(monthly), 1);

  // Top rated
  const topRated = state.breweries
    .filter(b => getAvgRating(b.id))
    .sort((a,b) => getAvgRating(b.id) - getAvgRating(a.id))
    .slice(0,10);

  // Most visited (fallback when no ratings)
  const mostVisited = state.breweries
    .filter(b => getVisits(b.id).length > 0)
    .sort((a,b) => getVisits(b.id).length - getVisits(a.id).length)
    .slice(0,10);

  // Area group progress
  const groupStats = Object.entries(AREA_GROUPS).map(([group, areas]) => {
    const bs = state.breweries.filter(b => areas.includes(b.area) && !isClosed(b));
    const v  = bs.filter(b => isVisited(b)).length;
    const pct = bs.length ? Math.round(v/bs.length*100) : 0;
    return { group, total: bs.length, visited: v, pct, color: AREA_GROUP_COLORS[group] };
  });

  // Full visit log
  const allVisits = [];
  Object.entries(state.visits).forEach(([id, visits]) => {
    const b = state.breweries.find(x => x.id == id);
    if (b) visits.forEach(v => allVisits.push({ b, v }));
  });
  allVisits.sort((a,b) => (b.v.date||"").localeCompare(a.v.date||""));

  const streak = calcStreak();

  el.innerHTML = `
    ${topArea ? `
    <div class="stats-hero">
      <div class="hero-label">Favourite Area</div>
      <div class="hero-value">${topArea[0]}</div>
      <div class="hero-sub">${topArea[1]} visit${topArea[1]>1?"s":""} · ${getAreaGroup(topArea[0])}</div>
    </div>` : ""}

    <div class="stats-grid">
      <div class="stat-card" style="--accent:#27ae60">
        <div class="stat-val">${visited.length}</div><div class="stat-lbl">Breweries Visited</div>
      </div>
      <div class="stat-card" style="--accent:#3b82f6">
        <div class="stat-val">${totalVisits}</div><div class="stat-lbl">Total Visits</div>
      </div>
      <div class="stat-card" style="--accent:#6b7280">
        <div class="stat-val">${active.length - visited.length}</div><div class="stat-lbl">Still to Visit</div>
      </div>
      <div class="stat-card" style="--accent:#f59e0b">
        <div class="stat-val">${wishlisted}</div><div class="stat-lbl">On Wishlist</div>
      </div>
      <div class="stat-card" style="--accent:#8b5cf6">
        <div class="stat-val">${thisYearCount}</div><div class="stat-lbl">Visits in ${thisYear}</div>
      </div>
      <div class="stat-card" style="--accent:#f59e0b">
        <div class="stat-val">${avgRating ?? "—"}</div><div class="stat-lbl">Avg Rating</div>
      </div>
      <div class="stat-card" style="--accent:#e74c3c">
        <div class="stat-val">${closed}</div><div class="stat-lbl">Now Closed</div>
      </div>
      <div class="stat-card" style="--accent:#14b8a6">
        <div class="stat-val">${streak}</div><div class="stat-lbl">Month Streak 🔥</div>
      </div>
    </div>

    <div class="stats-card">
      <h3>Visit Activity</h3>
      ${months.length ? `
      <div class="bar-chart">
        ${months.map(m => {
          const count = monthly[m];
          const h = Math.round((count/maxM)*100);
          const [yr,mo] = m.split("-");
          const label = new Date(yr,mo-1).toLocaleDateString("en-GB",{month:"short"});
          return `<div class="bar-col">
            <div class="bar-val">${count}</div>
            <div class="bar-fill" style="height:${h}%"></div>
            <div class="bar-lbl">${label}</div>
          </div>`;
        }).join("")}
      </div>` : `<div class="stats-empty">Log some visits to see your activity chart 🍺</div>`}
    </div>

    <div class="stats-card">
      <h3>Progress by Area</h3>
      ${groupStats.map(({group,total,visited,pct,color}) => `
        <div class="rb-row">
          <span class="rb-label">${group}</span>
          <div class="rb-track">
            <div class="rb-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="rb-pct" style="color:${color}">${pct}%</span>
          <span class="rb-frac">${visited}/${total}</span>
        </div>
      `).join("")}
    </div>

    ${topRated.length ? `
    <div class="stats-card">
      <h3>Top Rated</h3>
      ${topRated.map((b,i) => `
        <div class="top-row" onclick="openDetailDrawer(${b.id})">
          <span class="top-rank">${["🥇","🥈","🥉"][i] || i+1}</span>
          <span class="top-name">${b.name}</span>
          ${starsHtml(Math.round(getAvgRating(b.id)))}
          <span class="top-area">${b.area}</span>
        </div>
      `).join("")}
    </div>` : mostVisited.length ? `
    <div class="stats-card">
      <h3>Most Visited</h3>
      ${mostVisited.map((b,i) => `
        <div class="top-row" onclick="openDetailDrawer(${b.id})">
          <span class="top-rank">${i+1}</span>
          <span class="top-name">${b.name}</span>
          <span class="top-area">${getVisits(b.id).length}× · ${b.area}</span>
        </div>
      `).join("")}
    </div>` : ""}

    ${allVisits.length ? `
    <div class="stats-card">
      <h3>Visit Log <span class="visit-count-badge">${allVisits.length}</span></h3>
      <div class="visit-log">
        ${allVisits.map(({b,v}) => `
          <div class="log-row" onclick="openDetailDrawer(${b.id})">
            <div class="log-date">${v.date ? formatDate(v.date) : "—"}</div>
            <div class="log-name">${b.name}${v.beer ? `<div class="log-beer">🍺 ${v.beer}</div>` : ""}</div>
            <div class="log-area">${b.area}</div>
            <div class="log-rating">${v.rating ? starsHtml(v.rating) : ""}</div>
          </div>
        `).join("")}
      </div>
    </div>` : ""}
  `;
}

// ─── Filters / Search / Sort / View Toggle ───────────────────────────────────
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById("search").addEventListener("input", e => {
  searchQuery = e.target.value;
  render();
});

document.getElementById("sort-select").addEventListener("change", e => {
  sortOrder = e.target.value;
  render();
});

document.getElementById("style-filter-select").addEventListener("change", e => {
  activeStyleFilter = e.target.value;
  render();
});

document.getElementById("btn-view-toggle").addEventListener("click", () => {
  viewMode = viewMode === "grid" ? "list" : "grid";
  document.getElementById("btn-view-toggle").textContent = viewMode === "grid" ? "☰ List" : "⊞ Grid";
  render();
});

// ─── Keyboard Navigation ─────────────────────────────────────────────────────
let focusedCardIndex = -1;

document.addEventListener("keydown", e => {
  if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
    e.preventDefault();
    document.getElementById("search").focus();
    return;
  }
  if (e.key === "Escape") {
    closeDetailDrawer();
    document.getElementById("modal-overlay").classList.add("hidden");
    document.getElementById("visit-modal-overlay").classList.add("hidden");
    document.getElementById("closed-modal-overlay").classList.add("hidden");
    document.getElementById("crawl-modal-overlay").classList.add("hidden");
    return;
  }
  // Arrow key navigation through cards
  if (["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"].includes(e.key) &&
      e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" &&
      document.getElementById("drawer-overlay").classList.contains("hidden")) {
    e.preventDefault();
    const cards = [...document.querySelectorAll(".brewery-card")];
    if (!cards.length) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") focusedCardIndex = Math.min(focusedCardIndex + 1, cards.length - 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   focusedCardIndex = Math.max(focusedCardIndex - 1, 0);
    if (focusedCardIndex < 0) focusedCardIndex = 0;
    cards.forEach((c, i) => c.classList.toggle("keyboard-focus", i === focusedCardIndex));
    cards[focusedCardIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  if (e.key === "Enter" && focusedCardIndex >= 0 &&
      e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
    const cards = [...document.querySelectorAll(".brewery-card")];
    if (cards[focusedCardIndex]) openDetailDrawer(parseInt(cards[focusedCardIndex].dataset.id));
  }
});

// Reset keyboard focus on render
const _origRender = render;

// ─── Near Me (Geolocation) ───────────────────────────────────────────────────
document.getElementById("btn-near-me").addEventListener("click", () => {
  if (!navigator.geolocation) { alert("Geolocation not supported by your browser."); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    if (!leafletMap) renderMap();
    leafletMap.setView([lat, lng], 14);

    // Add user location marker
    L.circleMarker([lat, lng], {
      radius: 10, fillColor: "#3b82f6", color: "#fff",
      weight: 3, opacity: 1, fillOpacity: 0.9
    }).addTo(leafletMap).bindPopup("📍 You are here").openPopup();

    // Show nearest 5 breweries
    const withCoords = state.breweries.filter(b => b.lat && b.lng && !isClosed(b));
    const nearest = withCoords
      .map(b => ({ b, dist: Math.hypot(b.lat - lat, b.lng - lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);

    const names = nearest.map(({b}) => b.name).join(", ");
    showUndoToast(`Nearest: ${names.slice(0, 60)}…`);
  }, () => alert("Could not get your location."));
});

// ─── Crawl Planner ───────────────────────────────────────────────────────────
document.getElementById("btn-crawl-planner").addEventListener("click", () => {
  renderCrawlList();
  document.getElementById("crawl-modal-overlay").classList.remove("hidden");
});

document.getElementById("crawl-modal-close").addEventListener("click", () => {
  document.getElementById("crawl-modal-overlay").classList.add("hidden");
});

document.getElementById("crawl-modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("crawl-modal-overlay"))
    document.getElementById("crawl-modal-overlay").classList.add("hidden");
});

document.getElementById("btn-crawl-clear").addEventListener("click", () => {
  crawlList = [];
  renderCrawlList();
});

document.getElementById("btn-crawl-route").addEventListener("click", () => {
  if (crawlList.length < 2) { alert("Add at least 2 breweries to plan a route."); return; }
  const breweries = crawlList.map(id => state.breweries.find(b => b.id === id)).filter(Boolean);
  const waypoints = breweries.map(b => b.address || b.name + (b.area ? ", " + b.area : ", England")).map(encodeURIComponent);
  const origin = waypoints[0];
  const dest   = waypoints[waypoints.length - 1];
  const stops  = waypoints.slice(1, -1).join("|");
  const url = `https://www.google.com/maps/dir/${origin}/${stops ? stops + "/" : ""}${dest}`;
  window.open(url, "_blank");
});

function renderCrawlList() {
  const list = document.getElementById("crawl-list");
  const breweries = state.breweries.filter(b => b.lat && b.lng && !isClosed(b))
    .sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = `<div class="crawl-search-wrap"><input type="text" id="crawl-search" placeholder="Search breweries…" /></div>` +
    `<div class="crawl-brewery-list">` +
    breweries.map(b => {
      const inCrawl = crawlList.includes(b.id);
      return `<div class="crawl-item ${inCrawl ? "in-crawl" : ""}" data-id="${b.id}">
        <span class="crawl-check">${inCrawl ? "✓" : "+"}</span>
        <span class="crawl-name">${b.name}</span>
        <span class="crawl-area">${b.area}</span>
      </div>`;
    }).join("") + `</div>`;

  list.querySelectorAll(".crawl-item").forEach(item => {
    item.addEventListener("click", () => {
      const id = parseInt(item.dataset.id);
      if (crawlList.includes(id)) {
        crawlList = crawlList.filter(x => x !== id);
      } else {
        crawlList.push(id);
      }
      renderCrawlList();
      updateCrawlOrder();
    });
  });

  // Search within crawl list
  const crawlSearch = document.getElementById("crawl-search");
  if (crawlSearch) {
    crawlSearch.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      list.querySelectorAll(".crawl-item").forEach(item => {
        const name = item.querySelector(".crawl-name").textContent.toLowerCase();
        item.style.display = name.includes(q) ? "" : "none";
      });
    });
  }

  updateCrawlOrder();
}

function updateCrawlOrder() {
  const sel = document.getElementById("crawl-selected");
  const order = document.getElementById("crawl-count");
  const orderList = document.getElementById("crawl-order");

  if (crawlList.length === 0) {
    sel.classList.add("hidden");
    return;
  }
  sel.classList.remove("hidden");
  order.textContent = crawlList.length;
  orderList.innerHTML = crawlList.map((id, i) => {
    const b = state.breweries.find(x => x.id === id);
    return b ? `<div class="crawl-order-item">
      <span class="crawl-order-num">${i + 1}</span>
      <span>${b.name}</span>
      <span class="crawl-area">${b.area}</span>
    </div>` : "";
  }).join("");
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
document.getElementById("drawer-close").addEventListener("click", closeDetailDrawer);
document.getElementById("drawer-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("drawer-overlay")) closeDetailDrawer();
});

// ─── Page Tabs ────────────────────────────────────────────────────────────────
document.querySelectorAll(".page-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    document.getElementById("page-tracker").classList.toggle("hidden", page !== "tracker");
    document.getElementById("page-map").classList.toggle("hidden", page !== "map");
    document.getElementById("page-stats").classList.toggle("hidden", page !== "stats");
    if (page === "stats") renderStats();
    if (page === "map") renderMap();
  });
});

// ─── Dark Mode ────────────────────────────────────────────────────────────────
document.getElementById("btn-dark-toggle").addEventListener("click", () => {
  state.darkMode = !state.darkMode;
  applyTheme();
  save();
});

// ─── Undo ─────────────────────────────────────────────────────────────────────
document.getElementById("btn-undo").addEventListener("click", performUndo);

// ─── Manage Modal ─────────────────────────────────────────────────────────────
document.getElementById("btn-manage").addEventListener("click", () => {
  document.getElementById("modal-overlay").classList.remove("hidden");
  renderEditList();
});
document.getElementById("modal-close").addEventListener("click", () =>
  document.getElementById("modal-overlay").classList.add("hidden")
);
document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-overlay"))
    document.getElementById("modal-overlay").classList.add("hidden");
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(t => t.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
  });
});

document.getElementById("btn-add-brewery").addEventListener("click", () => {
  const name    = document.getElementById("new-name").value.trim();
  const area    = document.getElementById("new-area").value.trim();
  const website = document.getElementById("new-website").value.trim();
  const type    = document.getElementById("new-type").value;
  const styles  = document.getElementById("new-styles").value.split(",").map(s=>s.trim()).filter(Boolean);
  const closed  = document.getElementById("new-closed").checked;
  if (!name || !area) { alert("Name and area are required."); return; }
  const maxId = state.breweries.reduce((m,b) => Math.max(m,b.id), 0);
  state.breweries.push({ id: maxId+1, name, area, type, styles, website: website||undefined, nowClosed: closed });
  save(); render();
  ["new-name","new-area","new-website","new-styles"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("new-closed").checked = false;
  renderEditList();
});

function renderEditList() {
  const q = document.getElementById("edit-search").value.toLowerCase();
  const list = document.getElementById("edit-list");
  const filtered = state.breweries.filter(b => !q || b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q));
  if (!filtered.length) { list.innerHTML = '<div class="no-results">No breweries found.</div>'; return; }
  list.innerHTML = filtered.map(b => `
    <div class="edit-item">
      <div class="edit-name">${b.name} <span class="edit-area">${b.area}</span></div>
      <button class="del-btn" data-id="${b.id}">Remove</button>
    </div>
  `).join("");
  list.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const b = state.breweries.find(x => x.id === parseInt(btn.dataset.id));
      if (confirm(`Remove ${b.name}?`)) {
        state.breweries = state.breweries.filter(x => x.id !== b.id);
        delete state.visits[b.id]; delete state.closed[b.id]; delete state.wishlist[b.id];
        save(); render(); renderEditList();
      }
    });
  });
}

document.getElementById("edit-search").addEventListener("input", renderEditList);

document.getElementById("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `england-brewery-tracker-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
});

document.getElementById("file-import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.breweries) throw new Error();
      state = data;
      save(); render();
      document.getElementById("modal-overlay").classList.add("hidden");
    } catch { alert("Invalid JSON file."); }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ─── Map ──────────────────────────────────────────────────────────────────────
let leafletMap = null;
let mapMarkers = [];
let activeMapFilter = "all";

function renderMap() {
  if (!leafletMap) {
    leafletMap = L.map("brewery-map").setView([52.5, -1.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(leafletMap);
  }

  mapMarkers.forEach(m => m.remove());
  mapMarkers = [];

  const breweries = state.breweries.filter(b => b.lat && b.lng);

  breweries.forEach(b => {
    const closed_     = isClosed(b);
    const visited_    = isVisited(b);
    const wishlisted_ = isWishlisted(b);

    if (activeMapFilter === "visited"   && !visited_)             return;
    if (activeMapFilter === "unvisited" && (visited_ || closed_)) return;
    if (activeMapFilter === "wishlist"  && !wishlisted_)          return;
    if (activeMapFilter === "closed"    && !closed_)              return;

    let color = "#3b82f6";
    if (closed_)      color = "#e74c3c";
    else if (visited_)    color = "#27ae60";
    else if (wishlisted_) color = "#f59e0b";

    // Bigger, more tappable pins with initial
    const initial = b.name.charAt(0).toUpperCase();
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width:28px;height:28px;border-radius:50%;
        background:${color};border:3px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,.35);
        cursor:pointer;display:flex;align-items:center;
        justify-content:center;color:#fff;
        font-size:11px;font-weight:700;font-family:system-ui;
      ">${initial}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const avgRating  = getAvgRating(b.id);
    const visitCount = getVisits(b.id).length;
    const latest     = getLatestVisit(b.id);
    const group      = getAreaGroup(b.area);
    const groupColor = AREA_GROUP_COLORS[group] || "#555";

    const statusHtml = visited_
      ? `<div class="mp-status" style="color:#27ae60">✓ Visited ${visitCount > 1 ? `(${visitCount}×)` : ""}${avgRating ? " · " + starsHtml(Math.round(avgRating)) : ""}</div>`
      : closed_
      ? `<div class="mp-status" style="color:#e74c3c">🚫 Now Closed</div>`
      : wishlisted_
      ? `<div class="mp-status" style="color:#f59e0b">⭐ On Wishlist</div>`
      : `<div class="mp-status" style="color:#6b7280">Not yet visited</div>`;

    const popup = L.popup({ maxWidth: 240 }).setContent(`
      <div class="map-popup">
        <div class="mp-group" style="background:${groupColor}">${group}</div>
        <h4>${b.name}</h4>
        <div class="mp-area">📍 ${b.area}${b.address ? `<br><span style="font-size:.72rem">${b.address}</span>` : ""}</div>
        ${b.styles?.length ? `<div class="mp-styles">${b.styles.slice(0,3).join(" · ")}</div>` : ""}
        ${statusHtml}
        ${latest?.notes ? `<div class="mp-notes">"${latest.notes}"</div>` : ""}
        <button class="mp-btn" onclick="openDetailDrawer(${b.id}); document.querySelector('.leaflet-popup-close-button')?.click()">
          ${visited_ ? "View visits" : "Log a visit"}
        </button>
      </div>
    `);

    const marker = L.marker([b.lat, b.lng], { icon }).addTo(leafletMap).bindPopup(popup);
    mapMarkers.push(marker);
  });

  if (mapMarkers.length > 0) {
    const group = L.featureGroup(mapMarkers);
    leafletMap.fitBounds(group.getBounds().pad(0.1));
  }
}

document.querySelectorAll(".map-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".map-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeMapFilter = btn.dataset.mfilter;
    if (leafletMap) renderMap();
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
load();
buildAreaFilterBar();
buildStyleFilter();
render();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
