package com.flora.api.enums.chat;

public enum ChatCategory {

    CROP("Crop Advisory"),
    ANIMAL("Animal Health");

    private final String displayName;

    ChatCategory(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
