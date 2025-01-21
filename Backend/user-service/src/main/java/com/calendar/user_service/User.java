package com.calendar.user_service;

import lombok.Data;

@Data
public class User {
    private String id;
    private String email;
    private String name;
    private String password;
}
