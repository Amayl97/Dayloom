package com.dayloom.backend.dto;

import java.util.List;
import java.util.Map;

public record AdventureResponse(
    List<String> tasks,
    String message
){

}