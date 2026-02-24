// pages/employee/AddQuestions.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { addQuestion, publishExam } from '../../services/examService';

const AddQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: [
      { text: '' },
      { text: '' },
      { text: '' },
      { text: '' }
    ],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0,
    difficultyLevel: 'medium',
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { text: value };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleAddQuestion = async () => {
    // Validation
    if (!currentQuestion.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.text.trim())) {
      setError('All options must be filled');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare the question data to match backend schema
      const questionData = {
        examId,
        questionText: currentQuestion.questionText,
        options: currentQuestion.options.map(opt => ({ text: opt.text })),
        correctAnswer: currentQuestion.correctAnswer,
        marks: currentQuestion.marks,
        negativeMarks: currentQuestion.negativeMarks,
        difficultyLevel: currentQuestion.difficultyLevel,
        topic: currentQuestion.topic || 'General'
      };

      const response = await addQuestion(questionData);
      
      // Add the response data to questions list
      setQuestions([...questions, response.data.question]);

      // Reset form
      setCurrentQuestion({
        questionText: '',
        options: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' }
        ],
        correctAnswer: 0,
        marks: 1,
        negativeMarks: 0,
        difficultyLevel: 'medium',
        topic: ''
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      setError('Add at least one question before publishing');
      return;
    }

    setLoading(true);
    try {
      await publishExam({ examId });
      navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = (indexToDelete) => {
    setQuestions(questions.filter((_, index) => index !== indexToDelete));
  };

  return (
    <Layout title="Add Questions">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#0B234A' }}>Questions Added: {questions.length}</h3>
            <button
              onClick={handlePublish}
              disabled={loading || questions.length === 0}
              className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#E22213', color: '#FFFFFF' }}
            >
              <Save className="h-4 w-4" />
              Publish Exam
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${Math.min((questions.length / 10) * 100, 100)}%`, backgroundColor: '#0B234A' }}
            ></div>
          </div>
        </div>

        {/* Add Question Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#0B234A' }}>Add New Question</h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#FEE', color: '#E22213' }}>
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={currentQuestion.questionText}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                rows="3"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
                placeholder="Enter your question here..."
                required
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ 
                        backgroundColor: index === currentQuestion.correctAnswer ? '#10B981' : '#0B234A',
                        opacity: index === currentQuestion.correctAnswer ? 1 : 0.7
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        index === currentQuestion.correctAnswer 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index === currentQuestion.correctAnswer ? 'Correct' : 'Set as Correct'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                type="text"
                value={currentQuestion.topic}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, topic: e.target.value })}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
                placeholder="e.g., Algebra, Thermodynamics, etc."
              />
            </div>

            {/* Marks and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={currentQuestion.marks}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="0.5"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marks</label>
                <input
                  type="number"
                  value={currentQuestion.negativeMarks}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, negativeMarks: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="0.5"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={currentQuestion.difficultyLevel}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficultyLevel: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddQuestion}
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#0B234A', color: '#FFFFFF' }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add Question
                </>
              )}
            </button>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#0B234A' }}>Added Questions</h3>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q._id || index} className="p-4 border rounded-lg hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Q{index + 1}. </span>
                      <span className="text-gray-800">{q.questionText}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete question"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`text-sm p-2 rounded flex items-center gap-2 ${
                          optIndex === q.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <span 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            optIndex === q.correctAnswer 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className={optIndex === q.correctAnswer ? 'text-green-700' : 'text-gray-600'}>
                          {opt.text || opt}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      Marks: {q.marks}
                    </span>
                    {q.negativeMarks > 0 && (
                      <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">
                        Negative: {q.negativeMarks}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full ${
                      q.difficultyLevel === 'easy' ? 'bg-green-50 text-green-700' :
                      q.difficultyLevel === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {q.difficultyLevel.charAt(0).toUpperCase() + q.difficultyLevel.slice(1)}
                    </span>
                    {q.topic && (
                      <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700">
                        {q.topic}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddQuestions;