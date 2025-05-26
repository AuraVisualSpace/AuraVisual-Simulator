// AuraVisual - Professional AV Speaker Layout Application
// Complete JavaScript with 3D Room Support and Drag Functionality

console.log('Loading AuraVisual Professional AV Layout App...');

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
            "mountTypes": ["stand", "flying", "wall"]
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
            "mountTypes": ["stand", "wall"]
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
            "mountTypes": ["stand", "wall"]
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
            "mountTypes": ["stand", "flying", "wall"]
        }
    ],
    "manufacturers": ["JBL", "QSC", "EV", "Yamaha", "Bose", "Martin Audio"],
    "types": [
        {"id": "point-source", "name": "Point Source"},
        {"id": "line-array", "name": "Line Array"},
        {"id": "ceiling", "name": "Ceiling"},
        {"id": "subwoofer", "name": "Subwoofer"}
    ],
    "mountTypes": [
        {"id": "stand", "name": "Floor Stand"},
        {"id": "flying", "name": "Flying/Rigged"},
        {"id": "wall", "name": "Wall Mount"},
        {"id": "ceiling", "name": "Ceiling Mount"}
    ]
};

// Global variables
let placedSpeakers = [];
let nextSpeakerId = 1000;
let selectedSpeakerId = null;
let selectedDatabaseSpeakerId = null;
let coverageVisible = true;
let splValuesVisible = false;
let currentView = 'top';
let currentTool = 'speaker';

// Drag functionality
let isDragging = false;
let dragSpeakerId = null;
let startMouseX = 0;
let startMouseY = 0;
let startSpeakerX = 0;
let startSpeakerY = 0;

// Initialize application
window.onload = function() {
    console.log('Initializing AuraVisual...');
    
    initializeSpeakerDatabase();
    initializeEventHandlers();
    
    setTimeout(() => {
        initializeRoomSize();
        selectSpeaker(1);
        selectSpeakerModel('jbl-srx835p');
    }, 200);
    
    console.log('AuraVisual loaded successfully!');
};

// Initialize speaker database
function initializeSpeakerDatabase() {
    const manufacturerSelect = document.getElementById('manufacturer-filter');
    speakerDatabase.manufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerSelect.appendChild(option);
    });
    
    const typeSelect = document.getElementById('type-filter');
    speakerDatabase.types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        typeSelect.appendChild(option);
    });
    
    const mountSelect = document.getElementById('mount-filter');
    speakerDatabase.mountTypes.forEach(mountType => {
        const option = document.createElement('option');
        option.value = mountType.id;
        option.textContent = mountType.name;
        mountSelect.appendChild(option);
    });
    
    renderSpeakerList(speakerDatabase.speakers);
}

