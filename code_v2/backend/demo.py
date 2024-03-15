import os
import argparse
import numpy as np
import cv2
from PIL import Image
import skvideo.io 
import matplotlib.pyplot as plt
import subprocess as sp
import torch
import torchvision.transforms as transforms
from osd.modeling.model import build_os2d_from_config
from osd.config import cfg
import osd.utils.visualization as visualizer
from osd.structures.feature_map import FeatureMapSize
from osd.utils import setup_logger, read_image, get_image_size_after_resize_preserving_aspect_ratio,read_cv2

logger = setup_logger("OS2D")

cfg.is_cuda = torch.cuda.is_available()

cfg.init.model = "models/os2d_v2-train.pth"
net, box_coder, criterion, img_normalization, optimizer_state = build_os2d_from_config(cfg)


#to run color comparison method
#in_img = read_cv2("data/demo/1.jpg")
#cl_img =  read_cv2("data/demo/2.png")	
class_images = [read_image("orange.jpeg")]
class_ids = [0]

#to run object detection on a video

#cap= cv2.VideoCapture('/home/pranav/Downloads/store.mp4')
#output_file = 'output_file_name.mp4'


#writer = skvideo.io.FFmpegWriter("outputvideo.mp4")

#i=0

#while(cap.isOpened()):
	#ret, frame = cap.read()
	

	#if ret== True:
		#cv2.imwrite('k'+'.jpg',frame)

		#if(i%30==0):
input_image = read_image('1.jpeg')
transform_image = transforms.Compose([
                      transforms.ToTensor(),
                      transforms.Normalize(img_normalization["mean"], img_normalization["std"])
                      ])

h, w = get_image_size_after_resize_preserving_aspect_ratio(h=input_image.size[1],
                                                               w=input_image.size[0],
                                                               target_size=1500)
input_image = input_image.resize((w, h))

input_image_th = transform_image(input_image)
input_image_th = input_image_th.unsqueeze(0)
if cfg.is_cuda:
    input_image_th = input_image_th.cuda()

class_images_th = []
for class_image in class_images:
    h, w = get_image_size_after_resize_preserving_aspect_ratio(h=class_image.size[1],
                                                               w=class_image.size[0],
                                                               target_size=cfg.model.class_image_size)
    class_image = class_image.resize((w, h))

    class_image_th = transform_image(class_image)
    if cfg.is_cuda:
        class_image_th = class_image_th.cuda()

    class_images_th.append(class_image_th)

with torch.no_grad():
    loc_prediction_batch, class_prediction_batch, _, fm_size, transform_corners_batch = net(images=input_image_th,
                                                                                            class_images=class_images_th)

image_loc_scores_pyramid = [loc_prediction_batch[0]]
image_class_scores_pyramid = [class_prediction_batch[0]]
img_size_pyramid = [FeatureMapSize(img=input_image_th)]
transform_corners_pyramid = [transform_corners_batch[0]]

'''
#code to merge multiple target images as one class 
#my new code
f = []
r = []
t= 0
for j in range(4):
	c=[]
	q = list(image_loc_scores_pyramid[0][0][0].size())[0]
	for k in range(q):
		#q = list(image_loc_scores_pyramid[0][i][j].size())[0]
		for i in class_ids:
			t = t+image_loc_scores_pyramid[0][i][j][k].item()

		c.append( t/len(class_ids))
		t=0
	f.append(c)
r.append(f)
device = torch.device("cuda" if torch.cuda.is_available() else "cuda:0")
w = torch.tensor(r,device=device)
e =[]
e.append(w)

image_loc_scores_pyramid=e
a= []
s =0
b = list(image_class_scores_pyramid[0][0].size())[0]
for j in  range(b):
	#b = list(image_class_scores_pyramid[0][i].size())[0]
	for i in class_ids:
		s= s+ image_class_scores_pyramid[0][i][j].item()
	a.append(s/len(class_ids))
	s=0
device = torch.device("cuda" if torch.cuda.is_available() else "cuda:0")
a = torch.tensor(a,device=device)
x =[]
x.append(a)
image_class_scores_pyramid=x


class_ids = [0]'''
boxes = box_coder.decode_pyramid(image_loc_scores_pyramid, image_class_scores_pyramid,
                                           img_size_pyramid, class_ids,
                                           nms_iou_threshold=cfg.eval.nms_iou_threshold,
                                           nms_score_threshold=cfg.eval.nms_score_threshold,
                                           transform_corners_pyramid=transform_corners_pyramid)

# remove some fields to lighten visualization
boxes.remove_field("default_boxes")
#print(boxes)
#figsize = (8, 8)
#fig=plt.figure(figsize=figsize)
#columns = len(class_images)
'''for i, class_image in enumerate(class_images):
    fig.add_subplot(1, columns, i + 1)
    plt.imshow(class_image)
    plt.axis('off')'''

#plt.rcParams["figure.figsize"] = figsize

cfg.visualization.eval.max_detections = 8
cfg.visualization.eval.score_threshold = float("-inf")
fig,dash = visualizer.show_detections(boxes, input_image,class_images[0],
                           cfg.visualization.eval)
			
fig.savefig( str(0) +'.png')
plt.close(fig)

#uncomment it while running code on a video

#img = cv2.imread('/home/pranav/PycharmProjects/vision/os2d-master/1.png')
#img = cv2.cvtColor(img,cv2.COLOR_RGB2BGR)
#proc.stdin.write(img.tostring())

#cv2.imshow('image',img)


#if cv2.waitKey(1) & 0xFF == ord('q'):
	
	#break	
#else:
	#break

#i=i+1

#cap.release()
#proc.stdin.close()
#proc.stderr.close()
#proc.wait()
#cv2.destroyAllWindows()
