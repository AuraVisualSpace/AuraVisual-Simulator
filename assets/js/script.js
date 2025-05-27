drawSideView(params) {
        console.log('Drawing enhanced side view');
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const { roomDepth, roomHeight, maxSPL } = params;
        
        // Clear canvas and create gradient background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(1, '#0f0f1a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / roomDepth;
        const scaleY = canvas.height / roomHeight;
        const scale = Math.min(scaleX, scaleY) * 0.8;
        
        const offsetX = (canvas.width - roomDepth * scale) / 2;
        const offsetY = (canvas.height - roomHeight * scale) / 2;
        
        // Get speaker position and direction
        const speaker = this.getSpeakerPosition(params);
        const direction = this.getSpeakerDirection(params);
        
        // Create smooth SPL heatmap using ImageData
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let canvasX = 0; canvasX < canvas.width; canvasX += 2) {
            for (let canvasY = 0; canvasY < canvas.height; canvasY += 2) {
                // Convert canvas coordinates to room coordinates
                const roomY = (canvasX - offsetX) / scale;
                const roomZ = roomHeight - (canvasY - offsetY) / scale;
                
                // Check if point is within room bounds
                if (roomY >= 0 && roomY <= roomDepth && roomZ >= 0 && roomZ <= roomHeight) {
                    const dx = 0;
                    const dy = roomY - speaker.y;
                    const dz = roomZ - speaker.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance > 0.1) {
                        const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
                        let horizontalAngle = 0;
                        if (horizontalDistance > 0.01) {
                            horizontalAngle = Math.atan2(Math.abs(dx), Math.abs(dy)) * 180 / Math.PI;
                        }
                        
                        const verticalAngle = Math.atan2(dz, Math.max(horizontalDistance, 0.01)) * 180 / Math.PI;
                        const spl = this.calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL);
                        const color = this.getSPLColorRGB(spl);
                        
                        const alpha = Math.max(0.3, Math.min(0.8, spl / maxSPL));
                        
                        // Fill 2x2 pixel area
                        for (let px = 0; px < 2 && canvasX + px < canvas.width; px++) {
                            for (let py = 0; py < 2 && canvasY + py < canvas.height; py++) {
                                const index = ((canvasY + py) * canvas.width + (canvasX + px)) * 4;
                                if (index < data.length - 3) {
                                    data[index] = color.r;
                                    data[index + 1] = color.g;
                                    data[index + 2] = color.b;
                                    data[index + 3] = alpha * 255;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Draw room outline with glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, roomDepth * scale, roomHeight * scale);
        ctx.shadowBlur = 0;
        
        // Draw enhanced listening height indicators
        ctx.strokeStyle = '#00ff80';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        
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
        
        // Draw vertical dispersion pattern with gradients
        const speakerPixelX = offsetX + speaker.y * scale;
        const speakerPixelY = offsetY + (roomHeight - speaker.z) * scale;
        
        const horizontalMag = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const verticalDirection = Math.atan2(direction.z, Math.max(horizontalMag, 0.01));
        
        const coneLength = 120;
        const topAngle = verticalDirection + Math.PI / 8;
        const bottomAngle = verticalDirection - Math.PI / 8;
        
        // Create gradient for vertical dispersion
        const vertConeGradient = ctx.createRadialGradient(
            speakerPixelX, speakerPixelY, 0,
            speakerPixelX, speakerPixelY, coneLength
        );
        vertConeGradient.addColorStop(0, 'rgba(255, 255, 0, 0.4)');
        vertConeGradient.addColorStop(1, 'rgba(255, 255, 0, 0.1)');
        
        // Draw filled vertical dispersion cone
        ctx.fillStyle = vertConeGradient;
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(topAngle) * coneLength,
            speakerPixelY - Math.sin(topAngle) * coneLength
        );
        ctx.lineTo(
            speakerPixelX + Math.cos(bottomAngle) * coneLength,
            speakerPixelY - Math.sin(bottomAngle) * coneLength
        );
        ctx.closePath();
        ctx.fill();
        
        // Draw dispersion outline
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
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
        ctx.stroke();
        
        // Draw center axis
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(verticalDirection) * coneLength,
            speakerPixelY - Math.sin(verticalDirection) * coneLength
        );
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw enhanced speaker
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Enhanced labels with icons
        ctx.fillStyle = 'rgba(0, 255, 128, 0.9)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        
        if (roomHeight >= 1.7) {
            const height17Y = offsetY + (roomHeight - 1.7) * scale;
            ctx.fillText('🧍 1.7m (Standing)', offsetX + roomDepth * scale + 15, height17Y + 5);
        }
        if (roomHeight >= 1.2) {
            const height12Y = offsetY + (roomHeight - 1.2) * scale;
            ctx.fillText('🪑 1.2m (Seated)', offsetX + roomDepth * scale + 15, height12Y + 5);
        }
        
        // Add room dimensions and speaker info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('📐 Side View Analysis', 20, 35);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText(`Room: ${roomDepth}m × ${roomHeight}m`, 20, canvas.height - 40);
        ctx.fillText(`Speaker Height: ${(speaker.z).toFixed(1)}m`, 20, canvas.height - 20);
        
        console.log('Enhanced side view drawing completed');
    }class SPLSimulator {
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
        // Keep the original hex color function for backward compatibility
        if (spl >= 110) return '#ff0000';
        if (spl >= 100) return '#ff8000';
        if (spl >= 90) return '#ffff00';
        if (spl >= 80) return '#80ff00';
        if (spl >= 70) return '#00ff80';
        if (spl >= 60) return '#0080ff';
        return '#0000ff';
    }
    
    getSPLColorRGB(spl) {
        // More sophisticated color mapping with smooth gradients
        if (spl >= 110) return { r: 255, g: 0, b: 0 };    // Bright red
        if (spl >= 100) return { r: 255, g: Math.round((110-spl)*25.5), b: 0 }; // Red to orange
        if (spl >= 90) return { r: 255, g: 255, b: Math.round((100-spl)*25.5) }; // Orange to yellow
        if (spl >= 80) return { r: Math.round(255-(90-spl)*17.5), g: 255, b: 0 }; // Yellow to green
        if (spl >= 70) return { r: 0, g: 255, b: Math.round((80-spl)*25.5) }; // Green to cyan
        if (spl >= 60) return { r: 0, g: Math.round(255-(70-spl)*25.5), b: 255 }; // Cyan to blue
        return { r: 0, g: 0, b: Math.max(100, 255-(60-spl)*15.5) }; // Dark blue
    }
    
    drawTopView(params, listeningHeight) {
        console.log('Drawing top view with listening height:', listeningHeight);
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const { roomWidth, roomDepth, maxSPL } = params;
        
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient background
        const bgGradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
        );
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(1, '#0f0f1a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / roomWidth;
        const scaleY = canvas.height / roomDepth;
        const scale = Math.min(scaleX, scaleY) * 0.85;
        
        const offsetX = (canvas.width - roomWidth * scale) / 2;
        const offsetY = (canvas.height - roomDepth * scale) / 2;
        
        // Get speaker position and direction
        const speaker = this.getSpeakerPosition(params);
        const direction = this.getSpeakerDirection(params);
        
        // Create smooth SPL heatmap using ImageData for better performance
        const resolution = 60; // Higher resolution for smoother look
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        console.log('Starting smooth heatmap drawing...');
        
        for (let canvasX = 0; canvasX < canvas.width; canvasX += 2) {
            for (let canvasY = 0; canvasY < canvas.height; canvasY += 2) {
                // Convert canvas coordinates to room coordinates
                const roomX = (canvasX - offsetX) / scale;
                const roomY = (canvasY - offsetY) / scale;
                
                // Check if point is within room bounds
                if (roomX >= 0 && roomX <= roomWidth && roomY >= 0 && roomY <= roomDepth) {
                    const dx = roomX - speaker.x;
                    const dy = roomY - speaker.y;
                    const dz = listeningHeight - speaker.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distance > 0.1) {
                        // Calculate angles
                        const pointDirection = { x: dx / distance, y: dy / distance };
                        const horizDotProduct = Math.max(-1, Math.min(1, direction.x * pointDirection.x + direction.y * pointDirection.y));
                        const horizontalAngle = Math.acos(horizDotProduct) * 180 / Math.PI;
                        const verticalAngle = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) * 180 / Math.PI;
                        
                        const spl = this.calculateSPL(distance, horizontalAngle, verticalAngle, maxSPL);
                        const color = this.getSPLColorRGB(spl);
                        
                        // Apply smooth gradient effect
                        const alpha = Math.max(0.3, Math.min(0.8, spl / maxSPL));
                        
                        // Fill 2x2 pixel area for smoother appearance
                        for (let px = 0; px < 2 && canvasX + px < canvas.width; px++) {
                            for (let py = 0; py < 2 && canvasY + py < canvas.height; py++) {
                                const index = ((canvasY + py) * canvas.width + (canvasX + px)) * 4;
                                if (index < data.length - 3) {
                                    data[index] = color.r;     // Red
                                    data[index + 1] = color.g; // Green
                                    data[index + 2] = color.b; // Blue
                                    data[index + 3] = alpha * 255; // Alpha
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Apply the smooth heatmap
        ctx.putImageData(imageData, 0, 0);
        
        // Add subtle room outline with glow effect
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, roomWidth * scale, roomDepth * scale);
        ctx.shadowBlur = 0;
        
        // Draw enhanced dispersion pattern with gradients
        const speakerPixelX = offsetX + speaker.x * scale;
        const speakerPixelY = offsetY + speaker.y * scale;
        const directionAngle = Math.atan2(direction.y, direction.x);
        const coneLength = 150;
        
        // Create gradient for dispersion cone
        const coneGradient = ctx.createRadialGradient(
            speakerPixelX, speakerPixelY, 0,
            speakerPixelX, speakerPixelY, coneLength
        );
        coneGradient.addColorStop(0, 'rgba(255, 255, 0, 0.4)');
        coneGradient.addColorStop(1, 'rgba(255, 255, 0, 0.1)');
        
        // Draw filled dispersion cone
        const leftAngle = directionAngle - Math.PI / 4;
        const rightAngle = directionAngle + Math.PI / 4;
        
        ctx.fillStyle = coneGradient;
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(leftAngle) * coneLength,
            speakerPixelY + Math.sin(leftAngle) * coneLength
        );
        ctx.arc(speakerPixelX, speakerPixelY, coneLength, leftAngle, rightAngle);
        ctx.lineTo(speakerPixelX, speakerPixelY);
        ctx.fill();
        
        // Draw dispersion cone outline
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
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
        ctx.stroke();
        
        // Draw center axis with dashed line
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        ctx.lineTo(
            speakerPixelX + Math.cos(directionAngle) * coneLength,
            speakerPixelY + Math.sin(directionAngle) * coneLength
        );
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw enhanced speaker with glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Inner speaker circle
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(speakerPixelX, speakerPixelY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Speaker orientation arrow
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(speakerPixelX, speakerPixelY);
        const arrowEndX = speakerPixelX + Math.cos(directionAngle) * 25;
        const arrowEndY = speakerPixelY + Math.sin(directionAngle) * 25;
        ctx.lineTo(arrowEndX, arrowEndY);
        
        // Arrow head
        const arrowHeadLength = 8;
        const arrowHeadAngle = Math.PI / 6;
        ctx.lineTo(
            arrowEndX - arrowHeadLength * Math.cos(directionAngle - arrowHeadAngle),
            arrowEndY - arrowHeadLength * Math.sin(directionAngle - arrowHeadAngle)
        );
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - arrowHeadLength * Math.cos(directionAngle + arrowHeadAngle),
            arrowEndY - arrowHeadLength * Math.sin(directionAngle + arrowHeadAngle)
        );
        ctx.stroke();
        
        // Enhanced listening height indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`🎧 Listening Height: ${listeningHeight}m`, 20, 35);
        
        // Add room dimensions
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText(`Room: ${roomWidth}m × ${roomDepth}m`, 20, canvas.height - 20);
        
        console.log('Enhanced top view drawing completed');
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
})
