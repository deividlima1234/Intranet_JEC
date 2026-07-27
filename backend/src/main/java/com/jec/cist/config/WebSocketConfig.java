package com.jec.cist.config;

import com.jec.cist.websocket.JuegoWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final JuegoWebSocketHandler juegoWebSocketHandler;

    public WebSocketConfig(JuegoWebSocketHandler juegoWebSocketHandler) {
        this.juegoWebSocketHandler = juegoWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(juegoWebSocketHandler, "/ws-juegos")
                .setAllowedOriginPatterns("*"); // Allow all origins for local LAN / domain deployments
    }
}
