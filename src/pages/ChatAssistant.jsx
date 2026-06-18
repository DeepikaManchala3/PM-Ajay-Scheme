import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, Database, Bot, User, Loader } from 'lucide-react';

const ChatAssistant = ({ embedded = false }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hello! I am your PMAJAY AI Assistant. You can chat with me about general data (DB Mode) or upload a PDF/CSV to chat about specific documents (File Mode).' }
    ]);
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('db'); // 'db' or 'pdf'
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadedFileName(file.name);
                setMode('pdf'); // Auto-switch to PDF mode
                setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `✅ Successfully uploaded ${file.name}. Switched to File Mode. Ask me anything about it!` }]);
                setFile(null);
            } else {
                alert(`Upload failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file. Make sure the Python backend is running on port 8080.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/get?msg=${encodeURIComponent(userMessage.text)}&mode=${mode}`);
            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: `Error: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.response }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Error connecting to the AI server. Is it running?' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const content = (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '20px', flex: 1, minHeight: 0, height: embedded ? '100%' : 'auto' }}>

            {/* Chat Area */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>

                {/* Chat Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f9fafb' }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '15px'
                        }}>
                            <div style={{
                                maxWidth: '70%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : 'white',
                                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: msg.sender === 'bot' ? '1px solid #eee' : 'none',
                                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '12px',
                                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '12px'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={mode === 'pdf' ? "Ask about your document..." : "Ask a general question..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isLoading ? <Loader className="spin" size={18} /> : <Send size={18} />}
                            Send
                        </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>Current Mode:</span>
                        <span className={`badge ${mode === 'db' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'uppercase' }}>
                            {mode === 'db' ? 'Database' : 'File (PDF/CSV)'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Mode Switcher */}
                <div className="card">
                    <h4 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-secondary)' }}>Chat Settings</h4>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <button
                            className={`btn ${mode === 'db' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setMode('db')}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            <Database size={18} /> Chat with Database
                        </button>
                        <button
                            className={`btn ${mode === 'pdf' ? 'btn-info' : 'btn-outline'}`}
                            onClick={() => setMode('pdf')}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            <FileText size={18} /> Chat with Documents
                        </button>
                    </div>
                </div>

                {/* File Upload */}
                <div className="card">
                    <h4 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-secondary)' }}>Upload Document</h4>
                    <div
                        style={{
                            border: '2px dashed #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            backgroundColor: '#f9fafb'
                        }}
                    >
                        <input
                            type="file"
                            accept=".pdf,.csv"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <Upload size={32} color="var(--text-secondary)" />
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {file ? file.name : "Click to Select PDF or CSV"}
                            </span>
                        </label>
                    </div>

                    {file && (
                        <button
                            className="btn btn-success"
                            style={{ width: '100%', marginTop: '15px' }}
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload & Start Chat'}
                        </button>
                    )}

                    {uploadedFileName && !file && (
                        <div style={{ marginTop: '15px', fontSize: '12px', color: 'green', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FileText size={14} /> Active: {uploadedFileName}
                        </div>
                    )}

                    <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                        <b>Note:</b> Uploading a new file will replace the current active document context.
                    </div>
                </div>

                {/* Help / Tips */}
                <div className="card" style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Tips</h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                        <li>Use <b>Database Mode</b> for general queries about the scheme.</li>
                        <li>Use <b>File Mode</b> to analyze specific reports or data files.</li>
                        <li>Supported formats: <b>.pdf, .csv</b></li>
                    </ul>
                </div>

            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return (
        <div className="dashboard-layout sidebar-closed"> {/* Reusing dashboard layout styles for consistency */}
            <main className="dashboard-main" style={{ marginLeft: 0, padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="dashboard-header" style={{ marginBottom: '20px' }}>
                    <div className="dashboard-title-section">
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Bot size={28} color="var(--color-primary)" />
                            PM-AJAY AI Assistant
                        </h3>
                    </div>
                </div>
                {content}
            </main>
        </div>
    );
};

export default ChatAssistant;
