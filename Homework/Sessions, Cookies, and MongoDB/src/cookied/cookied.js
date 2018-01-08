const uuid = require('node-uuid');
const sessionStore = {};
// manageSession and parseCookies
function parseCookies(req, res, next){
    req.hwCookies = {};
    const cookieHeader = req.get("cookie");
    if (cookieHeader !== undefined){
      cookieHeader.split("&").forEach(function(cookie){
        const pair = cookie.split("=");
        req.hwCookies[pair[0]] = pair[1];
      });
    }

    next();
}



function manageSession(req, res, next){
  let sessionId = req.hwCookies.sessionId;
  req.hwSession = {};
  if (sessionId !== undefined && sessionStore.hasOwnProperty(sessionId)){ //this sessionId exists
    console.log("session already exists: " + sessionId);
    req.hwSession = sessionStore[sessionId];
    req.hwSession.sessionId = sessionId;
  } else {
    sessionId = uuid.v4();
    sessionStore[sessionId] = {};
    res.append("Set-Cookie", "sessionId=" + sessionId + "; HttpOnly");
    console.log("session generated: " + sessionId);
  }
  req.hwSession.sessionId = sessionId;
  next();
}

module.exports = {
  parseCookies: parseCookies,
  manageSession: manageSession
};
