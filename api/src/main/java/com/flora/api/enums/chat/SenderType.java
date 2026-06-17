package com.flora.api.enums.chat;

public enum SenderType {

    FARMER("Farmer"),
    EXPERT("Expert");

    private final String displayName;

    SenderType(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
