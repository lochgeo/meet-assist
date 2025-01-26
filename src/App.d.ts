import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
interface SpeechRecognitionResult {
    [index: number]: {
        transcript: string;
        confidence: number;
        isFinal: boolean;
    };
    length: number;
}
interface SpeechRecognitionResultList {
    item(index: number): SpeechRecognitionResult;
    length: number;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}
interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}
declare const MeetingAssistantApp: React.FC;
export default MeetingAssistantApp;
