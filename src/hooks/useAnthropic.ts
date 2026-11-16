import { Anthropic } from "@anthropic-ai/sdk";

const data = JSON.stringify({
  "data": {
    "general": [
      {
        "uuid": "15285146-b4ed-4aee-a784-eaa1f87601de",
        "title": "WATCH: Cowboys, 49ers Fans Brawl in Stadium Bar",
        "description": "Viewers could be forgiven for thinking that the 49ers were playing a home game on Sunday.",
        "keywords": "",
        "snippet": "Those watching on television could be forgiven for thinking...",
        "url": "https://www.breitbart.com/sports/2026/11/15/watch-cowboys-49ers-fans-brawl-in-stadium-bar/",
        "image_url": "https://media.breitbart.com/media/2026/11/Robin-Alam_Icon-Sportswire-via-Getty-Images-1-640x335.jpg",
        "language": "en",
        "published_at": "2026-11-16T04:13:32.000000Z",
        "source": "breitbart.com",
        "categories": ["general", "politics"],
        "locale": "us"
      }
    ]
  }
});

export function useAnthropic() {
  const client = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true
  });

  (async function () {
    const message = await client.messages.create({
      max_tokens: 1024,
      messages: [{ role: "user", content: `Are you able to give me a summary of the following data? ${data}.` }],
      model: "claude-haiku-5-5"
    })

    for (const block of message.content) {
      if (block.type === "text") {
        console.log(block.text);
      }
    }
  })();
}
