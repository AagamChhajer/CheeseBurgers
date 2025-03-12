import { useState, useEffect, useRef, useCallback } from 'react';
import { User, ExamState, Question } from '../types/exam';

const INITIAL_STATE: ExamState = {
  currentUser: null,
  currentQuestion: 0,
  examStarted: false,
  fullscreenMode: false,
  tabSwitchCount: 0,
  time: 7200, // 2 hours in seconds
  showLoginModalState: false,
  showSignupModalState: false,
  showCompletionMessage: false,
  showEditor: false,
  endTime: null,
  codeAnswers: {},
  currentQuestionIndex: 0,
  questions: [],
  answers: {},
  timeRemaining: 7200,
  isSubmitted: false
};

export const useExam = () => {
  const [state, setState] = useState<ExamState>(INITIAL_STATE);

  const timer = useRef<number | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupResources = useCallback(() => {
    if (timer.current) {
      cancelAnimationFrame(timer.current);
      timer.current = null;
    }

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    document.removeEventListener('mousemove', resetInactivityTimer);
    document.removeEventListener('keypress', resetInactivityTimer);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    setState(prev => ({
      ...prev,
      examStarted: false,
      time: INITIAL_STATE.time
    }));
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (state.examStarted) {
        alert('Warning: No activity detected!');
      }
    }, 60000);
  }, [state.examStarted]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && state.examStarted) {
      setState(prev => ({
        ...prev,
        tabSwitchCount: prev.tabSwitchCount + 1
      }));
    }
  }, [state.examStarted]);

  const startTimer = useCallback(() => {
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.time <= 0) {
          clearInterval(timer);
          return {
            ...prev,
            showCompletionMessage: true,
            examStarted: false
          };
        }
        return {
          ...prev,
          time: prev.time - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startExam = useCallback(() => {
    if (!state.currentUser) {
      setState(prev => ({
        ...prev,
        showLoginModalState: true
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      examStarted: true,
      endTime: Date.now() + (prev.time * 1000)
    }));

    startTimer();
  }, [state.currentUser]);

  const setupExamMonitoring = useCallback(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
  }, [handleVisibilityChange, resetInactivityTimer]);

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  return {
    state,
    setState,
    startExam,
    cleanupResources,
    startTimer
  };
}; 