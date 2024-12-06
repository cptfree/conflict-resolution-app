// src/api.js

const API_URL = process.env.REACT_APP_API_URL;

// Validate that the environment variable is set correctly
if (!API_URL) {
  console.error('API_URL environment variable is not set');
}

export const analyzeText = async (text, mode, selectedFramework = null) => {
  try {
    const payload = {
      text,
      mode,
      framework: selectedFramework
    };

    console.log('Making analysis request:', {
      url: `${API_URL}/api/analyze`,
      payload
    });

    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Logging the response status and headers for debugging
    console.log('POST request details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      throw new Error(`Analysis failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Analysis successful:', data);
    return data;
  } catch (error) {
    console.error('Analysis error:', {
      message: error.message,
      status: error.status,
      statusText: error?.statusText,
      url: `${API_URL}/api/analyze`,
      stack: error.stack
    });
    throw error;
  }
};

export const transcribeAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    
    console.log('Transcription request:', {
      url: `${API_URL}/api/transcribe`,
      fileSize: audioFile.size,
      fileType: audioFile.type
    });
    
    const response = await fetch(`${API_URL}/api/transcribe`, {
      method: 'POST',
      body: formData
    });

    console.log('Transcribe response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      throw new Error(`Transcription failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Transcription successful:', data);
    return data;
  } catch (error) {
    console.error('Transcription error:', {
      message: error.message,
      status: error.status,
      url: `${API_URL}/api/transcribe`,
      stack: error.stack
    });
    throw error;
  }
};
