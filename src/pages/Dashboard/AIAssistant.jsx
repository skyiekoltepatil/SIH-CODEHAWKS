import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import ChatBot from '../../components/ChatBot';

export default function AIAssistant() {
  const { user } = useContext(AuthContext);
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserApps = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const appsRef = collection(db, 'users', user.uid, 'applications');
        const snapshot = await getDocs(appsRef);
        const apps = [];
        snapshot.forEach((d) => apps.push({ id: d.id, ...d.data() }));
        apps.sort((a, b) => {
          const ta = a.timestamp?.toMillis?.() || 0;
          const tb = b.timestamp?.toMillis?.() || 0;
          return tb - ta;
        });
        setUserApplications(apps);
      } catch (err) {
        console.error('Failed to load user applications for chatbot:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserApps();
  }, [user]);

  return (
    <div className="tab-content active" id="ai-assistant">
      <div className="section-header">
        <h3>AI Assistant</h3>
      </div>
      {loading ? (
        <div
          className="chat-container"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ marginBottom: '12px' }} />
          <span>Loading assistant...</span>
        </div>
      ) : (
        <ChatBot
          context={{
            user,
            applications: userApplications,
          }}
        />
      )}
    </div>
  );
}
