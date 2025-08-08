// verificationpage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../../../services/api';
import AlertModal from '../../../components/common/AlertModal';

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error' as 'info' | 'success' | 'warning' | 'error'
  });

  // Get email from location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // Redirect back if no email provided
      navigate('/register');
    }
  }, [location.state, navigate]);

  // Auto-focus first input on mount
  useEffect(() => {
    const firstInput = document.querySelector('input[name="code-0"]') as HTMLInputElement;
    if (firstInput) firstInput.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) { // Only allow digits
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input if value is entered
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name="code-${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="code-${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setAlertModal({
        isOpen: true,
        title: 'Invalid Code',
        message: 'Please enter the complete 6-digit verification code',
        type: 'error'
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await verifyEmail({ email, code });
      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Verification Successful',
          message: 'Your email has been verified successfully!',
          type: 'success'
        });
        setTimeout(() => navigate('/payment'), 2000);
      }
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setAlertModal({
        isOpen: true,
        title: 'Verification Failed',
        message: error.message || 'Invalid verification code. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await resendVerification({ email }); 
      if (response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Code Resent',
          message: 'A new verification code has been sent to your email.',
          type: 'success'
        });
        setVerificationCode(['', '', '', '', '', '']);
        setTimeout(() => {
          const firstInput = document.querySelector('input[name="code-0"]') as HTMLInputElement;
          if (firstInput) firstInput.focus();
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to resend code:', error);
      setAlertModal({
        isOpen: true,
        title: 'Resend Failed',
        message: error.message || 'Failed to resend verification code. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="text-2xl font-bold text-gray-900">ACNA</div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Enter verification code
            </h2>
            <p className="text-gray-600 mb-2">
              Enter the 6-digit code sent to:
            </p>
            <p className="font-medium text-gray-800">{email}</p>
          </div>

          {/* Verification Code Inputs */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                name={`code-${index}`}
                type="text"
                value={verificationCode[index]}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1}
                inputMode="numeric"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <button
              onClick={handleResendCode}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Resend Verification Code
            </button>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default VerificationPage;