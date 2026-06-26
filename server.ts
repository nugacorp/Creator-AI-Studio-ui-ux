import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    // Check for missing or placeholder API key
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY_MISSING');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Chat Copilot Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    try {
      const ai = getAIClient();
      
      // We can use a single generateContent call with a structured prompt
      const systemInstruction = 
        `Eres el Copiloto de Creator AI Studio (Creator OS), un sistema operativo inteligente para creadores de contenido profesionales.\n` +
        `Te comunicas con Ramiro, director de canales digitales.\n` +
        `Habla con un tono profesional, inspirador, directo y amigable (sin rodeos innecesarios ni emojis exagerados).\n` +
        `Ayúdalo a diseñar guiones, proponer ganchos de retención, proponer títulos clickbait saludables, planificar calendarios o explicar estadísticas de forma detallada.\n` +
        `Si te pide crear un video completo, responde estructurando el Guion, Escenas, y SEO.`;

      // Build context from history
      let promptText = "";
      if (history && history.length > 0) {
        promptText += "Historial de conversación:\n";
        history.forEach((h: { role: string; text: string }) => {
          promptText += `${h.role === 'user' ? 'Ramiro' : 'Copiloto'}: ${h.text}\n`;
        });
      }
      promptText += `\nNueva consulta de Ramiro:\n${message}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: { systemInstruction },
      });

      res.json({ text: response.text });
    } catch (sdkError: any) {
      console.warn("Using fallback for Chat due to SDK/Key limitation:", sdkError.message);
      
      // High-quality contextual fallback
      let fallbackText = '';
      const msgLower = message.toLowerCase();
      
      if (msgLower.includes('mateo 5') || msgLower.includes('mateo')) {
        fallbackText = 
          `¡Excelente elección, Ramiro! El Sermón del Monte (Mateo 5) es uno de los pasajes más profundos y visualmente ricos de las Escrituras. He creado un borrador inicial de proyecto:\n\n` +
          `**Título Propuesto:** "La Fórmula Secreta de la Felicidad según Jesús (Mateo 5)"\n` +
          `**Estructura del Guion:**\n` +
          `1. **La Paradoja del Reino (Gancho):** ¿Por qué Jesús dice que los que sufren son dichosos? Rompe el esquema mental del espectador.\n` +
          `2. **Las Bienaventuranzas (Desarrollo):** Desglose de los 9 principios de felicidad divina con ejemplos modernos.\n` +
          `3. **La Sal y la Luz (Llamado a la Acción):** Explicación práctica de cómo ser agentes de cambio hoy.\n\n` +
          `¿Quieres que generemos la voz en off para este guion o prefieres que configuremos las escenas visuales primero?`;
      } else if (msgLower.includes('ansiedad') || msgLower.includes('preocupación')) {
        fallbackText = 
          `Entendido, Ramiro. El tema de la ansiedad resuena profundamente hoy en día. Te sugiero enfocar la reflexión en Filipenses 4:6-7, mostrando que la paz es una decisión de entrega diaria.\n\n` +
          `Podríamos usar una voz cálida como **Kore** o **Zephyr** con música acústica suave de fondo para mantener un tono de paz profunda. ¿Procedemos a generar el guion completo?`;
      } else {
        fallbackText = 
          `Hola Ramiro. Qué gran día para producir contenido de alto impacto. He analizado tus canales y veo que tu serie de "Historias Bíblicas" es la que tiene mayor retención esta semana.\n\n` +
          `¿Trabajamos en el guion de "La historia de Moisés" para finalizarlo hoy, o prefieres que programemos los Shorts pendientes en el calendario? Dime qué necesitas y lo automatizo de inmediato.`;
      }
      
      res.json({ 
        text: fallbackText, 
        isDemo: true,
        warning: sdkError.message === 'GEMINI_API_KEY_MISSING' ? 'Key missing' : 'API error'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Rewrite Script Endpoint (Notion AI rewrite suggestions)
app.post('/api/gemini/rewrite', async (req, res) => {
  try {
    const { script, instruction } = req.body;
    
    try {
      const ai = getAIClient();
      const prompt = `Aquí está el guion original:\n\n"${script}"\n\nPor favor, reescribe este guion aplicando rigurosamente esta instrucción de estilo: "${instruction}". Mantén la esencia y referencias bíblicas si las hay, pero cambia el tono, la duración o el gancho según lo solicitado de manera impactante.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      
      res.json({ text: response.text });
    } catch (sdkError: any) {
      console.warn("Using fallback for Rewrite due to:", sdkError.message);
      
      // Fallback rewrites based on action
      let rewrittenText = script;
      if (instruction.includes('emocional')) {
        rewrittenText = `[Versión Emocional]\n\n¿Alguna vez has sentido que el viento de la vida sopla tan fuerte que amenaza con apagar tu fe? Cierra los ojos por un instante. Siente el latido de tu corazón. Dios te conoce. Él te vio cuando llorabas en silencio anoche, cuando la ansiedad oprimía tu pecho. Y hoy, con una ternura infinita, te dice: 'No temas, yo estoy contigo'. No estás solo en esta tormenta. Él sostiene tu mano derecha y calma las olas más embravecidas. Respira... descansa en su infinito amor.`;
      } else if (instruction.includes('duración')) {
        rewrittenText = `[Versión Corta / Shorts]\n\n¿Abatido por la ansiedad? La Biblia te da la salida en Filipenses 4:6. No te afanes por nada. Lleva tus cargas a Dios en oración y agradece de antemano. Jesús lo demostró mirando a las aves y los lirios: el Padre los cuida, y tú vales mucho más. Echa tu ansiedad sobre Él hoy, porque Él tiene cuidado de ti. ¡Comparte con alguien que necesite oír esto!`;
      } else if (instruction.includes('bíblicas')) {
        rewrittenText = script + `\n\nComo bien nos recuerda el Salmo 34:4: "Busqué a Jehová, y él me oyó, y me libró de todos mis temores." Y también Josué 1:9 que nos insta: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas."`;
      } else if (instruction.includes('CTA')) {
        rewrittenText = script + `\n\nSi este mensaje tocó tu corazón, no te vayas sin suscribirte al canal. Dale un 'Me Gusta' para que este mensaje de esperanza llegue a miles de personas que lo necesitan, y escribe en los comentarios: 'Confío en tu paz, Señor'. ¡Que Dios te bendiga abundantemente!`;
      } else {
        rewrittenText = `[Versión Modificada - ${instruction}]\n\n` + script;
      }
      
      res.json({ 
        text: rewrittenText, 
        isDemo: true 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Generate Script (Prompt Builder) Endpoint
app.post('/api/gemini/generate-script', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    
    try {
      const ai = getAIClient();
      const systemInstruction = 
        `Eres un guionista estrella de YouTube y TikTok especializado en el nicho de ${options.theme || 'Cristianismo'}.\n` +
        `Escribe un guion completo y estructurado con gancho de entrada, desarrollo dinámico y un poderoso llamado a la acción (CTA).\n` +
        `Añade sugerencias de imágenes/escenas entre corchetes para guiar al editor.\n` +
        `Tono: ${options.style || 'Narrativo'}. Emoción: ${options.emotion || 'Esperanza'}. Duración estimada: ${options.duration || '5 minutos'}. Audiencia objetivo: ${options.audience || 'Adultos'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Escribe un guion sobre: ${prompt}. El objetivo del video es: ${options.objective || 'Reflexionar'}.`,
        config: { systemInstruction },
      });
      
      res.json({ text: response.text });
    } catch (sdkError: any) {
      console.warn("Using fallback for Generate Script due to:", sdkError.message);
      
      // High-quality fallback guion
      const demoScript = 
        `[ESCENA 1 - Imagen cinematográfica de un amanecer dorado sobre las montañas. Música de piano suave.]\n` +
        `Narrador: Bienvenido a una nueva reflexión. Hoy nos sumergiremos en un viaje de fe inspirado en tu propuesta: "${prompt}".\n\n` +
        `[ESCENA 2 - Un primer plano de manos pasando las páginas de un libro antiguo. Luz tenue.]\n` +
        `Narrador: El objetivo de hoy es ${options.objective || 'Reflexionar'}. Queremos hablarle al corazón de todos los ${options.audience || 'Adultos'}, trayendo un mensaje lleno de ${options.emotion || 'Esperanza'}.\n\n` +
        `[ESCENA 3 - Persona sonriendo, mirando al cielo con gratitud.]\n` +
        `Narrador: En Mateo 6 se nos recuerda la soberanía del Creador. Si Él cuida de los detalles más pequeños del universo, ten la seguridad de que tiene tu vida en la palma de sus manos.\n\n` +
        `[ESCENA 4 - Texto animado en pantalla invitando a suscribirse. Música instrumental estimulante.]\n` +
        `Narrador: Gracias por acompañarnos en esta serie de ${options.theme || 'Cristianismo'}. Suscríbete para no perderte el próximo video y comparte este mensaje de bendición.`;

      res.json({ 
        text: demoScript, 
        isDemo: true 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Image Generation Endpoint
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio, imageSize } = req.body;
    
    try {
      const ai = getAIClient();
      
      // We will generate the image using the recommended gemini-3.1-flash-image
      // or gemini-2.5-flash-image based on the instructions
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
            imageSize: imageSize || '1K'
          }
        }
      });

      let base64Image = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }

      if (base64Image) {
        res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
      } else {
        throw new Error("No image data returned from model");
      }
    } catch (sdkError: any) {
      console.warn("Using fallback for Image due to:", sdkError.message);
      
      // Fallback with visual search queries using high-quality Unsplash source
      const query = encodeURIComponent(prompt.substring(0, 50) || 'christian aesthetic');
      const randomSeed = Math.floor(Math.random() * 1000);
      const aspectWidth = aspectRatio === '16:9' ? 800 : aspectRatio === '9:16' ? 450 : 600;
      const aspectHeight = aspectRatio === '16:9' ? 450 : aspectRatio === '9:16' ? 800 : 600;
      
      const fallbackUrl = `https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=${aspectWidth}&h=${aspectHeight}&sig=${randomSeed}`;
      
      res.json({ 
        imageUrl: fallbackUrl,
        isDemo: true 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Text to Speech Endpoint (using gemini-3.1-flash-tts-preview)
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    try {
      const ai = getAIClient();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say with depth: ${text.substring(0, 300)}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        throw new Error("No audio returned from model");
      }
    } catch (sdkError: any) {
      console.warn("Using fallback for TTS due to:", sdkError.message);
      
      // Return a simulated high-quality speech or link (we can provide a client-side Web Speech API backup too)
      res.json({ 
        isDemo: true,
        text: text
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. SEO Optimizer Endpoint
app.post('/api/gemini/seo', async (req, res) => {
  try {
    const { title, script } = req.body;
    
    try {
      const ai = getAIClient();
      const promptText = `Genera 3 alternativas de títulos altamente atractivos y clickbait saludable (optimizado para CTR), una descripción detallada con hashtags y timestamps sugeridos, y 15 palabras clave/tags para este video. Título actual: "${title}". Guion:\n\n${script}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titles: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              description: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["titles", "description", "tags"]
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (sdkError: any) {
      console.warn("Using fallback for SEO due to:", sdkError.message);
      
      const cleanTitle = title || "La historia de Moisés";
      const fallbackSEO = {
        titles: [
          `¿Por qué DIOS eligió a ${cleanTitle.toUpperCase()}? (Reflexión Cristiana)`,
          `El Secreto Escondido en "${cleanTitle}" que pocos conocen`,
          `${cleanTitle} | Una Lección de Fe que Cambiará Tu Vida Hoy`
        ],
        description: `¿Estás listo para sumergirte en "${cleanTitle}"? En este video exploramos las lecciones espirituales más profundas y prácticas para tu vida diaria.\n\n⏱️ Marcas de tiempo:\n0:00 Introducción y Contexto\n1:45 El Secreto de la Fe\n4:30 Lección Práctica\n8:15 Reflexión y Cierre\n\n#Fe #Biblia #Cristianismo #Reflexión`,
        tags: [cleanTitle.toLowerCase(), 'cristianismo', 'fe', 'reflexion de vida', 'dios', 'biblia', 'oracion', 'fe en dios', 'devocional', 'mensaje cristiano']
      };
      
      res.json({ ...fallbackSEO, isDemo: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Explainer Analytics Endpoint
app.post('/api/gemini/explain-analytics', async (req, res) => {
  try {
    const { metrics } = req.body;
    
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analiza estas métricas del canal: ${JSON.stringify(metrics)}. Explica por qué cayó el CTR al final de la semana, proporciona un análisis de retención claro y sugiere acciones prácticas de inmediato. Manténlo conciso y directo para Ramiro.`,
      });
      
      res.json({ text: response.text });
    } catch (sdkError: any) {
      console.warn("Using fallback for Analytics Explainer due to:", sdkError.message);
      
      const fallbackExplanation = 
        `Hola Ramiro, aquí tienes mi análisis de la semana:\n\n` +
        `📉 **Alerta de CTR (Cayó al 4.1% el Domingo):** Tu CTR general experimentó un descenso del 2%. Al revisar tu última publicación, notamos que la miniatura tiene demasiado texto y baja luminosidad. Te sugiero usar el botón **"Remover Fondo"** de nuestro editor en la miniatura y aplicar un contorno dorado (Glow) para que resalte en el feed oscuro.\n\n` +
        `📈 **Retención de Audiencia:** El video "¿Qué dice la Biblia sobre la ansiedad?" mantiene un increíble 65% de retención en los primeros 30 segundos, gracias al gancho dramático del piano acústico. Sin embargo, decae a partir de la marca de los 5 minutos.\n\n` +
        `💡 **Acción recomendada para Moisés:** Para el guion en desarrollo de Moisés, dividamos el capítulo 2 en dos partes cortas para mantener el dinamismo y evitar la pérdida de retención a mitad del video.`;
        
      res.json({ text: fallbackExplanation, isDemo: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware & Static Files integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Creator OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
