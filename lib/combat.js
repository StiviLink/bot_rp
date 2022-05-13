const mysql = require('mysql');
const fs = require("fs");

module.exports = function (){
    this.Impact = function(joueur, energieUtilisée, EN, FO){
        EN = 500/EN;
        if(FO>=0 && FO < 10){
            FO = (FO * 15)/9;
        }else if (FO>=10 && FO < 50){
            FO = (FO * 60)/49;
        }else if(FO >= 50 && FO <= 100){
            FO = FO;
        };
        let grosImpact = Math.trunc(FO);
        let grosEnergie = Math.trunc(EN);
        let impact = (grosImpact * energieUtilisée)/grosEnergie;
        let resultat = `*L'impact de l'attaque de ${joueur} ayant utilisé ${energieUtilisée}PE est de -${Math.trunc(impact)}PH*`;
        if(energieUtilisée > grosEnergie){
            resultat = `*${joueur} ne peut pas aller au délà de ${grosEnergie}PE par attaque*`
        }
        return resultat;
    }
    this.ImpactElement = function(joueur, energieUtilisée, EN, FO){
        EN = 500/EN;
        if(FO>=0 && FO < 10){
            FO = (FO * 15)/9;
        }else if (FO>=10 && FO < 50){
            FO = (FO * 60)/49;
        }else if(FO >= 50 && FO <= 100){
            FO = FO;
        };
        let grosImpact = Math.trunc(FO);
        let grosEnergie = Math.trunc(EN);
        let impact = 2*(grosImpact * energieUtilisée)/grosEnergie;
        let resultat = `*L'impact de l'attaque élémentaire de ${joueur} ayant utilisé ${energieUtilisée}PE est de -${Math.trunc(impact)}PH*`;
        if(energieUtilisée > 2*grosEnergie){
            resultat = `*${joueur} ne peut pas aller au délà de ${2*grosEnergie}PE par attaque élémentaire*`
        }
        return resultat;
    }
    this.ImpactItem = function(joueur, energieUtilisée, EN, grosImpact){
        EN = 500/EN;
        let grosEnergie = Math.trunc(EN);
        let impact = (grosImpact * energieUtilisée)/grosEnergie;
        let resultat = `*L'impact de l'attaque avec arme de ${joueur} ayant utilisé ${energieUtilisée}PE est de -${Math.trunc(impact)}PH*`;
        if(energieUtilisée > grosEnergie){
            resultat = `*${joueur} ne peut pas aller au délà de ${grosEnergie}PE par attaque élémentaire*`
        }
        return resultat;
    }
}