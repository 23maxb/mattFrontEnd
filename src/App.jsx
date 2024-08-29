import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({message, isUser}) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}
        >
            {isUser ? (
                message
            ) : (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                        code: ({node, inline, ...props}) =>
                            inline ? (
                                <code className="bg-gray-800 px-1 rounded" {...props} />
                            ) : (
                                <code className="block bg-gray-800 p-2 rounded mb-2" {...props} />
                            ),
                    }}
                >
                    {message}
                </ReactMarkdown>
            )}
        </div>
    </div>
);

export default function App() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleSendMessage = async () => {
        if (inputMessage.trim() !== '') {
            setMessages((prevMessages) => [...prevMessages, {text: inputMessage, isUser: true}]);
            setInputMessage('');

            try {
                const response = await fetch('https://00ec-73-231-3-109.ngrok-free.app/realQuestion/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({prompt: inputMessage}),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const sourcesList = data['Sources'] ? data['Sources'].join('\n') : '';
                const messageText = `${data.response}\n\n${sourcesList ? 'Sources:\n' + sourcesList : ''}`;

                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        text: messageText,
                        isUser: false,
                    },
                ]);
            } catch (error) {
                console.error('Error:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        text: `An error occurred while fetching the response: ${error.message}`,
                        isUser: false,
                    },
                ]);
            }
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('https://00ec-73-231-3-109.ngrok-free.app/upload_file/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    text: `File uploaded successfully: ${data.message}`,
                    isUser: false,
                },
            ]);
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    text: `An error occurred while uploading the file: ${error.message}`,
                    isUser: false,
                },
            ]);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Chat App</h1>
                <div>
                    <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="fileUpload"
                        className={`inline-flex items-center justify-center rounded-lg px-4 py-2 transition duration-500 ease-in-out text-white ${
                            isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        } focus:outline-none`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </label>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message.text} isUser={message.isUser}/>
                ))}
            </div>
            <div className="bg-gray-800 border-t-2 border-gray-700 px-4 py-4 sm:mb-0">
                <div className="relative flex">
                    <input
                        type="text"
                        placeholder="Type a message"
                        className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-200 placeholder-gray-500 pl-4 bg-gray-700 rounded-md py-3"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                    />
                    <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            onClick={handleSendMessage}
                        >
                            <span className="font-bold">Send</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                 className="h-6 w-6 ml-2 transform rotate-90">
                                <path
                                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}