
# Main server file which contain routes


import pymongo
from pymongo import MongoClient
from pymongo import UpdateOne
from flask import Flask, Response, request, jsonify
from demo_image import get_prediction
from io import BytesIO
import base64
from flask_cors import CORS, cross_origin
import os
import sys
import json
import inspect
import demo_video
currentdir = os.path.dirname(os.path.abspath(
    inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0, parentdir)
app = Flask(__name__)
cors = CORS(app)


# Description
# Takes a directory path and order as an input and finds the subdirectory which are named as items in the order and outputs the images in the selected sub directories
# Note 1 : if order is null list , it retrives all images from the all subdirectories
# Note 2 : Images should be of ".png" format
# Input :
# 1. rootPath : path to a directory Ex : ./home/username/perseptive/images
# 2. order : list of items that comes from frontend which should exactly match to the sub directory names in the "rootPath" to get into detections
# Output :
# returns a list of tuples , where each tuple is in the format (rootPath/chochlate , rootPath/chochlate/dairymilk1.png) or (rootPath/chochlate , rootPath/chochlate/dairymilk2.png)
def listDirectories(rootPath, order):
    dirAndFiles = []
    for file in os.listdir(rootPath):
        d = os.path.join(rootPath, file)
        if os.path.isdir(d) and (file in order or order == []):
            [dirAndFiles.append((d, os.path.join(d, image)))
             for image in os.listdir(d) if image.endswith('.png')]
    return dirAndFiles


# Description :
# Convert the base64 into bytesIO format (you can treat bytesIo as bytes , but both are different)
#Input : string (base64)
#Output : BytesIO
def convertImage64ToFile(base64str):
    image_bytes = base64.b64decode(base64str)
    image = BytesIO(image_bytes)
    return image


# Description :
# Changes the schema of list that is retreived from detected image,
# ie it changes [a,b,c,c,a,d] ->  [ {"item" : a , "count" : 2} , {"item" : b , "count" : 1} , {"item" : c , "count" : 2} ,{"item" : d , "count" : 1} ]
#                  INPUT                                                        OUTPUT
def analysePrediction(listFromImage):
    types = list(set(listFromImage))
    objects = []
    for unq in types:
        count = 0
        for item in listFromImage:
            if(item == unq):
                count += 1
        objects.append({
            "item": unq,
            "count": count
        })
    return objects


# Description : Takes base64 and orders list from an order  and outputs the detected image bas64 and its detecteditems
# uses the above "analysePrediction" function
@app.route("/imagedetect", methods=['GET', 'POST'])
def imagedetection():
    '''Image detecton'''

    # if(request.method == 'GET'):
    #     listFromImage = get_prediction('./1.jpg')
    #     return jsonify(analysePrediction(listFromImage))
    if(request.method == "POST"):
        content = request.json
        inputImageBase64 = content["base64"]
        orders = content["orders"]
        
        orders = listDirectories("./data/demo", orders)

        # converting base64 to image file that is compatible to read_image in demo.py
        inputImage = convertImage64ToFile(inputImageBase64)
        listFromImage, base64OfOutput = get_prediction(inputImage, orders)
        # snans = []
        # for i in base64OfOutput:
        #     snans.append(str(i))
        # Assuming base64OfOutput is a list of bytes objects
        combined_bytes = b''.join(base64OfOutput)

        # Encode the combined bytes object to base64 string
        base64_string = base64.b64encode(combined_bytes).decode('utf-8')

        # Return JSON response with the base64 string
        return jsonify({"summary": analysePrediction(listFromImage), "base64Out": base64_string})

    else:
        return {'error': 'error'}

# Description
# Converts [ {"item" : a , "count" : 2} , {"item" : b , "count" : 1} , {"item" : c , "count" : 2} ,{"item" : d , "count" : 1} ] -> {a : 2 , b: 1 , c:2 , d:1}


def convertArraytoObj(real_obj):
    ret = {}
    for obj in real_obj:
        ret[obj['item']] = obj['count']
    return ret

# Description
# Compare the expected order from frontend and delivered summary from backend
# green indicated items matched with count
# yellow count mismatch but not 0
# red count is 0
# grey is not expected results
# Example
# real_order  = {a : 2 , b:2 , c:2}
# real_detected_summary = {a:2 , b:1 , c:0 ,d :2}
# return { "green" : [{a : [2,2]}] , "yellow" : [{b : [2,1]}]  , "red" :[{c : [2,-1]}] ,"grey" : [{d : [-1 , 2]}]}


def comparsionedSummary(real_order, real_summary):
    '''Compared Summary'''
    order = convertArraytoObj(real_order)
    summary = convertArraytoObj(real_summary)
    orderItems = list(order.keys())
    summaryItems = list(summary.keys())
    detected = []  # green  + yellow
    undetected = []  # red
    error = []  # grey
    green = []
    yellow = []
    red = []
    grey = []
    # undetected
    undetected = list(set(orderItems) - set(summaryItems))
    error = list(set(summaryItems) - set(orderItems))
    detected = (set(orderItems + summaryItems) - set(undetected)) - set(error)
    #Green and Yellow
    for item in detected:
        if(order[item] == summary[item]):  # count is same
            green.append({item: [order[item], summary[item]]})
        else:
            yellow.append({item: [order[item], summary[item]]})
    # Red
    for item in undetected:
        red.append({item: [order[item], -1]})
    # Grey
    for item in error:
        grey.append({item: [-1, summary[item]]})
    res = {
        "green": green,
        "yellow": yellow,
        "red": red,
        "grey": grey
    }
    return res

# Description just return the above discussed comparisionedSummary
@app.route("/compare", methods=['GET', 'POST'])
def compare():
    '''Comparision'''
    if(request.method == "POST"):
        content = request.json
        order = content["order"]
        summary = content["summary"]
        
        return (jsonify(comparsionedSummary(order, summary)))
    else:
        return({"error": "error"})



# Description works same like analysePrediction from above
# but have power to convert even the 1-level nested list like listfromvideo which is of format [listfromImage1, listfromImage2 , ..]
# where listfromImagei is another list
def analysePredictionVideo(listFromVideo):
    detect_dict = {}
    tobesent = []
    for image in listFromVideo:
        for product in image:
            if product not in detect_dict:
                detect_dict[product] = 0
            detect_dict[product] += 1
    # return detect_dict
    for item in detect_dict:
        tobesent.append({"item": item, "count": detect_dict[item]})
    return tobesent



# Description : Takes base64 and orders list from an order  and outputs the detected image bas64 and its detecteditems
# uses the above "analysePredictionVideo" function
@app.route("/videodetect", methods=['GET', 'POST'])
def videodetection():
    '''Video detecton'''

    # if(request.method == 'GET'):
    #     listFromImage = get_prediction('./1.jpg')
    #     return jsonify(analysePrediction(listFromImage))
    if(request.method == "POST"):

        content = request.json
        inputVidBase64 = content["base64"]
        orders = content["orders"]
        

        orders = listDirectories("./data/demo", orders)

        # converting base64 to image file that is compatible to read_image in demo.py
        inputVid = convertImage64ToFile(inputVidBase64)
        with open("video.mp4", 'wb') as out:
            out.write(inputVid.read())

        name = 'video.mp4'
        listFromVideo, base64OfOutput = demo_video.get_prediction(name, orders)
        
        # snans = []
        # for i in base64OfOutput:
        #     snans.append(str(i))

        return jsonify({"summary": analysePredictionVideo(listFromVideo), "base64Out": base64OfOutput})
    else:
        return jsonify({'error': 'error'})


# Description : Testing function for file uplaoding through base64
@app.route("/upload", methods=['POST'])
def upload():
    '''Upload'''
    if(request.method == "POST"):
        print("Connected")
        content = request.json
        encoding64 = content['base64']
        inputFile = convertImage64ToFile(encoding64)
        try:
            with open("file", 'wb') as out:
                out.write(inputFile.read())
            return jsonify({"msg": "done"})
        except:
            print("Upload Failed")
            return jsonify({"msg": "error"})



# from now on the database transactions and updates are implemented.
# the commented mongo db connnection is for connecting to a remote mongo db server.

# establishing connection
# using the database name dass
# cluster = MongoClient("mongodb+srv://snpro:snpro@cluster0.xtpyl.mongodb.net/test?retryWrites=true&w=majority")
# db = cluster['dass']

#dont try to use the same mongo uri. you have to create one.


# connecting to the local mongoDB server on the machine itself. (installed mongo db Server )
# refer mongo documentation for connecting python with mongo DB server
client = MongoClient('mongodb://localhost:27017/')
db = client['perceptive'] # using the database name perceptive .now we use this db cursor for contacting the database.


#Network debugging route.
@app.route('/', methods=['GET'])
@cross_origin()
def welcome():
    print("LOGGED IN...........")
    ans = {"login": "YEAH"}
    return ans


# this route will create a new order (demands clean object of an order, for format refer summaryObject.json in the frontend.)
@app.route('/postNewOrder', methods=['POST'])
@cross_origin()
def neworder():
    data = request.get_json()
    check = db.orders.find_one({"title": data['title']})
    if(check == None):
        try:
            db.orders.insert_one(data)
            return {"success": True}

        except:
            return {"error": Exception}
    else:
        return {"error": "Title already existed"}


# this route will give all orders in a array of dictionaries format.
@app.route('/getAllOrders', methods=['GET'])
@cross_origin()
def allOrders():
    orders = db.orders.find()
    ans = []
    for order in orders:
        order['_id'] = str(order['_id']) # this line of code is written to tranfer the jsonObject. By default mongoDB ID attribute is not json Serizilable.
        ans.append(order)
    
    return jsonify(ans)


# this route will give details of one particular order (all details of order will be here bro, demands title)
@app.route('/getOrderByTitle', methods=['POST'])
@cross_origin()
def getOrderByTitle():
    data = request.get_json()
    title = data['title']
    order = db.orders.find_one({'title': title})
    order['_id'] = str(order['_id'])
    return order


# this route will update order summary information: (demands a order title)
# demands the summary as mentioned in summaryobject.json
@app.route('/updateSummary', methods=['POST'])
@cross_origin()
def updateSummary():
    data = request.get_json()
    title = data['title']
    items = data['items']
    images = data['images']

    query = {"title": title}
    unset_query = {'$unset': {"items": "", "isScanned": "", "images": ""}}
    set_query = {'$set': {"items": items, "isScanned": True, "images": images}}

    try:
        # Unset fields first
        db.orders.update_one(query, unset_query)
        print("unset query executed")
    except Exception as e:
        return {"error": str(e)}

    try:
        # Set new values
        db.orders.update_one(query, set_query)
        print("set query executed")
    except Exception as e:
        return {"error": str(e)}

    return {"success": True}



# deleteOrder and copyOrder are not very trivial.
# they use an another colection called 'count' to keep track of all the indexes of an order copy.

# Eg: let x be an order name. if copied it three times; x,x1,x2,x3 will be created and those will be stored in the count. 
# say we delete x1 then x1 will be remove from count. if user tries to copy any order among {x,x2,x3} the name of the new order will be x1 only :>

#this route is for deleting an order with a bit of logic involved from the count collection.
#demands title.
@app.route('/deleteOrder', methods=['POST'])
@cross_origin()
def deleteOrder():

    data = request.get_json()
    title = data['title']
    num = ""

    while(True):

        lastLetter = title[len(title)-1]
        if('0' <= lastLetter <= '9'):
            num = num + lastLetter
            title = title[:-1]
        else:
            break
    num = num[::-1]

    try:
        count = db.count.find_one({"title": title})
    except:
        return {"error": Exception}

    if(count):
        a = set(count['copyList'])

        if data['title'] in a:
            count['copyList'].remove(data['title'])

            if(len(count['copyList']) == 0):
                db.count.delete_one({'title': title})
            else:
                query = {'title': title}
                updateQuery = {'$set': {"copyList": count['copyList']}}
                db.count.update(query, updateQuery)

    query = {"title": data['title']}

    try:
        db.orders.delete_one(query)

    except:
        return {"error": Exception}

    return {"success": True}


# demands the summary as mentioned in summaryobject.json
@app.route('/copyOrder', methods=['POST'])
@cross_origin()
def f1():

    data = request.get_json()
    title = data['title']


    while(True):
        lastLetter = title[len(title)-1]
        if('0' <= lastLetter <= '9'):
            title = title[:-1]
        else:
            break


    try:
        count = db.count.find_one({"title": title})

    except:
        return {"error": Exception}

    reqTitle = ""
    if(not count):
        temp = {'title': title, 'copyList': [title + "1"]}
        reqTitle = temp['copyList'][0]
        db.count.insert_one(temp)

    else:
        i = 1
        a = set(count['copyList'])
        while(True):
            x = title + str(i)
            if x in a:
                i += 1
                continue
            else:
                count['copyList'].append(x)
                reqTitle = x
                query = {'title': title}
                updateQuery = {'$set': {"copyList": count['copyList']}}
                db.count.update(query, updateQuery)
                break

    query = {"title": data['title']}

    try:
        data1 = db.orders.find_one(query)

    except:
        return {"error": Exception}


    data1['title'] = reqTitle
    data1.pop("_id")
    data1['copyIndex'] = 0
    data1['isScanned'] = False
    data1['images'] = []

    for item in data1['items']:
        item['resQuantity'] = 0
        item['colour'] = 'red'


    try:
        db.orders.insert_one(data1)

        return {"success": True}
    except:
        return {"error": Exception}



if __name__ == "__main__":
    app.run(debug=True)