// Initialize event handlers
function initializeEventHandlers() {
    const roomEditor = document.getElementById('room-editor');
    roomEditor.addEventListener('click', function(event) {
        if (event.target === this || event.target.className === 'room') {
            if (currentTool === 'speaker') {
                addSpeakerToRoom(event.clientX, event.clientY);
            }
        }
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Render speaker list
function renderSpeakerList(speakers) {
    const container = document.getElementById('speaker-list-container');
    container.innerHTML = '';
    
    speakers.forEach(speaker => {
        const speakerEl = document.createElement('div');
        speakerEl.className = 'speaker-item';
        speakerEl.onclick = () => selectSpeakerModel(speaker.id);
        
        let speakerIcon = '🔊';
        let manufacturerClass = speaker.manufacturer.toLowerCase();
        
        speakerEl.innerHTML = `
            <div class="speaker-icon ${manufacturerClass}">
                <div class="speaker-emoji">${speakerIcon}</div>
            </div>
            <div class="speaker-details">
                <div class="speaker-manufacturer">${speaker.manufacturer}</div>
                <div class="speaker-model">${speaker.model}</div>
                <div class="speaker-specs">${speaker.horizontalCoverage}° × ${speaker.verticalCoverage}°</div>
                <div class="speaker-specs">${speaker.maxSPL}dB • ${speaker.power}W</div>
            </div>
        `;
        
        if (speaker.id === selectedDatabaseSpeakerId) {
            speakerEl.classList.add('selected');
        }
        
        container.appendChild(speakerEl);
    });
}

// Filter speakers
function filterSpeakers() {
    const searchTerm = document.getElementById('speaker-search').value.toLowerCase();
    const manufacturer = document.getElementById('manufacturer-filter').value;
    
    const filteredSpeakers = speakerDatabase.speakers.filter(speaker => {
        const matchesSearch = 
            speaker.manufacturer.toLowerCase().includes(searchTerm) ||
            speaker.model.toLowerCase().includes(searchTerm);
        const matchesManufacturer = 
            manufacturer === '' || speaker.manufacturer === manufacturer;
        
        return matchesSearch && matchesManufacturer;
    });
    
    renderSpeakerList(filteredSpeakers);
}

// Get speaker by ID
function getSpeakerById(speakerId) {
    return speakerDatabase.speakers.find(speaker => speaker.id === speakerId);
}

// Select speaker model
function selectSpeakerModel(speakerId) {
    selectedDatabaseSpeakerId = speakerId;
    const speakerData = getSpeakerById(speakerId);
    
    document.querySelectorAll('.speaker-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    const speakerElements = document.querySelectorAll('.speaker-item');
    for (let i = 0; i < speakerElements.length; i++) {
        if (speakerElements[i].querySelector('.speaker-model').textContent === speakerData.model) {
            speakerElements[i].classList.add('selected');
            break;
        }
    }
    
    if (selectedSpeakerId !== null) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].databaseId = speakerId;
            updatePropertiesPanel(selectedSpeakerId);
        }
    }
}

// ROOM FUNCTIONS

// Initialize room
function initializeRoomSize() {
    document.getElementById('room-length').value = 8.0;
    document.getElementById('room-width').value = 5.0;
    document.getElementById('room-height').value = 3.5;
    updateRoomSize();
}

// Update room size
function updateRoomSize() {
    console.log('updateRoomSize called');
    
    const length = parseFloat(document.getElementById('room-length').value);
    const width = parseFloat(document.getElementById('room-width').value);
    const height = parseFloat(document.getElementById('room-height').value);
    
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
    
    let displayWidth, displayHeight, dimensionLabel;
    const baseScale = 50;
    const maxDisplayWidth = 600;
    const maxDisplayHeight = 400;
    
    if (currentView === 'top') {
        displayWidth = length * baseScale;
        displayHeight = width * baseScale;
        dimensionLabel = `${length}m × ${width}m (H: ${height}m)`;
    } else {
        displayWidth = length * baseScale;
        displayHeight = height * baseScale;
        dimensionLabel = `${length}m × ${height}m (W: ${width}m)`;
    }
    
    let scaleFactor = 1;
    if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
        const scaleX = maxDisplayWidth / displayWidth;
        const scaleY = maxDisplayHeight / displayHeight;
        scaleFactor = Math.min(scaleX, scaleY);
        displayWidth *= scaleFactor;
        displayHeight *= scaleFactor;
    }
    
    const room = document.querySelector('.room');
    const overlay = document.querySelector('.coverage-overlay');
    
    if (room) {
        room.style.width = displayWidth + 'px';
        room.style.height = displayHeight + 'px';
        
        room.setAttribute('data-actual-length', length);
        room.setAttribute('data-actual-width', width);
        room.setAttribute('data-actual-height', height);
        room.setAttribute('data-scale-factor', scaleFactor);
        
        const centerX = Math.max(100, (800 - displayWidth) / 2);
        const centerY = Math.max(80, (500 - displayHeight) / 2);
        
        room.style.left = centerX + 'px';
        room.style.top = centerY + 'px';
        
        if (overlay) {
            overlay.style.width = displayWidth + 'px';
            overlay.style.height = displayHeight + 'px';
            overlay.style.left = centerX + 'px';
            overlay.style.top = centerY + 'px';
        }
    }
    
    const roomLabel = document.querySelector('.room-label');
    if (roomLabel) {
        let labelText = `Room: ${dimensionLabel}`;
        if (scaleFactor < 1) {
            labelText += ` (${Math.round(scaleFactor * 100)}% scale)`;
        }
        roomLabel.textContent = labelText;
    }
    
    applyViewStyling();
    repositionSpeakersForView();
    updateStatusBar();
    
    console.log(`Room updated: ${length}m × ${width}m × ${height}m`);
}

