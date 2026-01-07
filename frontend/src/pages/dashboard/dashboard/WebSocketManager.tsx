import AppConfig from "@/AppConfig";
import { useEffect, useState } from "react";



interface WebSocketMessagingComponentProps {
    clientId: string;
    roomId: string;
    onMessage?: (message: any) => void; // output event
}

export const WebSocketMessagingComponent = ({clientId, roomId='room-1', onMessage}: WebSocketMessagingComponentProps) => {


    useEffect(() => {
        console.log("WebSocketMessagingComponent", clientId, roomId);
    }, []);

    const setupWebSocketConnection = (clientId: string, onMessage?: (message: any) => void) => {
        // WebSocket configuration (similar to remote_chat_screen.html)
        // https:   //   localhost:22081
        const defaultWsUrl = `${AppConfig.wssBaseUrl}/api/v1/chat/ws`;
        console.log("defaultWsUrl", defaultWsUrl);
        
        
    
        
        // Create WebSocket connection
        const websocket = new WebSocket(`${defaultWsUrl}/${roomId}/${clientId}`);
        
        // Add a flag to track if we should ignore close events due to manual closure
        let manuallyClosing = false;
        
        websocket.onopen = function(event) {
            console.log("WebSocket connection opened:", event);
        };
    
        websocket.onmessage = function(event) {
            let data = JSON.parse(event.data);
            console.log("WebSocket message received:", data);

            // Check if data has kind field, if not return immediately
            if (!data.hasOwnProperty("kind")) {
                return;
            }

            if (data["kind"] === "heartbeat") {
                return;
            }
            
            if (onMessage) {
                onMessage(data);
            }
            // Emit message as output event
            // 
            

            // Print received messages to console (no UI needed)
            // if (data.clientId && data.message !== undefined) {
            //     const clientIdDisplay = data["clientId"].substring(0, 8);
            //     const timestamp = data["timestamp"] ? data["timestamp"] : 'N/A';
            //     console.log(`[${timestamp}] ${clientIdDisplay}: ${data.message}`);
            // }
        };
    
        websocket.onclose = function(event) {
            if (!manuallyClosing) {
            console.log("WebSocket connection closed:", event);
            if (event.wasClean) {
                console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
            } else {
                console.error("Connection died unexpectedly");
            }
            }
        };
    
        websocket.onerror = function(error) {
            if (!manuallyClosing) {
            console.error("WebSocket error:", error);
            }
        };
        
        // Override the close method to set the flag
        const originalClose = websocket.close.bind(websocket);
        websocket.close = function(...args) {
            manuallyClosing = true;
            originalClose(...args);
        };
        
        return websocket;
        };
    
    
    useEffect(() => {
        const websocket = setupWebSocketConnection(clientId, onMessage);
        return () => {
            websocket.close();
        }
    }, [clientId, onMessage]);
    return null;
}

export default WebSocketMessagingComponent;