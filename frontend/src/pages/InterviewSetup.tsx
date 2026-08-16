import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, PlayCircle } from 'lucide-react';

const InterviewSetup = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Please create a profile first!');
      navigate('/');
      return;
    }

    try {
      const res = await api.post('/interviews', {
        user_id: userId,
        job_title: jobTitle,
        job_description: jobDescription,
      });

      navigate(`/interview/${res.data.interview_id}`);
    } catch (err) {
      console.error(err);
      alert('Error starting interview');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Your Interview</h2>
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition h-40"
              placeholder="Paste the job requirements here..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            <PlayCircle size={20} />
            Begin Interview
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewSetup;
