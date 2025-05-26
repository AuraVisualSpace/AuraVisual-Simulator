// AuraVisual - Professional AV Speaker Layout Application
// Complete JavaScript with 3D Room Support and Drag Functionality

// Professional Speaker Database
const speakerDatabase = {
    "speakers": [
        {
            "id": "jbl-srx835p",
            "manufacturer": "JBL",
            "model": "SRX835P",
            "type": "point-source",
            "power": 2000,
            "maxSPL": 134,
            "sensitivity": 99,
            "horizontalCoverage": 90,
            "verticalCoverage": 50,
            "mountTypes": ["stand", "flying", "wall"],
            "imageUrl": null
        },
        {
            "id": "qsc-k12-2",
            "manufacturer": "QSC",
            "model": "K12.2",
            "type": "point-source",
            "power": 2000,
            "maxSPL": 132,
            "sensitivity": 98,
            "horizontalCoverage": 75,
            "verticalCoverage": 75,
            "mountTypes": ["stand", "wall"],
            "imageUrl": null
        },
        {
            "id": "ev-zlx-15p",
            "manufacturer": "EV",
            "model": "ZLX-15P",
            "type": "point-source",
            "power": 1000,
            "maxSPL": 126,
            "sensitivity": 94,
            "horizontalCoverage": 90,
            "verticalCoverage": 60,
            "mountTypes": ["stand", "wall"],
            "imageUrl": null
        },
        {
            "id": "bose-freespace-ds100se",
            "manufacturer": "Bose",
            "model": "FreeSpace DS100SE",
            "type": "ceiling",
            "power": 70,
            "maxSPL": 110,
            "sensitivity": 89,
            "horizontalCoverage": 360,
            "verticalCoverage": 120,
            "mountTypes": ["ceiling", "in-ceiling"],
            "imageUrl": null
        },
        {
            "id": "yamaha-dxr15",
            "manufacturer": "Yamaha",
            "model": "DXR15",
            "type": "point-source",
            "power": 1100,
            "maxSPL": 135,
            "sensitivity": 99,
            "horizontalCoverage": 90,
            "verticalCoverage": 60,
            "mountTypes": ["stand", "flying", "wall"],
            "imageUrl": null
        },
        {
            "id": "martin-audio-cdd12",
            "manufacturer": "Martin Audio",
            "model": "CDD12",
            "type": "point-source",
            "power": 500,
            "maxSPL": 128,
            "sensitivity": 96,
            "horizontalCoverage": 90,
            "verticalCoverage": 60,
            "mountTypes": ["stand", "wall", "ceiling"],
            "imageUrl": null
        },
        {
            "id": "danley-sm96",
            "manufacturer": "Danley",
            "model": "SM96",
            "type": "point-source",
            "power": 800,
            "maxSPL": 130,
            "sensitivity": 97,
            "horizontalCoverage": 90,
            "verticalCoverage": 40,
            "mountTypes": ["stand", "flying", "wall"],
            "imageUrl": null
        },
        {
            "id": "meyer-sound-uhp1",
            "manufacturer": "Meyer Sound",
            "model": "UHP-1P",
            "type": "point-source",
            "power": 1000,
            "maxSPL": 131,
            "sensitivity": 98,
            "horizontalCoverage": 80,
            "verticalCoverage": 50,
            "mountTypes": ["stand", "flying", "wall"],
            "imageUrl": null
        }
    ],
    "manufacturers": [
        "JBL", "QSC", "EV", "Yamaha", "Bose", "Martin Audio", "Danley", "Meyer Sound"
    ],
    "types": [
        {"id": "point-source", "name": "Point Source"},
        {"id": "line-array", "name": "Line Array"},
        {"id": "ceiling", "name": "Ceiling"},
        {"id": "surface-mount", "name": "Surface Mount"},
        {"id": "subwoofer", "name": "Subwoofer"}
    ],
    "mountTypes": [
        {"id": "stand", "name": "Floor Stand"},
        {"id": "flying", "name": "Flying/Rigged"},
        {"id": "wall", "name": "Wall Mount"},
        {"id": "ceiling", "name": "Ceiling Mount"},
        {"id": "in-ceiling", "name": "In-Ceiling"},
        {"id": "in-wall", "name": "In-Wall"}
    ]
};

// Global application state variables
let placedSpeakers = [];
let nextSpeakerId = 1000; // Start with higher numbers for user-placed speakers
let selectedSpeakerId = null;
let selectedDatabaseSpeakerId = null;
let coverageVisible = true;
let splValuesVisible = false;
let currentView = 'top'; // 'top' or 'side'
let currentTool = 'speaker'; // 'speaker' or 'move'

// Drag functionality variables
let isDragging = false;
let dragSpeakerId = null;
let dragOffset = { x: 0, y: 0 };

// Initialize application when page loads
window.onload = function() {
    console.log('AuraVisual Professional AV Layout App - Initializing...');
    
    // Initialize core systems
    initializeSpeakerDatabase();
    initializeEventHandlers();
    
    // Initialize 3D room
    setTimeout(() => {
        initializeRoomSize();
        applyViewStyling();
    }, 100);
    
    // Initialize with first speaker selected
    setTimeout(() => {
        selectSpeaker(1);
        selectSpeakerModel('jbl-srx835p');
        updateStatusBar();
    }, 200);
    
    console.log('AuraVisual initialized successfully!');
};

