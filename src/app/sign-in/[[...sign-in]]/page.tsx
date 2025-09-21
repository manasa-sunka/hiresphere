'use client'
import { SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Copy, CheckCircle, User, Lock, Info } from 'lucide-react';

const SignInPage: React.FC = () => {
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle dark mode based on system preference
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const demoCredentials = [
    { username: 'admin', role: 'Administrator', description: 'Full system access', password: 'admin@HireSphere2' },
    { username: 'alumni', role: 'Alumni User', description: 'Alumni portal access', password: 'alumni@HireSphere2' },
    { username: 'student', role: 'Student User', description: 'Student dashboard access', password: 'student@HireSphere2' }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCredential(`${type}-${text}`);
      setTimeout(() => setCopiedCredential(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-all duration-500 p-6">
      <div className={`w-full max-w-6xl transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">
            Welcome Back
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 transition-colors duration-300">
            Choose a demo account or sign in with your credentials
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Column - Demo Credentials */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Try Demo Access</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Explore the platform with pre-configured accounts
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Demo Accounts</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Password for all accounts: <span className="font-mono font-medium bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">DemoPass</span>
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {demoCredentials.map((cred, index) => (
                  <div 
                    key={cred.username}
                    className={`group relative transition-all duration-300 delay-${index * 100}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-4 rounded-lg border-2 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer ">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full group-hover:bg-blue-800 transition-colors duration-200">
                            <User className="h-4 w-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-lg">{cred.username}</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium">
                                {cred.role}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{cred.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Password: <span className="font-mono font-medium bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded text-xs">{cred.password}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(cred.username, 'username')}
                            className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 group/btn"
                            title="Copy username"
                          >
                            {copiedCredential === `username-${cred.username}` ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(cred.password, 'password')}
                            className="p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-200 group/btn"
                            title="Copy password"
                          >
                            {copiedCredential === `password-${cred.username}` ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Lock className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sign-In Form */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sign In</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Access your account with your credentials
              </p>
            </div>
            
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-8">
                <SignIn
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-slate-900 dark:text-slate-100 text-2xl font-bold',
                      headerSubtitle: 'text-slate-600 dark:text-slate-400 mt-2',
                      formFieldLabel: 'text-slate-700 dark:text-slate-300 font-medium mb-2',
                      formFieldInput: 'border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-3 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50',
                      dividerLine: 'bg-slate-300 dark:bg-slate-600',
                      dividerText: 'text-slate-500 dark:text-slate-400',
                      socialButtonsBlockButton: 'border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 hover:shadow-md',
                      formFieldSuccessText: 'text-green-600 dark:text-green-400',
                      formFieldErrorText: 'text-red-600 dark:text-red-400',
                      identityPreviewText: 'text-slate-600 dark:text-slate-400',
                      formFieldWarningText: 'text-amber-600 dark:text-amber-400',
                      footer: 'hidden',
                    },
                    layout: {
                      socialButtonsPlacement: 'bottom',
                      showOptionalFields: false,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
          <p>Secure authentication powered by Clerk</p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;