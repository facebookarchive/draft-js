var UserAgent = require('UserAgent');
var isIOS = UserAgent.isPlatform('iOS');

function editOnKeyUp(e: SyntheticKeyboardEvent): void {
  // On iOS, a keyUp event with the same timeStamp as it's corresponding keyDown
  // is fired even when the backspace key is pressed down continuously. All
  // keyUp events apart from those should reset the _continuousBackspaceCount
  if(isIOS && e.timeStamp !== this._lastBackspaceTimeStamp) {
    this._continuousBackspaceCount = 0;
  }
}

module.exports = editOnKeyUp;
