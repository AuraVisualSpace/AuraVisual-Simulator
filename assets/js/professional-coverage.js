// COMPLETE PHASE 1: Professional Speaker Coverage System
// This replaces the basic circular coverage with real dispersion patterns

console.log('🚀 Loading Professional Coverage System v1.0...');

// STEP 1: Enhanced Speaker Database with Real Dispersion Data
const professionalSpeakerData = {
    "jbl-srx835p": {
        "id": "jbl-srx835p",
        "manufacturer": "JBL",
        "model": "SRX835P",
        "power": 2000,
        "maxSPL": 134,
        "sensitivity": 99,
        "horizontalCoverage": 90,
        "verticalCoverage": 50,
        "mountTypes": ["stand", "flying", "wall"]
    },
    "qsc-k12-2": {
        "id": "qsc-k12-2",
        "manufacturer": "QSC",
        "model": "K12.2",
        "power": 2000,
        "maxSPL": 132,
        "sensitivity": 98,
        "horizontalCoverage": 75,
        "verticalCoverage": 75,
        "mountTypes": ["stand", "wall"]
    },
    "ev-zlx-15p": {
        "id": "ev-zlx-15p",
        "manufacturer": "EV",
        "model": "ZLX-15P",
        "power": 1000,
        "maxSPL": 126,
        "sensitivity": 94,
        "horizontalCoverage": 90,
        "verticalCoverage": 60,
        "mountTypes": ["stand", "wall"]
    },
    "yamaha-dxr15": {
        "id": "yamaha-dxr15",
        "manufacturer": "Yamaha",
        "model": "DXR15",
        "power": 1100,
        "maxSPL": 135,
        "sensitivity": 99,
        "horizontalCoverage": 90,
        "verticalCoverage": 60,
        "mountTypes": ["stand", "flying", "wall"]
    }
};

// STEP 2: Professional Coverage Calculation Engine
function calculateRealCoverage(speaker, distance) {
    const speakerData = professionalSpeakerData[speaker.databaseId] || professionalSpeakerData['jbl-srx835p'];
    
    // Convert angles to radians for calculation
    const hAngle = (speakerData.horizontalCoverage / 2) * (Math.PI / 180);
    const vAngle = (speakerData.verticalCoverage / 2) * (Math.PI / 180);
    
    // Calculate coverage dimensions at distance
    const width = 2 * distance * Math.tan(hAngle);
    const height = 2 * distance * Math.tan(vAngle);
    
    return {
        width: Math.max(1, width),
        height: Math.max(1, height),
        hCoverage: speakerData.horizontalCoverage,
        vCoverage: speakerData.verticalCoverage,
        maxSPL: speakerData.maxSPL
    };
}

// STEP 3: Convert meters to pixels for display
function metersToDisplayPixels(meters) {
    const room = document.querySelector('.room');
    if (!room) return meters * 50; // Fallback
    
    const roomPixelWidth = parseFloat(room.style.width) || 400;
    const roomActualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
    
    return (meters / roomActualLength) * roomPixelWidth;
}

// STEP 4: Create Professional Coverage Element
function createProfessionalCoverageElement(speaker) {
    const container = document.createElement('div');
    container.id = 'coverage' + speaker.id;
    container.className = 'professional-coverage-container';
    container.style.position = 'absolute';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '5';
    
    // Create multiple coverage rings for depth
    const distances = [3, 6, 9]; // Coverage at 3m, 6m, 9m
    const colors = ['rgba(0, 150, 255, 0.3)', 'rgba(0, 200, 100, 0.25)', 'rgba(255, 150, 0, 0.2)'];
    
    distances.forEach((distance, index) => {
        const coverage = calculateRealCoverage(speaker, distance);
        const ellipse = createCoverageEllipse(coverage, distance, colors[index], speaker);
        container.appendChild(ellipse);
    });
    
    // Add SPL contour lines
    const contour3dB = createSPLContour(speaker, 3, 'rgba(255, 255, 0, 0.8)');
    const contour6dB = createSPLContour(speaker, 6, 'rgba(255, 100, 0, 0.9)');
    container.appendChild(contour3dB);
    container.appendChild(contour6dB);
    
    // Add coverage info
    const info = createCoverageInfo(speaker);
    container.appendChild(info);
    
    return container;
}

