'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiMic, FiStopCircle, FiPlay, FiTrash2 } from 'react-icons/fi';

interface VoiceRecorderProps {
  onRecordingSaved?: (audioUrl: string) => void;
}

export default function VoiceRecorder({ onRecordingSaved }: VoiceRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Array<{
    id: string;
    url: string;
    duration: number;
    timestamp: Date;
  }>>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        const recording = {
          id: Date.now().toString(),
          url,
          duration: recordingTime,
          timestamp: new Date(),
        };
        setRecordings(prev => [recording, ...prev]);
        onRecordingSaved?.(url);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      toast.error('Unable to access microphone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Voice Notes</h3>

        {/* Recording Interface */}
        <div className="flex items-center gap-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <FiMic className="w-5 h-5" />
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <FiStopCircle className="w-5 h-5" />
                Stop
              </button>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatTime(recordingTime)}
              </div>
              <div className="flex-1 h-1 bg-red-300 dark:bg-red-900 rounded-full relative overflow-hidden">
                <div className="h-full bg-red-600 animate-pulse" style={{width: '30%'}} />
              </div>
            </>
          )}
        </div>

        {/* Recorded Clips */}
        {recordings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recordings</h4>
            {recordings.map(recording => (
              <div
                key={recording.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => setPlayingId(playingId === recording.id ? null : recording.id)}
                    className="btn-compact bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {recording.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(recording.duration)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteRecording(recording.id)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Audio Player */}
      {playingId && (
        <audio
          key={playingId}
          src={recordings.find(r => r.id === playingId)?.url}
          autoPlay
          controls
          className="w-full"
        />
      )}
    </div>
  );
}
