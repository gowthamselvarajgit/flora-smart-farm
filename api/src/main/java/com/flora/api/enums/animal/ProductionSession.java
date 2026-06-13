package com.flora.api.enums.animal;

public enum ProductionSession {

    MORNING("Morning"),
    EVENING("Evening"),
    HARVEST("Harvest");

    private final String displayName;

    ProductionSession(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