// STEP 5: Create Individual Coverage Ellipse
function createCoverageEllipse(coverage, distance, color, speaker) {
    const ellipse = document.createElement('div');
    ellipse.className = 'coverage-ellipse';
    
    const pixelWidth = metersToDisplayPixels(coverage.width);
    const pixelHeight = metersToDisplayPixels(coverage.height);
    
    ellipse.style.position = 'absolute';
    ellipse.style.width = pixelWidth + 'px';
    ellipse.style.height = pixelHeight + 'px';
    ellipse.style.backgroundColor = color;
    ellipse.style.border = '1px solid ' + color.replace('0.3', '0.6').replace('0.25', '0.6').replace('0.2', '0.6');
    ellipse.style.borderRadius = '50%';
    ellipse.style.left = -(pixelWidth / 2) + 'px';
    ellipse.style.top = -(pixelHeight / 2) + 'px';
    ellipse.style.transform = `rotate(${speaker.rotation || 0}deg)`;
    
    // Add distance marker
    const marker = document.createElement('div');
    marker.textContent = distance + 'm';
    marker.style.position = 'absolute';
    marker.style.top = '2px';
    marker.style.left = '2px';
    marker.style.fontSize = '9px';
    marker.style.color = 'white';
    marker.style.fontWeight = 'bold';
    marker.style.textShadow = '1px 1px 1px black';
    ellipse.appendChild(marker);
    
    return ellipse;
}

// STEP 6: Create SPL Contour Lines
function createSPLContour(speaker, dbDrop, color) {
    const contour = document.createElement('div');
    contour.className = 'spl-contour';
    
    // Base calculation for contour size
    const baseCoverage = calculateRealCoverage(speaker, 4); // 4m reference
    const sizeFactor = 1 - (dbDrop / 30); // Smaller for higher dB drops
    
    const pixelWidth = metersToDisplayPixels(baseCoverage.width * sizeFactor);
    const pixelHeight = metersToDisplayPixels(baseCoverage.height * sizeFactor);
    
    contour.style.position = 'absolute';
    contour.style.width = pixelWidth + 'px';
    contour.style.height = pixelHeight + 'px';
    contour.style.border = '2px dashed ' + color;
    contour.style.backgroundColor = 'transparent';
    contour.style.borderRadius = '50%';
    contour.style.left = -(pixelWidth / 2) + 'px';
    contour.style.top = -(pixelHeight / 2) + 'px';
    contour.style.transform = `rotate(${speaker.rotation || 0}deg)`;
    
    // Add SPL label
    const label = document.createElement('div');
    label.textContent = '-' + dbDrop + 'dB';
    label.style.position = 'absolute';
    label.style.bottom = '2px';
    label.style.right = '2px';
    label.style.fontSize = '8px';
    label.style.color = color;
    label.style.fontWeight = 'bold';
    label.style.textShadow = '1px 1px 1px rgba(0,0,0,0.8)';
    contour.appendChild(label);
    
    return contour;
}

// STEP 7: Create Coverage Information Display
function createCoverageInfo(speaker) {
    const info = document.createElement('div');
    info.className = 'coverage-info-display';
    
    const speakerData = professionalSpeakerData[speaker.databaseId] || professionalSpeakerData['jbl-srx835p'];
    
    info.innerHTML = `
        <div style="position: absolute; top: -30px; left: 0; 
                    background: rgba(0,0,0,0.8); color: white; 
                    padding: 3px 8px; border-radius: 4px; 
                    font-size: 10px; white-space: nowrap;
                    border: 1px solid rgba(255,255,255,0.3);">
            <strong>${speakerData.hCoverage}° × ${speakerData.vCoverage}°</strong><br>
            ${speakerData.maxSPL}dB @ 1m
        </div>
    `;
    
    return info;
}

