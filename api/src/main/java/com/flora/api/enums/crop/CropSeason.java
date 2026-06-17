package com.flora.api.enums.crop;

public enum CropSeason {

    KHARIF("Kharif", "June - November"),
    RABI("Rabi", "November - April"),
    ZAID("Zaid", "April – June"),
    PERENNIAL("Perennial", "Year-round");

    private final String displayName;
    private final String period;

    CropSeason (String displayName, String period) {
        this.displayName = displayName;
        this.period = period;
    }

    public String getDisplayName(){
        return displayName;
    }

    public String getPeriod(){
        return period;
    }
}
