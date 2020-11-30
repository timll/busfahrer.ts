export enum errorMessage {
  short = 'Der Name ist zu kurz. Mindestens 3 Zeichen.',
  long = 'Der Name ist zu lang. Maximal 16 Zeichen.',
  nonexist = 'Die Lobby existiert nicht.',
  duplicate = 'Der Name ist schon vergeben. Bitte wähle einen anderen Namen.',
  full = 'Die Lobby ist schon voll.',
  kick = 'Du wurdest gekickt.',
  unknown = 'Unbekannter Fehler, sorry :/',
}

export default interface IErrorEvent {
  code: keyof typeof errorMessage;
}