// Switch view
function switchView(viewType) {
    currentView = viewType;
    
    document.getElementById('top-view-btn').classList.toggle('active', viewType === 'top');
    document.getElementById('side-view-btn').classList.toggle('active', viewType === 'side');
    
    const viewLabel = document.getElementById('room-view-label');
    viewLabel.textContent = viewType === 'top' ? 'Top View - Floor Plan' : 'Side View - Elevation';
    
    updateRoomSize();
    updateStatusBar();
}

// Apply view styling
function applyViewStyling() {
    const roomEditor = document.getElementById('room-editor');
    roomEditor.classList.remove('top-view', 'side-view');
    roomEditor.classList.add(currentView + '-view');
    
    if (currentView === 'side') {
        updateSpeakersForSideView();
    } else {
        updateSpeakersForTopView();
    }
}

// Update speakers for side view
function updateSpeakersForSideView() {
    placedSpeakers.forEach(speaker => {
        const speakerEl = document.getElementById('speaker' + speaker.id);
        if (speakerEl) {
            speakerEl.setAttribute('data-height', (speaker.mountHeight || 1.2).toFixed(1) + 'm');
        }
    });
    
    const demoSpeakers = ['speaker1', 'speaker2', 'speaker3'];
    demoSpeakers.forEach(speakerId => {
        const speakerEl = document.getElementById(speakerId);
        if (speakerEl) {
            speakerEl.setAttribute('data-height', '1.2m');
        }
    });
}

// Update speakers for top view
function updateSpeakersForTopView() {
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.removeAttribute('data-height');
    });
}

// Reposition speakers for view
function repositionSpeakersForView() {
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    const roomWidth = parseFloat(room.style.width) || 400;
    const roomHeight = parseFloat(room.style.height) || 280;
    
    placedSpeakers.forEach(speaker => {
        const speakerEl = document.getElementById('speaker' + speaker.id);
        const coverageEl = document.getElementById('coverage' + speaker.id);
        
        if (speakerEl && coverageEl) {
            let newX, newY;
            
            if (currentView === 'top') {
                const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
                const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
                
                const xPercent = (speaker.actualX || actualLength/2) / actualLength;
                const yPercent = (speaker.actualY || actualWidth/2) / actualWidth;
                
                newX = roomLeft + (xPercent * roomWidth);
                newY = roomTop + (yPercent * roomHeight);
                
            } else {
                const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
                const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
                
                const xPercent = (speaker.actualX || actualLength/2) / actualLength;
                const heightRatio = 1 - (speaker.mountHeight || 1.2) / actualHeight;
                
                newX = roomLeft + (xPercent * roomWidth);
                newY = roomTop + (heightRatio * roomHeight);
            }
            
            speakerEl.style.left = newX + 'px';
            speakerEl.style.top = newY + 'px';
            coverageEl.style.left = newX + 'px';
            coverageEl.style.top = newY + 'px';
            
            speaker.x = newX;
            speaker.y = newY;
        }
    });
    
    const demoSpeakers = ['speaker1', 'speaker2', 'speaker3'];
    demoSpeakers.forEach((speakerId, index) => {
        const speakerEl = document.getElementById(speakerId);
        const coverageEl = document.getElementById('coverage' + (index + 1));
        
        if (speakerEl && coverageEl) {
            let newX, newY;
            
            if (currentView === 'top') {
                const spacing = roomWidth / (demoSpeakers.length + 1);
                newX = roomLeft + spacing * (index + 1);
                newY = roomTop + (roomHeight * 0.3);
            } else {
                const spacing = roomWidth / (demoSpeakers.length + 1);
                newX = roomLeft + spacing * (index + 1);
                newY = roomTop + (roomHeight * 0.65);
            }
            
            speakerEl.style.left = newX + 'px';
            speakerEl.style.top = newY + 'px';
            coverageEl.style.left = newX + 'px';
            coverageEl.style.top = newY + 'px';
        }
    });
}

