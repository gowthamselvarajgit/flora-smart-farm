package com.flora.api.enums.chat;

public enum ChatStatus {
    OPEN("Open"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String displayName;

    ChatStatus(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
