package com.morphologie.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

/**
 * MongoDB Configuration
 */
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {
    
    @Override
    protected String getDatabaseName() {
        return "MorphoSE";
    }
    
    @Override
    protected boolean autoIndexCreation() {
        return true;  // Automatically create indexes
    }
}