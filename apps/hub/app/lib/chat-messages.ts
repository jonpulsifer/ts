export const thumbsUpSayings = () => {
  const sayings = [
    '👍 Without a shadow of a doubt',
    '👍 Yes',
    '👍 Thumbs up, partner!',
    '👍 Roger that!',
    '👍 Yup, yup!',
    '👍 Affirmative, chief!',
    '👍 Green light, go!',
    '👍 On it like a bonnet!',
    '👍 Yes, captain!',
    '👍 Acknowledged with gusto!',
    '👍 10-4, good buddy!',
    "👍 That's a big 10-4!",
    '👍 It is decidedly so',
    '👍 As I see it, yes',
    '👍 Most likely',
    '👍 Outlook good',
    '👍 Yes, definitely',
    '👍 You may rely on it',
    '👍 Signs point to yes',
  ];
  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};

export const burgerSayings = () => {
  const sayings = [
    '🍔 food pls',
    '🍔 Patties to the people!',
    '🍔 Lettuce feast!',
    '🍔 In buns we trust!',
    '🍔 Cheese the day!',
    '🍔 United in grease!',
    '🍔 Seize the beef!',
    '🍔 Flipping fantastic!',
    '🍔 hung ghee',
    '🍔 Make it rare, medium, or well done!',
    '🍔 bbq and chill?',
  ];
  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};

// the skull emoji represents a "go on without me, do not wait message"
export const deadSayings = () => {
  const sayings = [
    '💀 go on without me',
    '💀 brb never',
    '💀 Out of service, try again never',
    '💀 Just ghosted the world',
    "💀 I've left the chat",
    '💀 Currently not living',
    '💀 Out for an eternal coffee break',
    '💀 press F to pay respects',
  ];
  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};

export const loveSayings = () => {
  const sayings = [
    '❤️ Love you more than pizza!',
    "❤️ You're my favorite notification!",
    '❤️ Our bond is stronger than Wi-Fi!',
    "❤️ You're the emoji to my keyboard!",
    '❤️ Love you like I love my coffee: endlessly!',
    '❤️ You are the light at the end of my tunnel!',
    "❤️ You've got a pizza my heart!",
    "❤️ You're the screenshot I won’t delete!",
    '❤️ Heart reacts only for you!',
    "❤️ You're the meme of my dreams!",
    '❤️ You bean the world to me!',
    "❤️ You're my unplugged router. Needed to reconnect!",
    '❤️ You’re the best thing since sliced bread!',
    '❤️ You’re the only one for me!',
  ];
  const randomIndex = Math.floor(Math.random() * sayings.length);
  return sayings[randomIndex];
};