// Initialize the professional speaker database
function initializeSpeakerDatabase() {
    console.log('Loading professional speaker database...');
    
    // Populate manufacturer filter
    const manufacturerSelect = document.getElementById('manufacturer-filter');
    speakerDatabase.manufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerSelect.appendChild(option);
    });
    
    // Populate type filter
    const typeSelect = document.getElementById('type-filter');
    speakerDatabase.types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        typeSelect.appendChild(option);
    });
    
    // Populate mount type filter
    const mountSelect = document.getElementById('mount-filter');
    speakerDatabase.mountTypes.forEach(mountType => {
        const option = document.createElement('option');
        option.value = mountType.id;
        option.textContent = mountType.name;
        mountSelect.appendChild(option);
    });
    
    // Render initial speaker list
    renderSpeakerList(speakerDatabase.speakers);
    console.log(`Loaded ${speakerDatabase.speakers.length} professional speakers`);
}

// Initialize event handlers
function initializeEventHandlers() {
    // Room editor click handler for placing speakers
    const roomEditor = document.getElementById('room-editor');
    roomEditor.addEventListener('click', function(event) {
        if (event.target === this || event.target.className === 'room' || event.target.className === 'room-label') {
            if (currentTool === 'speaker') {
                addSpeakerToRoom(event.clientX, event.clientY);
            }
        }
    });
    
    // Real-time room size update listeners
    setTimeout(() => {
        const lengthInput = document.getElementById('room-length');
        const widthInput = document.getElementById('room-width');  
        const heightInput = document.getElementById('room-height');
        
        if (lengthInput && widthInput && heightInput) {
            let roomSizeTimeout;
            
            const updateRoom = () => {
                clearTimeout(roomSizeTimeout);
                roomSizeTimeout = setTimeout(updateRoomSize, 300);
            };
            
            lengthInput.addEventListener('input', updateRoom);
            widthInput.addEventListener('input', updateRoom);
            heightInput.addEventListener('input', updateRoom);
        }
    }, 300);
    
    // Global mouse event listeners for dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Render speaker list with professional styling and icons
function renderSpeakerList(speakers) {
    const container = document.getElementById('speaker-list-container');
    container.innerHTML = '';
    
    if (speakers.length === 0) {
        container.innerHTML = '<div class="no-results">No speakers match your search criteria</div>';
        return;
    }
    
    speakers.forEach(speaker => {
        const speakerEl = document.createElement('div');
        speakerEl.className = 'speaker-item';
        speakerEl.onclick = () => selectSpeakerModel(speaker.id);
        
        // Professional speaker icons based on type and manufacturer
        let speakerIcon = '🔊';
        let iconColor = '#4a6fba';
        
        switch(speaker.type) {
            case 'ceiling':
                speakerIcon = '⚪';
                iconColor = '#6fa8dc';
                break;
            case 'subwoofer':
                speakerIcon = '⬛';
                iconColor = '#ff6b6b';
                break;
            case 'line-array':
                speakerIcon = '▬';
                iconColor = '#4ecdc4';
                break;
            default:
                speakerIcon = '🔊';
                iconColor = '#4a6fba';
        }
        
        // Manufacturer-specific styling
        let manufacturerClass = speaker.manufacturer.toLowerCase().replace(/\s+/g, '');
        
        // Mount type indicator
        let mountIndicator = '';
        if (speaker.mountTypes.includes('ceiling') || speaker.mountTypes.includes('in-ceiling')) {
            mountIndicator = '<div class="mount-indicator ceiling">C</div>';
        } else if (speaker.mountTypes.includes('wall') || speaker.mountTypes.includes('in-wall')) {
            mountIndicator = '<div class="mount-indicator wall">W</div>';
        } else if (speaker.mountTypes.includes('stand')) {
            mountIndicator = '<div class="mount-indicator stand">S</div>';
        } else if (speaker.mountTypes.includes('flying')) {
            mountIndicator = '<div class="mount-indicator flying">F</div>';
        }
        
        speakerEl.innerHTML = `
            <div class="speaker-icon ${manufacturerClass}">
                <div class="speaker-emoji" style="font-size: 28px; color: ${iconColor};">${speakerIcon}</div>
                ${mountIndicator}
            </div>
            <div class="speaker-details">
                <div class="speaker-manufacturer">${speaker.manufacturer}</div>
                <div class="speaker-model">${speaker.model}</div>
                <div class="speaker-specs">${speaker.horizontalCoverage}° × ${speaker.verticalCoverage}°</div>
                <div class="speaker-specs">${speaker.maxSPL}dB SPL • ${speaker.power}W</div>
            </div>
        `;
        
        // Highlight selected speaker
        if (speaker.id === selectedDatabaseSpeakerId) {
            speakerEl.classList.add('selected');
        }
        
        container.appendChild(speakerEl);
    });
}

// Filter speakers based on search and filter criteria
function filterSpeakers() {
    const searchTerm = document.getElementById('speaker-search').value.toLowerCase();
    const manufacturer = document.getElementById('manufacturer-filter').value;
    const type = document.getElementById('type-filter').value;
    const mountType = document.getElementById('mount-filter').value;
    
    const filteredSpeakers = speakerDatabase.speakers.filter(speaker => {
        const matchesSearch = 
            speaker.manufacturer.toLowerCase().includes(searchTerm) ||
            speaker.model.toLowerCase().includes(searchTerm);
        
        const matchesManufacturer = 
            manufacturer === '' || speaker.manufacturer === manufacturer;
        
        const matchesType = 
            type === '' || speaker.type === type;
        
        const matchesMountType = 
            mountType === '' || speaker.mountTypes.includes(mountType);
        
        return matchesSearch && matchesManufacturer && matchesType && matchesMountType;
    });
    
    renderSpeakerList(filteredSpeakers);
    console.log(`Filtered to ${filteredSpeakers.length} speakers`);
}

// Get speaker data by ID from database
function getSpeakerById(speakerId) {
    return speakerDatabase.speakers.find(speaker => speaker.id === speakerId);
}

// Select a speaker model from the database
function selectSpeakerModel(speakerId) {
    selectedDatabaseSpeakerId = speakerId;
    const speakerData = getSpeakerById(speakerId);
    
    // Update visual selection in speaker list
    document.querySelectorAll('.speaker-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Find and highlight the selected speaker
    const speakerElements = document.querySelectorAll('.speaker-item');
    for (let i = 0; i < speakerElements.length; i++) {
        if (speakerElements[i].querySelector('.speaker-model').textContent === speakerData.model) {
            speakerElements[i].classList.add('selected');
            break;
        }
    }
    
    // Update selected speaker's model if one is selected
    if (selectedSpeakerId !== null) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].databaseId = speakerId;
            updatePropertiesPanel(selectedSpeakerId);
        }
    }
    
    console.log(`Selected speaker model: ${speakerData.manufacturer} ${speakerData.model}`);
}

