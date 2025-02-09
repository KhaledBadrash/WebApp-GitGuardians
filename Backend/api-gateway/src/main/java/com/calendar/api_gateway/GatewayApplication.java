package com.calendar.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@SpringBootApplication // Marks this class as a Spring Boot application
public class GatewayApplication {
    public static void main(String[] args) {
        // Starts the Spring Boot application
        SpringApplication.run(GatewayApplication.class, args);
    }

    /**
     * Configures the API Gateway routes using Spring Cloud Gateway.
     * Each route maps incoming requests to the corresponding microservice.
     */
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Route for GraphQL requests, forwarding "/graphql" requests to event-service
            .route("event-service-graphql", r -> r.path("/graphql")
                .uri("http://localhost:8081"))
            // Route for event-related API requests
            .route("event-service", r -> r.path("/api/events/**")
                .uri("http://localhost:8081"))
            // Route for user-related API requests
            .route("user-service", r -> r.path("/api/users/**")
                .uri("http://localhost:8082"))
            // Route for to-do-related API requests
            .route("todo-service", r -> r.path("/api/todos/**")
                .uri("http://localhost:8083"))
            // Route for category-related API requests
            .route("Category", r -> r.path("/api/categories/**")
                .uri("http://localhost:8084"))
            .build();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) settings to allow frontend applications
     * to interact with the API Gateway without being blocked by the browser's security policies.
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // Allow requests from specific frontend origins
        config.addAllowedOrigin("http://localhost:5500");
        config.addAllowedOrigin("http://127.0.0.1:5500");
        // Allow all headers in requests
        config.addAllowedHeader("*");
        // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        config.addAllowedMethod("*");
        // Allow sending credentials (e.g., cookies, authorization headers)
        config.setAllowCredentials(true);
    
        // Apply CORS configuration to all routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
    
        // Return a filter that applies these CORS settings
        return new CorsWebFilter(source);
    }
}
