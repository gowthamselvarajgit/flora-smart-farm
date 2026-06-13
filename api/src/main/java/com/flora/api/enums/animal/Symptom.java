package com.flora.api.enums.animal;

public enum Symptom {

    //General
    FEVER("Fever"),
    LETHARGY("Lethargy"),
    LOSS_OF_APPETITE("Loss of Appetite"),
    WEIGHT_LOSS("Weight Loss"),
    DEHYDRATION("Dehydration"),

    // Respiratory
    COUGHING("Coughing"),
    NASAL_DISCHARGE("Nasal Discharge"),
    RAPID_BREATHING("Rapid Breathing"),

    //Digestive
    DIARRHOEA("Diarrhoea"),
    BLOATING("Bloating"),
    VOMITING("Vomiting"),

    //Physical
    LIMPING("Limping"),
    SKIN_LESIONS("Skin Lesions"),
    SWOLLEN_JOINTS("Swollen Joints"),
    HAIR_LOSS("Hair Loss"),

    //Reproductive
    REDUCED_MILK("Reduced Milk Production"),
    SWOLLEN_UDDER("Swollen Udder"),
    ABNORMAL_DISCHARGE("Abnormal Discharge"),

    //Behavioural
    AGGRESSION("Aggression"),
    ISOLATION("Isolation from Herd"),
    RESTLESSNESS("Restlessness");

    private final String displayName;

    Symptom(String displayName){
        this.displayName = displayName;
    }

    public String getDisplayName(){
        return displayName;
    }
}
