// main.js - Funciones generales de accesibilidad y utilidades
// Sistema central de gestión de temas y accesibilidad WCAG 2.2

class AccessibilityManager {
    constructor() {
        this.initThemeSystem();
        this.initFontSizeControls();
        this.initHighContrast();
        this.initSkipLinks();
        this.initKeyboardNavigation();
        this.initReducedMotion();
        this.initLiveRegions();
        this.initPrintStyles();
        this.initPerformanceOptimizations();
    }

    // ===== SISTEMA DE TEMAS =====
    initThemeSystem() {
        this.themeToggle = document.getElementById('theme-toggle') || 
                          document.getElementById('theme-toggle-login');
        
        // Cargar tema guardado o detectar preferencia del sistema
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // Aplicar tema inicial
        this.applyTheme(initialTheme);
        
        // Configurar botón de tema
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            this.updateThemeButton(initialTheme === 'dark');
        }
        
        // Escuchar cambios en las preferencias del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
                this.updateThemeButton(e.matches);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Actualizar meta tag para theme-color
        const themeColor = theme === 'dark' ? '#121212' : '#0d6efd';
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
        
        // Notificar cambio a lectores de pantalla
        this.announceToScreenReader(`Tema ${theme === 'dark' ? 'oscuro' : 'claro'} activado`);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.applyTheme(newTheme);
        this.updateThemeButton(newTheme === 'dark');
        
