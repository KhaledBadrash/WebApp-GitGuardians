package com.calendar.event_service;

import graphql.scalars.ExtendedScalars;
import graphql.schema.GraphQLScalarType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class DateTimeScalarConfiguration {

    // Bean definition for the custom DateTime scalar type used in GraphQL
    @Bean
    public GraphQLScalarType dateTimeScalar() {
        return ExtendedScalars.DateTime;
    }

    // Configures GraphQL to use the DateTime scalar type for handling date and time values
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(ExtendedScalars.DateTime);
    }
/*   
@Configuration
public static class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/graphql")
                            .allowedOrigins(
                                "http://localhost:5500",
                                "http://127.0.0.1:5500"
                            )
                            .allowedMethods("*")
                            .allowedHeaders("*")
                            .allowCredentials(true);
                            //.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD");
            }
        };
    }
}
    */ 

}
