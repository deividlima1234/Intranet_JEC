import React, { useState } from 'react';
import { 
  BookOpen, 
  Video, 
  FolderSync, 
  TabletSmartphone, 
  Monitor, 
  GraduationCap, 
  LibraryBig,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export default function RecursosPeruEducaView({ currentUser }) {
  const [activeIframe, setActiveIframe] = useState(null);
  const [activeTitulo, setActiveTitulo] = useState('');
  const recursos = [
    {
      id: 'materiales',
      titulo: 'Materiales educativos',
      descripcion: 'Accede a recursos, actividades y contenidos didácticos en formato digital.',
      url: '/recursos/materiales-educativos/index.html',
      isEmbed: true,
      icon: BookOpen,
      color: 'indigo',
      bgClass: 'bg-indigo-500/10',
      textClass: 'text-indigo-400',
      borderClass: 'border-indigo-500/20',
      hoverClass: 'hover:border-indigo-500/50 hover:bg-indigo-500/20'
    },
    {
      id: 'videoteca',
      titulo: 'Videoteca educativa',
      descripcion: 'Es una plataforma para construir una mediateca digital de contenidos audiovisuales.',
      url: '/recursos/videoteca/index.html',
      isEmbed: true,
      icon: Video,
      color: 'amber',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/20',
      hoverClass: 'hover:border-amber-500/50 hover:bg-amber-500/20'
    },
    {
      id: 'carpeta',
      titulo: 'Carpeta compartida',
      descripcion: 'Almacén de archivos digitales centralizado de libre acceso.',
      url: '/recursos/carpeta-compartida/index.html',
      isEmbed: true,
      icon: FolderSync,
      color: 'purple',
      bgClass: 'bg-purple-500/10',
      textClass: 'text-purple-400',
      borderClass: 'border-purple-500/20',
      hoverClass: 'hover:border-purple-500/50 hover:bg-purple-500/20'
    },
    {
      id: 'tabletas',
      titulo: 'Aplicaciones para Tabletas',
      descripcion: 'Instaladores de aplicaciones educativas para las tabletas.',
      url: '/recursos/tabletas/index.html',
      isEmbed: true,
      icon: TabletSmartphone,
      color: 'sky',
      bgClass: 'bg-sky-500/10',
      textClass: 'text-sky-400',
      borderClass: 'border-sky-500/20',
      hoverClass: 'hover:border-sky-500/50 hover:bg-sky-500/20'
    },
    {
      id: 'windows',
      titulo: 'Programas offline Windows',
      descripcion: 'Instaladores de aplicaciones educativas para S.O. Windows 7, 10 y 11.',
      url: '/recursos/windows/index.html',
      isEmbed: true,
      icon: Monitor,
      color: 'emerald',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/20',
      hoverClass: 'hover:border-emerald-500/50 hover:bg-emerald-500/20'
    },
    {
      id: 'moodle',
      titulo: 'Cursos offline',
      descripcion: 'En este espacio tendrás acceso a los cursos autoformativos y generar tus propios cursos.',
      url: '/recursos/moodle/index.html',
      isEmbed: true,
      icon: GraduationCap,
      color: 'rose',
      bgClass: 'bg-rose-500/10',
      textClass: 'text-rose-400',
      borderClass: 'border-rose-500/20',
      hoverClass: 'hover:border-rose-500/50 hover:bg-rose-500/20'
    },
    {
      id: 'biblioteca_general',
      titulo: 'Biblioteca General',
      descripcion: 'Repositorio institucional con libros, documentos y lecturas (vía Google Drive).',
      url: '/recursos/biblioteca-general/index.html',
      isEmbed: true,
      icon: LibraryBig,
      color: 'teal',
      bgClass: 'bg-teal-500/10',
      textClass: 'text-teal-400',
      borderClass: 'border-teal-500/20',
      hoverClass: 'hover:border-teal-500/50 hover:bg-teal-500/20'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <LibraryBig className="w-7 h-7 text-emerald-400" />
            Recursos PerúEduca
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Plataforma centralizada de recursos, materiales y bibliotecas virtuales de la I.E. Huanoquite.
          </p>
        </div>
      </div>

      {activeIframe ? (
        <div 
          className="flex flex-col mt-4 animate-fadeIn w-full"
          style={{ height: 'calc(100vh - 180px)', minHeight: '650px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-emerald-400">{activeTitulo}</h3>
            <button 
              onClick={() => {
                setActiveIframe(null);
                setActiveTitulo('');
              }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Recursos</span>
            </button>
          </div>
          <div className="flex-1 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <iframe 
              src={activeIframe} 
              className="w-full h-full border-0"
              allow="autoplay"
              title={activeTitulo}
            ></iframe>
          </div>
        </div>
      ) : (
        /* Grid de Tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recursos.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.isEmbed) {
                  setActiveIframe(item.url);
                  setActiveTitulo(item.titulo);
                } else {
                  window.open(item.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className={`group flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${item.borderClass} ${item.hoverClass} shadow-lg hover:shadow-xl`}
            >
              <div className="space-y-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.bgClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-7 h-7 ${item.textClass}`} />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-white mb-2 line-clamp-2">
                    {item.titulo}
                  </h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 line-clamp-3">
                    {item.descripcion}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/60">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${item.textClass}`}>
                  Acceder al sitio
                  <ExternalLink className="w-3 h-3" />
                </span>
                <div className={`p-1.5 rounded-full ${item.bgClass}`}>
                  <ChevronRight className={`w-4 h-4 ${item.textClass} transform transition-transform group-hover:translate-x-1`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
