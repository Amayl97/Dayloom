package com.dayloom.backend.dto;

import java.util.List;

public record AdventureResponse(
    List<String> tasks,
    String message
){

}