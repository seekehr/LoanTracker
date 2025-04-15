import React from 'react';

const LoadingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="space-y-6 text-center">
                <div className="inline-block">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
        
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Loading...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
            Please wait while we prepare your content
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;