// === 3D ROOM MANAGEMENT FUNCTIONS ===

// Initialize 3D room with default dimensions
function initializeRoomSize() {
    document.getElementById('room-length').value = 8.0;
    document.getElementById('room-width').value = 5.0;
    document.getElementById('room-height').value = 3.5;
    updateRoomSize();
    console.log('3D Room initialized: 8.0m × 5.0m × 3.5m');
}

// Update room size with 3D dimensions (Length × Width × Height)
function updateRoomSize() {
    const length = parseFloat(document.getElementById('room-length').value);
    const width = parseFloat(document.getElementById('room-width').value);
    const height = parseFloat(document.getElementById('room-height').value);
    
    // Validate dimensions
    if (isNaN(length) || length < 2 || length > 30) {
        alert('Room length must be between 2m and 30m');
        document.getElementById('room-length').value = 8.0;
        return;
    }
    
    if (isNaN(width) || width < 2 || width > 30) {
        alert('Room width must be between 2m and 30m');
        document.getElementById('room-width').value = 5.0;
        return;
    }
    
    if (isNaN(height) || height < 2 || height > 12) {
        alert('Room height must be between 2m and 12m');
        document.getElementById('room-height').value = 3.5;
        return;
    }
    
    // Calculate display dimensions based on current view
    let displayWidth, displayHeight, dimensionLabel;
    const baseScale = 50; // 1 meter = 50 pixels
    const maxDisplayWidth = 600;
    const maxDisplayHeight = 400;
    
    if (currentView === 'top') {
        // Top view: Length × Width (floor plan)
        displayWidth = length * baseScale;
        displayHeight = width * baseScale;
        dimensionLabel = `${length}m × ${width}m (H: ${height}m)`;
    } else {
        // Side view: Length × Height (elevation)
        displayWidth = length * baseScale;
        displayHeight = height * baseScale;
        dimensionLabel = `${length}m × ${height}m (W: ${width}m)`;
    }
    
    // Apply intelligent scaling for large rooms
    let scaleFactor = 1;
    if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
        const scaleX = maxDisplayWidth / displayWidth;
        const scaleY = maxDisplayHeight / displayHeight;
        scaleFactor = Math.min(scaleX, scaleY);
        displayWidth *= scaleFactor;
        displayHeight *= scaleFactor;
    }
    
    // Update room visual elements
    const room = document.querySelector('.room');
    const overlay = document.querySelector('.coverage-overlay');
    
    if (room) {
        // Update room dimensions
        room.style.width = displayWidth + 'px';
        room.style.height = displayHeight + 'px';
        
        // Store all 3D dimensions
        room.setAttribute('data-actual-length', length);
        room.setAttribute('data-actual-width', width);
        room.setAttribute('data-actual-height', height);
        room.setAttribute('data-scale-factor', scaleFactor);
        room.setAttribute('data-display-width', displayWidth);
        room.setAttribute('data-display-height', displayHeight);
        
        // Center room in editor
        const centerX = Math.max(100, (800 - displayWidth) / 2);
        const centerY = Math.max(80, (500 - displayHeight) / 2);
        
        room.style.left = centerX + 'px';
        room.style.top = centerY + 'px';
        
        // Update coverage overlay
        if (overlay) {
            overlay.style.width = displayWidth + 'px';
            overlay.style.height = displayHeight + 'px';
            overlay.style.left = centerX + 'px';
            overlay.style.top = centerY + 'px';
        }
        
        // Add dimension labels
        updateRoomDimensionLabels(room, length, width, height);
    }
    
    // Update room label
    const roomLabel = document.querySelector('.room-label');
    if (roomLabel) {
        let labelText = `Room: ${dimensionLabel}`;
        if (scaleFactor < 1) {
            labelText += ` (${Math.round(scaleFactor * 100)}% scale)`;
        }
        roomLabel.textContent = labelText;
    }
    
    // Apply view-specific styling
    applyViewStyling();
    
    // Reposition speakers for current view
    repositionSpeakersForView();
    
    // Update status bar
    updateStatusBar();
    
    console.log(`Room updated: ${length}m × ${width}m × ${height}m | View: ${currentView} | Scale: ${Math.round(scaleFactor * 100)}%`);
}

