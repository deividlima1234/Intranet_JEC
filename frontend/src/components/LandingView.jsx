import React from 'react';
import { 
  GraduationCap, 
  Lock, 
  BookOpen, 
  Users, 
  Award, 
  Laptop, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Cpu, 
  ShieldCheck,
  CheckCircle,
  Server,
  BookMarked,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingView({ onNavigateToLogin, theme, setTheme }) {
  const [showInteractiveMap, setShowInteractiveMap] = React.useState(true);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full h-screen overflow-y-auto bg-slate-950 text-slate-100 scroll-smooth selection:bg-emerald-500 selection:text-slate-950">
      
      {/* GLOW DE FONDO AMBIENTE */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-slate-900/75 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg uppercase tracking-wider block leading-none text-slate-100">
                I.E. Huanoquite
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                Jornada Escolar Completa
              </span>
            </div>
          </div>

          {/* Menú de Navegación (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-350">
            <button 
              onClick={() => scrollToSection('inicio')} 
              className="hover:text-emerald-450 transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('nosotros')} 
              className="hover:text-emerald-450 transition-colors cursor-pointer"
            >
              Nosotros
            </button>
            <button 
              onClick={() => scrollToSection('jec')} 
              className="hover:text-emerald-450 transition-colors cursor-pointer"
            >
              Modelo JEC
            </button>
            <button 
              onClick={() => scrollToSection('aip')} 
              className="hover:text-emerald-450 transition-colors cursor-pointer"
            >
              Tecnología AIP
            </button>
            <button 
              onClick={() => scrollToSection('contacto')} 
              className="hover:text-emerald-450 transition-colors cursor-pointer"
            >
              Contacto
            </button>
          </nav>

          {/* Botón de Acceso y Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-2xl cursor-pointer text-slate-350 hover:text-white transition-all active:scale-95"
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-450" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="relative group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              <span>Acceso Intranet</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:py-32 flex flex-col items-center text-center z-10">
        
        {/* Banner o Distintivo Pequeño */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400 mb-6 animate-pulse">
          <Award className="w-4 h-4" />
          <span>Líderes en Innovación Educativa Rural</span>
        </div>

        {/* Título Principal */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-slate-100">
          Transformando el Aprendizaje con{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Tecnología y Valores
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="max-w-2xl text-base sm:text-xl text-slate-400 mt-6 leading-relaxed">
          En la <strong>I.E. Huanoquite</strong>, implementamos el modelo de <strong>Jornada Escolar Completa (JEC)</strong>, brindando más horas de aprendizaje y herramientas digitales para potenciar el talento de cada estudiante.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <button
            onClick={onNavigateToLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/15 cursor-pointer hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"
          >
            <span>Ingresar a la Intranet JEC</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToSection('nosotros')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-200 font-semibold px-8 py-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <span>Conocer Propuesta</span>
          </button>
        </div>

        {/* Mockup / Elemento Gráfico de la Intranet */}
        <div className="w-full max-w-4xl mt-16 sm:mt-24 p-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-[2.5rem] shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent rounded-[2.5rem] z-10 pointer-events-none"></div>
          
          <div className="bg-slate-950/80 rounded-[2.2rem] border border-slate-900 p-4 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-10 text-left">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl border border-indigo-500/20 self-start md:self-center shrink-0">
              <Server className="w-12 h-12" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Tecnología Local Offline</span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">Servidor Local Intranet JEC</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Nuestra plataforma de intranet corre de manera <strong>100% offline</strong> en la red de área local de la institución. Esto garantiza que docentes y alumnos tengan acceso inmediato a la gestión académica, asistencia automatizada, encuestas e inventarios del Aula AIP, independientemente de la estabilidad de la conexión a internet.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* SECCIÓN SOBRE NOSOTROS */}
      <section id="nosotros" className="relative py-20 border-t border-slate-900 bg-slate-900/20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Nuestra Institución</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">Comprometidos con el desarrollo integral</p>
            <p className="text-slate-400 mt-4 leading-relaxed text-sm sm:text-base">
              Fundada sobre los pilares de la disciplina, el estudio y la innovación, la I.E. Huanoquite lidera el cambio metodológico y tecnológico de la educación pública en la región.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Tarjeta Misión */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-8 sm:p-10 rounded-3xl hover:border-emerald-500/30 transition-all group duration-300">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit mb-6 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-150">Nuestra Misión</h3>
              <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
                Brindar una educación científica, tecnológica y humanística de alta calidad a nuestros estudiantes. Fomentamos el pensamiento crítico, la autonomía en el aprendizaje y la vivencia de valores éticos y democráticos, preparando ciudadanos capaces de liderar el progreso de su comunidad.
              </p>
            </div>

            {/* Tarjeta Visión */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-8 sm:p-10 rounded-3xl hover:border-indigo-500/30 transition-all group duration-300">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-6 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-150">Nuestra Visión</h3>
              <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
                Ser reconocidos a nivel regional y nacional como una institución educativa líder en innovación pedagógica y digital. Buscamos formar estudiantes competentes, con alto dominio de habilidades socioemocionales e informáticas, preparados para enfrentar con éxito los retos académicos y profesionales del futuro.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN JORNADA ESCOLAR COMPLETA (JEC) */}
      <section id="jec" className="relative py-20 border-t border-slate-900 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Modelo Educativo</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">¿Qué significa ser un colegio JEC?</p>
            <p className="text-slate-400 mt-4 leading-relaxed text-sm">
              La Jornada Escolar Completa (JEC) es un modelo que amplía las oportunidades de aprendizaje, brindando un servicio educativo integral y de calidad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1 */}
            <div className="bg-slate-900/20 border border-slate-850/80 p-6 rounded-2xl">
              <div className="text-emerald-450 text-sm font-extrabold mb-3 bg-emerald-500/5 px-3 py-1 rounded-lg w-fit border border-emerald-500/10">01</div>
              <h4 className="font-bold text-slate-200 text-base">Horario Ampliado</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Incremento de horas pedagógicas semanales. Más tiempo dedicado al reforzamiento en Matemática, Comunicación, Ciencias e Inglés.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-slate-900/20 border border-slate-850/80 p-6 rounded-2xl">
              <div className="text-emerald-450 text-sm font-extrabold mb-3 bg-emerald-500/5 px-3 py-1 rounded-lg w-fit border border-emerald-500/10">02</div>
              <h4 className="font-bold text-slate-200 text-base">Inglés Interactivo</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Uso de metodologías interactivas y recursos digitales multimedia para acelerar el dominio del idioma como herramienta global.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-slate-900/20 border border-slate-850/80 p-6 rounded-2xl">
              <div className="text-emerald-450 text-sm font-extrabold mb-3 bg-emerald-500/5 px-3 py-1 rounded-lg w-fit border border-emerald-500/10">03</div>
              <h4 className="font-bold text-slate-200 text-base">Acompañamiento Integral</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tutoría grupal e individual dedicada al soporte emocional, orientación vocacional y convivencia escolar saludable.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="bg-slate-900/20 border border-slate-850/80 p-6 rounded-2xl">
              <div className="text-emerald-450 text-sm font-extrabold mb-3 bg-emerald-500/5 px-3 py-1 rounded-lg w-fit border border-emerald-500/10">04</div>
              <h4 className="font-bold text-slate-200 text-base">Educación para el Trabajo</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Desarrollo de competencias técnicas y de emprendimiento mediante proyectos prácticos adecuados a las oportunidades de la región.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN AULA DE INNOVACIÓN PEDAGÓGICA (AIP) */}
      <section id="aip" className="relative py-20 border-t border-slate-900 bg-slate-900/10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Texto */}
            <div className="flex-1 space-y-6">
              <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Nuestra Infraestructura Digital</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 leading-tight">
                Aulas de Innovación Pedagógica (AIP)
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                Nuestras aulas AIP están equipadas con tecnología moderna de cómputo, laptops y tabletas dedicadas. Lideradas por coordinadores <strong>CIST</strong> (Tecnologías) y **PIP** (Proyectos), este espacio ofrece un ecosistema completo para las clases interactivas:
              </p>
              
              <ul className="space-y-3.5">
                {[
                  'Sesiones guiadas con laptops y recursos interactivos para cada estudiante.',
                  'Registro digital instantáneo y seguro de asistencia mediante códigos QR personales.',
                  'Acceso a manuales del sistema, material docente y documentos compartidos de forma offline.',
                  'Monitoreo patrimonial y control de equipos en tiempo real.'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tarjeta Visual de AIP */}
            <div className="flex-1 w-full lg:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-colors"></div>
              
              <h3 className="font-bold text-slate-200 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
                <Laptop className="w-5 h-5 text-emerald-400" />
                <span>Recursos Tecnológicos AIP</span>
              </h3>

              <div className="space-y-4">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs sm:text-sm">Laptops Educativas JEC</h5>
                    <p className="text-[11px] text-slate-450 mt-0.5">Disponibles en Aula AIP 01</p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-full">Operativas</span>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs sm:text-sm">Tabletas Digitales</h5>
                    <p className="text-[11px] text-slate-450 mt-0.5">Integración móvil en aulas</p>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full">Operativas</span>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs sm:text-sm">Estaciones de Asistencia QR</h5>
                    <p className="text-[11px] text-slate-450 mt-0.5">Control de asistencia rápido</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full">Activo LAN</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-500 justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Gestión offline local a través de la intranet</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN DE ESTADÍSTICAS */}
      <section className="relative py-16 border-t border-slate-900 bg-slate-950 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: '500+', label: 'Estudiantes Matriculados', icon: Users, color: 'text-emerald-400' },
              { value: '35+', label: 'Docentes de Primer Nivel', icon: Award, color: 'text-indigo-400' },
              { value: '3', label: 'Aulas AIP Digitales', icon: Laptop, color: 'text-teal-400' },
              { value: '100%', label: 'Compromiso y Educación', icon: ShieldCheck, color: 'text-emerald-400' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-slate-900/35 border border-slate-850 p-6 rounded-2xl text-center flex flex-col items-center justify-center relative hover:border-slate-800 transition-colors">
                  <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${stat.color} mb-3`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-100 block leading-none">{stat.value}</span>
                  <span className="text-xs text-slate-450 mt-2 font-semibold uppercase tracking-wider">{stat.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECCIÓN DE CONTACTO */}
      <section id="contacto" className="relative py-20 border-t border-slate-900 bg-slate-900/10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-450 uppercase tracking-widest">Comunícate con Nosotros</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">Canales de Atención e Información</p>
            <p className="text-slate-400 mt-4 leading-relaxed text-sm">
              Estamos para atender tus consultas e inquietudes. Comunícate directamente con la dirección o la secretaría.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Datos de contacto */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl h-fit">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Dirección Física</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Plaza de Armas S/N, Distrito de Huanoquite,<br />
                    Provincia de Paruro, Cusco, Perú.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-xl h-fit">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Contacto Telefónico</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    +51 984 756 123 (Secretaría)<br />
                    Atención de Lunes a Viernes de 8:00 AM a 3:30 PM.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex gap-4">
                <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/15 rounded-xl h-fit">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Correo Institucional</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    contacto@iehuanoquitejec.edu.pe<br />
                    Consultas administrativas y pedagógicas.
                  </p>
                </div>
              </div>

            </div>

            {/* Mapa Ilustrado */}
            <div className="lg:col-span-7 bg-slate-900/30 border border-slate-850 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute inset-0 bg-slate-950/20 z-0"></div>
              
              <div className="z-10 relative space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest">Ubicación Institucional</span>
                  <div className="flex bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-[9px] font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowInteractiveMap(false)}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${!showInteractiveMap ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Croquis (Offline)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInteractiveMap(true)}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${showInteractiveMap ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Mapa GPS
                    </button>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-200">Distrito de Huanoquite, Paruro, Cusco</h3>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Nuestra institución está situada en el corazón del distrito de Huanoquite. Coordenadas GPS: <span className="font-mono text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">-13.680700, -72.014376</span>
                </p>
              </div>

              {/* Render de un mapa abstracto o real según el modo */}
              <div className="h-40 sm:h-48 w-full mt-6 bg-slate-950 border border-slate-850 rounded-2xl relative overflow-hidden flex items-center justify-center z-10">
                {showInteractiveMap ? (
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-72.016376%2C-13.682700%2C-72.012376%2C-13.678700&amp;layer=mapnik&amp;marker=-13.680700%2C-72.014376"
                    className="w-full h-full border-0 rounded-2xl"
                    style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.2)' }}
                    allowFullScreen
                    title="Mapa de I.E. Huanoquite"
                  />
                ) : (
                  <>
                    {/* Cuadrículas abstractas representando el plano */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-15">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="border-t border-l border-slate-700"></div>
                      ))}
                    </div>

                    {/* Rutas abstractas */}
                    <div className="absolute w-full h-[2px] bg-slate-800 rotate-12 transform top-1/2 left-0 opacity-40"></div>
                    <div className="absolute h-full w-[2px] bg-slate-800 -rotate-45 transform top-0 left-1/3 opacity-40"></div>
                    <div className="absolute w-2/3 h-[2px] bg-slate-800 -rotate-12 transform bottom-1/4 left-10 opacity-30"></div>

                    {/* Elementos clave */}
                    <div className="absolute top-1/3 left-1/4 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-[9px] text-slate-500 font-bold">Plaza de Armas</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                      <div className="relative flex items-center justify-center p-2 bg-emerald-500 text-slate-950 rounded-full shadow-lg shadow-emerald-500/20 animate-bounce">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 bg-slate-900 border border-emerald-500/25 px-2 py-0.5 rounded shadow-xl">I.E. Huanoquite JEC</span>
                    </div>
                    
                    <div className="absolute bottom-2 right-2 bg-slate-900/90 border border-slate-800/80 px-2 py-0.5 rounded text-[8px] text-slate-500 font-mono select-none">
                      Lat: -13.680700, Lon: -72.014376
                    </div>
                  </>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-slate-900 border-t border-slate-850 py-8 text-center text-xs text-slate-500 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">
              <GraduationCap className="w-4 h-4 text-emerald-450" />
            </div>
            <span className="font-bold text-slate-400">Intranet I.E. Huanoquite</span>
          </div>
          <p>© {currentYear} Intranet JEC. Todos los derechos reservados. Red Local LAN Offline.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="hover:text-slate-350 transition-colors cursor-pointer font-semibold"
            >
              Volver arriba ↑
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
