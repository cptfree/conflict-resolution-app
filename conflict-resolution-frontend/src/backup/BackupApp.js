import React, { useState, useEffect, useRef } from 'react';
import { Scale, Handshake, FileText, X, Mic, Square, Play, MessageCircle, AlertCircle, Heart, ChevronDown, ChevronUp, Target, Ear } from 'lucide-react';
import { transcribeAudio, analyzeText } from './api';
import ProcessingStates from './ProcessingStates';  // Remove the curly braces
import './index.css';


// First part - Constants and NVCReferenceList component


const NVCReferenceList = ({ showNeeds = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const needs = {
    "Connection": [
      "acceptance", "appreciation", "belonging", "cooperation", "communication",
      "closeness", "community", "companionship", "compassion", "consideration",
      "consistency", "empathy", "inclusion", "intimacy", "love",
      "mutuality", "nurturing", "respect", "support", "trust", "understanding"
    ],
    "Physical Well-being": [
      "air", "food", "movement/exercise", "rest/sleep", "safety",
      "shelter", "touch", "water"
    ],
    "Honesty": [
      "authenticity", "integrity", "presence"
    ],
    "Play": [
      "joy", "humor", "fun"
    ],
    "Peace": [
      "beauty", "communion", "ease", "equality", "harmony", "inspiration",
      "order", "space"
    ],
    "Autonomy": [
      "choice", "freedom", "independence", "space", "spontaneity"
    ],
    "Meaning": [
      "awareness", "celebration", "challenge", "clarity", "competence",
      "consciousness", "contribution", "creativity", "discovery", "efficacy",
      "effectiveness", "growth", "hope", "learning", "mourning", "purpose",
      "self-expression", "stimulation", "understanding"
    ]
  };

  const feelings = {
    "Happy": [
      "amazed", "confident", "delighted", "eager", "energetic", "excited",
      "grateful", "inspired", "joyful", "optimistic", "proud", "relieved",
      "satisfied", "thankful", "trustful"
    ],
    "Peaceful": [
      "calm", "clear", "comfortable", "content", "relaxed", "rested",
      "secure", "serene", "tranquil"
    ],
    "Afraid": [
      "alarmed", "anxious", "concerned", "confused", "disturbed", "nervous",
      "scared", "shocked", "stressed", "surprised", "troubled", "uncomfortable",
      "worried"
    ],
    "Angry": [
      "aggravated", "annoyed", "bitter", "frustrated", "impatient", "irritated",
      "resentful", "upset"
    ],
    "Sad": [
      "discouraged", "disappointed", "distant", "exhausted", "hopeless",
      "lonely", "overwhelmed", "tired", "vulnerable"
    ],
    "Pain": [
      "agony", "anguished", "bereaved", "depressed", "despair", "grief",
      "heartbroken", "hurt", "regretful"
    ]
  };

  const data = showNeeds ? needs : feelings;
  const title = showNeeds ? "Common Needs" : "Common Feelings";
  const Icon = isOpen ? ChevronUp : ChevronDown;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
      >
        <Icon size={16} />
        <span>{isOpen ? "Hide" : "Show"} {title.toLowerCase()} list</span>
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-white rounded-lg border shadow-sm text-sm">
          <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <h5 className="font-medium text-gray-700">{category}</h5>
                <ul className="list-none pl-3 text-gray-600">
                  {items.map((item) => (
                    <li key={item} className="text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FrameworkSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const frameworks = [
    {
      id: 'Non-violent Communication',
      name: 'Nonviolent Communication',
      icon: <MessageCircle className="w-6 h-6" />,
      description: 'Best for emotional situations & relationship conflicts. Focus on needs & feelings.'
    },
    {
      id: 'Harvard',
      name: 'Harvard Negotiation',
      icon: <Handshake className="w-6 h-6" />,
      description: 'Best for business conflicts & formal negotiations. Focus on interests & options.'
    },
    {
      id: 'Solution-Focused',
      name: 'Solution-Focused',
      icon: <Target className="w-6 h-6" />,
      description: 'Best for practical issues. Focus on future solutions rather than past problems.'
    },
    {
      id: 'Active Listening',
      name: 'Active Listening',
      icon: <Ear className="w-6 h-6" />,
      description: 'Best for understanding different perspectives. Focus on reflection & validation.'
    }
  ];

  

  const handleSelect = (id) => {
    console.log('Framework selected:', id);  // Add debug log
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {frameworks.map((framework) => (
        <button
          key={framework.id}
          onClick={() => handleSelect(framework.id)}
          className={`p-4 rounded-lg border text-left transition-all ${
            selected === framework.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`${
              selected === framework.id ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {framework.icon}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{framework.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{framework.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Main App Component
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mode, setMode] = useState('voice');
  const [textInput, setTextInput] = useState('');
  const [showError, setShowError] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setShowError(false);
      chunksRef.current = [];
      setAudioUrl(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        bitsPerSecond: 16000
      });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordedText('Recording... (speak now)');
    } catch (err) {
      console.error('Recording Error:', err);
      setRecordedText('Error accessing microphone. Please check permissions.');
      setShowError(true);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    try {
      const mediaRecorder = mediaRecorderRef.current;
      
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          const audioFile = new File([audioBlob], 'audio.webm', { 
            type: 'audio/webm'
          });

          setRecordedText('Transcribing...');
          
          const { text: transcribedText } = await transcribeAudio(audioFile);
          const { analysis } = await analyzeText(transcribedText, 'mediation');

          setRecordedText(prev => `${prev}\n${new Date().toLocaleTimeString()}: ${transcribedText}\n\nAnalysis:\n${analysis}`);
        } catch (error) {
          console.error('Processing error:', error);
          setRecordedText(prev => `${prev}\nError: ${error.message}`);
          setShowError(true);
        }
        setIsProcessing(false);
      };

      setIsProcessing(true);
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Stop recording error:', err);
      setIsProcessing(false);
      setShowError(true);
    }
    setIsRecording(false);
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleLiveMediator = () => {
    setMode('voice');
    setShowError(false);
    setModalContent("Hi there. I'm your AI mediator, and I'm here to help you work through this situation using proven conflict resolution techniques. When you're ready, click the microphone and tell me what's going on.");
    setIsModalOpen(true);
  };

  const handleTextAnalysis = () => {
    setMode('text');
    setShowError(false);
    setModalContent('');
    setTextInput('');
    setIsModalOpen(true);
  };

  const handleNVCTranslation = () => {
    setMode('nvc');
    setShowError(false);
    setModalContent("Share your frustrated message or difficult situation, and I'll help translate it into Non-Violent Communication format while helping you understand the underlying feelings and needs.");
    setTextInput('');
    setIsModalOpen(true);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
  
    setIsProcessing(true);
    try {
      // Single consolidated debug log
      console.log('Submitting text with:', {
        framework: selectedFramework,
        text: textInput.substring(0, 50) + '...',
        mode
      });
     
      const { analysis } = await analyzeText(textInput, mode, selectedFramework);
     
      setRecordedText(prev =>
        `${prev}\n\nFramework: ${selectedFramework || 'none'}\n\nYour input:\n${textInput}\n\nAnalysis:\n${analysis}`
      );
    } catch (error) {
      console.error('Analysis error:', error);
      setRecordedText(prev => `${prev}\nError: ${error.message}`);
      setShowError(true);
    }
    setIsProcessing(false);
    setTextInput('');
  };

  const handleModeSwitch = () => {
    setMode(mode === 'voice' ? 'text' : 'voice');
    setShowError(false);
    setRecordedText('');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <Scale className="text-blue-600" size={48} />
          <Handshake className="text-purple-600 mx-4" size={48} />
          <FileText className="text-green-600" size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Resolve Conflicts Better
        </h1>
        
        <div className="space-y-6">
          <div>
            <button 
              onClick={handleLiveMediator}
              className="w-full bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <Mic size={24} />
              <span>Live AI Mediator</span>
            </button>
            <p className="text-sm text-gray-600 mt-2">Conflict unfolding? AI listens now - Mediates in text after</p>
          </div>
          
          <div>
            <button 
              onClick={handleTextAnalysis}
              className="w-full bg-purple-100 text-purple-800 py-4 rounded-xl hover:bg-purple-200 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <MessageCircle size={24} />
              <span>Conflict Resolution in Text</span>
            </button>
            <p className="text-sm text-gray-600 mt-2">Share your conflict and get guidance</p>
          </div>

          <div>
            <button 
              onClick={handleNVCTranslation}
              className="w-full bg-green-100 text-green-800 py-4 rounded-xl hover:bg-green-200 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <Heart size={24} />
              <span>NVC Message Translation</span>
            </button>
            <p className="text-sm text-gray-600 mt-2">Transform your message into non-violent communication</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Get unbiased support in resolving your conflicts
        </p>
        <p className="text-xs text-gray-500 mt-2">
          🔒 Your conversations are not stored and are processed securely
        </p>
      </div>


      {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl my-8 mx-auto relative">
      {/* Close button */}
      <button
        onClick={() => {
          setIsModalOpen(false);
          if (isRecording) stopRecording();
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X size={24} />
      </button>

      {/* Modal content */}
      <div className="p-6">
        {modalContent && (
          <div className="mb-4">
            <p className="text-gray-800">{modalContent}</p>
          </div>
        )}
        
        {/* Rest of your modal content */}
      </div>
    </div>
  </div>
)}
            <div className="mt-2">
              {mode === 'voice' ? (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-4">
                    Tips:
                    <ul className="list-disc text-left pl-5 mt-1">
                      <li>Speak clearly and at a normal pace</li>
                      <li>Keep microphone close</li>
                      <li>Test your mic before sharing sensitive information</li>
                    </ul>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-4 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white hover:opacity-90 transition-all`}
                      disabled={isProcessing}
                    >
                      {isRecording ? <Square size={24} /> : <Mic size={24} />}
                    </button>
                    {audioUrl && !isRecording && (
                      <button
                        onClick={playRecording}
                        className="p-4 rounded-full bg-green-500 text-white hover:opacity-90 transition-all"
                      >
                        <Play size={24} />
                      </button>
                    )}
                  </div>
                  {isRecording && (
                    <div className="mt-2 text-sm font-medium text-gray-600">
                      Recording: {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {mode === 'nvc' && (
                    <div className="mb-4">
                      <NVCReferenceList showNeeds={true} />
                      <NVCReferenceList showNeeds={false} />
                      <div className="mt-2 text-xs text-gray-500">
                        Tip: Use these lists to help identify your needs and feelings more precisely
                      </div>
                    </div>
                  )}
                  {mode === 'text' && (
                    <FrameworkSelector onSelect={(framework) => setSelectedFramework(framework)} />
                  )}
                  <div className="text-sm text-gray-600 mb-2">
                    {mode === 'nvc' ? (
                      <>
                        Share your message:
                        <ul className="list-disc text-left pl-5 mt-1">
                          <li>Express what's frustrating you</li>
                          <li>Share how you're feeling</li>
                          <li>What would you like to see happen?</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        Share:
                        <ul className="list-disc text-left pl-5 mt-1">
                          <li>What's the situation?</li>
                          <li>How do you and others feel about it?</li>
                          <li>What would an ideal resolution look like?</li>
                        </ul>
                      </>
                    )}
                  </div>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={mode === 'nvc' 
                      ? "Example: 'My coworker always dumps their work on me at the last minute! They're so inconsiderate!'"
                      : "Describe the situation here..."
                    }
                    className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={isProcessing || !textInput.trim()}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isProcessing ? 'Analyzing...' : mode === 'nvc' ? 'Translate to NVC' : 'Get Analysis'}
                  </button>
                </div>
              )}
<ProcessingStates
  isProcessing = {isProcessing}
  error = {showError ? "Something went wrong processing your request" : null}
  processingMessage = {
    mode === 'voice' 
      ? "Transcribing audio..." 
      : mode === 'nvc'
        ? "Translating to NVC..."
        : "Analyzing your message..."
  }
/>
<div className="mt-4 space-y-4">
  {textInput && (
    <div className="bg-gray-50 p-4 rounded-lg text-left border">
      <h3 className="font-medium text-gray-700 mb-2">Your Situation:</h3>
      <div className="whitespace-pre-wrap text-gray-600">
        {textInput}
      </div>
    </div>
  )}
  
  <div className="bg-gray-50 p-4 rounded-lg text-left border">
    <h3 className="font-medium text-blue-700 text-lg mb-3">
      {mode === 'voice' 
        ? 'Analysis & Suggestions:' 
        : mode === 'nvc' 
          ? 'NVC Translation & Insights:'
          : 'Conflict Resolution Analysis:'}
    </h3>
    <div className="prose prose-sm max-w-none">
      {recordedText && recordedText.split('\n').map((line, i) => {
        if (line.startsWith('###')) {
          return <h4 key={i} className="font-bold text-gray-800 mt-4 mb-2">{line.replace('###', '')}</h4>;
        }
        return <p key={i} className="my-2">{line}</p>;
      })}
      {!recordedText && `No ${mode === 'voice' ? 'transcription' : 'analysis'} yet...`}
    </div>
  </div>
</div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              {mode === 'voice' && (
                <button
                  onClick={handleModeSwitch}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Switch to text mode
                </button>
              )}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (isRecording) stopRecording();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;