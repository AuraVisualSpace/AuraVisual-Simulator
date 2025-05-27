// PROFESSIONAL BEAM COVERAGE SYSTEM - PHYSICS ACCURATE
// Implements proper rectangular/conical beams with room clipping

console.log('🚀 Loading Professional Beam Coverage System v2.0...');

// Enhanced Speaker Database with Beam Types
const professionalSpeakerBeamData = {
    "jbl-srx835p": {
        "id": "jbl-srx835p",
        "manufacturer": "JBL",
        "model": "SRX835P",
        "beamType": "rectangular",
        "horizontalAngle": 90,
        "verticalAngle": 50,
        "maxSPL": 134,
        "mountHeight": 1.2
    },
    "qsc-k12-2": {
        "id": "qsc-k12-2", 
        "manufacturer": "QSC",
        "model": "K12.2",
        "beamType": "rectangular",
        "horizontalAngle": 75,
        "verticalAngle": 75,
        "maxSPL": 132,
        "mountHeight": 1.2
    },
    "ev-zlx-15p": {
        "id": "ev-zlx-15p",
        "manufacturer": "EV", 
        "model": "ZLX-15P",
        "beamType": "rectangular",
        "horizontalAngle": 90,
        "verticalAngle": 60,
        "maxSPL": 126,
        "mountHeight": 1.2
    },
    "ceiling-speaker-90": {
        "id": "ceiling-speaker-90",
        "manufacturer": "Generic",
        "model": "Ceiling 90°",
        "beamType": "conical",
        "horizontalAngle": 90,
        "verticalAngle": 90,
        "maxSPL": 110,
        "mountHeight": 2.7
    }
};

// Professional Beam Physics Engine
class BeamPhysicsEngine {
    
    // Calculate rectangular beam dimensions at distance
    static calculateRectangularBeam(speaker, distance) {
        const speakerData = professionalSpeakerBeamData[speaker.databaseId] || professionalSpeakerBeamData['jbl-srx835p'];
        
        // Convert angles to radians
        const hAngle = speakerData.horizontalAngle * Math.PI / 180;
        const vAngle = speakerData.verticalAngle * Math.PI / 180;
        
        // Physics: beam expands with distance
        const beamWidth = 2 * distance * Math.tan(hAngle / 2);
        const beamHeight = 2 * distance * Math.tan(vAngle / 2);
        
        return {
            width: beamWidth,
            height: beamHeight,
            centerX: speaker.actualX || (speaker.x / this.getPixelScale()),
            centerY: speaker.actualY || (speaker.y / this.getPixelScale()),
            maxSPL: speakerData.maxSPL,
            distance: distance
        };
    }
    
    // Calculate conical beam for ceiling speakers
    static calculateConicalBeam(speaker) {
        const speakerData = professionalSpeakerBeamData[speaker.databaseId] || professionalSpeakerBeamData['ceiling-speaker-90'];
        
        // Height from ceiling to ear level (2.7m - 1.2m = 1.5m)
        const dropHeight = speakerData.mountHeight - 1.2;
        const angle = speakerData.horizontalAngle * Math.PI / 180;
        
        // Cone radius at floor level
        const radius = dropHeight * Math.tan(angle / 2);
        
        return {
            radius: radius,
            centerX: speaker.actualX || (speaker.x / this.getPixelScale()),
            centerY: speaker.actualY || (speaker.y / this.getPixelScale()),
            maxSPL: speakerData.maxSPL,
            dropHeight: dropHeight
        };
    }
    
    // Get pixel to meter conversion scale
    static getPixelScale() {
        const room = document.querySelector('.room') || document.getElementById('room-editor');
        if (!room) return 50; // Fallback
        
        const roomPixelWidth = parseFloat(room.style.width) || 400;
        const roomActualLength = parseFloat(room.getAttribute('data-actual-length')) || 8;
        
        return roomPixelWidth / roomActualLength;
    }
    
