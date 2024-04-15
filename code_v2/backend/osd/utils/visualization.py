import numpy as np
import matplotlib.pyplot as plt
import cv2
import torch
import torchvision
from functools import reduce
import math
from PIL import Image
import operator
from osd.structures.feature_map import FeatureMapSize
from osd.structures.bounding_box import cat_boxlist, BoxList
from osd.config import cfg
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import numpy as np
import cv2
from collections import Counter
from skimage.color import rgb2lab, deltaE_cie76
import os



def show_mined_patches(image_id, class_ids, dataloader, hardnegdata):
    # show mined patches
    image_to_show = get_image_from_dataloader(image_id, dataloader)
    # collect data
    boxes_one_image, labels_one_image, scores_one_image, anchor_boxes_one_image, transform_corners_one_image = [], [], [], [], []
    for a in hardnegdata:
        boxes_one_image.append(a["crop_position_xyxy"])
        anchor_boxes_one_image.append(a["anchor_position_xyxy"])
        scores_one_image.append(a["score"])
        labels_one_image.append( a["label_local"] * (-1 if a["role"] == "neg" else 1))
        transform_corners_one_image.append( a["transform_corners"] )
    scores_one_image = torch.tensor(scores_one_image, dtype=torch.float)
    boxes_one_image = cat_boxlist(boxes_one_image)
    anchor_boxes_one_image = cat_boxlist(anchor_boxes_one_image)
    labels_one_image = torch.tensor(labels_one_image, dtype=torch.long)
    transform_corners_one_image = torch.stack(transform_corners_one_image, dim=0)
    # show
    show_annotated_image(img=image_to_show,
                                boxes=boxes_one_image,
                                labels=labels_one_image,
                                scores=scores_one_image,
                                default_boxes=anchor_boxes_one_image,
                                transform_corners=transform_corners_one_image,
                                class_ids=class_ids,
                                score_threshold=cfg.visualization.mining.score_threshold,
                                max_dets=cfg.visualization.mining.max_detections,
                                showfig=True)


def show_class_heatmaps(image_id, class_ids, image_fm_sizes_p, class_targets_pyramid, image_class_scores_pyramid, cfg_local,
                        class_image_augmentation=""):
    if image_id in cfg_local.images_for_heatmaps:
        for cur_im, label_id in zip(cfg_local.images_for_heatmaps, cfg_local.labels_for_heatmaps):
            if cur_im != image_id:
                continue
            i_label = class_ids.index(label_id)
            print("Showing scores for image {0}, class {1} (local {2})".format(image_id, label_id, i_label))

            def show_data(ax, data_pth, shape, vmin, vmax):
                data = data_pth.view(shape).cpu().detach().numpy()
                ax.imshow( data, vmin=vmin, vmax=vmax )

            for i_p in range(len(image_fm_sizes_p)):
                if not class_image_augmentation:
                    num_class_views = 1
                elif class_image_augmentation == "rotation90":
                    num_class_views = 4
                elif class_image_augmentation == "horflip":
                    num_class_views = 2
                else:
                    raise RuntimeError(f"Unknown value of class_image_augmentation: {class_image_augmentation}")

                targets = class_targets_pyramid[i_p][i_label * num_class_views : (i_label + 1) * num_class_views]
                score_map = image_class_scores_pyramid[i_p][i_label * num_class_views : (i_label + 1) * num_class_views]
                shape = (image_fm_sizes_p[i_p].h, image_fm_sizes_p[i_p].w) # height, width

                print(f"map {i_p} size {shape} max s {score_map.max()}")

                fig, axes = plt.subplots(nrows=num_class_views ,ncols=2)

                fig.suptitle(f"Label {label_id}, shape {shape}, level {i_p}, max {score_map.max().item():0.2f}, min {score_map.min().item():0.2f}")

                for i_view in range(num_class_views):
                    axes_target = axes[i_view, 0] if num_class_views > 1 else axes[0]
                    axes_scores = axes[i_view, 1] if num_class_views > 1 else axes[1]
                    show_data(axes_target, targets[i_view], shape, vmin=-1, vmax=1)
                    axes_target.set_title("Targets")
                    show_data(axes_scores, score_map[i_view], shape, vmin=score_map[i_view].min().item(), vmax=score_map[i_view].max().item())
                    axes_scores.set_title(f"Scores: min={score_map[i_view].min().item():0.2f}, max={score_map[i_view].max().item():0.2f}")

        plt.show()


