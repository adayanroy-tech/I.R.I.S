
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat, Content } from '@google/genai';
import { CameraFeed } from './components/CameraFeed';
import { BootSequence } from './components/BootSequence';
import { Controls } from './components/Controls';
import { EventLog } from './components/EventLog';
import { ScanningLoader } from './components/ScanningLoader';
import { SiteMap } from './components/SiteMap';
import { PersonnelTracker } from './components/PersonnelTracker';
import { Glossary } from './components/Glossary';
import { Terminal } from './components/Terminal';
import { Inbox } from './components/Inbox';
import { Protocols } from './components/Protocols';
import { initializeChat, getNextEvents } from './services/geminiService';
import type { CameraEvent, CommsMessage } from './types';
import { AMBIENT_SOUND, NEW_MESSAGE_SOUND, ALERT_SOUND, MENU_LOOP_SOUND } from './audioAssets';

interface AppNotification extends CameraEvent {
  id: number;
}

interface AppMessage extends CommsMessage {
  isRead: boolean;
}

interface HistoryState {
  allEvents: CameraEvent[];
  allMessages: AppMessage[];
  unreadMessageCount: number;
  chatHistory: Content[];
}


const App: React.FC = () => {
  const [preBoot, setPreBoot] = useState<boolean>(true);
  const [booting, setBooting] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [allEvents, setAllEvents] = useState<CameraEvent[]>([]);
  const [allMessages, setAllMessages] = useState<AppMessage[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

  const [historyStack, setHistoryStack] = useState<HistoryState[]>([]);
  
  const [isLogVisible, setIsLogVisible] = useState<boolean>(false);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);
  const [isPersonnelTrackerVisible, setIsPersonnelTrackerVisible] = useState<boolean>(false);
  const [isGlossaryVisible, setIsGlossaryVisible] = useState<boolean>(false);
  const [isProtocolsVisible, setIsProtocolsVisible] = useState<boolean>(false);
  const [glossarySearchTerm, setGlossarySearchTerm] = useState<string>('');
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);
  const [isInboxVisible, setIsInboxVisible] = useState<boolean>(false);
  const [mapFocusTarget, setMapFocusTarget] = useState<string | null>(null);
  
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [dispatchOrder, setDispatchOrder] = useState<string | null>(null);
  const [terminalActions, setTerminalActions] = useState<string[]>([]);

  // Sound Refs
  const menuLoopAudioRef = useRef<HTMLAudioElement>(null);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const newMessageAudioRef = useRef<HTMLAudioElement>(null);
  const alertAudioRef = useRef<HTMLAudioElement>(null);

  // Handle pre-boot black screen
  useEffect(() => {
    const preBootTimer = setTimeout(() => {
      setPreBoot(false);
    }, 2000); // Show black screen for 2 seconds

    return () => clearTimeout(preBootTimer);
  }, []);

  // Handle boot sequence after pre-boot
  useEffect(() => {
    if (preBoot) {
      return; // Wait for the pre-boot phase to complete
    }

    const bootTimer = setTimeout(() => {
      setBooting(false);
      handleInitialEvents();
    }, 4000);

    return () => clearTimeout(bootTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preBoot]);
  
  // Start menu loop music after boot sequence
  useEffect(() => {
    if (!booting && menuLoopAudioRef.current) {
      menuLoopAudioRef.current.play().catch(() => {
        console.warn("Audio autoplay was blocked by the browser. Interaction is required.");
      });
    }
  }, [booting]);
  
  useEffect(() => {
    if(error && alertAudioRef.current) {
      alertAudioRef.current.play().catch(e => console.error("Alert audio play failed:", e));
    }
  }, [error]);

  const processNewData = (data: { events: CameraEvent[], messages: CommsMessage[] }, isInitial = false) => {
    const { events, messages } = data;
    
    // --- Process Events ---
    if (!isInitial && events.length > 0 && hasInteracted) {
      const hasHighPriority = events.some(e => e.priority === 'HIGH');
      // Play alert for high-priority events OR new messages
      if (hasHighPriority || messages.length > 0) {
        alertAudioRef.current?.play().catch(e => console.error("Alert audio play failed:", e));
      } else if (events.some(e => e.priority === 'MEDIUM')) {
        newMessageAudioRef.current?.play().catch(e => console.error("New message audio play failed:", e));
      }
    }

    setAllEvents(prev => [...prev, ...events]);

    const newNotifications: AppNotification[] = events
      .filter(event => event.priority === 'HIGH' || event.priority === 'MEDIUM')
      .map(event => ({ ...event, id: Date.now() + Math.random() }));
    setNotifications(prev => [...prev, ...newNotifications]);

    // --- Process Messages ---
    if (messages.length > 0) {
        const newAppMessages: AppMessage[] = messages.map(m => ({ ...m, isRead: false }));
        setAllMessages(prev => [...prev, ...newAppMessages]);
        setUnreadMessageCount(prev => prev + newAppMessages.length);
    }
  };

  const handleInitialEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newChat = initializeChat();
      setChat(newChat);
      const newData = await getNextEvents(newChat);
      processNewData(newData, true);
    } catch (e) {
      console.error(e);
      setError('Failed to establish connection with IRIS. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAdvanceTime = useCallback(async () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (menuLoopAudioRef.current) {
        menuLoopAudioRef.current.pause();
        menuLoopAudioRef.current.currentTime = 0;
      }
      if (ambientAudioRef.current) {
          ambientAudioRef.current.play().catch(e => console.error("Ambient audio play failed:", e));
      }
    }

    if (!chat) {
      setError('Chat not initialized. Cannot advance time.');
      return;
    }
    
    // Save current state to history before advancing
    // Fix: The 'history' property on the Chat object is private. Use the getHistory() method instead.
    const currentChatHistory = await chat.getHistory();
    const currentState: HistoryState = {
      allEvents,
      allMessages,
      unreadMessageCount,
      chatHistory: currentChatHistory,
    };
    setHistoryStack(prev => [...prev, currentState]);

    setIsScanning(true);
    setError(null);
    try {
      const allUserActions: string[] = [];

      if (terminalActions.length > 0) {
        allUserActions.push(...terminalActions);
      }
      
      if (dispatchOrder) {
        allUserActions.push(`personnel.dispatch ${dispatchOrder}`);
      }
      
      const userActionString = allUserActions.length > 0 ? allUserActions.join('\n') : null;
      
      const newData = await getNextEvents(chat, userActionString);
      processNewData(newData);
      
      setDispatchOrder(null);
      setTerminalActions([]);
      
    } catch (e) {
      console.error(e);
      setError('IRIS connection unstable. Failed to retrieve new events.');
    } finally {
      setIsScanning(false);
    }
  }, [chat, hasInteracted, dispatchOrder, terminalActions, allEvents, allMessages, unreadMessageCount]);

  const handleGoBack = useCallback(() => {
    if (historyStack.length === 0) return;

    const newHistoryStack = [...historyStack];
    const lastState = newHistoryStack.pop();

    if (lastState) {
      setAllEvents(lastState.allEvents);
      setAllMessages(lastState.allMessages);
      setUnreadMessageCount(lastState.unreadMessageCount);
      
      // Re-initialize chat with the previous history state
      const revertedChat = initializeChat(lastState.chatHistory);
      setChat(revertedChat);

      // Reset any actions that were part of the undone turn
      setDispatchOrder(null);
      setTerminalActions([]);
      setError(null);

      setHistoryStack(newHistoryStack);
    }
  }, [historyStack]);

  const handleExpireNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleFocusOnMap = (cameraName: string) => {
    setMapFocusTarget(cameraName);
    setIsMapVisible(true);
  };

  const handleOpenGlossaryWithSearch = (term: string) => {
    setGlossarySearchTerm(term);
    setIsGlossaryVisible(true);
  };
  
  const handleAddTerminalAction = (command: string) => {
    setTerminalActions(prev => [...prev, command]);
  };
  
  const handleSendMessage = (recipient: string, message: string) => {
    const newMessage: AppMessage = {
      id: `supervisor-msg-${Date.now()}`,
      sender: 'Supervisor',
      recipient: recipient,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: message,
      isRead: true,
    };
    setAllMessages(prev => [...prev, newMessage]);
    const command = `comms.send_message to "${recipient}" message "${message}"`;
    setTerminalActions(prev => [...prev, command]);
  };

  const handleMarkMessagesAsRead = (sender: string) => {
    let unreadInConvo = 0;
    const updatedMessages = allMessages.map(msg => {
        if (msg.sender === sender && !msg.isRead) {
            unreadInConvo++;
            return { ...msg, isRead: true };
        }
        return msg;
    });
    setAllMessages(updatedMessages);
    setUnreadMessageCount(prev => Math.max(0, prev - unreadInConvo));
  };
  
  const handleOpenInbox = () => {
    setIsInboxVisible(true);
  }

  if (preBoot) {
    return <div className="min-h-screen bg-black" />;
  }

  if (booting) {
    return <BootSequence />;
  }

  return (
    <div className={`min-h-screen bg-black text-green-400 p-4 md:p-6 lg:p-8 flex flex-col global-scanlines ${isLoading || error ? 'glitch-active' : ''}`}>
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center p-4">
            <h2 className="text-4xl md:text-5xl text-cyan-400 mb-4 glitch-active animate-pulse">
              [CONEXIÓN CON I.R.I.S. INESTABLE]
            </h2>
            <p className="text-2xl md:text-3xl text-green-300">
              REROUTEANDO TRANSMISIONES DE DATOS...
            </p>
            <p className="text-xl text-yellow-400 mt-8">
              POR FAVOR, ESPERE
            </p>
          </div>
        </div>
      )}
      {isScanning && <ScanningLoader />}


      <audio ref={menuLoopAudioRef} src={MENU_LOOP_SOUND} loop />
      <audio ref={ambientAudioRef} src={AMBIENT_SOUND} loop />
      <audio ref={newMessageAudioRef} src={NEW_MESSAGE_SOUND} />
      <audio ref={alertAudioRef} src={ALERT_SOUND} />

      <header className="flex justify-between items-center border-b-2 border-green-700/50 pb-2 mb-4 relative z-40">
        <h1 className="text-3xl md:text-4xl">I.R.I.S. - SURVEILLANCE NET</h1>
        <div className="flex items-center space-x-4">
          <div className="text-lg hidden sm:block">SYSTEM STATUS: <span className="text-cyan-400">ONLINE</span></div>
        </div>
      </header>
      
      <main className="flex-grow relative flex items-center justify-center z-20 overflow-hidden">
        <div className="text-center text-green-900/70 select-none pointer-events-none">
          <h1 style={{fontSize: '20vw', letterSpacing: '1rem'}} className="font-black animate-[pulse_4s_ease-in-out_infinite]">I.R.I.S.</h1>
          <p className="text-2xl md:text-4xl text-green-800/80 -mt-4 md:-mt-8">INTERNAL RECONNAISSANCE & ANOMALY IDENTIFICATION SYSTEM</p>
        </div>

        <button
            onClick={() => setIsProtocolsVisible(true)}
            className="protocol-icon-button"
            aria-label="Open Protocol Manual"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                <path d="M5.992 2H18.008C19.108 2 20 2.898 20 3.99V21.01A1.99 1.99 0 0118.008 23H5.992A1.99 1.99 0 014 21.01V3.99C4 2.898 4.884 2 5.992 2zM8 4H6v4h2V4zm0 6H6v2h2v-2zm0 4H6v2h2v-2zm8-8h-6v2h6V6zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"></path>
            </svg>
            <span>PROTOCOLS.DB</span>
        </button>


        <div aria-live="polite" className="absolute top-0 right-0 h-full w-full max-w-lg p-2 md:p-4 space-y-3 overflow-y-auto no-scrollbar">
          {notifications.map(event => (
            <CameraFeed 
              key={event.id}
              event={event}
              onExpire={() => handleExpireNotification(event.id)}
              onFocusMap={handleFocusOnMap}
              onOpenGlossary={handleOpenGlossaryWithSearch}
            />
          ))}
        </div>
      </main>

      <footer className="mt-4 pt-4 border-t-2 border-green-700/50 relative z-30">
        <Controls 
            onAdvanceTime={handleAdvanceTime} 
            isLoading={isScanning}
            onGoBack={handleGoBack}
            canGoBack={historyStack.length > 0} 
        />
        <div className="text-center mt-4 flex justify-center items-center flex-wrap gap-x-6 gap-y-2 md:gap-x-8">
          <button onClick={() => setIsLogVisible(true)} className="text-lg text-yellow-400 hover:underline">
            [OPEN SYSTEM LOG]
          </button>
          <button onClick={() => { setIsMapVisible(true); setMapFocusTarget(null); }} className="text-lg text-green-400 hover:underline">
            [VIEW SITE MAP]
          </button>
          <button onClick={() => setIsPersonnelTrackerVisible(true)} className="text-lg text-cyan-400 hover:underline">
            [BIOMONITOR]
          </button>
          <button onClick={handleOpenInbox} className="text-lg text-purple-400 hover:underline relative">
            [INBOX]
            {unreadMessageCount > 0 && 
              <span className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            }
          </button>
        </div>
        {error && (
          <div className="mt-2 text-center text-red-500 bg-red-900/50 p-2 border border-red-500 animate-pulse">
            <p>SYSTEM ALERT: {error}</p>
          </div>
        )}
         <div className="absolute bottom-1 left-2">
            <button onClick={() => setIsTerminalVisible(true)} title="Open Command Terminal" className="text-lg px-1 text-green-800 hover:text-cyan-400 hover:bg-green-900/50 transition-colors opacity-75 hover:opacity-100">&gt;_</button>
         </div>
         <div className="absolute bottom-1 right-2 flex gap-x-4">
            <button onClick={() => handleOpenGlossaryWithSearch('')} className="text-sm text-green-600 hover:text-green-400 hover:underline">[ARCHIVOS DE BASE DE DATOS]</button>
        </div>
      </footer>

      {isLogVisible && <EventLog events={allEvents} onClose={() => setIsLogVisible(false)} onOpenGlossary={handleOpenGlossaryWithSearch} />}
      {isMapVisible && <SiteMap events={allEvents} chat={chat} onClose={() => setIsMapVisible(false)} focusCamera={mapFocusTarget} dispatchOrder={dispatchOrder} onDispatch={setDispatchOrder} />}
      {isPersonnelTrackerVisible && <PersonnelTracker events={allEvents} onClose={() => setIsPersonnelTrackerVisible(false)} />}
      {isGlossaryVisible && <Glossary onClose={() => setIsGlossaryVisible(false)} initialSearchTerm={glossarySearchTerm} />}
      {isProtocolsVisible && <Protocols onClose={() => setIsProtocolsVisible(false)} />}
      {isTerminalVisible && <Terminal events={allEvents} onClose={() => setIsTerminalVisible(false)} onCommand={handleAddTerminalAction} />}
      {isInboxVisible && <Inbox messages={allMessages} onClose={() => setIsInboxVisible(false)} onSendMessage={handleSendMessage} onMarkAsRead={handleMarkMessagesAsRead} />}
    </div>
  );
};

export default App;