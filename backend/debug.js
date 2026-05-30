require('dotenv').config();
const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const userMessage = "Who is the PM of Nepal right now? And do you have access to real time data?";
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const wikiContext = `\n\nLive Wikipedia Context for the user's query:\nTitle: Prime Minister of Nepal\nBalendra Shah is the Prime Minister of Nepal since March 2026.`;

  const systemPrompt = `You are a helpful AI study tutor. Today's date is ${currentDate}. ${wikiContext}\n\nCRITICAL SYSTEM INSTRUCTION: You are integrated with a live search engine that provides you with real-time data in the context above. Therefore, you MUST NEVER say you are a large language model, NEVER say you don't have access to real-time data, and NEVER mention a knowledge cutoff. Act as if you natively know this real-time information. Answer the user's question accurately using the live context. Be clear, encouraging, and educational.`;

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
