// Speaker database with sample data
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

// Global variables for app state
let placedSpeakers = [];
let nextSpeakerId = 1;
let selectedSpeakerId = null;
let selectedDatabaseSpeakerId = null;
let coverageVisible = true;
let splValuesVisible = false;
let currentView = 'top';
let currentTool = 'speaker';

// Initialize when page loads
window.onload = function() {
    initializeSpeakerDatabase();
    
    // Set up room editor click handler for adding speakers
    document.getElementById('room-editor').addEventListener('click', function(event) {
        if (event.target === this || event.target.className === 'room' || event.target.className === 'room-label') {
            if (currentTool === 'speaker') {
                addSpeakerToRoom(event.clientX, event.clientY);
            }
        }
    });
    
    // Initialize room size first
    setTimeout(() => {
        initializeRoomSize();
    }, 100);
    
    // Initialize with first speaker selected and a default speaker model
    setTimeout(() => {
        selectSpeaker(1);
        selectSpeakerModel('jbl-srx835p');
    }, 200);
    
    // Add event listeners for real-time room size updates
    setTimeout(() => {
        const widthInput = document.getElementById('room-width');
        const heightInput = document.getElementById('room-height');
        
        if (widthInput && heightInput) {
            let roomSizeTimeout;
            
            widthInput.addEventListener('input', () => {
                clearTimeout(roomSizeTimeout);
                roomSizeTimeout = setTimeout(updateRoomSize, 300);
            });
            
            heightInput.addEventListener('input', () => {
                clearTimeout(roomSizeTimeout);
                roomSizeTimeout = setTimeout(updateRoomSize, 300);
            });
        }
    }, 300);
};

// Initialize the speaker database
function initializeSpeakerDatabase() {
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
    
    // Initial rendering of speakers
    renderSpeakerList(speakerDatabase.speakers);
}

// Render the speaker list with working icons
function renderSpeakerList(speakers) {
    const container = document.getElementById('speaker-list-container');
    container.innerHTML = ''; // Clear existing content
    
    if (speakers.length === 0) {
        container.innerHTML = '<div class="no-results">No speakers match your criteria</div>';
        return;
    }
    
    speakers.forEach(speaker => {
        const speakerEl = document.createElement('div');
        speakerEl.className = 'speaker-item';
        speakerEl.onclick = () => selectSpeakerModel(speaker.id);
        
        // Create simple speaker icon based on type and manufacturer
        let speakerIcon = '🔊'; // Default speaker emoji
        let iconColor = '#4a6fba';
        
        // Different icons for different types
        if (speaker.type === 'ceiling') {
            speakerIcon = '⚪';
            iconColor = '#6fa8dc';
        } else if (speaker.type === 'subwoofer') {
            speakerIcon = '⬛';
            iconColor = '#ff6b6b';
        } else if (speaker.type === 'line-array') {
            speakerIcon = '▬';
            iconColor = '#4ecdc4';
        } else if (speaker.type === 'point-source') {
            speakerIcon = '🔊';
            iconColor = '#4a6fba';
        }
        
        // Add manufacturer-specific styling
        let manufacturerClass = '';
        switch(speaker.manufacturer.toLowerCase()) {
            case 'jbl':
                manufacturerClass = 'jbl';
                break;
            case 'qsc':
                manufacturerClass = 'qsc';
                break;
            case 'ev':
                manufacturerClass = 'ev';
                break;
            case 'yamaha':
                manufacturerClass = 'yamaha';
                break;
            case 'bose':
                manufacturerClass = 'bose';
                break;
            case 'martin audio':
                manufacturerClass = 'martin';
                break;
            case 'danley':
                manufacturerClass = 'danley';
                break;
            case 'meyer sound':
                manufacturerClass = 'meyer';
                break;
        }
        
        // Determine primary mount type for indicator
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
        
        // Highlight if this is the selected model
        if (speaker.id === selectedDatabaseSpeakerId) {
            speakerEl.classList.add('selected');
        }
        
        container.appendChild(speakerEl);
    });
}

