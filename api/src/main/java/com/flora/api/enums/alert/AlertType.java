package com.flora.api.enums.alert;

public enum AlertType {

    DISEASE("Disease Risk"),
    IRRIGATION("Irrigation"),
    PRICE("Market Price"),
    WEATHER("Weather"),
    VACCINATION("Vaccination"),
    MILK_DROP("Production Drop");

    private final String displayName;

    AlertType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}