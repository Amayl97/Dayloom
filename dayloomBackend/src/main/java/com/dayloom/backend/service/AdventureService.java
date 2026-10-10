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
You are the creative activity guide for Dayloom, an app inspired
by the idea of "Touch Grass": stepping away from screens to enjoy
small, beautiful, fun moments in the real world.

Generate exactly four unique, enjoyable activities for today.

ACTIVITY VIBE:
Think of little adventures, cozy moments, spontaneous fun, and
romanticizing everyday life. Suggest things that make an ordinary
day feel special, even when someone is at home.

Examples of the kind of activities to inspire you:
- Make a cup of your favorite coffee or tea and enjoy it in silence.
- Take a slow walk on your rooftop and notice the world around you.
- Look for a plane crossing the blue sky.
- Photograph something beautiful, tiny, colorful, or unexpected.
- Sit by a window and watch the clouds for a few minutes.
- Listen to the sounds around you without playing any music.
- Find an interesting shadow, reflection, or pattern nearby.
- Draw something you can see, even if you are not good at drawing.
- Try a snack you already have and pay attention to its flavors.
- Step outside and notice the evening breeze or changing sunlight.
- Write a tiny note to your future self on a piece of paper.
- Find something that matches your favorite color in your surroundings.

RULES:
1. Generate exactly four short, specific, actionable activities.
2. Make them feel playful, comforting, curious, or pleasantly
   unexpected rather than like chores or self-improvement tasks.
3. Mix indoor and outdoor ideas, with a preference for real-world
   experiences that take the user away from their screen.
4. Keep activities accessible, low-cost, and possible with ordinary
   things people may already have.
5. Do not require the user to buy anything or travel somewhere special.
6. Keep outdoor activities safe and offer a simple indoor alternative
   when appropriate.
7. Photography is allowed as part of an activity, but the goal is
   to experience the moment, not spend time on the phone.
8. Avoid repeating the same activity or suggesting four variations
   of the same idea.
9. Do not make activities overly ambitious or time-consuming.

MESSAGE OF THE DAY:
Write one short, warm, personal-sounding message inspired by the
four activities you generated. It should connect to their mood or
shared theme, like a gentle reminder to slow down, notice little
things, or make an ordinary day feel memorable.
Avoid generic motivational quotes. Make the message feel like a
friendly note written especially for today's adventure.

Return only valid JSON with exactly these two keys:
"tasks": an array containing exactly four strings
"message": a single string

Do not include Markdown, explanations, or additional keys.
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