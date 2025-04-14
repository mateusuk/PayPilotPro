import React, { useState } from 'react';
import { sendWelcomeEmail, sendPasswordResetEmail, sendDriverAccessCode } from '../../services/emailService';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestWelcomeEmail = async () => {
    try {
      setLoading(true);
      setMessage('Enviando email de boas-vindas...');
      await sendWelcomeEmail(email, firstName);
      setMessage('Email de boas-vindas enviado com sucesso!');
    } catch (error) {
      setMessage(`Erro ao enviar email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestResetEmail = async () => {
    try {
      setLoading(true);
      setMessage('Enviando email de reset de senha...');
      const resetLink = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail(email, resetLink);
      setMessage('Email de reset de senha enviado com sucesso!');
    } catch (error) {
      setMessage(`Erro ao enviar email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccessCode = async () => {
    try {
      setLoading(true);
      setMessage('Enviando email com código de acesso...');
      await sendDriverAccessCode(email, accessCode, firstName);
      setMessage('Email com código de acesso enviado com sucesso!');
    } catch (error) {
      setMessage(`Erro ao enviar email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Teste de Envio de Emails</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Nome:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Código de Acesso (para teste de motorista):</label>
        <input
          type="text"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleTestWelcomeEmail} 
          disabled={loading || !email || !firstName}
          style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Testar Email de Boas-vindas
        </button>

        <button 
          onClick={handleTestResetEmail} 
          disabled={loading || !email}
          style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Testar Email de Reset
        </button>

        <button 
          onClick={handleTestAccessCode} 
          disabled={loading || !email || !firstName || !accessCode}
          style={{ padding: '10px 20px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Testar Código de Acesso
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: message.includes('sucesso') ? '#E8F5E9' : '#FFEBEE',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default EmailTest; 