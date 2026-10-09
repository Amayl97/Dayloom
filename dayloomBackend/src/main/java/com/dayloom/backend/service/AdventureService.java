package com.dayloom.backend.service;

import com.dayloom.backend.dto.AdventureResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdventureService {
    public AdventureResponse generateAdventure(){
        List<String> tasks = List.of(
                "Take a 15-minute walk outdoors",
                "Draw something you can see around you",
                "Make a snack you have never tried before",
                "Write a short note to someone you appreciate"
        );
        String message =
                "Let today surprise you beyond the screen.";
        return new AdventureResponse(tasks, message);
    }
}