// Filter speakers based on search input and dropdown selections
function filterSpeakers() {
    const searchTerm = document.getElementById('speaker-search').value.toLowerCase();
    const manufacturer = document.getElementById('manufacturer-filter').value;
    const type = document.getElementById('type-filter').value;
    const mountType = document.getElementById('mount-filter').value;
    
    // Apply filters
    const filteredSpeakers = speakerDatabase.speakers.filter(speaker => {
        // Search term filter
        const matchesSearch = 
            speaker.manufacturer.toLowerCase().includes(searchTerm) ||
            speaker.model.toLowerCase().includes(searchTerm);
        
        // Manufacturer filter
        const matchesManufacturer = 
            manufacturer === '' || speaker.manufacturer === manufacturer;
        
        // Type filter
        const matchesType = 
            type === '' || speaker.type === type;
        
        // Mount type filter
        const matchesMountType = 
            mountType === '' || speaker.mountTypes.includes(mountType);
        
        return matchesSearch && matchesManufacturer && matchesType && matchesMountType;
    });
    
    renderSpeakerList(filteredSpeakers);
}

// Function to find a speaker by ID in the database
function getSpeakerById(speakerId) {
    return speakerDatabase.speakers.find(speaker => speaker.id === speakerId);
}

// Select a speaker model from the database
function selectSpeakerModel(speakerId) {
    selectedDatabaseSpeakerId = speakerId;
    
    // Get speaker data from database
    const speakerData = getSpeakerById(speakerId);
    
    // Highlight the selected speaker in the list
    document.querySelectorAll('.speaker-item').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Find and highlight the clicked element
    const speakerElements = document.querySelectorAll('.speaker-item');
    for (let i = 0; i < speakerElements.length; i++) {
        if (speakerElements[i].querySelector('.speaker-model').textContent === speakerData.model) {
            speakerElements[i].classList.add('selected');
            break;
        }
    }
    
    // If a speaker is currently selected in the room, update its model
    if (selectedSpeakerId !== null) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].databaseId = speakerId;
            updatePropertiesPanel(selectedSpeakerId);
        }
    }
}

// Select a tool
function selectTool(tool) {
    currentTool = tool;
    
    // Update tool button styling
    document.getElementById('speaker-tool').classList.toggle('active', tool === 'speaker');
    document.getElementById('move-tool').classList.toggle('active', tool === 'move');
    
    // Update cursor on room editor
    const roomEditor = document.getElementById('room-editor');
    roomEditor.style.cursor = tool === 'speaker' ? 'crosshair' : 'move';
}

// Switch between top and side views
function switchView(viewType) {
    currentView = viewType;
    
    // Update button states
    document.getElementById('top-view-btn').classList.toggle('active', viewType === 'top');
    document.getElementById('side-view-btn').classList.toggle('active', viewType === 'side');
    
    // Update view label
    document.getElementById('room-view-label').textContent = viewType === 'top' ? 'Top View' : 'Side View';
}

// ROOM SIZING FUNCTIONS

// Initialize room size when page loads
function initializeRoomSize() {
    // Set default room size
    document.getElementById('room-width').value = 5.0;
    document.getElementById('room-height').value = 3.5;
    
    // Apply the room size
    updateRoomSize();
}

// Update room size based on user input (width up to 30m, height up to 12m)
function updateRoomSize() {
    const width = parseFloat(document.getElementById('room-width').value);
    const height = parseFloat(document.getElementById('room-height').value);
    
    // Validate input
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
    
    // Convert meters to pixels for display
    const baseScale = 60; // 1 meter = 60 pixels (base scale)
    const maxDisplayWidth = 600; // Maximum room display width
    const maxDisplayHeight = 400; // Maximum room display height
    
    // Calculate initial display size
    let displayWidth = width * baseScale;
    let displayHeight = height * baseScale;
    
    // Apply scaling if room is too large for display area
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
        
        // Store actual dimensions for calculations
        room.setAttribute('data-actual-width', width);
        room.setAttribute('data-actual-height', height);
        room.setAttribute('data-scale-factor', scaleFactor);
        room.setAttribute('data-display-width', displayWidth);
        room.setAttribute('data-display-height', displayHeight);
        
        // Center the room in the editor
        const roomEditor = document.getElementById('room-editor');
        const editorRect = roomEditor.getBoundingClientRect();
        
        // Calculate center position
        const centerX = Math.max(100, (800 - displayWidth) / 2); // Approximate editor width
        const centerY = Math.max(80, (500 - displayHeight) / 2); // Approximate editor height
        
        room.style.left = centerX + 'px';
        room.style.top = centerY + 'px';
        
        // Update overlay to match room position and size
        if (overlay) {
            overlay.style.width = displayWidth + 'px';
            overlay.style.height = displayHeight + 'px';
            overlay.style.left = centerX + 'px';
            overlay.style.top = centerY + 'px';
        }
    }
    
    // Update room label
    const roomLabel = document.querySelector('.room-label');
    if (roomLabel) {
        let labelText = `Room: ${width}m × ${height}m`;
        if (scaleFactor < 1) {
            labelText += ` (${Math.round(scaleFactor * 100)}% scale)`;
        }
        roomLabel.textContent = labelText;
    }
    
    // Update status bar
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length > 0) {
        statusItems[0].textContent = `Room size: ${width}m × ${height}m`;
    }
    
    // Reposition existing speakers proportionally
    repositionExistingSpeakers();
    
    console.log(`Room updated: ${width}m × ${height}m | Display: ${Math.round(displayWidth)}×${Math.round(displayHeight)}px | Scale: ${Math.round(scaleFactor * 100)}%`);
}

