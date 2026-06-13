package com.flora.api.enums.animal;

public enum VaccinationStatus {

    PENDING("Pending"),
    DUE_SOON("Due Soon"),
    OVERDUE("Overdue"),
    COMPLETED("Completed");

    private final String displayName;

    VaccinationStatus(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
