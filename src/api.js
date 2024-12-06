// src/api.js

const API_URL = process.env.REACT_APP_API_URL;

// Add a check to warn if API_URL is not set
if (!API_URL) {
  console.warn('API_URL is not set! Please check environment variables.');
}

export const transcribeAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    
    console.log('Transcription request:', {
      url: `${API_URL}/transcribe`,
      fileSize: audioFile.size,
      fileType: audioFile.type
    });
    
    const response = await fetch(`${API_URL}/transcribe`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error('Transcription response error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Transcription failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Transcription successful');
    return data;
  } catch (error) {
    console.error('Transcription error:', {
      message: error.message,
      url: `${API_URL}/transcribe`,
      stack: error.stack
    });
    throw error;
  }
};

export const analyzeText = async (text, mode, selectedFramework = null) => {
  try {
    const payload = {
      text,
      mode,
      framework: selectedFramework
    };

    console.log('Analysis request:', {
      url: `${API_URL}/analyze`,
      payload
    });
    
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error('Analysis response error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Analysis successful');
    return data;
  } catch (error) {
    console.error('Analysis error:', {
      message: error.message,
      url: `${API_URL}/analyze`,
      stack: error.stack
    });
    throw error;
  }
};