// Reposition existing speakers when room size changes
function repositionExistingSpeakers() {
    const room = document.querySelector('.room');
    if (!room) return;
    
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    const roomWidth = parseFloat(room.style.width) || 400;
    const roomHeight = parseFloat(room.style.height) || 280;
    
    // Update positioned speakers from placedSpeakers array
    placedSpeakers.forEach(speaker => {
        const speakerEl = document.getElementById('speaker' + speaker.id);
        const coverageEl = document.getElementById('coverage' + speaker.id);
        
        if (speakerEl && coverageEl) {
            // Convert speaker's stored meter position to new pixel position
            const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
            const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
            
            // Calculate speaker position as percentage of room
            const xPercent = (speaker.actualX || 2.5) / actualWidth;
            const yPercent = (speaker.actualY || 1.75) / actualHeight;
            
            // Calculate new pixel positions
            const newX = roomLeft + (xPercent * roomWidth);
            const newY = roomTop + (yPercent * roomHeight);
            
            // Update speaker position
            speakerEl.style.left = newX + 'px';
            speakerEl.style.top = newY + 'px';
            coverageEl.style.left = newX + 'px';
            coverageEl.style.top = newY + 'px';
            
            // Update speaker's pixel position for consistency
            speaker.x = newX;
            speaker.y = newY;
        }
    });
    
    // Update demo speakers (the static ones)
    const demoSpeakers = ['speaker1', 'speaker2', 'speaker3'];
    demoSpeakers.forEach((speakerId, index) => {
        const speakerEl = document.getElementById(speakerId);
        const coverageEl = document.getElementById('coverage' + (index + 1));
        
        if (speakerEl && coverageEl) {
            // Position demo speakers evenly across the room
            const spacing = roomWidth / (demoSpeakers.length + 1);
            const newX = roomLeft + spacing * (index + 1);
            const newY = roomTop + (roomHeight * 0.3); // 30% from top
            
            speakerEl.style.left = newX + 'px';
            speakerEl.style.top = newY + 'px';
            coverageEl.style.left = newX + 'px';
            coverageEl.style.top = newY + 'px';
        }
    });
}

// Convert pixel coordinates to meters for display
function pixelsToMeters(pixels, isWidth = true) {
    const room = document.querySelector('.room');
    if (!room) return 0;
    
    const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
    const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
    const displayWidth = parseFloat(room.getAttribute('data-display-width')) || 400;
    const displayHeight = parseFloat(room.getAttribute('data-display-height')) || 280;
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    
    if (isWidth) {
        const relativeX = pixels - roomLeft;
        return Math.max(0, Math.min(actualWidth, (relativeX / displayWidth * actualWidth))).toFixed(2);
    } else {
        const relativeY = pixels - roomTop;
        return Math.max(0, Math.min(actualHeight, (relativeY / displayHeight * actualHeight))).toFixed(2);
    }
}

