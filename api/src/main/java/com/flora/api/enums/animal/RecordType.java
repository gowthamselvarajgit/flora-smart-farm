package com.flora.api.enums.animal;

public enum RecordType {

    MILK("Milk", "litres"),
    EGG("Egg", "count"),
    WEIGHT_YIELD("Weight Yield", "kg");

    private final String displayName;
    private final String unit;

    RecordType(String displayName, String unit){
        this.displayName = displayName;
        this.unit = unit;
    }

    public String getDisplayName(){
        return displayName;
    }

    public String getUnit(){
        return unit;
    }
}
