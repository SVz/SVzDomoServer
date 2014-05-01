import os

from flask import Flask, render_template, request, jsonify
from flask.ext.basicauth import BasicAuth
from flask import abort, redirect, url_for
from crontab import CronTab

app = Flask(__name__)

pathexe = "/home/pi/git/SVzDomoServer/"

app.config['BASIC_AUTH_USERNAME'] = 'SVz'
app.config['BASIC_AUTH_PASSWORD'] = '1000enes'
#app.config['BASIC_AUTH_FORCE'] = True
basic_auth = BasicAuth(app)

pins = [
   {'name' : 'Lampe Rue', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '0','image' : 'baie.jpg'},
   {'name' : 'Lampe Tele', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '4','image' : 'tele.jpg'},
   {'name' : 'Lampe Plafond', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '1','image' : 'plafond.jpg'},
   {'name' : 'Volet Rue', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '2','image' : 'volet.jpg'},
   {'name' : 'Volet Jardin', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '5','image' : 'voletjardin.jpg'},
   {'name' : 'XBMC', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '3','image' : 'XBMC.jpg'}
   ]

def cron(): 
  return CronTab(user="pi")

def makeComment(lamp, action, time):
  return lamp+":"+action+":"+time

def parseJob(job):
  comments = job.comment.split(':')
  return {
  'time':str(comments[2]),
  'hour': str(job.hour),
  'minute': str(job.minute),
  'day': str(job.dom), 
  'index':str(comments[0]), 
  'action':str(comments[1]),
  'pic':str(pins[int(comments[0])]['image']),
  'activated': job.is_enabled()
  }

@app.route("/")
@basic_auth.required
def main():
   templateData = {
      'pins' : pins
       }
   return render_template('index.html', **templateData)

@app.route("/pins.json")
@basic_auth.required
def pinsData():
  templateData= {
    'pins': pins
  } 
  return jsonify(**templateData)

@app.route("/scheduler")
@basic_auth.required
def scheduler():
  crons = map(parseJob, cron())
  templateData = {
    'crons': crons
  }
  return jsonify(**templateData)


@app.route("/schedule")
@basic_auth.required
def schedule():
  time = request.args.get("cron")
  action = request.args.get("action")
  lamp = request.args.get("id")
  command = "curl --user SVz:1000enes http://127.0.0.1:8000/" + lamp+"/"+ action + " >/dev/null"
  cr = cron()
  job = cr.new(command=command, comment=makeComment(lamp, action, time))
  job.setall(time)
  cr.write()
  return "OK"

@app.route("/schedule/<actionJob>")
@basic_auth.required
def activate_deactivate(actionJob):
  time = request.args.get("cron")
  action = request.args.get("action")
  lamp = request.args.get("id")
  cr = cron()
  job = cr.find_comment(makeComment(lamp, action, time))[0]
  if actionJob == "activate" :
    job.enable()
  else :
    job.enable(False)
  cr.write()
  return redirect(url_for("scheduler"))

@app.route("/deschedule")
@basic_auth.required
def deschedule():
  lamp = request.args.get("id")
  action = request.args.get("action")
  time = request.args.get("cron")
  cr = cron()
  cr.remove_all(comment=makeComment(lamp, action, time))
  cr.write()
  return 'OK'

@app.route("/video")
@basic_auth.required
def video():
  return render_template('video.html')

@app.route("/video/<action>")
def videoStart(action):
  os.system("/home/pi/CamCapt.daemon "+action)
  return redirect(url_for("video"))

@app.route("/<changePin>/<action>")
@basic_auth.required
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
