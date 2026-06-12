package com.flora.api.enums.animal;

public enum AnimalGender {
    MALE("Male"),
    FEMALE("Female");

    private final String displayName;

    AnimalGender(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
