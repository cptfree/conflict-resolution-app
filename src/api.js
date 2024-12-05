const API_URL = process.env.REACT_APP_API_URL + '/api';

export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('audioFile', audioFile);
 
  const response = await fetch(`${API_URL}/transcribe`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};

export const analyzeText = async (text, mode, selectedFramework = null) => {
  console.log('Frontend sending:', { text, mode, selectedFramework });
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      mode,
      framework: selectedFramework
    })
  });
  return response.json();
};