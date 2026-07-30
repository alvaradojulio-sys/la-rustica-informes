// Función serverless de Vercel — /api/generate-informe
// Usa Mistral 7B de Hugging Face (open source, gratis)
// API key de Hugging Face vive acá (variable de entorno en Vercel), nunca en el navegador.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar HUGGINGFACE_API_KEY en las variables de entorno de Vercel.' });
  }

  const { transcript, fecha, hora, geo, clinic } = req.body || {};
  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Falta la transcripción de la visita.' });
  }

  const geoLine = geo ? `Ubicación GPS: ${geo.lat}, ${geo.lon}` : 'Ubicación GPS: no disponible';

  const systemPrompt = `Sos un asistente que ayuda a un veterinario/responsable de campo de "La Rústica" en Paraguay a convertir una nota de voz informal en un informe profesional para enviar a su cliente.
Recibís la transcripción cruda de lo que dijo (puede tener errores de dictado, muletillas o desorden).
Devolvé SOLO un objeto JSON válido, sin texto adicional, sin backticks ni markdown, con esta forma exacta:
{"cliente": "nombre del cliente o establecimiento mencionado (si no está claro, poné 'Cliente sin identificar')", "motivo": "resumen de una línea del motivo de la visita", "informe": "informe completo, redactado en español formal pero claro, listo para enviar al cliente"}

El campo "informe" debe incluir: fecha de la visita, animales o hacienda atendidos, hallazgos/diagnóstico, tratamiento realizado, indicaciones o recomendaciones, y próximos pasos. Redactalo en párrafos cortos y prolijos, en primera persona de quien visitó el campo, sin inventar datos que no estén en la nota.`;

  const prompt = `${systemPrompt}

Fecha de la visita: ${fecha}
Hora: ${hora}
${geoLine}
${clinic ? 'Responsable: ' + clinic : ''}

Transcripción de la nota de voz:
"""${transcript}"""`;

  try {
    const resp = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 1000 }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: `Hugging Face API respondió ${resp.status}: ${errText.slice(0, 300)}` });
    }

    const data = await resp.json();
    const generated = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    if (!generated) return res.status(502).json({ error: 'La respuesta no tuvo contenido.' });

    // Extraer JSON de la respuesta (el modelo puede devolver texto adicional)
    const jsonMatch = generated.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(502).json({ error: 'No se pudo extraer JSON válido de la respuesta.' });

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error inesperado generando el informe.' });
  }
}
