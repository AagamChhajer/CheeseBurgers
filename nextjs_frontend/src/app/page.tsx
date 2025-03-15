'use client';

import React, { useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { MCQQuestion } from '@/components/questions/MCQQuestion';
import { CodingQuestion } from '@/components/questions/CodingQuestion';
import { useExam } from '@/hooks/useExam';
import { useAuth } from '@/hooks/useAuth';
import { questions } from '@/data/questions';

export default function Home() {
  const {
    state,
    setState,
    startExam,
    cleanupResources,
    startTimer
  } = useExam();

  const { user, error: authError, login, signup, logout } = useAuth();

  // Handle fullscreen mode
  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen({ navigationUI: "hide" });
        return true;
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen({ navigationUI: "hide" });
        return true;
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen({ navigationUI: "hide" });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.warn('Exit fullscreen failed:', error);
    }
  }, []);

  // Effect to maintain fullscreen
  useEffect(() => {
    let fullscreenCheck: NodeJS.Timeout;

    if (state.examStarted) {
      const checkAndEnforceFullscreen = () => {
        if (!document.fullscreenElement) {
          enterFullscreen().catch(() => {
            setState(prev => ({
              ...prev,
              examStarted: false,
              fullscreenMode: false
            }));
            alert('Exam terminated: Fullscreen mode is required.');
          });
        }
      };

      // Check immediately and set up interval
      checkAndEnforceFullscreen();
      fullscreenCheck = setInterval(checkAndEnforceFullscreen, 500);
    }

    return () => {
      if (fullscreenCheck) {
        clearInterval(fullscreenCheck);
      }
    };
  }, [state.examStarted, enterFullscreen, setState]);

  // Handle fullscreen change events
  const handleFullscreenChange = useCallback(() => {
    if (state.examStarted && !document.fullscreenElement) {
      enterFullscreen().catch(() => {
        setState(prev => ({
          ...prev,
          examStarted: false,
          fullscreenMode: false,
          showCompletionMessage: false,
          currentQuestion: 0,
          time: 7200
        }));
      });
    }
  }, [state.examStarted, enterFullscreen, setState]);

  // Update exam state when user changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      currentUser: user
    }));
  }, [user, setState]);

  const formatTime = () => {
    const hours = Math.floor(state.time / 3600);
    const minutes = Math.floor((state.time % 3600) / 60);
    const seconds = state.time % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartExam = async () => {
    if (!user) {
      setState(prev => ({
        ...prev,
        showLoginModalState: true
      }));
      return;
    }

    const confirmStart = window.confirm(
      'The exam will be conducted in fullscreen mode. You cannot exit fullscreen until the exam is complete. Ready to begin?'
    );

    if (confirmStart) {
      const fullscreenSuccess = await enterFullscreen();
      
      if (fullscreenSuccess) {
        // Wait a moment to ensure fullscreen is established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (document.fullscreenElement) {
          setState(prev => ({
            ...prev,
            examStarted: true,
            fullscreenMode: true
          }));
          startTimer();
        } else {
          alert('Failed to enter fullscreen mode. Please try again.');
        }
      } else {
        alert('Fullscreen mode is required to take the exam. Please ensure your browser supports fullscreen mode and try again.');
      }
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionId: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: optionId
      }
    }));
  };

  const handleCodeChange = (questionIndex: number, code: string) => {
    setState(prev => ({
      ...prev,
      codeAnswers: {
        ...prev.codeAnswers,
        [questionIndex]: code
      }
    }));
  };

  const handleSubmitExam = () => {
    if (window.confirm('Are you sure you want to submit your exam?')) {
      setState(prev => ({
        ...prev,
        showEditor: false,
        showCompletionMessage: true
      }));
      cleanupResources();
      exitFullscreen();
      
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          examStarted: false,
          showCompletionMessage: false,
          currentQuestion: 0,
          time: 7200,
          tabSwitchCount: 0,
          endTime: null,
          codeAnswers: {}
        }));
        alert('Exam submitted successfully!');
      }, 1500);
    }
  };

  const renderQuestion = () => {
    const currentQ = questions[state.currentQuestion];
    if (!currentQ) return null;

    if (currentQ.type === 'mcq') {
      return (
        <MCQQuestion
          questionNumber={state.currentQuestion + 1}
          question={currentQ.question}
          options={currentQ.options}
          onAnswerSelect={(optionId) => handleAnswerSelect(state.currentQuestion, optionId)}
          selectedAnswer={state.answers[state.currentQuestion]}
        />
      );
    } else if (currentQ.type === 'coding') {
      return (
        <CodingQuestion
          questionNumber={state.currentQuestion + 1}
          question={currentQ}
          onAnswerChange={handleCodeChange}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>SHIELD - Secure Holistic Integrated Examination and Learning Development</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!state.examStarted ? (
        // Landing Page
        <div className="min-h-screen">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-indigo-600">SHIELD</h1>
                </div>
                <div className="flex items-center">
                  {user ? (
                    <>
                      <span className="text-gray-700 mr-4">{user.name}</span>
                      <button 
                        onClick={logout}
                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setState(prev => ({ ...prev, showLoginModalState: true }))}
                        className="mx-2 px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => setState(prev => ({ ...prev, showSignupModalState: true }))}
                        className="mx-2 px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Welcome to SHIELD
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Secure Holistic Integrated Examination and Learning Development
              </p>
              <div className="mt-5 max-w-md mx-auto">
                <button 
                  onClick={handleStartExam}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Take Exam
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : (
        // Exam Interface
        <div className="h-screen flex flex-col">
          <Header currentUser={user} formatTime={formatTime} />
          
          <div className="flex-1 flex overflow-hidden">
            <Navigation
              currentQuestion={state.currentQuestion}
              totalQuestions={questions.length}
              onQuestionSelect={(index) => setState(prev => ({ ...prev, currentQuestion: index }))}
              onSubmit={handleSubmitExam}
            />
            
            <main className="flex-1 overflow-auto p-6">
              {state.showCompletionMessage ? (
                <div className="max-w-3xl mx-auto bg-green-100 p-6 rounded-lg shadow text-center">
                  <h2 className="text-2xl font-bold text-green-800 mb-4">Exam Completed!</h2>
                  <p className="text-lg text-green-700 mb-6">Thank you for completing the exam.</p>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-green-700">Redirecting to the main page...</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto h-full">
                  {renderQuestion()}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      <LoginModal
        isVisible={state.showLoginModalState}
        onLogin={login}
        error={authError}
        onClose={() => setState(prev => ({ ...prev, showLoginModalState: false }))}
      />

      <SignupModal
        isVisible={state.showSignupModalState}
        onSignup={signup}
        error={authError}
        onClose={() => setState(prev => ({ ...prev, showSignupModalState: false }))}
      />
    </div>
  );
} 