// Add dimension labels to room edges
function updateRoomDimensionLabels(room, length, width, height) {
    // Remove existing labels
    const existingLabels = room.querySelectorAll('.room-dimensions');
    existingLabels.forEach(label => label.remove());
    
    if (currentView === 'top') {
        // Length label (bottom edge)
        const lengthLabel = document.createElement('div');
        lengthLabel.className = 'room-dimensions length';
        lengthLabel.textContent = `${length}m`;
        room.appendChild(lengthLabel);
        
        // Width label (right edge)
        const widthLabel = document.createElement('div');
        widthLabel.className = 'room-dimensions width';
        widthLabel.textContent = `${width}m`;
        room.appendChild(widthLabel);
    } else {
        // Length label (bottom edge)
        const lengthLabel = document.createElement('div');
        lengthLabel.className = 'room-dimensions length';
        lengthLabel.textContent = `${length}m`;
        room.appendChild(lengthLabel);
        
        // Height label (right edge)
        const heightLabel = document.createElement('div');
        heightLabel.className = 'room-dimensions height';
        heightLabel.textContent = `${height}m`;
        room.appendChild(heightLabel);
    }
}

// Switch between top and side views with full 3D support
function switchView(viewType) {
    const previousView = currentView;
    currentView = viewType;
    
    // Update button states
    document.getElementById('top-view-btn').classList.toggle('active', viewType === 'top');
    document.getElementById('side-view-btn').classList.toggle('active', viewType === 'side');
    
    // Update view label with descriptive text
    const viewLabel = document.getElementById('room-view-label');
    viewLabel.textContent = viewType === 'top' ? 'Top View - Floor Plan' : 'Side View - Elevation';
    
    // Update room dimensions and styling
    updateRoomSize();
    
    // Update status bar
    updateStatusBar();
    
    console.log(`View switched from ${previousView} to ${viewType}`);
}

// Apply view-specific styling to room and speakers
function applyViewStyling() {
    const roomEditor = document.getElementById('room-editor');
    
    // Remove existing view classes
    roomEditor.classList.remove('top-view', 'side-view');
    
    // Add current view class
    roomEditor.classList.add(currentView + '-view');
    
    // Update speakers for current view
    if (currentView === 'side') {
        updateSpeakersForSideView();
    } else {
        updateSpeakersForTopView();
    }
}

// Update speakers for side view (show elevation and mount heights)
function updateSpeakersForSideView() {
    // Update placed speakers
    placedSpeakers.forEach(speaker => {
        const speakerEl = document.getElementById('speaker' + speaker.id);
        if (speakerEl) {
            speakerEl.setAttribute('data-height', (speaker.mountHeight || 1.2).toFixed(1) + 'm');
        }
    });
    
    // Update demo speakers with default heights
    const demoSpeakers = ['speaker1', 'speaker2', 'speaker3'];
    demoSpeakers.forEach(speakerId => {
        const speakerEl = document.getElementById(speakerId);
        if (speakerEl) {
            speakerEl.setAttribute('data-height', '1.2m');
        }
    });
}

// Update speakers for top view (remove height attributes)
function updateSpeakersForTopView() {
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.removeAttribute('data-height');
    });
}

// Reposition all speakers when view changes
function repositionSpeakersForView() {
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    const roomWidth = parseFloat(room.style.width) || 400;
    const roomHeight = parseFloat(room.style.height) || 280;
    
    // Reposition user-placed speakers
    placedSpeakers.forEach(speaker => {
        const speakerEl = document.getElementById('speaker' + speaker.id);
        const coverageEl = document.getElementById('coverage' + speaker.id);
        
        if (speakerEl && coverageEl) {
            let newX, newY;
            
            if (currentView === 'top') {
                // Top view: use length (X) and width (Y) positions
                const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
                const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
                
                const xPercent = (speaker.actualX || actualLength/2) / actualLength;
                const yPercent = (speaker.actualY || actualWidth/2) / actualWidth;
                
                newX = roomLeft + (xPercent * roomWidth);
                newY = roomTop + (yPercent * roomHeight);
                
            } else {
                // Side view: use length (X) and mount height for Y position
                const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
                const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
                
                const xPercent = (speaker.actualX || actualLength/2) / actualLength;
                const heightRatio = 1 - (speaker.mountHeight || 1.2) / actualHeight; // Inverted
                
                newX = roomLeft + (xPercent * roomWidth);
                newY = roomTop + (heightRatio * roomHeight);
            }
            
            // Update positions
            speakerEl.style.left = newX + 'px';
            speakerEl.style.top = newY + 'px';
            coverageEl.style.left = newX + 'px';
            coverageEl.style.top = newY + 'px';
            
            // Update stored pixel positions
            speaker.x = newX;
            speaker.y = newY;
        }
    });
    
    // Reposition demo speakers
    const demoSpeakers = ['speaker1', 'speaker2', 'speaker3'];
    demoSpeakers.forEach((speakerId, index) => {
        const speakerEl = document.getElementById(speakerId);
        const coverageEl = document.getElementById('coverage' + (index + 1));
        
        if (speakerEl && coverageEl) {
            let newX, newY;
            
            if (currentView === 'top') {
                // Distribute evenly across room width
                const spacing = roomWidth / (demoSpeakers.length + 1);
                newX = roomLeft + spacing * (index + 1);
                newY = roomTop + (roomHeight * 0.3);
            } else {
                // Side view: distribute across length, position at typical height
                const spacing = roomWidth / (demoSpeakers.length + 1);
                newX = roomLeft + spacing * (index + 1);
                newY = roomTop + (roomHeight * 0.65); // ~1.2m in 3.5m room
            }
            
            speakerEl.style.left = newX + 'px';
            speakerEl.style.top = newY + 'px';
            coverageEl.style.left = newX + 'px';
            coverageEl.style.top = newY + 'px';
        }
    });
}