// TOOL FUNCTIONS

// Select tool
function selectTool(tool) {
    currentTool = tool;
    
    document.getElementById('speaker-tool').classList.toggle('active', tool === 'speaker');
    document.getElementById('move-tool').classList.toggle('active', tool === 'move');
    
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

// Enable speaker dragging
function enableSpeakerDragging() {
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.style.cursor = 'grab';
        // Remove any existing listeners first
        speaker.removeEventListener('mousedown', handleSpeakerMouseDown);
        // Add new listener
        speaker.addEventListener('mousedown', handleSpeakerMouseDown);
    });
    console.log('Drag enabled for', allSpeakers.length, 'speakers');
}

// Disable speaker dragging  
function disableSpeakerDragging() {
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.style.cursor = 'pointer';
        speaker.removeEventListener('mousedown', handleSpeakerMouseDown);
    });
        
    // Clean up any ongoing drag
    isDragging = false;
    dragSpeakerId = null;
    console.log('Drag disabled');
}


// Handle speaker mouse down
function handleSpeakerMouseDown(event) {
    if (currentTool !== 'move') return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Get speaker info
    const speakerId = event.target.id.replace('speaker', '');
    dragSpeakerId = parseInt(speakerId);
    
    // Select the speaker
    selectSpeaker(dragSpeakerId);
    
    // Record starting positions
    startMouseX = event.clientX;
    startMouseY = event.clientY;
    startSpeakerX = parseFloat(event.target.style.left) || 0;
    startSpeakerY = parseFloat(event.target.style.top) || 0;
    
    // Start dragging
    isDragging = true;
    event.target.style.cursor = 'grabbing';
    event.target.style.zIndex = '1000';
    
    console.log(`Drag start: Speaker ${dragSpeakerId} at ${startSpeakerX}, ${startSpeakerY}`);
}

// Handle mouse move (FIXED VERSION)
function handleMouseMove(event) {
    if (!isDragging || !dragSpeakerId) return;
    
    event.preventDefault();
    
    // Calculate how far the mouse has moved
    const deltaX = event.clientX - startMouseX;
    const deltaY = event.clientY - startMouseY;
    
    // Calculate new speaker position
    const newX = startSpeakerX + deltaX;
    const newY = startSpeakerY + deltaY;
    
    // Get room boundaries
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    const roomWidth = parseFloat(room.style.width) || 400;
    const roomHeight = parseFloat(room.style.height) || 280;
    
    // Constrain to room (with 15px padding for speaker size)
    const minX = roomLeft + 15;
    const maxX = roomLeft + roomWidth - 15;
    const minY = roomTop + 15;
    const maxY = roomTop + roomHeight - 15;
    
    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));
    
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
    
    // Update speaker data in memory
    const speakerIndex = placedSpeakers.findIndex(s => s.id === dragSpeakerId);
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].x = constrainedX;
        placedSpeakers[speakerIndex].y = constrainedY;
        
        // Update actual position in meters
        updateSpeakerActualPosition(speakerIndex, constrainedX, constrainedY);
        
        // Update properties panel if this speaker is selected
        if (selectedSpeakerId === dragSpeakerId) {
            updatePropertiesPanel(dragSpeakerId);
        }
    }
}
// Handle mouse up
function handleMouseUp(event) {
    if (!isDragging || !dragSpeakerId) return;
    
    // End dragging
    isDragging = false;
    
    const speakerEl = document.getElementById('speaker' + dragSpeakerId);
    if (speakerEl) {
        speakerEl.style.cursor = 'grab';
        speakerEl.style.zIndex = '';
    }
    
    console.log(`Drag end: Speaker ${dragSpeakerId}`);
    
    // Clear drag state
    dragSpeakerId = null;
    startMouseX = 0;
    startMouseY = 0;
    startSpeakerX = 0;
    startSpeakerY = 0;
}


