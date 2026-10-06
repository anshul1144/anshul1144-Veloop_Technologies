export const games = [
  {
    id: 1,
    slug: "blade-master",
    name: "Blade Master!",
    subtitle: "Aim. Throw. Hit Perfect!",
    description: "Test your reflex and precision! Throw forged blades into rotating wooden targets with split-second timing. Hit bonus apples, dodge existing blades, and conquer boss targets to earn big Game Coins.",
    image: "/assets/games/game-01.avif",
    cost: 20,
    currency: "Tokens",
    tag: "POPULAR",
    category: "Action & Reflex",
    playable: true,
    theme: {
      accentColor: "#f59e0b",
      lightBg: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #fef9c3 100%)",
      tagColor: "#d97706",
      hudColor: "#92400e"
    },
    guide: {
      title: "How to Play Blade Master",
      steps: [
        {
          title: "Aim & Throw",
          desc: "Tap the screen, click your mouse, or hit SPACEBAR to fling a knife toward the rotating log."
        },
        {
          title: "Avoid Clashing",
          desc: "Never hit a blade that is already stuck in the log! If blades collide, the run ends."
        },
        {
          title: "Slice Bonus Apples",
          desc: "Hit spinning apples on the log for +25 extra score and bonus coin multipliers!"
        },
        {
          title: "Win Game Coins",
          desc: "Survive waves and defeat stages to earn centralized VELOOP Game Coins!"
        }
      ]
    },
    rewards: [
      { score: "500+ pts", coins: 25 },
      { score: "250+ pts", coins: 15 },
      { score: "100+ pts", coins: 10 },
      { score: "Base Run", coins: 5 }
    ]
  },
  {
    id: 2,
    slug: "nutcraft",
    name: "Nutcraft",
    subtitle: "Twist. Remove. Master!",
    description: "Unscrew mechanical nuts, bolts, and wooden plates in the right sequence to release trapped blocks without blocking adjacent holes.",
    image: "/assets/games/game-02.avif",
    cost: 20,
    currency: "Tokens",
    tag: "LOGIC",
    category: "Puzzle & Brain",
    playable: true,
    theme: {
      accentColor: "#84cc16",
      lightBg: "linear-gradient(135deg, #ecfccb 0%, #f7fee7 100%)",
      tagColor: "#65a30d"
    },
    guide: {
      title: "How to Play Nutcraft",
      steps: [
        {
          title: "Select a Bolt",
          desc: "Tap or click on any threaded bolt on the board to unscrew and select it."
        },
        {
          title: "Find a Vacant Hole",
          desc: "Tap an empty hole to screw the bolt into its new slot."
        },
        {
          title: "Drop Wooden Plates",
          desc: "When all bolts securing a wooden plate are removed, gravity makes it drop!"
        },
        {
          title: "Clear All Plates",
          desc: "Drop all wooden plates to complete the level and win bonus tokens!"
        }
      ]
    },
    rewards: [
      { score: "300+ pts", coins: 25 },
      { score: "150+ pts", coins: 15 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 3,
    slug: "bowlexa",
    name: "Bowlexa",
    subtitle: "Aim. Swing. Strike!",
    description: "Swing the pendulum wrecking bowling ball with precise trajectory to knock down all glowing pins in one thunderous strike.",
    image: "/assets/games/game-03.avif",
    cost: 20,
    currency: "Tokens",
    tag: "ARCADE",
    category: "Physics & Arcade",
    playable: true,
    theme: {
      accentColor: "#f97316",
      lightBg: "linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)",
      tagColor: "#ea580c"
    },
    guide: {
      title: "How to Play Bowlexa",
      steps: [
        {
          title: "Watch the Pendulum",
          desc: "The bowling pendulum swings back and forth across the lane."
        },
        {
          title: "Time Your Release",
          desc: "Tap the screen at the right angle to launch the bowling ball straight down the alley."
        },
        {
          title: "Hit Strikes",
          desc: "Knock down all 10 pins in a single throw to earn an instant STRIKE bonus!"
        },
        {
          title: "Earn Tokens",
          desc: "Score high before running out of balls to earn Coins and Arcade Tokens."
        }
      ]
    },
    rewards: [
      { score: "350+ pts", coins: 30 },
      { score: "200+ pts", coins: 18 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 4,
    slug: "block-crush",
    name: "Block Crush",
    subtitle: "Break Blocks. Win Big!",
    description: "Aim laser multi-balls to crush numbered neon bricks before they reach the bottom baseline. Collect laser boosts and wide paddles.",
    image: "/assets/games/game-04.avif",
    cost: 20,
    currency: "Tokens",
    tag: "CHALLENGE",
    category: "Casual & Arcade",
    playable: true,
    theme: {
      accentColor: "#06b6d4",
      lightBg: "linear-gradient(135deg, #cffafe 0%, #ecfeff 100%)",
      tagColor: "#0891b2"
    },
    guide: {
      title: "How to Play Block Crush",
      steps: [
        {
          title: "Control the Paddle",
          desc: "Drag with your finger or move your mouse horizontally to slide the laser paddle."
        },
        {
          title: "Bounce the Ball",
          desc: "Hit the ball with different sections of your paddle to direct its rebound angle."
        },
        {
          title: "Smash Bricks",
          desc: "Break all neon bricks to clear the stage and unlock the next challenge."
        },
        {
          title: "Save Your Lives",
          desc: "Don't let the ball fall past your paddle! You have 3 lives per run."
        }
      ]
    },
    rewards: [
      { score: "400+ pts", coins: 30 },
      { score: "250+ pts", coins: 20 },
      { score: "Base Run", coins: 10 }
    ]
  },
  {
    id: 5,
    slug: "slice-storm",
    name: "Slice Storm",
    subtitle: "Slice. Combo. Conquer!",
    description: "Swipe, drag, and slice juicy flying watermelons, pineapples, oranges, and apples with swift blade slashes! Dodge dangerous bombs and trigger epic fruit combo multipliers.",
    image: "/assets/games/game-05.avif",
    cost: 20,
    currency: "Tokens",
    tag: "FEATURED",
    category: "Action & Arcade",
    playable: true,
    theme: {
      accentColor: "#10b981",
      lightBg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 50%, #f0fdf4 100%)",
      tagColor: "#059669",
      hudColor: "#065f46"
    },
    guide: {
      title: "How to Play Slice Storm",
      steps: [
        {
          title: "Slice the Fruit",
          desc: "Swipe with your finger or drag your mouse across flying fruit to slice them in mid-air!"
        },
        {
          title: "Rack Up Combos",
          desc: "Slice 3 or more fruits in a single slash to activate lucrative Combo point bonuses."
        },
        {
          title: "Dodge Bombs",
          desc: "Careful! Never slice the ticking black bombs. Hitting a bomb causes instant Game Over."
        },
        {
          title: "Earn Game Coins",
          desc: "Score high before the 30-second timer expires to take home huge VELOOP Game Coins!"
        }
      ]
    },
    rewards: [
      { score: "400+ pts", coins: 25 },
      { score: "200+ pts", coins: 15 },
      { score: "100+ pts", coins: 10 },
      { score: "Base Run", coins: 5 }
    ]
  },
  {
    id: 6,
    slug: "cosmo-warrior",
    name: "Cosmo Warrior",
    subtitle: "Fight. Survive. Save the Galaxy!",
    description: "Pilot your cosmic starfighter through alien bullet hell swarms and conquer massive mothership bosses with laser upgrades.",
    image: "/assets/games/game-06.avif",
    cost: 20,
    currency: "Tokens",
    tag: "RETRO",
    category: "Space Shooter",
    playable: true,
    theme: {
      accentColor: "#6366f1",
      lightBg: "linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)",
      tagColor: "#4f46e5"
    },
    guide: {
      title: "How to Play Cosmo Warrior",
      steps: [
        {
          title: "Pilot Your Ship",
          desc: "Drag your finger or mouse across the screen to steer your starfighter in any direction."
        },
        {
          title: "Auto Lasers",
          desc: "Your cannons automatically blast rapid-fire blue laser bolts upward."
        },
        {
          title: "Destroy Alien Swarms",
          desc: "Shoot down alien raiders before they collide into your hull."
        },
        {
          title: "Survive Waves",
          desc: "Clear waves to earn bonus tokens and huge coin multipliers!"
        }
      ]
    },
    rewards: [
      { score: "600+ pts", coins: 30 },
      { score: "300+ pts", coins: 20 },
      { score: "Base Run", coins: 10 }
    ]
  },
  {
    id: 7,
    slug: "toilet-tactics",
    name: "Toilet Tactics",
    subtitle: "Flush. Fight. Survive. Win!",
    description: "Camera-head commanders defend the neon metropolis from invading toilet hordes with tactical turrets and defense upgrades.",
    image: "/assets/games/game-07.avif",
    cost: 20,
    currency: "Tokens",
    tag: "TRENDING",
    category: "Tower Defense",
    playable: true,
    theme: {
      accentColor: "#eab308",
      lightBg: "linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)",
      tagColor: "#ca8a04"
    },
    guide: {
      title: "How to Play Toilet Tactics",
      steps: [
        {
          title: "Tap to Zap",
          desc: "Tap or click on advancing toilet invaders to fire instant plasma zaps."
        },
        {
          title: "Protect the Baseline",
          desc: "Never let invaders cross the yellow city defense line at the bottom!"
        },
        {
          title: "Health Monitor",
          desc: "Keep your base health above 0% to survive the invasion."
        },
        {
          title: "Wave Bonuses",
          desc: "Survive waves to claim Arcade Tokens and victory coins."
        }
      ]
    },
    rewards: [
      { score: "450+ pts", coins: 25 },
      { score: "250+ pts", coins: 15 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 8,
    slug: "word-hunt",
    name: "Word Hunt",
    subtitle: "Find Words. Win Rewards!",
    description: "Connect letter grids in all directions to discover hidden vocabulary words and solve daily reward word puzzles.",
    image: "/assets/games/game-08.avif",
    cost: 20,
    currency: "Tokens",
    tag: "BRAIN",
    category: "Word & Trivia",
    playable: true,
    theme: {
      accentColor: "#3b82f6",
      lightBg: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
      tagColor: "#2563eb"
    },
    guide: {
      title: "How to Play Word Hunt",
      steps: [
        {
          title: "Tap Letter Tiles",
          desc: "Tap letters in the 4x4 grid to construct arcade vocabulary words."
        },
        {
          title: "Arcade Target Words",
          desc: "Find words like COIN, GAME, WIN, VELOOP, STORM, BLADE, and more!"
        },
        {
          title: "Submit Words",
          desc: "Tap 'SUBMIT WORD' to score points and bank words before the 40s timer ends."
        },
        {
          title: "Token Rewards",
          desc: "Every 3 unique words found awards +5 bonus Arcade Tokens!"
        }
      ]
    },
    rewards: [
      { score: "350+ pts", coins: 25 },
      { score: "180+ pts", coins: 15 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 9,
    slug: "bubble-blast-legend",
    name: "Bubble Blast Legend",
    subtitle: "Aim. Shoot. Pop. Win!",
    description: "Launch colored marble bubbles to match 3 or more and trigger cascading chain-reaction blasts with magical cannon boosts.",
    image: "/assets/games/game-09.avif",
    cost: 20,
    currency: "Tokens",
    tag: "CLASSIC",
    category: "Match-3 Puzzle",
    playable: true,
    theme: {
      accentColor: "#ec4899",
      lightBg: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
      tagColor: "#db2777"
    },
    guide: {
      title: "How to Play Bubble Blast Legend",
      steps: [
        {
          title: "Aim the Cannon",
          desc: "Move your finger or mouse across the screen to aim the cannon guide arrow."
        },
        {
          title: "Launch Bubbles",
          desc: "Tap or click to shoot the loaded marble bubble up towards the ceiling."
        },
        {
          title: "Match 3 or More",
          desc: "Connect 3 or more bubbles of the identical color to pop the cluster!"
        },
        {
          title: "Clear the Board",
          desc: "Pop all bubbles before they descend into the danger zone."
        }
      ]
    },
    rewards: [
      { score: "400+ pts", coins: 25 },
      { score: "200+ pts", coins: 15 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 10,
    slug: "merge-master",
    name: "Merge Master!",
    subtitle: "Merge Blocks. Score Big. Win!",
    description: "Drop and slide matching numbered cubes 2 -> 4 -> 8 -> 16 to merge up to the mythical 2048 crown tile and dominate the leaderboards.",
    image: "/assets/games/game-10.avif",
    cost: 20,
    currency: "Tokens",
    tag: "STRATEGY",
    category: "Merge Puzzle",
    playable: true,
    theme: {
      accentColor: "#a855f7",
      lightBg: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
      tagColor: "#9333ea"
    },
    guide: {
      title: "How to Play Merge Master",
      steps: [
        {
          title: "Slide Tiles",
          desc: "Swipe in any direction or use the on-screen D-pad / Arrow keys to slide tiles."
        },
        {
          title: "Merge Same Numbers",
          desc: "When two tiles with the same number touch, they combine into double value!"
        },
        {
          title: "Aim for 2048",
          desc: "Keep combining 128 -> 256 -> 512 -> 1024 to create the legendary 2048 tile."
        },
        {
          title: "Keep Board Clear",
          desc: "Avoid filling the grid without moves to keep the run alive."
        }
      ]
    },
    rewards: [
      { score: "600+ pts", coins: 30 },
      { score: "300+ pts", coins: 18 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 11,
    slug: "wormzy",
    name: "Wormzy",
    subtitle: "Eat Apples. Solve Puzzles. Win!",
    description: "Navigate Wormzy across floating block obstacle courses, munch crisp apples, and reach the finish portal without tumbling.",
    image: "/assets/games/game-11.avif",
    cost: 20,
    currency: "Tokens",
    tag: "CASUAL",
    category: "Platformer",
    playable: true,
    theme: {
      accentColor: "#22c55e",
      lightBg: "linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)",
      tagColor: "#16a34a"
    },
    guide: {
      title: "How to Play Wormzy",
      steps: [
        {
          title: "Steer Wormzy",
          desc: "Use the on-screen D-pad buttons, arrow keys, or WASD to change direction."
        },
        {
          title: "Munch Apples",
          desc: "Guide Wormzy to eat red apples to increase length and rack up score."
        },
        {
          title: "Avoid Collisions",
          desc: "Never crash into the boundary walls or your own tail!"
        },
        {
          title: "Token Milestones",
          desc: "Every 5 apples consumed awards +5 bonus Arcade Tokens!"
        }
      ]
    },
    rewards: [
      { score: "400+ pts", coins: 25 },
      { score: "200+ pts", coins: 15 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 12,
    slug: "aqua-fill",
    name: "Aqua Fill!",
    subtitle: "Draw. Fill. Make Happy!",
    description: "Draw fluid pencil lines across physics obstacles to guide freshwater streams and fill the smiling glass cup to 3 stars.",
    image: "/assets/games/game-12.avif",
    cost: 20,
    currency: "Tokens",
    tag: "PHYSICS",
    category: "Creative Puzzle",
    playable: true,
    theme: {
      accentColor: "#0284c7",
      lightBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
      tagColor: "#0369a1"
    },
    guide: {
      title: "How to Play Aqua Fill",
      steps: [
        {
          title: "Draw Lines",
          desc: "Drag your finger or mouse across the screen to sketch physics pencil lines."
        },
        {
          title: "Guide Water",
          desc: "Falling water droplets bounce off your drawn lines and obstacles."
        },
        {
          title: "Fill the Smiling Cup",
          desc: "Direct droplets into the glass cup until the water level reaches 100%."
        },
        {
          title: "Level Clear",
          desc: "Filling the cup clears the level and awards +5 Arcade Tokens!"
        }
      ]
    },
    rewards: [
      { score: "350+ pts", coins: 25 },
      { score: "180+ pts", coins: 15 },
      { score: "Base Run", coins: 8 }
    ]
  },
  {
    id: 13,
    slug: "realm-clash",
    name: "Realm Clash!",
    subtitle: "Build. Battle. Conquer!",
    description: "Deploy knight battalions, archer towers, and tactical spells to storm enemy bastions in real-time tactical castle warfare.",
    image: "/assets/games/game-13.avif",
    cost: 20,
    currency: "Tokens",
    tag: "TACTICS",
    category: "Real-Time Strategy",
    playable: true,
    theme: {
      accentColor: "#ef4444",
      lightBg: "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)",
      tagColor: "#dc2626"
    },
    guide: {
      title: "How to Play Realm Clash",
      steps: [
        {
          title: "Gather Elixir",
          desc: "Your purple elixir gauge charges automatically up to a maximum of 10."
        },
        {
          title: "Deploy Troops",
          desc: "Tap Archer (2 Elixir), Knight (3 Elixir), or Wizard (4 Elixir) cards to deploy."
        },
        {
          title: "Battle in Lanes",
          desc: "Your troops clash against incoming enemies and march towards the enemy tower."
        },
        {
          title: "Destroy Bastion",
          desc: "Destroy the enemy King Bastion before yours falls to win +15 Tokens!"
        }
      ]
    },
    rewards: [
      { score: "400+ pts", coins: 30 },
      { score: "200+ pts", coins: 20 },
      { score: "Base Run", coins: 10 }
    ]
  }
];

export const redemptionOptions = [
  {
    id: "ve",
    name: "Veloop Energies (VEs)",
    badge: "Most Popular",
    description: "Convert your Game Coins to primary platform energy for unlocking tier rewards.",
    rateDesc: "100 Game Coins → 10 VEs",
    costCoins: 100,
    rewardAmount: 10,
    rewardUnit: "VEs",
    icon: "/assets/rewards/ve.png",
    color: "#eab308"
  },
  {
    id: "sve",
    name: "Silver VEs (SVEs)",
    badge: "Best Value",
    description: "Exchange Coins for Silver VEs to participate in secondary milestone events.",
    rateDesc: "100 Game Coins → 15 SVEs",
    costCoins: 100,
    rewardAmount: 15,
    rewardUnit: "SVEs",
    icon: "/assets/rewards/sve.png",
    color: "#94a3b8"
  },
  {
    id: "gems",
    name: "Premium Gems",
    badge: "Rare Currency",
    description: "Valuable purple crystals used to unlock exclusive cosmetics and multipliers.",
    rateDesc: "50 Game Coins → 5 Gems",
    costCoins: 50,
    rewardAmount: 5,
    rewardUnit: "Gems",
    icon: "/assets/rewards/gems.png",
    color: "#a855f7"
  },
  {
    id: "tokens",
    name: "Arcade Tokens",
    badge: "Play More",
    description: "Convert your earned coins straight back into 20 Tokens to keep playing games!",
    rateDesc: "40 Game Coins → 20 Tokens",
    costCoins: 40,
    rewardAmount: 20,
    rewardUnit: "Tokens",
    icon: "/assets/token.png",
    color: "#f59e0b"
  },
  {
    id: "spins",
    name: "Lucky Wheel Spin Voucher",
    badge: "High Roller",
    description: "Get a VIP ticket for the VELOOP Lucky Spin Wheel to win massive jackpots.",
    rateDesc: "30 Game Coins → 1 Spin Voucher",
    costCoins: 30,
    rewardAmount: 1,
    rewardUnit: "Spins",
    icon: "/assets/rewards/spins.png",
    color: "#8b5cf6"
  }
];

export default games;
