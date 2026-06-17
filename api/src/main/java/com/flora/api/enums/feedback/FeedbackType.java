package com.flora.api.enums.feedback;

public enum FeedbackType {

    PREDICTION("Prediction Feedback"),
    APP("App Feedback"),
    EXPERT("Expert Feedback");

    private final String displayName;

    FeedbackType(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
