// Test change
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const path = require('path');

const HARVARD_PROMPT = `As an expert mediator using the Harvard Negotiation Framework, analyze this workplace conflict:
"{{text}}"
Provide a detailed analysis structured as follows:
1. SITUATION ANALYSIS
- Separate relationship issues from task/project issues
- Identify specific behaviors and their impact on the project
- Analyze communication patterns and breakdowns
2. UNDERLYING INTERESTS
- Your interests (both stated and unstated)
- Coworker's possible interests and concerns
- Shared interests and project goals
3. SOLUTION OPTIONS (provide at least 3 specific solutions)
- Quick wins for immediate improvement
- Medium-term structural changes
- Long-term relationship building opportunities
4. CONCRETE ACTION PLAN
- Specific phrases you can use in your next conversation
- Clear steps with timing (today, this week, next week)
- Ways to measure improvement
Be specific, practical, and provide real examples for each suggestion.`;

const NVC_PROMPT = `You must analyze this using ONLY Nonviolent Communication (NVC). For the input: "{{text}}"

Your response MUST use these EXACT headers and format:

### OBSERVATIONS
List only observable facts without any judgment or evaluation:
[List specific behaviors and events]

### FEELINGS
List the specific emotions being expressed (use only feeling words):
- Your feelings: [list emotions like angry, hurt, frustrated, etc.]
- Possible feelings of others: [list potential emotions]

### NEEDS
List the specific universal human needs at play:
- Your needs: [list specific needs like support, cooperation, understanding]
- Others' possible needs: [list potential needs]

### REQUESTS
Specific, doable actions that could help meet the needs:
[List 1-2 clear requests starting with "Would you be willing to..."]

### NVC EXPRESSION
Put it all together:
"When I observe [specific behavior], I feel [emotion] because my need for [need] is not being met. Would you be willing to [specific request]?"

Do not deviate from this format. Each section must be present and clearly labeled.`;

const SOLUTION_FOCUSED_PROMPT = `Using ONLY Solution-Focused techniques, analyze this situation:
"{{text}}"

YOUR RESPONSE MUST USE THESE EXACT HEADERS:

### PREFERRED FUTURE
- What does the person want instead of the current problem?
- What would be different when the problem is solved?
- Paint a clear picture of the desired outcome

### EXCEPTIONS
- When does the problem happen less or not at all?
- What's already working, even a little bit?
- What strategies have been helpful in the past?

### SCALING
Rate the current situation from 1-10:
- Where is the situation now?
- What's preventing it from being one point lower?
- What small signs would show movement to the next point up?

### NEXT STEPS
List 2-3 specific, small actions that could:
- Build on what's already working
- Move toward the preferred future
- Create positive momentum

Remember to:
- Focus on solutions, not problems
- Look for existing resources and strengths
- Keep steps small and achievable`;

const ACTIVE_LISTENING_PROMPT = `Analyze this situation using ONLY Active Listening techniques:
"{{text}}"

YOUR RESPONSE MUST USE THESE EXACT HEADERS:

### REFLECTION
- Mirror back the key content expressed
- Capture both facts and emotions
- Use phrases like "I hear that..." or "What I'm understanding is..."

### EMOTIONS IDENTIFIED
- What feelings are being expressed?
- What emotions might be underlying the words?
- Note both obvious and subtle emotional cues

### VALIDATION
- Acknowledge the person's experience
- Show understanding of their perspective
- Use phrases like "It makes sense that..." or "It's understandable..."

### CLARIFYING QUESTIONS
List 2-3 open-ended questions to:
- Deepen understanding
- Explore underlying concerns
- Help the speaker feel fully heard

### SUMMARY
- Synthesize the main points
- Connect emotional and factual content
- Check understanding with the speaker`;

const systemPrompts = {
  mediation: `You are a supportive mediator using proven conflict resolution techniques. Focus on:
1. Understanding feelings and needs of all parties without judgment
2. Identifying shared interests rather than fixed positions
3. Suggesting specific, actionable steps for moving forward
Keep responses clear and concise. Structure your response in three parts:
- What you hear each party needs
- Common ground/shared interests
- 2-3 specific suggestions for next steps`,
  'Non-violent Communication': NVC_PROMPT,
  'Harvard': HARVARD_PROMPT,
  'Solution-Focused': SOLUTION_FOCUSED_PROMPT,
  'Active Listening': ACTIVE_LISTENING_PROMPT
};

dotenv.config();

const app = express();

// Replace CORS middleware with direct headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://conflict-resolution-app-frontend.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.options('/api/analyze', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://conflict-resolution-app-frontend.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});



app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/transcribe', upload.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const tempFilePath = path.join(__dirname, 'temp.webm');
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    fs.unlinkSync(tempFilePath);
    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { text, mode, framework } = req.body;
    
    // Log what we received
    console.log('Received request:', { text, mode, framework });
    
    let systemPrompt;
    if (framework) {
      systemPrompt = systemPrompts[framework].replace('{{text}}', text);
    } else {
      systemPrompt = systemPrompts[mode === 'text' ? 'mediation' : mode];
    }

    if (!systemPrompt) {
      systemPrompt = systemPrompts.mediation;
    }

    console.log('Using system prompt:', systemPrompt.substring(0, 100) + '...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: text }
      ]
    });
    res.json({ analysis: completion.choices[0].message.content });
  } catch (error) {
    // Log the full error
    console.error('Full error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));