// === TOOL SELECTION AND DRAG FUNCTIONALITY ===

// Enhanced tool selection with drag support
function selectTool(tool) {
    currentTool = tool;
    
    // Update tool button styling
    document.getElementById('speaker-tool').classList.toggle('active', tool === 'speaker');
    document.getElementById('move-tool').classList.toggle('active', tool === 'move');
    
    // Update cursor and functionality
    const roomEditor = document.getElementById('room-editor');
    if (tool === 'speaker') {
        roomEditor.style.cursor = 'crosshair';
        roomEditor.title = 'Click to place speakers';
        disableSpeakerDragging();
    } else if (tool === 'move') {
        roomEditor.style.cursor = 'default';
        roomEditor.title = 'Drag speakers to move them';
        enableSpeakerDragging();
    }
    
    console.log(`Tool switched to: ${tool}`);
}

// Enable drag functionality for all speakers
function enableSpeakerDragging() {
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.style.cursor = 'grab';
        speaker.addEventListener('mousedown', handleSpeakerMouseDown);
    });
}

// Disable drag functionality
function disableSpeakerDragging() {
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.style.cursor = 'pointer';
        speaker.removeEventListener('mousedown', handleSpeakerMouseDown);
    });
    
    // Clean up any ongoing drag
    isDragging = false;
    dragSpeakerId = null;
}

// Handle mouse down on speaker (start drag)
function handleSpeakerMouseDown(event) {
    if (currentTool !== 'move') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Get speaker ID
    const speakerId = event.target.id.replace('speaker', '');
    dragSpeakerId = parseInt(speakerId);
    
    // Select the speaker being dragged
    selectSpeaker(dragSpeakerId);
    
    // Calculate drag offset
    const speakerRect = event.target.getBoundingClientRect();
    dragOffset.x = event.clientX - speakerRect.left - speakerRect.width / 2;
    dragOffset.y = event.clientY - speakerRect.top - speakerRect.height / 2;
    
    // Start dragging
    isDragging = true;
    event.target.style.cursor = 'grabbing';
    event.target.style.zIndex = '1000';
    
    console.log(`Started dragging speaker ${dragSpeakerId}`);
}

// Handle mouse move during drag
function handleMouseMove(event) {
    if (!isDragging || !dragSpeakerId || currentTool !== 'move') return;
    
    event.preventDefault();
    
    // Calculate new position
    const newX = event.clientX - dragOffset.x;
    const newY = event.clientY - dragOffset.y;
    
    // Get room boundaries
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomRect = room.getBoundingClientRect();
    
    // Constrain to room boundaries
    const constrainedX = Math.max(roomRect.left + 10, Math.min(roomRect.right - 30, newX));
    const constrainedY = Math.max(roomRect.top + 10, Math.min(roomRect.bottom - 30, newY));
    
    // Update speaker position
    const speakerEl = document.getElementById('speaker' + dragSpeakerId);
    const coverageEl = document.getElementById('coverage' + dragSpeakerId);
    
    if (speakerEl) {
        speakerEl.style.left = constrainedX + 'px';
        speakerEl.style.top = constrainedY + 'px';
    }
    
    if (coverageEl) {
        coverageEl.style.left = constrainedX + 'px';
        coverageEl.style.top = constrainedY + 'px';
    }
    
    // Update speaker data
    const speakerIndex = placedSpeakers.findIndex(s => s.id === dragSpeakerId);
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].x = constrainedX;
        placedSpeakers[speakerIndex].y = constrainedY;
        
        // Convert to meters and update actual positions
        updateSpeakerActualPosition(speakerIndex, constrainedX, constrainedY);
        
        // Update properties panel in real-time
        if (selectedSpeakerId === dragSpeakerId) {
            updatePropertiesPanel(dragSpeakerId);
        }
    }
}

// Handle mouse up (end drag)
function handleMouseUp(event) {
    if (!isDragging || !dragSpeakerId) return;
    
    isDragging = false;
    
    const speakerEl = document.getElementById('speaker' + dragSpeakerId);
    if (speakerEl) {
        speakerEl.style.cursor = 'grab';
        speakerEl.style.zIndex = '';
    }
    
    console.log(`Finished dragging speaker ${dragSpeakerId}`);
    dragSpeakerId = null;
}

