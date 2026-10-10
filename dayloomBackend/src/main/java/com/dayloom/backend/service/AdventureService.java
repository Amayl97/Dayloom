package com.dayloom.backend.service;

import com.dayloom.backend.dto.AdventureResponse;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.util.List;
import java.util.Map;

@Service
public class AdventureService {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();


    public AdventureResponse generateAdventure(){
        String prompt = """
        Generate exactly four short, safe, screen-free activities
        for someone using Dayloom.
        Also generate one warm motivational message encouraging
        the user to enjoy the real world.
        Return only JSON with two keys:
        "tasks" (an array of exactly four strings)
        and "message" (a string).
        """;

        Map<String, Object> requestBody = Map.of(
                "model","gemma3:4b",
                "messages",List.of(
                        Map.of(
                                "role","user",
                                "content",prompt
                        )
                ),
                "stream",false,
                "format","json"
        );


       try{
           String jsonBody = objectMapper.writeValueAsString(requestBody);
           HttpRequest request = HttpRequest.newBuilder()
                   .uri(URI.create("http://localhost:11434/api/chat"))
                   .header("content-type", "application/json")
                   .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                   .build();

           HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

           System.out.println(response.statusCode());
           System.out.println(response.body());

           JsonNode root = objectMapper.readTree(response.body());
           String generatedContent = root.path("message").path("content").asText();
           if (generatedContent == null || generatedContent.isBlank()) {
               throw new IllegalStateException(
                       "Ollama returned empty AI content"
               );
           }
           AdventureResponse result = objectMapper.readValue(
                   generatedContent, AdventureResponse.class
           );

           if (result.tasks() == null || result.tasks().size() != 4) {
               throw new IllegalStateException(
                       "AI must return exactly four activities"
               );
           }
           if (result.message() == null || result.message().isBlank()) {
               throw new IllegalStateException(
                       "AI must return a non-empty motivational message"
               );
           }
           return result;
       }
       catch (IOException | InterruptedException e){
           throw new RuntimeException("Failed to communicate with Ollama", e);
       }
    }
}