// STEP 8: Position Coverage Element
function positionProfessionalCoverage(element, speaker) {
    element.style.left = (speaker.x || 200) + 'px';
    element.style.top = (speaker.y || 150) + 'px';
    element.style.display = coverageVisible ? 'block' : 'none';
}

// STEP 9: Replace Original Coverage Creation Function
function createProfessionalSpeakerCoverage(speaker) {
    // Remove any existing coverage
    const existingCoverage = document.getElementById('coverage' + speaker.id);
    if (existingCoverage) {
        existingCoverage.remove();
    }
    
    // Create new professional coverage
    const coverageElement = createProfessionalCoverageElement(speaker);
    positionProfessionalCoverage(coverageElement, speaker);
    
    // Add to room
    const roomEditor = document.getElementById('room-editor');
    if (roomEditor) {
        roomEditor.appendChild(coverageElement);
    }
    
    console.log(`Professional coverage created for speaker ${speaker.id}`);
}

// STEP 10: Enhanced Toggle Function
function toggleProfessionalCoverage() {
    coverageVisible = !coverageVisible;
    
    // Update checkbox
    const checkbox = document.getElementById('coverage-checkbox');
    if (checkbox) {
        checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
    }
    
    // Toggle all professional coverage
    document.querySelectorAll('.professional-coverage-container').forEach(coverage => {
        coverage.style.display = coverageVisible ? 'block' : 'none';
    });
    
    // Toggle demo speaker coverage (compatibility)
    for (let i = 1; i <= 3; i++) {
        const demoCoverage = document.getElementById('coverage' + i);
        if (demoCoverage && !demoCoverage.classList.contains('professional-coverage-container')) {
            demoCoverage.style.display = coverageVisible ? 'block' : 'none';
        }
    }
    
    console.log(`Professional coverage display: ${coverageVisible ? 'ON' : 'OFF'}`);
}

// STEP 11: Update All Speakers with Professional Coverage
function updateAllSpeakerCoverage() {
    placedSpeakers.forEach(speaker => {
        createProfessionalSpeakerCoverage(speaker);
    });
}

// STEP 12: Enhanced Speaker Creation Function
function createSpeakerWithProfessionalCoverage(speaker) {
    // Create the speaker element first (use existing function)
    const roomEditor = document.getElementById('room-editor');
    
    const speakerEl = document.createElement('div');
    speakerEl.className = `speaker speaker-mount-${speaker.mountType}`;
    speakerEl.id = 'speaker' + speaker.id;
    speakerEl.onclick = (e) => {
        e.stopPropagation();
        if (currentTool === 'speaker') {
            selectSpeaker(speaker.id);
        }
    };
    speakerEl.style.left = speaker.x + 'px';
    speakerEl.style.top = speaker.y + 'px';
    
    if (currentTool === 'move') {
        speakerEl.style.cursor = 'grab';
        speakerEl.addEventListener('mousedown', handleSpeakerMouseDown);
    }
    
    roomEditor.appendChild(speakerEl);
    
    // Add professional coverage
    setTimeout(() => {
        createProfessionalSpeakerCoverage(speaker);
    }, 100);
}