// Update speaker actual position
function updateSpeakerActualPosition(speakerIndex, pixelX, pixelY) {
    const room = document.querySelector('.room');
    if (!room || speakerIndex < 0 || speakerIndex >= placedSpeakers.length) return;
    
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    const roomWidth = parseFloat(room.style.width) || 400;
    const roomHeight = parseFloat(room.style.height) || 280;
    
    if (currentView === 'top') {
        const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
        const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
        
        const xPercent = (pixelX - roomLeft) / roomWidth;
        const yPercent = (pixelY - roomTop) / roomHeight;
        
        placedSpeakers[speakerIndex].actualX = Math.max(0, Math.min(actualLength, xPercent * actualLength));
        placedSpeakers[speakerIndex].actualY = Math.max(0, Math.min(actualWidth, yPercent * actualWidth));
        
    } else {
        const actualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
        const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
        
        const xPercent = (pixelX - roomLeft) / roomWidth;
        const heightRatio = 1 - (pixelY - roomTop) / roomHeight;
        
        placedSpeakers[speakerIndex].actualX = Math.max(0, Math.min(actualLength, xPercent * actualLength));
        placedSpeakers[speakerIndex].mountHeight = Math.max(0.1, Math.min(actualHeight, heightRatio * actualHeight));
    }
}

// SPEAKER FUNCTIONS

// Add speaker to room
function addSpeakerToRoom(clientX, clientY) {
    if (!selectedDatabaseSpeakerId) {
        alert('Please select a speaker model first');
        return;
    }
    
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomRect = room.getBoundingClientRect();
    
    if (clientX < roomRect.left || clientX > roomRect.right || clientY < roomRect.top || clientY > roomRect.bottom) {
        return;
    }
    
    const speakerData = getSpeakerById(selectedDatabaseSpeakerId);
    const defaultMountType = speakerData.mountTypes[0];
    
    const x = clientX - roomRect.left + parseFloat(room.style.left);
    const y = clientY - roomRect.top + parseFloat(room.style.top);
    
    const newSpeaker = {
        id: nextSpeakerId++,
        databaseId: selectedDatabaseSpeakerId,
        x: x,
        y: y,
        actualX: 4.0,
        actualY: 2.5,
        mountType: defaultMountType,
        mountHeight: defaultMountType.includes('ceiling') ? 3.0 : 1.2,
        rotation: 0,
        tilt: defaultMountType.includes('ceiling') ? 90 : 0,
        power: Math.round(speakerData.power / 10)
    };
    
    updateSpeakerActualPosition(placedSpeakers.length, x, y);
    
    placedSpeakers.push(newSpeaker);
    createSpeakerElement(newSpeaker);
    selectSpeaker(newSpeaker.id);
    
    updateStatusBar();
}

// Create speaker element
function createSpeakerElement(speaker) {
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
    
    const coverageEl = document.createElement('div');
    coverageEl.className = 'speaker-coverage';
    coverageEl.id = 'coverage' + speaker.id;
    coverageEl.style.left = speaker.x + 'px';
    coverageEl.style.top = speaker.y + 'px';
    coverageEl.style.display = coverageVisible ? 'block' : 'none';
    
    roomEditor.appendChild(speakerEl);
    roomEditor.appendChild(coverageEl);
}

// Select speaker
function selectSpeaker(id) {
    if (selectedSpeakerId) {
        const prevSpeaker = document.getElementById('speaker' + selectedSpeakerId);
        if (prevSpeaker) {
            prevSpeaker.classList.remove('selected');
        }
    }
    
    selectedSpeakerId = id;
    const speakerEl = document.getElementById('speaker' + id);
    if (speakerEl) {
        speakerEl.classList.add('selected');
    }
    
    updatePropertiesPanel(id);
}

