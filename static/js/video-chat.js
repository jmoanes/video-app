// Video Chat Application JavaScript
class VideoChatApp {
    constructor() {
        this.localStream = null;
        this.peerConnections = {};
        this.localVideo = null;
        this.isMuted = false;
        this.isVideoOff = false;
        this.isScreenSharing = false;
        this.isInCall = false;
        this.websocket = null;
        this.roomId = roomId;
        this.currentUser = currentUser;
        
        this.init();
    }
    
    init() {
        this.setupWebSocket();
        this.setupEventListeners();
        this.setupLocalVideo();
    }
    
    setupWebSocket() {
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
            this.addNotification(`${currentUser} joined the room`, 'join');
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    setupEventListeners() {
        // Message input enter key
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Copy invite code
        if (document.querySelector('.invite-code-box button')) {
            document.querySelector('.invite-code-box button').addEventListener('click', () => {
                this.copyInviteCode();
            });
        }
    }
    
    setupLocalVideo() {
        // Create local video element
        this.localVideo = document.createElement('video');
        this.localVideo.autoplay = true;
        this.localVideo.muted = true;
        this.localVideo.playsInline = true;
        
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item local';
        videoItem.appendChild(this.localVideo);
        
        const videoLabel = document.createElement('div');
        videoLabel.className = 'video-label';
        videoLabel.textContent = `${this.currentUser} (You)`;
        videoItem.appendChild(videoLabel);
        
        document.getElementById('videoGrid').appendChild(videoItem);
    }
    
    async startCall() {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Set local video source
            this.localVideo.srcObject = this.localStream;
            
            // Update UI
            this.showCallControls();
            this.isInCall = true;
            
            // Add join animation
            this.addNotification(`${this.currentUser} started the call`, 'call-start');
            
            // Notify other participants
            this.sendWebSocketMessage('user_status', {
                status: 'call_started',
                user: this.currentUser
            });
            
        } catch (error) {
            console.error('Error starting call:', error);
            this.addNotification('Error starting call. Please check camera and microphone permissions.', 'error');
        }
    }
    
    endCall() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Stop screen sharing if active
        if (this.isScreenSharing) {
            this.stopScreenShare();
        }
        
        // Close peer connections
        Object.values(this.peerConnections).forEach(pc => pc.close());
        this.peerConnections = {};
        
        // Update UI
        this.hideCallControls();
        this.isInCall = false;
        
        // Add leave animation
        this.addNotification(`${this.currentUser} ended the call`, 'call-end');
        
