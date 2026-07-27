import { useState, useEffect, useRef } from 'react';
import {
  X, Download, ZoomIn, ZoomOut, RotateCw, Loader2,
  AlertTriangle, FileText, FileSpreadsheet, FileImage, File, RefreshCw,
  Presentation
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { renderAsync } from 'docx-preview';
import { PowerPointViewer } from 'pptx-react-viewer';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { translationsEn, keyToLabel } from 'pptx-react-viewer/i18n';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: translationsEn }
      },
      lng: "en",
      fallbackLng: "en",
      parseMissingKeyHandler: keyToLabel,
      interpolation: { escapeValue: false }
    });
}
export default function DocumentViewerModal({ isOpen, onClose, fileUrl, fileName }) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('');

  // Estados para visualizador de Imagen
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Estados para visualizador de Excel
  const [excelSheets, setExcelSheets] = useState([]); // [{ name, html }]
  const [activeSheet, setActiveSheet] = useState(0);

  // Estados para visualizador de Texto
  const [textContent, setTextContent] = useState('');

  // Estados para PPTX
  const [pptxContent, setPptxContent] = useState(null);

  // Refs para DOCX y contenedores
  const docxContainerRef = useRef(null);
  const isMounted = useRef(true);

  // Determinar extensión del archivo
  const getExtension = (name) => {
    if (!name) return '';
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  const extension = getExtension(fileName);

  // Obtener URL de descarga e inline
  const getInlineUrl = () => {
    if (!fileUrl) return '';
    return fileUrl + (fileUrl.includes('?') ? '&inline=true' : '?inline=true');
  };

  useEffect(() => {
    if (!isOpen) return;

    isMounted.current = true;
    setLoading(true);
    setError(null);
    setScale(1);
    setRotation(0);
    setExcelSheets([]);
    setTextContent('');
    setPptxContent(null);

    const loadDocument = async () => {
      const inlineUrl = getInlineUrl();

      try {
        // Formatos de Imagen
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
          setFileType('image');
          setLoading(false);
        }
        // PDF
        else if (extension === 'pdf') {
          setFileType('pdf');
          setLoading(false); // iFrame maneja su propia carga
        }
        // Excel
        else if (['xlsx', 'xls'].includes(extension)) {
          setFileType('excel');
          const response = await fetch(inlineUrl);
          if (!response.ok) throw new Error('No se pudo descargar el archivo Excel.');
          
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          const sheets = workbook.SheetNames.map((name) => {
            const worksheet = workbook.Sheets[name];
            // Convertir a HTML
            const html = XLSX.utils.sheet_to_html(worksheet, { 
              editable: false, 
              header: '', 
              footer: '' 
            });
            return { name, html };
          });

          if (isMounted.current) {
            setExcelSheets(sheets);
            setActiveSheet(0);
            setLoading(false);
          }
        }
        // Word (.docx)
        else if (extension === 'docx') {
          setFileType('docx');
          const response = await fetch(inlineUrl);
          if (!response.ok) throw new Error('No se pudo descargar el archivo Word.');
          
          const blob = await response.blob();
          
          // Esperar a que el ref esté listo y renderizar
          setTimeout(async () => {
            if (isMounted.current && docxContainerRef.current) {
              try {
                docxContainerRef.current.innerHTML = '';
                await renderAsync(blob, docxContainerRef.current, null, {
                  className: 'docx-preview',
                  inWrapper: false,
                  ignoreWidth: false,
                  ignoreHeight: false
                });
                if (isMounted.current) setLoading(false);
              } catch (docxErr) {
                console.error(docxErr);
                if (isMounted.current) {
                  setError('Error al renderizar el documento Word.');
                  setLoading(false);
                }
              }
            }
          }, 100);
        }
        // Archivos de Texto y código
        else if (['txt', 'csv', 'sql', 'json', 'md', 'js', 'py', 'java', 'html', 'css', 'xml'].includes(extension)) {
          setFileType('text');
          const response = await fetch(inlineUrl);
          if (!response.ok) throw new Error('No se pudo descargar el archivo de texto.');
          
          const text = await response.text();
          if (isMounted.current) {
            setTextContent(text);
            setLoading(false);
          }
        }
        // PowerPoint (.pptx, .ppt)
        else if (['pptx', 'ppt'].includes(extension)) {
          setFileType('pptx');
          const response = await fetch(inlineUrl);
          if (!response.ok) throw new Error('No se pudo descargar la presentación de PowerPoint.');
          
          const arrayBuffer = await response.arrayBuffer();
          if (isMounted.current) {
            setPptxContent(new Uint8Array(arrayBuffer));
            setLoading(false);
          }
        }
        // Formato no soportado para previsualizar (Fallback)
        else {
          setFileType('fallback');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando documento:', err);
        if (isMounted.current) {
          setError(err.message || 'Ocurrió un error al cargar el archivo.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted.current = false;
    };
  }, [fileUrl, fileName, extension]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetZoom = () => {
    setScale(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 md:p-6 animate-fadeIn">
      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
              {['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension) ? (
                <FileImage className="w-5 h-5" />
              ) : ['xlsx', 'xls'].includes(extension) ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : ['pptx', 'ppt'].includes(extension) ? (
                <Presentation className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate" title={fileName}>
                {fileName}
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Previsualización en línea
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Descargar mientras se previsualiza */}
            <a
              href={fileUrl}
              download
              className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-emerald-450 hover:text-emerald-400 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Descargar archivo completo"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Descargar</span>
            </a>
            {/* Cerrar modal */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-950 hover:bg-rose-955 hover:text-rose-455 border border-slate-800 text-slate-400 rounded-xl cursor-pointer transition-all"
              title="Cerrar visualizador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel de Visualización */}
        <div className="flex-1 overflow-auto bg-slate-950/20 p-4 md:p-6 flex flex-col items-center justify-center relative">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-900 text-slate-400">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs font-semibold">Procesando y cargando archivo...</span>
            </div>
          )}

          {error && (
            <div className="max-w-md p-6 bg-rose-955/20 border border-rose-900/50 rounded-2xl text-center space-y-4 z-10">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">No se pudo mostrar la vista previa</h4>
                <p className="text-xs text-slate-455">{error}</p>
              </div>
              <a
                href={fileUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar archivo</span>
              </a>
            </div>
          )}

          {!error && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {/* VISTA DE IMAGEN */}
              {fileType === 'image' && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {/* Controles flotantes */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
                    <button
                      onClick={handleZoomIn}
                      className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
                      title="Acercar (Zoom In)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
                      title="Alejar (Zoom Out)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRotate}
                      className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer transition-colors"
                      title="Rotar 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono px-1 font-bold">
                      {Math.round(scale * 100)}%
                    </span>
                    {(scale !== 1 || rotation !== 0) && (
                      <button
                        onClick={handleResetZoom}
                        className="text-[9px] bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors font-bold uppercase"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {/* Contenedor de la imagen */}
                  <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-8">
                    <img
                      src={getInlineUrl()}
                      alt={fileName}
                      style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                      className="max-h-[68vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800 bg-slate-955/40 transition-transform duration-200 ease-out"
                    />
                  </div>
                </div>
              )}

              {/* VISTA PDF */}
              {fileType === 'pdf' && (
                <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-850 bg-slate-950">
                  <iframe
                    src={getInlineUrl()}
                    className="w-full h-full border-0"
                    title={`PDF: ${fileName}`}
                  />
                </div>
              )}

              {/* VISTA EXCEL */}
              {fileType === 'excel' && (
                <div className="w-full h-full flex flex-col">
                  {excelSheets.length === 0 ? (
                    <div className="text-center text-xs text-slate-500 py-10">
                      No hay contenido para mostrar en esta hoja de cálculo.
                    </div>
                  ) : (
                    <>
                      {/* Pestañas de hojas Excel */}
                      <div className="flex bg-slate-950/60 border border-slate-800 p-1 rounded-2xl gap-1 max-w-full overflow-x-auto mb-4 self-start shrink-0">
                        {excelSheets.map((sheet, index) => (
                          <button
                            key={sheet.name}
                            onClick={() => setActiveSheet(index)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                              activeSheet === index
                                ? 'bg-indigo-505 text-slate-950 shadow-md shadow-indigo-505/10'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                            }`}
                          >
                            {sheet.name}
                          </button>
                        ))}
                      </div>
                      
                      {/* Contenedor de la tabla */}
                      <div className="flex-1 overflow-auto border border-slate-850 rounded-2xl bg-slate-950/20 excel-preview-container">
                        <div 
                          dangerouslySetInnerHTML={{ __html: excelSheets[activeSheet]?.html || '' }} 
                          className="excel-preview-table-wrapper w-full h-full p-2"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* VISTA WORD (DOCX) */}
              {fileType === 'docx' && (
                <div className="w-full h-full overflow-auto p-2 bg-slate-950/20 border border-slate-850 rounded-2xl flex flex-col">
                  <div 
                    ref={docxContainerRef} 
                    className="docx-viewer-wrapper bg-white text-black p-6 md:p-10 my-4 rounded-xl shadow-2xl w-full"
                  />
                </div>
              )}

              {/* VISTA TEXTO / CÓDIGO */}
              {fileType === 'text' && (
                <div className="w-full h-full border border-slate-855 bg-slate-955 rounded-2xl overflow-auto p-4 font-mono text-xs text-slate-350 select-text leading-relaxed">
                  <table className="w-full border-collapse">
                    <tbody>
                      {textContent.split('\n').map((line, i) => (
                        <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                          <td className="w-10 text-right pr-4 text-slate-600 select-none font-bold border-r border-slate-900">
                            {i + 1}
                          </td>
                          <td className="pl-4 whitespace-pre-wrap word-break-all text-slate-300">
                            {line || ' '}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VISTA PPTX */}
              {fileType === 'pptx' && pptxContent && (
                <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 relative border border-slate-850">
                  <I18nextProvider i18n={i18n}>
                    <PowerPointViewer content={pptxContent} />
                  </I18nextProvider>
                </div>
              )}

              {/* FALLBACK NO PREVISUALIZABLE */}
              {fileType === 'fallback' && (
                <div className="max-w-md p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl w-fit mx-auto text-slate-500">
                    <File className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-200">
                      Previsualización no disponible
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      El formato del archivo <span className="font-mono text-slate-400">.{extension}</span> no se puede abrir directamente en el navegador. Puedes descargarlo en tu equipo para abrirlo localmente.
                    </p>
                  </div>
                  <a
                    href={fileUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar archivo</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de página informativo */}
        <div className="px-6 py-3 border-t border-slate-800/60 bg-slate-950/40 text-[10px] text-slate-505 font-semibold flex justify-between items-center shrink-0">
          <span>Formato: .{extension.toUpperCase()}</span>
          <span>Presiona "Esc" o haz clic en "Cerrar" para salir</span>
        </div>
      </div>
    </div>
  );
}
