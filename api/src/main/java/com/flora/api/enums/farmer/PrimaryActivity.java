package com.flora.api.enums.farmer;

public enum PrimaryActivity {
    CROP("Crop Farming"),
    ANIMAL("Animal Husbandry"),
    BOTH("Crop Farming & Animals");

    private final String displayName;

    PrimaryActivity(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
