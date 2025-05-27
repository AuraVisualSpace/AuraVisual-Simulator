class SPLSimulator {
    constructor() {
        console.log('SPLSimulator constructor started');
        this.mainCanvas = document.getElementById('mainView');
        this.mainCtx = this.mainCanvas.getContext('2d');
        
        console.log('Canvas element:', this.mainCanvas);
        console.log('Canvas context:', this.mainCtx);
        
        if (!this.mainCanvas || !this.mainCtx) {
            console.error('Canvas or context not found!');
            return;
        }
        
        this.setupEventListeners();
        this.updateSimulation();
        console.log('SPLSimulator constructor completed');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners');
        const controls = [
            'roomWidth', 'roomHeight', 'roomDepth', 'maxSPL', 'speakerWall', 
            'speakerX', 'speakerY', 'speakerZ', 'horizontalRotation', 
            'verticalTilt', 'viewMode'
        ];
        
        controls.forEach(control => {
            const element = document.getElementById(control);
            if (!element) {
                console.error(`Element not found: ${control}`);
                return;
            }
            
            element.addEventListener('change', () => {
                this.updateDisplayValues();
                this.updateSimulation();
            });
            element.addEventListener('input', () => {
                this.updateDisplayValues();
                this.updateSimulation();
            });
        });
        
        this.updateDisplayValues();
        console.log('Event listeners setup complete');
    }
    
    updateDisplayValues() {
        const elements = [
            { id: 'speakerXValue', source: 'speakerX', suffix: '%' },
            { id: 'speakerYValue', source: 'speakerY', suffix: '%' },
            { id: 'speakerZValue', source: 'speakerZ', suffix: '%' },
            { id: 'horizontalRotationValue', source: 'horizontalRotation', suffix: '°' },
            { id: 'verticalTiltValue', source: 'verticalTilt', suffix: '°' }
        ];
        
        elements.forEach(el => {
            const sourceEl = document.getElementById(el.source);
            const targetEl = document.getElementById(el.id);
            if (sourceEl && targetEl) {
                targetEl.textContent = sourceEl.value + el.suffix;
            }
        });
    }
    
    getParameters() {
        const params = {
            roomWidth: parseFloat(document.getElementById('roomWidth').value),
            roomHeight: parseFloat(document.getElementById('roomHeight').value),
            roomDepth: parseFloat(document.getElementById('roomDepth').value),
            maxSPL: parseFloat(document.getElementById('maxSPL').value),
            speakerWall: document.getElementById('speakerWall').value,
            speakerX: parseFloat(document.getElementById('speakerX').value) / 100,
            speakerY: parseFloat(document.getElementById('speakerY').value) / 100,
            speakerZ: parseFloat(document.getElementById('speakerZ').value) / 100,
            horizontalRotation: parseFloat(document.getElementById('horizontalRotation').value),
            verticalTilt: parseFloat(document.getElementById('verticalTilt').value),
            viewMode: document.getElementById('viewMode').value
        };
        
        console.log('Parameters:', params);
        return params;
    }
    
    getSpeakerPosition(params) {
        const { roomWidth, roomHeight, roomDepth, speakerWall, speakerX, speakerY, speakerZ } = params;
        
        let position;
        switch (speakerWall) {
            case 'front':
                position = { 
                    x: speakerX * roomWidth, 
                    y: 0, 
                    z: speakerZ * roomHeight 
                };
                break;
            case 'back':
                position = { 
                    x: speakerX * roomWidth, 
                    y: roomDepth, 
                    z: speakerZ * roomHeight 
                };
                break;
            case 'left':
                position = { 
                    x: 0, 
                    y: speakerY * roomDepth, 
                    z: speakerZ * roomHeight 
                };
                break;
            case 'right':
                position = { 
                    x: roomWidth, 
                    y: speakerY * roomDepth, 
                    z: speakerZ * roomHeight 
                };
                break;
            default:
                position = { 
                    x: roomWidth/2, 
                    y: 0, 
                    z: speakerZ * roomHeight 
                };
        }
        
        console.log('Speaker position:', position);
        return position;
    }
    
    getSpeakerDirection(params) {
        const { speakerWall, horizontalRotation, verticalTilt } = params;
        const horizRotRad = (horizontalRotation * Math.PI) / 180;
        const vertTiltRad = (verticalTilt * Math.PI) / 180;
        
        // Base direction depending on wall
        let baseDirection;
        switch (speakerWall) {
            case 'front':
                baseDirection = { x: 0, y: 1, z: 0 };
                break;
            case 'back':
                baseDirection = { x: 0, y: -1, z: 0 };
                break;
            case 'left':
                baseDirection = { x: 1, y: 0, z: 0 };
                break;
            case 'right':
                baseDirection = { x: -1, y: 0, z: 0 };
                break;
            default:
                baseDirection = { x: 0, y: 1, z: 0 };
        }
        
        // Apply horizontal rotation (around Z-axis)
        let rotatedDir = {
            x: baseDirection.x * Math.cos(horizRotRad) - baseDirection.y * Math.sin(horizRotRad),
            y: baseDirection.x * Math.sin(horizRotRad) + baseDirection.y * Math.cos(horizRotRad),
            z: baseDirection.z
        };
        
        // Apply vertical tilt
        const horizontalMagnitude = Math.sqrt(rotatedDir.x * rotatedDir.x + rotatedDir.y * rotatedDir.y);
        
        const direction = {
            x: rotatedDir.x * Math.cos(vertTiltRad),
            y: rotatedDir.y * Math.cos(vertTiltRad),
            z: horizontalMagnitude * Math.sin(vertTiltRad)
        };
        
        console.log('Speaker direction:', direction);
        return direction;
    }
    
    calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL) {
        if (distance <= 0) return maxSPL;
        
        // Distance attenuation (6dB per doubling of distance)
        const distanceAttenuation = 20 * Math.log10(distance);
        
        // Horizontal angular attenuation (90° dispersion)
        const normalizedHorizAngle = Math.abs(horizontalAngle) / 45;
        const horizAngularAttenuation = normalizedHorizAngle > 1 ? -20 : -6 * Math.pow(normalizedHorizAngle, 2);
        
        // Vertical angular attenuation (45° dispersion)
        const normalizedVertAngle = Math.abs(verticalAngle) / 22.5;
        const vertAngularAttenuation = normalizedVertAngle > 1 ? -20 : -6 * Math.pow(normalizedVertAngle, 2);
        
        // Combined attenuation
        const totalAttenuation = distanceAttenuation - horizAngularAttenuation - vertAngularAttenuation;
        
        return Math.max(0, maxSPL - totalAttenuation);
    }
    
    getSPLColor(spl) {
        if (spl >= 110) return '#ff0000';
        if (spl >= 100) return '#ff8000';
        if (spl >= 90) return '#ffff00';
        if (spl >= 80) return '#80ff00';
        if (spl >= 70) return '#00ff80';
        if (spl >= 60) return '#0080ff';
        return '#0000ff';
    }
    
    drawTopView(params, listeningHeight) {
        console.log('Drawing top view with listening height:', listeningHeight);
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const { roomWidth, roomDepth, maxSPL } = params;
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Test draw - simple rectangle to verify canvas is working
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / roomWidth;
        const scaleY = canvas.height / roomDepth;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        const offsetX = (canvas.width - roomWidth * scale) / 2;
        const offsetY = (canvas.height - roomDepth * scale) / 2;
        
        console.log('Canvas dimensions:', canvas.width, canvas.height);
        console.log('Scale:', scale, 'Offsets:', offsetX, offsetY);
        
        // Draw room outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, roomWidth * scale, roomDepth * scale);
        
        // Get speaker position and direction
        const speaker = this.getSpeakerPosition(params);
        const direction = this.getSpeakerDirection(params);
        
        // Draw SPL heatmap
        const resolution = 20;
        console.log('Starting heatmap drawing...');
        
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const x = (i / (resolution - 1)) * roomWidth;
                const y = (j / (resolution - 1)) * roomDepth;
                
                const dx = x - speaker.x;
                const dy = y - speaker.y;
                const dz = listeningHeight - speaker.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0) {
                    // Calculate horizontal angle
                    const pointDirection = { x: dx / distance, y: dy / distance };
                    const horizDotProduct = direction.x * pointDirection.x + direction.y * pointDirection.y;
                    const horizontalAngle = Math.acos(Math.max(-1, Math.min(1, horizDotProduct))) * 180 / Math.PI;
                    
                    // Calculate vertical angle
                    const verticalAngle = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI;
                    
                    const spl = this.calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL);
                    const color = this.getSPLColor(spl);
                    
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.7;
                    ctx.fillRect(
                        offsetX + x * scale - 3,
                        offsetY + y * scale - 3,
                        6, 6
                    );
                }
            }
        }
        
        ctx.globalAlpha = 1;
        console.log('Heatmap drawing completed');
        
        // Draw dispersion pattern
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        
        const speakerPixelX = offsetX + speaker.x * scale;
        const speakerPixelY = offsetY + speaker.y * scale;
        
        console.log('Speaker pixel position:', speakerPixelX, speakerPixelY);
        
        // Project 3D direction to 2D
        const directionAngle = Math.atan2(direction.y, direction.x);
        
        // Draw 90-degree horizontal dispersion cone
        const coneLength = 120;
        const leftAngle = directionAngle - Math.PI / 4;
        const rightAngle = directionAngle + Math.PI / 4;
        
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(leftAngle) * coneLength,
            speakerPixelY + Math.sin(leftAngle) * coneLength
        );
        
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(rightAngle) * coneLength,
            speakerPixelY + Math.sin(rightAngle) * coneLength
        );
        
        // Draw center axis
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(directionAngle) * coneLength,
            speakerPixelY + Math.sin(directionAngle) * coneLength
        );
        
        ctx.stroke();
        
        // Draw speaker
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw speaker orientation indicator
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(directionAngle) * 20,
            speakerPixelY + Math.sin(directionAngle) * 20
        );
        ctx.stroke();
        
        // Add listening height indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`Listening Height: ${listeningHeight}m`, 20, 30);
        
        console.log('Top view drawing completed');
    }
    
    drawSideView(params) {
        console.log('Drawing side view');
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const { roomDepth, roomHeight, maxSPL } = params;
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Test background
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / roomDepth;
        const scaleY = canvas.height / roomHeight;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        
        const offsetX = (canvas.width - roomDepth * scale) / 2;
        const offsetY = (canvas.height - roomHeight * scale) / 2;
        
        // Draw room outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, roomDepth * scale, roomHeight * scale);
        
        // Get speaker position and direction
        const speaker = this.getSpeakerPosition(params);
        const direction = this.getSpeakerDirection(params);
        
        // Draw SPL heatmap for side view (simplified for debugging)
        const resolution = 15;
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const y = (i / (resolution - 1)) * roomDepth;
                const z = (j / (resolution - 1)) * roomHeight;
                
                const dx = 0;
                const dy = y - speaker.y;
                const dz = z - speaker.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0.1) {
                    const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
                    let horizontalAngle = 0;
                    if (horizontalDistance > 0.01) {
                        horizontalAngle = Math.atan2(Math.abs(dx), Math.abs(dy)) * 180 / Math.PI;
                    }
                    
                    const verticalAngle = Math.atan2(dz, Math.max(horizontalDistance, 0.01)) * 180 / Math.PI;
                    
                    const spl = this.calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL);
                    const color = this.getSPLColor(spl);
                    
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.6;
                    ctx.fillRect(
                        offsetX + y * scale - 3,
                        offsetY + (roomHeight - z) * scale - 3,
                        6, 6
                    );
                }
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Draw listening height indicators
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        if (roomHeight >= 1.2) {
            const height12Y = offsetY + (roomHeight - 1.2) * scale;
            ctx.beginPath();
            ctx.moveTo(offsetX, height12Y);
            ctx.lineTo(offsetX + roomDepth * scale, height12Y);
            ctx.stroke();
        }
        
        if (roomHeight >= 1.7) {
            const height17Y = offsetY + (roomHeight - 1.7) * scale;
            ctx.beginPath();
            ctx.moveTo(offsetX, height17Y);
            ctx.lineTo(offsetX + roomDepth * scale, height17Y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Draw vertical dispersion pattern
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        
        const speakerPixelX = offsetX + speaker.y * scale;
        const speakerPixelY = offsetY + (roomHeight - speaker.z) * scale;
        
        const horizontalMag = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const verticalDirection = Math.atan2(direction.z, Math.max(horizontalMag, 0.01));
        
        const coneLength = 100;
        const topAngle = verticalDirection + Math.PI / 8;
        const bottomAngle = verticalDirection - Math.PI / 8;
        
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(topAngle) * coneLength,
            speakerPixelY - Math.sin(topAngle) * coneLength
        );
        
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(bottomAngle) * coneLength,
            speakerPixelY - Math.sin(bottomAngle) * coneLength
        );
        
        // Draw center axis
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(verticalDirection) * coneLength,
            speakerPixelY - Math.sin(verticalDirection) * coneLength
        );
        
        ctx.stroke();
        
        // Draw speaker
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw speaker orientation indicator
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(verticalDirection) * 20,
            speakerPixelY - Math.sin(verticalDirection) * 20
        );
        ctx.stroke();
        
        // Labels for listening heights
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Arial';
        if (roomHeight >= 1.7) {
            const height17Y = offsetY + (roomHeight - 1.7) * scale;
            ctx.fillText('1.7m', offsetX + roomDepth * scale + 10, height17Y + 5);
        }
        if (roomHeight >= 1.2) {
            const height12Y = offsetY + (roomHeight - 1.2) * scale;
            ctx.fillText('1.2m', offsetX + roomDepth * scale + 10, height12Y + 5);
        }
        
        console.log('Side view drawing completed');
    }
    
    updateSimulation() {
        console.log('Updating simulation...');
        const params = this.getParameters();
        const viewTitle = document.getElementById('viewTitle');
        
        if (!viewTitle) {
            console.error('View title element not found');
            return;
        }
        
        console.log('View mode:', params.viewMode);
        
        try {
            if (params.viewMode === 'top_1.2') {
                viewTitle.textContent = 'Top View (1.2m Listening Height)';
                this.drawTopView(params, 1.2);
            } else if (params.viewMode === 'top_1.7') {
                viewTitle.textContent = 'Top View (1.7m Listening Height)';
                this.drawTopView(params, 1.7);
            } else if (params.viewMode === 'side') {
                viewTitle.textContent = 'Side View (45° Vertical Dispersion)';
                this.drawSideView(params);
            } else {
                console.log('Using default view mode');
                viewTitle.textContent = 'Top View (1.2m Listening Height)';
                this.drawTopView(params, 1.2);
            }
        } catch (error) {
            console.error('Error in updateSimulation:', error);
        }
    }
}

// Initialize the simulator when the page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing SPLSimulator...');
    try {
        new SPLSimulator();
    } catch (error) {
        console.error('Error initializing SPLSimulator:', error);
    }
});
