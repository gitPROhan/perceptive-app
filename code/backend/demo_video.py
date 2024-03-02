
# Inputs
# Refer to the app.py file to get the datatypes of the arguments

# Output
# 1. array of base64 of detected_images
# 2. Outputs the array of items identified in detected_image ex : [[choclate , choclate , waffy, waffy ,choclate ,waffy ,oreo... ],[.....],[......],[.....] ]


#import settings
import io
import base64
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
from osd.utils import setup_logger, read_image, get_image_size_after_resize_preserving_aspect_ratio, read_cv2

logger = setup_logger("OS2D")

cfg.is_cuda = torch.cuda.is_available()

cfg.init.model = "models/os2d_v2-train.pth"
net, box_coder, criterion, img_normalization, optimizer_state = build_os2d_from_config(
    cfg)

#class_images = settings.class_images
#names = settings.names


def get_prediction(name, list_of_tuples_for_detections_from_class_images):
    base64String = []
    class_images = []
    class_ids = []
    for fileDir, filePath in list_of_tuples_for_detections_from_class_images:
        class_images.append(read_image(filePath))
    class_ids = []
    for i in range(len(class_images)):
        class_ids.append(i)

    cap = cv2.VideoCapture(name)
    # cap = cv2.VideoCapture(url)
    path = "outputvideo.mp4"
    multi_list = []

    i = 0

    while(cap.isOpened()):
        ret, frame = cap.read()

        if ret == True:
            cv2.imwrite('input/' + str(i)+'.jpg', frame)
            if i % 30 == 0:
                input_image = read_image('input/' + str(i)+'.jpg')
                transform_image = transforms.Compose([
                    transforms.ToTensor(),
                    transforms.Normalize(
                        img_normalization["mean"], img_normalization["std"])
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

                boxes = box_coder.decode_pyramid(image_loc_scores_pyramid, image_class_scores_pyramid,
                                                 img_size_pyramid, class_ids,
                                                 nms_iou_threshold=cfg.eval.nms_iou_threshold,
                                                 nms_score_threshold=cfg.eval.nms_score_threshold,
                                                 transform_corners_pyramid=transform_corners_pyramid)

                # remove some fields to lighten visualization
                boxes.remove_field("default_boxes")

                cfg.visualization.eval.max_detections = 8
                cfg.visualization.eval.score_threshold = float("-inf")
                fig, list = visualizer.show_detections(boxes, input_image, class_images,
                                                       cfg.visualization.eval, image_names=list_of_tuples_for_detections_from_class_images)

                # uncomment it if you want to see the figure detected and make sure you have "pred" folder
                #fig.savefig('./pred/' + str(i) + '.png')

                bas64StringFile = io.BytesIO()
                fig.savefig(bas64StringFile, format="png")
                bas64StringFile.seek(0)

                base64String.append(base64.b64encode(bas64StringFile.read()).encode("ascii"))

                plt.close(fig)
                multi_list.append(list)
    # uncomment it while running code on a video

                # img = cv2.imread('1.jpg')
                # img = cv2.cvtColor(img,cv2.COLOR_RGB2BGR)
                # proc.stdin.write(img.tostring())
            i = i+1
            # cv2.imshow('image',img)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        else:
            break

    cap.release()
    cv2.destroyAllWindows()
    return multi_list, base64String