// STEP 13: Integration with Existing System
function initializeProfessionalCoverageSystem() {
    console.log('🎯 Initializing Professional Coverage System...');
    
    // Replace the coverage toggle function
    if (typeof window !== 'undefined') {
        window.toggleCoverage = toggleProfessionalCoverage;
    }
    
    // Update speaker database with professional data
    if (typeof speakerDatabase !== 'undefined' && speakerDatabase.speakers) {
        speakerDatabase.speakers.forEach(speaker => {
            if (professionalSpeakerData[speaker.id]) {
                Object.assign(speaker, professionalSpeakerData[speaker.id]);
            }
        });
        console.log('✅ Speaker database enhanced with dispersion data');
    }
    
    // Override the createSpeakerElement function for new speakers
    const originalCreateSpeakerElement = window.createSpeakerElement;
    if (originalCreateSpeakerElement) {
        window.createSpeakerElement = function(speaker) {
            createSpeakerWithProfessionalCoverage(speaker);
        };
    }
    
    // Update existing speakers with professional coverage
    setTimeout(() => {
        if (typeof placedSpeakers !== 'undefined' && placedSpeakers.length > 0) {
            updateAllSpeakerCoverage();
            console.log(`✅ Updated ${placedSpeakers.length} speakers with professional coverage`);
        }
        
        // Update demo speakers if they exist
        for (let i = 1; i <= 3; i++) {
            const demoSpeaker = document.getElementById('speaker' + i);
            if (demoSpeaker) {
                const mockSpeaker = {
                    id: i,
                    databaseId: 'jbl-srx835p',
                    x: parseFloat(demoSpeaker.style.left) || 200,
                    y: parseFloat(demoSpeaker.style.top) || 150,
                    rotation: 0
                };
                createProfessionalSpeakerCoverage(mockSpeaker);
            }
        }
    }, 500);
    
    console.log('🚀 Professional Coverage System READY!');
    console.log('📊 Features: Real elliptical patterns, SPL contours, coverage info');
}

// STEP 14: Auto-initialize when loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfessionalCoverageSystem);
    } else {
        // DOM already loaded
        setTimeout(initializeProfessionalCoverageSystem, 100);
    }
}

// STEP 15: Enhanced Room Size Update Integration
function updateRoomSizeWithProfessionalCoverage() {
    // Call original room update
    if (typeof updateRoomSize === 'function') {
        updateRoomSize();
    }
    
    // Recalculate all coverage patterns after room resize
    setTimeout(() => {
        updateAllSpeakerCoverage();
    }, 300);
}

// STEP 16: Enhanced View Switching Integration
function switchViewWithProfessionalCoverage(viewType) {
    // Call original view switch
    if (typeof switchView === 'function') {
        switchView(viewType);
    }
    
    // Update coverage for new view
    setTimeout(() => {
        updateAllSpeakerCoverage();
    }, 200);
}

// STEP 17: Enhanced Speaker Selection Integration
function selectSpeakerWithCoverageUpdate(speakerId) {
    // Call original speaker selection
    if (typeof selectSpeaker === 'function') {
        selectSpeaker(speakerId);
    }
    
    // Highlight selected speaker's coverage
    document.querySelectorAll('.professional-coverage-container').forEach(coverage => {
        if (coverage.id === 'coverage' + speakerId) {
            coverage.style.zIndex = '10';
            coverage.style.opacity = '1';
        } else {
            coverage.style.zIndex = '5';
            coverage.style.opacity = '0.7';
        }
    });
}

// STEP 18: Professional Coverage Cleanup Function
function cleanupProfessionalCoverage(speakerId) {
    const coverageElement = document.getElementById('coverage' + speakerId);
    if (coverageElement && coverageElement.classList.contains('professional-coverage-container')) {
        coverageElement.remove();
        console.log(`Professional coverage removed for speaker ${speakerId}`);
    }
}

// STEP 19: Integration Hooks for Existing Functions
function setupProfessionalCoverageHooks() {
    // Hook into room size updates
    const originalUpdateRoomSize = window.updateRoomSize;
    if (originalUpdateRoomSize) {
        window.updateRoomSize = function() {
            originalUpdateRoomSize.apply(this, arguments);
            setTimeout(() => updateAllSpeakerCoverage(), 300);
        };
    }
    
    // Hook into view switching
    const originalSwitchView = window.switchView;
    if (originalSwitchView) {
        window.switchView = function(viewType) {
            originalSwitchView.apply(this, arguments);
            setTimeout(() => updateAllSpeakerCoverage(), 200);
        };
    }
    
    // Hook into speaker positioning updates
    const originalRepositionSpeakersForView = window.repositionSpeakersForView;
    if (originalRepositionSpeakersForView) {
        window.repositionSpeakersForView = function() {
            originalRepositionSpeakersForView.apply(this, arguments);
            setTimeout(() => updateAllSpeakerCoverage(), 100);
        };
    }
    
    console.log('✅ Professional coverage hooks installed');
}

