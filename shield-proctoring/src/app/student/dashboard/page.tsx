'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/student/login');
    }
  }, [router]);

  const handleStartExam = () => {
    router.push('/exam');
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Exams</h2>
          <div className="border p-4 rounded">
            <h3 className="font-medium">Programming Fundamentals</h3>
            <p className="text-gray-600 mt-2">Duration: 2 hours</p>
            <button
              onClick={handleStartExam}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Take Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}