// Convert meters to pixel coordinates
function metersToPixels(meters, isWidth = true) {
    const room = document.querySelector('.room');
    if (!room) return 0;
    
    const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
    const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
    const displayWidth = parseFloat(room.getAttribute('data-display-width')) || 400;
    const displayHeight = parseFloat(room.getAttribute('data-display-height')) || 280;
    const roomLeft = parseFloat(room.style.left) || 100;
    const roomTop = parseFloat(room.style.top) || 80;
    
    if (isWidth) {
        return roomLeft + (meters / actualWidth * displayWidth);
    } else {
        return roomTop + (meters / actualHeight * displayHeight);
    }
}

// SPEAKER PLACEMENT AND MANAGEMENT

// Enhanced add speaker function that works with dynamic room sizing
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
        return; // Click was outside room
    }
    
    const speakerData = getSpeakerById(selectedDatabaseSpeakerId);
    const defaultMountType = speakerData.mountTypes[0];
    
    // Convert click position to room-relative coordinates
    const x = clientX - roomRect.left + parseFloat(room.style.left);
    const y = clientY - roomRect.top + parseFloat(room.style.top);
    
    // Convert click position to meters
    const actualX = parseFloat(pixelsToMeters(x, true));
    const actualY = parseFloat(pixelsToMeters(y, false));
    
    // Create new speaker object
    const newSpeaker = {
        id: nextSpeakerId++,
        databaseId: selectedDatabaseSpeakerId,
        x: x, // Pixel position for display
        y: y, // Pixel position for display
        actualX: actualX, // Actual position in meters
        actualY: actualY, // Actual position in meters
        mountType: defaultMountType,
        mountHeight: defaultMountType === 'ceiling' || defaultMountType === 'in-ceiling' ? 3.0 : 1.2, // In meters
        rotation: 0,
        tilt: defaultMountType === 'ceiling' || defaultMountType === 'in-ceiling' ? 90 : 0,
        power: Math.round(speakerData.power / 10)
    };
    
    placedSpeakers.push(newSpeaker);
    createSpeakerElement(newSpeaker);
    selectSpeaker(newSpeaker.id);
    
    // Update speaker count
    document.getElementById('speaker-count').textContent = `Speakers: ${placedSpeakers.length}`;
}

// Create a speaker element in the DOM
function createSpeakerElement(speaker) {
    const roomEditor = document.getElementById('room-editor');
    
    // Create speaker element
    const speakerEl = document.createElement('div');
    speakerEl.className = `speaker speaker-mount-${speaker.mountType}`;
    speakerEl.id = 'speaker' + speaker.id;
    speakerEl.onclick = (e) => {
        e.stopPropagation();
        selectSpeaker(speaker.id);
    };
    speakerEl.style.left = speaker.x + 'px';
    speakerEl.style.top = speaker.y + 'px';
    
    // Create coverage element
    const coverageEl = document.createElement('div');
    coverageEl.className = 'speaker-coverage';
    coverageEl.id = 'coverage' + speaker.id;
    coverageEl.style.left = speaker.x + 'px';
    coverageEl.style.top = speaker.y + 'px';
    coverageEl.style.display = coverageVisible ? 'block' : 'none';
    
    // Add elements to the room editor
    roomEditor.appendChild(speakerEl);
    roomEditor.appendChild(coverageEl);
}

// Select a speaker when clicked
function selectSpeaker(id) {
    // Deselect previously selected speaker
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
}

