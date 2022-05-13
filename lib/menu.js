const mysql = require('mysql');
const fs = require("fs");
let config =({
    host: "localhost",
    user: "root",
    password: "",
    database : "bd_rp"
});
let db = mysql.createConnection(config);
db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});
let db1 = mysql.createConnection(config);
db1.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});

module.exports = function (contact){
    this.contact = contact;
    this.introductionArcadias = function (){
        let introduction = `*🏮 INTRODUCTION🏮*


🎀Les êtres vivants vont devoir faire face à une nouvelle réalité.🎀
      Des univers parallèles sont entrés en collision , faisant apparaître un nouvel  univers appelée *(🌐 ARCADIAS🌐 )* les différentes habitants de ces univers ont tous été téléportés vers ce nouvel univers .
      Ces habitants des univers parallèles vont se réunir et faire face à l'inconnu, un monde remplit de bêtes magiques,esprits, monstres,villages,...et autres. Dans cet univers où la magie et pouvoir font surface découvrez votre vrai vous .

*🕯️ À VOUS DE VOUS SURPASSER ET CRÉER VOTRE PROPRE HISTOIRE 🕯️*

Vos personnages et vos talents seront mis à l'épreuve, endurcissez vous, créez  et divertissez  vous.

*🏮🎐  BIENVENUE DANS ARCADIAS🎐🏮*`;
        return introduction;
    }
    this.helpFiche1 = function (){
        let help1 = `*📜 A SAVOIR POUR REMPLIR SA FICHE 📜*

🎐ÉQUIPEMENT : vous avez droit à un seul équipements  de votre choix dans cette liste pour un debut:
▪️épée 
▪️couteau
▪️arc 
▪️lance
▪️faux
🎐 Vous avez droit à 30 pts a départager dans les AFFINITÉS 
🎐 les compétences sont les techniques, et au début vous avez droit à 3 techniques passives en.fonction de l'équipement de départ choisi

*Nb: pour avoir une classe ou utilisé  la magie il faut être au niveau 5*`;
        return help1;
    }
    this.helpFiche2 = function (){
        let help2 = `*Remplissage de la fiche*

-commencez toujours par le nom et le prénom de votre héros

-son âge

-son sexe

 *Arme*
- pour l'arme, choisissez en une seule entre :
Épée 
Faux
Couteau 
Flèche 
Lance

 *Stats* 
Pour les stats, vous avez 30pts à repartir entre 

La force FO
L'endurance  EN
Le Mana. MA
L'agilité. AG
La sagesse SA
Vitesse  VI
Intelligence INT 

 *Conseil*  mieux vaut équilibré que tout miser sur une affinités 

 *Techniques de début* 

Pour les compétences de début vous en avez droit à trois

Elles doivent être cohérentes et humainement possibles
Vous n'avez pas accès à la magie dès le début alors dosez`;
        return help2;
    }
    this.newFiche = function (code){
        let fiche = `*Bien vouloir suivre la syntaxe ci après pour créer votre avatar(évitez d'utiliser une police bizarre! Enregistrez avec votre clavier normal, sans mise en forme :*

>${code} (Code de la dernière fiche enregistrée) *(Ne rien mettre là)*
>Nom et Prenom *(Je vous prie de remplacer Nom et Prenom par le nom et le prenom de votre avatar sans toucher au >)*
>Age *(Remplacer par l'âge de votre avatar : min 15)*
>Sexe(Masculin ou Féminin) *(Remplacer par le sexe de votre avatar)*
>@${this.contact}
>Arme *(Remplacer Arme par votre Arme)* 

*Stats (30 Pts à partager)* (Comme procédé plus haut, vous retirez les lettres et ne mettez que les nombres correspondant au point de chaque stat voulu)

>FO 
>EN
>AG
>IN
>VI
>MA
>SA

*Techniques (03 pour un début)* (Vous savez déjà quoi faire)

>Nom_Technique >Description
>Nom_Technique >Description
>Nom_Technique >Description`;
        return fiche;
    }
    this.listClass = function (){
        let list = `*🌐 LISTE DES ©️L🅰️SSES DIS🅿️🅾️NI🅱️LE🌐*
                
*---------------------------*
*💠 ARCHER* :  L'art des "archers" est celui des Rangers. Cet art il s'agit d'un art offensif constitué de compétences actives liées au maniement des arcs ainsi que de buffs personnels et autres sorts passifs très utiles pour renforcer l'efficacité de ceux-ci. On trouve également dans cet arbre des sorts de contrôle afin de bien garder à distance l'ennemi.
 _*ELEMENTS LIÉS*_ : Feu, Air
 _*TYPES DE TECHNIQUE*_ : Techniques de création de flèche, Techniques de boost de la portée, Techniques de boost de la précision        
*---------------------------*
*💠 GUERRIER* : L'art des "guerriers" est celui des combattants au corps à corps, que ce soit en mono ou en multi-cibles, cet arbre vous est indispensable ! Vous y retrouverez de nombreuses compétences et buffs améliorant les dégâts de corps à corps mais également du crowd contrôle avec le fameux "lasso". Enfin, certains boosts de vitesse d'attaque et anti crowd controls sont présents dans cet arbre.
 _*ELEMENTS LIÉS*_ : Terre, Foudre
 _*TYPES DE TECHNIQUE*_ : Techniques de boost de vitesse, Techniques de boost de force, Techniques de boost d'endurance, Techniques de boost de resistance, Techniques de création d'armes        
*---------------------------*
*💠 BERSEKER* : enragé,  le berserker attaque sans relâche l’ennemi. C’est un allier incontrôlable qui possède une force étonnante.
 _*ELEMENTS LIÉS*_ : Feu, Terre
 _*TYPES DE TECHNIQUE*_ : Techniques de boost(Toutes les affinités)        
*---------------------------*
*💠 MAGE* :L'art des "mages" est celui du magicien utilisant les éléments pour infliger un maximum de dommages à son adversaire. Boules de feu, pluie de glace et foudres sont autant de sorts à la disposition du mage pour décimer l'ennemi, qu'il soit en groupe ou seul. De puissants sorts passifs permettent d'améliorer encore d'avantage l’efficacité des sorts du mage.
 _*ELEMENTS LIÉS*_ : Tout élément existant
 _*TYPES DE TECHNIQUE*_ : Techniques de création(Global), Techniques de boost magique, Technique de soin        
*---------------------------*
*💠 DRESSEUR* : il dompte les monstres en cours de combat pour les utiliser contre ses adversaires.
 _*ELEMENTS LIÉS*_ : Eau, Feu, Terre
 _*TYPES DE TECHNIQUE*_ : Techniques d'invocation(des monstres capturés), Techniques de création de monstres        
*---------------------------*
*💠 ASSASSIN* :celui du voleur et de la furtivité. Arbre offensif mono-cible par excellence, le but est ici de faire le plus de dégâts possible en restant le plus discret possible. Des compétences actives maximisant les dégâts, des sorts pour se retrouver derrière son ennemi, furtivité et des buffs offensifs sont de la partie.
 _*ELEMENTS LIÉS*_ : Foudre, Air, Terre
 _*TYPES DE TECHNIQUE*_ : Techniques de clonage, Techniques de boost de vitesse, Techniques de création d'armes, Techniques de discrétion, Technique de recouvrement élémentaire        
*---------------------------*
*💠 SAINT(E)* :c’est un guerrier voué à son dieu. Il peut aussi lancer des sorts divins.
 _*ELEMENTS LIÉS*_ : Tout élément existant
 _*TYPES DE TECHNIQUE*_ : Techniques de création(Global), Techniques de boost(magique et de toutes les capacités), Techniques divines, Techniques de soin        
*---------------------------*
*💠 NECROMANCIEN* :L'art des "nécromancien" est celui de la magie noire. On y retrouve tous les sorts maléfiques causant de lourds infirmités aux adversaires ainsi que du vampirisme et de l'invocation d'esprit malefique. Les sorts passifs de cet arbre permettent d'améliorer le dégât critique des sorts du joueur. D'invoquer des mort et contrôler la mort.
 _*ELEMENTS LIÉS*_ : Feu, Terre
 _*TYPES DE TECHNIQUE*_ : Techniques d'invocation(morts de sa famille), Techniques de clonage, Techniques de création(création de zombies), Techniques d'envoûtement        
*---------------------------*
*💠 SORCIER* :L'art des "sorciers" est celui du débuff. Dès qu'il s'agit d'affaiblir l'adversaire, cet arbre est celui qui fait véritablement le mieux le travail. Roots, silences, sorts de neutralisation en tout genre sont au rendez-vous, mais surtout, une large panoplie de sorts offensifs sur la durée (Dot) qui feront de vous une épine dans le pied de votre adversaire.
 _*ELEMENTS LIÉS*_ : Eau, Air, Feu
 _*TYPES DE TECHNIQUE*_ : Techniques d'envoûtement, Techniques de création, Techniques de soin        
*---------------------------*

 _*NB* : on peut seulement obtenir une classe et dehors de ceux ci ils n'en existe plus d'autre sauf les sous classes._`;
        return list;
    }
    this.règlesCombat = function (){
        let règles = `  *💠 AFFINTÉS*
        
*---------------------------*
*🛐 INTELLIGENCE*

- Si <10, l'on ne peut anticiper les mouvements de l'adversaire
- Si >=10 et <30, l'on peut anticiper les mouvements d'un adversaire avec un niveau d'intelligence inférieur... Plus on le dépasse plus ses mouvements sont anticipables
- Si >=30 et <80, l'on peut prévoir les attaques adverses... Plus on le dépasse plus ses attaques sont prévisibles
- Si >=80 et <100, l'on peut voir le futur de l'adversaire et même influencer ses actions

*---------------------------*
*☸️ SAUT*

Il s'agit de la hauteur que peut prendre un avatar lors d'un saut!

*---------------------------*
*♉ PORTÉE*

Il s'agit de la portée des attaques, qui fait également office de préciosn! Donc booster ta portée signifierait booster ta précision et Vice-Versa.

*---------------------------*
*🌀 ACTIONS SIMULTANÉES*

En abrégé AS, elle correspond au nombre d'attaque réalisable par action et de façon simultanée! Sachant qu'un pavés n'a droit qu'à 03 actions, mais dans une action, un avatar peut réaliser même 10 attaques simultanées, tous dépend de son nombre d'AS.

*---------------------------*
*🕎 VITESSE*

Il s'agit de la vitesse maximale de l'avatar! Je tiens à rappeler que le fait de se déplacer en vitesse maximale sans technique de boost en combat retire 2PE par portée parcourue! 1PE s'il s'est déplacé en moins de 2/3 de sa vitesse maximale.

*---------------------------*
*☯️ ÉNERGIE CONSOMMÉE*

Il s'agit de la quantité d'énergie max que peut utiliser un avatar sans utilisation de son élément! Avec utilisation de son élément, il peut aller jusqu'à utiliser le double de son énergie normale.

*---------------------------*
*☸️ GROS IMPACT*

Il s'agit des dégâts causés par l'attaque maximale d'un avatar sans utilisation d'un élément! En cas d'utilisation d'un élément, il vaut le double.

*---------------------------*
*⚛️ RESISTANCE*

Il s'agit de la resistance d'un avatar à une attaque, il reduit l'impact des dégâts recus. Si la resistance est > à l'impact des dégâts, le coup n'aura aucun effet sur l'avatar! 

*---------------------------*


    *💠 PRINCIPE DES DÉGÂTS*
        
*---------------------------*
*Resistance > Impact* : _Aucun dégât reçu_
*Impact - Resistance < 10* : _Dégât minime sans blessure_
*Impact - Resistance > 10 et <20* : _Dégât avec blessure pas profonde retirant 3PH chaque tour_
*Impact - Resistance > 20 et <30* : _Dégât avec blessure peu profonde retirant 7PH chaque tour_
*Impact - Resistance > 30 et <50* : _Dégât avec blessure profonde ou coupure d'un membre comme le doigt, la main ou le pied retirant 15PH chaque tour_
*Impact - Resistance > 50 et <70* : _Dégât avec blessure très profonde ou coupure d'un membre du corps comme le cou ou même couper le corps en 02 retirant 30PH chaque tour_
*Impact - Resistance > 70 et <=100* : _Dégât avec blessure très très profonde ou déchiquettement du corps de l'avatar causant sa mort directe_
`;
        return règles;
    }
    this.menuBot = function (){
        let menu = `*♨️@${this.contact} Bienvenue au MENU ARCADIAS♨️*
        
*---------------------------*
 
 *->introduction_arcadias* : Pour connaître l'origine d'ARCADIAS
 
 *->story_arcadias* : Pour connaitre l'histoire globale d'Arcadias
 
 *->help_fiche1* : Comment remplir sa fiche(1er volet)
 
 *->help_fiche2* : Comment remplir sa fiche(2nd volet)
 
 *->new_fiche* : Pour obtenir la fiche à remplir pour créer son avatar
 
 *->pavé_training* : structure d'un pavé d'entrainement
 
 *->liste_classe* : Pour avoir la liste des classes disponibles
 
 *->règles_combat* : Pour avoir les règles relatives au combat ou à la survie dans le monde immersif
 
 *->liste_missions* : Pour consulter la liste des missions! Possible uniquement au Bar
 
 *->liste_training* : Pour entrer dans le mode entrainement! Possible uniquement dans des endroits appropriés
 
 *menu_boutique* : Utilisable que dans la boutique d'Arcadias
 
 *->carte me* : Permet à un aventurier déjà enregistré de consulter sa Carte d'Aventurier
 
 *->statut me* : Utilisable que dans le monde immersif, permet à un joueur de consulter son statut
 
 *->fiche me* : Utilisable qu'en Ib, permet de consulter sa fiche
 
 *>dep LIEU >dep Moyen de Déplacement >dep* : Syntaxe utilisée pour se déplacer dans le monde immersif
 
 *>item Nom de l'item comme ça apparait sur le statut >item Quantité d'item utilisée >item* : Syntaxe pour utiliser un item acheté à la boutique
 
 *-Achat >Nom de la catégorie(en MAJ) >Code du produit >Nom du produit >Qté du produit* : Syntaxe pour acheter un produit à la boutique
`
        return menu
    }
    this.testClass = function (){
        let test = `*🏮 TEST D'EVEIL🏮*

-BIENVENUE au test de *l'éveil élémentaire et de classe*!
Vous devez repondre à une série de 20 questions afin qu'on puisse déterminer votreclasse ainsi que votre élément
Soyez sincère avec des reponses concernant votre avatar! En cas de mensonge ou fraude, vous serez recalé.

*⁉️_QUESTIONS_ ⁉️*

0️⃣1️⃣ *Quel est ton nom?*
0️⃣2️⃣ *Quel est ton âge?*
0️⃣3️⃣ *Quelle est ta portée?*
0️⃣4️⃣ *Quelle affinité favorises-tu le plus?*
0️⃣5️⃣ *Quelle est ton arme de base*
0️⃣6️⃣ *Quel équipement utilises-tu le plus?*
0️⃣7️⃣ *Quel est ton style de combat favoris*
0️⃣8️⃣ *Quel est ton element de prédilection*
0️⃣9️⃣ *Crois-tu aux divinités?*
1️⃣0️⃣ *Que penses-tu de SKID et GEBRA*
1️⃣1️⃣ *Aimerais-tu être au service de SKID ou de GEBRA?*
1️⃣2️⃣ *As-tu un penchant pour la magie?*
1️⃣3️⃣ *As-tu un penchant pour la sorcellerie?*
1️⃣4️⃣ *As-tu un penchant pour le sang?*
1️⃣5️⃣ *Es-tu du genre prudent, impulsif ou furtif*
1️⃣6️⃣ *Préfères-tu la Force, la Vitesse ou l'Intelligence*
1️⃣7️⃣ *Aimerais-tu contrôler des morts?*
1️⃣8️⃣ *Aimerais-tu contrôler des monstres?*
1️⃣9️⃣ *Cite 03 classes que tu apprécies*
2️⃣0️⃣ *Cite 02 elements que tu apprécies*

_BONNE CHANCE_`;
        return test;
    }
    this.img = function(image){
        let dir = './images/'+image+'.jpg';
        return dir;
    }
    this.storyArcadias = function (){
        return `〰️〰️〰️〰️〰️〰️〰️〰️                      
   *〽️ ARCADIAS STORY 〽*️
〰️〰️〰️〰️〰️〰️〰️〰️

➖➖➖➖➖➖➖➖
Il y'a de celà très longtemps bien avant la création des univers  existais un Dieu tous puissant . Celui ci après  des milliers d'année créa des anges pour l'accompagner.  Mais après  des milliers d'année passèrent et notre seigneur créé des univers avec des hommes des femmes des animaux et autres être vivant (plantes et autres),puis après  un certains temps des anges ont commencées à ce rebeller et parmi ces rebelles le chefs était  le tous premier ange que Dieu créa.  Ceux ci furent puni et devinrent des démons( *anges déchus* ) et ont les envoya dans les profondeurs de l'abîme un lieu sans lumière ou les ténèbres régnaient.
Après sa Dieu noma des anges qui était  plus que fort ,des demi dieu pour protéger les univers et les être qui y vivent.  Ceci fut la naissance de *GEBRA ET DE SKID*.
Comme autre demi dieux il y'avait  *ALINÉA* ,GIN,ARIEL,CODES ET SKAY.*
Après cette avènement vient le début de l'évolution dans différents univers.
Après un milliers d'année les demi dieux on commencé à se disputer les univers à surveiller  c'est ainsi qu'est née la *guerre D'OTRUX* ou *guerre du pouvoir* .
Cette guerre créa  beaucoup d'impact  sur les univers et ses différentes planètes. Pour mettre fin à ce Chaos et pour cesser toutes distorsions et désordre lié à leur affrontement ces demi dieux décidèrent de créé un accord. *GEBRA* connue pour être la plus sage et la plus puissante  favorisée par *DIEU*  proposa une entente. Ce fût la création  de *《 DESGON 》* :le *pacte des demi dieux*. 
Pour récompenser leur décisions et leur prise de conscience *DIEU* leur donna une puissance  encore plus élevée et ceux ci devinrent des *dieux.*
Le pacte de *《 DESGON 》* est un pacte qui implique la création d'une immense planète( collision des univers parallèle ) qui regroupera tous les meilleures planètes de chaque  univers,comme  l'univers 4: *(ORION)* :il existe au total plus de 15 univers .
Après ces sélections, vît la naissance  de la planète *ARCADIAS*. Et dans cette planète tous les dieux auront la mm autorité céleste.
Des années passèrent et beaucoup de races évoluaient ;la création des pays dinastie royaume et autre virent le jour, éparpillés ds les 4 parties du globe.
Le dieu demon *Mephistoseleph* jaloux  ne laissa pas passer sa et décida de détruire les humain et gouverner *ARCADIAS* . Les dieux ont alors riposté et grace à leur puissance ont renvoyé le dieu demon aux enfers et nos dieux prirent possession du *TARTARE* (première porte des enfers où les morts arrivent  avant d'être jugés ) . 
Suite à cette guerre certains dieux ont perdu de leur puissance et décidèrent d'aller dormir pour récupérer . Donc *ARCADIAS* est resté entre les mains de *GEBRA ET DE SKID*.
Après que des centaines d'année passèrent  les dieux restant ont aperçu des brèches du monde des démons ouvert dans *ARCADIAS*. N'étant pas prête à affronter le dieu demon une nouvelle fois ;la déesse GEBRA dans sa   sagesse  trouva une solution . Elle alla dans l'univers 4 *" ORION "* et sélectionna des humains sur la planète *TERRE* (dernière civilisation assez evoluer)  pour accomplir leur souhait celui de faire face au demon dans un avenir proche. Et pour ça, après Leur arrivée à *ARCADIAS*, ils passèrent le test du dieu SKID pour connaître leur niveau et leur permettre d'évoluer dans ce Monde enfin de le protéger.
Ceci lança le début de l'histoire de nos chers aventuriers de la terre.

➖➖➖➖➖➖➖➖`;
    }
}