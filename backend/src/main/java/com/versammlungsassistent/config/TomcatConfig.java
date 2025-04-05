package com.versammlungsassistent.config;

import java.net.InetAddress;
import java.net.UnknownHostException;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.setPort(5000); // Set the port programmatically
        try {
            factory.setAddress(InetAddress.getByName("0.0.0.0")); // Bind to all network interfaces
        } catch (UnknownHostException e) {
            throw new RuntimeException("Invalid address", e);
        }
        factory.setContextPath(""); // Ensure the context path starts with '/' and does not end with '/'
    }
}
