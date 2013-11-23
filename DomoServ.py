import os

from flask import Flask, render_template, request
from flask.ext.basicauth import BasicAuth

app = Flask(__name__)

pathexe = "/home/pi/git/SVzDomoServer/"

app.config['BASIC_AUTH_USERNAME'] = 'SVz'
app.config['BASIC_AUTH_PASSWORD'] = '1000enes'
app.config['BASIC_AUTH_FORCE'] = True
basic_auth = BasicAuth(app)

pins = {
   1 : {'name' : 'Lampe Baie', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '0','image' : 'baie.jpg'},
   2 : {'name' : 'Lampe Tele', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '1','image' : 'tele.jpg'},
   3 : {'name' : 'Volet Rue', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '2','image' : 'volet.jpg'},
   4 : {'name' : 'XBMC', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '3','image' : 'XBMC.jpg'}
   }

@app.route("/")
@basic_auth.required
def main():

   templateData = {
      'pins' : pins
       }
   return render_template('main.html', **templateData) 

@app.route("/<changePin>/<action>")
def action(changePin, action):
   changePin = int(changePin)
   deviceName = pins[changePin]['name']
   Ecode = pins[changePin]['Ecode']
   Rcode = pins[changePin]['Rcode']

   if action == "on":
      command = "radioEmission 6 " + Ecode + " " + Rcode + " on"
      os.system(pathexe + command)
      message = "Changement du status de : " + deviceName + " on."
      pins[changePin]['state'] = 'on'

   if action == "off":
      command = "radioEmission 6 " + Ecode + " " + Rcode + " off"
      os.system(pathexe + command)
      message = "Changement du status de : " + deviceName + " off."
      pins[changePin]['state'] = 'off'

   if action == "toggle":
      if pins[changePin]['state'] == 'on':
          command = "radioEmission 6 " + Ecode + " " + Rcode + " off"
          pins[changePin]['state'] = 'off'
      else :
          command = "radioEmission 6 " + Ecode + " " + Rcode + " on"
          pins[changePin]['state'] = 'on'
      os.system(pathexe + command)
      message = "Permutter : " + deviceName + "."

   templateData = {
      'message' : message,
      'pins' : pins
   }
   return render_template('main.html', **templateData)

if __name__ == "__main__":
   app.run(host='0.0.0.0', port=8000, debug=True)