// Update properties panel when a speaker is selected (with meters)
function updatePropertiesPanel(speakerId) {
    const speaker = placedSpeakers.find(s => s.id === speakerId);
    if (!speaker) {
        // Handle static speakers for demo
        const speakerData = getSpeakerById(selectedDatabaseSpeakerId || 'jbl-srx835p');
        document.getElementById('model-value').textContent = speakerData ? `${speakerData.manufacturer} ${speakerData.model}` : 'Demo Speaker';
        
        // For demo speakers, show approximate positions in meters
        document.getElementById('x-position').value = '3.0 m';
        document.getElementById('y-position').value = '1.2 m';
        document.getElementById('rotation').value = '0°';
        document.getElementById('tilt').value = '0°';
        document.getElementById('power').value = '100W';
        document.getElementById('mount-height').value = '1.2 m';
        return;
    }
    
    const speakerData = getSpeakerById(speaker.databaseId);
    
    // Convert pixel positions to meters
    const xMeters = speaker.actualX || pixelsToMeters(speaker.x, true);
    const yMeters = speaker.actualY || pixelsToMeters(speaker.y, false);
    
    // Update values in the properties panel
    document.getElementById('model-value').textContent = `${speakerData.manufacturer} ${speakerData.model}`;
    document.getElementById('x-position').value = parseFloat(xMeters).toFixed(1) + ' m';
    document.getElementById('y-position').value = parseFloat(yMeters).toFixed(1) + ' m';
    document.getElementById('rotation').value = speaker.rotation + '°';
    document.getElementById('tilt').value = speaker.tilt + '°';
    document.getElementById('power').value = speaker.power + 'W';
    document.getElementById('mount-height').value = (speaker.mountHeight).toFixed(1) + ' m';
    
    // Update mount type dropdown
    const mountTypeSelect = document.getElementById('mount-type');
    mountTypeSelect.innerHTML = ''; // Clear existing options
    
    // Only show mount types that are valid for this speaker
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

// TOGGLE FUNCTIONS

// Toggle coverage visualization
function toggleCoverage() {
    coverageVisible = !coverageVisible;
    
    // Update checkbox appearance
    const checkbox = document.getElementById('coverage-checkbox');
    checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    // Show/hide coverage visualization
    const overlay = document.getElementById('coverage-overlay');
    overlay.style.display = coverageVisible ? 'block' : 'none';
    
    // Show/hide individual speaker coverage patterns
    for (let i = 1; i <= 3; i++) {
        const coverage = document.getElementById('coverage' + i);
        if (coverage) {
            coverage.style.display = coverageVisible ? 'block' : 'none';
        }
    }
    
    // Show/hide coverage for placed speakers
    placedSpeakers.forEach(speaker => {
        const coverage = document.getElementById('coverage' + speaker.id);
        if (coverage) {
            coverage.style.display = coverageVisible ? 'block' : 'none';
        }
    });
}

// Toggle SPL value visibility
function toggleSplValues() {
    splValuesVisible = !splValuesVisible;
    
    // Update checkbox appearance
    const checkbox = document.getElementById('spl-checkbox');
    checkbox.className = splValuesVisible ? 'checkbox checked' : 'checkbox unchecked';
    
    console.log(splValuesVisible ? 'SPL values visible' : 'SPL values hidden');
}

// PROPERTY UPDATE FUNCTIONS

// Update speaker position (in meters)
function updatePosition() {
    if (selectedSpeakerId && placedSpeakers.find(s => s.id === selectedSpeakerId)) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            const xValue = parseFloat(document.getElementById('x-position').value);
            const yValue = parseFloat(document.getElementById('y-position').value);
            
            // Update actual meter positions
            placedSpeakers[speakerIndex].actualX = xValue;
            placedSpeakers[speakerIndex].actualY = yValue;
            
            // Convert to pixel positions
            const newPixelX = metersToPixels(xValue, true);
            const newPixelY = metersToPixels(yValue, false);
            
            placedSpeakers[speakerIndex].x = newPixelX;
            placedSpeakers[speakerIndex].y = newPixelY;
            
            // Update DOM elements
            const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
            const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
            if (speakerEl) {
                speakerEl.style.left = newPixelX + 'px';
                speakerEl.style.top = newPixelY + 'px';
            }
            if (coverageEl) {
                coverageEl.style.left = newPixelX + 'px';
                coverageEl.style.top = newPixelY + 'px';
            }
        }
    }
}

function updateRotation() {
    if (selectedSpeakerId) {
        const rotation = parseInt(document.getElementById('rotation').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].rotation = rotation;
        }
        console.log(`Speaker ${selectedSpeakerId} rotation updated to ${rotation}°`);
    }
}

function updateTilt() {
    if (selectedSpeakerId) {
        const tilt = parseInt(document.getElementById('tilt').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].tilt = tilt;
        }
    }
}

function updateMountType() {
    if (selectedSpeakerId) {
        const mountType = document.getElementById('mount-type').value;
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].mountType = mountType;
            
            // Update default height based on mount type
            if (mountType === 'ceiling' || mountType === 'in-ceiling') {
                placedSpeakers[speakerIndex].mountHeight = 3.0;
                document.getElementById('mount-height').value = '3.0 m';
                placedSpeakers[speakerIndex].tilt = 90;
                document.getElementById('tilt').value = '90°';
            } else if (mountType === 'wall' || mountType === 'in-wall') {
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
        }
    }
}

