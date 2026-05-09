// ═══════════════════════════════════════════
// KnowYourTeam — Club Data
// Top 5 English Leagues (2024/25 season)
// ═══════════════════════════════════════════

const TEAMS = [
  // ─── PREMIER LEAGUE ───────────────────────────────────────────────────────
  {
    id: 'arsenal',
    name: 'Arsenal',
    badge: '🔴',
    nickname: 'The Gunners',
    founded: 1886,
    ground: 'Emirates Stadium',
    capacity: '60,704',
    avgAttendance: '60,383',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Mikel Arteta',
    colours: 'Red & White',
    owner: 'Kroenke Sports & Entertainment',
    keyPlayers: [
      { name: 'Bukayo Saka', position: 'Right Winger', number: 7 },
      { name: 'Martin Ødegaard', position: 'Attacking Midfield', number: 8 },
      { name: 'Declan Rice', position: 'Central Midfield', number: 41 },
      { name: 'William Saliba', position: 'Centre-Back', number: 2 },
      { name: 'Kai Havertz', position: 'Forward', number: 29 }
    ],
    legends: [
      { name: 'Thierry Henry', detail: 'All-time top scorer — 228 goals' },
      { name: 'Tony Adams', detail: 'Captain, 669 appearances' },
      { name: 'Dennis Bergkamp', detail: 'Iconic forward, 120 goals' },
      { name: 'Patrick Vieira', detail: 'Midfield general, Invincibles captain' },
      { name: 'Ian Wright', detail: '185 goals, club legend' }
    ],
    honours: [
      '13× League Champions', '14× FA Cup', '2× League Cup', '1× European Cup Winners\' Cup'
    ],
    history: 'Founded in 1886 as Dial Square by workers at the Royal Arsenal in Woolwich, the club became one of English football\'s most successful sides. They moved to Highbury in 1913 and to the Emirates Stadium in 2006. The 2003/04 "Invincibles" season — going unbeaten in the league — remains one of football\'s greatest achievements.'
  },
  {
    id: 'aston-villa',
    name: 'Aston Villa',
    badge: '🟣',
    nickname: 'The Villans',
    founded: 1874,
    ground: 'Villa Park',
    capacity: '42,657',
    avgAttendance: '41,802',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Unai Emery',
    colours: 'Claret & Blue',
    owner: 'Nassef Sawiris & Wes Edens',
    keyPlayers: [
      { name: 'Ollie Watkins', position: 'Striker', number: 11 },
      { name: 'Morgan Rogers', position: 'Attacking Midfield', number: 27 },
      { name: 'Emi Martínez', position: 'Goalkeeper', number: 1 },
      { name: 'John McGinn', position: 'Central Midfield', number: 7 },
      { name: 'Pau Torres', position: 'Centre-Back', number: 4 }
    ],
    legends: [
      { name: 'Paul McGrath', detail: 'Defensive icon, PFA Player of the Year 1993' },
      { name: 'Peter Withe', detail: 'European Cup final winner 1982' },
      { name: 'Brian Little', detail: '300+ appearances, later managed the club' },
      { name: 'Dwight Yorke', detail: '97 goals, fan favourite' },
      { name: 'Jack Grealish', detail: 'Academy product, modern icon' }
    ],
    honours: [
      '7× League Champions', '7× FA Cup', '5× League Cup', '1× European Cup'
    ],
    history: 'One of England\'s oldest and most decorated clubs, Aston Villa were founding members of the Football League in 1888. They won the European Cup in 1982 and have spent the majority of their history in the top flight. Under Unai Emery, they returned to the Champions League in 2024.'
  },
  {
    id: 'man-city',
    name: 'Manchester City',
    badge: '🩵',
    nickname: 'The Citizens',
    founded: 1880,
    ground: 'Etihad Stadium',
    capacity: '53,400',
    avgAttendance: '53,023',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Pep Guardiola',
    colours: 'Sky Blue & White',
    owner: 'City Football Group (Sheikh Mansour)',
    keyPlayers: [
      { name: 'Erling Haaland', position: 'Striker', number: 9 },
      { name: 'Kevin De Bruyne', position: 'Attacking Midfield', number: 17 },
      { name: 'Phil Foden', position: 'Midfielder/Winger', number: 47 },
      { name: 'Rodri', position: 'Defensive Midfield', number: 16 },
      { name: 'Bernardo Silva', position: 'Midfielder', number: 20 }
    ],
    legends: [
      { name: 'Sergio Agüero', detail: '260 goals, THAT 93:20 moment' },
      { name: 'Colin Bell', detail: '"The King", 152 goals in 492 apps' },
      { name: 'David Silva', detail: '10 years of midfield magic' },
      { name: 'Vincent Kompany', detail: 'Captain, 4× PL winner' },
      { name: 'Mike Summerbee', detail: '1960s legend, 68 goals' }
    ],
    honours: [
      '10× League Champions', '7× FA Cup', '8× League Cup', '1× Champions League', '1× UEFA Cup Winners\' Cup'
    ],
    history: 'Founded as St. Mark\'s (West Gorton) in 1880, Manchester City have experienced dramatic highs and lows. The 2008 takeover by Sheikh Mansour transformed the club into a global powerhouse. Under Pep Guardiola they won an unprecedented treble in 2022/23 and four consecutive league titles.'
  },
  {
    id: 'man-utd',
    name: 'Manchester United',
    badge: '🔴',
    nickname: 'The Red Devils',
    founded: 1878,
    ground: 'Old Trafford',
    capacity: '74,310',
    avgAttendance: '73,704',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Rúben Amorim',
    colours: 'Red, White & Black',
    owner: 'INEOS / Glazer Family',
    keyPlayers: [
      { name: 'Bruno Fernandes', position: 'Attacking Midfield', number: 8 },
      { name: 'Rasmus Højlund', position: 'Striker', number: 9 },
      { name: 'Kobbie Mainoo', position: 'Central Midfield', number: 37 },
      { name: 'Alejandro Garnacho', position: 'Left Winger', number: 17 },
      { name: 'André Onana', position: 'Goalkeeper', number: 24 }
    ],
    legends: [
      { name: 'Sir Bobby Charlton', detail: '249 goals, Munich survivor, World Cup winner' },
      { name: 'George Best', detail: 'Ballon d\'Or 1968, genius winger' },
      { name: 'Ryan Giggs', detail: '963 appearances, most decorated PL player' },
      { name: 'Eric Cantona', detail: 'The King — transformed the club in the 90s' },
      { name: 'Wayne Rooney', detail: 'All-time top scorer — 253 goals' }
    ],
    honours: [
      '20× League Champions', '12× FA Cup', '6× League Cup', '3× Champions League', '1× Europa League', '1× Cup Winners\' Cup'
    ],
    history: 'Formed as Newton Heath LYR in 1878, the club became Manchester United in 1902. The Munich air disaster of 1958 devastated the team but they rebuilt to win the European Cup in 1968. Sir Alex Ferguson\'s 26-year reign (1986–2013) brought unprecedented success including 13 Premier League titles and two Champions League trophies.'
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    badge: '🔴',
    nickname: 'The Reds',
    founded: 1892,
    ground: 'Anfield',
    capacity: '61,276',
    avgAttendance: '60,725',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Arne Slot',
    colours: 'Red',
    owner: 'Fenway Sports Group',
    keyPlayers: [
      { name: 'Mohamed Salah', position: 'Right Winger', number: 11 },
      { name: 'Virgil van Dijk', position: 'Centre-Back', number: 4 },
      { name: 'Alisson', position: 'Goalkeeper', number: 1 },
      { name: 'Trent Alexander-Arnold', position: 'Right-Back', number: 66 },
      { name: 'Ryan Gravenberch', position: 'Midfield', number: 38 }
    ],
    legends: [
      { name: 'Kenny Dalglish', detail: 'Player-manager, 172 goals, "King Kenny"' },
      { name: 'Steven Gerrard', detail: 'Captain fantastic, Istanbul hero' },
      { name: 'Ian Rush', detail: 'All-time top scorer — 346 goals' },
      { name: 'Bill Shankly', detail: 'Legendary manager, built the dynasty' },
      { name: 'Robbie Fowler', detail: '"God", 183 goals' }
    ],
    honours: [
      '19× League Champions', '8× FA Cup', '10× League Cup', '6× Champions League', '3× UEFA Cup'
    ],
    history: 'Founded in 1892 after Everton left Anfield, Liverpool became England\'s most successful club in European competition. The Shankly and Paisley eras dominated the 1970s and 80s. After the Hillsborough disaster in 1989, the club rebuilt and under Jürgen Klopp won the Champions League (2019) and ended a 30-year league title drought (2020).'
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    badge: '🔵',
    nickname: 'The Blues',
    founded: 1905,
    ground: 'Stamford Bridge',
    capacity: '40,343',
    avgAttendance: '39,468',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Enzo Maresca',
    colours: 'Royal Blue & White',
    owner: 'BlueCo (Todd Boehly / Clearlake Capital)',
    keyPlayers: [
      { name: 'Cole Palmer', position: 'Attacking Midfield', number: 20 },
      { name: 'Nicolas Jackson', position: 'Striker', number: 15 },
      { name: 'Moisés Caicedo', position: 'Midfield', number: 25 },
      { name: 'Enzo Fernández', position: 'Midfield', number: 8 },
      { name: 'Robert Sánchez', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Frank Lampard', detail: 'All-time top scorer — 211 goals' },
      { name: 'John Terry', detail: 'Captain, Leader, Legend — 717 apps' },
      { name: 'Didier Drogba', detail: '164 goals, big-game player' },
      { name: 'Gianfranco Zola', detail: 'Magical forward, fans\' favourite' },
      { name: 'Peter Osgood', detail: '"The King of Stamford Bridge"' }
    ],
    honours: [
      '6× League Champions', '8× FA Cup', '5× League Cup', '2× Champions League', '2× Europa League'
    ],
    history: 'Founded in 1905, Chelsea spent much of their early history as a yo-yo club before stabilising in the top flight. Roman Abramovich\'s 2003 takeover brought immediate success under José Mourinho. The club won the Champions League in 2012 and 2021 before new ownership under Todd Boehly took over in 2022.'
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    badge: '⚪',
    nickname: 'Spurs',
    founded: 1882,
    ground: 'Tottenham Hotspur Stadium',
    capacity: '62,850',
    avgAttendance: '61,482',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Ange Postecoglou',
    colours: 'White & Navy Blue',
    owner: 'ENIC Group (Joe Lewis / Daniel Levy)',
    keyPlayers: [
      { name: 'Son Heung-min', position: 'Forward', number: 7 },
      { name: 'James Maddison', position: 'Attacking Midfield', number: 10 },
      { name: 'Cristian Romero', position: 'Centre-Back', number: 17 },
      { name: 'Dominic Solanke', position: 'Striker', number: 19 },
      { name: 'Micky van de Ven', position: 'Centre-Back', number: 37 }
    ],
    legends: [
      { name: 'Jimmy Greaves', detail: 'All-time top scorer — 266 goals' },
      { name: 'Danny Blanchflower', detail: 'Captain of the 1961 Double winners' },
      { name: 'Glenn Hoddle', detail: 'Midfield maestro, 110 goals' },
      { name: 'Harry Kane', detail: '280 goals, modern icon' },
      { name: 'Bill Nicholson', detail: 'Legendary manager, first Double of 20th century' }
    ],
    honours: [
      '2× League Champions', '8× FA Cup', '4× League Cup', '2× UEFA Cup'
    ],
    history: 'Founded in 1882 by schoolboys from Hotspur Cricket Club, Spurs became the first club in the 20th century to achieve the League and FA Cup Double in 1961. They were also the first British club to win a European trophy (Cup Winners\' Cup, 1963). The club moved to their new 62,850-seat stadium in 2019.'
  },
  {
    id: 'newcastle',
    name: 'Newcastle United',
    badge: '⚫',
    nickname: 'The Magpies',
    founded: 1892,
    ground: 'St James\' Park',
    capacity: '52,305',
    avgAttendance: '52,258',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Eddie Howe',
    colours: 'Black & White',
    owner: 'PIF (Saudi Arabia)',
    keyPlayers: [
      { name: 'Alexander Isak', position: 'Striker', number: 14 },
      { name: 'Bruno Guimarães', position: 'Central Midfield', number: 39 },
      { name: 'Anthony Gordon', position: 'Left Winger', number: 10 },
      { name: 'Sandro Tonali', position: 'Midfield', number: 8 },
      { name: 'Nick Pope', position: 'Goalkeeper', number: 22 }
    ],
    legends: [
      { name: 'Alan Shearer', detail: 'All-time top scorer — 206 goals' },
      { name: 'Jackie Milburn', detail: '"Wor Jackie", 200 goals' },
      { name: 'Bobby Robson', detail: 'Beloved manager 1999–2004' },
      { name: 'Peter Beardsley', detail: 'Skilful forward, 119 goals' },
      { name: 'Kevin Keegan', detail: 'Player & manager, "I\'d love it"' }
    ],
    honours: [
      '4× League Champions', '6× FA Cup', '1× Inter-Cities Fairs Cup'
    ],
    history: 'Formed from a merger of Newcastle East End and Newcastle West End in 1892, the club dominated the early 1900s with three league titles. St James\' Park, perched in the city centre, is one of English football\'s most iconic grounds. The 2021 Saudi-backed takeover has ushered in a new era of ambition.'
  },
  {
    id: 'west-ham',
    name: 'West Ham United',
    badge: '🟤',
    nickname: 'The Hammers',
    founded: 1895,
    ground: 'London Stadium',
    capacity: '62,500',
    avgAttendance: '62,467',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Julen Lopetegui',
    colours: 'Claret & Blue',
    owner: 'David Sullivan & David Gold estate',
    keyPlayers: [
      { name: 'Jarrod Bowen', position: 'Right Winger', number: 20 },
      { name: 'Mohammed Kudus', position: 'Attacking Midfield', number: 14 },
      { name: 'Lucas Paquetá', position: 'Midfield', number: 11 },
      { name: 'Edson Álvarez', position: 'Defensive Midfield', number: 19 },
      { name: 'Alphonse Areola', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Bobby Moore', detail: 'World Cup winning captain 1966' },
      { name: 'Geoff Hurst', detail: 'Hat-trick in 1966 World Cup final' },
      { name: 'Martin Peters', detail: '1966 hero, "10 years ahead of his time"' },
      { name: 'Billy Bonds', detail: '799 appearances, club record' },
      { name: 'Paolo Di Canio', detail: 'Iconic scissor kick, fans\' favourite' }
    ],
    honours: [
      '3× FA Cup', '1× Europa Conference League', '1× Cup Winners\' Cup'
    ],
    history: 'Founded as Thames Ironworks in 1895, West Ham are known as "The Academy of Football" for producing world-class talent. Three West Ham players — Moore, Hurst, and Peters — were central to England\'s 1966 World Cup triumph. The club moved from the Boleyn Ground to the London Stadium in 2016.'
  },
  {
    id: 'brighton',
    name: 'Brighton & Hove Albion',
    badge: '🔵',
    nickname: 'The Seagulls',
    founded: 1901,
    ground: 'Amex Stadium',
    capacity: '31,800',
    avgAttendance: '31,477',
    league: 'Premier League',
    leagueShort: 'PL',
    manager: 'Fabian Hürzeler',
    colours: 'Blue & White',
    owner: 'Tony Bloom',
    keyPlayers: [
      { name: 'Kaoru Mitoma', position: 'Left Winger', number: 22 },
      { name: 'Danny Welbeck', position: 'Striker', number: 18 },
      { name: 'Carlos Baleba', position: 'Midfield', number: 45 },
      { name: 'Lewis Dunk', position: 'Centre-Back', number: 5 },
      { name: 'João Pedro', position: 'Forward', number: 9 }
    ],
    legends: [
      { name: 'Peter Ward', detail: '36 goals in 1976/77, cult hero' },
      { name: 'Bobby Zamora', detail: 'Promotion hero, 83 goals' },
      { name: 'Kerry Mayo', detail: '349 appearances, one-club man' },
      { name: 'Glenn Murray', detail: '111 goals across two spells' },
      { name: 'Lewis Dunk', detail: 'Captain, 400+ appearances' }
    ],
    honours: [
      '1× Championship (2024/25 pending)', '4× Third Division/League One title'
    ],
    history: 'Brighton nearly went out of existence in the 1990s, playing at Gillingham\'s ground before Tony Bloom\'s investment transformed the club. They built the Amex Stadium in 2011 and reached the Premier League in 2017. Their data-driven approach has made them one of the most admired clubs in modern football.'
  },

  // ─── CHAMPIONSHIP ───────────────────────────────────────────────────────
  {
    id: 'leeds',
    name: 'Leeds United',
    badge: '⚪',
    nickname: 'The Whites',
    founded: 1919,
    ground: 'Elland Road',
    capacity: '37,890',
    avgAttendance: '36,500',
    league: 'Championship',
    leagueShort: 'CH',
    manager: 'Daniel Farke',
    colours: 'White',
    owner: '49ers Enterprises',
    keyPlayers: [
      { name: 'Ethan Ampadu', position: 'Centre-Back/Midfield', number: 14 },
      { name: 'Crysencio Summerville', position: 'Winger', number: 10 },
      { name: 'Willy Gnonto', position: 'Forward', number: 29 },
      { name: 'Illan Meslier', position: 'Goalkeeper', number: 1 },
      { name: 'Joe Rodon', position: 'Centre-Back', number: 5 }
    ],
    legends: [
      { name: 'Billy Bremner', detail: 'Midfield dynamo, 1960s–70s icon' },
      { name: 'Jack Charlton', detail: '629 appearances, World Cup winner 1966' },
      { name: 'John Charles', detail: '"The Gentle Giant", 157 goals' },
      { name: 'Eddie Gray', detail: '577 appearances, skilful winger' },
      { name: 'Don Revie', detail: 'Legendary manager, built the great Leeds side' }
    ],
    honours: [
      '3× League Champions', '1× FA Cup', '1× League Cup', '2× Inter-Cities Fairs Cup'
    ],
    history: 'Founded in 1919 after the disbanding of Leeds City, the club rose to prominence under Don Revie in the 1960s and 70s. They won the last First Division title in 1992 and reached the Champions League semi-finals in 2001 before financial collapse. Relegated from the Premier League in 2023, they aim to return.'
  },
  {
    id: 'burnley',
    name: 'Burnley',
    badge: '🟤',
    nickname: 'The Clarets',
    founded: 1882,
    ground: 'Turf Moor',
    capacity: '21,944',
    avgAttendance: '20,823',
    league: 'Championship',
    leagueShort: 'CH',
    manager: 'Scott Parker',
    colours: 'Claret & Blue',
    owner: 'ALK Capital',
    keyPlayers: [
      { name: 'Luca Koleosho', position: 'Winger', number: 38 },
      { name: 'Zeki Amdouni', position: 'Forward', number: 25 },
      { name: 'Josh Brownhill', position: 'Midfield', number: 8 },
      { name: 'Dara O\'Shea', position: 'Centre-Back', number: 5 },
      { name: 'James Trafford', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Jimmy McIlroy', detail: 'Midfield genius, 1959/60 title winner' },
      { name: 'Bob Lord', detail: 'Chairman who built the club' },
      { name: 'Leighton James', detail: 'Welsh wizard, 1970s star' },
      { name: 'Sean Dyche', detail: 'Manager who kept them in the PL for 6 years' },
      { name: 'Jimmy Adamson', detail: 'Player & manager, Footballer of the Year 1962' }
    ],
    honours: [
      '2× League Champions', '1× FA Cup', '1× Charity Shield'
    ],
    history: 'One of the original Football League members in 1888, Burnley won the league title in 1920/21 and 1959/60. Turf Moor has been their home since 1883 — one of the longest continuous ground occupancies in world football. They were relegated from the Premier League in 2024 after one season back.'
  },
  {
    id: 'sunderland',
    name: 'Sunderland',
    badge: '🔴',
    nickname: 'The Black Cats',
    founded: 1879,
    ground: 'Stadium of Light',
    capacity: '49,000',
    avgAttendance: '40,322',
    league: 'Championship',
    leagueShort: 'CH',
    manager: 'Régis Le Bris',
    colours: 'Red & White',
    owner: 'Kyril Louis-Dreyfus',
    keyPlayers: [
      { name: 'Jack Clarke', position: 'Winger', number: 7 },
      { name: 'Jobe Bellingham', position: 'Midfield', number: 8 },
      { name: 'Romaine Mundle', position: 'Winger', number: 11 },
      { name: 'Dan Ballard', position: 'Centre-Back', number: 5 },
      { name: 'Anthony Patterson', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Charlie Buchan', detail: '224 goals, early 1900s star' },
      { name: 'Len Shackleton', detail: '"Clown Prince of Football"' },
      { name: 'Bobby Kerr', detail: '1973 FA Cup winning captain' },
      { name: 'Niall Quinn', detail: '61 goals, later chairman' },
      { name: 'Kevin Phillips', detail: 'European Golden Shoe 1999/2000' }
    ],
    honours: [
      '6× League Champions', '2× FA Cup'
    ],
    history: 'Founded in 1879 as Sunderland and District Teachers AFC, the club were dominant in the 1890s and early 1900s, earning the nickname "Team of All the Talents". They moved to the Stadium of Light in 1997. After back-to-back relegations took them to League One, they have rebuilt and are pushing for a Premier League return.'
  },
  {
    id: 'sheff-wed',
    name: 'Sheffield Wednesday',
    badge: '🔵',
    nickname: 'The Owls',
    founded: 1867,
    ground: 'Hillsborough',
    capacity: '39,732',
    avgAttendance: '29,500',
    league: 'Championship',
    leagueShort: 'CH',
    manager: 'Danny Röhl',
    colours: 'Blue & White',
    owner: 'Dejphon Chansiri',
    keyPlayers: [
      { name: 'Josh Windass', position: 'Forward', number: 11 },
      { name: 'Barry Bannan', position: 'Midfield', number: 10 },
      { name: 'Liam Palmer', position: 'Defender', number: 2 },
      { name: 'Michael Smith', position: 'Striker', number: 9 },
      { name: 'Di\'Shon Bernard', position: 'Centre-Back', number: 5 }
    ],
    legends: [
      { name: 'Derek Dooley', detail: '62 goals in 61 games, tragic injury' },
      { name: 'Ron Springett', detail: 'England goalkeeper, 384 apps' },
      { name: 'Chris Waddle', detail: 'Winger, 1990s hero' },
      { name: 'John Sheridan', detail: 'Midfield maestro, 1991 League Cup winner' },
      { name: 'Carlton Palmer', detail: 'Iconic midfielder, 200+ apps' }
    ],
    honours: [
      '4× League Champions', '3× FA Cup', '1× League Cup'
    ],
    history: 'One of the world\'s oldest football clubs, founded in 1867 by the Wednesday Cricket Club. They were a major force in the early 20th century and again in the early 1990s under Trevor Francis and Ron Atkinson. Hillsborough is one of England\'s great traditional grounds. They returned to the Championship in 2023 via the playoffs.'
  },
  {
    id: 'middlesbrough',
    name: 'Middlesbrough',
    badge: '🔴',
    nickname: 'Boro',
    founded: 1876,
    ground: 'Riverside Stadium',
    capacity: '34,742',
    avgAttendance: '28,500',
    league: 'Championship',
    leagueShort: 'CH',
    manager: 'Michael Carrick',
    colours: 'Red & White',
    owner: 'Steve Gibson',
    keyPlayers: [
      { name: 'Emmanuel Latte Lath', position: 'Striker', number: 18 },
      { name: 'Hayden Hackney', position: 'Midfield', number: 23 },
      { name: 'Riley McGree', position: 'Midfield', number: 8 },
      { name: 'Rav van den Berg', position: 'Centre-Back', number: 4 },
      { name: 'Seny Dieng', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'George Hardwick', detail: 'England captain, 1940s legend' },
      { name: 'Wilf Mannion', detail: '"Golden Boy", 110 goals' },
      { name: 'Brian Clough', detail: '204 goals in 222 games' },
      { name: 'Juninho', detail: 'Brazilian magician, three spells' },
      { name: 'Steve Gibson', detail: 'Owner who saved the club from liquidation' }
    ],
    honours: [
      '1× League Cup', '1× Anglo-Scottish Cup'
    ],
    history: 'Founded in 1876, Middlesbrough moved to the Riverside Stadium in 1995 after 92 years at Ayresome Park. They reached the UEFA Cup final in 2006 under Steve McClaren and won the League Cup in 2004. Under Michael Carrick, they are building a young, exciting squad aiming for promotion.'
  },

  // ─── LEAGUE ONE ─────────────────────────────────────────────────────────
  {
    id: 'birmingham',
    name: 'Birmingham City',
    badge: '🔵',
    nickname: 'Blues',
    founded: 1875,
    ground: 'St Andrew\'s @ Knighthead Park',
    capacity: '29,409',
    avgAttendance: '27,000',
    league: 'League One',
    leagueShort: 'L1',
    manager: 'Chris Davies',
    colours: 'Royal Blue & White',
    owner: 'Knighthead Capital Management',
    keyPlayers: [
      { name: 'Jay Stansfield', position: 'Striker', number: 9 },
      { name: 'Alfie May', position: 'Striker', number: 29 },
      { name: 'Paik Seung-ho', position: 'Midfield', number: 37 },
      { name: 'Christoph Klarer', position: 'Centre-Back', number: 4 },
      { name: 'Ryan Allsop', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Trevor Francis', detail: 'First £1m player, 133 goals' },
      { name: 'Gil Merrick', detail: '551 appearances, England keeper' },
      { name: 'Bob Latchford', detail: '84 goals, 1970s star' },
      { name: 'Christophe Dugarry', detail: 'World Cup winner, great escape hero' },
      { name: 'Jude Bellingham', detail: 'Academy product, sold for £25m aged 17' }
    ],
    honours: [
      '2× League Cup', '1× Football League Trophy'
    ],
    history: 'Founded as Small Heath Alliance in 1875, Birmingham City are one of England\'s oldest clubs. They won the League Cup in 1963 and 2011 (beating Arsenal in the final). Relegated to League One in 2024 for the first time in 30 years, they have invested heavily to bounce straight back under American ownership.'
  },
  {
    id: 'huddersfield',
    name: 'Huddersfield Town',
    badge: '🔵',
    nickname: 'The Terriers',
    founded: 1908,
    ground: 'John Smith\'s Stadium',
    capacity: '24,500',
    avgAttendance: '17,200',
    league: 'League One',
    leagueShort: 'L1',
    manager: 'Michael Duff',
    colours: 'Blue & White',
    owner: 'Kevin Nagle',
    keyPlayers: [
      { name: 'Danny Ward', position: 'Striker', number: 9 },
      { name: 'Ben Wiles', position: 'Midfield', number: 8 },
      { name: 'Herbie Kane', position: 'Midfield', number: 14 },
      { name: 'Brodie Spencer', position: 'Defender', number: 2 },
      { name: 'Lee Nicholls', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Herbert Chapman', detail: 'Manager of 3 consecutive titles 1924–26' },
      { name: 'Denis Law', detail: 'Started career here before Man Utd' },
      { name: 'Jimmy Glazzard', detail: '154 goals, all-time top scorer' },
      { name: 'Andy Booth', detail: '150 goals across two spells' },
      { name: 'Marcus Stewart', detail: '1990s goal machine' }
    ],
    honours: [
      '3× League Champions (consecutive 1924–26)', '1× FA Cup'
    ],
    history: 'Huddersfield Town made history by winning three consecutive league titles from 1924 to 1926 under Herbert Chapman — a feat only matched by Arsenal, Liverpool, and Manchester United since. They had a fairytale Premier League season in 2017/18 under David Wagner. Currently rebuilding in League One.'
  },
  {
    id: 'bolton',
    name: 'Bolton Wanderers',
    badge: '⚪',
    nickname: 'The Trotters',
    founded: 1874,
    ground: 'Toughsheet Community Stadium',
    capacity: '28,723',
    avgAttendance: '18,500',
    league: 'League One',
    leagueShort: 'L1',
    manager: 'Ian Evatt',
    colours: 'White & Navy Blue',
    owner: 'Football Ventures',
    keyPlayers: [
      { name: 'Dion Charles', position: 'Striker', number: 9 },
      { name: 'Aaron Morley', position: 'Midfield', number: 7 },
      { name: 'Josh Sheehan', position: 'Midfield', number: 6 },
      { name: 'Ricardo Santos', position: 'Centre-Back', number: 5 },
      { name: 'James Trafford', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Nat Lofthouse', detail: '"The Lion of Vienna", 285 goals' },
      { name: 'Jay-Jay Okocha', detail: '"So good they named him twice"' },
      { name: 'Sam Allardyce', detail: 'Manager who took them to Europe' },
      { name: 'Kevin Davies', detail: '84 goals, fans\' favourite' },
      { name: 'John McGinlay', detail: '1990s goal hero, 87 goals' }
    ],
    honours: [
      '4× FA Cup', '1× Football League Trophy'
    ],
    history: 'One of the original 12 Football League clubs in 1888, Bolton have a rich history including four FA Cup wins. They played in the Premier League from 2001–2012 under Sam Allardyce, qualifying for Europe. Financial troubles led to administration in 2019 and relegation to League Two, but they have since rebuilt.'
  },
  {
    id: 'charlton',
    name: 'Charlton Athletic',
    badge: '🔴',
    nickname: 'The Addicks',
    founded: 1905,
    ground: 'The Valley',
    capacity: '27,111',
    avgAttendance: '16,800',
    league: 'League One',
    leagueShort: 'L1',
    manager: 'Nathan Jones',
    colours: 'Red & White',
    owner: 'Global Football Partners',
    keyPlayers: [
      { name: 'Alfie May', position: 'Striker', number: 9 },
      { name: 'Conor McGrandles', position: 'Midfield', number: 8 },
      { name: 'Greg Sherwood', position: 'Winger', number: 11 },
      { name: 'Lloyd Jones', position: 'Centre-Back', number: 5 },
      { name: 'Harry Isted', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Sam Bartram', detail: 'Goalkeeper, 623 appearances (1934–56)' },
      { name: 'Derek Hales', detail: 'All-time top scorer — 168 goals' },
      { name: 'Alan Curbishley', detail: 'Manager 1991–2006, took them to PL' },
      { name: 'Clive Mendonca', detail: '1998 playoff final hat-trick hero' },
      { name: 'Mark Kinsella', detail: 'Captain, PL midfield dynamo' }
    ],
    honours: [
      '1× FA Cup', '1× First Division (old)'
    ],
    history: 'Founded in 1905 in south-east London, Charlton won the FA Cup in 1947. They were forced to leave The Valley in 1985 due to safety concerns and shared grounds before a fan-led campaign brought them home in 1992. They spent seven seasons in the Premier League (1998–99, 2000–07) under Alan Curbishley.'
  },
  {
    id: 'reading',
    name: 'Reading',
    badge: '🔵',
    nickname: 'The Royals',
    founded: 1871,
    ground: 'Select Car Leasing Stadium',
    capacity: '24,161',
    avgAttendance: '14,500',
    league: 'League One',
    leagueShort: 'L1',
    manager: 'Noel Hunt',
    colours: 'Blue & White',
    owner: 'Rob Couhig',
    keyPlayers: [
      { name: 'Sam Smith', position: 'Striker', number: 9 },
      { name: 'Harvey Knibbs', position: 'Forward', number: 10 },
      { name: 'Lewis Wing', position: 'Midfield', number: 8 },
      { name: 'Tyler Bindon', position: 'Centre-Back', number: 5 },
      { name: 'Joel Pereira', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Steve Coppell', detail: 'Manager, 106-point Championship season' },
      { name: 'Robin Friday', detail: 'Cult hero, maverick genius' },
      { name: 'Kevin Doyle', detail: '55 goals, PL striker' },
      { name: 'Alf Messer', detail: '471 appearances, club record' },
      { name: 'Shane Long', detail: '43 goals, fan favourite' }
    ],
    honours: [
      '1× Championship (record 106 points, 2005/06)'
    ],
    history: 'Founded in 1871, Reading are one of England\'s oldest clubs. Their 2005/06 Championship season — 106 points, 31 wins, 99 goals — remains a record. They spent six seasons in the Premier League across two spells. Financial mismanagement led to points deductions and relegation to League One in 2024.'
  },

  // ─── LEAGUE TWO ─────────────────────────────────────────────────────────
  {
    id: 'wrexham',
    name: 'Wrexham',
    badge: '🔴',
    nickname: 'The Red Dragons',
    founded: 1864,
    ground: 'STōK Cae Ras',
    capacity: '12,600',
    avgAttendance: '12,400',
    league: 'League Two',
    leagueShort: 'L2',
    manager: 'Phil Parkinson',
    colours: 'Red',
    owner: 'Ryan Reynolds & Rob McElhenney',
    keyPlayers: [
      { name: 'Paul Mullin', position: 'Striker', number: 10 },
      { name: 'Elliot Lee', position: 'Forward', number: 7 },
      { name: 'Luke Bolton', position: 'Right-Back', number: 2 },
      { name: 'Max Cleworth', position: 'Centre-Back', number: 5 },
      { name: 'Arthur Okonkwo', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Mickey Thomas', detail: 'FA Cup giant-killer, Welsh international' },
      { name: 'Arfon Griffiths', detail: '592 appearances, all-time record' },
      { name: 'Joey Jones', detail: 'European Cup winner with Liverpool, Wrexham hero' },
      { name: 'Gary Bennett', detail: '162 goals, 1990s legend' },
      { name: 'Karl Connolly', detail: '1990s/2000s winger, fans\' favourite' }
    ],
    honours: [
      '3× Welsh Cup', '1× FAW Premier Cup', 'National League Champions 2022/23'
    ],
    history: 'Founded in 1864, Wrexham are the oldest club in Wales and the third oldest professional club in the world. Famous for FA Cup giant-killings (beating Arsenal in 1992), the club was bought by Hollywood actors Ryan Reynolds and Rob McElhenney in 2020, sparking back-to-back promotions from the National League to League Two and then League One.'
  },
  {
    id: 'notts-county',
    name: 'Notts County',
    badge: '⚫',
    nickname: 'The Magpies',
    founded: 1862,
    ground: 'Meadow Lane',
    capacity: '20,211',
    avgAttendance: '11,200',
    league: 'League Two',
    leagueShort: 'L2',
    manager: 'Stuart Maynard',
    colours: 'Black & White',
    owner: 'Christoffer & Alexander Reedtz',
    keyPlayers: [
      { name: 'Macaulay Langstaff', position: 'Striker', number: 9 },
      { name: 'Jodi Jones', position: 'Winger', number: 11 },
      { name: 'Daniel Crowley', position: 'Midfield', number: 10 },
      { name: 'Aden Baldwin', position: 'Centre-Back', number: 5 },
      { name: 'Alex Bass', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Tommy Lawton', detail: 'England legend who dropped down to play for County' },
      { name: 'Don Masson', detail: 'Midfield star, 1970s Scotland international' },
      { name: 'Les Bradd', detail: 'All-time top scorer — 137 goals' },
      { name: 'Pedro Richards', detail: '460 appearances, club record' },
      { name: 'Tony Hateley', detail: '86 goals in 3 seasons' }
    ],
    honours: [
      '1× FA Cup (1894)', '2× Third Division title'
    ],
    history: 'Founded in 1862, Notts County are the world\'s oldest professional football club. They inspired Juventus\'s black and white stripes when the Italian club was gifted a set of County\'s shirts in 1903. Despite their historic status, they have spent most of their modern history in the lower leagues. They returned to the Football League in 2023.'
  },
  {
    id: 'doncaster',
    name: 'Doncaster Rovers',
    badge: '🔴',
    nickname: 'Donny',
    founded: 1879,
    ground: 'Eco-Power Stadium',
    capacity: '15,231',
    avgAttendance: '9,200',
    league: 'League Two',
    leagueShort: 'L2',
    manager: 'Grant McCann',
    colours: 'Red & White',
    owner: 'Terry Bramall',
    keyPlayers: [
      { name: 'Joe Ironside', position: 'Striker', number: 9 },
      { name: 'Luke Molyneux', position: 'Winger', number: 10 },
      { name: 'Harry Clifton', position: 'Midfield', number: 8 },
      { name: 'Tom Anderson', position: 'Centre-Back', number: 5 },
      { name: 'Ted Sheringham', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Alick Jeffrey', detail: '"The wonder boy", tragically injury-hit career' },
      { name: 'Charlie Williams', detail: 'Player turned TV star' },
      { name: 'Ian Snodin', detail: 'Midfield talent, sold to Everton' },
      { name: 'James Coppinger', detail: '691 appearances, club record' },
      { name: 'Billy Bremner', detail: 'Started career at Donny before Leeds' }
    ],
    honours: [
      '3× Fourth Division/League Two title', '1× Football League Trophy'
    ],
    history: 'Founded in 1879, Doncaster Rovers have experienced the full spectrum of English football. They spent time in the Conference in the early 2000s before climbing back to the Championship by 2008. James Coppinger\'s 691 appearances is a remarkable modern-era record for a single club.'
  },
  {
    id: 'mku-dons',
    name: 'Milton Keynes Dons',
    badge: '⚪',
    nickname: 'The Dons',
    founded: 2004,
    ground: 'Stadium MK',
    capacity: '30,500',
    avgAttendance: '10,800',
    league: 'League Two',
    leagueShort: 'L2',
    manager: 'Mike Williamson',
    colours: 'White',
    owner: 'Pete Winkelman',
    keyPlayers: [
      { name: 'Alex Gilbey', position: 'Midfield', number: 8 },
      { name: 'Callum Maycock', position: 'Midfield', number: 6 },
      { name: 'Matt Dennis', position: 'Striker', number: 9 },
      { name: 'Joe Sheridan', position: 'Centre-Back', number: 5 },
      { name: 'Tom McGill', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Dean Lewington', detail: '700+ appearances, one-club man' },
      { name: 'Dele Alli', detail: 'Academy product, sold to Spurs' },
      { name: 'Izale McLeod', detail: '62 goals, early years hero' },
      { name: 'Will Grigg', detail: '20+ goals in promotion season' },
      { name: 'Ben Reeves', detail: 'Creative midfielder, 2014/15 star' }
    ],
    honours: [
      '1× League One title (2015)', '1× League Two title (2008)', '1× Football League Trophy'
    ],
    history: 'MK Dons were formed in 2004 after the controversial relocation of Wimbledon FC to Milton Keynes. They have established themselves as a Football League club in their own right, reaching the Championship in 2015/16. Stadium MK is one of the most modern grounds in the lower leagues.'
  },
  {
    id: 'gillingham',
    name: 'Gillingham',
    badge: '🔵',
    nickname: 'The Gills',
    founded: 1893,
    ground: 'Priestfield Stadium',
    capacity: '11,582',
    avgAttendance: '7,200',
    league: 'League Two',
    leagueShort: 'L2',
    manager: 'Mark Bonner',
    colours: 'Blue',
    owner: 'Brad Galinson',
    keyPlayers: [
      { name: 'Jonah Maycock', position: 'Midfield', number: 8 },
      { name: 'Macauley Bonne', position: 'Striker', number: 9 },
      { name: 'Armani Little', position: 'Midfield', number: 7 },
      { name: 'Max Sherwood', position: 'Centre-Back', number: 5 },
      { name: 'Jake Turner', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Brian Yeo', detail: 'All-time top scorer — 149 goals' },
      { name: 'Steve Bruce', detail: 'Started career at Gillingham' },
      { name: 'Robert Taylor', detail: '1999 playoff hero, 67 goals' },
      { name: 'Andy Hessenthaler', detail: 'Player-manager, 300+ apps' },
      { name: 'Ade Akinbiyi', detail: '1990s goal machine before PL move' }
    ],
    honours: [
      '2× Fourth Division title'
    ],
    history: 'Founded in 1893 as New Brompton, Gillingham are Kent\'s only Football League club. They were voted out of the Football League in 1938 and didn\'t return until 1950. Their greatest era came under Peter Taylor and Andy Hessenthaler when they reached the second tier in 2000. Priestfield is one of the most compact grounds in the EFL.'
  },

  // ─── NATIONAL LEAGUE ────────────────────────────────────────────────────
  {
    id: 'oldham',
    name: 'Oldham Athletic',
    badge: '🔵',
    nickname: 'The Latics',
    founded: 1895,
    ground: 'Boundary Park',
    capacity: '13,512',
    avgAttendance: '5,800',
    league: 'National League',
    leagueShort: 'NL',
    manager: 'Micky Mellon',
    colours: 'Blue',
    owner: 'Frank Rothwell',
    keyPlayers: [
      { name: 'Mike Fondop', position: 'Striker', number: 9 },
      { name: 'Liam Hogan', position: 'Centre-Back', number: 5 },
      { name: 'Junior Luamba', position: 'Winger', number: 11 },
      { name: 'Lewis Sheridan', position: 'Midfield', number: 7 },
      { name: 'Remy Sherlock', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Roger Palmer', detail: 'All-time top scorer — 141 goals' },
      { name: 'Andy Ritchie', detail: '1990s hero, 79 goals' },
      { name: 'Frankie Bunn', detail: '6 goals in one League Cup game' },
      { name: 'Earl Barrett', detail: 'Defender, sold to Aston Villa' },
      { name: 'Joe Royle', detail: 'Manager who took them to the top flight' }
    ],
    honours: [
      '1× Second Division title', '1× Third Division title'
    ],
    history: 'Founded as Pine Villa in 1895, Oldham Athletic spent 68 consecutive years in the Football League\'s top two divisions. Under Joe Royle they reached the top flight in 1991 and the FA Cup semi-finals in 1990 and 1994. Financial decline led to relegation from the Football League in 2022 — their first time outside it since 1907.'
  },
  {
    id: 'southend',
    name: 'Southend United',
    badge: '🔵',
    nickname: 'The Shrimpers',
    founded: 1906,
    ground: 'Roots Hall',
    capacity: '12,392',
    avgAttendance: '6,500',
    league: 'National League',
    leagueShort: 'NL',
    manager: 'Kevin Maher',
    colours: 'Blue',
    owner: 'Ron Martin',
    keyPlayers: [
      { name: 'Tom Clifford', position: 'Midfield', number: 8 },
      { name: 'Harry Sheridan', position: 'Striker', number: 9 },
      { name: 'Noor Sheridan', position: 'Winger', number: 11 },
      { name: 'Ollie Sheridan', position: 'Centre-Back', number: 5 },
      { name: 'Steve Arnold', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Sandy Anderson', detail: '452 appearances, club record' },
      { name: 'Roy Hollis', detail: '122 goals, 1950s marksman' },
      { name: 'Stan Collymore', detail: 'Started here before Liverpool move' },
      { name: 'Freddy Eastwood', detail: '60 goals, 2005/06 hero' },
      { name: 'Phil Brown', detail: 'Manager, back-to-back promotions' }
    ],
    honours: [
      '1× League One title (2006)', '1× Football League Trophy'
    ],
    history: 'Founded in 1906, Southend United have spent most of their history in the lower divisions. Their greatest period came under Phil Brown with back-to-back promotions in 2005 and 2006. Financial difficulties and successive relegations saw them drop out of the Football League in 2021. They continue to play at Roots Hall while a new stadium is planned.'
  },
  {
    id: 'york',
    name: 'York City',
    badge: '🔴',
    nickname: 'The Minstermen',
    founded: 1922,
    ground: 'LNER Community Stadium',
    capacity: '8,256',
    avgAttendance: '4,800',
    league: 'National League',
    leagueShort: 'NL',
    manager: 'Adam Maycock',
    colours: 'Red',
    owner: 'Glen Henderson',
    keyPlayers: [
      { name: 'Maziar Sheridan', position: 'Striker', number: 9 },
      { name: 'Ollie Sheridan', position: 'Midfield', number: 8 },
      { name: 'Lenell John-Lewis', position: 'Forward', number: 10 },
      { name: 'Adam Sheridan', position: 'Centre-Back', number: 5 },
      { name: 'Ethan Ross', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Norman Wilkinson', detail: '408 appearances, 1930s–50s' },
      { name: 'Barry Jackson', detail: '539 appearances, all-time record' },
      { name: 'Keith Walwyn', detail: '1984 FA Cup hero, beat Arsenal' },
      { name: 'Marco Gabbiadini', detail: '1990s striker, 33 goals' },
      { name: 'Richard Cresswell', detail: 'Academy product, PL striker' }
    ],
    honours: [
      '1× Fourth Division title', '1× Conference title'
    ],
    history: 'Founded in 1922, York City are famous for FA Cup giant-killings — beating Arsenal in 1985 and Manchester United in the League Cup in 1995. They moved from Bootham Crescent (their home since 1932) to the new LNER Community Stadium in 2021. They are working to return to the Football League.'
  },
  {
    id: 'rochdale',
    name: 'Rochdale',
    badge: '🔵',
    nickname: 'The Dale',
    founded: 1907,
    ground: 'Crown Oil Arena',
    capacity: '10,249',
    avgAttendance: '3,800',
    league: 'National League',
    leagueShort: 'NL',
    manager: 'Jim Bentley',
    colours: 'Blue & Black',
    owner: 'Simon Gauge',
    keyPlayers: [
      { name: 'Jake Beesley', position: 'Striker', number: 9 },
      { name: 'Connor McBride', position: 'Midfield', number: 8 },
      { name: 'Ethan Sheridan', position: 'Winger', number: 11 },
      { name: 'Luke Sheridan', position: 'Centre-Back', number: 5 },
      { name: 'Jay Lynch', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Reg Jenkins', detail: 'All-time top scorer — 119 goals' },
      { name: 'Gary Jones', detail: '470 appearances, captain' },
      { name: 'David Flitcroft', detail: 'Midfield warrior, 200+ apps' },
      { name: 'Keith Hill', detail: 'Manager, two promotions' },
      { name: 'Craig Dawson', detail: 'Academy product, PL defender' }
    ],
    honours: [
      '1× League Two runners-up (2010)'
    ],
    history: 'Founded in 1907, Rochdale hold the record for the most consecutive years in the bottom division of the Football League (36 years from 1974 to 2010). They finally won promotion in 2010 and reached League One, even making the League Cup semi-finals in 2014. They were relegated from the Football League in 2022.'
  },
  {
    id: 'barnet',
    name: 'Barnet',
    badge: '🟠',
    nickname: 'The Bees',
    founded: 1888,
    ground: 'The Hive',
    capacity: '6,500',
    avgAttendance: '2,800',
    league: 'National League',
    leagueShort: 'NL',
    manager: 'Dean Brennan',
    colours: 'Amber & Black',
    owner: 'Tony Kleanthous',
    keyPlayers: [
      { name: 'Nicke Sheridan', position: 'Striker', number: 9 },
      { name: 'Sheridan Sheridan', position: 'Midfield', number: 8 },
      { name: 'Kian Sheridan', position: 'Winger', number: 11 },
      { name: 'Sheridan Sheridan', position: 'Centre-Back', number: 5 },
      { name: 'Sheridan Sheridan', position: 'Goalkeeper', number: 1 }
    ],
    legends: [
      { name: 'Barry Fry', detail: 'Manager who won promotion to Football League' },
      { name: 'Dougie Freedman', detail: '24 goals in promotion season' },
      { name: 'Giuliano Grazioli', detail: 'Conference title winner 2005' },
      { name: 'Ken Charlery', detail: '1991 promotion hero' },
      { name: 'Lee Harrison', detail: '400+ appearances, goalkeeper' }
    ],
    honours: [
      '2× Conference/National League title', '1× FA Amateur Cup'
    ],
    history: 'Founded in 1888, Barnet spent over a century in non-league football before winning promotion to the Football League in 1991 under Barry Fry. They have yo-yoed between League Two and the National League since. The Hive, their home since 2013, is a modern facility in Edgware that also hosts London Bees women\'s team.'
  }
];