def show_target_remapping(images, class_targets, cls_targets_remapped,
                          losses, class_scores, class_scores_transform_detached,
                          ious_anchor, ious_anchor_corrected):
    num_images = images.size(0)
    num_labels = class_targets.size(1)

    gradients_wrt_scores = torch.autograd.grad(losses["loss"], class_scores, retain_graph=True)[0]
    gradients_wrt_scores_transform_detached = torch.autograd.grad(losses["loss"], class_scores_transform_detached, retain_graph=True)[0]

    for i_image in range(num_images):
        for i_label in range(num_labels):
            targets = class_targets[i_image, i_label]
            targets_remapped = cls_targets_remapped[i_image, i_label]
            scores = class_scores[i_image, i_label]
            loss_per_anchor = losses["class_loss_per_element_detached_cpu"][i_image, i_label]
            grad_per_anchor = gradients_wrt_scores[i_image, i_label]
            grad_per_anchor_transform_detached = gradients_wrt_scores_transform_detached[i_image, i_label]

            ious_corrected_max_gt = ious_anchor_corrected[i_image, i_label]
            ious_max_gt = ious_anchor[i_image, i_label]

            print("Image {0}, Label {1}: score min {2:0.2f}, score max {3:0.2f}, grad min {4}, grad max {5}, grad TD min {6}, grad TD max {7}".format(i_image, i_label, scores.min(), scores.max(), grad_per_anchor.min(), grad_per_anchor.max(), grad_per_anchor_transform_detached.min(), grad_per_anchor_transform_detached.max()))
            shape = (38, 38)

            fig, axes = plt.subplots(ncols=4, nrows=2)
            fig.suptitle("Image {0}, label {1}".format(i_image, i_label))

            def show_data(ax, data_pth, shape, vmin, vmax):
                data = data_pth.view(shape).cpu().detach().numpy()
                ax.imshow( data, vmin=vmin, vmax=vmax )

            show_data(axes[0][0], targets, shape, vmin=-1, vmax=1)
            axes[0][0].set_title("Targets")

            show_data(axes[1][0], targets_remapped, shape, vmin=-1, vmax=1)
            axes[1][0].set_title("Targets remapped")

            show_data(axes[0][1], ious_max_gt, shape, vmin=0, vmax=1)
            axes[0][1].set_title("IoUs of anchors")

            show_data(axes[1][1], ious_corrected_max_gt, shape, vmin=0, vmax=1)
            axes[1][1].set_title("IoUs of remapped anchors")

            show_data(axes[0][2], scores, shape, vmin=scores.min().item(), vmax=scores.max().item())
            axes[0][2].set_title("Scores, min {0:0.2f}, max {1:0.2f}".format(scores.min().item(), scores.max().item()))

            show_data(axes[1][2], loss_per_anchor, shape, vmin=0, vmax=loss_per_anchor.max().item())
            axes[1][2].set_title("Losses, min {0:0.2f}, max {1:0.2f}".format(loss_per_anchor.min().item(), loss_per_anchor.max().item()))

            show_data(axes[0][3], grad_per_anchor, shape, vmin=grad_per_anchor.min().item(), vmax=grad_per_anchor.max().item())
            axes[0][3].set_title("Grads with tr, min {0:0.2f}, max {1:0.2f}".format(grad_per_anchor.min().item(), grad_per_anchor.max().item()))

            show_data(axes[1][3], grad_per_anchor_transform_detached, shape, vmin=grad_per_anchor_transform_detached.min().item(), vmax=grad_per_anchor_transform_detached.max().item())
            axes[1][3].set_title("Grads tr detached, min {0:0.2f}, max {1:0.2f}".format(grad_per_anchor_transform_detached.min().item(), grad_per_anchor_transform_detached.max().item()))
    plt.show()


