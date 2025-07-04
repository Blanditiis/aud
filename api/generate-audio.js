const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { text, voiceId, velocidade, estilo, estabilidade, similaridade, speakerBoost } = req.body;

        if (!text || !voiceId) {
            return res.status(400).json({ message: 'Texto e ID da voz são obrigatórios.' });
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?allow_unauthenticated=1`;
        const headers = {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json'
        };

        const data = {
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                speed: velocidade,
                style: estilo,
                stability: estabilidade,
                similarity_boost: similaridade,
                use_speaker_boost: speakerBoost
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorResponse = await response.text(); // Get raw response
                console.error('Eleven Labs API Error Status:', response.status);
                console.error('Eleven Labs API Raw Error Response:', errorResponse);
                try {
                    const errorJson = JSON.parse(errorResponse);
                    return res.status(response.status).json({ message: `Erro da API Eleven Labs: ${response.statusText}`, details: errorJson });
                } catch (parseError) {
                    return res.status(response.status).json({ message: `Erro da API Eleven Labs: ${response.statusText}`, details: errorResponse });
                }
            }

            const audioBuffer = await response.buffer();
            res.setHeader('Content-Type', 'audio/mpeg');
            res.status(200).send(audioBuffer);

        } catch (error) {
            console.error('Erro na requisição para Eleven Labs:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao gerar áudio.', details: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido.' });
    }
};