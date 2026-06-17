package com.flora.api.enums.alert;

public enum DevicePlatform {
    ANDROID("Android"),
    IOS("iOS");

    private final String displayName;

    DevicePlatform(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
