const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { text, voiceId, velocidade, estilo, estabilidade, similaridade, speakerBoost } = req.body;

        if (!text || !voiceId) {
            return res.status(400).json({ message: 'Texto e ID da voz são obrigatórios.' });
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const headers = {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY // A chave da API deve ser definida como uma variável de ambiente na Vercel
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
                const errorText = await response.text();
                console.error('Eleven Labs API Error:', errorText);
                return res.status(response.status).json({ message: `Erro da API Eleven Labs: ${response.statusText}`, details: errorText });
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