// Update speaker's actual position in meters based on pixel position
function updateSpeakerActualPosition(speakerIndex, pixelX, pixelY) {
    const room = document.querySelector('.room');
    if (!room || speakerIndex < 0 || speakerIndex >= placedSpeakers.length) return;
    
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    const roomWidth = parseFloat(room.style.width) || 400;
    const roomHeight = parseFloat(room.style.height) || 280;
    
    if (currentView === 'top') {
        // Top view: convert to length and width coordinates
        const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
        const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
        
        const xPercent = (pixelX - roomLeft) / roomWidth;
        const yPercent = (pixelY - roomTop) / roomHeight;
        
        placedSpeakers[speakerIndex].actualX = Math.max(0, Math.min(actualLength, xPercent * actualLength));
        placedSpeakers[speakerIndex].actualY = Math.max(0, Math.min(actualWidth, yPercent * actualWidth));
        
    } else {
        // Side view: convert to length and mount height
        const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
        const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
        
        const xPercent = (pixelX - roomLeft) / roomWidth;
        const heightRatio = 1 - (pixelY - roomTop) / roomHeight; // Inverted
        
        placedSpeakers[speakerIndex].actualX = Math.max(0, Math.min(actualLength, xPercent * actualLength));
        placedSpeakers[speakerIndex].mountHeight = Math.max(0.1, Math.min(actualHeight, heightRatio * actualHeight));
    }
}

// === SPEAKER MANAGEMENT FUNCTIONS ===

// Add a new speaker to the room
function addSpeakerToRoom(clientX, clientY) {
    if (!selectedDatabaseSpeakerId) {
        alert('Please select a speaker model first');
        return;
    }
    
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomRect = room.getBoundingClientRect();
    
    // Check if click is within room bounds
    if (clientX < roomRect.left || clientX > roomRect.right || clientY < roomRect.top || clientY > roomRect.bottom) {
        return;
    }
    
    const speakerData = getSpeakerById(selectedDatabaseSpeakerId);
    const defaultMountType = speakerData.mountTypes[0];
    
    // Convert click position to room-relative coordinates
    const x = clientX - roomRect.left + parseFloat(room.style.left);
    const y = clientY - roomRect.top + parseFloat(room.style.top);
    
    // Create new speaker object with 3D positioning
    const newSpeaker = {
        id: nextSpeakerId++,
        databaseId: selectedDatabaseSpeakerId,
        x: x,
        y: y,
        actualX: 0, // Will be calculated
        actualY: 0, // Will be calculated
        mountType: defaultMountType,
        mountHeight: defaultMountType.includes('ceiling') ? 3.0 : 1.2,
        rotation: 0,
        tilt: defaultMountType.includes('ceiling') ? 90 : 0,
        power: Math.round(speakerData.power / 10)
    };
    
    // Calculate actual meter positions
    updateSpeakerActualPosition(placedSpeakers.length, x, y);
    
    placedSpeakers.push(newSpeaker);
    createSpeakerElement(newSpeaker);
    selectSpeaker(newSpeaker.id);
    
    updateStatusBar();
    
    console.log(`Added speaker: ${speakerData.manufacturer} ${speakerData.model} at ${newSpeaker.actualX?.toFixed(1)}m, ${newSpeaker.actualY?.toFixed(1)}m`);
}

// Create speaker element in DOM
function createSpeakerElement(speaker) {
    const roomEditor = document.getElementById('room-editor');
    
    // Create speaker element
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
    
    // Add drag capability if move tool is active
    if (currentTool === 'move') {
        speakerEl.style.cursor = 'grab';
        speakerEl.addEventListener('mousedown', handleSpeakerMouseDown);
    }
    
    // Create coverage element
    const coverageEl = document.createElement('div');
    coverageEl.className = 'speaker-coverage';
    coverageEl.id = 'coverage' + speaker.id;
    coverageEl.style.left = speaker.x + 'px';
    coverageEl.style.top = speaker.y + 'px';
    coverageEl.style.display = coverageVisible ? 'block' : 'none';
    
    roomEditor.appendChild(speakerEl);
    roomEditor.appendChild(coverageEl);
}

// Select a speaker in the room
function selectSpeaker(id) {
    // Deselect previous speaker
    if (selectedSpeakerId) {
        const prevSpeaker = document.getElementById('speaker' + selectedSpeakerId);
        if (prevSpeaker) {
            prevSpeaker.classList.remove('selected');
        }
    }
    
    // Select new speaker
    selectedSpeakerId = id;
    const speakerEl = document.getElementById('speaker' + id);
    if (speakerEl) {
        speakerEl.classList.add('selected');
    }
    
    // Update properties panel
    updatePropertiesPanel(id);
    
    console.log(`Selected speaker: ${id}`);
}

