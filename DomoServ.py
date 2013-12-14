import os

from flask import Flask, render_template, request
from flask.ext.basicauth import BasicAuth
from flask import abort, redirect, url_for
from crontab import CronTab

app = Flask(__name__)

pathexe = "/home/pi/git/SVzDomoServer/"

app.config['BASIC_AUTH_USERNAME'] = 'SVz'
app.config['BASIC_AUTH_PASSWORD'] = '1000enes'
app.config['BASIC_AUTH_FORCE'] = True
basic_auth = BasicAuth(app)

pins = {
   1 : {'name' : 'Lampe Rue', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '0','image' : 'baie.jpg'},
   2 : {'name' : 'Lampe Tele', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '1','image' : 'tele.jpg'},
   3 : {'name' : 'Volet Rue', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '2','image' : 'volet.jpg'},
   4 : {'name' : 'XBMC', 'state' : 'off', 'Ecode' : '9818818', 'Rcode' : '3','image' : 'XBMC.jpg'}
   }

cron = CronTab(user="pi")

def makeComment(lamp, action, time):
  return lamp+":"+action+":"+time

def parseJob(job):
  comments = job.comment.split(':')
  return {
  'time':str(comments[2]), 
  'id':str(comments[0]), 
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
   return render_template('photo.html', **templateData) 

@app.route("/scheduler")
def scheduler():
  crons = map(parseJob, cron)
  templateData = {
    'crons': crons,
    'pins' : pins
  }
  return render_template("scheduler.html", **templateData)


@app.route("/schedule")
def schedule():
  time = request.args.get("cron")
  action = request.args.get("action")
  lamp = request.args.get("id")
  command = "curl --user SVz:1000ene http://127.0.0.1:8000/" + lamp+"/"+ action + " >/dev/null"
  job = cron.new(command=command, comment=makeComment(lamp, action, time))
  job.setall(time)
  job.enable(False)
  cron.write()
  return "OK"

@app.route("/schedule/<actionJob>")
def activate_deactivate(actionJob):
  time = request.args.get("cron")
  action = request.args.get("action")
  lamp = request.args.get("id")
  job = cron.find_comment(makeComment(lamp, action, time))[0]
  if actionJob == "activate" :
    job.enable()
  else :
    job.enable(False)
  cron.write()
  return redirect(url_for("scheduler"))

@app.route("/deschedule")
def deschedule():
  lamp = request.args.get("id")
  action = request.args.get("action")
  time = request.args.get("cron")
  cron.remove_all(comment=makeComment(lamp, action, time))
  cron.write()
  return redirect(url_for("scheduler"))

@app.route("/video")
def video():
  return render_template('video.html')

@app.route("/video/<action>")
def videoStart(action):
  os.system("/home/pi/CamCapt.daemon "+action)
  return redirect(url_for("video"))

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
