import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { verbalReasoningQuestions } from '@/data/verbalReasoningQuestions';

export default function VerbalReasoning() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = verbalReasoningQuestions[currentQuestionIndex];

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < verbalReasoningQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption('');
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    // Handle quiz completion (e.g., submit score, navigate to results)
    navigate('/dashboard');
  };

  if (showResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">Your score: {score} out of {verbalReasoningQuestions.length}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleFinish} className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Verbal Reasoning Quiz</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {verbalReasoningQuestions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuestion.passage && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-line">{currentQuestion.passage}</p>
            </div>
          )}
          <p className="text-lg mb-6">{currentQuestion.question_text}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-md cursor-pointer transition-colors ${
                  selectedOption === option ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span>Question {currentQuestionIndex + 1} of {verbalReasoningQuestions.length}</span>
          <Button 
            onClick={handleNext} 
            disabled={!selectedOption}
            className="ml-auto"
          >
            {currentQuestionIndex < verbalReasoningQuestions.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