def decode_scores_show_detections(dataloader, images, class_ids,
                                  class_scores, loc_scores, corners):
    num_images = images.size(0)
    for i_image in range(num_images):
        # show elements with the largest losses
        img_size_pyramid = [FeatureMapSize(img=images[i_image])]
        image_loc_scores_pyramid = [loc_scores[i_image]]
        image_cls_scores_pyramid = [class_scores[i_image]]
        corners_pyramid = [corners[i_image]]

        # decode image predictions
        boxes_one_image = \
            dataloader.box_coder.decode_pyramid(image_loc_scores_pyramid, image_cls_scores_pyramid,
                                                img_size_pyramid, class_ids,
                                                nms_iou_threshold=cfg.eval.nms_iou_threshold, nms_score_threshold=cfg.eval.nms_score_threshold,
                                                transform_corners_pyramid=corners_pyramid)

        show_annotated_image(img=dataloader.unnorm_image(images[i_image]),
                             boxes=boxes_one_image,
                                labels=boxes_one_image.get_field("labels"),
                                scores=boxes_one_image.get_field("scores"),
                                default_boxes=boxes_one_image.get_field("default_boxes"),
                                transform_corners=boxes_one_image.get_field("transform_corners"),
                                class_ids=class_ids,
                                score_threshold=cfg.visualization.train.score_threshold,
                                max_dets=cfg.visualization.train.max_detections,
                                showfig=True)


def show_detection_from_dataloader(boxes, image_id, dataloader, cfg_visualization, class_ids=None):
    print("Showing detections for image {0}, dataset {1}".format(image_id, dataloader.get_name()))
    image_to_show = get_image_from_dataloader(image_id, dataloader)
    show_detections(boxes, image_to_show,
                    cfg_visualization,
                    class_ids=class_ids, image_id=image_id)


def show_detections(boxes, image_to_show,class_image,
                    cfg_visualization,
                    class_ids=None, image_id=None):
    labels = boxes.get_field("labels").clone()
    scores = boxes.get_field("scores").clone()
    #if it is not none
    if class_ids:
        for i_detection in range(labels.size(0)):
            labels[i_detection] = int(class_ids[labels[i_detection]])

    fig = show_annotated_image(img=image_to_show,
                               boxes=boxes,
                               default_boxes=boxes.get_field("default_boxes") if boxes.has_field("default_boxes") else None,
                               transform_corners=boxes.get_field("transform_corners") if boxes.has_field("transform_corners") else None,
                               labels=labels,
                               scores=scores,
                               class_ids=class_ids,
                               
                               class_image = class_image,
                               score_threshold=cfg_visualization.score_threshold,
                               max_dets=cfg_visualization.max_detections,
                               showfig=True,
                               image_id=image_id
                               )
    return fig


def show_gt_boxes(image_id, gt_boxes, class_ids, dataloader, image_to_show=None):
    print("Showing all GT boxes for image {0}, dataset {1}".format(image_id, dataloader.get_name()))
    gt_labels = gt_boxes.get_field("labels")
    score_for_viz = gt_labels.clone()
    difficult_flags = gt_boxes.get_field("difficult").clone()
    score_for_viz[difficult_flags] = -1
    if image_to_show is None:
        image_to_show = get_image_from_dataloader(image_id, dataloader)
    else:
        image_to_show = dataloader.unnorm_image(image_to_show)

    show_annotated_image(img=image_to_show,
                         boxes=gt_boxes,
                         scores=score_for_viz,
                         labels=gt_labels,
                         class_ids=class_ids,
                         score_threshold=float("-inf"),
                         showfig=True)

    return
