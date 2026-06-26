import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ProjectsView from './components/ProjectsView';
import WorkspaceView from './components/WorkspaceView';
import LibraryView from './components/LibraryView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import AutomationView from './components/AutomationView';
import AgentsView from './components/AgentsView';
import CopilotView from './components/CopilotView';

import {
  INITIAL_CHANNELS,
  INITIAL_PROJECTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SERIES,
  TEAM_MEMBERS
} from './data';
import { Channel, VideoProject, Notification, TeamMember } from './types';
import { Sparkles, Users, Sliders, ExternalLink, ShieldCheck, HelpCircle, Layers, CheckCircle2, Video, Plus, Check } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(INITIAL_CHANNELS[0]);
  const [projects, setProjects] = useState<VideoProject[]>(INITIAL_PROJECTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeProjectId, setActiveProjectId] = useState<string>('ansiedad_biblia');
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleContinueWorking = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('workspace');
  };

  const handleOpenWorkspace = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('workspace');
  };

  const handleUpdateProject = (updated: VideoProject) => {
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const handleAddNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newNotif: Notification = {
      id: `not_${Date.now()}`,
      type,
      message,
      timestamp: 'Ahora mismo',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Add new script from prompt builder directly into projects
  const handleAddNewScript = (title: string, scriptText: string, outline: string[]) => {
    const newId = `proj_${Date.now()}`;
    const newProj: VideoProject = {
      id: newId,
      title: `Borrador: ${title}`,
      series: 'Reflexiones',
      status: 'Guion',
      progress: 35,
      duration: '07:30',
      outline,
      script: scriptText,
      scenes: [
        {
          id: `sc_init_${Date.now()}`,
          text: 'Plano cinematográfico introductorio con atmósfera solemne.',
          imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=400',
          voiceoverPrompt: 'Tono inspirador de gancho.',
          musicTrack: 'Peaceful Ambient Piano',
          duration: 6,
          transition: 'Fade'
        }
      ],
      seoTitles: [title],
      seoDescription: 'Generado automáticamente por Creator AI Studio',
      seoTags: ['reflexion', 'cristiana', 'fe', 'biblia'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=400'
    };

    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newId);
    setCurrentView('workspace');

    // Add production notification
    const newNotif: Notification = {
      id: `not_${Date.now()}`,
      type: 'success',
      message: `✓ Se ha creado e importado el borrador "${title}" con éxito`,
      timestamp: 'Ahora mismo',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="flex bg-[#0B0F14] text-[#E6EDF2] min-h-screen font-sans antialiased selection:bg-indigo-600/30 selection:text-indigo-300">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Universal Top Header */}
        <Header
          channels={channels}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          notifications={notifications}
          setNotifications={setNotifications}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Content Pane scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* View Dispatcher */}
          {currentView === 'home' && (
            <HomeView
              onContinueWorking={handleContinueWorking}
              projects={projects}
              setProjects={setProjects}
              onAddNotification={handleAddNotification}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              setProjects={setProjects}
              onOpenWorkspace={handleOpenWorkspace}
              seriesList={INITIAL_SERIES}
            />
          )}

          {currentView === 'workspace' && (
            <WorkspaceView project={activeProject} onUpdateProject={handleUpdateProject} />
          )}

          {currentView === 'copilot' && (
            <CopilotView />
          )}

          {currentView === 'library' && (
            <LibraryView onAddNewScript={handleAddNewScript} />
          )}

          {currentView === 'calendar' && (
            <CalendarView />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView />
          )}

          {currentView === 'automation' && (
            <AutomationView />
          )}

          {currentView === 'agents' && (
            <AgentsView />
          )}

          {/* 1. EXTRA VIEW: MODO PRODUCCIÓN */}
          {currentView === 'production' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 bg-[#15191E] p-4.5 rounded-2xl border border-white/5">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-white">Modo Producción Focalizado</h2>
                  <p className="text-[11px] text-slate-400">Optimizado para monitorear renderizados masivos e importaciones críticas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Render queues */}
                <div className="bg-[#15191E] border border-white/5 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Exportaciones Activas</h4>
                  <div className="space-y-3.5">
                    {projects.slice(0, 3).map(proj => (
                      <div key={proj.id} className="bg-[#0B0F14] p-3.5 rounded-xl border border-white/5 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">"{proj.title}"</span>
                          <span className="text-indigo-400 font-mono font-semibold">{proj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden p-[0.5px]">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${proj.progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Estilo: {proj.series}</span>
                          <span>Format: 1080p Cine</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Checklist */}
                <div className="bg-[#15191E] border border-white/5 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Tareas Críticas Pendientes de Ramiro</h4>
                    <div className="space-y-3.5 mt-4">
                      {[
                        'Revisar ortografía del guion de "La historia de Moisés"',
                        'Sintetizar locución con Gemini TTS para Proverbios 3',
                        'Escalar miniatura de ansiedad a 4K con Súper-Resolución'
                      ].map((task, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B0F14] border border-white/5">
                          <CheckCircle2 className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-[#E6EDF2] font-medium">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#8B949E] italic leading-normal font-mono pt-4">
                    * Presiona cualquier tarjeta en la pestaña "Proyectos" para tomar acción.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. EXTRA VIEW: MODO MULTICANAL */}
          {currentView === 'multichannel' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 bg-[#15191E] p-4.5 rounded-2xl border border-white/5">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-white">Consola General Multicanal</h2>
                  <p className="text-[11px] text-slate-400">Estado del flujo y publicaciones divididos por red social</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: 'Canal Cristiano', type: 'YouTube', status: 'Sincronizado', subscribers: '125K', color: 'border-rose-900/30' },
                  { name: 'Canal Finanzas', type: 'YouTube', status: 'Sincronizado', subscribers: '84K', color: 'border-rose-900/30' },
                  { name: 'Canal IA', type: 'TikTok', status: 'Activo', subscribers: '45K', color: 'border-emerald-900/30' },
                  { name: 'Canal Podcast', type: 'Podcast', status: 'Activo', subscribers: '18K', color: 'border-indigo-900/30' }
                ].map((item, idx) => (
                  <div key={idx} className={`bg-[#15191E] p-4 rounded-xl border ${item.color} space-y-3.5`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-400 font-bold uppercase">{item.type}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold font-mono">
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.subscribers} suscriptores</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. EXTRA VIEW: EQUIPOS */}
          {currentView === 'teams' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between bg-[#15191E] p-4.5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-white">Miembros del Equipo</h2>
                    <p className="text-[11px] text-slate-400">Gestiona colaboradores y asigna tareas de producción</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const name = prompt('Nombre del colaborador:');
                    if (!name) return;
                    const role = prompt('Rol del colaborador:');
                    if (!role) return;

                    const newMember: TeamMember = {
                      id: `mem_${Date.now()}`,
                      name,
                      role,
                      avatar: '👤',
                      status: 'Online'
                    };
                    setTeam(prev => [...prev, newMember]);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invitar Miembro</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {team.map(member => (
                  <div key={member.id} className="bg-[#15191E] border border-white/5 rounded-3xl p-5 space-y-4 hover:border-indigo-500/30 transition-all shadow-md">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#0B0F14] border border-white/10 flex items-center justify-center text-xl select-none">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs pt-1.5 border-t border-white/5 font-mono">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Conexión:</span>
                        <span className={member.status === 'Online' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {member.status}
                        </span>
                      </div>
                      {member.activeProject && (
                        <div className="flex flex-col gap-0.5 pt-1">
                          <span className="text-slate-500 text-[10px]">Proyecto asignado:</span>
                          <span className="text-white font-sans text-xs truncate">"{member.activeProject}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EXTRA VIEW: CONFIGURACIÓN */}
          {currentView === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 bg-[#15191E] p-4.5 rounded-2xl border border-white/5">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-white">Configuración de Creator OS</h2>
                  <p className="text-[11px] text-slate-400">Personaliza el motor de inteligencia artificial y parámetros globales</p>
                </div>
              </div>

              <div className="max-w-2xl bg-[#15191E] border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl">
                {/* General parameters */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Preferencias de Motor de Voz (TTS)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-white">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase block">Tasa de Muestreo</label>
                      <select className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-3 py-2">
                        <option>24,000 Hz (Fidelidad de locución)</option>
                        <option>16,000 Hz (Estándar)</option>
                        <option>48,000 Hz (Ultra-Fina Estudio)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase block">Acento por defecto</label>
                      <select className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-3 py-2">
                        <option>Español (Castellano Narrativo)</option>
                        <option>Español (Latinoamérica Neutro)</option>
                        <option>Inglés (EEUU)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>Soporte Técnico</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ¿Tienes dudas sobre los límites de tokens o la integración de canales automáticos? Visita nuestra documentación enterprise de Creator OS o contacta directamente a soporte.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
