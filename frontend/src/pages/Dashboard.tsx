import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { PlusCircle, History, User } from 'lucide-react';

const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      api.get(`/users/${userId}/interviews`)
        .then(res => setInterviews(res.data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const handleCreateUser = async () => {
    const username = prompt('Enter username:');
    const email = prompt('Enter email:');
    if (username && email) {
      const res = await api.post('/users', { username, email });
      localStorage.setItem('userId', res.data.user_id);
      setUserId(res.data.user_id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Track your progress and start new mock interviews.</p>
        </div>
        <div className="flex gap-4">
          {!userId && (
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <User size={20} />
              Create Profile
            </button>
          )}
          {userId && (
            <button
              onClick={() => navigate('/setup')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <PlusCircle size={20} />
              Start New Interview
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <History size={20} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700">Your Interview History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {interviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No interviews yet. Start your first one today!
            </div>
          ) : (
            interviews.map((interview: any) => (
              <div key={interview.interview_id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <h4 className="font-medium text-gray-900">{interview.job_title}</h4>
                  <p className="text-sm text-gray-500">{new Date(interview.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  {interview.overall_score && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                      {interview.overall_score}%
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/report/${interview.interview_id}`)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