def get_image_from_dataloader(image_id, dataloader):
    img = dataloader._transform_image(image_id, do_augmentation=False, hflip=False, vflip=False)[0]
    img = dataloader.unnorm_image(img)
    return img


def show_annotated_image(img, boxes, labels, scores, class_ids,class_image, score_threshold=0.0,
                         default_boxes=None, transform_corners=None,
                         max_dets=None, showfig=False, image_id=None):
    good_ids = torch.nonzero(scores.float() > score_threshold).view(-1)#scores which are greater than threshold
    if good_ids.numel() > 0:
        if max_dets is not None:
                _, ids = scores[good_ids].sort(descending=False)
                good_ids = good_ids[ids[-max_dets:]]
        boxes = boxes[good_ids].cpu()
        labels = labels[good_ids].cpu()
        scores = scores[good_ids].cpu()
        label_names = [ "Cl "+ str(l.item()) for l in labels]
        box_colors = ["yellow"] * len(boxes)#ccolor of bounding boxes
    else:
        boxes = BoxList.create_empty(boxes.image_size)
        labels = torch.LongTensor(0)
        scores = torch.FloatTensor(0)
        label_names = []
        box_colors = []

    # create visualizations of default boxes
    if default_boxes is not None:
        default_boxes = default_boxes[good_ids].cpu()

        # append boxes
        boxes = torch.cat([default_boxes.bbox_xyxy, boxes.bbox_xyxy], 0)
        labels = torch.cat([torch.Tensor(len(default_boxes)).to(labels).zero_(), labels], 0)
        scores = torch.cat([torch.Tensor(len(default_boxes)).to(scores).fill_(float("nan")), scores], 0)
        label_names = [""] * len(default_boxes) + label_names
        box_colors = ["cyan"] * len(default_boxes) + box_colors
    else:
        boxes = boxes.bbox_xyxy

    if transform_corners is not None:
        # draw polygons representing the corners of a transformation
        transform_corners = transform_corners[good_ids].cpu()

        #for color comparision
        
        #results = colour_histogram(img=img,in_img = img,cl_img = class_image,boxes = boxes)
        #results = kmeans(img=img,in_img = img,cl_img = class_image,boxes = boxes)
        #results = colorogram(img=img,in_img = img,cl_img = class_image,boxes = boxes)
        #results = colorific(img=img,in_img = img,cl_img = class_image,boxes = boxes)
        #print(max(results))
        #data type of results is list
        #data type of scores is ?
        [fig,final] = vis_image(img,
              showfig=showfig,
              boxes=boxes,
              scores=scores,
              label_names=label_names,
              colors=box_colors,
              image_id=image_id,
              polygons=transform_corners
              )
    print(type(fig))
    #print(fig.size[1])
    #print(fig.size[0])
    #print(fig.shape)

    return [fig,boxes,final]

