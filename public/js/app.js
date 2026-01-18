// DOM elements
let uploadForm, scriptFile, dbTypeInput, analyzeBtn, loading, results;
let riskSummary, issuesList, selectedFileInfo, selectedDbType, selectedFileName;
let clearSelection, otherDbToggle, otherDbMenu, otherDbFileInput, otherDbUploadBtn;
let errorModal, errorMessageText, errorClose, errorOk;

let currentDbType = '';
let currentFile = null;
let otherDbSelected = false;

function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = String(s);
    return div.innerHTML;
}

// Hide error message
function hideError() {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Show error message (for database mismatch)
function showError(selectedType, detectedTypes) {
    const detectedStr = detectedTypes.length > 0 
        ? detectedTypes.join(' or ') 
        : 'No matching patterns detected';
    
    const message = `You selected: ${selectedType || 'Not selected'}\n\nDetected in file: ${detectedStr}\n\nPlease upload this file using the correct database type.`;
    
    const msgText = document.getElementById('errorMessageText');
    const modal = document.getElementById('errorModal');
    
    if (msgText) {
        msgText.textContent = message;
    }
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Show general error message
function showGeneralError(title, messages) {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    const message = `DB Mismatch in Scripts Uploaded\n\n${messageArray.join('\n')}`;
    
    const msgText = document.getElementById('errorMessageText');
    const modal = document.getElementById('errorModal');
    
    if (msgText) {
        msgText.textContent = message;
    }
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Detect database type from file content
async function detectDatabaseTypeFromFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const detectedTypes = [];
            
            // MS SQL Server patterns
            if (/\b(GO|T-SQL|sp_|dbo\.|NVARCHAR|nchar|GETDATE|ISNULL)\b/i.test(content) || /\bEXEC\s+sp_/i.test(content)) {
                detectedTypes.push('MS SQL Server');
            }
            // SAP HANA patterns
            if (/\b(ADD_DAYS|ADD_MONTHS|SCHEMA|HANA|LANGUAGE SQLSCRIPT)\b/i.test(content) || /"SCHEMA"\."TABLE"/i.test(content)) {
                detectedTypes.push('SAP HANA');
            }
            // Oracle patterns
            if (/\b(PL\/SQL|EXECUTE IMMEDIATE|dba_|v\$|NUMBER|VARCHAR2|NVL|SYSDATE)\b/i.test(content)) {
                detectedTypes.push('Oracle');
            }
            // PostgreSQL patterns
            if (/\b(\\$[0-9]|\\$func\\$|LANGUAGE plpgsql|::integer|::text)\b/i.test(content) || /\bSERIAL\b/i.test(content)) {
                detectedTypes.push('PostgreSQL');
            }
            // MySQL patterns
            if (/\b(MYSQL|AUTO_INCREMENT|ENGINE=InnoDB)\b/i.test(content)) {
                detectedTypes.push('MySQL');
            }
            // SQLite patterns
            if (/\b(SQLITE|INTEGER PRIMARY KEY|WITHOUT ROWID|sqlite_master|sqlite_sequence)\b/i.test(content) || 
                /\.db\b/i.test(content) || /\bBLOB\b/i.test(content)) {
                detectedTypes.push('SQLite');
            }
            // Generic SQL (only if no specific DB detected)
            if (detectedTypes.length === 0 && /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b/i.test(content)) {
                detectedTypes.push('SQL (generic)');
            }
            
            resolve([...new Set(detectedTypes)]);
        };
        reader.onerror = () => resolve([]);
        // Read first 50KB for detection
        const blob = file.slice(0, 50000);
        reader.readAsText(blob);
    });
}

// Map detected types to expected types - STRICT validation
function mapDetectedToExpected(detectedTypes, expectedType) {
    // "Other" option allows any database type
    if (expectedType === 'Other') return true;
    
    // Strict mapping - only exact matches allowed (no generic SQL fallback)
    const typeMap = {
        'MS SQL Server': ['MS SQL Server'],
        'SAP HANA': ['SAP HANA'],
        'Oracle': ['Oracle'],
        'PostgreSQL': ['PostgreSQL'],
        'MySQL': ['MySQL'],
        'MongoDB': ['MongoDB'],
        'DB2': ['DB2'],
        'Sybase': ['Sybase'],
        'Teradata': ['Teradata'],
        'Snowflake': ['Snowflake'],
        'SQLite': ['SQLite']
    };
    
    const allowedTypes = typeMap[expectedType] || [];
    
    // If no types detected, reject (file might be empty or non-SQL)
    if (detectedTypes.length === 0) {
        return false;
    }
    
    // Must match exactly - no generic SQL allowed for specific DBs
    return detectedTypes.some(dt => allowedTypes.includes(dt));
}

