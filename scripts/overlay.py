import numpy as np
import cv2
import os
from time import time


#dirPath = '../frameChoice/active/closing/'
dirPath = '../frameChoice/active/thinking/'

#templateImg = cv2.imread("../frameChoice/template/transparent/morning-0.png", -1) # this one has transparency
templateImg = cv2.imread("../frameChoice/template/transparent/morning-0.png", -1) # this one has transparency


h, w, c = templateImg.shape

fileList = os.listdir(dirPath)

for i,fileName in enumerate(fileList):
    print(i,'/',len(fileList))

    img1 = cv2.imread(dirPath + fileName,-1)
    result = np.zeros((h, w, 3), np.uint8)


    alpha = templateImg[:, :, 3] / 255.0
    result[:, :, 0] = (1. - alpha) * img1[:, :, 0] + alpha * templateImg[:, :, 0]
    result[:, :, 1] = (1. - alpha) * img1[:, :, 1] + alpha * templateImg[:, :, 1]
    result[:, :, 2] = (1. - alpha) * img1[:, :, 2] + alpha * templateImg[:, :, 2]



    cv2.imwrite(dirPath+fileName,result)
