package com.calendar.todo_service;

import lombok.Data;

@Data
public class Todo {
    private String id;
    private String userId;
    private String text;
    private boolean completed;
}
