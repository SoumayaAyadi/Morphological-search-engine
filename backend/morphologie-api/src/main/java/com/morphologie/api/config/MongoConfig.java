package com.morphologie.api.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 * MongoDB Configuration
 * Crée MongoClient et MongoTemplate pour injection dans les services et repositories
 */
@Configuration
public class MongoConfig {

    // URI MongoDB Atlas
    private static final String MONGO_URI = "mongodb+srv://soumayaayadi40_db_user:ZIw6wHvU0T9vEXEU@cluster0.zxgdozh.mongodb.net/MorphoSE";

    // Nom de la base
    private static final String DATABASE_NAME = "MorphoSE";

    // Bean MongoClient
    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create(MONGO_URI);
    }

    // Bean MongoTemplate pour injection dans les services/repositories
    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(mongoClient, DATABASE_NAME);
    }
}