#description of show_annotated_iage
def vis_image(img, boxes=None, label_names=None, scores=None, colors=None, image_id=None, polygons=None,showfig=False):
    """Visualize a color image.

    Args:
      img: (PIL.Image/tensor) image to visualize
      boxes: (tensor) bounding boxes, sized [#obj, 4], format: x1y1x2y2
      label_names: (list) label names#
      scores: (list) confidence scores
      colors: (list) colors of boxes
      image_id: show this image_id as axes caption
      polygon: (tensor) quadrilateral defining the transformations [#obj, 8]
      showfig: (bool) - flag showing whether to call plt.show() at the end (e.g., stopping the script)

    Reference:
      https://github.com/kuangliu/torchcv/blob/master/torchcv/visualizations/vis_image.py
    """
    # Plot image
    #the probability threshhold that we set to reduce false detections

    c=0
    d=0
    #a = scores.numpy()
    a=np.array(scores)
    b = np.amax(a)#max normalization
    for i in range(len(a)):
        a[i] = a[i]/b
        if(a[i]>0.9):
            c= c+1
    if(c>1):
        d= 0.9
    if(c<=1):
        d=0.85
    #c is count of no. of images with high accuracy>0.95

    fig = plt.figure()
    ax = fig.add_subplot(1, 1, 1)
    if isinstance(img, torch.Tensor):
        img = torchvision.transforms.ToPILImage()(img.cpu())
    ax.imshow(img)
    final=[]
    # Plot boxes
    if boxes is not None:
        for i, bb in enumerate(boxes):
            if a[i]>d:
                final.append([bb[0],bb[1],bb[2],bb[3]])
                xy = (bb[0], bb[1])#bottom left point
                width = bb[2] - bb[0] + 1
                height = bb[3] - bb[1] + 1
                #print(xy,width,height)
                #print(bb)
                #bb[0]
                box_color = 'red' if colors is None else colors[i]
                ax.add_patch(plt.Rectangle(
                    xy, width, height, fill=False, edgecolor=box_color, linewidth=2))

                caption = []
                if label_names is not None:
                    if label_names[i]:
                        try:
                            # if label_names is a pytorch vector
                            n = label_names[i].item()
                        except (KeyboardInterrupt, SystemExit):
                            raise
                        except:
                            # if scores is a list
                            n = label_names[i]

                        caption.append(str(n))

                if scores is not None:
                    try:
                        # if scores is a pytorch vector
                        s = scores[i].item()
                    except (KeyboardInterrupt, SystemExit):
                        raise
                    except:
                        # if scores is a list
                        s = scores[i]
                    if not np.isnan(s):
                        caption.append('{:.4f}'.format(s))

                if len(caption) > 0:
                    ax.text(bb[0], bb[1],
                            ': '.join(caption),
                            style='italic',
                            fontsize=8,
                            bbox={'facecolor': 'white', 'alpha': 0.7, 'pad': 2})
    #what is this plotting of polygon                
    # plot polygons in x1, y1, x2, y2, x3, y3, x4, y4 format
    '''if polygons is not None:
        for i, polygon in enumerate(polygons):
            xy = polygon.numpy()
            xy = xy.reshape((4,2))
            xy = xy[[0,2,3,1], :]
            ax.add_patch(plt.Polygon(
                xy, fill=False, edgecolor='red', linewidth=1))'''

    # Caption with image_id
    if image_id is not None:
        ax.set_title('Image {0}'.format(image_id))

    # turne off axes
    plt.axis('off')#okaythey are plotting in it

    # Show
    #if showfig:
        #plt.show()
    #ax.figure.savefig('/home/pranav/PycharmProjects/vision/os2d-master/1.png')
    #plt.close(fig)
    #image is being plotted here itself
    return [fig,final]

#All color comparision methods 