function updateMountHeight() {
    if (selectedSpeakerId) {
        const mountHeight = parseFloat(document.getElementById('mount-height').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].mountHeight = mountHeight;
        }
    }
}

function updatePower() {
    if (selectedSpeakerId) {
        const power = parseInt(document.getElementById('power').value);
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            placedSpeakers[speakerIndex].power = power;
        }
    }
}

function updateTargetSpl() {
    const targetSpl = parseInt(document.getElementById('target-spl').value);
    console.log(`Target SPL updated to ${targetSpl} dB`);
}

function updateEarHeight() {
    const earHeight = parseFloat(document.getElementById('ear-height').value);
    console.log(`Ear height updated to ${earHeight} m`);
}

// SPEAKER MANAGEMENT FUNCTIONS

// Delete selected speaker
function deleteSelectedSpeaker() {
    if (selectedSpeakerId) {
        const speakerIndex = placedSpeakers.findIndex(s => s.id === selectedSpeakerId);
        if (speakerIndex !== -1) {
            if (confirm(`Delete speaker ${selectedSpeakerId}?`)) {
                // Remove from the DOM
                const speakerEl = document.getElementById('speaker' + selectedSpeakerId);
                const coverageEl = document.getElementById('coverage' + selectedSpeakerId);
                
                if (speakerEl) speakerEl.remove();
                if (coverageEl) coverageEl.remove();
                
                // Remove from the array
                placedSpeakers.splice(speakerIndex, 1);
                
                // Reset selection
                selectedSpeakerId = null;
                
                // Update status bar
                document.getElementById('speaker-count').textContent = `Speakers: ${placedSpeakers.length}`;
                
                // Update model value display
                document.getElementById('model-value').textContent = 'Select a speaker';
            }
        } else {
            alert('Cannot delete demo speakers. Please add your own speakers first.');
        }
    } else {
        alert('No speaker selected');
    }
}

// PREMIUM AND FILE FUNCTIONS

// Show premium feature dialog
function showPremiumDialog() {
    document.getElementById('premium-overlay').style.display = 'flex';
}

// Close premium feature dialog
function closePremiumDialog() {
    document.getElementById('premium-overlay').style.display = 'none';
}

// Upgrade to premium
function upgradeToPremium() {
    alert('Thank you for upgrading! PDF Report feature is now available.');
    closePremiumDialog();
    generatePDFReport();
}

// Generate PDF report (placeholder)
function generatePDFReport() {
    const room = document.querySelector('.room');
    const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
    const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
    
    let reportContent = `AuraVisual Speaker Layout Report\n\n`;
    reportContent += `Room Dimensions: ${actualWidth}m × ${actualHeight}m\n`;
    reportContent += `Number of Speakers: ${placedSpeakers.length}\n\n`;
    
    reportContent += `Speaker Details:\n`;
    placedSpeakers.forEach((speaker, index) => {
        const speakerData = getSpeakerById(speaker.databaseId);
        reportContent += `${index + 1}. ${speakerData.manufacturer} ${speakerData.model}\n`;
        reportContent += `   Position: ${speaker.actualX?.toFixed(1) || 'N/A'}m, ${speaker.actualY?.toFixed(1) || 'N/A'}m\n`;
        reportContent += `   Mount: ${speaker.mountType} at ${speaker.mountHeight}m height\n`;
        reportContent += `   Power: ${speaker.power}W, Rotation: ${speaker.rotation}°\n\n`;
    });
    
    // Create downloadable text file (in real implementation, this would be a PDF)
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraVisual_Report_${actualWidth}x${actualHeight}m.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('PDF Report generated successfully!');
}