// Update properties panel with speaker information
function updatePropertiesPanel(speakerId) {
    const speaker = placedSpeakers.find(s => s.id === speakerId);
    
    if (!speaker) {
        // Handle demo speakers
        const speakerData = getSpeakerById(selectedDatabaseSpeakerId || 'jbl-srx835p');
        document.getElementById('model-value').textContent = speakerData ? 
            `${speakerData.manufacturer} ${speakerData.model}` : 'Demo Speaker';
        
        document.getElementById('x-position').value = '4.0 m';
        document.getElementById('y-position').value = '2.5 m';
        document.getElementById('mount-height').value = '1.2 m';
        document.getElementById('rotation').value = '0°';
        document.getElementById('tilt').value = '0°';
        document.getElementById('power').value = '100W';
        return;
    }
    
    const speakerData = getSpeakerById(speaker.databaseId);
    
    // Update properties with 3D coordinates
    document.getElementById('model-value').textContent = `${speakerData.manufacturer} ${speakerData.model}`;
    document.getElementById('x-position').value = (speaker.actualX || 4.0).toFixed(1) + ' m';
    document.getElementById('y-position').value = (speaker.actualY || 2.5).toFixed(1) + ' m';
    document.getElementById('mount-height').value = (speaker.mountHeight || 1.2).toFixed(1) + ' m';
    document.getElementById('rotation').value = speaker.rotation + '°';
    document.getElementById('tilt').value = speaker.tilt + '°';
    document.getElementById('power').value = speaker.power + 'W';
    
    // Update mount type dropdown
    const mountTypeSelect = document.getElementById('mount-type');
    mountTypeSelect.innerHTML = '';
    
    speakerData.mountTypes.forEach(mountType => {
        const mountTypeInfo = speakerDatabase.mountTypes.find(mt => mt.id === mountType);
        if (mountTypeInfo) {
            const option = document.createElement('option');
            option.value = mountType;
            option.textContent = mountTypeInfo.name;
            option.selected = (speaker.mountType === mountType);
            mountTypeSelect.appendChild(option);
        }
    });
}

// Delete selected speaker
function deleteSelectedSpeaker() {
    if (!selectedSpeakerId) {
        alert('No speaker selected');
        return;
    }
    
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    if (speakerIndex !== -1) {
        if (confirm(`Delete selected speaker?`)) {
            // Remove from DOM
            const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
            const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
            
            if (speakerEl) speakerEl.remove();
            if (coverageEl) coverageEl.remove();
            
            // Remove from array
            placedSpeakers.splice(speakerIndex, 1);
            
            // Reset selection
            selectedSpeakerId = null;
            document.getElementById('model-value').textContent = 'Select a speaker';
            
            updateStatusBar();
            console.log('Speaker deleted');
        }
    } else {
        alert('Cannot delete demo speakers. Please add your own speakers first.');
    }
}

// === PROPERTY UPDATE FUNCTIONS ===

function updatePosition() {
    if (!selectedSpeakerId || !placedSpeakers.find(s => s.id === selectedSpeakerId)) return;
    
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    if (speakerIndex === -1) return;
    
    const xValue = parseFloat(document.getElementById('x-position').value);
    const yValue = parseFloat(document.getElementById('y-position').value);
    
    // Update actual positions
    placedSpeakers[speakerIndex].actualX = xValue;
    placedSpeakers[speakerIndex].actualY = yValue;
    
    // Convert to pixel positions and update display
    const room = document.querySelector('.room');
    if (room) {
        const roomLeft = parseFloat(room.style.left) || 100;
        const roomTop = parseFloat(room.style.top) || 80;
        const roomWidth = parseFloat(room.style.width) || 400;
        const roomHeight = parseFloat(room.style.height) || 280;
        
        let newPixelX, newPixelY;
        
        if (currentView === 'top') {
            const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
            const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
            
            newPixelX = roomLeft + (xValue / actualLength * roomWidth);
            newPixelY = roomTop + (yValue / actualWidth * roomHeight);
        } else {
            const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
            const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
            
            newPixelX = roomLeft + (xValue / actualLength * roomWidth);
            newPixelY = roomTop + ((actualHeight - placedSpeakers[speakerIndex].mountHeight) / actualHeight * roomHeight);
        }
        
        // Update DOM elements
        const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
        const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
        
        if (speakerEl) {
            speakerEl.style.left = newPixelX + 'px';
            speakerEl.style.top = newPixelY + 'px';
            placedSpeakers[speakerIndex].x = newPixelX;
            placedSpeakers[speakerIndex].y = newPixelY;
        }
        
        if (coverageEl) {
            coverageEl.style.left = newPixelX + 'px';
            coverageEl.style.top = newPixelY + 'px';
        }
    }
}

function updateMountHeight() {
    if (!selectedSpeakerId) return;
    
    const mountHeight = parseFloat(document.getElementById('mount-height').value);
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].mountHeight = mountHeight;
        
        // If in side view, update Y position based on new mount height
        if (currentView === 'side') {
            repositionSpeakersForView();
        }
        
        console.log(`Mount height updated to ${mountHeight}m`);
    }
}

function updateRotation() {
    if (!selectedSpeakerId) return;
    
    const rotation = parseInt(document.getElementById('rotation').value);
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].rotation = rotation;
    }
}

function updateTilt() {
    if (!selectedSpeakerId) return;
    
    const tilt = parseInt(document.getElementById('tilt').value);
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].tilt = tilt;
    }
}

