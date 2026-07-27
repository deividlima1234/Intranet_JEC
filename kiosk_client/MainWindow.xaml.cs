using System;
using System.IO;
using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;

namespace KioskClient
{
    public partial class MainWindow : Window
    {
        private string _targetUrl = "https://colegiohuanoquite.org.pe/?kiosk=scanner";
        private bool _canClose = false;

        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
            Closing += MainWindow_Closing;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            LoadConfiguration();
            StatusText.Text = $"Cargando la URL del Kiosco:\n{_targetUrl}";

            try
            {
                // Inicializar el WebView2 y configurar opciones de seguridad
                await MyWebView.EnsureCoreWebView2Async(null);

                // Configurar ajustes del navegador
                MyWebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false; // Bloquear click derecho
                MyWebView.CoreWebView2.Settings.AreDevToolsEnabled = false;           // Bloquear F12 / Herramientas de Desarrollador
                MyWebView.CoreWebView2.Settings.IsZoomControlEnabled = false;         // Bloquear Zoom
                MyWebView.CoreWebView2.Settings.AreDefaultScriptDialogsEnabled = true;
                MyWebView.CoreWebView2.Settings.IsStatusBarEnabled = false;

                // Suscribirse a eventos de navegación
                MyWebView.NavigationCompleted += WebView_NavigationCompleted;
                MyWebView.NavigationStarting += WebView_NavigationStarting;

                // Iniciar la navegación a la URL configurada
                MyWebView.Source = new Uri(_targetUrl);
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Error al inicializar la cámara o el navegador de Windows:\n{ex.Message}\n\nPor favor, verifique que tenga instalado el runtime de Microsoft WebView2.";
                LoadingProgressBar.Visibility = Visibility.Collapsed;
            }
        }

        private void LoadConfiguration()
        {
            string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "kiosk_config.txt");

            try
            {
                if (!File.Exists(configPath))
                {
                    // Crear archivo de configuración por defecto si no existe
                    string defaultContent = 
                        "# CONFIGURACION DE LA ESTACION DE ESCAÑO/ASISTENCIA JEC\n" +
                        "# Cambie la URL por la correspondiente a su servidor local de Intranet JEC.\n\n" +
                        "# Estación de Escaneo y Préstamos:\n" +
                        "# URL=http://192.168.50.10/?kiosk=scanner\n\n" +
                        "# Estación de Asistencia Estudiantil:\n" +
                        "# URL=http://192.168.50.10/?kiosk=asistencia\n\n" +
                        "URL=http://192.168.50.10/?kiosk=scanner\n";

                    File.WriteAllText(configPath, defaultContent);
                }
                else
                {
                    // Leer la URL desde el archivo
                    string[] lines = File.ReadAllLines(configPath);
                    foreach (string line in lines)
                    {
                        string trimmed = line.Trim();
                        if (trimmed.StartsWith("URL=") || trimmed.StartsWith("url="))
                        {
                            string url = trimmed.Substring(4).Trim();
                            if (Uri.TryCreate(url, UriKind.Absolute, out _))
                            {
                                _targetUrl = url;
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Si falla la lectura, se mantiene el default
            }
        }

        private void WebView_NavigationStarting(object? sender, CoreWebView2NavigationStartingEventArgs e)
        {
            // Opcional: Impedir la navegación a enlaces externos que no sean del servidor del colegio
            Uri uri = new Uri(e.Uri);
            if (!uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) && 
                !uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) &&
                !uri.Host.StartsWith("192.168.", StringComparison.OrdinalIgnoreCase) &&
                !uri.Host.EndsWith("colegiohuanoquite.org.pe", StringComparison.OrdinalIgnoreCase))
            {
                e.Cancel = true;
                MessageBox.Show("Navegación bloqueada: Solo se permiten recursos de la red LAN de la institución.", "Seguridad Kiosco", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void WebView_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
        {
            if (e.IsSuccess)
            {
                // Ocultar pantalla de carga y mostrar navegador
                LoadingOverlay.Visibility = Visibility.Collapsed;
                MyWebView.Visibility = Visibility.Visible;
            }
            else
            {
                StatusText.Text = $"Error al conectar con el servidor local.\nError: {e.WebErrorStatus}\n\nVerifique que el servidor de Intranet JEC esté encendido y que este equipo tenga conexión a la red local.";
                LoadingProgressBar.Visibility = Visibility.Collapsed;
                LoadingOverlay.Visibility = Visibility.Visible;
                MyWebView.Visibility = Visibility.Collapsed;
            }
        }

        private void Window_KeyDown(object sender, KeyEventArgs e)
        {
            // Atajo de teclado para cerrar el Kiosco de forma segura: Ctrl + Shift + Q
            if ((Keyboard.Modifiers & ModifierKeys.Control) == ModifierKeys.Control &&
                (Keyboard.Modifiers & ModifierKeys.Shift) == ModifierKeys.Shift &&
                e.Key == Key.Q)
            {
                var result = MessageBox.Show("¿Desea cerrar el Quiosco JEC de la puerta?", "Cerrar Aplicación", MessageBoxButton.YesNo, MessageBoxImage.Question);
                if (result == MessageBoxResult.Yes)
                {
                    _canClose = true;
                    Close();
                }
            }
        }

        private void MainWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            // Si el intento de cierre es mediante Alt+F4 u otros métodos del sistema, cancelar
            if (!_canClose)
            {
                e.Cancel = true;
            }
        }
    }
}
