import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Award, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

const ReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/interviews/${id}/report`)
      .then(res => {
        setReport(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Report not found.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-12 text-white text-center">
          <Award className="mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold">Interview Performance Report</h2>
          <div className="mt-6 inline-block px-6 py-3 bg-white text-indigo-600 rounded-full text-4xl font-black shadow-lg">
            {report.overall_score || 'N/A'}%
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <TrendingUp size={20} />
              <h3>Strengths</h3>
            </div>
            <ul className="space-y-2">
              {report.strengths.map((s: string, i: number) => (
                <li key={i} className="p-3 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertCircle size={20} />
              <h3>Weaknesses</h3>
            </div>
            <ul className="space-y-2">
              {report.weaknesses.map((w: string, i: number) => (
                <li key={i} className="p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold">
              <Lightbulb size={20} />
              <h3>Improvement Tips</h3>
            </div>
            <ul className="space-y-2">
              {report.improvement_tips.map((t: string, i: number) => (
                <li key={i} className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-8 border-t border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-4">Detailed Feedback</h3>
          <p className="text-gray-700 leading-relaxed">
            {report.detailed_feedback}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
