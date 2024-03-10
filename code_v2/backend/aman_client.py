import requests
import base64
from io import BytesIO
import json


def convertImage64ToFile(base64str):
    image_bytes = base64.b64decode(base64str)
    image = BytesIO(image_bytes)
    return image

def writethis(image):
    with open("compare.png",'wb') as out:
        out.write(image.read())

with open("./naidu.jpeg", "rb") as img:
    img_string = base64.b64encode(img.read())
# #print(string)
with open("./video.mp4", "rb") as vid:
    vid_string = base64.b64encode(vid.read())

resp = requests.post('http://localhost:5000/imagedetect',
                     json={'base64': img_string.decode(), 'orders': []})

print(resp.json()['summary'])
base64Out = resp.json()['base64Out']
writethis(convertImage64ToFile(base64Out[0]))


yes = 0
while(1):
    yes = input("continue to test Video : y/n")
    if(yes == 'y'):
        break
    else:
        quit()

resp = requests.post('http://localhost:5000/videodetect', json={
                     'base64': vid_string, 'orders': ['choclate.jpeg', 'darkwaffy.jpeg', 'pink.jpeg']})

print(len(resp.json()['base64Out']))