        // Notify other participants
        this.sendWebSocketMessage('user_status', {
            status: 'call_ended',
            user: this.currentUser
        });
    }
    
    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isMuted = !audioTrack.enabled;
                
                // Update UI
                if (this.isMuted) {
                    document.getElementById('muteBtn').style.display = 'none';
                    document.getElementById('unmuteBtn').style.display = 'flex';
                } else {
                    document.getElementById('muteBtn').style.display = 'flex';
                    document.getElementById('unmuteBtn').style.display = 'none';
                }
                
                // Add animation
                this.addNotification(
                    this.isMuted ? 'Microphone muted' : 'Microphone unmuted',
                    this.isMuted ? 'mute' : 'unmute'
                );
            }
        }
    }
    
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isVideoOff = !videoTrack.enabled;
                
                // Update UI
                if (this.isVideoOff) {
                    document.getElementById('videoBtn').style.display = 'none';
                    document.getElementById('videoOffBtn').style.display = 'flex';
                } else {
                    document.getElementById('videoBtn').style.display = 'flex';
                    document.getElementById('videoOffBtn').style.display = 'none';
                }
                
                // Add animation
                this.addNotification(
                    this.isVideoOff ? 'Video turned off' : 'Video turned on',
                    this.isVideoOff ? 'video-off' : 'video-on'
                );
            }
        }
    }
    
    async toggleScreenShare() {
        if (!this.isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });
                
                // Replace video track
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.peerConnections[Object.keys(this.peerConnections)[0]]?.getSenders()
                    .find(s => s.track?.kind === 'video');
                
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
                
                this.isScreenSharing = true;
                this.screenStream = screenStream;
                
                // Update UI
                document.getElementById('screenShareBtn').style.display = 'none';
                document.getElementById('stopScreenShareBtn').style.display = 'flex';
                
                this.addNotification('Screen sharing started', 'screen-share');
                
            } catch (error) {
                console.error('Error starting screen share:', error);
                this.addNotification('Error starting screen share', 'error');
            }
        } else {
            this.stopScreenShare();
        }
    }
    
    stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
        
        this.isScreenSharing = false;
        
        // Update UI
        document.getElementById('screenShareBtn').style.display = 'flex';
        document.getElementById('stopScreenShareBtn').style.display = 'none';
        
        this.addNotification('Screen sharing stopped', 'screen-share-stop');
    }
    
    showCallControls() {
        document.getElementById('startCallBtn').style.display = 'none';
        document.getElementById('endCallBtn').style.display = 'flex';
        document.getElementById('muteBtn').style.display = 'flex';
        document.getElementById('videoBtn').style.display = 'flex';
        document.getElementById('screenShareBtn').style.display = 'flex';
    }
    
    hideCallControls() {
        document.getElementById('startCallBtn').style.display = 'flex';
        document.getElementById('endCallBtn').style.display = 'none';
        document.getElementById('muteBtn').style.display = 'none';
        document.getElementById('unmuteBtn').style.display = 'none';
        document.getElementById('videoBtn').style.display = 'none';
        document.getElementById('videoOffBtn').style.display = 'none';
        document.getElementById('screenShareBtn').style.display = 'none';
        document.getElementById('stopScreenShareBtn').style.display = 'none';
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'chat_message':
                this.addChatMessage(data.user, data.message);
                break;
            case 'user_join':
                this.addNotification(`${data.user} joined the room`, 'join');
                break;
            case 'user_leave':
                this.addNotification(`${data.user} left the room`, 'leave');
                break;
            case 'webrtc_signal':
                this.handleWebRTCSignal(data.signal, data.user);
                break;
            case 'user_status':
                this.handleUserStatus(data.status, data.user);
                break;
        }
    }
    
    sendWebSocketMessage(type, data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: type,
                ...data
            }));
        }
    }
    
    addChatMessage(user, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <strong>${user}</strong>
                <small class="text-muted">${timeString}</small>
            </div>
            <div class="message-content">${message}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add animation
        messageDiv.classList.add('slide-up');
    }
    
    addNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    copyInviteCode() {
        const inviteCode = document.querySelector('.invite-code-box strong').textContent;
        navigator.clipboard.writeText(inviteCode).then(() => {
            this.addNotification('Invite code copied to clipboard!', 'success');
        }).catch(() => {
            this.addNotification('Failed to copy invite code', 'error');
        });
    }
    
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(tabName + 'Tab').style.display = 'block';
        
        // Add active class to selected tab button
        event.target.classList.add('active');
    }
}

// Global functions for button clicks
let videoChatApp;

document.addEventListener('DOMContentLoaded', () => {
    videoChatApp = new VideoChatApp();
});

function startCall() {
    if (videoChatApp) {
        videoChatApp.startCall();
    }
}

function endCall() {
    if (videoChatApp) {
        videoChatApp.endCall();
    }
}

function toggleMute() {
    if (videoChatApp) {
        videoChatApp.toggleMute();
    }
}

function toggleVideo() {
    if (videoChatApp) {
        videoChatApp.toggleVideo();
    }
}

function toggleScreenShare() {
    if (videoChatApp) {
        videoChatApp.toggleScreenShare();
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message && videoChatApp) {
        videoChatApp.sendWebSocketMessage('chat_message', {
            message: message
        });
        
        // Add message to chat
        videoChatApp.addChatMessage(videoChatApp.currentUser, message);
        
        // Clear input
        messageInput.value = '';
    }
}

function showTab(tabName) {
    if (videoChatApp) {
        videoChatApp.showTab(tabName);
    }
}

function copyInviteCode() {
    if (videoChatApp) {
        videoChatApp.copyInviteCode();
    }
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        color: var(--gray-800);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        border-left: 4px solid var(--primary-blue);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-join {
        border-left-color: #10b981;
    }
    
    .notification-leave {
        border-left-color: #ef4444;
    }
    
    .notification-call-start {
        border-left-color: #10b981;
    }
    
    .notification-call-end {
        border-left-color: #ef4444;
    }
    
    .notification-mute {
        border-left-color: #f59e0b;
    }
    
    .notification-unmute {
        border-left-color: #10b981;
    }
    
    .notification-video-off {
        border-left-color: #f59e0b;
    }
    
    .notification-video-on {
        border-left-color: #10b981;
    }
    
    .notification-screen-share {
        border-left-color: #8b5cf6;
    }
    
    .notification-screen-share-stop {
        border-left-color: #6b7280;
    }
    
    .notification-success {
        border-left-color: #10b981;
    }
    
    .notification-error {
        border-left-color: #ef4444;
    }
`;

document.head.appendChild(notificationStyles);
