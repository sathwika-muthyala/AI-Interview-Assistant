import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Send, Loader2, CheckCircle } from 'lucide-react';

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialQuestion = async () => {
      try {
        // To get the first question, we can't just call GET /interviews/{id}
        // because it doesn't return the question.
        // We'll fetch the questions for this interview.
        // Let's add a GET endpoint for questions if needed, or just fetch via the history.
        // For simplicity, we'll fetch from the backend.
        // I'll implement a helper endpoint or just use the existing one if I add it.
        // Actually, I'll just fetch the latest question for this interview.
        const res = await api.get(`/interviews/${id}/latest-question`);
        setCurrentQuestion(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetchInitialQuestion();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        question_id: currentQuestion.question_id,
        answer_text: answer,
      });

      if (res.data.is_completed) {
        setIsCompleted(true);
        setIsLoading(false);
      } else {
        setCurrentQuestion(res.data.next_question);
        setAnswer('');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-gray-600 font-medium">Preparing your interview...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <div className="flex justify-center">
          <CheckCircle className="text-green-500" size={64} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Interview Completed!</h2>
        <p className="text-gray-600">The AI is analyzing your responses and generating your personalized report.</p>
        <button
          onClick={() => navigate(`/report/${id}`)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          View Your Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
          <h3 className="font-semibold">Active Interview Session</h3>
          <span className="text-sm opacity-80">AI Recruiter</span>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-indigo-600 font-bold">AI</span>
            </div>
            <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none text-gray-800 text-lg leading-relaxed">
              {currentQuestion?.question_text}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none h-24"
                placeholder="Type your answer here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
