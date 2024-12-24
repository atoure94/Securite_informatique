'use client'

import React, { useState } from "react";
import axios from "axios";

const Encrypt = () => {
    const [message, setMessage] = useState("");
    const [encryptedData, setEncryptedData] = useState(null);
    const [decryptedMessage, setDecryptedMessage] = useState("");
    const [error, setError] = useState("");

    const handleEncrypt = async () => {
        setError("");
        setDecryptedMessage("");

        try {
            const response = await axios.post("http://localhost:3000/encrypt", {
                message,
            });
            setEncryptedData(response.data);
        } catch (err) {
            setError("Error encrypting the message.");
            console.error(err);
        }
    };

    const handleDecrypt = async () => {
        setError("");
        setDecryptedMessage("");

        if (!encryptedData) {
            setError("No encrypted data to decrypt.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/decrypt", {
                iv: encryptedData.iv,
                encryptedMessage: encryptedData.encryptedMessage,
                hash: encryptedData.hash,
            });
            setDecryptedMessage(response.data.decryptedMessage);
        } catch (err) {
            setError("Error decrypting the message.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Encrypted Messaging
                </h1>

                {/* Input Section */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Message:
                    </label>
                    <textarea
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg p-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                    <button
                        onClick={handleEncrypt}
                        className="mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        Encrypt Message
                    </button>
                </div>

                {/* Encrypted Data Section */}
                {encryptedData && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Encrypted Data:
                        </h3>
                        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-black overflow-auto">
              {JSON.stringify(encryptedData, null, 2)}
            </pre>
                        <button
                            onClick={handleDecrypt}
                            className="mt-4 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition"
                        >
                            Decrypt Message
                        </button>
                    </div>
                )}

                {/* Decrypted Message Section */}
                {decryptedMessage && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Decrypted Message:
                        </h3>
                        <p className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
                            {decryptedMessage}
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 font-medium text-sm mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Encrypt;
