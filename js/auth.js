// auth.js - Sistema de autenticación y validación de formularios
// Implementación WCAG 2.2 compatible

class AuthSystem {
    constructor() {
        this.initForms();
        this.initPasswordToggles();
        this.initAccessibilityFeatures();
    }

    initForms() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
            this.initRealTimeValidation(loginForm);
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
            this.initRealTimeValidation(registerForm);
        }

        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => this.handleRecoverySubmit(e));
        }
    }

    initPasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const inputId = button.getAttribute('data-target');
                const input = document.getElementById(inputId);

                if (input) {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);

                    const icon = button.querySelector('i');
                    if (type === 'password') {
                        if (icon) icon.className = 'fas fa-eye';
                        button.setAttribute('aria-label', 'Mostrar contraseña');
                    } else {
                        if (icon) icon.className = 'fas fa-eye-slash';
                        button.setAttribute('aria-label', 'Ocultar contraseña');
                    }

                    this.showAccessibilityNotification(
                        type === 'password' ? 'Contraseña ocultada' : 'Contraseña visible'
                    );
                }
            });
        });
    }

    initAccessibilityFeatures() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'l') {
                e.preventDefault();
                const loginTab = document.getElementById('login-tab');
                if (loginTab) loginTab.click();
                this.showAccessibilityNotification('Navegando al formulario de login');
            }

            if (e.ctrlKey && e.altKey && e.key === 'r') {
                e.preventDefault();
                const registerTab = document.getElementById('register-tab');
                if (registerTab) registerTab.click();
                this.showAccessibilityNotification('Navegando al formulario de registro');
            }

            if (e.ctrlKey && e.altKey && e.key === 'f') {
                e.preventDefault();
                const recoveryLink = document.querySelector('a[href*="recuperar"]');
                if (recoveryLink) recoveryLink.click();
                this.showAccessibilityNotification('Navegando a recuperación de contraseña');
            }
        });

        const firstInput = document.querySelector('form input:not([type="hidden"])');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        document.querySelectorAll('form input, form select, form textarea').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    const form = input.closest('form');
                    if (form && this.isSingleFieldForm(form)) {
                        e.preventDefault();
                        form.requestSubmit();
                    }
                }

                if (e.key === 'Escape') {
                    input.value = '';
                    this.showAccessibilityNotification('Campo limpiado');
                }
            });
        });
    }

    initRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validateField(input);
                }
            });
        });
    }

    // ===== CORRECCIÓN: blindaje contra null =====
    validateField(field) {
        if (!field) {
            // Evita el crash si algún selector no encuentra el input
            return false;
        }

        const value = String(field.value || '').trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = this.validateEmail(value);
                errorMessage = 'Por favor ingresa un correo electrónico válido';
                break;

            case 'password':
                isValid = this.validatePassword(value);
                errorMessage = 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
                break;

            case 'text':
                if (field.id && field.id.includes('name')) {
                    isValid = value.length >= 2;
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                } else {
                    isValid = value.length > 0;
                    errorMessage = 'Este campo es obligatorio';
                }
                break;

            default:
                isValid = value.length > 0;
                errorMessage = 'Este campo es obligatorio';
        }

        if (field.id === 'confirm-password') {
            const password = document.getElementById('register-password')?.value || '';
            isValid = value === password;
            errorMessage = 'Las contraseñas no coinciden';
        }

        this.applyFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email) && email.length <= 254;
    }

    validatePassword(password) {
        const re = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        return re.test(password);
    }

    applyFieldValidation(field, isValid, errorMessage) {
        field.classList.remove('is-valid', 'is-invalid');

        const existingError = field.parentNode?.querySelector?.('.invalid-feedback');
        if (existingError && existingError.id && existingError.id.endsWith('-error')) {
            existingError.remove();
        }

        if (isValid) {
            field.classList.add('is-valid');

            const errorDesc = field.getAttribute('aria-describedby');
            if (errorDesc && errorDesc.includes('error')) {
                const errorElement = document.getElementById(errorDesc);
                if (errorElement) errorElement.remove();
            }

            field.removeAttribute('aria-invalid');
        } else {
            field.classList.add('is-invalid');

            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.id = `${field.id}-error`;
            errorDiv.textContent = errorMessage;
            errorDiv.setAttribute('role', 'alert');
            errorDiv.setAttribute('aria-live', 'polite');

            field.parentNode.appendChild(errorDiv);

            const describedBy = field.getAttribute('aria-describedby') || '';
            field.setAttribute('aria-describedby', `${describedBy} ${errorDiv.id}`.trim());
            field.setAttribute('aria-invalid', 'true');
        }
    }

    async handleLoginSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.querySelector('#login-email');
        const password = form.querySelector('#login-password');
        const rememberMe = form.querySelector('#remember-me');

        const isEmailValid = this.validateField(email);
        const isPasswordValid = this.validateField(password);

        if (!isEmailValid || !isPasswordValid) {
            this.showAccessibilityNotification('Por favor corrige los errores en el formulario', 'warning');
            this.focusFirstInvalidField(form);
            return;
        }

        this.disableForm(form, true);
        this.showAccessibilityNotification('Verificando credenciales...', 'info');

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const loginSuccess = this.simulateLogin(
                email.value.trim(),
                password.value.trim()
            );

            if (loginSuccess) {
                this.showAccessibilityNotification('¡Inicio de sesión exitoso! Redirigiendo...', 'success');

                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem('rememberLogin', 'true');
                }

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 900);
            } else {
                this.showAccessibilityNotification('Credenciales incorrectas. Por favor intenta nuevamente.', 'danger');
                this.shakeForm(form);
                password.value = '';
                password.focus();
            }
        } catch (error) {
            this.showAccessibilityNotification('Error de conexión. Por favor intenta nuevamente.', 'danger');
            console.error('Login error:', error);
        } finally {
            this.disableForm(form, false);
        }
    }

    async handleRegisterSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const name = form.querySelector('#register-name');
        const email = form.querySelector('#register-email');
        const password = form.querySelector('#register-password');
        const confirmPassword = form.querySelector('#confirm-password');
        const acceptTerms = form.querySelector('#accept-terms');

        const isNameValid = this.validateField(name);
        const isEmailValid = this.validateField(email);
        const isPasswordValid = this.validateField(password);
        const isConfirmValid = this.validateField(confirmPassword);
        const isTermsAccepted = acceptTerms ? acceptTerms.checked : false;

        if (!isTermsAccepted) {
            this.showAccessibilityNotification('Debes aceptar los términos y condiciones', 'warning');
            if (acceptTerms) acceptTerms.focus();
            return;
        }

        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
            this.showAccessibilityNotification('Por favor corrige los errores en el formulario', 'warning');
            this.focusFirstInvalidField(form);
            return;
        }

        if (password.value !== confirmPassword.value) {
            this.showAccessibilityNotification('Las contraseñas no coinciden', 'warning');
            confirmPassword.focus();
            return;
        }

        this.disableForm(form, true);
        this.showAccessibilityNotification('Creando tu cuenta...', 'info');

        try {
            await new Promise(resolve => setTimeout(resolve, 900));

            const registrationSuccess = this.simulateRegistration(
                name.value.trim(),
                email.value.trim(),
                password.value
            );

            if (registrationSuccess) {
                this.showAccessibilityNotification('¡Cuenta creada exitosamente! Bienvenido/a.', 'success');

                setTimeout(() => {
                    const loginTab = document.getElementById('login-tab');
                    if (loginTab) {
                        loginTab.click();

                        const loginEmail = document.getElementById('login-email');
                        if (loginEmail) {
                            loginEmail.value = email.value;
                            loginEmail.focus();
                        }
                    }
                }, 700);
            } else {
                this.showAccessibilityNotification('El correo electrónico ya está registrado', 'warning');
                email.focus();
            }
        } catch (error) {
            this.showAccessibilityNotification('Error al crear la cuenta. Por favor intenta nuevamente.', 'danger');
            console.error('Registration error:', error);
        } finally {
            this.disableForm(form, false);
        }
    }

    async handleRecoverySubmit(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.querySelector('#recovery-email');

        if (!this.validateField(email)) {
            this.showAccessibilityNotification('Por favor ingresa un correo electrónico válido', 'warning');
            email?.focus?.();
            return;
        }

        this.disableForm(form, true);
        this.showAccessibilityNotification('Enviando instrucciones de recuperación...', 'info');

        try {
            await new Promise(resolve => setTimeout(resolve, 900));
            this.showAccessibilityNotification(
                'Se han enviado instrucciones de recuperación a tu correo electrónico',
                'success'
            );
            form.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);
        } catch (error) {
            this.showAccessibilityNotification('Error al enviar las instrucciones', 'danger');
        } finally {
            this.disableForm(form, false);
        }
    }

    // ===== Persistencia simple (Front-end) =====
    getStoredUsers() {
        try {
            const raw = localStorage.getItem('users');
            const users = raw ? JSON.parse(raw) : [];
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }

    saveStoredUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    simulateLogin(email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const pass = String(password || '');

        // Usuarios de prueba
        const testUsers = {
            'estudiante@quimica.edu': 'Password123',
            'profesor@quimica.edu': 'Profesor123',
            'invitado@ejemplo.com': 'Invitado123'
        };

        if (testUsers[normalizedEmail] && testUsers[normalizedEmail] === pass) return true;

        // Usuarios registrados
        const users = this.getStoredUsers();
        const found = users.find(u => this.normalizeEmail(u.email) === normalizedEmail);
        return !!found && found.password === pass;
    }

    simulateRegistration(name, email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const users = this.getStoredUsers();

        const exists = users.some(u => this.normalizeEmail(u.email) === normalizedEmail);
        if (exists) return false;

        users.push({
            name: String(name || '').trim(),
            email: normalizedEmail,
            password: String(password || '')
        });

        this.saveStoredUsers(users);
        return true;
    }

    disableForm(form, disabled) {
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = disabled;

            if (disabled) {
                input.setAttribute('aria-busy', 'true');
            } else {
                input.removeAttribute('aria-busy');
            }
        });

        if (disabled) {
            form.classList.add('processing');
        } else {
            form.classList.remove('processing');
        }
    }

    focusFirstInvalidField(form) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        } else {
            const firstRequired = form.querySelector('[required]');
            if (firstRequired) firstRequired.focus();
        }
    }

    shakeForm(form) {
        form.classList.add('shake');
        setTimeout(() => {
            form.classList.remove('shake');
        }, 500);
    }

    isSingleFieldForm(form) {
        const visibleInputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
        return visibleInputs.length === 1;
    }

    showAccessibilityNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `a11y-notification alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;

        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getNotificationIcon(type)} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar notificación"></button>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .shake { animation: shake 0.5s ease-in-out; }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

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
}

document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