        // Mostrar notificación visual
        this.showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    }

    updateThemeButton(isDark) {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            this.themeToggle.setAttribute('aria-label', 
                isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
            
            // Actualizar texto si existe
            const textSpan = this.themeToggle.querySelector('span');
            if (textSpan) {
                textSpan.textContent = isDark ? ' Tema Claro' : ' Tema Oscuro';
            }
        }
    }

    // ===== CONTROL DE TAMAÑO DE FUENTE =====
    initFontSizeControls() {
        this.fontSizeButtons = {
            increase: document.getElementById('font-size-increase') || 
                     document.getElementById('font-increase-footer'),
            decrease: document.getElementById('font-size-decrease'),
            reset: document.getElementById('font-size-reset')
        };
        
        // Tamaños disponibles (en pixels)
        this.fontSizes = [14, 16, 18, 20, 22, 24];
        this.currentFontIndex = 1; // 16px por defecto
        
        // Cargar tamaño guardado
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            const savedIndex = this.fontSizes.indexOf(parseInt(savedFontSize));
            if (savedIndex > -1) {
                this.currentFontIndex = savedIndex;
                this.applyFontSize(this.fontSizes[savedIndex]);
            }
        }
        
        // Configurar botones
        Object.entries(this.fontSizeButtons).forEach(([action, button]) => {
            if (button) {
                button.addEventListener('click', () => this.adjustFontSize(action));
            }
        });
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '+') {
                e.preventDefault();
                this.adjustFontSize('increase');
            }
            
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                this.adjustFontSize('decrease');
            }
            
            if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                this.adjustFontSize('reset');
            }
        });
    }

    adjustFontSize(action) {
        switch (action) {
            case 'increase':
                if (this.currentFontIndex < this.fontSizes.length - 1) {
                    this.currentFontIndex++;
                }
                break;
                
            case 'decrease':
                if (this.currentFontIndex > 0) {
                    this.currentFontIndex--;
                }
                break;
                
            case 'reset':
                this.currentFontIndex = 1; // 16px
                break;
        }
        
        const newSize = this.fontSizes[this.currentFontIndex];
        this.applyFontSize(newSize);
        
        // Guardar preferencia
        localStorage.setItem('fontSize', newSize);
        
        // Notificar
        const sizeNames = ['Muy pequeño', 'Pequeño', 'Normal', 'Grande', 'Muy grande', 'Enorme'];
        this.showNotification(`Tamaño de fuente: ${sizeNames[this.currentFontIndex]} (${newSize}px)`, 'info');
    }

    applyFontSize(size) {
        document.documentElement.style.fontSize = `${size}px`;
        
        // Actualizar atributos ARIA
        document.documentElement.setAttribute('data-font-size', size);
    }

    // ===== ALTO CONTRASTE =====
    initHighContrast() {
        this.highContrastButtons = [
            document.getElementById('high-contrast-btn'),
            document.getElementById('high-contrast-btn-footer'),
            document.getElementById('high-contrast-login')
        ].filter(Boolean);
        
        // Cargar preferencia guardada
        const highContrastEnabled = localStorage.getItem('highContrast') === 'true';
        if (highContrastEnabled) {
            document.body.classList.add('high-contrast');
        }
        
        // Configurar botones
        this.highContrastButtons.forEach(btn => {
            btn.addEventListener('click', () => this.toggleHighContrast());
        });
        
        // Atajo de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'c') {
                e.preventDefault();
                this.toggleHighContrast();
            }
        });
    }

    toggleHighContrast() {
        const isEnabled = document.body.classList.toggle('high-contrast');
        
        // Guardar preferencia
        localStorage.setItem('highContrast', isEnabled);
        
        // Actualizar botones
        this.highContrastButtons.forEach(btn => {
            btn.setAttribute('aria-label', 
                isEnabled ? 'Desactivar alto contraste' : 'Activar alto contraste');
            
            // Actualizar ícono si existe
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isEnabled ? 'fas fa-adjust' : 'fas fa-adjust';
            }
        });
        
        // Notificar
        this.showNotification(
            isEnabled ? 'Alto contraste activado' : 'Alto contraste desactivado',
            'info'
        );
        
        this.announceToScreenReader(
            isEnabled ? 'Modo de alto contraste activado' : 'Modo de alto contraste desactivado'
        );
    }

    // ===== ENLACES DE SALTO =====
    initSkipLinks() {
        document.querySelectorAll('.skip-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Hacer el elemento enfocable temporalmente
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    
                    // Remover tabindex después del enfoque
                    setTimeout(() => {
                        targetElement.removeAttribute('tabindex');
                    }, 1000);
                    
                    // Notificar
                    this.announceToScreenReader(`Saltado a ${targetElement.getAttribute('aria-label') || 'contenido principal'}`);
                }
            });
        });
    }

    // ===== NAVEGACIÓN POR TECLADO =====
    initKeyboardNavigation() {
        // Atajos de teclado principales
        document.addEventListener('keydown', (e) => {
            // Alt + 1: Ir al contenido principal
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                this.focusMainContent();
            }
            
            // Alt + 2: Ir al pie de página
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                this.focusFooter();
            }
            
            // Alt + 3: Ir a la navegación
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                this.focusNavigation();
            }
            
            // Alt + S: Buscar
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Alt + H: Ayuda
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.showKeyboardHelp();
            }
        });
        
        // Mejorar navegación por tabulación
        this.enhanceTabNavigation();
        
        // Configurar orden de tabulación para modales
        this.setupModalFocusTraps();
    }

    enhanceTabNavigation() {
        // Asegurar que todos los elementos interactivos sean accesibles por teclado
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        document.querySelectorAll(focusableElements).forEach(el => {
            if (el.tabIndex < 0 && !el.hasAttribute('disabled')) {
                el.tabIndex = 0;
            }
        });
        
        // Mejorar visibilidad del foco
        document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (target.matches(focusableElements)) {
                target.classList.add('focused');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            const target = e.target;
            if (target.matches(focusableElements)) {
                target.classList.remove('focused');
            }
        });
    }

    setupModalFocusTraps() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('shown.bs.modal', () => {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    // Atrapar foco dentro del modal
                    modal.addEventListener('keydown', (e) => {
                        if (e.key === 'Tab') {
                            if (e.shiftKey) {
                                // Shift + Tab
                                if (document.activeElement === firstElement) {
                                    e.preventDefault();
                                    lastElement.focus();
                                }
                            } else {
                                // Tab
                                if (document.activeElement === lastElement) {
                                    e.preventDefault();
                                    firstElement.focus();
                                }
                            }
                        }
                        
                        // Esc para cerrar
                        if (e.key === 'Escape') {
                            const closeButton = modal.querySelector('[data-bs-dismiss="modal"]');
                            if (closeButton) closeButton.click();
                        }
                    });
                    
                    // Enfocar primer elemento
                    setTimeout(() => firstElement.focus(), 100);
                }
            });
        });
    }

    focusMainContent() {
        const main = document.querySelector('main');
        if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
            this.showNotification('Navegando al contenido principal', 'info');
        }
    }

    focusFooter() {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.setAttribute('tabindex', '-1');
            footer.focus();
            this.showNotification('Navegando al pie de página', 'info');
        }
    }

    focusNavigation() {
        const nav = document.querySelector('nav');
        if (nav) {
            const firstLink = nav.querySelector('a');
            if (firstLink) {
                firstLink.focus();
                this.showNotification('Navegando al menú principal', 'info');
            }
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], #search-input');
        if (searchInput) {
            searchInput.focus();
            this.showNotification('Campo de búsqueda enfocado', 'info');
        }
    }

    showKeyboardHelp() {
        // Crear o mostrar modal de ayuda
        let helpModal = document.getElementById('keyboard-help-modal');
        
        if (!helpModal) {
            helpModal = document.createElement('div');
            helpModal.id = 'keyboard-help-modal';
            helpModal.className = 'modal fade';
            helpModal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Atajos de Teclado</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Atajo</th>
                                            <th>Acción</th>
                                            <th>Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><kbd>Tab</kbd></td>
                                            <td>Navegar</td>
                                            <td>Moverse entre elementos interactivos</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Shift + Tab</kbd></td>
                                            <td>Navegar atrás</td>
                                            <td>Moverse en reversa entre elementos</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + 1</kbd></td>
                                            <td>Contenido principal</td>
                                            <td>Ir al contenido principal de la página</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + 2</kbd></td>
                                            <td>Pie de página</td>
                                            <td>Ir al pie de página</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + 3</kbd></td>
                                            <td>Navegación</td>
                                            <td>Ir al menú de navegación principal</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + M</kbd></td>
                                            <td>Mezclar</td>
                                            <td>Mezclar reactivos en el simulador</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + R</kbd></td>
                                            <td>Reiniciar</td>
                                            <td>Reiniciar experimento</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + C</kbd></td>
                                            <td>Contraste</td>
                                            <td>Alternar alto contraste</td>
                                        </tr>
                                        <tr>
                                            <td><kbd>Alt + A</kbd></td>
                                            <td>Audio</td>
                                            <td>Activar descripción de audio</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(helpModal);
        }
        
        const modal = new bootstrap.Modal(helpModal);
        modal.show();
    }

    // ===== MOVIMIENTO REDUCIDO =====
    initReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            this.disableAnimations();
        }
        
        // Escuchar cambios en la preferencia
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                this.disableAnimations();
            } else {
                this.enableAnimations();
            }
        });
    }

    disableAnimations() {
        document.documentElement.classList.add('reduced-motion');
        
        // Deshabilitar animaciones CSS
        const style = document.createElement('style');
        style.id = 'reduced-motion-styles';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            .reaction-active,
            .reaction-hot {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    enableAnimations() {
        document.documentElement.classList.remove('reduced-motion');
        const style = document.getElementById('reduced-motion-styles');
        if (style) style.remove();
    }

    // ===== REGIONES EN VIVO (LIVE REGIONS) =====
    initLiveRegions() {
        // Crear región en vivo para notificaciones dinámicas
        const liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'visually-hidden';
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }

    announceToScreenReader(message) {
        if (!this.liveRegion) return;
        
        // Limpiar mensaje anterior
        this.liveRegion.textContent = '';
        
        // Agregar nuevo mensaje después de un breve delay
        setTimeout(() => {
            this.liveRegion.textContent = message;
        }, 100);
    }

    // ===== ESTILOS DE IMPRESIÓN =====
    initPrintStyles() {
        // Añadir botón de impresión si no existe
        const printButton = document.getElementById('print-button');
        if (!printButton) {
            const btn = document.createElement('button');
            btn.id = 'print-button';
            btn.className = 'btn btn-outline-secondary btn-sm no-print';
            btn.innerHTML = '<i class="fas fa-print me-1"></i> Imprimir';
            btn.addEventListener('click', () => window.print());
            
            // Insertar en un lugar apropiado
            const container = document.querySelector('header .container') || document.body;
            container.appendChild(btn);
        }
        
        // Estilos específicos para impresión
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('printing');
        });
        
        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing');
        });
    }

    // ===== OPTIMIZACIONES DE RENDIMIENTO =====
    initPerformanceOptimizations() {
        // Lazy loading para imágenes
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
            });
        }
        
        // Intersection Observer para carga perezosa
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                        }
                        
                        lazyObserver.unobserve(element);
                    }
                });
            });
            
            document.querySelectorAll('[data-src]').forEach(element => {
                lazyObserver.observe(element);
            });
        }
        
        // Preconexión a recursos externos
        const preconnectLinks = [
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com'
        ];
        
        preconnectLinks.forEach(link => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = link;
            preconnect.crossOrigin = '';
            document.head.appendChild(preconnect);
        });
    }

    // ===== NOTIFICACIONES VISUALES =====
    showNotification(message, type = 'info') {
        // Crear contenedor si no existe
        let container = document.getElementById('a11y-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'a11y-notifications';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 1060;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            animation: slideInRight 0.3s ease-out;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getNotificationIcon(type)} me-2 fs-5"></i>
                <span class="flex-grow-1">${message}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                const bsAlert = new bootstrap.Alert(notification);
                bsAlert.close();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'danger': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ===== VALIDACIÓN DE FORMULARIOS GLOBAL =====
    initFormValidation() {
        document.querySelectorAll('form').forEach(form => {
            if (!form.hasAttribute('novalidate')) {
                form.setAttribute('novalidate', '');
            }
            
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Encontrar y enfocar primer campo inválido
                    const firstInvalid = form.querySelector(':invalid');
                    if (firstInvalid) {
                        firstInvalid.focus();
                        
                        // Mostrar mensaje de error
                        const fieldName = firstInvalid.labels?.[0]?.textContent || 'Este campo';
                        this.showNotification(
                            `${fieldName} requiere atención. Por favor completa el formulario correctamente.`,
                            'warning'
                        );
                    }
                }
                
                form.classList.add('was-validated');
            });
        });
    }

    // ===== DETECCIÓN DE CONEXIÓN =====
    initConnectionDetection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.saveData) {
                // Modo de ahorro de datos activado
                this.enableDataSaverMode();
            }
            
            if (connection.effectiveType.includes('2g') || connection.effectiveType.includes('3g')) {
                // Conexión lenta
                this.enableLowBandwidthMode();
            }
            
            // Escuchar cambios en la conexión
            connection.addEventListener('change', () => {
                if (connection.saveData) {
                    this.enableDataSaverMode();
                } else {
                    this.disableDataSaverMode();
                }
            });
        }
    }

    enableDataSaverMode() {
        // Deshabilitar características que consumen datos
        document.documentElement.classList.add('data-saver');
        
        // Deshabilitar imágenes de fondo
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
            el.dataset.originalBackground = el.style.backgroundImage;
            el.style.backgroundImage = 'none';
        });
        
        // Deshabilitar videos autoplay
        document.querySelectorAll('video[autoplay]').forEach(video => {
            video.pause();
            video.controls = true;
        });
    }

    disableDataSaverMode() {
        document.documentElement.classList.remove('data-saver');
        
        // Restaurar imágenes de fondo
        document.querySelectorAll('[data-original-background]').forEach(el => {
            el.style.backgroundImage = el.dataset.originalBackground;
            delete el.dataset.originalBackground;
        });
    }

    enableLowBandwidthMode() {
        document.documentElement.classList.add('low-bandwidth');
        this.showNotification('Modo de bajo ancho de banda activado para mejor rendimiento', 'info');
    }

    // ===== INICIALIZACIÓN COMPLETA =====
    initialize() {
        // Ejecutar todas las inicializaciones
        this.initFormValidation();
        this.initConnectionDetection();
        
        // Añadir estilos adicionales
        this.addAccessibilityStyles();
        
        // Marcar página como cargada
        document.documentElement.classList.add('a11y-initialized');
        
        // Notificar que la página es accesible
        this.announceToScreenReader('Página completamente cargada y accesible');
        this.showNotification('Sistema de accesibilidad WCAG 2.2 inicializado', 'success');
    }

    addAccessibilityStyles() {
        const styles = `
            /* Mejoras de enfoque */
            .focused {
                outline: 3px solid #0d6efd !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.25) !important;
            }
            
            /* Modo de ahorro de datos */
            .data-saver img:not([src*="logo"]) {
                filter: grayscale(100%);
                opacity: 0.8;
            }
            
            .data-saver video {
                display: none;
            }
            
            /* Bajo ancho de banda */
            .low-bandwidth .experiment-area {
                background: #f8f9fa !important;
            }
            
            /* Animaciones de notificación */
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* Estados de carga */
            .processing {
                opacity: 0.7;
                pointer-events: none;
            }
            
            /* Contraste mejorado para error */
            .is-invalid {
                border-color: #dc3545 !important;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e") !important;
            }
            
            .is-valid {
                border-color: #198754 !important;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e") !important;
            }
            
            /* Alto contraste mejorado */
            .high-contrast *:focus {
                outline: 3px solid #000000 !important;
                outline-offset: 3px !important;
            }
            
            .high-contrast .btn-primary {
                background-color: #000000 !important;
                color: #ffffff !important;
                border: 3px solid #000000 !important;
            }
            
            /* Impresión */
            @media print {
                .no-print {
                    display: none !important;
                }
                
                a[href]:after {
                    content: " (" attr(href) ")";
                }
                
                .break-after {
                    break-after: always;
                }
                
                .break-before {
                    break-before: always;
                }
                
                .break-inside-avoid {
                    break-inside: avoid;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Inicializar el gestor de accesibilidad
document.addEventListener('DOMContentLoaded', () => {
    window.a11yManager = new AccessibilityManager();
    window.a11yManager.initialize();
    
    // Exponer funciones útiles globalmente
    window.toggleTheme = () => window.a11yManager.toggleTheme();
    window.toggleHighContrast = () => window.a11yManager.toggleHighContrast();
    window.showNotification = (msg, type) => window.a11yManager.showNotification(msg, type);
    window.announceToScreenReader = (msg) => window.a11yManager.announceToScreenReader(msg);
});