export const quotes = [
  {
    quote: 'Your love makes me strong, your hate makes me unstoppable.',
    author: 'Cristiano Ronaldo'
  },
  {
    quote:
      'If I had asked people what they wanted, they would have said faster horses.',
    author: 'Henry Ford'
  },
  {
    quote:
      'I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.',
    author: 'Bruce Lee'
  },
  {
    quote: 'Self-belief and hard work will always earn you success.',
    author: 'Virat Kohli'
  },
  {quote: "Winners don't make excuses.", author: 'Harvey Specter'},
  {
    quote:
      "Success isn't an overnight thing. It's when everyday you get a little better than the day before. It all adds up.",
    author: "Dwayne 'The Rock' Johnson"
  },
  {
    quote:
      'When the team starts the objective is to win it all with the team. Personal records are secondary.',
    author: 'Lionel Messi'
  },
  {
    quote:
      'Sometimes you have to take a leap of faith first. The trust part comes later.',
    author: 'Superman'
  },
  {
    quote: "Don't try to beat the goal keeper... try to destroy him.",
    author: 'Steven Gerrard'
  },
  {
    quote: 'The only pressure I feel is the pressure I put on myself to win.',
    author: 'Andy Murray'
  },
  {quote: 'Sometimes you gotta run before you can walk.', author: 'Iron Man'},
  {
    quote: "If there's great commitment on the field, that's victory for me.",
    author: 'M.S. Dhoni'
  },
  {quote: 'Do something worth remembering.', author: 'Elvis Presley'},
  {
    quote:
      'At least with me, the match starts much, much earlier than the actual match.',
    author: 'Sachin Tendulkar'
  },
  {
    quote: "Sometimes it's only madness that makes us what we are.",
    author: 'Batman'
  },
  {
    quote:
      "It isn't the mountains ahead to climb that wear you out. It's the pebble in your shoe.",
    author: 'Muhammad Ali'
  },
  {
    quote: "I'm gonna make him an offer he cannot refuse.",
    author: 'Don Vito Corleone'
  },
  {
    quote:
      'In order to set an example you have to perform well, work hard and give your all. Show the younger lads so you can ask the same of them.',
    author: 'Sergio Ramos'
  },
  {
    quote: 'I will take what is mine with fire and blood.',
    author: 'Daenerys Targaryen'
  },
  {
    quote:
      'Do not judge me by my success. Judge me by how many times I fell down and got back up again.',
    author: 'Nelson Mandela'
  },
  {
    quote:
      'People will hate you, rate you, break you and shake you. But how strong you stand is what makes you.',
    author: 'Yuvraj Singh'
  }
]

export const getQuote = (index: number) => {
  if (index < quotes.length) return quotes[index]
  else {
    const quote = {
      quote: "Sometimes it's only madness that makes us what we are.",
      author: 'Batman'
    }
    return quote
  }
}
