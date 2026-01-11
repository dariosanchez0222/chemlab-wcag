/// Simulador de Laboratorio de Química - Lógica principal
// ChemLab Simulator - Implementación WCAG 2.2 compatible

class ChemLabSimulator {
    constructor() {
        this.initElements();
        this.initState();
        this.initEventListeners();
        this.initAccessibility();
    }

    initElements() {
        // Elementos del DOM para el simulador
        this.reactivo1Select = document.getElementById('reactivo1');
        this.reactivo2Select = document.getElementById('reactivo2');
        this.cantidad1Slider = document.getElementById('cantidad1');
        this.cantidad2Slider = document.getElementById('cantidad2');
        this.cantidad1Value = document.getElementById('cantidad1-value');
        this.cantidad2Value = document.getElementById('cantidad2-value');
        this.mezclarBtn = document.getElementById('mezclar-btn');
        this.calentarBtn = document.getElementById('calentar-btn');
        this.limpiarBtn = document.getElementById('limpiar-btn');
        this.audioDescBtn = document.getElementById('audio-desc-btn');
        this.liquidElement = document.getElementById('liquid');
        this.statusText = document.getElementById('status-text');
        this.resultMessage = document.getElementById('result-message');
        this.measurementsDiv = document.getElementById('measurements');
        this.tempValue = document.getElementById('temp-value');
        this.phValue = document.getElementById('ph-value');
        this.colorValue = document.getElementById('color-value');
        this.stateValue = document.getElementById('state-value');
        this.reactionContainer = document.getElementById('reaction-container');
    }

    initState() {
        // Estado inicial del experimento
        this.state = {
            reactivo1: null,
            reactivo2: null,
            cantidad1: 50,
            cantidad2: 50,
            temperature: 25,
            ph: 7.0,
            color: 'Incoloro',
            state: 'Inactivo',
            isHeating: false,
            isMixed: false,
            currentReaction: null
        };

        // Base de datos de reactivos
        this.reactivos = {
            'hcl': {
                nombre: 'Ácido Clorhídrico (HCl)',
                tipo: 'ácido',
                color: '#4dabf7',
                ph: 1.0,
                concentracion: '1M',
                descripcion: 'Ácido fuerte, corrosivo'
            },
            'naoh': {
                nombre: 'Hidróxido de Sodio (NaOH)',
                tipo: 'base',
                color: '#ffa94d',
                ph: 13.0,
                concentracion: '1M',
                descripcion: 'Base fuerte, cáustica'
            },
            'agno3': {
                nombre: 'Nitrato de Plata (AgNO₃)',
                tipo: 'sal',
                color: '#ffffff',
                ph: 6.0,
                concentracion: '0.1M',
                descripcion: 'Sal soluble, fotosensible'
            },
            'nacl': {
                nombre: 'Cloruro de Sodio (NaCl)',
                tipo: 'sal',
                color: '#ffffff',
                ph: 7.0,
                concentracion: '0.1M',
                descripcion: 'Sal común, soluble'
            },
            'cuso4': {
                nombre: 'Sulfato de Cobre (CuSO₄)',
                tipo: 'sal',
                color: '#339af0',
                ph: 4.5,
                concentracion: '0.5M',
                descripcion: 'Sal azul, tóxica'
            },
            'h2o2': {
                nombre: 'Peróxido de Hidrógeno (H₂O₂)',
                tipo: 'oxidante',
                color: '#d0ebff',
                ph: 4.5,
                concentracion: '3%',
                descripcion: 'Agente oxidante débil'
            }
        };

        // Reacciones químicas posibles
        this.reacciones = {
            'hcl-naoh': {
                nombre: 'Neutralización Ácido-Base',
                descripcion: 'HCl + NaOH → NaCl + H₂O. Reacción exotérmica con liberación de calor.',
                color: '#69db7c',
                ph: 7.0,
                deltaTemp: 15,
                mensaje: '¡Neutralización exitosa! Se formó agua y cloruro de sodio. La temperatura aumentó 15°C.',
                ecuacion: 'HCl + NaOH → NaCl + H₂O',
                tipo: 'neutralización'
            },
            'agno3-nacl': {
                nombre: 'Formación de Precipitado',
                descripcion: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃. Se forma un precipitado blanco de cloruro de plata.',
                color: '#ffffff',
                ph: 6.5,
                deltaTemp: 2,
                mensaje: '¡Precipitado formado! Observa el sólido blanco en el fondo del matraz.',
                ecuacion: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
                tipo: 'precipitación'
            },
            'hcl-agno3': {
                nombre: 'Reacción con formación de gas',
                descripcion: 'HCl + AgNO₃ → AgCl↓ + HNO₃. Se forma precipitado y ácido nítrico.',
                color: '#ffd8a8',
                ph: 2.0,
                deltaTemp: 5,
                mensaje: 'Precipitado blanco formado. La solución es ahora ácida (pH 2.0).',
                ecuacion: 'HCl + AgNO₃ → AgCl↓ + HNO₃',
                tipo: 'doble desplazamiento'
            },
            'cuso4-naoh': {
                nombre: 'Formación de hidróxido',
                descripcion: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄. Se forma hidróxido de cobre azul.',
                color: '#339af0',
                ph: 7.5,
                deltaTemp: 3,
                mensaje: 'Hidróxido de cobre azul formado. Precipitado azul característico.',
                ecuacion: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
                tipo: 'precipitación'
            },
            'default': {
                nombre: 'Mezcla simple',
                descripcion: 'Los reactivos se mezclan sin reacción química significativa.',
                color: '#a5d8ff',
                ph: null, // Se calcula
                deltaTemp: 0,
                mensaje: 'Los reactivos se han mezclado físicamente sin reacción química observable.',
                ecuacion: 'Sin reacción química',
                tipo: 'mezcla física'
            }
        };
    }

