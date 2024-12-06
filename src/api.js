// src/api.js

const API_URL = process.env.REACT_APP_API_URL;

// Since REACT_APP_API_URL already includes '/api', we just need to add the endpoint
const getEndpointUrl = (endpoint) => {
  // Remove any trailing slash from API_URL
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  // Remove any leading slash from endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const transcribeAudio = async (audioFile) => {
  try {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    
    const url = getEndpointUrl('transcribe');
    console.log('Transcription request:', {
      url,
      fileSize: audioFile.size,
      fileType: audioFile.type
    });
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData
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

    const url = getEndpointUrl('analyze');
    console.log('Analysis request:', {
      url,
      payload
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
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
      stack: error.stack
    });
    throw error;
  }
};