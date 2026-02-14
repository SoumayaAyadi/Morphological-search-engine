package com.morphologie.api.config;

import com.morphologie.engine.Morphologie;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Morphology Engine Bean Configuration
 * Crée une instance singleton de l’engine
 */
@Configuration
public class EngineConfig {

    @Bean
    public Morphologie morphologieEngine() {
        return new Morphologie();
    }
}
