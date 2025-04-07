export default class Translate {

    constructor(){}

    getTypeTranslation (type) {
        switch (type) {
            case "name":
                return "nom"
            case "gender":
                return "sexe"
            case "age":
                return "âge"
            case "class":
                return "classe"
            case "embarked":
                return "embarquement"
            case "country":
                return "pays"
            case "ticketno":
                return "no. ticket"
            case "fare":
                return "prix du billet"
            case "sibsp":
                return "époux(se)/frères/soeurs"
            case "parch":
                return "parent/enfant"
            case "survived":
                return "survécu"
            default:
                return type
        } 
    }

    getTranslation (demographicVar, varToTranslate) {
        switch (demographicVar) {
            case "class":
                return this.getClass(varToTranslate)
            case "gender":
                return this.getGender(varToTranslate)
            case "survived":
                return this.getSurvival(varToTranslate)
            default:
                return varToTranslate
        } 
    }

    getClass(passengerClass) {
        switch (passengerClass) {
            case "3rd":
                return "3ième"
            case "2nd":
                return "2ième"
            case "1st":
                return "1ère"
            case "engineering crew":
                return "ingénieurs"
            case "victualling crew":
                return "ravitaillement"
            case "restaurant staff":
                return "cuisine"
            default:
                return passengerClass
        }  
    }

    getGender(passengerGender) {
        switch (passengerGender) {
            case "male":
                return "homme"
            case "female":
                return "femme"
            default:
                return passengerGender
        } 
    }
    
    getSurvival(passengerSurvival) {
        console.log(passengerSurvival)
        switch (passengerSurvival) {
            
            case "yes":
                return "oui"
            case "no":
                return "non"
            default:
                return passengerSurvival
        } 
    }
}