def colour_histogram(img,in_img,cl_img,boxes):

    #compare croped bounding boxes wiht their colour histograms and change the score accordingly.
    histograms_in=[]
    histograms_cl=[]
    results=[]
    #c = img.crop((int(boxes[0][0].item()),int(boxes[0][1].item()),int(boxes[0][2].item()),int(boxes[0][3].item())))
    #c.show()
    for i in range(boxes.size()[0]):
       
        im1 = in_img[int(boxes[i][1].item()):int(boxes[i][3].item()),int(boxes[i][0].item()):int(boxes[i][2].item())]
        #a = cv2.cvtColor(im1, cv2.COLOR_BGR2RGB)
        hist = cv2.calcHist([im1], [0, 1, 2], None, [8, 8, 8],[0, 256, 0, 256, 0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        histograms_in.append(hist)
    
    c=cv2.calcHist([cl_img], [0, 1, 2], None, [8, 8, 8],[0, 256, 0, 256, 0, 256]) 
    hist = cv2.normalize(c, c).flatten()
    histograms_cl.append(hist)

    for i in range(len(histograms_in)):
        d = cv2.compareHist(histograms_cl[0], histograms_in[i],cv2.HISTCMP_BHATTACHARYYA)
        results.append(d)
    
    print(results)

    return results

def kmeans(img,in_img,cl_img,boxes):

    def RGB2HEX(color):
        return "#{:02x}{:02x}{:02x}".format(int(color[0]), int(color[1]), int(color[2]))

    for i in range(boxes.size()[0]):
       
        im1 = in_img[int(boxes[i][1].item()):int(boxes[i][3].item()),int(boxes[i][0].item()):int(boxes[i][2].item())]
        #image = cv2.cvtColor(im1, cv2.COLOR_BGR2RGB)
        #modified_image = cv2.resize(im1, (600, 400), interpolation = cv2.INTER_AREA)
        modified_image = im1.reshape(im1.shape[0]*im1.shape[1], 3)
        clf = KMeans(n_clusters = 1)
        labels = clf.fit_predict(modified_image)
        counts = Counter(labels)
        center_colors = clf.cluster_centers_
        # We get ordered colors by iterating through the keys
        ordered_colors = [center_colors[i] for i in counts.keys()]
        hex_colors = [RGB2HEX(ordered_colors[i]) for i in counts.keys()]
        rgb1_colors = [ordered_colors[i] for i in counts.keys()]
    print(rgb1_colors)

    image = cv2.cvtColor(cl_img, cv2.COLOR_BGR2RGB)
    modified_image = cv2.resize(image, (600, 400), interpolation = cv2.INTER_AREA)
    modified_image = modified_image.reshape(modified_image.shape[0]*modified_image.shape[1], 3)
    clf = KMeans(n_clusters = 1)
    labels = clf.fit_predict(modified_image)
    counts = Counter(labels)
    center_colors = clf.cluster_centers_
    # We get ordered colors by iterating through the keys
    ordered_colors = [center_colors[i] for i in counts.keys()]
    hex_colors = [RGB2HEX(ordered_colors[i]) for i in counts.keys()]
    rgb2_colors = [ordered_colors[i] for i in counts.keys()]
    dsit = []

    return dsit

def colorogram(img,in_img,cl_img,boxes):
    import colorgram
    results= []
    ans = []
    #d = img.crop((int(boxes[7][0].item()),int(boxes[7][1].item()),int(boxes[7][2].item()),int(boxes[7][3].item())))
    #d.show()
    for i in range(boxes.size()[0]):
        c = img.crop((int(boxes[i][0].item()),int(boxes[i][1].item()),int(boxes[i][2].item()),int(boxes[i][3].item())))
        colors = colorgram.extract(c, 3)

        # colorgram.extract returns Color objects, which let you access
        # RGB, HSL, and what proportion of the image was that color.
        first_color = colors[0]
        rgb = first_color.rgb # e.g. (255, 151, 210)
        #print(rgb[0])
        hsl = first_color.hsl # e.g. (230, 255, 203)
        proportion  = first_color.proportion # e.g. 0.34

        # RGB and HSL are named tuples, so values can be accessed as properties.
        # These all work just as well:
        red = rgb[0]
        red = rgb.r
        saturation = hsl[1]
        saturation = hsl.s
        colors.sort(key=lambda c: c.hsl.h)
        for j in range(3):
            results.append(colors[j].rgb)
        #results.append(colors)
        #print(results)
    #print(len(results))
    import numpy as np
    rgb1 = []
    colors1 = colorgram.extract(cl_img, 3)
    for i in range(3):
        rgb1.append(colors1[i].rgb)
   # print(rgb1)
    i =0    
    while (i<=len(results)-3):
        p1 = np.array([float(results[i][0]),float(results[i][1]),float(results[i][2])])
        p2 = np.array([rgb1[0][0],rgb1[0][1],rgb1[0][2]])
        dist1 = np.sum((p1-p2)**2, axis=0)
        dist1 = np.sqrt(dist1)

        p3 = np.array([float(results[i+1][0]),float(results[i+1][1]),float(results[i+1][2])])
        p4 = np.array([rgb1[1][0],rgb1[1][1],rgb1[1][2]])
        dist2 = np.sum((p3-p4)**2, axis=0)
        dist2 = np.sqrt(dist2)

        p5 = np.array([float(results[i+2][0]),float(results[i+2][1]),float(results[i+2][2])])
        p6 = np.array([rgb1[2][0],rgb1[2][1],rgb1[2][2]])
        dist3 = np.sum((p5-p6)**2, axis=0)
        dist3 = np.sqrt(dist3)
        dist = (dist1+dist3+dist2)/3
        ans.append(dist/441)
        i = i+3

    print(max(ans))
    return ans
# lower the score higher the similarity
def colorific(img,in_img,cl_img,boxes):
    import colorific
    
    in_res = []
    arr = []
    ans = []
    cl_res = []
    each_box=[]

    for i in range(boxes.size()[0]):
            c = img.crop((int(boxes[i][0].item()),int(boxes[i][1].item()),int(boxes[i][2].item()),int(boxes[i][3].item())))
            im1 = c.crop((78,418,105,449))
            palette4 =  colorific.extract_colors(im1, min_prominence=0.1)
            in_res.append(palette4[0][0][0])


    '''        
#Crop a particular section
    k=5
    while (k<16):
        for i in range(boxes.size()[0]):
            c = img.crop((int(boxes[i][0].item()),int(boxes[i][1].item()),int(boxes[i][2].item()),int(boxes[i][3].item())))
            width, height = c.size
            
            for j in range(k):
                im1 = c.crop((0, j*(height/k), width,(j+1)*(height/k)))
                
                palette4 =  colorific.extract_colors(im1, min_prominence=0.1)
               
                arr.append(palette4[0][0][0])
            each_box.append(arr)
            arr =[]
        in_res.append(each_box)
        each_box=[]
        k=k+5'''
    
    #AILE IMAGE AS TARGET iMAGE    
    d = img.crop((int(boxes[6][0].item()),int(boxes[6][1].item()),int(boxes[6][2].item()),int(boxes[6][3].item())))
    width, height = d.size
    im1 = d.crop((78,418,105,449))
    palette1 =  colorific.extract_colors(im1, min_prominence=0.1)
    cl_res.append(palette1[0][0][0])
    
    '''
    alpha=[]
    d = img.crop((int(boxes[6][0].item()),int(boxes[6][1].item()),int(boxes[6][2].item()),int(boxes[6][3].item())))
    width, height = d.size
    i=5
    while (i<16):
        for j in range(i):
            im1 = d.crop((0, j*(height/i), width,(j+1)*(height/i)))
            
            palette4 =  colorific.extract_colors(im1, min_prominence=0.1)
           
            alpha.append(palette4[0][0][0])
        cl_res.append(alpha)
        alpha =[]
        i=i+5
    #print(len(in_res[2][1]))
    #print(cl_res)

    for i in range(len(in_res)):
        for j in range(8):
            for k in range(len(in_res[i][j])):
                p1 = np.array([float(in_res[i][j][k][0]),float(in_res[i][j][k][1]),float(in_res[i][j][k][2])])

                p2 = np.array([cl_res[i][k][0],cl_res[i][k][1],cl_res[i][k][2]])

                dist1 = np.sum((p1-p2)**2, axis=0)
                dist1 = np.sqrt(dist1)
                ans.append(dist1)'''

    for i in range(boxes.size()[0]):
        p1 = np.array([float(in_res[i][0]),float(in_res[i][1]),float(in_res[i][2])])
       
        p2 = np.array([cl_res[0][0],cl_res[0][1],cl_res[0][2]])
      
        dist1 = np.sum((p1-p2)**2, axis=0)
        dist1 = np.sqrt(dist1)
        ans.append(dist1/441)
    #print(ans)

    return in_res
    



    
    

