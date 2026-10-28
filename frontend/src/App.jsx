import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ScanLine, 
  Contact, 
  Users,
  HardDrive,
  Settings,
  GraduationCap, 
  HelpCircle,
  Menu,
  X,
  Lock,
  LogOut,
  Sparkles,
  AlertTriangle,
  User,
  KeyRound,
  CheckCircle,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  Gamepad2,
  Calendar,
  BarChart3,
  Sun,
  Moon,
  Library
} from 'lucide-react';
import NetworkStatus from './components/NetworkStatus';
import DashboardView from './components/DashboardView';
import ScannerView from './components/ScannerView';
import CredentialsView from './components/CredentialsView';
import UsersView from './components/UsersView';
import HardwareView from './components/HardwareView';
import ConfigView from './components/ConfigView';
import CursosView from './components/CursosView';
import AsistenciasView from './components/AsistenciasView';
import AsistenciaScannerView from './components/AsistenciaScannerView';
import ConfirmationModal from './components/ConfirmationModal';
import DocumentosView from './components/DocumentosView';
import EncuestaView from './components/EncuestaView';
import LandingView from './components/LandingView';
import JuegosView from './components/JuegosView';
import HorarioAipView from './components/HorarioAipView';
import ReportesView from './components/ReportesView';
import RecursosPeruEducaView from './components/RecursosPeruEducaView';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const JUEGOS_ACTIVOS_PARA_TODOS = false;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('jec_authenticated') === 'true';
  });

  const [viewMode, setViewMode] = useState('landing'); // 'landing' o 'login'

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('jec_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Datos de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = localStorage.getItem('jec_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u.rol === 'ESTUDIANTE' || u.rol === 'DOCENTE') {
        return 'cursos';
      } else if (u.rol === 'AUXILIAR') {
        return 'asistencias';
      }
    }
    return 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ref al panel principal para controlar su scroll desde los subcomponentes
  const mainPanelRef = useRef(null);

  // ID de usuario seleccionado desde la pestaña de Usuarios para ver su credencial
  const [preselectedUserId, setPreselectedUserId] = useState(null);

  // Redirección con área para duelos en juegos interactivos
  const [preselectedJuegoArea, setPreselectedJuegoArea] = useState(null);

  // Modal de perfil y cambio de contraseña
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(null);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jec_theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('jec_theme', theme);
  }, [theme]);

  const menuItems = [
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'scanner', label: 'Estación de Escaneo', icon: ScanLine },
    { id: 'asistencia_scanner', label: 'Estación de Asistencia', icon: ScanLine },
    { id: 'asistencias', label: 'Control de Asistencia', icon: ClipboardCheck },
    { id: 'users', label: 'Gestión de Usuarios', icon: Users },
    { id: 'cursos', label: 'Mis Cursos', icon: GraduationCap },
    { id: 'horario_aip', label: 'Horario Aula AIP', icon: Calendar },
    { id: 'reportes_aip', label: 'Estadísticas AIP', icon: BarChart3 },
    { id: 'juegos', label: 'Juegos Interactivos', icon: Gamepad2 },
    { id: 'recursos', label: 'Recursos PerúEduca', icon: Library },
    { id: 'credentials', label: 'Identificación QR', icon: Contact },
    { id: 'hardware', label: 'Inventario AIP', icon: HardDrive },
    { id: 'documentacion', label: 'Documentación y Ayuda', icon: BookOpen },
    { id: 'encuesta', label: 'Encuesta CIST', icon: ClipboardList },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!currentUser) return false;
    
    if (item.id === 'reportes_aip') {
      return currentUser.rol === 'CIST';
    }
    
    if (item.id === 'recursos') {
      return true;
    }

    if (currentUser.rol === 'ESTUDIANTE') {
      return item.id === 'cursos' || (item.id === 'juegos' && JUEGOS_ACTIVOS_PARA_TODOS) || item.id === 'credentials' || item.id === 'asistencias' || item.id === 'documentacion' || item.id === 'horario_aip';
    }

    if (currentUser.rol === 'DOCENTE') {
      return item.id === 'cursos' || (item.id === 'juegos' && JUEGOS_ACTIVOS_PARA_TODOS) || item.id === 'credentials' || item.id === 'documentacion' || item.id === 'encuesta' || item.id === 'horario_aip';
    }
    
    if (currentUser.rol === 'AUXILIAR') {
      return item.id === 'asistencias' || item.id === 'asistencia_scanner' || item.id === 'credentials' || item.id === 'documentacion' || item.id === 'encuesta';
    }
    
    if (currentUser.rol === 'ADMINISTRATIVO') {
      return item.id === 'credentials' || item.id === 'documentacion' || item.id === 'encuesta';
    }
    
    if (currentUser.rol === 'PIP') {
      return item.id === 'dashboard' || item.id === 'scanner' || item.id === 'credentials' || item.id === 'hardware' || item.id === 'documentacion' || item.id === 'encuesta' || item.id === 'horario_aip';
    }
    
    return true;
  }).map(item => {
    if (item.id === 'cursos') {
      if (currentUser?.rol === 'CIST' || currentUser?.rol === 'PIP') {
        return { ...item, label: 'Gestión de Cursos' };
      } else if (currentUser?.rol === 'ESTUDIANTE') {
        return { ...item, label: 'Mis Cursos y Notas' };
      } else if (currentUser?.rol === 'DOCENTE') {
        return { ...item, label: 'Mis Cursos' };
      }
    }
    if (item.id === 'juegos') {
      if (!JUEGOS_ACTIVOS_PARA_TODOS && currentUser?.rol === 'CIST') {
        return { ...item, label: 'Juegos Interactivos (Pruebas)' };
      }
    }
    if (item.id === 'asistencias') {
      if (currentUser?.rol === 'ESTUDIANTE') {
        return { ...item, label: 'Mi Asistencia' };
      }
    }
    return item;
  });

  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const response = await fetch('/api/v1/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: username,
          contrasena: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setCurrentUser(data);
        localStorage.setItem('jec_authenticated', 'true');
        localStorage.setItem('jec_user', JSON.stringify(data));
        if (data.rol === 'ESTUDIANTE' || data.rol === 'DOCENTE') {
          setActiveTab('cursos');
        } else if (data.rol === 'AUXILIAR') {
          setActiveTab('asistencias');
        } else {
          setActiveTab('dashboard');
        }
      } else {
        setLoginError(data.message || 'DNI o contraseña incorrectos.');
      }
    } catch (err) {
      setLoginError('Error al conectar con el servidor local de Intranet.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setLoginError(null);
    setViewMode('landing');
    localStorage.removeItem('jec_authenticated');
    localStorage.removeItem('jec_user');
    setShowLogoutModal(false);
  };

  const handleViewCredentialRedirect = (userId) => {
    setPreselectedUserId(userId);
    setActiveTab('credentials');
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setChangePasswordError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    if (newPassword === currentPassword) {
      setChangePasswordError('La nueva contraseña debe ser diferente de la actual.');
      return;
    }

    setChangePasswordLoading(true);

    try {
      const response = await fetch('/api/v1/usuarios/cambiar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: currentUser?.dni,
          contrasenaActual: currentPassword,
          nuevaContrasena: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setChangePasswordSuccess('Contraseña actualizada correctamente.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        const updatedUser = { ...currentUser, contrasena: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('jec_user', JSON.stringify(updatedUser));
      } else {
        setChangePasswordError(data.message || 'Error al cambiar la contraseña.');
      }
    } catch (err) {
      setChangePasswordError('Error de red al conectar con el servidor local.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView currentUser={currentUser} />;
      case 'scanner':
        return <ScannerView />;
      case 'asistencia_scanner':
        if (currentUser?.rol === 'PIP') return <DashboardView currentUser={currentUser} />;
        return <AsistenciaScannerView />;
      case 'asistencias':
        if (currentUser?.rol === 'PIP') return <DashboardView currentUser={currentUser} />;
        return <AsistenciasView currentUser={currentUser} />;
      case 'users':
        if (currentUser?.rol === 'PIP') return <DashboardView currentUser={currentUser} />;
        return <UsersView currentUser={currentUser} onViewCredential={handleViewCredentialRedirect} />;
      case 'cursos':
        if (currentUser?.rol === 'PIP') return <DashboardView currentUser={currentUser} />;
        return (
          <CursosView 
            currentUser={currentUser} 
            juegosHabilitados={JUEGOS_ACTIVOS_PARA_TODOS || currentUser?.rol === 'CIST'}
            onNavigateToJuegos={(area) => {
              setPreselectedJuegoArea(area);
              setActiveTab('juegos');
            }}
          />
        );
      case 'juegos':
        if (currentUser?.rol === 'PIP') return <DashboardView currentUser={currentUser} />;
        if (!JUEGOS_ACTIVOS_PARA_TODOS && currentUser?.rol !== 'CIST') {
          return <DashboardView currentUser={currentUser} />;
        }
        return (
          <JuegosView 
            currentUser={currentUser}
            preselectedArea={preselectedJuegoArea}
            onClearPreselected={() => setPreselectedJuegoArea(null)}
            isTestingMode={!JUEGOS_ACTIVOS_PARA_TODOS}
          />
        );
      case 'credentials':
        return (
          <CredentialsView 
            currentUser={currentUser}
            preselectedUserId={preselectedUserId}
            onClearPreselected={() => setPreselectedUserId(null)}
          />
        );
      case 'hardware':
        return <HardwareView />;
      case 'documentacion':
        return <DocumentosView currentUser={currentUser} />;
      case 'encuesta':
        return <EncuestaView currentUser={currentUser} scrollContainer={mainPanelRef} />;
      case 'horario_aip':
        return <HorarioAipView currentUser={currentUser} />;
      case 'reportes_aip':
        if (currentUser?.rol !== 'CIST') return <DashboardView currentUser={currentUser} />;
        return <ReportesView currentUser={currentUser} />;
      case 'recursos':
        return <RecursosPeruEducaView currentUser={currentUser} />;
      case 'config':
        if (currentUser?.rol === 'PIP') return <DashboardView currentUser={currentUser} />;
        return <ConfigView />;
      default:
        return <DashboardView currentUser={currentUser} />;
    }
  };

  // Detectar modo quiosco desde la URL sin requerir autenticación
  const queryParams = new URLSearchParams(window.location.search);
  const kioskMode = queryParams.get('kiosk'); // 'scanner' o 'asistencia'

  if (kioskMode === 'scanner') {
    return (
      <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-start overflow-auto p-4 md:p-8 no-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <ScannerView />
        </div>
      </div>
    );
  }

  if (kioskMode === 'asistencia') {
    return (
      <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-start overflow-auto p-4 md:p-8 no-scrollbar">
        <div className="max-w-4xl mx-auto w-full">
          <AsistenciaScannerView />
        </div>
      </div>
    );
  }

  // VISTA DE LOGIN Y LANDING PAGE
  if (!isAuthenticated) {
    if (viewMode === 'landing') {
      return (
        <LandingView 
          onNavigateToLogin={() => setViewMode('login')} 
          theme={theme}
          setTheme={setTheme}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Luces difuminadas de fondo */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative pt-12">
          
          {/* Botón Volver al Portal Institucional */}
          <button 
            onClick={() => {
              setViewMode('landing');
              setLoginError(null);
            }}
            className="absolute top-4 left-6 text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <span>← Volver al Portal</span>
          </button>

          {/* Botón Cambiar Tema */}
          <button 
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="absolute top-3.5 right-6 text-slate-450 hover:text-emerald-400 transition-colors cursor-pointer p-1"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" /> : <Moon className="w-4.5 h-4.5 text-indigo-400" />}
          </button>

          {/* Logo JEC */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-3">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-wide uppercase m-0 leading-none text-slate-100">Intranet JEC</h1>
            <p className="text-xs text-slate-500 mt-1.5 uppercase font-semibold">I.E. Huanoquite - AIP Offline</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-450 uppercase">DNI de Usuario</label>
              <input
                type="text"
                required
                maxLength={8}
                pattern="\d{8}"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 75731461"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-450 uppercase">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escriba su contraseña"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Acceder al Sistema</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // VISTA DEL SISTEMA AUTENTICADO
  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* HEADER MÓVIL */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-emerald-400" />
          <span className="font-extrabold text-sm uppercase tracking-wider">Intranet JEC</span>
        </div>
        <div className="flex items-center gap-3">
          <NetworkStatus />
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-slate-300 hover:text-white focus:outline-none cursor-pointer p-1"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-450" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out z-30 shrink-0`}>
        
        {/* Logo JEC — siempre visible arriba */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide uppercase m-0 leading-none">Intranet JEC</h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">I.E. Huanoquite</p>
          </div>
        </div>

        {/* Navegación — SOLO esta sección hace scroll */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar min-h-0">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' 
                    : 'text-slate-400 hover:bg-slate-850/60 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>


        {/* Footer Sidebar (Perfil, Logout & Status) — siempre visible abajo */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
          <div className="hidden md:block">
            <NetworkStatus />
          </div>

          {/* Tarjeta de Perfil del Usuario */}
          {currentUser && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center gap-2.5 p-2 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 rounded-xl text-left transition-all cursor-pointer text-xs"
            >
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-200 truncate">{currentUser.nombres}</div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {currentUser.rol === 'CIST' ? 'Coordinador CIST' : 
                   currentUser.rol === 'PIP' ? 'Coordinador PIP' : 
                   currentUser.rol === 'DOCENTE' ? `Docente - ${currentUser.areaCurricular || 'Aula'}` : 
                   currentUser.rol === 'AUXILIAR' ? 'Auxiliar de Educación' :
                   currentUser.rol === 'ADMINISTRATIVO' ? 'Personal Administrativo' :
                   `Estudiante - ${currentUser.grado}° "${currentUser.seccion}"`}
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-850 border border-slate-800 rounded-xl text-left transition-all cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2 text-slate-300">
              {theme === 'dark' ? (
                <>
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <span>Modo Oscuro</span>
                </>
              )}
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1.5">
              {theme === 'dark' ? 'Desactivado' : 'Activado'}
            </span>
          </button>
          
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-slate-950 py-2 rounded-xl text-xs font-bold border border-rose-500/20 cursor-pointer transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] text-slate-550 justify-center">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Soporte offline local LAN</span>
          </div>
        </div>

      </aside>

      {/* BACKGROUND SHADOW FOR MOBILE */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 md:hidden z-20"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* PANEL PRINCIPAL */}
      <main ref={mainPanelRef} className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto w-full">
          <ErrorBoundary resetKeys={[activeTab]}>
            {renderActiveView()}
          </ErrorBoundary>
        </div>
      </main>

      {/* MODAL DE MI PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setShowProfileModal(false);
                setChangePasswordError(null);
                setChangePasswordSuccess(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Mi Perfil</h3>
                <p className="text-xs text-slate-400">Detalles de tu cuenta institucional y seguridad.</p>
              </div>
            </div>

            {/* Detalles del Perfil */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-900/60 text-xs">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block uppercase font-bold text-[9px]">Nombres y Apellidos</span>
                <span className="text-slate-200 font-semibold text-sm">{currentUser?.nombres} {currentUser?.apellidos}</span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block uppercase font-bold text-[9px]">DNI / Identificador</span>
                <span className="text-slate-200 font-mono font-semibold text-sm">{currentUser?.dni}</span>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block uppercase font-bold text-[9px]">Rol en el Sistema</span>
                <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  currentUser?.rol === 'CIST' 
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' 
                    : currentUser?.rol === 'PIP'
                    ? 'bg-purple-950/60 text-purple-400 border border-purple-900/60'
                    : currentUser?.rol === 'DOCENTE'
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-900/60'
                    : currentUser?.rol === 'AUXILIAR'
                    ? 'bg-sky-950/60 text-sky-400 border border-sky-900/60'
                    : currentUser?.rol === 'ADMINISTRATIVO'
                    ? 'bg-teal-950/60 text-teal-400 border border-teal-900/60'
                    : 'bg-blue-950/60 text-blue-400 border border-blue-900/60'
                }`}>
                  {currentUser?.rol === 'CIST' ? 'Coordinador CIST' : 
                   currentUser?.rol === 'PIP' ? 'Coordinador PIP' : 
                   currentUser?.rol === 'DOCENTE' ? 'Docente' : 
                   currentUser?.rol === 'AUXILIAR' ? 'Auxiliar' : 
                   currentUser?.rol === 'ADMINISTRATIVO' ? 'Administrativo' : 'Estudiante'}
                </span>
              </div>
              {currentUser?.rol === 'ESTUDIANTE' && (
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">Grado y Sección</span>
                  <span className="text-slate-200 font-semibold text-xs">
                    {currentUser?.grado}° "{currentUser?.seccion}" (Orden #{currentUser?.numeroOrden})
                  </span>
                </div>
              )}
              {currentUser?.rol !== 'ESTUDIANTE' && currentUser?.cargo && (
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block uppercase font-bold text-[9px]">Cargo / Área</span>
                  <span className="text-slate-200 font-semibold text-xs">
                    {currentUser?.cargo} {currentUser?.areaCurricular ? `(${currentUser.areaCurricular})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Formulario de Cambio de Contraseña */}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Cambiar Contraseña</span>
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Contraseña Actual</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Escribe tu contraseña actual"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Nueva Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Confirmar Nueva</label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme contraseña"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {changePasswordError && (
                <div className="p-3 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={changePasswordLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                {changePasswordLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Actualizar Contraseña</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE CERRAR SESIÓN */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Está seguro de que desea cerrar su sesión en Intranet JEC?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="danger"
      />

    </div>
  );
}

export default App;
