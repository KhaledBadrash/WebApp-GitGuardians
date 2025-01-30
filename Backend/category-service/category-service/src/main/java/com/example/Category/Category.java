package com.example.Category;

public class Category {
    private int id;         
    private String name;       
    private String color;      
    private int userId;     

    public Category(int id, String name, String color, int userId) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.userId = userId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}
