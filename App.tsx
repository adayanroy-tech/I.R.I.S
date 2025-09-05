
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { CameraFeed } from './components/CameraFeed';
import { BootSequence } from './components/BootSequence';
import { Controls } from './components/Controls';
import { EventLog } from './components/EventLog';
import { ScanningLoader } from './components/ScanningLoader';
import { SiteMap } from './components/SiteMap';
import { PersonnelTracker } from './components/PersonnelTracker';
import { Glossary } from './components/Glossary';
import { Terminal } from './components/Terminal';
import { initializeChat, getNextEvents } from './services/geminiService';
import type { CameraEvent } from './types';
import { AMBIENT_SOUND, NEW_MESSAGE_SOUND, ALERT_SOUND, MENU_LOOP_SOUND } from './audioAssets';

interface AppNotification extends CameraEvent {
  id: number;
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
  
  const [isLogVisible, setIsLogVisible] = useState<boolean>(false);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false);
  const [isPersonnelTrackerVisible, setIsPersonnelTrackerVisible] = useState<boolean>(false);
  const [isGlossaryVisible, setIsGlossaryVisible] = useState<boolean>(false);
  const [glossarySearchTerm, setGlossarySearchTerm] = useState<string>('');
  const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);
  const [mapFocusTarget, setMapFocusTarget] = useState<string | null>(null);
  
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [dispatchOrder, setDispatchOrder] = useState<string | null>(null);
  const [terminalAction, setTerminalAction] = useState<string | null>(null);

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

  const processNewEvents = (events: CameraEvent[], isInitial = false) => {
    // Play sounds only after initial load and if there are new events
    if (!isInitial && events.length > 0 && hasInteracted) {
      const hasHighPriority = events.some(e => e.priority === 'HIGH');
      const hasMediumPriority = events.some(e => e.priority === 'MEDIUM');
      
      if (hasHighPriority) {
        // High priority events trigger a distinct alert sound
        alertAudioRef.current?.play().catch(e => console.error("Alert audio play failed:", e));
      } else if (hasMediumPriority) {
        // Medium priority events trigger the standard new message sound
        newMessageAudioRef.current?.play().catch(e => console.error("New message audio play failed:", e));
      }
    }

    setAllEvents(prev => [...prev, ...events]);

    // Only create pop-up notifications for MEDIUM and HIGH priority events
    const newNotifications: AppNotification[] = events
      .filter(event => event.priority === 'HIGH' || event.priority === 'MEDIUM')
      .map(event => ({
        ...event,
        id: Date.now() + Math.random(), // Unique ID for React key
      }));

    setNotifications(prev => [...prev, ...newNotifications]);
  };

  const handleInitialEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newChat = initializeChat();
      setChat(newChat);
      const newEvents = await getNextEvents(newChat);
      processNewEvents(newEvents, true);
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
    setIsScanning(true);
    setError(null);
    try {
      let userAction: string | null = null;
      // A direct terminal command takes precedence over a map dispatch order
      if (terminalAction) {
        userAction = terminalAction;
      } else if (dispatchOrder) {
        userAction = `personnel.dispatch ${dispatchOrder}`;
      }
      
      const newEvents = await getNextEvents(chat, userAction);
      processNewEvents(newEvents);
      
      // Reset actions after they've been processed
      if(dispatchOrder) {
        setDispatchOrder(null);
      }
      if(terminalAction) {
        setTerminalAction(null);
      }
    } catch (e) {
      console.error(e);
      setError('IRIS connection unstable. Failed to retrieve new events.');
    } finally {
      setIsScanning(false);
    }
  }, [chat, hasInteracted, dispatchOrder, terminalAction]);

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
        <Controls onAdvanceTime={handleAdvanceTime} isLoading={isScanning} />
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
        </div>
        {error && (
          <div className="mt-2 text-center text-red-500 bg-red-900/50 p-2 border border-red-500 animate-pulse">
            <p>SYSTEM ALERT: {error}</p>
          </div>
        )}
         <div className="absolute bottom-1 left-2">
            <button onClick={() => setIsTerminalVisible(true)} title="Open Command Terminal" className="text-lg px-1 text-green-800 hover:text-cyan-400 hover:bg-green-900/50 transition-colors opacity-75 hover:opacity-100">&gt;_</button>
         </div>
         <div className="absolute bottom-1 right-2">
            <button onClick={() => handleOpenGlossaryWithSearch('')} className="text-sm text-green-600 hover:text-green-400 hover:underline">[ARCHIVOS DE BASE DE DATOS]</button>
        </div>
      </footer>

      {isLogVisible && <EventLog events={allEvents} onClose={() => setIsLogVisible(false)} onOpenGlossary={handleOpenGlossaryWithSearch} />}
      {isMapVisible && <SiteMap events={allEvents} chat={chat} onClose={() => setIsMapVisible(false)} focusCamera={mapFocusTarget} dispatchOrder={dispatchOrder} onDispatch={setDispatchOrder} />}
      {isPersonnelTrackerVisible && <PersonnelTracker events={allEvents} onClose={() => setIsPersonnelTrackerVisible(false)} />}
      {isGlossaryVisible && <Glossary onClose={() => setIsGlossaryVisible(false)} initialSearchTerm={glossarySearchTerm} />}
      {isTerminalVisible && <Terminal events={allEvents} onClose={() => setIsTerminalVisible(false)} onCommand={setTerminalAction} />}
    </div>
  );
};

export default App;
