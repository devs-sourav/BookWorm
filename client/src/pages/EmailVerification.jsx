import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Send } from 'lucide-react';
import {Link} from "react-router-dom"
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const EmailVerification = () => {
  const [verificationState, setVerificationState] = useState({
    status: 'pending', // 'pending', 'verifying', 'success', 'error', 'already_verified'
    message: '',
    isResending: false,
    showResendForm: false,
    email: '',
    emailSentSuccessfully: false
  });

  // Extract token from URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyEmail(token);
    }
  }, []);

  const verifyEmail = async (token) => {
    setVerificationState(prev => ({ ...prev, status: 'verifying' }));
    
    try {
      const response = await axiosInstance.get(`/auth/verify-email/${token}`);
      
      if (response.data.isAlreadyVerified) {
        setVerificationState(prev => ({
          ...prev,
          status: 'already_verified',
          message: response.data.message
        }));
      } else {
        setVerificationState(prev => ({
          ...prev,
          status: 'success',
          message: response.data.message
        }));
        
        // Store login token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          console.log('Login token stored:', response.data.token);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed. Please try again.';
      setVerificationState(prev => ({
        ...prev,
        status: 'error',
        message: errorMessage
      }));
    }
  };

  const resendVerificationEmail = async () => {
    if (!verificationState.email.trim()) {
      setVerificationState(prev => ({
        ...prev,
        message: 'Please enter your email address.',
        emailSentSuccessfully: false
      }));
      return;
    }

    setVerificationState(prev => ({ 
      ...prev, 
      isResending: true, 
      message: '',
      emailSentSuccessfully: false
    }));

    try {
      const response = await axiosInstance.post(`/auth/resend-verification`, {
        email: verificationState.email
      });

      if (response.data.isAlreadyVerified) {
        setVerificationState(prev => ({
          ...prev,
          status: 'already_verified',
          message: response.data.message,
          isResending: false,
          emailSentSuccessfully: false
        }));
      } else {
        setVerificationState(prev => ({
          ...prev,
          message: response.data.message,
          isResending: false,
          emailSentSuccessfully: true
        }));
        
        // Auto-hide the success message and go back to main view after 3 seconds
        setTimeout(() => {
          setVerificationState(prev => ({
            ...prev,
            showResendForm: false,
            emailSentSuccessfully: false,
            message: '',
            email: ''
          }));
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email. Please try again.';
      setVerificationState(prev => ({
        ...prev,
        message: errorMessage,
        isResending: false,
        emailSentSuccessfully: false
      }));
    }
  };

  const handleEmailChange = (e) => {
    setVerificationState(prev => ({
      ...prev,
      email: e.target.value,
      message: '',
      emailSentSuccessfully: false
    }));
  };

  const toggleResendForm = () => {
    setVerificationState(prev => ({
      ...prev,
      showResendForm: !prev.showResendForm,
      message: '',
      email: '',
      emailSentSuccessfully: false
    }));
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  const goToDashboard = () => {
    window.location.href = '/';
  };

  const renderContent = () => {
    if (verificationState.showResendForm) {
      return (
        <div className="space-y-6">
          {verificationState.emailSentSuccessfully ? (
            // Success state for email sent
            <div className="text-center">
              <div className="relative">
                <Send className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CheckCircle className="w-6 h-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                We've sent a new verification link to your email address.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700 text-sm text-left">
                    {verificationState.message}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Returning to main page in a few seconds...
              </p>
            </div>
          ) : (
            // Regular resend form
            <>
              <div className="text-center">
                <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Resend Verification Email
                </h2>
                <p className="text-gray-600">
                  Enter your email address to receive a new verification link
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={verificationState.email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={verificationState.isResending}
                  />
                </div>

                {verificationState.message && !verificationState.emailSentSuccessfully && (
                  <div className={`p-4 rounded-lg text-sm ${
                    verificationState.status === 'already_verified' 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {verificationState.status === 'already_verified' ? (
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {verificationState.message}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={toggleResendForm}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    disabled={verificationState.isResending}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={resendVerificationEmail}
                    disabled={verificationState.isResending || !verificationState.email.trim()}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {verificationState.isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Verification Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    switch (verificationState.status) {
      case 'pending':
        return (
          <div className="text-center space-y-6">
            <Mail className="w-16 h-16 text-blue-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verification Required
              </h2>
              <p className="text-gray-600">
                Please check your email and click the verification link to continue.
              </p>
            </div>
            <button
              onClick={toggleResendForm}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Didn't receive the email? Resend verification
            </button>
          </div>
        );

      case 'verifying':
        return (
          <div className="text-center space-y-6">
            <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                {verificationState.message}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={goToDashboard}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={goToLogin}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        );

      case 'already_verified':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Already Verified
              </h2>
              <p className="text-gray-600 mb-4">
                {verificationState.message}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <div
                // onClick={goToDashboard}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Link to="/">Go to Home</Link>
                
              </div>
              <button
                onClick={goToLogin}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-red-600 mb-4">
                {verificationState.message}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={toggleResendForm}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request New Link
              </button>
              <button
                onClick={goToLogin}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerification;