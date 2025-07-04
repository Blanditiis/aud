export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { text, voiceId, speed, style, stability, similarityBoost, useSpeakerBoost } = req.body;

        if (!text || !voiceId) {
            return res.status(400).json({ error: 'Texto e ID da voz são obrigatórios' });
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?allow_unauthenticated=1`;

        const voiceSettings = {
            speed: speed || 1.1,
            style: style || 0.5,
            stability: stability || 0.5,
            similarity_boost: similarityBoost || 0.75,
            use_speaker_boost: useSpeakerBoost !== undefined ? useSpeakerBoost : true
        };

        const requestData = {
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: voiceSettings
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na API:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `Erro na API: ${response.status}`,
                details: errorText
            });
        }

        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
        
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('Erro interno:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
}