    // Calculate SPL at specific point with distance and angle attenuation
    static calculateSPLAtPoint(speaker, pointX, pointY) {
        const speakerData = professionalSpeakerBeamData[speaker.databaseId] || professionalSpeakerBeamData['jbl-srx835p'];
        
        const speakerX = speaker.actualX || (speaker.x / this.getPixelScale());
        const speakerY = speaker.actualY || (speaker.y / this.getPixelScale());
        
        // Calculate distance
        const distance = Math.sqrt(
            Math.pow(pointX - speakerX, 2) + 
            Math.pow(pointY - speakerY, 2)
        );
        
        if (distance < 0.1) return speakerData.maxSPL; // Very close to speaker
        
        // Inverse square law: SPL drops 6dB per doubling of distance
        let spl = speakerData.maxSPL - (20 * Math.log10(distance));
        
        // Calculate angle from speaker axis (assuming speaker faces forward)
        const angle = Math.abs(Math.atan2(pointY - speakerY, pointX - speakerX) * 180/Math.PI);
        
        // Apply off-axis attenuation
        if (speakerData.beamType === 'rectangular') {
            const maxAngle = Math.max(speakerData.horizontalAngle, speakerData.verticalAngle) / 2;
            if (angle > maxAngle) {
                spl -= (angle - maxAngle) * 0.3; // 0.3dB per degree outside beam
            }
        } else if (speakerData.beamType === 'conical') {
            const maxAngle = speakerData.horizontalAngle / 2;
            if (angle > maxAngle) {
                spl -= (angle - maxAngle) * 0.5; // Steeper dropoff for ceiling speakers
            }
        }
        
        return Math.max(40, spl); // Minimum 40dB background
    }
}