// Initialize all DOM elements and event handlers
function initApp() {
    // Get DOM elements
    uploadForm = document.getElementById('uploadForm');
    scriptFile = document.getElementById('scriptFile');
    dbTypeInput = document.getElementById('dbType');
    analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeButtonContainer = document.getElementById('analyzeButtonContainer');
    loading = document.getElementById('loading');
    results = document.getElementById('results');
    riskSummary = document.getElementById('riskSummary');
    issuesList = document.getElementById('issuesList');
    selectedFileInfo = document.getElementById('selectedFileInfo');
    selectedDbType = document.getElementById('selectedDbType');
    selectedFileName = document.getElementById('selectedFileName');
    clearSelection = document.getElementById('clearSelection');
    otherDbToggle = document.getElementById('otherDbToggle');
    otherDbMenu = document.getElementById('otherDbMenu');
    otherDbFileInput = document.getElementById('otherDbFileInput');
    otherDbUploadBtn = document.getElementById('otherDbUploadBtn');
    errorModal = document.getElementById('errorModal');
    errorMessageText = document.getElementById('errorMessageText');
    errorClose = document.getElementById('errorClose');
    errorOk = document.getElementById('errorOk');
    
    // Ensure error modal starts hidden
    if (errorModal) {
        errorModal.classList.add('hidden');
    }
    
    // Setup error modal close handlers
    if (errorClose) {
        errorClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideError();
        });
    }
    
    if (errorOk) {
        errorOk.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideError();
        });
    }
    
    // Close on overlay click
    if (errorModal) {
        const overlay = errorModal.querySelector('.error-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                e.stopPropagation();
                hideError();
            });
        }
    }
    
    // Handle DB card clicks (MS SQL, HANA, Oracle)
    document.querySelectorAll('.db-upload-card[data-db]').forEach(card => {
        const dbName = card.dataset.db;
        const fileInput = card.querySelector('.db-file-input');
        const uploadBtn = card.querySelector('.db-upload-btn');

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                currentDbType = dbName;
                if (fileInput) fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                if (e.target.files.length > 0) {
                    await handleFileSelection(e.target.files[0], dbName);
                }
            });
        }
    });

    // Handle "Other DBs" dropdown
    if (otherDbToggle) {
        otherDbToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (otherDbMenu) {
                otherDbMenu.classList.toggle('hidden');
            }
        });
    }

    // Close dropdown when clicking outside (but not on nav-brand links)
    document.addEventListener('click', (e) => {
        // Don't interfere with nav-brand link clicks - let them work normally
        if (e.target.closest('.nav-brand')) {
            return; // Let the link work normally
        }
        if (otherDbToggle && otherDbMenu && 
            !otherDbToggle.contains(e.target) && 
            !otherDbMenu.contains(e.target)) {
            otherDbMenu.classList.add('hidden');
        }
    });

    // Handle "Other DBs" option selection
    document.querySelectorAll('.other-db-option').forEach(option => {
        option.addEventListener('click', () => {
            const dbName = option.dataset.db;
            if (otherDbToggle) {
                otherDbToggle.textContent = `Selected: ${dbName} ⬇️`;
            }
            if (otherDbMenu) {
                otherDbMenu.classList.add('hidden');
            }
            if (otherDbUploadBtn) {
                otherDbUploadBtn.classList.remove('hidden');
            }
            currentDbType = dbName;
            otherDbSelected = true;
            
            // Hide hint
            const hint = document.getElementById('otherDbHint');
            if (hint) hint.style.display = 'none';
            
            // Trigger file picker
            if (otherDbFileInput) {
                otherDbFileInput.click();
            }
        });
    });

    // Handle "Other DBs" upload button click
    if (otherDbUploadBtn) {
        otherDbUploadBtn.addEventListener('click', () => {
            if (!otherDbSelected || !currentDbType) {
                showError('Other DBs', ['Please select a database type from the dropdown first']);
                return;
            }
            if (otherDbFileInput) {
                otherDbFileInput.click();
            }
        });
    }

    // Handle file selection for "Other DBs"
    if (otherDbFileInput) {
        otherDbFileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                if (!otherDbSelected || !currentDbType) {
                    showError('Other DBs', ['Please select a database type from the dropdown first']);
                    e.target.value = '';
                    return;
                }
                await handleFileSelection(e.target.files[0], currentDbType);
            }
        });
    }

    // Handle file selection with validation
    async function handleFileSelection(file, dbType) {
        console.log('File selected:', file.name, 'DB Type:', dbType);
        
        // Store file and DB type first
        currentFile = file;
        currentDbType = dbType;
        
        // Update UI immediately - show file info and analyze button
        if (selectedDbType) selectedDbType.textContent = dbType;
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (selectedFileInfo) selectedFileInfo.classList.remove('hidden');
        
        // Show analyze button immediately
        const analyzeButtonContainer = document.getElementById('analyzeButtonContainer');
        if (analyzeButtonContainer) {
            analyzeButtonContainer.classList.remove('hidden');
            console.log('Analyze button container shown');
        } else {
            console.error('Analyze button container not found!');
        }
        
        // Store values
        if (dbTypeInput) dbTypeInput.value = dbType;
        
        // Check if file is Excel - skip client-side validation for Excel files
        const fileExt = file.name.toLowerCase();
        const isExcelFile = fileExt.endsWith('.xlsx') || fileExt.endsWith('.xls');
        
        if (isExcelFile) {
            // Excel files are binary - server will validate them properly
            console.log('Excel file detected - skipping client-side validation');
            hideError(); // Hide any previous errors
        } else {
            // Validate database type match for text files only
            const detectedTypes = await detectDatabaseTypeFromFile(file);
            console.log('Detected types:', detectedTypes);
            const isValid = mapDetectedToExpected(detectedTypes, dbType);
            console.log('Validation result:', isValid);
            
            if (!isValid) {
                // Show styled error message but keep button visible
                showError(dbType, detectedTypes);
                console.warn('Database type mismatch - but allowing upload anyway');
                // Don't return - allow user to proceed if they want
            } else {
                // Hide error if validation passes
                hideError();
            }
        }
        
        // Highlight selected card
        document.querySelectorAll('.db-upload-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.db === dbType) {
                card.classList.add('active');
            }
        });
        
        // Scroll to selected file info
        if (selectedFileInfo) {
            selectedFileInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Clear selection
    if (clearSelection) {
        clearSelection.addEventListener('click', () => {
            currentFile = null;
            currentDbType = '';
            otherDbSelected = false;
            if (scriptFile) scriptFile.value = '';
            if (dbTypeInput) dbTypeInput.value = '';
            if (selectedFileInfo) selectedFileInfo.classList.add('hidden');
            const analyzeButtonContainer = document.getElementById('analyzeButtonContainer');
            if (analyzeButtonContainer) analyzeButtonContainer.classList.add('hidden');
            if (otherDbToggle) otherDbToggle.textContent = 'Select Database ⬇️';
            if (otherDbUploadBtn) otherDbUploadBtn.classList.add('hidden');
            hideError(); // Hide any error messages
            const hint = document.getElementById('otherDbHint');
            if (hint) hint.style.display = 'block';
            document.querySelectorAll('.db-upload-card').forEach(card => {
                card.classList.remove('active');
            });
            document.querySelectorAll('.db-file-input').forEach(input => {
                input.value = '';
            });
            if (otherDbFileInput) otherDbFileInput.value = '';
        });
    }

    // Analyze button
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            if (!currentFile || !currentDbType) {
                showError('Not Selected', ['Please select a database type and file']);
                return;
            }
            
            // Hide any previous errors
            hideError();

            const formData = new FormData();
            formData.append('script', currentFile);
            formData.append('dbType', currentDbType);

            // Show loading state
            if (analyzeBtn) analyzeBtn.disabled = true;
            if (loading) loading.classList.remove('hidden');
            if (results) results.classList.add('hidden');

            try {
                const response = await fetch('/api/analysis', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include' // Include session cookie
                });

                if (!response.ok) {
                    let errorMessage = `Server error: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        const text = await response.text();
                        errorMessage = text || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();

                if (data.success) {
                    displayResults(data.analysis);
                    // Redirect to dashboard after successful analysis
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 2000);
                } else {
                    const errorMsg = data.message || data.error || 'Unknown error';
                    console.error('Analysis failed:', errorMsg);
                    showGeneralError('Analysis Failed', [errorMsg]);
                }
            } catch (error) {
                console.error('Error:', error);
                const errorMsg = error.message || 'Failed to analyze script. Please try again.';
                showGeneralError('Analysis Error', [errorMsg]);
            } finally {
                if (analyzeBtn) analyzeBtn.disabled = false;
                if (loading) loading.classList.add('hidden');
            }
        });
    }

    function displayResults(analysis) {
        const risk = analysis.riskAssessment || {};
        const dbTypes = analysis.databaseTypes && analysis.databaseTypes.length ? analysis.databaseTypes : [];
        const overview = analysis.overview || analysis.summary || '';
        const purpose = analysis.scriptPurpose || '';

        if (riskSummary) {
            riskSummary.innerHTML = `
                <div class="analysis-overview">
                    <h3>📋 AI Analysis Overview</h3>
                    ${overview ? `<p class="overview-text">${escapeHtml(overview)}</p>` : ''}
                    ${dbTypes.length ? `<p><strong>Databases detected:</strong> <span class="db-tags">${dbTypes.map(d => `<span class="db-tag">${escapeHtml(d)}</span>`).join(' ')}</span></p>` : ''}
                    ${purpose ? `<p><strong>What was analyzed:</strong> ${escapeHtml(purpose)}</p>` : ''}
                </div>
                <h3>📊 Risk Assessment</h3>
                <div class="risk-metrics">
                    <div class="metric">
                        <div class="metric-value">${risk.totalIssues ?? 0}</div>
                        <div class="metric-label">Total Issues</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #c33;">${risk.highRisk ?? 0}</div>
                        <div class="metric-label">High Risk</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #f39c12;">${risk.mediumRisk ?? 0}</div>
                        <div class="metric-label">Medium Risk</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #00b894;">${risk.lowRisk ?? 0}</div>
                        <div class="metric-label">Low Risk</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${risk.riskScore ?? 0}</div>
                        <div class="metric-label">Risk Score</div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <strong>Overall Risk:</strong>
                    <span class="risk-badge risk-${(risk.overallRisk || 'Low').toLowerCase()}">${risk.overallRisk || 'Low'}</span>
                </div>
                ${analysis.summary ? `<p style="margin-top: 15px; color: #666;">${escapeHtml(analysis.summary)}</p>` : ''}
            `;
        }

        // Display issues
        if (issuesList) {
            if (analysis.issues && analysis.issues.length > 0) {
                issuesList.innerHTML = `
                    <h3>🔍 Identified Issues (${analysis.issues.length})</h3>
                    ${analysis.issues.map(issue => `
                    <div class="issue-card ${(issue.severity || 'low').toLowerCase()}">
                        <div class="issue-header">
                            <span class="issue-type">${escapeHtml(issue.type || 'Issue')}</span>
                            <span class="issue-severity severity-${(issue.severity || 'low').toLowerCase()}">
                                ${escapeHtml(issue.severity || 'Low')}
                            </span>
                        </div>
                        <div class="issue-description">${escapeHtml(issue.description || 'No description')}</div>
                        <div class="issue-details">
                            <div><strong>📍 Location:</strong> ${escapeHtml(issue.location || 'N/A')}</div>
                            <div><strong>⚠️ Impact:</strong> ${escapeHtml(issue.impact || 'N/A')}</div>
                            <div><strong>💡 Recommendation:</strong> ${escapeHtml(issue.recommendation || 'Review required')}</div>
                        </div>
                    </div>
                `).join('')}`;
            } else {
                issuesList.innerHTML = `
                    <h3>✅ No Issues Found</h3>
                    <p style="padding: 20px; background: #d5f4e6; border-radius: 5px; color: #00b894;">
                        Great news! No obvious issues were detected in the script. However, it's still recommended to have a security expert review the code.
                    </p>
                `;
            }
        }

        if (results) {
            results.classList.remove('hidden');
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
