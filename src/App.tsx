import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import nlp from 'compromise'; // Import Compromise.js

const MeetingAssistantApp = () => {
  const [transcript, setTranscript] = useState('');
  const [contextData, setContextData] = useState({ phrases: [] });
  const [isRecording, setIsRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = React.useRef(null);

  // Function to extract interesting phrases using Compromise.js
  const extractInterestingPhrases = (text) => {
    const doc = nlp(text);
    // Extract nouns and noun phrases
    const phrases = doc.nouns().out('array');
    return phrases;
  };

  // Function to rank phrases by frequency and keep only the top 10
  const getTopPhrases = (phrases) => {
    const phraseFrequency = {};

    // Count frequency of each phrase
    phrases.forEach((phrase) => {
      phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
    });

    // Convert to an array of { phrase, frequency } objects
    const phraseArray = Object.keys(phraseFrequency).map((phrase) => ({
      phrase,
      frequency: phraseFrequency[phrase],
    }));

    // Sort by frequency (descending)
    phraseArray.sort((a, b) => b.frequency - a.frequency);

    // Keep only the top 10 phrases
    const topPhrases = phraseArray.slice(0, 10).map((item) => item.phrase);

    return topPhrases;
  };

  // Start the transcription
  const startTranscription = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const interimTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        recognition.start();
        setIsRecording(true);
        recognitionRef.current = recognition;
        setError(null); // Clear any previous errors
      })
      .catch((err) => {
        setError('Microphone access denied. Please allow microphone access to use this app.');
        console.error('Microphone access error:', err);
      });
  };

  // Stop the transcription
  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Save transcript and phrases to a file
  const saveTranscript = () => {
    const content = `Transcript:\n${transcript}\n\nInteresting Phrases:\n${contextData.phrases.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meeting_transcript.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Update context whenever transcript changes
  useEffect(() => {
    const phrases = extractInterestingPhrases(transcript);
    const topPhrases = getTopPhrases(phrases);
    setContextData({ phrases: topPhrases });
  }, [transcript]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Dynamic styles for dark mode
  const appStyles = {
    backgroundColor: isDarkMode ? '#333' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    minHeight: '100vh',
  };

  return (
    <div style={appStyles}>
      {/* Navbar */}
      <nav className={`navbar navbar-expand-lg navbar-dark ${isDarkMode ? 'bg-dark' : 'bg-primary'}`}>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Meeting Assistant</a>
          <button className="btn btn-light" onClick={toggleDarkMode}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

      <div className="container mt-4" style={{ maxWidth: '95%' }}>
        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row">
          {/* Live Transcript Pane */}
          <div className="col-lg-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-secondary text-white' : ''}`}>
              <div className={`card-header ${isDarkMode ? 'bg-dark' : 'bg-primary'} text-white`}>Live Transcript</div>
              <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
                <p>{transcript || 'Start speaking to see the transcript...'}</p>
              </div>
            </div>
          </div>

          {/* Context Insights Pane */}
          <div className="col-lg-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-secondary text-white' : ''}`}>
              <div className={`card-header ${isDarkMode ? 'bg-dark' : 'bg-success'} text-white`}>Context Insights</div>
              <div className="card-body">
                <h5>Top 10 Interesting Phrases:</h5>
                <ul>
                  {contextData.phrases.map((phrase, index) => (
                    <li key={index}>{phrase}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="text-center mt-4">
          <button
            className={`btn ${isRecording ? 'btn-danger' : 'btn-success'} btn-lg me-2`}
            onClick={isRecording ? stopTranscription : startTranscription}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <button
            className="btn btn-info btn-lg"
            onClick={saveTranscript}
            disabled={!transcript}
          >
            Save Transcript
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-dark' : 'bg-light'} text-center py-3 mt-4`}>
        <div className={isDarkMode ? 'text-white' : ''}>Meeting Assistant &copy; 2025</div>
      </footer>
    </div>
  );
};

export default MeetingAssistantApp;