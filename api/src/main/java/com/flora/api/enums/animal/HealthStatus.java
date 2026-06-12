package com.flora.api.enums.animal;

public enum HealthStatus {
    HEALTHY("Healthy"),
    SICK("Sick"),
    RECOVERING("Recovering"),
    CRITICAL("Critical"),
    DECEASED("Deceased");

    private final String displayName;

    HealthStatus(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
