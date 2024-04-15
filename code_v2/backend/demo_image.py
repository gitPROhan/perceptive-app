#All necessary imports
import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt
import torch
import torchvision.transforms as transforms
from osd.modeling.model import build_os2d_from_config
from osd.config import cfg
import osd.utils.visualization as visualizer
from osd.structures.feature_map import FeatureMapSize
from osd.utils import setup_logger, read_image, get_image_size_after_resize_preserving_aspect_ratio
import io
import base64

def bounds_returner(cropped):
    
    #initialize mean variable
    mean_r = 0.0
    mean_g = 0.0
    mean_b = 0.0

    #sum of all channels
    for i in range(cropped.shape[0]):
        for j in range(cropped.shape[1]):
            mean_r += cropped[i][j][0]
            mean_g += cropped[i][j][1]
            mean_b += cropped[i][j][2]

    #mean finalization by dividing by number of elements
    mean_r = mean_r/(cropped.shape[0] * cropped.shape[1])
    mean_g = mean_g/(cropped.shape[0] * cropped.shape[1])
    mean_b = mean_b/(cropped.shape[0] * cropped.shape[1])
    
    #standard deviation of 3 channels
    std_r = np.std(cropped[:, :, 0])
    std_g = np.std(cropped[:, :, 1])
    std_b = np.std(cropped[:, :, 2])

    #creation of bounds with difference 2*std
    deviation_factor = 1.0
    std_r *= deviation_factor
    std_g *= deviation_factor
    std_b *= deviation_factor
    lower_bound = np.array([np.floor(mean_r-std_r), np.floor(mean_g-std_g), np.floor(mean_b-std_b)])
    upper_bound = np.array([np.ceil(mean_r+std_r), np.ceil(mean_g+std_g), np.ceil(mean_b+std_b)])

    #hardcoding upper bound of most dominant color to MAX
    if(mean_r > mean_g and mean_r >mean_b):
        upper_bound[0] = 256
    elif(mean_g > mean_b and mean_g > mean_r):
        upper_bound[1] = 256
    elif(mean_b > mean_r and mean_b > mean_g):
        upper_bound[2] = 256

    #clipping negatives
    lower_bound[lower_bound < 0] = 0
    upper_bound[upper_bound < 0] = 0

    #finally returning list with two elements-
    # 1st- lower bound numpy array; 2nd- upper bound numpy array
    return [lower_bound, upper_bound]