// Save layout to JSON file
function saveLayout() {
    const room = document.querySelector('.room');
    const actualWidth = parseFloat(room.getAttribute('data-actual-width')) || 5;
    const actualHeight = parseFloat(room.getAttribute('data-actual-height')) || 3.5;
    
    const layoutData = {
        version: "1.0",
        room: {
            width: actualWidth,
            height: actualHeight
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
            earHeight: document.getElementById('ear-height').value,
            coverageVisible: coverageVisible,
            splValuesVisible: splValuesVisible
        },
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `AuraVisual_Layout_${actualWidth}x${actualHeight}m_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('Layout saved successfully!');
}

// Load layout from JSON file
function loadLayout() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const layoutData = JSON.parse(e.target.result);
                    
                    // Validate layout data
                    if (!layoutData.version || !layoutData.room || !layoutData.speakers) {
                        throw new Error('Invalid layout file format');
                    }
                    
                    // Clear existing speakers
                    placedSpeakers.forEach(speaker => {
                        const speakerEl = document.getElementById('speaker' + speaker.id);
                        const coverageEl = document.getElementById('coverage' + speaker.id);
                        if (speakerEl) speakerEl.remove();
                        if (coverageEl) coverageEl.remove();
                    });
                    placedSpeakers = [];
                    
                    // Load room dimensions
                    document.getElementById('room-width').value = layoutData.room.width;
                    document.getElementById('room-height').value = layoutData.room.height;
                    updateRoomSize();
                    
                    // Load speakers
                    let maxId = 0;
                    layoutData.speakers.forEach(speakerData => {
                        const speaker = {
                            id: speakerData.id,
                            databaseId: speakerData.databaseId,
                            x: metersToPixels(speakerData.actualX, true),
                            y: metersToPixels(speakerData.actualY, false),
                            actualX: speakerData.actualX,
                            actualY: speakerData.actualY,
                            mountType: speakerData.mountType,
                            mountHeight: speakerData.mountHeight,
                            rotation: speakerData.rotation,
                            tilt: speakerData.tilt,
                            power: speakerData.power
                        };
                        
                        placedSpeakers.push(speaker);
                        createSpeakerElement(speaker);
                        maxId = Math.max(maxId, speaker.id);
                    });
                    
                    nextSpeakerId = maxId + 1;
                    
                    // Load settings
                    if (layoutData.settings) {
                        document.getElementById('target-spl').value = layoutData.settings.targetSpl || '85 dB';
                        document.getElementById('ear-height').value = layoutData.settings.earHeight || '1.2 m';
                        
                        if (layoutData.settings.coverageVisible !== undefined) {
                            coverageVisible = layoutData.settings.coverageVisible;
                            const checkbox = document.getElementById('coverage-checkbox');
                            checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
                            toggleCoverage();
                        }
                    }
                    
                    // Update speaker count
                    document.getElementById('speaker-count').textContent = `Speakers: ${placedSpeakers.length}`;
                    
                    alert(`Layout loaded successfully!\nRoom: ${layoutData.room.width}m × ${layoutData.room.height}m\nSpeakers: ${layoutData.speakers.length}`);
                    
                } catch (error) {
                    alert('Error loading layout file: ' + error.message);
                    console.error('Error loading layout:', error);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
    
// Variables for drag functionality
let isDragging = false;
let dragSpeakerId = null;
let dragOffset = { x: 0, y: 0 };

// Enhanced select tool function with drag functionality
function selectTool(tool) {
    currentTool = tool;
    
    // Update tool button styling
    document.getElementById('speaker-tool').classList.toggle('active', tool === 'speaker');
    document.getElementById('move-tool').classList.toggle('active', tool === 'move');
    
    // Update cursor on room editor
    const roomEditor = document.getElementById('room-editor');
    roomEditor.style.cursor = tool === 'speaker' ? 'crosshair' : 'default';
    
    // Enable/disable dragging based on tool
    if (tool === 'move') {
        enableSpeakerDragging();
    } else {
        disableSpeakerDragging();
    }
}

// Enable speaker dragging functionality
function enableSpeakerDragging() {
    // Add drag event listeners to all existing speakers
    const allSpeakers = document.querySelectorAll('.speaker');
    allSpeakers.forEach(speaker => {
        speaker.style.cursor = 'grab';
        speaker.addEventListener('mousedown', handleSpeakerMouseDown);
    });
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Disable speaker dragging functionality
function disableSpeakerDragging() {
    // Remove drag event listeners from all speakers
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
    
    // Get speaker ID from element
    const speakerId = event.target.id.replace('speaker', '');
    dragSpeakerId = parseInt(speakerId);
    
    // Select the speaker being dragged
    selectSpeaker(dragSpeakerId);
    
    // Calculate offset from mouse to speaker center
    const speakerRect = event.target.getBoundingClientRect();
    dragOffset.x = event.clientX - speakerRect.left - speakerRect.width / 2;
    dragOffset.y = event.clientY - speakerRect.top - speakerRect.height / 2;
    
    // Start dragging
    isDragging = true;
    event.target.style.cursor = 'grabbing';
    event.target.style.zIndex = '1000';
    
    console.log(`Started dragging speaker ${dragSpeakerId}`);
}

// Handle mouse move (during drag)
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
    const roomLeft = roomRect.left;
    const roomTop = roomRect.top;
    const roomRight = roomRect.right;
    const roomBottom = roomRect.bottom;
    
    // Constrain to room boundaries (with some padding for speaker size)
    const constrainedX = Math.max(roomLeft + 10, Math.min(roomRight - 30, newX));
    const constrainedY = Math.max(roomTop + 10, Math.min(roomBottom - 30, newY));
    
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
        
        // Convert to meters for storage
        placedSpeakers[speakerIndex].actualX = parseFloat(pixelsToMeters(constrainedX, true));
        placedSpeakers[speakerIndex].actualY = parseFloat(pixelsToMeters(constrainedY, false));
        
        // Update properties panel in real-time
        updatePropertiesPanel(dragSpeakerId);
    }
}

// Handle mouse up (end drag)
function handleMouseUp(event) {
    if (!isDragging || !dragSpeakerId) return;
    
    // End dragging
    isDragging = false;
    
    const speakerEl = document.getElementById('speaker' + dragSpeakerId);
    if (speakerEl) {
        speakerEl.style.cursor = 'grab';
        speakerEl.style.zIndex = '';
    }
    
    console.log(`Finished dragging speaker ${dragSpeakerId}`);
    
    // Get final position in meters
    const speakerIndex = placedSpeakers.findIndex(s => s.id === dragSpeakerId);
    if (speakerIndex !== -1) {
        const finalX = placedSpeakers[speakerIndex].actualX;
        const finalY = placedSpeakers[speakerIndex].actualY;
        console.log(`Speaker ${dragSpeakerId} moved to: ${finalX}m, ${finalY}m`);
    }
    
    dragSpeakerId = null;
}

// Enhanced createSpeakerElement function that supports dragging
function createSpeakerElementWithDrag(speaker) {
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
    
    // Add elements to the room editor
    roomEditor.appendChild(speakerEl);
    roomEditor.appendChild(coverageEl);
}

// Update the existing createSpeakerElement function
function createSpeakerElement(speaker) {
    createSpeakerElementWithDrag(speaker);
}

// Add dragging support to existing demo speakers
function addDragToExistingSpeakers() {
    const demoSpeakers = ['speaker1', 'speaker2', 'speaker3'];
    demoSpeakers.forEach(speakerId => {
        const speakerEl = document.getElementById(speakerId);
        if (speakerEl && currentTool === 'move') {
            speakerEl.style.cursor = 'grab';
            speakerEl.addEventListener('mousedown', function(event) {
                // Create a temporary speaker object for demo speakers
                const tempId = parseInt(speakerId.replace('speaker', ''));
                dragSpeakerId = tempId;
                handleSpeakerMouseDown(event);
            });
        }
    });
}

// Enhanced tool selection with visual feedback
function selectToolEnhanced(tool) {
    currentTool = tool;
    
    // Update tool button styling
    document.getElementById('speaker-tool').classList.toggle('active', tool === 'speaker');
    document.getElementById('move-tool').classList.toggle('active', tool === 'move');
    
    // Update cursor and instructions
    const roomEditor = document.getElementById('room-editor');
    if (tool === 'speaker') {
        roomEditor.style.cursor = 'crosshair';
        roomEditor.title = 'Click to place speakers';
        disableSpeakerDragging();
    } else if (tool === 'move') {
        roomEditor.style.cursor = 'default';
        roomEditor.title = 'Drag speakers to move them';
        enableSpeakerDragging();
        addDragToExistingSpeakers();
    }
    
    console.log(`Tool switched to: ${tool}`);
}
}
