'use client';

import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Registration
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLogin
            ? 'http://localhost:3000/users/login'
            : 'http://localhost:3000/users/add';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();

                toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
                console.log(data);

                // Redirect to home page after success
                setTimeout(() => {
                    router.push('/encrypt');
                }, 1000);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'An error occurred. Please try again.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please check your connection.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-gray-50 shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-6xl font-bold text-center text-gray-800 mb-6">
                    {isLogin ? 'Login' : 'Register'}
                </h1>

                <form onSubmit={handleSubmit}>
                    {/* Name Field (Only for Registration) */}
                    {!isLogin && (
                        <div className="mb-8">
                            <label
                                htmlFor="name"
                                className="block text-2xl font-medium text-gray-700"
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    )}


                    <div className="mb-8">
                        <label
                            htmlFor="username"
                            className="block text-2xl font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-8">
                        <label
                            htmlFor="password"
                            className="block text-2xl font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                {/* Toggle Between Login and Register */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-500 font-medium hover:underline"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AuthPage;