def cv2_blackmagic(lower_bound, upper_bound, detections):
    mask_img = []

    for i in range(len(detections)):
        temp = cv2.inRange(detections[i], lower_bound, upper_bound)
        mask_img.append(temp)

    kernel = np.ones((7,7),np.uint8)

    for i in range(len(detections)):
        mask_img[i] = cv2.morphologyEx(mask_img[i], cv2.MORPH_CLOSE, kernel)

    segmented_img = []

    for i in range(len(detections)):
        segmented_img.append(cv2.bitwise_and(detections[i], detections[i], mask=mask_img[i]))

    output = []

    for i in range(len(detections)):
        contours, hierarchy = cv2.findContours(mask_img[i].copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        output.append(cv2.drawContours(segmented_img[i], contours, -1, (0, 0, 0), 3))#color of the contour

    return output

def non_masked_ratio(output):
    non_masked_region_ratio = []
    for i in range(len(output)):
        temp = np.count_nonzero(output[i])
        #print(temp)
        temp_total = output[i].shape[0] * output[i].shape[1] * output[i].shape[2]
        ratio = (100.0*temp)/temp_total
        non_masked_region_ratio.append(ratio)
    return non_masked_region_ratio

#min-max normalization
def normalizer(arr):
  max = np.max(arr)
  min = np.min(arr)
  
  #diff = (max-min)

  norm = np.array([1.0]) if (arr.shape[0] == 1) else (arr)/max
  #norm = (arr-min)/diff
  return norm

logger = setup_logger("OS2D")


# use GPU if have available
cfg.is_cuda = torch.cuda.is_available()

cfg.init.model = "models/os2d_v2-train.pth"
net, box_coder, criterion, img_normalization, optimizer_state = build_os2d_from_config(cfg)
def get_prediction(path):
    colors = ['red', 'yellow', 'lime', 'purple', 'white','olive','orange','cyan','blue','orange','brown','pink','gray']
    #jpg is recommended

    #aisle image
    x = path

    #target(class) image array
    y = ['raw_inputs/t_surf3_1.jpg',
        #"raw_inputs/fogg_g_w.jpg",
        "raw_inputs/fogg_p_w.jpg",
        #"raw_inputs/t b mug1.jpg",
        #"raw_inputs/t caramel.jpg"
        #"raw_inputs/t chings1.jpg",
        #"raw_inputs/t p mug1.jpg"
        ] 

    #manaul input array
    manual= [#"raw_inputs/m g fogg.jpg",
        "raw_inputs/g surf m.jpg",
            "raw_inputs/m p fogg.jpg"
            #"raw_inputs/m b mug1.jpg",
            #"raw_inputs/m caramel.jpg"
            #"raw_inputs/m chings1.jpg",
            #"raw_inputs/m p mug1.jpg"
            ]

    #labels=['Fogg-green','Fogg-purple','DM-Caramel','Pink-mug']
    labels=["Surf-Green",
        'Fogg-Purple']


    #reading inputs
    base64String=[]
    input_image = read_image(x)
    class_images = []
    manual_inputs=[]
    for i in range(len(y)):
        class_images.append(read_image(y[i]))
        manual_inputs.append(read_image(manual[i]))

        
    #we shall none?
    class_ids = [0]

    transform_image = transforms.Compose([transforms.ToTensor(),
                                        transforms.Normalize
                                        (img_normalization["mean"],
                                        img_normalization["std"])])




    #resizing the input(aisle) image(by preservaing aspect ratio)
    h, w = get_image_size_after_resize_preserving_aspect_ratio(h=input_image.size[1],
                                                            w=input_image.size[0],
                                                            target_size=1500)

    input_image = input_image.resize((w, h))

    input_image_th = transform_image(input_image)
    input_image_th = input_image_th.unsqueeze(0)

    if cfg.is_cuda:
        input_image_th = input_image_th.cuda()

        
    #global size of the matplot lib figures    
    figsize = (8, 8)
    fig=plt.figure(figsize=figsize)
    plt.rcParams["figure.figsize"] = figsize



    #resizing target(class) images
    class_images_th = []
    for class_image in class_images:
        h, w = get_image_size_after_resize_preserving_aspect_ratio(h=class_image.size[1],
                                                                w=class_image.size[0],
                                                                target_size=cfg.model.class_image_size) #240
        
        class_image = class_image.resize((w, h))

        class_image_th = transform_image(class_image)
        if cfg.is_cuda:
            class_image_th = class_image_th.cuda()

        class_images_th.append(class_image_th)
    




    name_list = ['product-1']

    os2d_detections=[]

    #main looping for


    for iteration in range(len(class_images)):
        with torch.no_grad():
            loc_prediction_batch, class_prediction_batch, _, fm_size, transform_corners_batch = net(images=input_image_th, class_images=[class_images_th[iteration]])
        
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
        
        # Note that the system outputs the correaltions that lie in the [-1, 1] segment as the detection scores (the higher the better the detection).
        scores = boxes.get_field("scores")
        
        cfg.visualization.eval.max_detections = 10 #manual input,upperbound on detections
        cfg.visualization.eval.score_threshold = float("-inf")#that means everything in scores will be considered?
        output=visualizer.show_detections(boxes, input_image,[class_images[iteration]],cfg.visualization.eval)#this will plot the detections(the code for it is inside files)
        
        
        os2d_detections.append(output[2])
        
    for idx, detections in enumerate(os2d_detections):
        print(f"Number of detections by OS2D for '{labels[idx]}': {len(detections)}")
    #need to try everything in single image    

    img, ax = plt.subplots(figsize = (9,9), dpi = 200)

    for iteration in range(len(class_images)):
        for i, bb in enumerate(os2d_detections[iteration]):
            xy = (bb[0], bb[1])#bottom left point
            width = bb[2] - bb[0] + 1
            height = bb[3] - bb[1] + 1
            box_color = 'red' #if colors is None else colors[i]
            ax.add_patch(plt.Rectangle(xy, width, height, fill=False, edgecolor='red', linewidth=3))
            #edgecolor=colors[iteration]
            #ax.legend(['fogg-red'])
            #ax.annotate("fogg-red", xy)
            t = ax.text(xy[0], xy[1], labels[iteration], fontsize=15,color='white')
            t.set_bbox(dict(facecolor='red', alpha=0.7, edgecolor='red'))

        
    plt.axis('off')    
    plt.imshow(input_image)
    #plt.show()

    #img.savefig('fogg p_w os2d.jpg',  bbox_inches="tight")

    img, ax = plt.subplots(figsize = (9,9), dpi = 200)
    input_image=np.array(input_image)
    #do this for class images also
    threshold=0.8#what threshold is this?

    cropped_detections=[]#global-do we need this?
    temp=[]
    #os2d_detections[iteration] -stores coordinates of detections for each detection for the ith target

    final_detections_count = [] # Step 1

    for iteration in range(len(class_images)):
        
        target_detections=[]#for this particular target image
        for i,bb in enumerate(os2d_detections[iteration]):
            temp.append([int(bb[0]),int(bb[1]),int(bb[2]),int(bb[3])])
            im1 = input_image[int(temp[-1][1]):int(temp[-1][3]),int(temp[-1][0]):int(temp[-1][2])]
            target_detections.append(im1)
            
        cropped_detections.append(target_detections)
        
        cropped = np.array(manual_inputs[iteration])#manual input for this detection
        #or shall we convert it to numpy array initially only?
        #in original file   cropped=np.array(Image.open(manual))
        lower_bound, upper_bound = bounds_returner(cropped=cropped)
        
        #we have to run the next function once for each target
        masked_output=cv2_blackmagic(lower_bound,upper_bound,target_detections)#output
        
        
        non_masked_region_ratio=non_masked_ratio(masked_output)
        normed_ratio=normalizer(np.array(non_masked_region_ratio))
        
        
        indices=[]
        for i in range(normed_ratio.shape[0]):
            if (normed_ratio[i]>=threshold):
                indices.append(i)
        final_detections_count.append(len(indices)) # Step 2: Add the count for this class
        
        #drawing boundices boxes
        for i in range(len(indices)):
            xy = (os2d_detections[iteration][indices[i]][0], os2d_detections[iteration][indices[i]][1])#bottom left point
            width = os2d_detections[iteration][indices[i]][2] - os2d_detections[iteration][indices[i]][0] + 1
            height = os2d_detections[iteration][indices[i]][3] - os2d_detections[iteration][indices[i]][1] + 1
            #print(xy,width,height)
            #print(bb)
            #bb[0]
            #box_color = 'red'
            ax.add_patch(plt.Rectangle(xy, width, height, fill=False, edgecolor='green', linewidth=3))
            #edgecolor=colors[iteration]
            #ax.legend(['fogg-red'])
            #ax.annotate("fogg-red",xy )
            t = ax.text(xy[0], xy[1], labels[iteration], fontsize=15,color='white')
            t.set_bbox(dict(facecolor='green', alpha=0.7, edgecolor='green'))

            
    #os2d_detections[iteration] stores all detections made by os2d but we need only those which are above threshold 
    plt.axis('off')    
    plt.imshow(input_image)
    #plt.show()

    for idx, count in enumerate(final_detections_count):
        print("Number of processed detections for '%s': %d" % (labels[idx], count))
    # img.savefig('RESULTANT_IMAGE.jpg',  bbox_inches="tight") 
    
    list = []

    # Iterate through each label and count pair
    for idx, count in enumerate(final_detections_count):
        # Add the label 'count' times to the result list
        list.extend([labels[idx]] * count)
            
    bas64StringFile = io.BytesIO()
    img.savefig(bas64StringFile, format="png")
    bas64StringFile.seek(0)
    # print("Image")
    base64String.append(base64.b64encode(bas64StringFile.read()).decode('ascii'))
    # print(base64String[0])

    plt.close(fig)
    print("\nItems detected in the Image : ")
    for item in list:
        print(item, end=" ")
    print()
    return list, base64String

