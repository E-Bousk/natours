// On crée donc une fonction qui va envelopper ces fonctions asynchrones
// (pour 'catcher' les erreurs asynchrones)
// Cette fonction est asynchrone du fait de recevoir une fonction asynchrone
// et va donc retourner une promesse qui sera rejetée si il y a une erreur
// ==> on peut donc 'catcher' cette erreur (« .catch(err) »)
module.exports = fn => {
  // On fait en sorte que la fonction « catchAsync » retourne une autre fonction
  // qui sera assignée à « createTour » (dans cet exemple) pour que « createTour » soit appelé plus tard, quand ce sera nécessaire
  // on retourne donc une fonction anonyme qu'Express va alors appeler
  // C'est alors ici que l'on spécifie REQuest, RESponse et NEXT
  return (req, res, next) => {
    // On y passe une fonction « fn ».
    // On appelle cette fonction ici (elle reçoit "req", "res", et "next")
    // (Note: On ajoute "next" pour passer notre erreur dedans
    // pour que le middleware de gestion d'errreur puisse la gérer).
    // On 'catch' donc l'erreur ici au lieu du bloc 'try/cacth'
    // fn(req, res, next).catch(err => next(err));
    // simplifié :
    fn(req, res, next).catch(next);
  };
};