// Professional Canvas-Based Coverage Renderer
class BeamCoverageRenderer {
    
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.roomBounds = null;
        this.setupCanvas();
    }
    
    // Setup canvas for coverage rendering
    setupCanvas() {
        // Create or get existing canvas
        this.canvas = document.getElementById('coverage-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'coverage-canvas';
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '2';
            
            // Add to room editor
            const roomEditor = document.getElementById('room-editor') || document.querySelector('.room');
            if (roomEditor) {
                roomEditor.appendChild(this.canvas);
            }
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.updateCanvasSize();
    }
    
    // Update canvas size to match room
    updateCanvasSize() {
        const room = document.querySelector('.room') || document.getElementById('room-editor');
        if (!room) return;
        
        const roomWidth = parseFloat(room.style.width) || 400;
        const roomHeight = parseFloat(room.style.height) || 300;
        
        this.canvas.width = roomWidth;
        this.canvas.height = roomHeight;
        this.canvas.style.width = roomWidth + 'px';
        this.canvas.style.height = roomHeight + 'px';
        
        // Set room boundaries for clipping
        this.roomBounds = {
            left: 0,
            top: 0,
            right: roomWidth,
            bottom: roomHeight
        };
    }
    
    // Clear canvas
    clearCoverage() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    // Render rectangular beam with room clipping
    renderRectangularBeam(speaker, beam) {
        if (!this.ctx) return;
        
        const pixelScale = BeamPhysicsEngine.getPixelScale();
        const speakerPixelX = speaker.x || 200;
        const speakerPixelY = speaker.y || 150;
        
        // Convert beam dimensions to pixels
        const beamPixelWidth = beam.width * pixelScale;
        const beamPixelHeight = beam.height * pixelScale;
        
        // Create clipping path for room boundaries
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.roomBounds.left, this.roomBounds.top, 
                     this.roomBounds.right, this.roomBounds.bottom);
        this.ctx.clip();
        
        // Create gradient from speaker position
        const gradient = this.ctx.createRadialGradient(
            speakerPixelX, speakerPixelY, 0,
            speakerPixelX, speakerPixelY, Math.max(beamPixelWidth, beamPixelHeight) / 2
        );
        
        // SPL zone colors
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');      // Full SPL - bright green
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.6)');  // -3dB - yellow
        gradient.addColorStop(0.8, 'rgba(255, 150, 0, 0.4)');  // -6dB - orange
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.2)');      // Edge - red
        
        // Draw rectangular beam
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            speakerPixelX - beamPixelWidth/2,
            speakerPixelY - beamPixelHeight/2,
            beamPixelWidth,
            beamPixelHeight
        );
        
        // Add beam boundary
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            speakerPixelX - beamPixelWidth/2,
            speakerPixelY - beamPixelHeight/2,
            beamPixelWidth,
            beamPixelHeight
        );
        
        this.ctx.restore();
    }
    
    // Render conical beam for ceiling speakers
    renderConicalBeam(speaker, beam) {
        if (!this.ctx) return;
        
        const pixelScale = BeamPhysicsEngine.getPixelScale();
        const speakerPixelX = speaker.x || 200;
        const speakerPixelY = speaker.y || 150;
        const radiusPixels = beam.radius * pixelScale;
        
        // Create clipping path for room boundaries
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.roomBounds.left, this.roomBounds.top,
                     this.roomBounds.right, this.roomBounds.bottom);
        this.ctx.clip();
        
        // Create radial gradient for cone
        const gradient = this.ctx.createRadialGradient(
            speakerPixelX, speakerPixelY, 0,
            speakerPixelX, speakerPixelY, radiusPixels
        );
        
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');      // Center - bright green
        gradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.6)');  // -3dB zone
        gradient.addColorStop(0.7, 'rgba(255, 150, 0, 0.4)');  // -6dB zone
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');      // Edge
        
        // Draw circular beam
        this.ctx.beginPath();
        this.ctx.arc(speakerPixelX, speakerPixelY, radiusPixels, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add beam boundary
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // Render all speaker coverage
    renderAllCoverage() {
        this.clearCoverage();
        
        if (typeof placedSpeakers !== 'undefined') {
            placedSpeakers.forEach(speaker => {
                this.renderSpeakerCoverage(speaker);
            });
        }
        
        // Render demo speakers if they exist
        for (let i = 1; i <= 3; i++) {
            const demoSpeaker = document.getElementById('speaker' + i);
            if (demoSpeaker) {
                const mockSpeaker = {
                    id: i,
                    databaseId: 'jbl-srx835p',
                    x: parseInt(demoSpeaker.style.left) || 200,
                    y: parseInt(demoSpeaker.style.top) || 150
                };
                this.renderSpeakerCoverage(mockSpeaker);
            }
        }
        
        // Calculate and display coverage percentage
        this.displayCoveragePercentage();
    }
    
    // Render individual speaker coverage
    renderSpeakerCoverage(speaker) {
        const speakerData = professionalSpeakerBeamData[speaker.databaseId] || professionalSpeakerBeamData['jbl-srx835p'];
        
        if (speakerData.beamType === 'rectangular') {
            // Calculate beam at different distances for layered effect
            const distances = [2, 4, 6, 8];
            distances.forEach(distance => {
                const beam = BeamPhysicsEngine.calculateRectangularBeam(speaker, distance);
                this.renderRectangularBeam(speaker, beam);
            });
        } else if (speakerData.beamType === 'conical') {
            const beam = BeamPhysicsEngine.calculateConicalBeam(speaker);
            this.renderConicalBeam(speaker, beam);
        }
    }
    
    // Calculate and display room coverage percentage
    displayCoveragePercentage() {
        if (!this.ctx) return;
        
        // Sample coverage across room grid
        const samplePoints = 20;
        const roomWidth = this.canvas.width;
        const roomHeight = this.canvas.height;
        const pixelScale = BeamPhysicsEngine.getPixelScale();
        
        let coveredPoints = 0;
        let totalPoints = 0;
        
        for (let x = 0; x < samplePoints; x++) {
            for (let y = 0; y < samplePoints; y++) {
                const pixelX = (x / samplePoints) * roomWidth;
                const pixelY = (y / samplePoints) * roomHeight;
                const meterX = pixelX / pixelScale;
                const meterY = pixelY / pixelScale;
                
                // Check if point is covered by any speaker
                let maxSPL = 40; // Background noise
                
                if (typeof placedSpeakers !== 'undefined') {
                    placedSpeakers.forEach(speaker => {
                        const spl = BeamPhysicsEngine.calculateSPLAtPoint(speaker, meterX, meterY);
                        maxSPL = Math.max(maxSPL, spl);
                    });
                }
                
                // Demo speakers
                for (let i = 1; i <= 3; i++) {
                    const demoSpeaker = document.getElementById('speaker' + i);
                    if (demoSpeaker) {
                        const mockSpeaker = {
                            databaseId: 'jbl-srx835p',
                            x: parseInt(demoSpeaker.style.left) || 200,
                            y: parseInt(demoSpeaker.style.top) || 150
                        };
                        const spl = BeamPhysicsEngine.calculateSPLAtPoint(mockSpeaker, meterX, meterY);
                        maxSPL = Math.max(maxSPL, spl);
                    }
                }
                
                if (maxSPL > 60) { // Adequate coverage threshold
                    coveredPoints++;
                }
                totalPoints++;
            }
        }
        
        const coveragePercent = Math.round((coveredPoints / totalPoints) * 100);
        
        // Display coverage percentage
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 150, 30);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Coverage: ${coveragePercent}%`, 20, 30);
        this.ctx.restore();
        
        console.log(`Room coverage: ${coveragePercent}%`);
    }
}

// Global renderer instance
let beamRenderer = null;

// Enhanced Coverage Toggle Function
function toggleProfessionalBeamCoverage() {
    if (typeof coverageVisible === 'undefined') {
        window.coverageVisible = true;
    }
    
    coverageVisible = !coverageVisible;
    
    // Update checkbox
    const checkbox = document.getElementById('coverage-checkbox');
    if (checkbox) {
        checkbox.className = coverageVisible ? 'checkbox checked' : 'checkbox unchecked';
    }
    
    // Show/hide canvas
    if (beamRenderer && beamRenderer.canvas) {
        beamRenderer.canvas.style.display = coverageVisible ? 'block' : 'none';
        
        if (coverageVisible) {
            beamRenderer.renderAllCoverage();
        }
    }
    
    console.log(`Professional beam coverage: ${coverageVisible ? 'ON' : 'OFF'}`);
}

// Update coverage when room changes
function updateBeamCoverageForRoomChange() {
    if (beamRenderer) {
        beamRenderer.updateCanvasSize();
        if (coverageVisible) {
            beamRenderer.renderAllCoverage();
        }
    }
}

// Initialize Professional Beam Coverage System
function initializeProfessionalBeamCoverage() {
    console.log('🎯 Initializing Professional Beam Coverage System v2.0...');
    
    // Create renderer
    beamRenderer = new BeamCoverageRenderer();
    
    // Replace toggle function
    if (typeof window !== 'undefined') {
        window.toggleCoverage = toggleProfessionalBeamCoverage;
    }
    
    // Hook into room size updates
    const originalUpdateRoomSize = window.updateRoomSize;
    if (originalUpdateRoomSize) {
        window.updateRoomSize = function() {
            originalUpdateRoomSize.apply(this, arguments);
            setTimeout(() => updateBeamCoverageForRoomChange(), 300);
        };
    }
    
    // Initial render if coverage is visible
    setTimeout(() => {
        if (coverageVisible && beamRenderer) {
            beamRenderer.renderAllCoverage();
        }
    }, 500);
    
    console.log('🚀 Professional Beam Coverage System READY!');
    console.log('📊 Features: Rectangular/Conical beams, Room clipping, Coverage percentage');
}

// Auto-initialize
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfessionalBeamCoverage);
    } else {
        setTimeout(initializeProfessionalBeamCoverage, 100);
    }
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.BeamCoverage = {
        renderer: () => beamRenderer,
        toggle: toggleProfessionalBeamCoverage,
        update: updateBeamCoverageForRoomChange
    };
}

console.log('✅ Professional Beam Coverage System v2.0 - LOADED!');
console.log('🎯 Physics-accurate beams with room clipping ready!');
