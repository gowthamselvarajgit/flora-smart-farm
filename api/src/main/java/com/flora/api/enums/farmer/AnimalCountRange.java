package com.flora.api.enums.farmer;

public enum AnimalCountRange {
    ONE_TO_FIVE("1 - 5"),
    FIVE_TO_FIFTEEN("5 - 15"),
    FIFTEEN_TO_THIRTY("15 - 30"),
    ABOVE_THIRTY("30+");

    private final String displayName;
    AnimalCountRange(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