// STEP 20: Final System Integration and Validation
function validateProfessionalCoverageSystem() {
    let validationPassed = true;
    const requiredElements = ['room-editor', 'coverage-checkbox'];
    
    requiredElements.forEach(elementId => {
        if (!document.getElementById(elementId)) {
            console.warn(`⚠️  Required element missing: ${elementId}`);
            validationPassed = false;
        }
    });
    
    if (typeof placedSpeakers === 'undefined') {
        console.warn('⚠️  placedSpeakers array not found - some features may not work');
    }
    
    if (typeof coverageVisible === 'undefined') {
        console.warn('⚠️  coverageVisible variable not found - using default');
        window.coverageVisible = true;
    }
    
    return validationPassed;
}

// STEP 21: Complete System Initialization
function initializeProfessionalCoverageSystem() {
    console.log('🎯 Initializing Professional Coverage System...');
    
    // Validate system requirements
    if (!validateProfessionalCoverageSystem()) {
        console.error('❌ Professional Coverage System validation failed');
        return;
    }
    
    // Setup integration hooks
    setupProfessionalCoverageHooks();
    
    // Replace the coverage toggle function
    if (typeof window !== 'undefined') {
        window.toggleCoverage = toggleProfessionalCoverage;
    }
    
    // Update speaker database with professional data
    if (typeof speakerDatabase !== 'undefined' && speakerDatabase.speakers) {
        speakerDatabase.speakers.forEach(speaker => {
            if (professionalSpeakerData[speaker.id]) {
                Object.assign(speaker, professionalSpeakerData[speaker.id]);
            }
        });
        console.log('✅ Speaker database enhanced with dispersion data');
    }
    
    // Override the createSpeakerElement function for new speakers
    const originalCreateSpeakerElement = window.createSpeakerElement;
    if (originalCreateSpeakerElement) {
        window.createSpeakerElement = function(speaker) {
            createSpeakerWithProfessionalCoverage(speaker);
        };
        console.log('✅ Speaker creation function enhanced');
    }
    
    // Update existing speakers with professional coverage
    setTimeout(() => {
        if (typeof placedSpeakers !== 'undefined' && placedSpeakers.length > 0) {
            updateAllSpeakerCoverage();
            console.log(`✅ Updated ${placedSpeakers.length} speakers with professional coverage`);
        }
        
        // Update demo speakers if they exist
        let demoSpeakersUpdated = 0;
        for (let i = 1; i <= 3; i++) {
            const demoSpeaker = document.getElementById('speaker' + i);
            if (demoSpeaker) {
                const mockSpeaker = {
                    id: i,
                    databaseId: 'jbl-srx835p',
                    x: parseFloat(demoSpeaker.style.left) || 200,
                    y: parseFloat(demoSpeaker.style.top) || 150,
                    rotation: 0
                };
                createProfessionalSpeakerCoverage(mockSpeaker);
                demoSpeakersUpdated++;
            }
        }
        
        if (demoSpeakersUpdated > 0) {
            console.log(`✅ Updated ${demoSpeakersUpdated} demo speakers with professional coverage`);
        }
        
    }, 500);
    
    console.log('🚀 Professional Coverage System FULLY INITIALIZED!');
    console.log('📊 Features Active: Real elliptical patterns, SPL contours, coverage info');
    console.log('🎯 System ready for professional AV design work');
}

console.log('✅ Professional Coverage System v1.0 - COMPLETE LOAD FINISHED!');
console.log('🎯 Ready to transform your speaker coverage visualization');

// Export functions for debugging/testing
if (typeof window !== 'undefined') {
    window.ProfessionalCoverage = {
        toggle: toggleProfessionalCoverage,
        updateAll: updateAllSpeakerCoverage,
        create: createProfessionalSpeakerCoverage,
        cleanup: cleanupProfessionalCoverage
    };
}
