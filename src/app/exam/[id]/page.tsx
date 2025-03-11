'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';

const examDetails = {
  1: {
    title: 'Programming Fundamentals',
    instructions: [
      'You have 2 hours to complete this exam',
      'There are multiple choice and coding questions',
      'You cannot switch browser tabs or windows during the exam',
      'Ensure your webcam is working properly',
      'Make sure you have a stable internet connection'
    ],
    sections: [
      { name: 'Multiple Choice', questions: 15, time: '45 minutes' },
      { name: 'Coding Problems', questions: 5, time: '75 minutes' }
    ],
    requirements: [
      'Webcam access',
      'Microphone access',
      'Screen sharing',
      'Stable internet connection'
    ]
  },
  // Add details for other exams...
};

export default function ExamPreview() {
  const router = useRouter();
  const params = useParams();
  const [isChecking, setIsChecking] = useState(true);
  const [requirements, setRequirements] = useState({
    webcam: false,
    microphone: false,
    screen: false,
    internet: false
  });

  const examId = params.id;
  const exam = examDetails[examId as keyof typeof examDetails];

  useEffect(() => {
    const checkRequirements = async () => {
      try {
        // Check webcam and microphone
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setRequirements(prev => ({ ...prev, webcam: true, microphone: true }));
        stream.getTracks().forEach(track => track.stop());

        // Check internet
        const online = navigator.onLine;
        setRequirements(prev => ({ ...prev, internet: online }));

        // Check if screen sharing is available
        if ('getDisplayMedia' in navigator.mediaDevices) {
          setRequirements(prev => ({ ...prev, screen: true }));
        }
      } catch (error) {
        console.error('Error checking requirements:', error);
      }
      setIsChecking(false);
    };

    checkRequirements();
  }, []);

  const handleStartExam = () => {
    router.push(`/exam/${examId}/questions`);
  };

  if (!exam) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-black">{exam.title}</h1>

          {/* System Check */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-black">System Check</h2>
            {isChecking ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Checking system requirements...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(requirements).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    {value ? (
                      <span className="text-green-500 mr-2">✓</span>
                    ) : (
                      <span className="text-red-500 mr-2">✗</span>
                    )}
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Instructions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {exam.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>

          {/* Exam Sections */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Exam Sections</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {exam.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-black mb-2">{section.name}</h3>
                  <p className="text-gray-600">Questions: {section.questions}</p>
                  <p className="text-gray-600">Time: {section.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={handleStartExam}
              disabled={isChecking || !Object.values(requirements).every(Boolean)}
              className={`px-8 py-3 rounded-lg text-white text-lg font-medium ${
                isChecking || !Object.values(requirements).every(Boolean)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Start Exam
            </button>
            {!Object.values(requirements).every(Boolean) && (
              <p className="mt-2 text-red-500">
                Please ensure all system requirements are met before starting the exam
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 