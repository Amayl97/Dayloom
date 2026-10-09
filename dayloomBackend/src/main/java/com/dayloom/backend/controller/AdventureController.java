package com.dayloom.backend.controller;

import com.dayloom.backend.dto.AdventureResponse;
import com.dayloom.backend.service.AdventureService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/adventure")
public class AdventureController {
    private final AdventureService adventureService;

    public AdventureController(AdventureService adventureService){
        this.adventureService = adventureService;
    }

    @PostMapping
    public AdventureResponse generateAdventure(){
        return adventureService.generateAdventure();
    }
}