    initEventListeners() {
        // Eventos para sliders
        if (this.cantidad1Slider) {
            this.cantidad1Slider.addEventListener('input', (e) => {
                this.state.cantidad1 = parseInt(e.target.value);
                this.cantidad1Value.textContent = `${this.state.cantidad1} mL`;
                this.updateAccessibilityLabels();
            });
        }

        if (this.cantidad2Slider) {
            this.cantidad2Slider.addEventListener('input', (e) => {
                this.state.cantidad2 = parseInt(e.target.value);
                this.cantidad2Value.textContent = `${this.state.cantidad2} mL`;
                this.updateAccessibilityLabels();
            });
        }

        // Evento para mezclar
        if (this.mezclarBtn) {
            this.mezclarBtn.addEventListener('click', () => this.mixReactivos());
            this.mezclarBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.mixReactivos();
                }
            });
        }

        // Evento para calentar
        if (this.calentarBtn) {
            this.calentarBtn.addEventListener('click', () => this.applyHeat());
        }

        // Evento para limpiar
        if (this.limpiarBtn) {
            this.limpiarBtn.addEventListener('click', () => this.resetExperiment());
        }

        // Evento para descripción de audio
        if (this.audioDescBtn) {
            this.audioDescBtn.addEventListener('click', () => this.playAudioDescription());
        }

        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => {
            // Alt + M para mezclar
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                this.mixReactivos();
                this.showNotification('Reactivos mezclados (Atajo: Alt+M)');
            }
            
            // Alt + R para resetear
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                this.resetExperiment();
                this.showNotification('Experimento reiniciado (Atajo: Alt+R)');
            }
            
            // Alt + H para calentar
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.applyHeat();
                this.showNotification('Calor aplicado (Atajo: Alt+H)');
            }
            
            // Alt + A para audio descripción
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.playAudioDescription();
                this.showNotification('Descripción de audio activada (Atajo: Alt+A)');
            }
        });
    }

    initAccessibility() {
        // Inicializar etiquetas ARIA
        this.updateAccessibilityLabels();
        
        // Asegurar que todos los controles sean accesibles por teclado
        const interactiveElements = [
            this.reactivo1Select,
            this.reactivo2Select,
            this.cantidad1Slider,
            this.cantidad2Slider,
            this.mezclarBtn,
            this.calentarBtn,
            this.limpiarBtn,
            this.audioDescBtn
        ];
        
        interactiveElements.forEach(el => {
            if (el) {
                el.setAttribute('tabindex', '0');
                if (el.tabIndex < 0) el.tabIndex = 0;
            }
        });
    }

    updateAccessibilityLabels() {
        // Actualizar etiquetas ARIA para lectores de pantalla
        if (this.cantidad1Slider) {
            this.cantidad1Slider.setAttribute('aria-valuenow', this.state.cantidad1);
            this.cantidad1Slider.setAttribute('aria-valuetext', `${this.state.cantidad1} mililitros`);
        }
        
        if (this.cantidad2Slider) {
            this.cantidad2Slider.setAttribute('aria-valuenow', this.state.cantidad2);
            this.cantidad2Slider.setAttribute('aria-valuetext', `${this.state.cantidad2} mililitros`);
        }
        
        if (this.mezclarBtn) {
            const r1 = this.reactivo1Select ? this.reactivo1Select.options[this.reactivo1Select.selectedIndex]?.text : 'Reactivo 1';
            const r2 = this.reactivo2Select ? this.reactivo2Select.options[this.reactivo2Select.selectedIndex]?.text : 'Reactivo 2';
            this.mezclarBtn.setAttribute('aria-label', `Mezclar ${r1} y ${r2}`);
        }
    }

    mixReactivos() {
        const r1 = this.reactivo1Select ? this.reactivo1Select.value : null;
        const r2 = this.reactivo2Select ? this.reactivo2Select.value : null;
        
        // Validación de entrada
        if (!r1 || !r2) {
            this.showResultMessage('Por favor selecciona ambos reactivos antes de mezclar.', 'warning');
            this.focusFirstInvalidField();
            return;
        }
        
        if (r1 === r2) {
            this.showResultMessage('Selecciona dos reactivos diferentes para observar una reacción.', 'warning');
            if (this.reactivo2Select) this.reactivo2Select.focus();
            return;
        }
        
        // Actualizar estado
        this.state.reactivo1 = r1;
        this.state.reactivo2 = r2;
        this.state.isMixed = true;
        this.state.isHeating = false;
        
        // Determinar reacción
        const reactionKey = `${r1}-${r2}`;
        const reverseKey = `${r2}-${r1}`;
        this.state.currentReaction = this.reacciones[reactionKey] || this.reacciones[reverseKey] || this.reacciones['default'];
        
        // Calcular propiedades
        this.calculateMixtureProperties();
        
        // Actualizar interfaz
        this.updateVisualization();
        this.updateMeasurements();
        
        // Mostrar resultados
        this.showResultMessage(this.state.currentReaction.mensaje, 'success');
        
        // Activar mediciones
        if (this.measurementsDiv) {
            this.measurementsDiv.classList.remove('d-none');
        }
        
        // Actualizar para lectores de pantalla
        if (this.statusText) {
            this.statusText.textContent = `Reacción en progreso: ${this.state.currentReaction.nombre}`;
            this.statusText.setAttribute('aria-live', 'assertive');
        }
        
        // Efectos visuales
        if (this.reactionContainer) {
            this.reactionContainer.classList.add('reaction-active');
        }
        
        // Sonido de reacción
        this.playReactionSound();
        
        // Notificación de accesibilidad
        this.showNotification(`Reacción iniciada: ${this.state.currentReaction.nombre}`);
    }

    calculateMixtureProperties() {
        const totalVolume = this.state.cantidad1 + this.state.cantidad2;
        
        // Calcular temperatura
        const baseTemp = 25;
        const tempIncrease = this.state.currentReaction.deltaTemp || 0;
        this.state.temperature = baseTemp + tempIncrease;
        
        // Calcular pH
        if (this.state.currentReaction.ph !== null) {
            this.state.ph = this.state.currentReaction.ph;
        } else {
            // Calcular pH promedio si no está definido
            const ph1 = this.reactivos[this.state.reactivo1]?.ph || 7;
            const ph2 = this.reactivos[this.state.reactivo2]?.ph || 7;
            const ratio1 = this.state.cantidad1 / totalVolume;
            const ratio2 = this.state.cantidad2 / totalVolume;
            this.state.ph = (ph1 * ratio1 + ph2 * ratio2).toFixed(1);
        }
        
        // Determinar color
        this.state.color = this.getColorName(this.state.currentReaction.color);
        
        // Actualizar estado
        this.state.state = 'Reacción activa';
    }

    updateVisualization() {
        if (!this.liquidElement) return;
        
        const totalVolume = this.state.cantidad1 + this.state.cantidad2;
        const liquidHeight = Math.min(90, (totalVolume / 200) * 100);
        
        // Actualizar líquido
        this.liquidElement.style.height = `${liquidHeight}%`;
        this.liquidElement.style.backgroundColor = this.state.currentReaction.color;
        
        // Efectos especiales
        if (this.state.currentReaction.tipo === 'precipitación') {
            this.liquidElement.classList.add('reaction-precipitate');
        } else {
            this.liquidElement.classList.remove('reaction-precipitate');
        }
        
        // Efecto de burbujas para reacciones exotérmicas
        if (this.state.currentReaction.deltaTemp > 10) {
            this.reactionContainer.classList.add('reaction-active');
        }
    }

    updateMeasurements() {
        if (!this.tempValue || !this.phValue || !this.colorValue || !this.stateValue) return;
        
        this.tempValue.textContent = this.state.temperature.toFixed(1);
        this.phValue.textContent = this.state.ph;
        this.colorValue.textContent = this.state.color;
        this.stateValue.textContent = this.state.state;
        
        // Actualizar etiquetas ARIA
        this.tempValue.setAttribute('aria-label', `Temperatura: ${this.state.temperature} grados Celsius`);
        this.phValue.setAttribute('aria-label', `pH: ${this.state.ph}`);
        this.colorValue.setAttribute('aria-label', `Color: ${this.state.color}`);
        this.stateValue.setAttribute('aria-label', `Estado: ${this.state.state}`);
    }

    applyHeat() {
        if (!this.state.isMixed) {
            this.showResultMessage('Primero mezcla algunos reactivos antes de aplicar calor.', 'warning');
            return;
        }
        
        this.state.isHeating = true;
        this.state.temperature += 20;
        
        // Efectos visuales
        if (this.reactionContainer) {
            this.reactionContainer.classList.add('reaction-hot');
        }
        
        if (this.liquidElement) {
            this.liquidElement.style.backgroundColor = '#ff6b6b';
        }
        
        // Actualizar mediciones
        this.state.color = 'Rojo (por calor)';
        this.state.state = 'Calentando';
        this.updateMeasurements();
        
        // Mensaje
        this.showResultMessage('Calor aplicado. La temperatura ha aumentado significativamente.', 'info');
        
        // Sonido de calor
        setTimeout(() => {
            if (this.reactionContainer) {
                this.reactionContainer.classList.remove('reaction-hot');
            }
        }, 3000);
        
        // Notificación
        this.showNotification('Calor aplicado al experimento');
    }

    resetExperiment() {
        // Reiniciar estado
        this.state = {
            reactivo1: null,
            reactivo2: null,
            cantidad1: 50,
            cantidad2: 50,
            temperature: 25,
            ph: 7.0,
            color: 'Incoloro',
            state: 'Inactivo',
            isHeating: false,
            isMixed: false,
            currentReaction: null
        };
        
        // Reiniciar controles
        if (this.reactivo1Select) this.reactivo1Select.selectedIndex = 0;
        if (this.reactivo2Select) this.reactivo2Select.selectedIndex = 0;
        if (this.cantidad1Slider) this.cantidad1Slider.value = 50;
        if (this.cantidad2Slider) this.cantidad2Slider.value = 50;
        if (this.cantidad1Value) this.cantidad1Value.textContent = '50 mL';
        if (this.cantidad2Value) this.cantidad2Value.textContent = '50 mL';
        
        // Reiniciar visualización
        if (this.liquidElement) {
            this.liquidElement.style.height = '0%';
            this.liquidElement.style.backgroundColor = '#4dabf7';
            this.liquidElement.classList.remove('reaction-precipitate');
        }
        
        if (this.reactionContainer) {
            this.reactionContainer.classList.remove('reaction-active', 'reaction-hot');
        }
        
        // Reiniciar mediciones
        if (this.measurementsDiv) {
            this.measurementsDiv.classList.add('d-none');
        }
        
        if (this.tempValue) this.tempValue.textContent = '25';
        if (this.phValue) this.phValue.textContent = '7.0';
        if (this.colorValue) this.colorValue.textContent = 'Incoloro';
        if (this.stateValue) this.stateValue.textContent = 'Inactivo';
        
        // Reiniciar mensajes
        if (this.statusText) {
            this.statusText.textContent = 'Selecciona reactivos y haz clic en "Mezclar"';
        }
        
        if (this.resultMessage) {
            this.resultMessage.classList.add('d-none');
        }
        
        // Notificación
        this.showNotification('Experimento reiniciado. Listo para comenzar uno nuevo.');
        
        // Enfocar primer control
        if (this.reactivo1Select) {
            setTimeout(() => this.reactivo1Select.focus(), 100);
        }
    }

    playAudioDescription() {
        if (!('speechSynthesis' in window)) {
            this.showNotification('La síntesis de voz no está disponible en tu navegador', 'warning');
            return;
        }
        
        // Detener cualquier lectura en curso
        window.speechSynthesis.cancel();
        
        let message = '';
        
        if (!this.state.isMixed) {
            message = 'Simulador de laboratorio de química ChemLab. ';
            message += 'Selecciona dos reactivos de los menús desplegables, ';
            message += 'ajusta sus cantidades con los deslizadores y ';
            message += 'presiona el botón "Mezclar Reactivos" para comenzar un experimento.';
        } else {
            const r1 = this.reactivos[this.state.reactivo1]?.nombre || 'Reactivo 1';
            const r2 = this.reactivos[this.state.reactivo2]?.nombre || 'Reactivo 2';
            const reaction = this.state.currentReaction.nombre;
            
            message = `Experimento activo. Has mezclado ${r1} y ${r2}. `;
            message += `Reacción: ${reaction}. `;
            message += `Temperatura actual: ${this.state.temperature} grados Celsius. `;
            message += `pH de la solución: ${this.state.ph}. `;
            message += `Color observado: ${this.state.color}. `;
            message += `Estado: ${this.state.state}.`;
        }
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            this.showNotification('Leyendo descripción en voz alta...', 'info');
        };
        
        utterance.onend = () => {
            this.showNotification('Descripción de audio completada', 'info');
        };
        
        window.speechSynthesis.speak(utterance);
    }

    playReactionSound() {
        // En una implementación real, aquí se reproduciría un sonido
        // Por ahora, solo una notificación
        this.showNotification('Sonido de reacción química simulado', 'info');
    }

    showResultMessage(text, type) {
        if (!this.resultMessage) return;
        
        this.resultMessage.textContent = text;
        this.resultMessage.className = `alert alert-${type}`;
        this.resultMessage.classList.remove('d-none');
        
        // Para lectores de pantalla
        this.resultMessage.setAttribute('role', 'alert');
        this.resultMessage.setAttribute('aria-live', 'assertive');
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            this.resultMessage.classList.add('d-none');
        }, 5000);
    }

    showNotification(message, type = 'info') {
        // Crear notificación accesible
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <i class="fas fa-${this.getIconForType(type)} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                const bsAlert = new bootstrap.Alert(notification);
                bsAlert.close();
            }
        }, 4000);
    }

    getIconForType(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'danger': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    getColorName(hexColor) {
        const colorMap = {
            '#69db7c': 'Verde',
            '#ffffff': 'Blanco',
            '#ffd8a8': 'Ámbar claro',
            '#a5d8ff': 'Azul claro',
            '#4dabf7': 'Azul',
            '#ffa94d': 'Naranja',
            '#339af0': 'Azul intenso',
            '#d0ebff': 'Azul muy claro',
            '#ff6b6b': 'Rojo'
        };
        
        return colorMap[hexColor] || 'Mixto';
    }

    focusFirstInvalidField() {
        if (!this.reactivo1Select || this.reactivo1Select.value) {
            if (this.reactivo2Select && !this.reactivo2Select.value) {
                this.reactivo2Select.focus();
            }
        } else {
            this.reactivo1Select.focus();
        }
    }
}

// Inicializar el simulador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.chemLabSimulator = new ChemLabSimulator();
});