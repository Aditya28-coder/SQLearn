// Add personal messages here. {name} is replaced with the learner’s name.
// Emojis and celebration are intentional parts of the gift brief.
export const compliments = [
  "Look at you, writing queries like a pro! 🌟",
  "That was so clean. Your future teammates are lucky! 💖",
  "Brain: 1000. Bugs: 0. ✨",
  "{name}, you made that little table tell its story. 🌷",
  "A little query, a lovely discovery. 💛",
  "That’s one more thing you know how to do. 🌱",
  "Your curiosity is doing beautiful work. ✨",
  "You and SQL are getting along wonderfully. 💜",
  "{name}, that result has your name written all over it. 🌟",
  "A tiny victory worth a tiny happy dance. 💃",
  "You asked the data just the right question. 🔎",
  "Another little piece clicked into place. 🧩",
  "That’s the kind of query that makes a database smile. ☀️",
  "You’re collecting aha moments now. ✨",
  "A clean result and a well-earned smile. 🌸",
  "You’re building something lovely: confidence. 🌱",
  "{name}, take a second to be proud of that. 💖",
  "This is what learning looks like, one query at a time. 🌷",
  "Consider this a little high five from your database. 🙌",
  "That query understood the assignment. ✨",
  "Nicely spotted. Those details matter. 🔎",
  "You made room for one more good idea today. 💛",
  "One question, one lovely answer. 🌟",
  "The rows are right where you wanted them. 🌸",
  "{name}, your future self is cheering for you. 💜",
  "Your patient little experiments are paying off. 🌱",
  "Another query in your growing toolbox. 🧰",
  "That was thoughtful SQL. It shows. ✨",
  "You just turned a question into an answer. 🌟",
  "Somewhere, a spreadsheet is very impressed. 💖",
  "A little less mystery. A little more magic. ✨",
  "You’re learning the language of little discoveries. 🌷",
  "{name}, that was a lovely bit of problem-solving. 💛",
  "One more SQL superpower, quietly unlocked. 🌟",
  "That deserves a celebratory sip of tea. ☕",
  "You kept going, and the pieces came together. 🧩",
  "Tiny query. Real progress. Big smile. 💜",
  "Your logic is looking rather lovely today. ✨",
  "The database says yes, and so do we. 🌸",
  "That’s a very nice answer to a very good question. 🌟",
  "{name}, you’re making this knowledge your own. 🌱",
  "Look at that—another little win to keep. 💖",
  "You found the pattern. That’s the good stuff. 🔎",
  "Your SQL story just got another happy sentence. 🌷",
  "A neat little query with a big little payoff. ✨",
  "The right rows, the right idea, all you. 💛",
  "You’re getting comfortable with the wonderfully possible. 🌱",
  "That’s some seriously kind-to-your-future-self practice. 💜",
  "{name}, you and this question make a great team. 🌟",
  "Curiosity called. It’s very proud of you. 💖",
  "This little win belongs entirely to you. 🌸",
  "You gave that idea a try, and it clicked. 🧩",
  "Beautifully reasoned. Keep that feeling. ✨",
  "A tiny round of applause for your SQL brain. 👏",
  "Now that is a result worth smiling at. ☀️",
  "You’re proving that small steps really do add up. 🌱",
  "{name}, your patience is becoming a superpower. 💜",
  "One more answer you didn’t know you could find. 🌟",
  "That little semicolon has excellent company. ✨",
  "You brought the question and found the answer. 💛",
  "The happy little rows are all accounted for. 🌷",
  "You’re doing the quiet work that makes confidence grow. 🌱",
  "{name}, that was a proper little aha moment. 💖",
  "A warm little well-done, just for you. ☀️",
];

let bag: number[] = [];
let last = -1;
export function nextCompliment(name: string) {
  if (!bag.length) {
    bag = compliments.map((_, index) => index);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.at(-1) === last)
      [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
  }
  last = bag.pop()!;
  return compliments[last].replaceAll("{name}", name);
}
export const milestones = {
  week: (name: string) =>
    `${name}, seven little days of showing up for yourself. Those moments of curiosity are becoming confidence. You’ve made something lovely, and a rest day is always welcome. 🌷`,
  lesson: (name: string, title: string) =>
    `${name}, you made time for yourself and learned “${title}.” That’s something to be proud of. Let it settle—you don’t have to rush the next step. 💖`,
  level: (name: string, level=1) =>
    `${name}, remember when SQL was a new language? You’ve just worked through ${level===1?"your first whole level":`Level ${level}`}. You built this confidence, one small question at a time. 🌷`,
  course: (name:string)=>`${name}, from your first little table to thoughtful engineering queries, you made this journey your own. Every patient retry and curious question brought you here. Keep this confidence with you; you earned it. 💖`,
  challenge: (name: string) =>
    `${name}, you brought those little ideas together into one thoughtful query. A whole gift list, from a question you asked yourself. That’s a lovely discovery. 💖`,
};
