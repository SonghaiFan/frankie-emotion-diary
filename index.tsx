import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

function AppSession() {
  const [session, setSession] = React.useState(0);
  return <App key={session} onRestored={() => setSession(value => value + 1)} />;
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppSession />
  </React.StrictMode>
);