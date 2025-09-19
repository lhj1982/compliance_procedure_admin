class ComplianceAdmin {
    constructor() {
        this.apiUrl = 'http://localhost:8081/api';
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        this.teams = [];
        this.procedures = [];
        this.selectedProcedure = null;

        this.init();
    }

    init() {
        this.bindEvents();

        if (this.token) {
            this.showDashboard();
            this.loadData();
        } else {
            this.showLogin();
        }
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Search procedures
        document.getElementById('search-procedures').addEventListener('input', (e) => {
            this.filterProcedures(e.target.value);
        });

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Add procedure button
        document.getElementById('add-procedure-btn').addEventListener('click', () => {
            this.showProcedureModal();
        });

        // Form submissions
        document.getElementById('procedure-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createProcedure();
        });

        document.getElementById('comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.returnWithComment();
        });

        // Action buttons
        document.getElementById('return-comment-btn').addEventListener('click', () => {
            this.showCommentModal();
        });

        document.getElementById('mark-complete-btn').addEventListener('click', () => {
            this.updateProcedureStatus('completed');
        });

        document.getElementById('mark-failed-btn').addEventListener('click', () => {
            this.updateProcedureStatus('failed');
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);

                this.showDashboard();
                this.loadData();
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        this.selectedProcedure = null;
        localStorage.removeItem('token');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-page').classList.add('active');
        document.getElementById('dashboard-page').classList.remove('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.hideError();
    }

    showDashboard() {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('dashboard-page').classList.add('active');
    }

    async loadData() {
        await Promise.all([
            this.loadTeams(),
            this.loadProcedures()
        ]);
    }

    async loadTeams() {
        try {
            const response = await fetch(`${this.apiUrl}/teams`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.teams = await response.json();
                this.updateTeamSelect();
            }
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    }

    async loadProcedures() {
        try {
            const response = await fetch(`${this.apiUrl}/procedures`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.procedures = await response.json();
                this.renderProceduresList();
            }
        } catch (error) {
            console.error('Error loading procedures:', error);
        }
    }

    renderProceduresList() {
        const listContainer = document.getElementById('procedures-list');
        listContainer.innerHTML = '';

        this.procedures.forEach(procedure => {
            const card = this.createProcedureCard(procedure);
            listContainer.appendChild(card);
        });
    }

    createProcedureCard(procedure) {
        const card = document.createElement('div');
        card.className = 'procedure-card';
        card.dataset.procedureId = procedure.id;

        const recipientField = document.createElement('div');
        recipientField.className = 'card-field';
        recipientField.innerHTML = `<label>Recipient:</label> admin@company.com`;

        const teamField = document.createElement('div');
        teamField.className = 'card-field';
        teamField.innerHTML = `<label>Team:</label> ${procedure.team_name || 'Unknown'}`;

        const statusField = document.createElement('div');
        statusField.className = 'card-field';
        statusField.innerHTML = `<label>Status:</label> <span class="status-badge status-${this.getStatusClass(procedure.status)}">${this.formatStatus(procedure.status)}</span>`;

        const fileLink = document.createElement('a');
        const fileName = `${procedure.team_id}_procedure_document.docx`;
        fileLink.href = '#';
        fileLink.className = 'file-link';
        fileLink.textContent = fileName;

        // Add debugging and fix the context binding
        const self = this; // Capture the context
        fileLink.addEventListener('click', function(e) {
            console.log('File link clicked for team:', procedure.team_id);
            console.log('Context check - self:', self ? 'available' : 'not available');
            e.preventDefault();
            e.stopPropagation();
            // Use captured context
            self.downloadDocument(procedure.team_id);
        });

        card.appendChild(recipientField);
        card.appendChild(teamField);
        card.appendChild(statusField);
        card.appendChild(fileLink);

        card.addEventListener('click', (e) => {
            console.log('Card clicked, target:', e.target.className);
            if (!e.target.classList.contains('file-link')) {
                console.log('Selecting procedure');
                this.selectProcedure(procedure);
            } else {
                console.log('File link clicked, should not select procedure');
            }
        });

        return card;
    }

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending Review',
            'completed': 'Completed',
            'passed': 'Passed',
            'approved': 'Approved',
            'failed': 'Failed',
            'rejected': 'Rejected',
            'returned': 'Returned',
            'draft': 'Draft',
            'review': 'Under Review'
        };
        return statusMap[status] || status;
    }

    getStatusClass(status) {
        // Normalize status for CSS class
        const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');

        // Map different status values to consistent CSS classes
        const statusClassMap = {
            'completed': 'completed',
            'passed': 'completed',
            'approved': 'completed',
            'success': 'completed',
            'failed': 'failed',
            'rejected': 'failed',
            'error': 'failed',
            'pending': 'pending',
            'returned': 'returned',
            'draft': 'pending',
            'review': 'pending',
            'under-review': 'pending'
        };

        return statusClassMap[normalizedStatus] || 'pending';
    }

    selectProcedure(procedure) {
        // Remove selection from all cards
        document.querySelectorAll('.procedure-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const selectedCard = document.querySelector(`[data-procedure-id="${procedure.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.selectedProcedure = procedure;
        this.showProcedureDetail(procedure);
    }

    showProcedureDetail(procedure) {
        // Hide welcome view and show procedure detail view
        document.getElementById('welcome-view').classList.remove('active');
        document.getElementById('procedure-detail-view').classList.add('active');

        // Update procedure details
        document.getElementById('procedure-title').textContent = 'Procedure';
        document.getElementById('procedure-team').textContent = `Team: ${procedure.team_name || 'Unknown'}`;
        document.getElementById('procedure-created').textContent = `Created: ${new Date(procedure.created_at).toLocaleDateString()}`;

        document.getElementById('control-name').textContent = 'Asset Management';

        const fileName = `${procedure.team_id}_procedure_document.docx`;
        const filePathLink = document.getElementById('file-path-link');
        filePathLink.textContent = fileName;
        filePathLink.href = '#';

        // Remove any existing event listeners
        filePathLink.onclick = null;

        // Add new event listener with debugging
        filePathLink.addEventListener('click', (e) => {
            console.log('Detail view file link clicked for team:', procedure.team_id);
            e.preventDefault();
            this.downloadDocument(procedure.team_id);
        });

        const statusElement = document.getElementById('current-status');
        statusElement.textContent = this.formatStatus(procedure.status);
        statusElement.className = `status-badge status-${this.getStatusClass(procedure.status)}`;

        // Update preview content
        this.updateDocumentPreview(procedure);

        // Load document info
        this.loadDocumentInfo(procedure.team_id);
    }

    updateDocumentPreview(procedure) {
        const previewContent = document.getElementById('preview-content');
        const fileName = `${procedure.team_id}_procedure_document.docx`;

        previewContent.innerHTML = `
            <p><strong>Control name:</strong> Asset Management</p>
            <p><strong>Instruction:</strong> First GitHub integration procedure for compliance review...</p>
            <div class="document-actions">
                <button class="btn btn-primary" onclick="app.downloadDocument('${procedure.team_id}')">Download Document</button>
            </div>
            <div class="preview-placeholder" id="document-preview-${procedure.team_id}">
                <p>Document: ${fileName}</p>
                <p>Status: ${this.formatStatus(procedure.status)}</p>
                <p>Click "Download Document" to save the compliance procedure document locally.</p>
                <div id="document-info-${procedure.team_id}"></div>
            </div>
        `;
    }

    async loadDocumentInfo(teamId) {
        try {
            const response = await fetch(`${this.apiUrl}/documents/${teamId}/info`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const docInfo = await response.json();
                const infoDiv = document.getElementById(`document-info-${teamId}`);
                if (infoDiv) {
                    if (docInfo.exists) {
                        infoDiv.innerHTML = `
                            <p><strong>File Size:</strong> ${this.formatFileSize(docInfo.size)}</p>
                            <p><strong>Last Modified:</strong> ${new Date(docInfo.modifiedAt).toLocaleDateString()}</p>
                        `;
                    } else {
                        infoDiv.innerHTML = '<p style="color: #dc3545;">Document not generated yet</p>';
                    }
                }
            } else {
                const infoDiv = document.getElementById(`document-info-${teamId}`);
                if (infoDiv) {
                    infoDiv.innerHTML = '<p style="color: #dc3545;">Error loading document info</p>';
                }
            }
        } catch (error) {
            console.error('Error loading document info:', error);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadDocument(teamId) {
        console.log('=== downloadDocument called ===');
        console.log('Team ID:', teamId);
        console.log('API URL:', this.apiUrl);
        console.log('Token available:', this.token ? 'yes' : 'no');

        const downloadUrl = `${this.apiUrl}/documents/${teamId}/download`;
        console.log(`Full download URL: ${downloadUrl}`);

        // Add authorization header for download
        fetch(downloadUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        })
        .then(response => {
            console.log(`Response status: ${response.status}`);
            console.log(`Response headers:`, response.headers);

            if (!response.ok) {
                return response.text().then(text => {
                    console.error(`Error response: ${text}`);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.blob();
        })
        .then(blob => {
            console.log(`Blob received, size: ${blob.size} bytes`);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${teamId}_procedure_document.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log('Download initiated');
        })
        .catch(error => {
            console.error('Download failed:', error);
            if (error.message.includes('404')) {
                alert('Document not found. The procedure document may not have been generated yet.');
            } else if (error.message.includes('401')) {
                alert('Authentication failed. Please log in again.');
            } else if (error.message.includes('403')) {
                alert('Access denied. Admin privileges required.');
            } else {
                alert(`Failed to download document: ${error.message}`);
            }
        });
    }

    filterProcedures(searchTerm) {
        const cards = document.querySelectorAll('.procedure-card');
        searchTerm = searchTerm.toLowerCase();

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateTeamSelect() {
        const select = document.getElementById('procedure-team');
        select.innerHTML = '<option value="">Select Team</option>';

        this.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            select.appendChild(option);
        });
    }

    showProcedureModal() {
        document.getElementById('procedure-modal').classList.remove('hidden');
        document.getElementById('procedure-form').reset();
    }

    showCommentModal() {
        document.getElementById('comment-modal').classList.remove('hidden');
        document.getElementById('comment-text').value = '';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    async createProcedure() {
        const formData = new FormData(document.getElementById('procedure-form'));
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${this.apiUrl}/procedures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.closeModals();
                await this.loadProcedures();
            } else {
                const responseData = await response.json();
                alert(responseData.error || 'Failed to create procedure');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    }

    async updateProcedureStatus(status) {
        if (!this.selectedProcedure) return;

        try {
            const response = await fetch(`${this.apiUrl}/procedures/${this.selectedProcedure.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    ...this.selectedProcedure,
                    status: status
                })
            });

            if (response.ok) {
                await this.loadProcedures();
                // Update the selected procedure
                this.selectedProcedure.status = status;
                this.showProcedureDetail(this.selectedProcedure);
            } else {
                const responseData = await response.json();
                alert(responseData.error || 'Failed to update procedure');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    }

    async returnWithComment() {
        if (!this.selectedProcedure) return;

        const comment = document.getElementById('comment-text').value;
        if (!comment.trim()) {
            alert('Please enter a comment');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/procedures/${this.selectedProcedure.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    ...this.selectedProcedure,
                    status: 'returned'
                })
            });

            if (response.ok) {
                this.closeModals();
                await this.loadProcedures();
                // Update the selected procedure
                this.selectedProcedure.status = 'returned';
                this.showProcedureDetail(this.selectedProcedure);
            } else {
                const responseData = await response.json();
                alert(responseData.error || 'Failed to return procedure');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }
}

// Initialize the app
const app = new ComplianceAdmin();