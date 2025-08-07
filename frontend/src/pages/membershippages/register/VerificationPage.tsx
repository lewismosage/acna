import { useState, useEffect } from 'react';
import { Link } from 'react-router';

interface VerificationPageProps {
  email?: string;
  onNavigateHome?: () => void;
}

const VerificationPage = ({ email: propEmail, onNavigateHome }: VerificationPageProps = {}) => {
  // Get email from props or use default (in real app, this would come from navigation state)
  const [email, setEmail] = useState(propEmail || 'user@example.com');
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-focus first input on mount
  useEffect(() => {
    const firstInput = document.querySelector('input[name="code-0"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input if value is entered
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="code-${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleChangeEmail = () => {
    if (isChangingEmail) {
      if (newEmail) {
        setEmail(newEmail);
        setNewEmail('');
        setIsChangingEmail(false);
        // Here you would typically send a new verification code to the new email
        console.log('Sending verification code to new email:', newEmail);
      }
    } else {
      setIsChangingEmail(true);
      setNewEmail(email);
    }
  };

  const handleCancelChangeEmail = () => {
    setIsChangingEmail(false);
    setNewEmail('');
  };

  const handleConfirm = async () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('Verifying code:', code, 'for email:', email);
        setIsLoading(false);
        // In real app: navigate('/dashboard') or redirect to success page
        alert('Email verified successfully!');
      }, 2000);
    } else {
      alert('Please enter the complete 6-digit verification code');
    }
  };

  const handleResendOTP = () => {
    console.log('Resending OTP to:', email);
    setVerificationCode(['', '', '', '', '', '']);
    alert('New verification code sent to ' + email);
    // Focus first input after resend
    setTimeout(() => {
      const firstInput = document.querySelector('input[name="code-0"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link 
          to="/"
          className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
        >
          ACNA
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Enter verification code
            </h2>
            
            <div className="text-gray-600 mb-2">
              Enter the verification code sent to your email
            </div>
            
            <div className="flex items-center justify-center gap-1 text-sm">
              {!isChangingEmail ? (
                <>
                  <span className="text-gray-600">'{email}'</span>
                  <button
                    onClick={handleChangeEmail}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    Change email
                  </button>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex gap-2 items-center">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter new email"
                    />
                    <button
                      onClick={handleChangeEmail}
                      className="text-green-600 hover:text-green-700 font-medium text-sm px-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelChangeEmail}
                      className="text-gray-500 hover:text-gray-600 font-medium text-sm px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Code Inputs */}
          <div className="flex justify-center gap-3 mb-8">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                name={`code-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={1}
              />
            ))}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 mb-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Confirm'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <button
              onClick={handleResendOTP}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;