// Update properties panel
function updatePropertiesPanel(speakerId) {
    const speaker = placedSpeakers.find(s => s.id === speakerId);
    
    if (!speaker) {
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
    
    document.getElementById('model-value').textContent = `${speakerData.manufacturer} ${speakerData.model}`;
    document.getElementById('x-position').value = (speaker.actualX || 4.0).toFixed(1) + ' m';
    document.getElementById('y-position').value = (speaker.actualY || 2.5).toFixed(1) + ' m';
    document.getElementById('mount-height').value = (speaker.mountHeight || 1.2).toFixed(1) + ' m';
    document.getElementById('rotation').value = speaker.rotation + '°';
    document.getElementById('tilt').value = speaker.tilt + '°';
    document.getElementById('power').value = speaker.power + 'W';
    
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
        if (confirm('Delete selected speaker?')) {
            const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
            const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
            
            if (speakerEl) speakerEl.remove();
            if (coverageEl) coverageEl.remove();
            
            placedSpeakers.splice(speakerIndex, 1);
            selectedSpeakerId = null;
            document.getElementById('model-value').textContent = 'Select a speaker';
            
            updateStatusBar();
        }
    } else {
        alert('Cannot delete demo speakers');
    }
}

// PROPERTY UPDATE FUNCTIONS

function updatePosition() {
    if (!selectedSpeakerId || !placedSpeakers.find(s => s.id === selectedSpeakerId)) return;
    
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    if (speakerIndex === -1) return;
    
    const xValue = parseFloat(document.getElementById('x-position').value);
    const yValue = parseFloat(document.getElementById('y-position').value);
    
    placedSpeakers[speakerIndex].actualX = xValue;
    placedSpeakers[speakerIndex].actualY = yValue;
    
    repositionSpeakersForView();
}

