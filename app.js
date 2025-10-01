// Application Checklist Commercial Selectra
// Gestion des services AXA et OFFSET avec modals de configuration

class ChecklistCommercial {
    constructor() {
        this.state = {
            clientInfo: {},
            checkedItems: new Set(),
            servicePlans: {
                axa: null,
                offset: null
            },
            totalItems: 0,
            minPayantServices: 1,
            availablePayantServices: 2
        };
        
        this.servicesData = {
            axa: {
                plans: [
                    { label: "3,99€/mois (Télécom)", value: 3.99 },
                    { label: "6,99€/mois (Énergie+)", value: 6.99 }
                ]
            },
            offset: {
                plans: [
                    { label: "2,99€/mois - 2.24t", value: 2.99 },
                    { label: "3,99€/mois - 2.98t", value: 3.99 },
                    { label: "4,99€/mois - 3.59t", value: 4.99 },
                    { label: "5,99€/mois - 4.49t", value: 5.99 },
                    { label: "7,50€/mois - 5.4t", value: 7.5 },
                    { label: "14,99€/mois - 11.34t", value: 14.99 }
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initialisation Checklist Commercial Selectra');
        this.setupEventListeners();
        this.countTotalItems();
        this.updateProgress();
        this.validateServices();
        console.log('✅ Application prête - 2 services payants configurables');
    }
    
    setupEventListeners() {
        // Écoute des changements sur les checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleCheckboxChange(e.target);
            } else if (e.target.type === 'text' || e.target.type === 'email' || e.target.type === 'tel') {
                this.handleInputChange(e.target);
            }
        });
        
        // Écoute des clics sur les services pour ouvrir automatiquement les modals
        document.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox' && e.target.name && 
                (e.target.name === 'service_axa' || e.target.name === 'service_offset')) {
                
                if (e.target.checked) {
                    const service = e.target.name.replace('service_', '');
                    // Ouvrir automatiquement le modal si pas de plan configuré
                    if (!this.state.servicePlans[service]) {
                        setTimeout(() => {
                            this.openServiceModal(service);
                        }, 100);
                    }
                } else {
                    // Réinitialiser le plan si décoché
                    const service = e.target.name.replace('service_', '');
                    this.state.servicePlans[service] = null;
                    this.updateServiceDisplay(service);
                }
            }
        });
        
        // Écoute des changements dans les modals
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' && (e.target.name === 'axa_plan' || e.target.name === 'offset_plan')) {
                // Activer le bouton confirmer
                const modal = e.target.closest('.modal');
                const confirmBtn = modal.querySelector('.btn--primary');
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                }
            }
        });
        
        // Fermeture des modals avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal:not(.hidden)');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });
    }
    
    handleCheckboxChange(checkbox) {
        if (checkbox.checked) {
            this.state.checkedItems.add(checkbox.name);
            checkbox.closest('.checklist-item')?.classList.add('completed');
        } else {
            this.state.checkedItems.delete(checkbox.name);
            checkbox.closest('.checklist-item')?.classList.remove('completed');
        }
        
        this.updateProgress();
        this.validateServices();
        this.validateExportButton();
    }
    
    handleInputChange(input) {
        this.state.clientInfo[input.name] = input.value;
        this.validateExportButton();
    }
    
    countTotalItems() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        this.state.totalItems = checkboxes.length;
        document.getElementById('total-items').textContent = this.state.totalItems;
    }
    
    updateProgress() {
        const completedCount = this.state.checkedItems.size;
        document.getElementById('completed-items').textContent = completedCount;
        
        // Animation du compteur de progression
        const progressIndicator = document.querySelector('.progress-indicator');
        if (completedCount > 0) {
            progressIndicator.style.background = 'rgba(var(--color-success-rgb), 0.3)';
        } else {
            progressIndicator.style.background = 'rgba(255, 255, 255, 0.2)';
        }
    }
    
    validateServices() {
        const selectedServices = [];
        if (this.state.checkedItems.has('service_axa')) selectedServices.push('axa');
        if (this.state.checkedItems.has('service_offset')) selectedServices.push('offset');
        
        const servicesSection = document.querySelector('.services-payants');
        const existingMessage = servicesSection.querySelector('.services-validation-error, .services-validation-success');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        let messageHtml = '';
        let messageClass = '';
        
        if (selectedServices.length < this.state.minPayantServices) {
            messageHtml = `⚠️ Minimum ${this.state.minPayantServices} service payant requis (${selectedServices.length}/${this.state.minPayantServices} sélectionnés)`;
            messageClass = 'services-validation-error';
        } else {
            messageHtml = `✅ Exigence respectée (${selectedServices.length}/${this.state.minPayantServices} services minimum)`;
            messageClass = 'services-validation-success';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = messageClass;
        messageDiv.textContent = messageHtml;
        servicesSection.appendChild(messageDiv);
        
        return selectedServices.length >= this.state.minPayantServices;
    }
    
    validateExportButton() {
        const exportBtn = document.getElementById('export-btn');
        const hasClientInfo = Object.keys(this.state.clientInfo).some(key => 
            this.state.clientInfo[key] && this.state.clientInfo[key].trim() !== ''
        );
        const hasRequiredChecks = this.state.checkedItems.has('rgpd_accepte') && 
                                 this.state.checkedItems.has('enregistrement_accepte');
        const hasValidServices = this.validateServices();
        
        if (hasClientInfo && hasRequiredChecks && hasValidServices) {
            exportBtn.disabled = false;
            exportBtn.textContent = '📄 Exporter Résumé';
        } else {
            exportBtn.disabled = true;
            exportBtn.textContent = '📄 Exporter Résumé (incomplet)';
        }
    }
    
    openServiceModal(service) {
        const modal = document.getElementById(`${service}-modal`);
        if (!modal) return;
        
        // Réinitialiser les sélections dans le modal
        const radioButtons = modal.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.checked = false;
        });
        
        // Désactiver le bouton confirmer
        const confirmBtn = modal.querySelector('.btn--primary');
        if (confirmBtn) {
            confirmBtn.disabled = true;
        }
        
        // Si un plan est déjà sélectionné, le pré-cocher
        if (this.state.servicePlans[service]) {
            const existingPlan = modal.querySelector(`input[value="${this.state.servicePlans[service].value}"]`);
            if (existingPlan) {
                existingPlan.checked = true;
                confirmBtn.disabled = false;
            }
        }
        
        modal.classList.remove('hidden');
        console.log(`🔧 Ouverture modal de configuration ${service.toUpperCase()}`);
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    confirmServicePlan(service) {
        const modal = document.getElementById(`${service}-modal`);
        const selectedPlan = modal.querySelector(`input[name="${service}_plan"]:checked`);
        
        if (!selectedPlan) {
            alert('⚠️ Veuillez sélectionner un forfait');
            return;
        }
        
        // Stocker le plan sélectionné
        this.state.servicePlans[service] = {
            value: parseFloat(selectedPlan.value),
            label: selectedPlan.dataset.label
        };
        
        // Mettre à jour l'affichage
        this.updateServiceDisplay(service);
        
        // Fermer le modal
        this.closeModal(`${service}-modal`);
        
        // Message de confirmation
        this.showMessage(`✅ Forfait ${service.toUpperCase()} configuré : ${selectedPlan.dataset.label}`);
        
        console.log(`✅ Plan configuré pour ${service}:`, this.state.servicePlans[service]);
        
        // Revalider les services
        this.validateServices();
        this.validateExportButton();
    }
    
    updateServiceDisplay(service) {
        const detailsElement = document.getElementById(`${service}-details`);
        const serviceItem = document.querySelector(`[data-service="${service}"]`);
        const configBtn = serviceItem.querySelector('.btn-config');
        
        if (this.state.servicePlans[service]) {
            detailsElement.textContent = this.state.servicePlans[service].label;
            detailsElement.classList.add('has-plan');
            serviceItem.classList.add('has-plan');
            configBtn.textContent = '✏️';
            configBtn.title = 'Modifier forfait';
        } else {
            detailsElement.textContent = '';
            detailsElement.classList.remove('has-plan');
            serviceItem.classList.remove('has-plan');
            configBtn.textContent = '⚙️';
            configBtn.title = 'Configurer forfait';
        }
    }
    
    exportSummary() {
        const timestamp = new Date();
        const dateStr = timestamp.toLocaleDateString('fr-FR');
        const timeStr = timestamp.toLocaleTimeString('fr-FR');
        
        let summary = `SELECTRA - RÉSUMÉ D'APPEL COMMERCIAL\n`;
        summary += `${'='.repeat(50)}\n`;
        summary += `Date: ${dateStr}\n`;
        summary += `Heure: ${timeStr}\n\n`;
        
        // Informations client
        summary += `INFORMATIONS CLIENT\n`;
        summary += `${'='.repeat(20)}\n`;
        Object.keys(this.state.clientInfo).forEach(key => {
            if (this.state.clientInfo[key] && this.state.clientInfo[key].trim() !== '') {
                const label = this.getFieldLabel(key);
                summary += `${label}: ${this.state.clientInfo[key]}\n`;
            }
        });
        
        // Validations
        summary += `\nVALIDATIONS EFFECTUÉES\n`;
        summary += `${'='.repeat(25)}\n`;
        this.state.checkedItems.forEach(item => {
            const label = this.getCheckboxLabel(item);
            summary += `✅ ${label}\n`;
        });
        
        // Services payants souscrits
        summary += `\nSERVICES PAYANTS SOUSCRITS\n`;
        summary += `${'='.repeat(30)}\n`;
        let totalMensuel = 0;
        
        if (this.state.checkedItems.has('service_axa') && this.state.servicePlans.axa) {
            summary += `🛡️ AXA Assistance: ${this.state.servicePlans.axa.label}\n`;
            totalMensuel += this.state.servicePlans.axa.value;
        }
        
        if (this.state.checkedItems.has('service_offset') && this.state.servicePlans.offset) {
            summary += `🌱 OFFSET Carbone: ${this.state.servicePlans.offset.label}\n`;
            totalMensuel += this.state.servicePlans.offset.value;
        }
        
        if (totalMensuel > 0) {
            summary += `\n💰 TOTAL MENSUEL: ${totalMensuel.toFixed(2)}€/mois\n`;
        }
        
        // Statistiques
        summary += `\nSTATISTIQUES\n`;
        summary += `${'='.repeat(15)}\n`;
        summary += `Items validés: ${this.state.checkedItems.size}/${this.state.totalItems}\n`;
        summary += `Taux de completion: ${((this.state.checkedItems.size / this.state.totalItems) * 100).toFixed(1)}%\n`;
        summary += `Services payants: ${this.getSelectedServicesCount()}/${this.state.availablePayantServices}\n`;
        
        // Export en fichier
        this.downloadTextFile(summary, `selectra_resume_${dateStr.replace(/\//g, '-')}_${timeStr.replace(/:/g, 'h')}.txt`);
        
        // Message de succès
        this.showMessage('📄 Résumé exporté avec succès !', 'success');
        
        console.log('📄 Export résumé effectué:', {
            client: this.state.clientInfo,
            validations: Array.from(this.state.checkedItems),
            services: this.state.servicePlans,
            total: totalMensuel
        });
    }
    
    getSelectedServicesCount() {
        let count = 0;
        if (this.state.checkedItems.has('service_axa')) count++;
        if (this.state.checkedItems.has('service_offset')) count++;
        return count;
    }
    
    getFieldLabel(fieldName) {
        const labels = {
            'client_nom': 'Nom complet',
            'client_tel': 'Téléphone',
            'client_email': 'Email',
            'client_adresse': 'Adresse'
        };
        return labels[fieldName] || fieldName;
    }
    
    getCheckboxLabel(checkboxName) {
        const labels = {
            'rgpd_accepte': 'RGPD - Accord collecte données',
            'enregistrement_accepte': 'Enregistrement d\'appel accepté',
            'eligibilite_confirmee': 'Éligibilité confirmée',
            'service_axa': 'AXA Assistance souscrit',
            'service_offset': 'OFFSET Carbone souscrit',
            'contrat_signe': 'Contrat signé',
            'paiement_configure': 'Paiement configuré',
            'rdv_planifie': 'RDV de suivi planifié'
        };
        return labels[checkboxName] || checkboxName;
    }
    
    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'export-message';
        messageDiv.textContent = message;
        
        if (type === 'success') {
            messageDiv.style.background = 'var(--color-success)';
        } else if (type === 'error') {
            messageDiv.style.background = 'var(--color-error)';
        }
        
        document.body.appendChild(messageDiv);
        
        // Faire disparaître automatiquement
        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
    
    resetForm() {
        if (!confirm('🔄 Êtes-vous sûr de vouloir réinitialiser toute la checklist ?')) {
            return;
        }
        
        // Réinitialiser l'état
        this.state.checkedItems.clear();
        this.state.clientInfo = {};
        this.state.servicePlans = { axa: null, offset: null };
        
        // Réinitialiser les inputs
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
            input.value = '';
        });
        
        // Réinitialiser les classes CSS
        document.querySelectorAll('.checklist-item').forEach(item => {
            item.classList.remove('completed');
        });
        
        document.querySelectorAll('.service-item').forEach(item => {
            item.classList.remove('has-plan');
        });
        
        // Réinitialiser l'affichage des services
        this.updateServiceDisplay('axa');
        this.updateServiceDisplay('offset');
        
        // Supprimer les messages de validation
        document.querySelectorAll('.services-validation-error, .services-validation-success').forEach(msg => {
            msg.remove();
        });
        
        // Mettre à jour l'interface
        this.updateProgress();
        this.validateServices();
        this.validateExportButton();
        
        this.showMessage('🔄 Checklist réinitialisée', 'info');
        console.log('🔄 Formulaire réinitialisé');
    }
}

// Fonctions globales appelées depuis le HTML
function openServiceModal(service) {
    if (window.checklistApp) {
        window.checklistApp.openServiceModal(service);
    }
}

function closeModal(modalId) {
    if (window.checklistApp) {
        window.checklistApp.closeModal(modalId);
    }
}

function confirmServicePlan(service) {
    if (window.checklistApp) {
        window.checklistApp.confirmServicePlan(service);
    }
}

function exportSummary() {
    if (window.checklistApp) {
        window.checklistApp.exportSummary();
    }
}

function resetForm() {
    if (window.checklistApp) {
        window.checklistApp.resetForm();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Démarrage Checklist Commercial Selectra...');
    
    try {
        window.checklistApp = new ChecklistCommercial();
        console.log('✅ Application prête');
        console.log('📋 Services configurables: AXA Assistance, OFFSET Carbone');
        console.log('⚙️ Minimum 1 service payant requis');
        console.log('📄 Export .txt avec forfaits sélectionnés');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

// Gestion des erreurs
window.addEventListener('error', function(e) {
    console.error('❌ Erreur JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Promesse rejetée:', e.reason);
});