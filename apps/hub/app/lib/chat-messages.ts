export const thumbsUpSayings = () => {
  const sayings = [
    '👍 Without a shadow of a doubt',
    '👍 Yes',
    '👍 It is certain',
    '👍 It is decidedly so',
    '👍 As I see it, yes',
    '👍 Most likely',
    '👍 Outlook good',
    '👍 Yes, definitely',
    '👍 You may rely on it',
    '👍 Signs point to yes',
  ];
  const randomIndex = Math.floor(Math.random() * thumbsUpSayings.length);
  return sayings[randomIndex];
};

// the skull emoji represents a "go on without me, do not wait message"
export const deadSayings = () => {
  const sayings = [
    '💀 Go on without me',
    '💀 brb never',
    "💀 I am withering away, don't wait for me",
    '💀 I am forever lost',
    '💀 Vanishing into the void',
    '💀 Lost to the shadows',
    '💀 Dissolving into mist',
    '💀 Eclipsed by the abyss',
    '💀 Swept into the silence',
    '💀 Fading from this realm',
    '💀 Whisked away by phantoms',
    '💀 Severing the digital tether',
    '💀 Absorbed by the ether',
    '💀 Swallowed by the darkness',
    '💀 Adrift in the nether',
  ];
  const randomIndex = Math.floor(Math.random() * deadSayings.length);
  return sayings[randomIndex];
};

export const loveSayings = () => {
  const sayings = [
    '❤️ I love you!',
    '❤️ You are loved!',
    '❤️ You are appreciated!',
    '❤️ You are valued!',
    '❤️ You are important!',
    '❤️ You are cherished!',
    '❤️ You are adored!',
    '❤️ You are treasured!',
    '❤️ You are respected!',
    '❤️ You are admired!',
    '❤️ You are cared for!',
    '❤️ You are celebrated!',
    '❤️ You are supported!',
    '❤️ You are understood!',
    '❤️ You are accepted!',
    '❤️ You are believed in!',
    '❤️ You are trusted!',
    '❤️ You are encouraged!',
    '❤️ You are uplifted!',
    '❤️ You are empowered!',
    '❤️ You are inspired!',
    '❤️ You are seen!',
    '❤️ You are heard!',
    '❤️ You are known!',
    '❤️ You are understood!',
    '❤️ You are appreciated!',
    '❤️ You are valued!',
    '❤️ You are respected!',
    '❤️ You are cherished!',
    '❤️ You are adored!',
    '❤️ You are treasured!',
    '❤️ You are loved!',
  ];
  const randomIndex = Math.floor(Math.random() * loveSayings.length);
  return sayings[randomIndex];
};