function updateMountHeight() {
    if (!selectedSpeakerId) return;
    
    const mountHeight = parseFloat(document.getElementById('mount-height').value);
    const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
    
    if (speakerIndex !== -1) {
        placedSpeakers[speakerIndex].mountHeight = mountHeight;
        
        if (currentView === 'side') {
            repositionSpeakersForView();
        }
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
        
        const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
        if (speakerEl) {
            speakerEl.className = `speaker speaker-mount-${mountType} selected`;
        }
        
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

// TOGGLE FUNCTIONS

function toggleCoverage() {
    coverageVisible = !coverageVisible;
    
    const checkbox = document.getElementById('coverage-checkbox');
    checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    const overlay = document.getElementById('coverage-overlay');
    if (overlay) overlay.style.display = coverageVisible ? 'block' : 'none';
    
    for (let i = 1; i <= 3; i++) {
        const coverage = document.getElementById('coverage' + i);
        if (coverage) coverage.style.display = coverageVisible ? 'block' : 'none';
    }
    
    placedSpeakers.forEach(speaker => {
        const coverage = document.getElementById('coverage' + speaker.id);
        if (coverage) coverage.style.display = coverageVisible ? 'block' : 'none';
    });
}

function toggleSplValues() {
    splValuesVisible = !splValuesVisible;
    
    const checkbox = document.getElementById('spl-checkbox');
    checkbox.className = splValuesVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    console.log(`SPL values: ${splValuesVisible ? 'ON' : 'OFF'}`);
}

// STATUS BAR UPDATE

function updateStatusBar() {
    const room = document.querySelector('.room');
    const length = parseFloat(room?.getAttribute('data-actual-length')) || 8;
    const width = parseFloat(room?.getAttribute('data-actual-width')) || 5;
    const height = parseFloat(room?.getAttribute('data-actual-height')) || 3.5;
    
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length >= 4) {
        statusItems[0].textContent = `Room: ${length}m × ${width}m × ${height}m`;
        statusItems[1].textContent = `Speakers: ${placedSpeakers.length + 3}`;
        statusItems[2].textContent = `Average SPL: ${(85 + Math.random() * 5).toFixed(1)} dB`;
        statusItems[3].textContent = `View: ${currentView === 'top' ? 'Top' : 'Side'}`;
    }
}

// FILE OPERATIONS

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

function loadLayout() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const layoutData = JSON.parse(e.target.result);
                
                if (!layoutData.version || !layoutData.room) {
                    throw new Error('Invalid layout file format');
                }
                
                placedSpeakers.forEach(speaker => {
                    const speakerEl = document.getElementById('speaker' + speaker.id);
                    const coverageEl = document.getElementById('coverage' + speaker.id);
                    if (speakerEl) speakerEl.remove();
                    if (coverageEl) coverageEl.remove();
                });
                placedSpeakers = [];
                
                const roomData = layoutData.room;
                document.getElementById('room-length').value = roomData.length || 8.0;
                document.getElementById('room-width').value = roomData.width || 5.0;
                document.getElementById('room-height').value = roomData.height || 3.5;
                updateRoomSize();
                
                let maxId = 999;
                let loadedCount = 0;
                
                if (layoutData.speakers && Array.isArray(layoutData.speakers)) {
                    layoutData.speakers.forEach((speakerData, index) => {
                        try {
                            const speaker = {
                                id: speakerData.id || (1000 + index),
                                databaseId: speakerData.databaseId || 'jbl-srx835p',
                                x: 0,
                                y: 0,
                                actualX: Math.max(0, speakerData.actualX || 4.0),
                                actualY: Math.max(0, speakerData.actualY || 2.5),
                                mountType: speakerData.mountType || 'stand',
                                mountHeight: Math.max(0.1, speakerData.mountHeight || 1.2),
                                rotation: speakerData.rotation || 0,
                                tilt: speakerData.tilt || 0,
                                power: Math.max(1, speakerData.power || 100)
                            };
                            
                            placedSpeakers.push(speaker);
                            maxId = Math.max(maxId, speaker.id);
                            loadedCount++;
                            
                        } catch (speakerError) {
                            console.error(`Error loading speaker ${index + 1}:`, speakerError);
                        }
                    });
                }
                
                nextSpeakerId = maxId + 1;
                
                placedSpeakers.forEach(speaker => {
                    createSpeakerElement(speaker);
                });
                
                setTimeout(() => {
                    repositionSpeakersForView();
                }, 100);
                
                if (layoutData.settings) {
                    try {
                        document.getElementById('target-spl').value = layoutData.settings.targetSpl || '85 dB';
                        document.getElementById('ear-height').value = layoutData.settings.audienceHeight || '1.2 m';
                        
                        if (layoutData.settings.coverageVisible !== undefined) {
                            coverageVisible = layoutData.settings.coverageVisible;
                            const checkbox = document.getElementById('coverage-checkbox');
                            checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
                        }
                        
                        if (layoutData.settings.currentView && layoutData.settings.currentView !== currentView) {
                            switchView(layoutData.settings.currentView);
                        }
                        
                    } catch (settingsError) {
                        console.warn('Error loading some settings:', settingsError);
                    }
                }
                
                updateStatusBar();
                
                const roomInfo = `${roomData.length || 8}m × ${roomData.width || 5}m × ${roomData.height || 3.5}m`;
                const totalPower = placedSpeakers.reduce((sum, speaker) => sum + (speaker.power || 0), 0);
                
                alert(`Layout loaded successfully!\n\nRoom: ${roomInfo}\nSpeakers: ${loadedCount} loaded\nTotal Power: ${totalPower}W`);
                
            } catch (error) {
                console.error('Layout loading error:', error);
                alert(`Error loading layout file:\n\n${error.message}\n\nPlease check that the file is valid and try again.`);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// PREMIUM FUNCTIONS

function showPremiumDialog() {
    document.getElementById('premium-overlay').style.display = 'flex';
}

function closePremiumDialog() {
    document.getElementById('premium-overlay').style.display = 'none';
}

function upgradeToPremium() {
    closePremiumDialog();
    alert('Thank you for your interest in AuraVisual Pro!\n\nVisit www.auravisual.com for full professional features');
}

console.log('AuraVisual Professional AV Layout App - Fully Loaded!');
console.log('Features: 3D Room Visualization, Professional Speaker Database, Drag & Drop, Save/Load');
console.log('Room Capacity: 2-30m Length/Width, 2-12m Height');
console.log('Views: Top (Floor Plan) | Side (Elevation)');
console.log('Ready for professional AV system design!');
