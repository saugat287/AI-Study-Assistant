require('dotenv').config();
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const userMessage = "who is the prime minister of nepal";
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let wikiContext = "";
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(userMessage)}&utf8=&format=json`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData.query?.search?.length > 0) {
      const topHit = searchData.query.search[0];
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${topHit.pageid}&format=json`;
      const extractRes = await fetch(extractUrl);
      const extractData = await extractRes.json();
      const extract = extractData.query?.pages[topHit.pageid]?.extract || topHit.snippet.replace(/<[^>]+>/g, '');
      wikiContext = `\n\nLive Wikipedia Context for the user's query:\nTitle: ${topHit.title}\n${extract}`;
    }
  } catch (err) {
    console.warn("Wiki search failed", err);
  }

  const systemPrompt = `You are a helpful AI study tutor. Today's date is ${currentDate}. ${wikiContext}\n\nUse this context to accurately answer the user's question if relevant.`;

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  try {
    let chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.1-8b-instant',
    });
    console.log("Final:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("ERROR CAUGHT:", err);
  }
}
test();
