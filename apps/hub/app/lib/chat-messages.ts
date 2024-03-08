export const thumbsUpSayings = () => {
  const sayings = [
    '👌 A-OK!',
    '✅ Checked and loaded!',
    '🌟 Star power, activate!',
    '🚀 To infinity and beyond!',
    '💯 Percent awesome!',
    '🎯 Hit the mark!',
    '🥇 Gold medal moves!',
    '💡 Bright idea!',
    '🔥 Lit!',
    '👏 Applause!',
    '🙌 Raise the roof!',
    '🏆 Champ status!',
    '👑 Slay, king/queen!',
    '💪 Flexing!',
    '🤝 Deal sealed!',
    '✨ Sparkling success!',
    '🕺/💃 Dance it out!',
    '🎉 Party on!',
    '😎 Cool as a cucumber!',
    '🧠 Big brain time!',
  ];

  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};

export const foodSayings = () => {
  const sayings = [
    '🍕 Slice, slice, baby',
    '🍔 Nom nom time!',
    '🍟 Fries before guys',
    "🌮 Taco 'bout delicious",
    '🍔 Is it cheat day yet?',
    '🍕 In crust we trust',
    '🍟 Spud life',
    "🌮 Let's taco 'bout food",
    '🍔 Lettuce eat',
    '🥡 Takeout > Makeout',
    '🍣 Sushi me rollin’',
    '🍔 Grill and chill?',
    '🍰 Dessert island',
    "🥞 Syrup it's serious",
    '🍗 Winner winner, chicken dinner',
    '🍔 Bun-believable!',
    '🍝 Send noods',
    '🍦 Ice cream, you scream',
    '🍕 food plz',
    '🥗 Leaf the talking to me',
  ];

  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};

// the skull emoji represents a "go on without me, do not wait message"
export const deadSayings = () => {
  const sayings = [
    '💀 go on without me',
    '💀 brb never',
    '💀 ttyn',
    "💀 I've left the chat",
    '💀 Currently not living',
    '💀 presss F to pay respects',
    '💀 i am deceased',
  ];
  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};

export const loveSayings = () => {
  const sayings = [
    '❤️ Love you!',
    '❤️ You are loved!',
    '❤️ You are loved more than you know!',
    '❤️ Love you more than pizza!',
    "❤️ You're my favorite notification!",
    "❤️ You're the meme of my dreams!",
    '❤️ You bean the world to me!',
    '❤️ You’re the only one for me!',
  ];
  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};