function updateMountType() {
    if (!selectedSpeakerId) return;
    
    const mountType = document.getElementById('mount-type').value;
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].mountType = mountType;
        
        // Update default values based on mount type
        if (mountType.includes('ceiling')) {
            placedSpeakers[speakerIndex].mountHeight = 3.0;
            document.getElementById('mount-height').value = '3.0 m';
            placedSpeakers[speakerIndex].tilt = 90;
            document.getElementById('tilt').value = '90°';
        } else if (mountType.includes('wall')) {
            placedSpeakers[speakerIndex].mountHeight = 2.0;
            document.getElementById('mount-height').value = '2.0 m';
        } else {
            placedSpeakers[speakerIndex].mountHeight = 1.2;
            document.getElementById('mount-height').value = '1.2 m';
            if (placedSpeakers[speakerIndex].tilt === 90) {
                placedSpeakers[speakerIndex].tilt = 0;
                document.getElementById('tilt').value = '0°';
            }
        }
        
        // Update speaker styling
        const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
        if (speakerEl) {
            speakerEl.className = `speaker speaker-mount-${mountType} selected`;
        }
        
        // Reposition if in side view
        if (currentView === 'side') {
            repositionSpeakersForView();
        }
    }
}

function updatePower() {
    if (!selectedSpeakerId) return;
    
    const power = parseInt(document.getElementById('power').value);
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].power = power;
    }
}

function updateTargetSpl() {
    const targetSpl = parseInt(document.getElementById('target-spl').value);
    console.log(`Target SPL updated to ${targetSpl} dB`);
}

function updateEarHeight() {
    const earHeight = parseFloat(document.getElementById('ear-height').value);
    console.log(`Audience height updated to ${earHeight} m`);
}

// === TOGGLE FUNCTIONS ===

function toggleCoverage() {
    coverageVisible = !coverageVisible;
    
    // Update checkbox
    const checkbox = document.getElementById('coverage-checkbox');
    checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    // Toggle visibility
    const overlay = document.getElementById('coverage-overlay');
    if (overlay) overlay.style.display = coverageVisible ? 'block' : 'none';
    
    // Toggle speaker coverage patterns
    for (let i = 1; i <= 3; i++) {
        const coverage = document.getElementById('coverage' + i);
        if (coverage) coverage.style.display = coverageVisible ? 'block' : 'none';
    }
    
    placedSpeakers.forEach(speaker => {
        const coverage = document.getElementById('coverage' + speaker.id);
        if (coverage) coverage.style.display = coverageVisible ? 'block' : 'none';
    });
    
    console.log(`Coverage visualization: ${coverageVisible ? 'ON' : 'OFF'}`);
}

function toggleSplValues() {
    splValuesVisible = !splValuesVisible;
    
    const checkbox = document.getElementById('spl-checkbox');
    checkbox.className = splValuesVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    console.log(`SPL values: ${splValuesVisible ? 'ON' : 'OFF'}`);
}

// === STATUS BAR AND UI UPDATES ===

function updateStatusBar() {
    const room = document.querySelector('.room');
    const length = parseFloat(room?.getAttribute('data-actual-length')) || 8;
    const width = parseFloat(room?.getAttribute('data-actual-width')) || 5;
    const height = parseFloat(room?.getAttribute('data-actual-height')) || 3.5;
    
    // Update status items
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length >= 4) {
        statusItems[0].textContent = `Room: ${length}m × ${width}m × ${height}m`;
        statusItems[1].textContent = `Speakers: ${placedSpeakers.length + 3}`; // +3 for demo speakers
        statusItems[2].textContent = `Average SPL: ${(85 + Math.random() * 5).toFixed(1)} dB`;
        statusItems[3].textContent = `View: ${currentView === 'top' ? 'Top' : 'Side'}`;
    }
}

// === FILE OPERATIONS ===

function saveLayout() {
    const room = document.querySelector('.room');
    const length = parseFloat(room?.getAttribute('data-actual-length')) || 8;
    const width = parseFloat(room?.getAttribute('data-actual-width')) || 5;
    const height = parseFloat(room?.getAttribute('data-actual-height')) || 3.5;
    
    const layoutData = {
        version: "2.0",
        room: { 
            length: length,
            width: width,
            height: height 
        },
        speakers: placedSpeakers.map(speaker => ({
            id: speaker.id,
            databaseId: speaker.databaseId,
            actualX: speaker.actualX,
            actualY: speaker.actualY,
            mountType: speaker.mountType,
            mountHeight: speaker.mountHeight,
            rotation: speaker.rotation,
            tilt: speaker.tilt,
            power: speaker.power
        })),
        settings: {
            targetSpl: document.getElementById('target-spl').value,
            audienceHeight: document.getElementById('ear-height').value,
            coverageVisible: coverageVisible,
            splValuesVisible: splValuesVisible,
            currentView: currentView
        },
        metadata: {
            appVersion: "AuraVisual Professional v2.0",
            totalSpeakers: placedSpeakers.length,
            totalPower: placedSpeakers.reduce((sum, speaker) => sum + (speaker.power || 0), 0),
            roomVolume: (length * width * height).toFixed(1),
            timestamp: new Date().toISOString(),
            exportedBy: "AuraVisual Professional AV Layout App"
        }
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `AuraVisual_Layout_${length}x${width}x${height}m_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    console.log(`Layout saved: ${layoutData.metadata.totalSpeakers} speakers, ${layoutData.metadata.totalPower}W total power`);
    alert(`Layout saved successfully!\nRoom: ${length}m × ${width}m × ${height}m\nSpeakers: ${layoutData.metadata.totalSpeakers}\nTotal Power: ${layoutData.metadata.totalPower}W`);
}
